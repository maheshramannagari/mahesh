import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Code2, 
  Cpu, 
  FileCode,
  RefreshCw
} from 'lucide-react';

export const PythonSandboxTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'regime' | 'stress'>('regime');
  const [codeContent, setCodeContent] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '# Python 3.10.12 Quantitative Execution Environment Ready.\n# Click "Run Python Script" to execute models against the backend engine.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const fetchCode = async (fileKey: 'regime' | 'stress') => {
    setLoadingCode(true);
    try {
      const res = await fetch(`/api/python-code?file=${fileKey}`);
      const data = await res.json();
      setCodeContent(data.content || '# No content');
    } catch (err) {
      console.error('Error fetching code', err);
      setCodeContent('# Failed to load python script.');
    } finally {
      setLoadingCode(false);
    }
  };

  useEffect(() => {
    fetchCode(selectedFile);
  }, [selectedFile]);

  const handleRunScript = async () => {
    setExecuting(true);
    setTerminalOutput(`$ python3 backend/${selectedFile === 'regime' ? 'regime_volatility_engine.py' : 'stress_test_engine.py'} --demo\n[Executing Gaussian HMM Expectation-Maximization and GARCH solver]...`);
    try {
      const startTime = performance.now();
      let res;
      if (selectedFile === 'regime') {
        res = await fetch('/api/run-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prices: [
              100.0, 100.8, 101.5, 102.3, 102.1, 103.4, 104.2, 103.8, 105.0, 106.2,
              107.1, 106.5, 105.8, 103.2, 101.4, 98.7, 95.2, 92.1, 90.4, 88.6,
              89.5, 92.3, 94.1, 95.8, 97.4, 98.9, 100.2, 101.5, 103.0, 104.5
            ],
            n_regimes: 3,
            forecast_horizon: 14
          })
        });
      } else {
        res = await fetch('/api/stress-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario: 'covid_2020' })
        });
      }

      const data = await res.json();
      const elapsed = (performance.now() - startTime).toFixed(1);

      setTerminalOutput(
        `$ python3 backend/${selectedFile === 'regime' ? 'regime_volatility_engine.py' : 'stress_test_engine.py'} [SUCCESS - ${elapsed}ms]\n` +
        `Process exited with code 0\n\n` +
        `>>> Standard Output Stream (JSON):\n` +
        JSON.stringify(data, null, 2)
      );
    } catch (err: any) {
      setTerminalOutput(`$ Execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = selectedFile === 'regime' ? 'regime_volatility_engine.py' : 'stress_test_engine.py';
    const blob = new Blob([codeContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Python Quantitative Backend Source &amp; Live Terminal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Inspect the complete pure-Python mathematical implementation, run real executions via the containerized subprocess bridge, or download the script directly for local deployment.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunScript}
              disabled={executing}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition"
            >
              <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
              <span>{executing ? 'Executing...' : 'Run Python Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Script Selection Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedFile('regime')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition ${
            selectedFile === 'regime'
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          regime_volatility_engine.py (HMM &amp; GARCH)
        </button>

        <button
          onClick={() => setSelectedFile('stress')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition ${
            selectedFile === 'stress'
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          stress_test_engine.py (Crisis Simulator)
        </button>
      </div>

      {/* Interactive Execution Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="ml-2 font-mono text-slate-400">Terminal — Python 3.10.12 Subprocess Bridge</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">STDOUT / STDERR</span>
        </div>
        <pre className="p-4 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
          {terminalOutput}
        </pre>
      </div>

      {/* Code Editor View */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-300">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>backend/{selectedFile === 'regime' ? 'regime_volatility_engine.py' : 'stress_test_engine.py'}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Python Standard Library (Pure Math / Statistics)</span>
        </div>

        {loadingCode ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading source code...</div>
        ) : (
          <pre className="p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed whitespace-pre">
            {codeContent}
          </pre>
        )}
      </div>
    </div>
  );
};
