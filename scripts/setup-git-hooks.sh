#!/bin/bash
# Setup Git Hooks for security and quality checks
# Priority: Security > Functionality > Performance > Developer Experience

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}Setting up Git Hooks for Crozz-Coin${NC}"
echo "========================================"

cd "$ROOT_DIR"

# Install husky if not already installed
if [ ! -d "$ROOT_DIR/node_modules/husky" ]; then
    echo -e "${YELLOW}Installing husky...${NC}"
    npm install --save-dev husky
fi

# Initialize husky
echo -e "${YELLOW}Initializing husky...${NC}"
npx husky install

# Create pre-commit hook
echo -e "${YELLOW}Creating pre-commit hook...${NC}"
cat > "$ROOT_DIR/.husky/pre-commit" << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged
npx lint-staged

# Security checks
echo "🔒 Running security checks..."

# Check for secrets in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -n "$STAGED_FILES" ]; then
    # Check for common secret patterns
    SECRET_PATTERNS=(
        "private.*key.*=.*['\"].*['\"]"
        "api.*key.*=.*['\"].*['\"]"
        "password.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
        "BEGIN.*PRIVATE.*KEY"
    )
    
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if echo "$STAGED_FILES" | xargs grep -HnE "$pattern" 2>/dev/null | grep -v ".env.example" | grep -v "scripts/"; then
            echo "❌ Error: Potential secret detected in staged files!"
            echo "Please remove secrets before committing."
            exit 1
        fi
    done
fi

# Check .env is not being committed
if echo "$STAGED_FILES" | grep -E "^\.env$" >/dev/null 2>&1; then
    echo "❌ Error: .env file should not be committed!"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF

chmod +x "$ROOT_DIR/.husky/pre-commit"

# Create commit-msg hook for conventional commits
echo -e "${YELLOW}Creating commit-msg hook...${NC}"
cat > "$ROOT_DIR/.husky/commit-msg" << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check commit message format (loosely based on conventional commits)
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,100}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit message should follow the pattern:"
    echo "  <type>(<scope>): <subject>"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
    echo ""
    echo "Example: feat(backend): add token verification endpoint"
    echo ""
    exit 1
fi
EOF

chmod +x "$ROOT_DIR/.husky/commit-msg"

# Create pre-push hook
echo -e "${YELLOW}Creating pre-push hook...${NC}"
cat > "$ROOT_DIR/.husky/pre-push" << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Run tests
echo "🧪 Running tests..."
npm run test || {
    echo "❌ Tests failed! Push aborted."
    exit 1
}

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high || {
    echo "⚠️  Security vulnerabilities detected!"
    echo "Consider running 'npm audit fix' before pushing."
    read -p "Continue with push? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "✅ Pre-push checks passed!"
EOF

chmod +x "$ROOT_DIR/.husky/pre-push"

echo -e "\n${GREEN}✓ Git hooks installed successfully!${NC}"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Runs linting, formatting, and security checks"
echo "  • commit-msg: Validates commit message format"
echo "  • pre-push: Runs tests and security audit"
echo ""
echo -e "${YELLOW}Note: You can skip hooks with --no-verify flag if needed${NC}"
