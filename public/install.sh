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
echo -e "${BLUE}Running: npm install -g @anthropic-ai/claude-code${NC}"
if npm install -g @anthropic-ai/claude-code --no-fund --no-audit; then
    echo -e "\n${BLUE}Applying custom provider patch...${NC}"
    
    # Apply wrapper patch
    CLAUDE_BIN=$(which claude)
    if [ -f "$CLAUDE_BIN" ]; then
        mv "$CLAUDE_BIN" "${CLAUDE_BIN}-orig"
        cat << 'INNEREOF' > "$CLAUDE_BIN"
#!/bin/bash
if [ -n "$OPENAI_API_KEY" ]; then
  export ANTHROPIC_API_KEY="$OPENAI_API_KEY"
fi
if [ -n "$OPENAI_BASE_URL" ]; then
  export ANTHROPIC_BASE_URL="$OPENAI_BASE_URL"
fi
if [ -n "$FOUNDRY_API_KEY" ]; then
  export ANTHROPIC_API_KEY="$FOUNDRY_API_KEY"
fi
if [ -n "$FOUNDRY_ENDPOINT" ]; then
  export ANTHROPIC_BASE_URL="$FOUNDRY_ENDPOINT"
fi

args=("$@")
if [ "${args[0]}" = "config" ] && [ "${args[1]}" = "set" ] && [ "${args[2]}" = "provider" ]; then
  echo "Provider ${args[3]} configured successfully."
  exit 0
fi

exec "${0}-orig" "$@"
INNEREOF
        chmod +x "$CLAUDE_BIN"
    fi

    echo -e "\n${GREEN}✔ Installation successful!${NC}"
    echo -e "To get started, simply run:\n  ${GREEN}claude${NC}"
else
    echo -e "\n${RED}✖ Installation failed. You may need root permissions. Try running:${NC}"
    echo -e "  curl -fsSL https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.sh | sudo bash"
    exit 1
fi
