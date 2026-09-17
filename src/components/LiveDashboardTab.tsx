import React from 'react';
import { RegimeModelResponse, MarketDataPoint } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  PieChart, 
  Percent,
  Clock,
  Zap,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface LiveDashboardTabProps {
  modelData: RegimeModelResponse | null;
  ohlcv: MarketDataPoint[];
  assetName: string;
}

export const LiveDashboardTab: React.FC<LiveDashboardTabProps> = ({
  modelData,
  ohlcv,
  assetName
}) => {
  if (!modelData || !modelData.success) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm">Calibrating Hidden Markov Model and GARCH(1,1) engine...</p>
      </div>
    );
  }

  const { summary, regime_timeline, volatility_series, transition_matrix, stationary_distribution, adaptive_strategy } = modelData;
  const currentRegimeIdx = summary.current_regime_index;

  // Calculate duration of continuous active regime
  let consecutiveDays = 0;
  for (let i = regime_timeline.length - 1; i >= 0; i--) {
    if (regime_timeline[i].regime_index === currentRegimeIdx) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  // Regime badge styling
  const regimeConfig = [
    {
      name: 'Regime 1: Steady Bull / Low Volatility',
      color: 'emerald',
      bgColor: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: TrendingUp,
      desc: 'Positive upward drift with tranquil volatility. High Sharpe environment favorable for trend following and equity risk premia harvesting.'
    },
    {
      name: 'Regime 2: Sideways / Consolidation / Medium Vol',
      color: 'amber',
      bgColor: 'bg-amber-950/40 border-amber-500/30 text-amber-400',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Layers,
      desc: 'Range-bound oscillating market with moderate volatility clustering. Favorable for mean-reversion, market-making, and covered options overlays.'
    },
    {
      name: 'Regime 3: High Volatility Bear / Crisis',
      color: 'rose',
      bgColor: 'bg-rose-950/40 border-rose-500/30 text-rose-400',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: AlertTriangle,
      desc: 'Negative drift with acute leptokurtic volatility spikes. Elevated correlation breakdown and tail risk; mandates aggressive de-leveraging.'
    }
  ];

  const activeMeta = regimeConfig[currentRegimeIdx] || regimeConfig[1];
  const ActiveIcon = activeMeta.icon;

  // Merge price data with regime timeline and volatility
  const mergedChartData = ohlcv.map((bar, idx) => {
    // Note: timeline has length = prices.length - 1 (since returns have N-1 items)
    const tIdx = Math.min(idx, regime_timeline.length - 1);
    const reg = regime_timeline[tIdx] || { regime_index: 0, probabilities: [1, 0, 0], confidence: 0.9 };
    const garchVol = volatility_series?.garch_vols?.[tIdx] ?? 15.0;
    const ewmaVol = volatility_series?.ewma_vols?.[tIdx] ?? 15.0;
    const realizedVol = volatility_series?.rolling_realized_vols?.[tIdx] ?? 15.0;

    return {
      date: bar.date,
      close: bar.close,
      regimeIdx: reg.regime_index,
      regimeName: reg.regime_name,
      probBull: (reg.probabilities[0] * 100).toFixed(1),
      probNeutral: ((reg.probabilities[1] || 0) * 100).toFixed(1),
      probCrisis: ((reg.probabilities[2] || 0) * 100).toFixed(1),
      garchVol,
      ewmaVol,
      realizedVol
    };
  });

  // Calculate half-life of volatility shock: ln(0.5) / ln(alpha + beta)
  const persistence = summary.garch_persistence;
  const shockHalfLifeDays = persistence < 0.999 ? Math.round(Math.log(0.5) / Math.log(persistence)) : 99;

  // Colors for transition matrix
  const matrixLabels = ['Bull (Low Vol)', 'Neutral (Med Vol)', 'Crisis (High Vol)'];

  // Portfolio allocation bar data
  const allocData = [
    { asset: 'Equities (Beta)', weight: adaptive_strategy.allocation_weights.equities, fill: '#10b981' },
    { asset: 'Sovereign Treasuries', weight: adaptive_strategy.allocation_weights.fixed_income, fill: '#3b82f6' },
    { asset: 'Gold / Commodities', weight: adaptive_strategy.allocation_weights.commodities_gold, fill: '#f59e0b' },
    { asset: 'Cash / Tail Hedges', weight: adaptive_strategy.allocation_weights.cash_hedges, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Active Regime Executive Banner */}
      <div className={`p-5 rounded-2xl border ${activeMeta.bgColor} shadow-lg backdrop-blur relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${activeMeta.tagColor}`}>
                <ActiveIcon className="w-4 h-4" />
                {summary.current_regime_name}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Posterior Confidence: <strong className="text-white">{(summary.current_regime_confidence * 100).toFixed(1)}%</strong>
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                State Persistence: <strong className="text-white">{consecutiveDays} trading days</strong>
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
              {activeMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 self-start lg:self-center">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dynamic Strategic Directive</div>
              <div className="text-xs font-bold text-white mt-0.5">{adaptive_strategy.strategic_guidance}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Recommended Exposure: <span className="text-emerald-400 font-semibold">{adaptive_strategy.allocation_weights.equities}% Equities</span> | Trailing Stop: <span className="text-amber-400 font-semibold">{adaptive_strategy.adaptive_stop_loss_pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">GARCH(1,1) Volatility</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary.current_annualized_vol.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Unconditional Mean: <span className="text-slate-300">{summary.unconditional_vol.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Daily 95% Value-at-Risk</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              -{summary.var_95_daily.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              CVaR (Expected Shortfall): <span className="text-rose-400">-{summary.cvar_95_daily.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Vol Persistence (α + β)</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {persistence.toFixed(3)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Shock Half-Life: <span className="text-slate-300">{shockHalfLifeDays} trading days</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Annualized Sharpe Ratio</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary.sharpe_ratio.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Kurtosis: <span className="text-slate-300">{summary.kurtosis.toFixed(2)}</span> (Fat-tailed)
            </div>
          </div>
        </div>
      </div>

      {/* Main Visual: Price Timeline with Regime States */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {assetName} Price Action &amp; Detected Regime Trajectory
            </h2>
            <p className="text-xs text-slate-400">
              Hidden Markov Model posterior probability classification overlaid on continuous price log-returns
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bull / Low Vol
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Neutral / Range
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Crisis / High Vol
            </span>
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const rColor = data.regimeIdx === 0 ? 'text-emerald-400' : (data.regimeIdx === 1 ? 'text-amber-400' : 'text-rose-400');
                    return (
                      <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-semibold text-slate-300">{label}</div>
                        <div className="text-white font-mono text-sm">Close: ${Number(data.close).toFixed(2)}</div>
                        <div className={`font-semibold ${rColor}`}>Regime: {data.regimeName}</div>
                        <div className="pt-1 text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800">
                          <div>Bull Prob: <span className="text-emerald-400 font-mono">{data.probBull}%</span></div>
                          <div>Neutral Prob: <span className="text-amber-400 font-mono">{data.probNeutral}%</span></div>
                          <div>Crisis Prob: <span className="text-rose-400 font-mono">{data.probCrisis}%</span></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volatility Comparison: GARCH(1,1) vs EWMA vs Realized */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Volatility Dynamics: GARCH(1,1) vs EWMA (RiskMetrics) vs Realized Volatility
            </h2>
            <p className="text-xs text-slate-400">
              Annualized % conditional volatility tracking sudden clustering shocks and mean reversion
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span> GARCH(1,1)
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span> EWMA (λ=0.94)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-0.5 bg-slate-400"></span> 21d Realized
            </span>
          </div>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={['auto', 'auto']} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="garchVol" name="GARCH(1,1)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ewmaVol" name="EWMA (λ=0.94)" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="realizedVol" name="21d Realized" stroke="#94a3b8" strokeWidth={1.2} dot={false} strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Section: Markov Transition Matrix & Adaptive Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Markov Transition Matrix */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Regime Transition Probability Matrix (P)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1-step Markovian probability of shifting from Regime i (row) to Regime j (column)
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 text-left font-medium">From \ To</th>
                  {matrixLabels.map((lbl, i) => (
                    <th key={i} className="py-2 font-semibold text-slate-300">{lbl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transition_matrix.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-2.5 text-left font-semibold text-slate-300">{matrixLabels[i]}</td>
                    {row.map((prob, j) => {
                      // Color intensity based on probability
                      const intensity = Math.min(100, Math.round(prob * 100));
                      const isDiagonal = i === j;
                      return (
                        <td key={j} className="py-2.5 px-2">
                          <div 
                            className={`py-1.5 px-2 rounded font-mono font-bold transition-all ${
                              isDiagonal 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' 
                                : prob > 0.1 
                                  ? 'bg-amber-950/40 text-amber-400' 
                                  : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            {(prob * 100).toFixed(1)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stationary Distribution */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Long-Run Stationary Equilibrium (π):</span>
            <div className="flex gap-2">
              {stationary_distribution.map((p, idx) => (
                <span key={idx} className="text-slate-300 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  S{idx + 1}: <strong className="text-emerald-400">{(p * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Adaptive Asset Allocation Rebalancing */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Adaptive Portfolio Allocation (Regime-Adjusted)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic risk-budgeting based on the active state and forecasted conditional volatility
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
              Leverage: {adaptive_strategy.max_recommended_leverage * 100}%
            </span>
          </div>

          <div className="h-44 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="asset" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Target Weight']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {allocData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
            <span className="text-emerald-400 font-semibold">Allocation Logic: </span>
            In {summary.current_regime_name}, equity beta is modulated to {adaptive_strategy.allocation_weights.equities}%, while {adaptive_strategy.allocation_weights.cash_hedges}% is reserved in liquid cash and protective options collars to insulate against asymmetric downside jumps.
          </div>
        </div>
      </div>
    </div>
  );
};
