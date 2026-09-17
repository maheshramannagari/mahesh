export interface MarketDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResponse {
  asset: string;
  dates: string[];
  prices: number[];
  ohlcv: MarketDataPoint[];
}

export interface RegimeStep {
  time_index: number;
  probabilities: number[];
  regime_index: number;
  regime_name: string;
  confidence: number;
}

export interface VolatilityForecastPoint {
  day: number;
  forecast_vol: number;
  ci_upper: number;
  ci_lower: number;
}

export interface AdaptiveStrategy {
  allocation_weights: {
    equities: number;
    fixed_income: number;
    commodities_gold: number;
    cash_hedges: number;
  };
  max_recommended_leverage: number;
  adaptive_stop_loss_pct: number;
  strategic_guidance: string;
}

export interface RegimeModelSummary {
  current_regime_index: number;
  current_regime_name: string;
  current_regime_confidence: number;
  current_annualized_vol: number;
  unconditional_vol: number;
  garch_persistence: number;
  var_95_daily: number;
  var_99_daily: number;
  cvar_95_daily: number;
  sharpe_ratio: number;
  skewness: number;
  kurtosis: number;
}

export interface RegimeModelResponse {
  success: boolean;
  summary: RegimeModelSummary;
  regime_timeline: RegimeStep[];
  volatility_series: {
    garch_vols: number[];
    ewma_vols: number[];
    rolling_realized_vols: number[];
  };
  volatility_forecast: VolatilityForecastPoint[];
  transition_matrix: number[][];
  stationary_distribution: number[];
  regime_parameters: Array<{
    regime: number;
    mean_annualized_return: number;
    volatility_annualized: number;
  }>;
  adaptive_strategy: AdaptiveStrategy;
  error?: string;
}

export interface StressScenarioMeta {
  name: string;
  description: string;
  duration_days: number;
  peak_drawdown_pct: number;
  implied_vol_spike: number;
  regime_shift_speed: string;
  catalyst: string;
}

export interface StressTestResponse {
  scenario_key: string;
  scenario_meta: StressScenarioMeta;
  results: {
    buy_and_hold_drawdown_pct: number;
    adaptive_ai_drawdown_pct: number;
    drawdown_mitigation_pct: number;
    final_benchmark_value: number;
    final_adaptive_value: number;
    regime_detection_lag_days: number;
    max_volatility_experienced: number;
  };
  time_series: Array<{
    index: number;
    benchmark: number;
    adaptive: number;
    crisis_prob: number;
  }>;
}

export type ActiveTab = 'dashboard' | 'volatility' | 'stress' | 'ai-strategist' | 'background' | 'python';
