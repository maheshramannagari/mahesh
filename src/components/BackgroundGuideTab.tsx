import React from 'react';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  FileText,
  CheckCircle,
  ExternalLink,
  Code
} from 'lucide-react';

export const BackgroundGuideTab: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 text-slate-200">
      {/* Hero Banner */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Quantitative Problem Statement &amp; Theoretical Background
            </h2>
            <p className="text-xs text-slate-400">
              Domain: Quantitative Finance, Econometrics, Risk Management, and Adaptive Machine Learning
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: The Core Financial Challenge */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          1. The Failure of Classical Static Finance Models
        </h3>
        <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            Classical financial theory—most notably Markowitz Mean-Variance Optimization (1952) and the Black-Scholes-Merton option pricing framework (1973)—relies on the assumption that asset returns follow a continuous stationary Gaussian (normal) distribution with constant mean $\mu$ and constant variance $\sigma^2$.
          </p>
          <p>
            In empirical financial markets, this assumption catastrophically fails due to three fundamental phenomena:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-rose-400 text-xs uppercase tracking-wider">Non-Stationarity</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Market dynamics undergo structural regime changes driven by monetary policy shifts, geopolitical crises, liquidity spirals, and regulatory overhauls. A model calibrated during a tranquil bull market fails during a systemic crash.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">Volatility Clustering</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                As Benoit Mandelbrot famously observed: <em>&ldquo;Large changes tend to be followed by large changes, of either sign, and small changes tend to be followed by small changes.&rdquo;</em> Volatility is auto-correlated across time.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-cyan-400 text-xs uppercase tracking-wider">Fat Tails (Leptokurtosis)</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Return distributions exhibit excessive kurtosis ($&gt; 3.0$) and negative skewness. Severe market crashes (such as 1987 Black Monday or 2020 COVID-19) represent 10-sigma events under a Gaussian model that should occur once every billion years, yet happen every decade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Hidden Markov Models (HMM) */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          2. Hidden Markov Models (Hamilton 1989 Regime Switching)
        </h3>
        <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            To resolve non-stationarity, quantitative econometrician James Hamilton (1989) formulated the <strong>Markov-Switching Autoregressive model</strong>. The market is modeled as existing in an unobserved (latent) discrete state S_t in &#123;1, 2, ..., K&#125; governed by a first-order Markov chain:
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 space-y-2">
            <div>{'P(S_t = j | S_{t-1} = i, S_{t-2}, ...) = P_ij'}</div>
            <div className="text-slate-400 text-[11px]">{'Where P is a K × K row-stochastic transition matrix satisfying sum_j(P_ij) = 1'}</div>
          </div>

          <p>
            Conditioned on the active hidden regime S_t = k, asset log-returns r_t = ln(P_t / P_t-1) follow regime-specific Gaussian emission densities:
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
            {'r_t | (S_t = k) ~ N(μ_k, σ_k²)'}
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-white text-xs">Core Algorithms Implemented in Our Python Engine:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>
                <strong className="text-emerald-400">Baum-Welch (Expectation-Maximization):</strong> Iteratively estimates the maximum likelihood parameters (μ_k, σ_k², P_ij) without requiring prior labeled state data.
              </li>
              <li>
                <strong className="text-emerald-400">Forward-Backward Recursion:</strong> Computes the posterior state probabilities γ_t(k) = P(S_t = k | Y_1:T) taking into account the entire historical and forward context.
              </li>
              <li>
                <strong className="text-emerald-400">Ergodic Stationary Distribution (π):</strong> Solves the invariant vector equation $\pi P = \pi$ to determine the long-run unconditional equilibrium fraction of time the financial system spends in each market environment.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: GARCH(1,1) Volatility Forecasting */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          3. Volatility Forecasting Architecture: GARCH(1,1) &amp; EWMA
        </h3>
        <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            In 1982, Robert Engle introduced the Autoregressive Conditional Heteroskedasticity (ARCH) model (Nobel Prize in Economics 2003), later generalized by Tim Bollerslev (1986) into <strong>GARCH(1,1)</strong>.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
            <div>{'σ_t² = ω + α · ε_{t-1}² + β · σ_{t-1}²'}</div>
            <div className="text-slate-400 text-[11px] pt-1">
              where ω &gt; 0, α ≥ 0, β ≥ 0, and α + β &lt; 1 (covariance stationarity condition)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">Unconditional Equilibrium Variance</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The long-run average volatility V_L to which all financial time series eventually revert is defined as:
              </p>
              <div className="font-mono text-xs text-emerald-400">V_L = ω / (1 - α - β)</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">Multi-Step Analytical Forecast</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The h-step ahead expectation exhibits geometric mean-reversion governed by the persistence parameter (α + β):
              </p>
              <div className="font-mono text-xs text-emerald-400">{'E[σ_{t+h}²] = V_L + (α + β)^h · (σ_t² - V_L)'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Adaptive AI & Deep Learning Frontier */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          4. Modern Frontier: Adaptive AI &amp; Deep Learning Hybrids
        </h3>
        <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            Modern institutional quantitative funds (such as Renaissance Technologies, Two Sigma, and AQR) combine classic econometric models with deep learning architectures:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-amber-400">1. Temporal Fusion Transformers (TFT):</strong> Uses self-attention mechanisms over multi-horizon macro covariates (yield curve slope, credit default swap spreads, VIX futures term structure) to dynamically weight feature importance before regime classification.
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-emerald-400">2. Hybrid HMM-LSTM Networks:</strong> Uses Long Short-Term Memory (LSTM) recurrent layers to model continuous non-linear volatility dynamics while retaining the interpretability of discrete HMM Markov states for compliance and risk committees.
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-cyan-400">3. Reinforcement Learning (RL) Execution:</strong> Proximal Policy Optimization (PPO) algorithms that intake current regime probabilities as state inputs and dynamically adjust portfolio leverage and stop-losses to maximize the Sortino or Calmar ratio.
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Key Literature & Citations */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-300" />
          5. Academic Foundations &amp; Landmark Literature
        </h3>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
            <strong className="text-slate-200">Hamilton, J. D. (1989):</strong> <em>&ldquo;A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle.&rdquo;</em> Econometrica, 57(2), 357-384.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
            <strong className="text-slate-200">Bollerslev, T. (1986):</strong> <em>&ldquo;Generalized Autoregressive Conditional Heteroskedasticity.&rdquo;</em> Journal of Econometrics, 31(3), 307-327.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
            <strong className="text-slate-200">Engle, R. F. (1982):</strong> <em>&ldquo;Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation.&rdquo;</em> Econometrica, 50(4), 987-1007.
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
            <strong className="text-slate-200">J.P. Morgan (1996):</strong> <em>&ldquo;RiskMetrics — Technical Document.&rdquo;</em> J.P. Morgan / Reuters, 4th edition.
          </div>
        </div>
      </section>
    </div>
  );
};
