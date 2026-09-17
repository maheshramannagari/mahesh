import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveDashboardTab } from './components/LiveDashboardTab';
import { VolForecastTab } from './components/VolForecastTab';
import { StressTestingTab } from './components/StressTestingTab';
import { AIStrategistTab } from './components/AIStrategistTab';
import { BackgroundGuideTab } from './components/BackgroundGuideTab';
import { PythonSandboxTab } from './components/PythonSandboxTab';
import { ActiveTab, MarketDataResponse, RegimeModelResponse } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<string>('SPY');
  const [selectedDays, setSelectedDays] = useState<number>(252);

  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [modelData, setModelData] = useState<RegimeModelResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDataAndRunModel = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Market Historical Data
      const mktRes = await fetch(`/api/market-data?asset=${selectedAsset}&days=${selectedDays}`);
      if (!mktRes.ok) {
        throw new Error('Failed to fetch historical market data');
      }
      const mktJson: MarketDataResponse = await mktRes.json();
      setMarketData(mktJson);

      // 2. Run Python Hidden Markov Model & GARCH(1,1)
      const modelRes = await fetch('/api/run-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prices: mktJson.prices,
          n_regimes: 3,
          forecast_horizon: 30
        })
      });

      if (!modelRes.ok) {
        throw new Error('Python model execution failed');
      }
      const modelJson: RegimeModelResponse = await modelRes.json();
      setModelData(modelJson);
    } catch (err: any) {
      console.error('Model computation error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred while executing the quantitative models.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAsset, selectedDays]);

  useEffect(() => {
    loadDataAndRunModel();
  }, [loadDataAndRunModel]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header with Global Asset & Timeframe controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        isLoading={isLoading}
        onRefresh={loadDataAndRunModel}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadDataAndRunModel}
              className="flex items-center gap-1 bg-rose-900/60 hover:bg-rose-900 px-3 py-1 rounded text-[11px] font-semibold transition"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Calibration
            </button>
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <LiveDashboardTab
            modelData={modelData}
            ohlcv={marketData?.ohlcv || []}
            assetName={selectedAsset}
          />
        )}

        {activeTab === 'volatility' && (
          <VolForecastTab
            modelData={modelData}
            assetName={selectedAsset}
          />
        )}

        {activeTab === 'stress' && (
          <StressTestingTab />
        )}

        {activeTab === 'ai-strategist' && (
          <AIStrategistTab
            modelData={modelData}
            assetName={selectedAsset}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundGuideTab />
        )}

        {activeTab === 'python' && (
          <PythonSandboxTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Adaptive AI // Market Regime Detection &amp; Volatility Forecasting Engine &bull; Domain: Quantitative Finance
          </div>
          <div className="text-[11px] text-slate-500">
            Python 3.10 Subprocess Engine &bull; Pure Math / Standard Library &bull; Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
