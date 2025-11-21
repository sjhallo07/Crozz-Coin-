param(
    [string]$SuiBinary = "sui",
    [int]$PublishGasBudget = 100000000,
    [int]$CallGasBudget = 10000000,
    [string]$MovePackagePath = "../smart-contract",
    [switch]$SkipPublish,
    [string]$PackageId,
    [string]$AdminCapId,
    [string]$TreasuryCapId,
    [string]$MetadataId,
    [string]$IconUrl = "https://new-crozz-icon.com/icon.png",
    [switch]$FreezeMetadata,
    [string]$MintAmount,
    [string]$MintRecipient,
    [string]$BurnCoinId,
    [string]$TransferCoinId,
    [string]$TransferRecipient
)

function Invoke-SuiCommand {
    param([string[]]$CommandArgs)
    Write-Host "\n> $SuiBinary $($CommandArgs -join ' ')" -ForegroundColor Cyan
    $output = & $SuiBinary @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $SuiBinary $($CommandArgs -join ' ')"
    }
    return $output
}

if (-not $SkipPublish) {
    $publishArgs = @("client", "publish", "--gas-budget", $PublishGasBudget, "--path", $MovePackagePath, "--json")
    $publishOutput = Invoke-SuiCommand -Args $publishArgs
    try {
        $publishJson = $publishOutput | ConvertFrom-Json
        $PackageId = $publishJson.effects.created | Where-Object { $_.owner.Package } | Select-Object -First 1 -ExpandProperty reference | Select-Object -ExpandProperty objectId
        if (-not $PackageId) {
            $PackageId = $publishJson.objectChanges | Where-Object { $_.type -eq "published" } | Select-Object -First 1 -ExpandProperty packageId
        }
        Write-Host "Detected PACKAGE_ID: $PackageId" -ForegroundColor Green
    }
    catch {
        Write-Warning "Could not parse publish output. Please note the PACKAGE_ID manually."
    }
}

if (-not $PackageId) { $PackageId = Read-Host "Enter PACKAGE_ID" }
if (-not $AdminCapId) { $AdminCapId = Read-Host "Enter ADMIN_CAP_ID" }
if (-not $TreasuryCapId) { $TreasuryCapId = Read-Host "Enter TREASURY_CAP_ID" }
if (-not $MetadataId) { $MetadataId = Read-Host "Enter METADATA_ID" }

if ($IconUrl) {
    Invoke-SuiCommand -Args @(
        "client", "call",
        "--function", "update_icon_url",
        "--module", "crozz_token",
        "--package", $PackageId,
        "--args", $AdminCapId, $TreasuryCapId, $MetadataId, $IconUrl,
        "--gas-budget", $CallGasBudget
    )
}

if ($FreezeMetadata) {
    Invoke-SuiCommand -Args @(
        "client", "call",
        "--function", "freeze_metadata",
        "--module", "crozz_token",
        "--package", $PackageId,
        "--args", $AdminCapId, $MetadataId,
        "--gas-budget", $CallGasBudget
    )
}

Invoke-SuiCommand -Args @(
    "client", "call",
    "--function", "get_icon_url",
    "--module", "crozz_token",
    "--package", $PackageId,
    "--args", $MetadataId,
    "--gas-budget", $CallGasBudget
)

if ($MintAmount -and $MintRecipient) {
    Invoke-SuiCommand -Args @(
        "client", "call",
        "--function", "mint",
        "--module", "crozz_token",
        "--package", $PackageId,
        "--args", $TreasuryCapId, $MintAmount, $MintRecipient,
        "--gas-budget", $CallGasBudget
    )
}

if ($BurnCoinId) {
    Invoke-SuiCommand -Args @(
        "client", "call",
        "--function", "burn",
        "--module", "crozz_token",
        "--package", $PackageId,
        "--args", $TreasuryCapId, $BurnCoinId,
        "--gas-budget", $CallGasBudget
    )
}

if ($TransferCoinId -and $TransferRecipient) {
    Invoke-SuiCommand -Args @(
        "client", "call",
        "--function", "transfer",
        "--module", "crozz_token",
        "--package", $PackageId,
        "--args", $TransferCoinId, $TransferRecipient,
        "--gas-budget", $CallGasBudget
    )
}

Write-Host "\nAutomation completed." -ForegroundColor Green
