#!/usr/bin/env node
/**
 * Environment Verification Script
 * Checks that all required tools and dependencies are installed correctly
 * Priority: Security > Functionality > Performance > Developer Experience
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let errors = 0;
let warnings = 0;

/**
 * Execute command and return output
 */
function exec(command, silent = false) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    if (!silent) {
      throw error;
    }
    return null;
  }
}

/**
 * Check if command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check Node.js version
 */
function checkNode() {
  log.header('Checking Node.js Environment');

  try {
    const nodeVersion = exec('node --version', true)?.trim();
    const npmVersion = exec('npm --version', true)?.trim();

    if (nodeVersion) {
      const major = parseInt(nodeVersion.substring(1).split('.')[0]);
      if (major >= 18) {
        log.success(`Node.js ${nodeVersion} (>= 18.x required)`);
      } else {
        log.error(`Node.js ${nodeVersion} is too old. Version 18.x or higher required.`);
        errors++;
      }
    }

    if (npmVersion) {
      log.success(`npm ${npmVersion}`);
    }
  } catch (error) {
    log.error('Node.js or npm not found');
    errors++;
  }
}

/**
 * Check TypeScript
 */
function checkTypeScript() {
  log.header('Checking TypeScript');

  const tsconfigPaths = [
    join(rootDir, 'frontend', 'tsconfig.json'),
    join(rootDir, 'backend', 'tsconfig.json'),
  ];

  tsconfigPaths.forEach((path) => {
    if (existsSync(path)) {
      log.success(`Found: ${path.replace(rootDir, '.')}`);

      // Validate strict mode
      const config = JSON.parse(readFileSync(path, 'utf8'));
      if (config.compilerOptions?.strict) {
        log.success('  Strict mode enabled ✓');
      } else {
        log.warning('  Strict mode not enabled');
        warnings++;
      }
    } else {
      log.error(`Missing: ${path.replace(rootDir, '.')}`);
      errors++;
    }
  });
}

/**
 * Check Sui tools
 */
function checkSui() {
  log.header('Checking Sui Development Tools');

  if (commandExists('sui')) {
    const version = exec('sui --version', true)?.trim();
    log.success(`Sui CLI ${version}`);

    // Check if client is configured
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const configPath = join(homeDir, '.sui', 'sui_config', 'client.yaml');

    if (existsSync(configPath)) {
      log.success('Sui client configured');
    } else {
      log.warning('Sui client not configured. Run: sui client');
      warnings++;
    }
  } else {
    log.warning('Sui CLI not installed. Run: ./scripts/install-sui-cli.sh');
    warnings++;
  }

  if (commandExists('move-analyzer')) {
    log.success('Move Analyzer installed');
  } else {
    log.warning('Move Analyzer not installed (optional but recommended)');
  }
}

/**
 * Check Move package
 */
function checkMovePackage() {
  log.header('Checking Move Smart Contract');

  const moveTomlPath = join(rootDir, 'smart-contract', 'Move.toml');

  if (existsSync(moveTomlPath)) {
    log.success('Move.toml found');

    const content = readFileSync(moveTomlPath, 'utf8');
    if (content.includes('Sui')) {
      log.success('Sui framework dependency configured');
    }
  } else {
    log.error('Move.toml not found in smart-contract/');
    errors++;
  }

  const sourcesPath = join(rootDir, 'smart-contract', 'sources');
  if (existsSync(sourcesPath)) {
    log.success('Move sources directory exists');
  } else {
    log.error('Move sources directory not found');
    errors++;
  }
}

/**
 * Check security tools
 */
function checkSecurity() {
  log.header('Checking Security Tools');

  // Check ESLint
  const eslintConfig = join(rootDir, '.eslintrc.json');
  if (existsSync(eslintConfig)) {
    log.success('ESLint configuration found');

    const config = JSON.parse(readFileSync(eslintConfig, 'utf8'));
    if (config.plugins?.includes('security')) {
      log.success('  Security plugin enabled ✓');
    } else {
      log.warning('  Security plugin not configured');
      warnings++;
    }
  } else {
    log.warning('ESLint configuration not found');
    warnings++;
  }

  // Check Prettier
  if (existsSync(join(rootDir, '.prettierrc.json'))) {
    log.success('Prettier configuration found');
  } else {
    log.warning('Prettier configuration not found');
    warnings++;
  }

  // Check Git hooks
  if (existsSync(join(rootDir, '.husky'))) {
    log.success('Husky (Git hooks) configured');
  } else {
    log.warning('Husky not configured. Run: npm run prepare');
    warnings++;
  }
}

/**
 * Check dependencies
 */
function checkDependencies() {
  log.header('Checking Dependencies');

  const packages = [
    { dir: '.', name: 'root' },
    { dir: 'backend', name: 'backend' },
    { dir: 'frontend', name: 'frontend' },
  ];

  packages.forEach(({ dir, name }) => {
    const nodeModulesPath = join(rootDir, dir, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      log.success(`${name} dependencies installed`);
    } else {
      log.error(`${name} dependencies not installed. Run: cd ${dir} && npm install`);
      errors++;
    }
  });

  // Check for security vulnerabilities
  log.info('Running security audit...');
  try {
    exec('npm audit --audit-level=high', true);
    log.success('No high-severity vulnerabilities found');
  } catch (error) {
    log.warning('Security vulnerabilities detected. Run: npm audit fix');
    warnings++;
  }
}

/**
 * Check environment files
 */
function checkEnvironment() {
  log.header('Checking Environment Configuration');

  const envExample = join(rootDir, '.env.example');
  const envFile = join(rootDir, '.env');

  if (existsSync(envExample)) {
    log.success('.env.example found');
  } else {
    log.warning('.env.example not found');
    warnings++;
  }

  if (existsSync(envFile)) {
    log.success('.env file exists');

    // Check for sensitive data patterns (basic check)
    const content = readFileSync(envFile, 'utf8');
    if (content.includes('PRIVATE_KEY') && !content.includes('your_private_key_here')) {
      log.warning('  ⚠ Private keys detected. Ensure .env is in .gitignore');
    }
  } else {
    log.warning('.env file not found. Copy from .env.example');
    warnings++;
  }
}

/**
 * Check Docker setup
 */
function checkDocker() {
  log.header('Checking Docker Setup (Optional)');

  if (commandExists('docker')) {
    const version = exec('docker --version', true)?.trim();
    log.success(version);

    if (commandExists('docker-compose') || commandExists('docker compose')) {
      log.success('Docker Compose available');

      const composeFile = join(rootDir, 'docker-compose.yml');
      if (existsSync(composeFile)) {
        log.success('docker-compose.yml found');
      }
    }
  } else {
    log.info('Docker not installed (optional for development)');
  }
}

/**
 * Check IDE configuration
 */
function checkIDE() {
  log.header('Checking IDE Configuration');

  const vscodeDir = join(rootDir, '.vscode');
  if (existsSync(vscodeDir)) {
    log.success('.vscode directory found');

    const files = ['settings.json', 'tasks.json', 'extensions.json'];
    files.forEach((file) => {
      if (existsSync(join(vscodeDir, file))) {
        log.success(`  ${file} configured`);
      }
    });
  } else {
    log.info('VSCode configuration not found (IDE setup is optional)');
  }
}

/**
 * Summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  log.header('Verification Summary');

  if (errors === 0 && warnings === 0) {
    log.success('All checks passed! Environment is ready for development.');
  } else {
    if (errors > 0) {
      log.error(`Found ${errors} error(s) that must be fixed.`);
    }
    if (warnings > 0) {
      log.warning(`Found ${warnings} warning(s) that should be addressed.`);
    }
  }

  console.log('='.repeat(60) + '\n');
}

// Run all checks
async function main() {
  console.log(
    `${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.cyan}║     Crozz-Coin Development Environment Verification    ║${colors.reset}`
  );
  console.log(
    `${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`
  );

  checkNode();
  checkTypeScript();
  checkSui();
  checkMovePackage();
  checkSecurity();
  checkDependencies();
  checkEnvironment();
  checkDocker();
  checkIDE();

  printSummary();

  // Exit with error code if there are critical errors
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((error) => {
  log.error(`Verification failed: ${error.message}`);
  process.exit(1);
});
