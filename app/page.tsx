'use client';

import React, { useState } from 'react';
import { Terminal, Code2, Monitor, Apple, LayoutDashboard, Settings, Key, Server, Check, Loader2, Cpu, Download } from 'lucide-react';

export default function InstallPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'install' | 'config'>('install');

  const [provider, setProvider] = useState('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [gcpProject, setGcpProject] = useState('');
  const [gcpRegion, setGcpRegion] = useState('us-central1');
  const [models, setModels] = useState<{id: string, name: string}[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [origin, setOrigin] = useState('YOUR_DOMAIN.com');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setOrigin(window.location.origin);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyButton = (text: string, id: string) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="ml-4 px-3 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#8BE9FD] rounded text-xs transition-colors whitespace-nowrap"
    >
      {copied === id ? 'Copied!' : 'Copy'}
    </button>
  );

  const fetchModels = async () => {
    if (!provider) return;
    
    setIsFetching(true);
    setError('');
    setSuccess('');
    setModels([]);
    setSelectedModel('');

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, baseUrl })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch models');
      }

      setModels(data.models || []);
      if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0].id);
        setSuccess(`Successfully loaded ${data.models.length} models.`);
      } else {
        setError('No models found.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const generateConfigCommand = () => {
    if (!selectedModel) return '';
    let cmds = [];
    
    if (provider === 'anthropic') {
      cmds.push(`export ANTHROPIC_API_KEY="********"`);
      cmds.push(`claude config set provider anthropic`);
    } else if (provider === 'custom_anthropic') {
      cmds.push(`export ANTHROPIC_API_KEY="********"`);
      if (baseUrl) {
        cmds.push(`export ANTHROPIC_BASE_URL="${baseUrl}"`);
      }
      cmds.push(`claude config set provider anthropic`);
    } else if (provider === 'gemini') {
      cmds.push(`export GEMINI_API_KEY="********"`);
      cmds.push(`claude config set provider gemini`);
    } else if (provider === 'bedrock') {
      cmds.push(`export AWS_ACCESS_KEY_ID="********"`);
      cmds.push(`export AWS_SECRET_ACCESS_KEY="********"`);
      cmds.push(`export AWS_REGION="${awsRegion || 'us-east-1'}"`);
      cmds.push(`claude config set provider bedrock`);
    } else if (provider === 'foundry') {
      cmds.push(`export FOUNDRY_API_KEY="********"`);
      if (baseUrl) cmds.push(`export FOUNDRY_ENDPOINT="${baseUrl}"`);
      cmds.push(`claude config set provider foundry`);
    } else if (provider === 'vertex') {
      cmds.push(`claude config set gcpProject "${gcpProject}"`);
      cmds.push(`claude config set gcpRegion "${gcpRegion || 'us-central1'}"`);
      cmds.push(`claude config set provider vertex`);
    } else {
      cmds.push(`export OPENAI_API_KEY="********"`);
      if (baseUrl) {
        cmds.push(`export OPENAI_BASE_URL="${baseUrl}"`);
      }
    }
    
    cmds.push(`claude config set defaultModel ${selectedModel}`);
    return cmds.join('\n');
  };

  const handleDownloadApplyScript = () => {
    if (!selectedModel) return;
    
    const envContent = generateConfigCommand()
      .replace(/claude config.*/g, '')
      .replace(/\*\*\*\*\*\*\*\*/g, apiKey)
      .trim();

    const scriptContent = `#!/usr/bin/env bash
# Production-ready Claude Code Configuration Script

CONFIG_FILE="$HOME/.claude_env"

echo "Setting up secure environment variables in $CONFIG_FILE..."
cat << 'EOF' > "$CONFIG_FILE"
${envContent}
EOF

# Ensure correct permissions for secrets
chmod 600 "$CONFIG_FILE"

echo "Applying model configuration..."
claude config set defaultModel ${selectedModel}

echo "Configuration successfully applied!"
echo "To use these settings in your current session, run:"
echo "  source $CONFIG_FILE"
echo ""
echo "Starting Claude with new settings..."
source "$CONFIG_FILE" && claude
`;
    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apply-claude-config.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 md:p-8 font-sans text-neutral-300">
      <div className="w-full max-w-3xl bg-[#0A0A0A] rounded-xl overflow-hidden shadow-2xl border border-[#2D2D2D]">
        <div className="p-8 border-b border-[#2D2D2D]">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-8 h-8 text-[#50FA7B]" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Claude Code CLI</h1>
          </div>
          <p className="text-[#888] text-sm mb-6">
            Terminal-based installation and configuration wrapper. All repo files (plugins, examples) have been extracted to this project workspace.
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('install')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'install' 
                  ? 'border-[#50FA7B] text-white' 
                  : 'border-transparent text-[#888] hover:text-[#bbb]'
              }`}
            >
              Installation
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'config' 
                  ? 'border-[#50FA7B] text-white' 
                  : 'border-transparent text-[#888] hover:text-[#bbb]'
              }`}
            >
              Configuration
            </button>
          </div>
        </div>

        {activeTab === 'install' && (
          <div className="p-8 space-y-8">
            {/* Direct NPM Installation (Most Reliable) */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-white font-medium">
                <Code2 className="w-5 h-5" />
                <span>Direct Terminal Install (Works Everywhere)</span>
              </div>
              <div className="bg-[#111111] border border-[#2D2D2D] rounded-lg p-4 flex items-center justify-between font-mono text-sm">
                <code className="text-[#50FA7B]">npm install -g git+https://github.com/abhijitbiswas2028-creator/claude-code.git</code>
                {copyButton('npm install -g git+https://github.com/abhijitbiswas2028-creator/claude-code.git', 'npm')}
              </div>
              <p className="text-xs text-[#888] mt-2">Run this universally workable command directly in your terminal to install the modified CLI.</p>
            </div>

            {/* macOS / Linux */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-white font-medium">
                <Apple className="w-5 h-5" />
                <span>macOS / Linux (Terminal Download)</span>
              </div>
              <div className="bg-[#111111] border border-[#2D2D2D] rounded-lg p-4 flex items-center justify-between font-mono text-sm">
                <code className="text-[#50FA7B]">curl -fsSL https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.sh | bash</code>
                {copyButton(`curl -fsSL https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.sh | bash`, 'mac')}
              </div>
              <p className="text-xs text-[#888] mt-2">Uses GitHub's public raw domain. Just push your fork to <code className="text-[#FFAA00]">github.com/abhijitbiswas2028-creator/claude-code</code> for this to execute flawlessly.</p>
            </div>

            {/* Windows PowerShell */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-white font-medium">
                <Monitor className="w-5 h-5" />
                <span>Windows (PowerShell)</span>
              </div>
              <div className="bg-[#111111] border border-[#2D2D2D] rounded-lg p-4 flex items-center justify-between font-mono text-sm">
                <code className="text-[#50FA7B]">irm https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.ps1 | iex</code>
                {copyButton(`irm https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.ps1 | iex`, 'win')}
              </div>
            </div>

            {/* Script Downloads */}
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.sh" 
                target="_blank"
                rel="noopener noreferrer"
                download="install.sh"
                className="flex items-center justify-center gap-2 py-3 bg-[#111111] hover:bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Apple className="w-4 h-4" />
                Download macOS/Linux Script
              </a>
              <a 
                href="https://raw.githubusercontent.com/abhijitbiswas2028-creator/claude-code/main/public/install.ps1" 
                target="_blank"
                rel="noopener noreferrer"
                download="install.ps1"
                className="flex items-center justify-center gap-2 py-3 bg-[#111111] hover:bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Monitor className="w-4 h-4" />
                Download Windows Script
              </a>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="p-8 space-y-6">
            <div className="space-y-4 bg-[#111111] p-6 rounded-lg border border-[#2D2D2D]">
              <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                <Server className="w-5 h-5" />
                Provider Setup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">Provider</label>
                  <select 
                    value={provider}
                    onChange={(e) => {
                      setProvider(e.target.value);
                      setModels([]);
                      setSelectedModel('');
                      setSuccess('');
                      setError('');
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors appearance-none"
                  >
                    <option value="anthropic">Anthropic (Asemprotic)</option>
                    <option value="openai">OpenAI (ChatGPT, Codex)</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="opencodezen">OpenCodeZen</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="bedrock">Amazon Bedrock</option>
                    <option value="foundry">Microsoft Foundry</option>
                    <option value="vertex">Google Vertex AI</option>
                    <option value="custom">Custom OpenAI Compatible</option>
                    <option value="custom_anthropic">Custom Anthropic (asimprotic) Compatible</option>
                  </select>
                </div>

                {(provider === 'custom' || provider === 'custom_anthropic' || provider === 'opencodezen' || provider === 'foundry') && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">Base URL</label>
                    <input 
                      type="text" 
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder={provider === 'opencodezen' ? 'https://api.opencodezen.com/v1' : 'https://api.example.com/v1'}
                      className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors"
                    />
                  </div>
                )}

                {provider === 'bedrock' && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">AWS Region</label>
                    <input 
                      type="text" 
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      placeholder="us-east-1"
                      className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors font-mono"
                    />
                  </div>
                )}

                {provider === 'vertex' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">GCP Project ID</label>
                      <input 
                        type="text" 
                        value={gcpProject}
                        onChange={(e) => setGcpProject(e.target.value)}
                        placeholder="my-gcp-project"
                        className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">GCP Region</label>
                      <input 
                        type="text" 
                        value={gcpRegion}
                        onChange={(e) => setGcpRegion(e.target.value)}
                        placeholder="us-central1"
                        className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors font-mono"
                      />
                    </div>
                  </>
                )}

                {provider !== 'vertex' && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">API Key</label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-2.5 text-[#555]" />
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'bedrock' ? 'AWS Access / Secret Key (via env)' : 'sk-...'}
                        className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors font-mono"
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={fetchModels}
                  disabled={isFetching}
                  className="w-full py-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Fetch Supported Models
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-950/30 border border-green-900/50 rounded text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {success}
                </div>
              )}
            </div>

            {models.length > 0 && (
              <div className="space-y-4 bg-[#111111] p-6 rounded-lg border border-[#2D2D2D] animate-in fade-in duration-300">
                <h3 className="text-white font-medium flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5" />
                  Model Selection
                </h3>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wider">Available Models</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2D2D2D] rounded px-3 py-2 text-white focus:outline-none focus:border-[#50FA7B] transition-colors appearance-none font-mono text-sm"
                  >
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2D2D2D]">
                  <label className="block text-xs font-medium text-[#888] mb-2 uppercase tracking-wider">Run this command to configure your local CLI:</label>
                  <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-lg p-4 font-mono text-sm overflow-hidden mb-4 relative">
                    <pre className="text-[#50FA7B] overflow-x-auto overflow-y-hidden no-scrollbar pb-1 m-0">
                      {generateConfigCommand()}
                    </pre>
                    <div className="absolute top-2 right-2">
                      {copyButton(generateConfigCommand().replace(/\*\*\*\*\*\*\*\*/g, apiKey), 'cmd')}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownloadApplyScript}
                    className="w-full py-2 bg-[#50FA7B] hover:bg-[#40D969] text-black rounded font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download & Apply Configuration Script
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-[#111111] p-6 border-t border-[#2D2D2D] flex items-start gap-4">
          <LayoutDashboard className="w-5 h-5 text-[#FFBD2E] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#888]">
            <strong className="text-[#E0E0E0] block mb-1">Project Workspace Updated</strong>
            All requested `claude-code` files (including the /plugins and /examples directories) have been successfully extracted and applied to your project tree. Open the workspace file explorer to view and customize them.
          </div>
        </div>
      </div>
    </div>
  );
}

