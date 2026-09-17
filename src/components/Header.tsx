import React from 'react';
import { ActiveTab } from '../types';
import { 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Terminal,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  selectedDays: number;
  setSelectedDays: (days: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const ASSETS = [
  { id: 'SPY', label: 'S&P 500 (SPY)', type: 'Equities' },
  { id: 'QQQ', label: 'Nasdaq 100 (QQQ)', type: 'Tech' },
  { id: 'BTC', label: 'Bitcoin (BTC)', type: 'Crypto' },
  { id: 'GLD', label: 'Gold (GLD)', type: 'Commodity' },
  { id: 'TLT', label: '20Y Treasury (TLT)', type: 'Bonds' },
  { id: 'USO', label: 'Crude Oil (USO)', type: 'Energy' },
];

const TIMEFRAMES = [
  { days: 63, label: '3M' },
  { days: 126, label: '6M' },
  { days: 252, label: '1Y' },
  { days: 504, label: '2Y' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedAsset,
  setSelectedAsset,
  selectedDays,
  setSelectedDays,
  isLoading,
  onRefresh
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      {/* Top Banner & Asset Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Adaptive AI</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Quantitative Finance
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Python 3.10 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Market Regime Detection (Hidden Markov Models) &amp; Volatility Forecasting (GARCH 1,1)
            </p>
          </div>
        </div>

        {/* Global Controls: Asset Selector & Timeframe */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Asset</span>
            <select
              id="asset-selector"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-slate-950 text-xs font-medium text-slate-200 rounded px-2.5 py-1 border border-slate-700/60 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Lookback</span>
            <div className="flex space-x-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.days}
                  id={`timeframe-${tf.label}`}
                  onClick={() => setSelectedDays(tf.days)}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                    selectedDays === tf.days
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <button
            id="refresh-model-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Re-estimate HMM & GARCH models"
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Computing...' : 'Recalibrate'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar space-x-1 border-t border-slate-900 pt-1">
        <button
          id="nav-tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Regime Engine
        </button>

        <button
          id="nav-tab-volatility"
          onClick={() => setActiveTab('volatility')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'volatility'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Volatility Forecasting &amp; Cones
        </button>

        <button
          id="nav-tab-stress"
          onClick={() => setActiveTab('stress')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'stress'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Crisis Stress Testing
        </button>

        <button
          id="nav-tab-ai"
          onClick={() => setActiveTab('ai-strategist')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ai-strategist'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          AI Macro &amp; Risk Strategist
        </button>

        <button
          id="nav-tab-background"
          onClick={() => setActiveTab('background')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'background'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Domain Background &amp; Math Theory
        </button>

        <button
          id="nav-tab-python"
          onClick={() => setActiveTab('python')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'python'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Python Backend &amp; Code Runner
        </button>
      </div>
    </header>
  );
};
