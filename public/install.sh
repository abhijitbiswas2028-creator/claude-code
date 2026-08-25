#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Claude Code CLI (Production Build)...${NC}"

# 1. Check prerequisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed. Please install Node.js 18+.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is required but not installed.${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is required but not installed. Please install git to clone the repository.${NC}"
    exit 1
fi

# 2. Check Node version (must be >= 18)
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js v18 or higher is required. You are running v$NODE_VERSION.${NC}"
    exit 1
fi

# 3. Install the package globally (Modified Version)
echo -e "${BLUE}Running: npm install -g git+https://github.com/abhijitbiswas2028-creator/claude-code.git${NC}"
if npm install -g @anthropic-ai/claude-code; then
    echo -e "\n${GREEN}✔ Installation successful!${NC}"
    echo -e "To get started, simply run:\n  ${GREEN}claude${NC}"
else
    echo -e "\n${RED}✖ Installation failed. You may need to run this script with sudo:${NC}"
    echo -e "  sudo bash install.sh"
    exit 1
fi
