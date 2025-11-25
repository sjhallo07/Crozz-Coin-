<#!
.SYNOPSIS
    Provision or configure IBM Cloud compute targets (VSI, Code Engine, IKS, GitHub Actions helpers) for the Crozz stack.
.DESCRIPTION
    This orchestrator logs into IBM Cloud, ensures the container registry namespace exists, and then executes each
    target flow in the recommended order: Virtual Server Instance (builder), Code Engine applications, IBM Kubernetes
    Service cluster, and optional GitHub Actions secret/bootstrap tasks. Run with -Apply to execute commands; without
    it the script prints the ordered steps (dry-run).
.EXAMPLE
    # Preview all steps without making changes
    pwsh ./scripts/setup-cloud-runtime.ps1 -Targets CodeEngine

    # Execute the VSI + Code Engine flows with your API key pulled from env vars
    pwsh ./scripts/setup-cloud-runtime.ps1 -Targets VSI,CodeEngine -Apply

    # Run everything with explicit overrides
    pwsh ./scripts/setup-cloud-runtime.ps1 -Targets All -Region eu-de -ResourceGroup Crozz -RegistryNamespace crozz-prod -Apply
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string[]]$Targets = @("All"),

    [string]$ApiKey = $env:IBM_CLOUD_API_KEY,
    [string]$Region = "us-south",
    [string]$ResourceGroup = "Default",
    [string]$RegistryNamespace = "crozz-coin",

    # VSI defaults
    [string]$VpcName = "crozz-vpc",
    [string]$SubnetName = "crozz-subnet",
    [string]$SubnetZone = "us-south-1",
    [string]$SubnetCidr = "10.80.0.0/24",
    [string]$SecurityGroupName = "crozz-sg",
    [int[]]$SecurityGroupPorts = @(22, 4000, 5173),
    [string]$SshKeyName = "crozz-key",
    [string]$SshPublicKeyPath = "$HOME/.ssh/id_rsa.pub",
    [string]$VsiProfile = "bx2-8x32",
    [string]$VsiImageName = "ibm-ubuntu-22-04-3-minimal-amd64-2",
    [string]$VsiName = "crozz-builder",

    # Code Engine defaults
    [string]$CodeEngineProject = "crozz-coin",
    [string]$CodeEngineRegistrySecret = "crozz-registry",
    [string]$BackendAppName = "crozz-backend",
    [string]$FrontendAppName = "crozz-frontend",
    [string]$BackendImage = "us.icr.io/crozz-coin/crozz-backend:latest",
    [string]$FrontendImage = "us.icr.io/crozz-coin/crozz-frontend:latest",
    [string]$BackendEnvSecret = "crozz-backend-env",
    [string]$FrontendEnvSecret = "crozz-frontend-env",
    [string]$DatabaseSecret = "crozz-db-credentials",
    [string]$MigrationJobName = "crozz-db-migrate",

    # IKS defaults
    [string]$IksClusterName = "crozz-iks",
    [string]$IksWorkerFlavor = "bx2.8x32",
    [int]$IksWorkerCount = 3,
    [string]$IksZone = "us-south-1",
    [string]$KubeNamespace = "crozz",
    [string]$KustomizePath = "k8s/base",

    # GitHub Actions helper
    [string]$GitHubRepo = "sjhallo07/Crozz-Coin-",
    [string[]]$GitHubSecrets = @("IBM_CLOUD_API_KEY", "ICR_NAMESPACE", "VITE_CROZZ_API_BASE_URL", "DATABASE_URL"),

    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$validTargets = @("VSI", "CodeEngine", "IKS", "GitHubActions", "All")
$expandedTargets = @()
foreach ($entry in $Targets) {
    if (-not $entry) { continue }
    $expandedTargets += ($entry -split ",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}
if (-not $expandedTargets) { $expandedTargets = @("All") }

$invalidTargets = $expandedTargets | Where-Object { $_ -notin $validTargets }
if ($invalidTargets) {
    throw "Invalid target(s): $($invalidTargets -join ', '). Valid options: $($validTargets -join ', ')"
}

$orderedTargets = @("VSI", "CodeEngine", "IKS", "GitHubActions")
if ($expandedTargets -contains "All") {
    $Targets = $orderedTargets
}
else {
    $Targets = $orderedTargets | Where-Object { $expandedTargets -contains $_ }
}

$script:ExecuteChanges = [bool]$Apply

function Require-Tool {
    param(
        [Parameter(Mandatory)] [string]$Name,
        [string]$InstallHint
    )
    if (-not (Get-Command -Name $Name -ErrorAction SilentlyContinue)) {
        $message = "Missing required executable '$Name'"
        if ($InstallHint) { $message += " ($InstallHint)" }
        throw $message
    }
}

function Write-Section {
    param([string]$Text)
    Write-Host "`n=== $Text ===" -ForegroundColor Magenta
}

function Invoke-Step {
    param(
        [string]$Description,
        [string]$Executable,
        [string[]]$Arguments,
        [string[]]$DisplayArguments,
        [switch]$CaptureOutput,
        [switch]$IgnoreErrors
    )

    Write-Host "" -NoNewline
    Write-Host "→ $Description" -ForegroundColor Cyan
    $display = if ($DisplayArguments) { $DisplayArguments } else { $Arguments }
    Write-Host "    $Executable $($display -join ' ')" -ForegroundColor DarkGray

    if (-not $script:ExecuteChanges) {
        return $null
    }

    $output = & $Executable @Arguments 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0 -and -not $IgnoreErrors) {
        throw "Command failed ($Executable): $output"
    }

    if ($CaptureOutput) { return $output }

    if ($output) {
        Write-Host $output -ForegroundColor DarkGray
    }

    return $null
}

function Ensure-IbmPlugin {
    param(
        [string]$Name,
        [string]$Description
    )

    $check = & ibmcloud plugin show $Name 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Plugin '$Name' available." -ForegroundColor Green
        return
    }

    if (-not $script:ExecuteChanges) {
        Write-Warning "Plugin '$Name' missing (required for $Description). Install with 'ibmcloud plugin install $Name'."
        return
    }

    Invoke-Step -Description "Install IBM Cloud plugin $Name" -Executable "ibmcloud" -Arguments @("plugin", "install", $Name, "-f")
}

function Get-IbmJson {
    param(
        [string]$Description,
        [string[]]$CommandArgs
    )

    if (-not $script:ExecuteChanges) { return $null }

    $raw = Invoke-Step -Description $Description -Executable "ibmcloud" -Arguments $CommandArgs -CaptureOutput
    if (-not $raw) { return $null }

    try {
        return $raw | ConvertFrom-Json
    }
    catch {
        Write-Warning "Unable to parse JSON output for '$Description'."
        return $null
    }
}

function Ensure-RegistryNamespace {
    param([string]$Namespace)

    Write-Section "Container Registry"
    if (-not $script:ExecuteChanges) {
        Write-Host "Dry-run: would ensure container registry namespace '$Namespace' exists." -ForegroundColor Yellow
        return
    }

    $namespacesRaw = Invoke-Step -Description "Listing registry namespaces" -Executable "ibmcloud" -Arguments @("cr", "namespaces") -CaptureOutput
    $namespaces = @()
    if ($namespacesRaw) {
        $namespaces = $namespacesRaw -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    }

    if ($namespaces -contains $Namespace) {
        Write-Host "Namespace '$Namespace' already exists." -ForegroundColor Green
    }
    else {
        Invoke-Step -Description "Creating registry namespace $Namespace" -Executable "ibmcloud" -Arguments @("cr", "namespace-add", $Namespace)
    }
}

function Resolve-ImageId {
    param([string]$ImageName)
    $images = Get-IbmJson -Description "List images" -CommandArgs @("is", "images", "--output", "json")
    if (-not $images) { return $null }
    $match = $images | Where-Object { $_.name -eq $ImageName -or $_.id -eq $ImageName }
    return $match[0].id
}

function Ensure-VsiResources {
    param(
        [string]$VpcName,
        [string]$SubnetName,
        [string]$SubnetZone,
        [string]$SubnetCidr,
        [string]$SecurityGroupName,
        [int[]]$SecurityGroupPorts,
        [string]$SshKeyName,
        [string]$SshPublicKeyPath,
        [string]$VsiProfile,
        [string]$VsiImageName,
        [string]$VsiName
    )

    Write-Section "Virtual Server Instance"

    if (-not $script:ExecuteChanges) {
        Write-Host "Dry-run: would provision VPC '$VpcName', subnet '$SubnetName', security group '$SecurityGroupName', SSH key '$SshKeyName', and VSI '$VsiName'." -ForegroundColor Yellow
        return
    }

    $vpcs = Get-IbmJson -Description "List VPCs" -CommandArgs @("is", "vpcs", "--output", "json")
    $vpc = $vpcs | Where-Object { $_.name -eq $VpcName } | Select-Object -First 1
    if (-not $vpc) {
        Invoke-Step -Description "Create VPC $VpcName" -Executable "ibmcloud" -Arguments @("is", "vpc-create", $VpcName)
        $vpcs = Get-IbmJson -Description "List VPCs" -CommandArgs @("is", "vpcs", "--output", "json")
        $vpc = $vpcs | Where-Object { $_.name -eq $VpcName } | Select-Object -First 1
    }
    $vpcId = $vpc.id

    $subnets = Get-IbmJson -Description "List subnets" -CommandArgs @("is", "subnets", "--output", "json")
    $subnet = $subnets | Where-Object { $_.name -eq $SubnetName }
    if (-not $subnet) {
        Invoke-Step -Description "Create subnet $SubnetName" -Executable "ibmcloud" -Arguments @("is", "subnet-create", $SubnetName, $SubnetZone, "--vpc", $vpcId, "--ipv4-cidr-block", $SubnetCidr)
        $subnets = Get-IbmJson -Description "List subnets" -CommandArgs @("is", "subnets", "--output", "json")
        $subnet = $subnets | Where-Object { $_.name -eq $SubnetName }
    }
    $subnetId = $subnet.id

    $securityGroups = Get-IbmJson -Description "List security groups" -CommandArgs @("is", "security-groups", "--vpc", $vpcId, "--output", "json")
    $sg = $securityGroups | Where-Object { $_.name -eq $SecurityGroupName }
    if (-not $sg) {
        Invoke-Step -Description "Create security group $SecurityGroupName" -Executable "ibmcloud" -Arguments @("is", "security-group-create", $SecurityGroupName, $vpcId)
        $securityGroups = Get-IbmJson -Description "List security groups" -CommandArgs @("is", "security-groups", "--vpc", $vpcId, "--output", "json")
        $sg = $securityGroups | Where-Object { $_.name -eq $SecurityGroupName }
    }
    $sgId = $sg.id

    $existingRules = Get-IbmJson -Description "List SG rules" -CommandArgs @("is", "security-group-rules", "--security-group", $sgId, "--output", "json")
    foreach ($port in $SecurityGroupPorts) {
        $rule = $existingRules | Where-Object { $_.port_min -eq $port -and $_.port_max -eq $port }
        if (-not $rule) {
            Invoke-Step -Description "Add inbound TCP port $port" -Executable "ibmcloud" -Arguments @("is", "security-group-rule-add", $sgId, "inbound", "tcp", "--port-min", $port, "--port-max", $port, "--remote", "0.0.0.0/0")
        }
    }

    $keys = Get-IbmJson -Description "List SSH keys" -CommandArgs @("is", "keys", "--output", "json")
    $sshKey = $keys | Where-Object { $_.name -eq $SshKeyName }
    if (-not $sshKey) {
        if (-not (Test-Path -Path $SshPublicKeyPath)) {
            throw "SSH public key not found at $SshPublicKeyPath"
        }
        Invoke-Step -Description "Upload SSH key $SshKeyName" -Executable "ibmcloud" -Arguments @("is", "key-create", $SshKeyName, "@" + (Resolve-Path $SshPublicKeyPath))
        $keys = Get-IbmJson -Description "List SSH keys" -CommandArgs @("is", "keys", "--output", "json")
        $sshKey = $keys | Where-Object { $_.name -eq $SshKeyName }
    }
    $sshKeyId = $sshKey.id

    $imageId = Resolve-ImageId -ImageName $VsiImageName
    if (-not $imageId) {
        throw "Unable to resolve image '$VsiImageName'. Use an image ID from 'ibmcloud is images'."
    }

    $instances = Get-IbmJson -Description "List VSIs" -CommandArgs @("is", "instances", "--output", "json")
    $instance = $instances | Where-Object { $_.name -eq $VsiName }
    if ($instance) {
        Write-Host "VSI '$VsiName' already exists." -ForegroundColor Green
    }
    else {
        Invoke-Step -Description "Create VSI $VsiName" -Executable "ibmcloud" -Arguments @("is", "instance-create", $VsiName, $vpcId, $SubnetZone, $VsiProfile, $subnetId, "--image", $imageId, "--keys", $sshKeyId, "--security-groups", $sgId)
    }
}

function Ensure-CodeEngineResources {
    param(
        [string]$Project,
        [string]$RegistrySecret,
        [string]$BackendApp,
        [string]$FrontendApp,
        [string]$BackendImage,
        [string]$FrontendImage,
        [string]$BackendEnvSecret,
        [string]$FrontendEnvSecret,
        [string]$DatabaseSecret,
        [string]$MigrationJob
    )

    Write-Section "IBM Cloud Code Engine"
    if (-not $script:ExecuteChanges) {
        Write-Host "Dry-run: would ensure Code Engine project '$Project', registry secret '$RegistrySecret', env secrets, migration job '$MigrationJob', and apps '$BackendApp'/'$FrontendApp'." -ForegroundColor Yellow
        return
    }

    $projectSelected = $false
    $selectOutput = & ibmcloud ce project select --name $Project 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create Code Engine project $Project" -Executable "ibmcloud" -Arguments @("ce", "project", "create", "--name", $Project)
        $selectOutput = & ibmcloud ce project select --name $Project 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Unable to select Code Engine project '$Project': $selectOutput" }
    }
    else {
        Write-Host "Selected existing Code Engine project '$Project'." -ForegroundColor Green
    }

    $registryCheck = & ibmcloud ce registry get --name $RegistrySecret 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create registry secret $RegistrySecret" -Executable "ibmcloud" -Arguments @("ce", "registry", "create", "--name", $RegistrySecret, "--server", "us.icr.io", "--username", "iamapikey", "--password", $ApiKey)
    }
    else {
        Write-Host "Registry secret '$RegistrySecret' already exists." -ForegroundColor Green
    }

    foreach ($secretName in @($BackendEnvSecret, $FrontendEnvSecret, $DatabaseSecret)) {
        if (-not $secretName) { continue }
        $secretCheck = & ibmcloud ce secret get --name $secretName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Secret '$secretName' not found; create it using 'ibmcloud ce secret create ...' with your env files." -ForegroundColor Yellow
        }
        else {
            Write-Host "Secret '$secretName' exists." -ForegroundColor Green
        }
    }

    $jobCheck = & ibmcloud ce job get --name $MigrationJob 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create migration job $MigrationJob" -Executable "ibmcloud" -Arguments @("ce", "job", "create", "--name", $MigrationJob, "--image", $BackendImage, "--registry-secret", $RegistrySecret, "--env-from-secret", $BackendEnvSecret, "--env-from-secret", $DatabaseSecret, "--command", "npm", "--args", "run", "migrate")
    }
    else {
        Invoke-Step -Description "Update migration job image" -Executable "ibmcloud" -Arguments @("ce", "job", "update", $MigrationJob, "--image", $BackendImage)
    }

    $backendCheck = & ibmcloud ce app get --name $BackendApp 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create backend app" -Executable "ibmcloud" -Arguments @("ce", "app", "create", $BackendApp, "--image", $BackendImage, "--registry-secret", $RegistrySecret, "--port", "4000", "--cpu", "1", "--memory", "2G", "--env-from-secret", $BackendEnvSecret, "--env-from-secret", $DatabaseSecret, "--min-scale", "1", "--max-scale", "5", "--ingress", "--visibility", "public")
    }
    else {
        Invoke-Step -Description "Update backend app image" -Executable "ibmcloud" -Arguments @("ce", "app", "update", $BackendApp, "--image", $BackendImage)
    }

    $frontendCheck = & ibmcloud ce app get --name $FrontendApp 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create frontend app" -Executable "ibmcloud" -Arguments @("ce", "app", "create", $FrontendApp, "--image", $FrontendImage, "--registry-secret", $RegistrySecret, "--port", "4173", "--cpu", "0.5", "--memory", "1G", "--env-from-secret", $FrontendEnvSecret, "--min-scale", "1", "--max-scale", "3", "--ingress", "--visibility", "public")
    }
    else {
        Invoke-Step -Description "Update frontend app image" -Executable "ibmcloud" -Arguments @("ce", "app", "update", $FrontendApp, "--image", $FrontendImage)
    }
}

function Ensure-IksResources {
    param(
        [string]$ClusterName,
        [string]$WorkerFlavor,
        [int]$WorkerCount,
        [string]$Zone,
        [string]$Namespace,
        [string]$ManifestPath
    )

    Write-Section "IBM Cloud Kubernetes Service"
    if (-not $script:ExecuteChanges) {
        Write-Host "Dry-run: would ensure IKS cluster '$ClusterName' with $WorkerCount x $WorkerFlavor in $Zone and apply manifests from '$ManifestPath'." -ForegroundColor Yellow
        return
    }

    $clusterInfo = & ibmcloud ks cluster get --cluster $ClusterName --output json 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create IKS cluster $ClusterName" -Executable "ibmcloud" -Arguments @("ks", "cluster", "create", "vpc-classic", "--name", $ClusterName, "--zone", $Zone, "--flavor", $WorkerFlavor, "--workers", $WorkerCount)
        $clusterInfo = & ibmcloud ks cluster get --cluster $ClusterName --output json 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Unable to fetch cluster details for $ClusterName" }
    }
    else {
        Write-Host "Cluster '$ClusterName' already exists." -ForegroundColor Green
    }

    Invoke-Step -Description "Download kubeconfig" -Executable "ibmcloud" -Arguments @("ks", "cluster", "config", "--cluster", $ClusterName, "--admin")

    Require-Tool -Name "kubectl" -InstallHint "Install via https://kubernetes.io/docs/tasks/tools/"

    $nsExists = & kubectl get namespace $Namespace 2>&1
    if ($LASTEXITCODE -ne 0) {
        Invoke-Step -Description "Create namespace $Namespace" -Executable "kubectl" -Arguments @("create", "namespace", $Namespace)
    }

    if (Test-Path -Path $ManifestPath) {
        Invoke-Step -Description "Apply manifests" -Executable "kubectl" -Arguments @("apply", "-k", $ManifestPath)
    }
    else {
        Write-Warning "Manifest path '$ManifestPath' not found; skipping kubectl apply."
    }
}

function Configure-GitHubActions {
    param(
        [string]$Repository,
        [string[]]$Secrets
    )

    Write-Section "GitHub Actions"
    if (-not $script:ExecuteChanges) {
        Write-Host "Dry-run: would configure secrets $($Secrets -join ', ') for repo $Repository using gh CLI." -ForegroundColor Yellow
        return
    }

    Require-Tool -Name "gh" -InstallHint "Install GitHub CLI"

    foreach ($secret in $Secrets) {
        $value = Read-Host -Prompt "Enter value for $secret (leave blank to skip)"
        if (-not $value) {
            Write-Host "Skipping secret $secret." -ForegroundColor Yellow
            continue
        }
        Invoke-Step -Description "Set GitHub secret $secret" -Executable "gh" -Arguments @("secret", "set", $secret, "--body", $value, "--repo", $Repository) -DisplayArguments @("secret", "set", $secret, "--body", "***", "--repo", $Repository)
    }
}

Write-Section "Prerequisites"
Require-Tool -Name "ibmcloud" -InstallHint "https://cloud.ibm.com/docs/cli"
if (-not $ApiKey) {
    throw "IBM Cloud API key missing. Provide via -ApiKey or IBM_CLOUD_API_KEY environment variable."
}

Invoke-Step -Description "Login to IBM Cloud" -Executable "ibmcloud" -Arguments @("login", "--apikey", $ApiKey, "--no-region") -DisplayArguments @("login", "--apikey", "***", "--no-region")
Invoke-Step -Description "Target region/resource group" -Executable "ibmcloud" -Arguments @("target", "-r", $Region, "-g", $ResourceGroup)
Invoke-Step -Description "Set container registry region" -Executable "ibmcloud" -Arguments @("cr", "region-set", $Region)

Ensure-RegistryNamespace -Namespace $RegistryNamespace

if ($Targets -contains "VSI") {
    Ensure-IbmPlugin -Name "vpc-infrastructure" -Description "VPC and VSI provisioning"
    Ensure-VsiResources -VpcName $VpcName -SubnetName $SubnetName -SubnetZone $SubnetZone -SubnetCidr $SubnetCidr -SecurityGroupName $SecurityGroupName -SecurityGroupPorts $SecurityGroupPorts -SshKeyName $SshKeyName -SshPublicKeyPath $SshPublicKeyPath -VsiProfile $VsiProfile -VsiImageName $VsiImageName -VsiName $VsiName
}

if ($Targets -contains "CodeEngine") {
    Ensure-IbmPlugin -Name "code-engine" -Description "Code Engine commands"
    Ensure-CodeEngineResources -Project $CodeEngineProject -RegistrySecret $CodeEngineRegistrySecret -BackendApp $BackendAppName -FrontendApp $FrontendAppName -BackendImage $BackendImage -FrontendImage $FrontendImage -BackendEnvSecret $BackendEnvSecret -FrontendEnvSecret $FrontendEnvSecret -DatabaseSecret $DatabaseSecret -MigrationJob $MigrationJobName
}

if ($Targets -contains "IKS") {
    Ensure-IbmPlugin -Name "kubernetes-service" -Description "IKS cluster management"
    Ensure-IksResources -ClusterName $IksClusterName -WorkerFlavor $IksWorkerFlavor -WorkerCount $IksWorkerCount -Zone $IksZone -Namespace $KubeNamespace -ManifestPath $KustomizePath
}

if ($Targets -contains "GitHubActions") {
    Configure-GitHubActions -Repository $GitHubRepo -Secrets $GitHubSecrets
}

Write-Section "Done"
Write-Host "Processed targets: $($Targets -join ', ')." -ForegroundColor Green
if (-not $script:ExecuteChanges) {
    Write-Host "Dry-run complete. Re-run with -Apply to execute commands." -ForegroundColor Yellow
}
