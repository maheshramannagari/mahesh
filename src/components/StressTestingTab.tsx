import React, { useState, useEffect } from 'react';
import { StressTestResponse } from '../types';
import { 
  ShieldAlert, 
  TrendingDown, 
  ShieldCheck, 
  Play, 
  CheckCircle, 
  Clock, 
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CRISIS_OPTIONS = [
  { id: 'covid_2020', label: '2020 COVID-19 Shock', peak: '-34%', vol: '82.5%', type: 'Liquidity & Panic' },
  { id: 'gfc_2008', label: '2008 Lehman GFC', peak: '-56%', vol: '80.8%', type: 'Banking Solvency' },
  { id: 'volmageddon_2018', label: '2018 Volmageddon', peak: '-10%', vol: '50.3%', type: 'Derivatives Feedback' },
  { id: 'stagflation_2022', label: '2022 Fed Rate Hikes', peak: '-25%', vol: '34.0%', type: 'Inflation Shock' },
];

export const StressTestingTab: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('covid_2020');
  const [stressData, setStressData] = useState<StressTestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStressTest = async (scenario: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      setStressData(data);
    } catch (e) {
      console.error('Error running stress test', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStressTest(selectedScenario);
  }, [selectedScenario]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Scenario Picker */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Crisis Stress Testing &amp; Regime Jump Backtester
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Simulate historical market breakdowns to evaluate the latency of the Adaptive Hidden Markov Model in detecting regime shifts and triggering dynamic de-risking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CRISIS_OPTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedScenario(c.id)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all text-left ${
                  selectedScenario === c.id
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 font-semibold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold">{c.label}</div>
                <div className="text-[10px] text-slate-400">Peak Drop: {c.peak} | Vol: {c.vol}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && !stressData ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs">Simulating market liquidity shock and regime transition paths...</p>
        </div>
      ) : stressData ? (
        <>
          {/* Performance Comparison KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Unhedged Drawdown</div>
              <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
                {stressData.results.buy_and_hold_drawdown_pct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">100% Buy-and-Hold Equity</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Adaptive AI Drawdown</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {stressData.results.adaptive_ai_drawdown_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">With Dynamic Regime De-risking</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capital Preserved (Alpha)</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                +{stressData.results.drawdown_mitigation_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Peak-to-trough protection</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Regime Detection Lag</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {stressData.results.regime_detection_lag_days} Days
              </div>
              <div className="text-[11px] text-slate-400 mt-1">From shock inception to hedge</div>
            </div>
          </div>

          {/* Scenario Details & Trajectory Chart */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  {stressData.scenario_meta.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stressData.scenario_meta.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-2.5 h-0.5 bg-rose-500"></span> Unhedged Benchmark
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-0.5 bg-emerald-400"></span> Adaptive AI Strategy
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stressData.time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="index" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Simulation Trading Day', fill: '#64748b', fontSize: 11, position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`$${val}`, name === 'benchmark' ? 'Unhedged Benchmark' : 'Adaptive AI Strategy']}
                  />
                  <Line type="monotone" dataKey="benchmark" stroke="#f43f5e" strokeWidth={2} dot={false} name="benchmark" />
                  <Line type="monotone" dataKey="adaptive" stroke="#10b981" strokeWidth={2.5} dot={false} name="adaptive" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Mechanism of Downside Mitigation:
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Upon detecting the sudden elevation in negative log-return variance at T+{stressData.results.regime_detection_lag_days}, the Baum-Welch posterior probability of the Crisis regime crossed the 75% trigger threshold. The allocation engine immediately reduced equity beta from 75% to 10% and deployed liquid treasury buffers.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Macroeconomic Shock Catalyst:
                </div>
                <p className="text-slate-400 leading-relaxed">
                  <strong>Trigger:</strong> {stressData.scenario_meta.catalyst}
                  <br />
                  <strong>Peak Implied Volatility:</strong> {stressData.scenario_meta.implied_vol_spike}%
                  <br />
                  <strong>Regime Shift Velocity:</strong> {stressData.scenario_meta.regime_shift_speed}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
