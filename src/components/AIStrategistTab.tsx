import React, { useState, useEffect } from 'react';
import { RegimeModelResponse } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  HelpCircle, 
  RefreshCw, 
  AlertCircle,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

interface AIStrategistTabProps {
  modelData: RegimeModelResponse | null;
  assetName: string;
}

export const AIStrategistTab: React.FC<AIStrategistTabProps> = ({
  modelData,
  assetName
}) => {
  const [analysisText, setAnalysisText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const fetchAIAnalysis = async (customPrompt?: string) => {
    if (!modelData) return;
    setLoading(true);
    try {
      const payload = {
        asset: assetName,
        currentRegime: modelData.summary.current_regime_name,
        confidence: modelData.summary.current_regime_confidence,
        annualizedVol: modelData.summary.current_annualized_vol,
        unconditionalVol: modelData.summary.unconditional_vol,
        garchPersistence: modelData.summary.garch_persistence,
        var95: modelData.summary.var_95_daily,
        userQuestion: customPrompt || ''
      };

      const res = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAnalysisText(data.analysis || 'Analysis unavailable');
      setIsFallback(Boolean(data.isFallback));
    } catch (err) {
      console.error('Error fetching AI analysis', err);
      setAnalysisText('Failed to generate AI quantitative analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modelData) {
      fetchAIAnalysis();
    }
  }, [modelData?.summary?.current_regime_name, assetName]);

  const handleCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    fetchAIAnalysis(userQuestion);
  };

  const sampleQuestions = [
    "How does the current GARCH persistence affect our options hedge ratio?",
    "What early-warning signals would trigger a flip to the Crisis Regime?",
    "Compare this volatility regime to the 2022 Fed tightening cycle.",
    "Recommend a delta-neutral collar structure for this regime."
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Gemini 3.8 Flash // Adaptive AI Macro &amp; Risk Strategist
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Server-side quantitative synthesis connecting the mathematical parameters of the Hidden Markov Model and GARCH(1,1) engine with real-world macroeconomic catalysts and options portfolio risk management.
            </p>
          </div>

          <button
            onClick={() => fetchAIAnalysis()}
            disabled={loading}
            className="flex items-center gap-1.5 self-start md:self-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Strategist Brief</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Display */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-amber-400 mx-auto"></div>
            <p className="text-slate-300 text-sm font-medium">Synthesizing quantitative parameters &amp; macroeconomic transmission...</p>
            <p className="text-slate-500 text-xs">Evaluating GARCH half-life, Markov state transitions, and tail risk...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                Model: <strong className="text-slate-200">Gemini 3.8 Flash (Server-Side)</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                Asset: <strong className="text-white">{assetName}</strong> | Regime: <strong className="text-amber-400">{modelData?.summary.current_regime_name}</strong>
              </span>
            </div>

            {/* Formatted Content */}
            <div className="prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {analysisText}
            </div>

            {isFallback && (
              <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Running in institutional quantitative simulation mode. Add your GEMINI_API_KEY in Settings &gt; Secrets for real-time live LLM inference.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Query Box */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Query the Adaptive Risk Strategist
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask targeted questions regarding model transition sensitivities, options strike selection, or macroeconomic stress triggers.
          </p>
        </div>

        <form onSubmit={handleCustomQuestion} className="flex gap-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="e.g. How does the current volatility persistence impact our portfolio cash allocation?"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !userQuestion.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Analyze</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUserQuestion(q);
                fetchAIAnalysis(q);
              }}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
