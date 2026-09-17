import express from "express";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy Gemini SDK client initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Built-in synthetic dataset generator for financial assets
function generateMarketData(asset: string, periodDays: number = 252) {
  let basePrice = 400.0;
  let annualDrift = 0.08;
  let baseVol = 0.16;

  if (asset === "QQQ") {
    basePrice = 360.0;
    annualDrift = 0.14;
    baseVol = 0.22;
  } else if (asset === "BTC") {
    basePrice = 42000.0;
    annualDrift = 0.25;
    baseVol = 0.58;
  } else if (asset === "GLD") {
    basePrice = 185.0;
    annualDrift = 0.06;
    baseVol = 0.14;
  } else if (asset === "TLT") {
    basePrice = 98.0;
    annualDrift = 0.02;
    baseVol = 0.15;
  } else if (asset === "USO") {
    basePrice = 72.0;
    annualDrift = 0.05;
    baseVol = 0.35;
  }

  const prices: number[] = [basePrice];
  const dates: string[] = [];
  const ohlcv: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> = [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  let currentP = basePrice;
  // Deterministic seed simulation for reproducibility
  let seed = 12345;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
  }
  function normalRandom() {
    const u1 = Math.max(1e-7, pseudoRandom());
    const u2 = Math.max(1e-7, pseudoRandom());
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  // Define 3 realistic macro regime waves over the timeline
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    dates.push(dateStr);

    let activeVol = baseVol;
    let activeDrift = annualDrift;

    // Phase 1: Bull trend (first 45%)
    if (i < periodDays * 0.45) {
      activeVol = baseVol * 0.75;
      activeDrift = annualDrift * 1.5;
    }
    // Phase 2: Volatility Spike / Correction (between 45% and 70%)
    else if (i < periodDays * 0.7) {
      activeVol = baseVol * 2.2;
      activeDrift = -annualDrift * 2.5;
    }
    // Phase 3: Consolidation / Selective Recovery
    else {
      activeVol = baseVol * 1.1;
      activeDrift = annualDrift * 0.8;
    }

    const dt = 1.0 / 252.0;
    const z = normalRandom();
    const ret = (activeDrift - 0.5 * activeVol * activeVol) * dt + activeVol * Math.sqrt(dt) * z;
    
    const prevClose = currentP;
    currentP = Math.max(1.0, currentP * Math.exp(ret));
    const openP = prevClose * (1.0 + normalRandom() * 0.002);
    const highP = Math.max(openP, currentP) * (1.0 + Math.abs(normalRandom()) * (activeVol / 18.0));
    const lowP = Math.min(openP, currentP) * (1.0 - Math.abs(normalRandom()) * (activeVol / 18.0));
    const vol = Math.floor(2500000 + Math.abs(z) * 4000000);

    prices.push(Number(currentP.toFixed(2)));
    ohlcv.push({
      date: dateStr,
      open: Number(openP.toFixed(2)),
      high: Number(highP.toFixed(2)),
      low: Number(lowP.toFixed(2)),
      close: Number(currentP.toFixed(2)),
      volume: vol,
    });
  }

  return { asset, dates, prices, ohlcv };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API 1: Market data provider
  app.get("/api/market-data", (req, res) => {
    const asset = (req.query.asset as string) || "SPY";
    const days = parseInt((req.query.days as string) || "252", 10);
    const data = generateMarketData(asset, days);
    res.json(data);
  });

  // API 2: Run Python Quantitative Regime & Volatility Model
  app.post("/api/run-model", async (req, res) => {
    try {
      const payload = req.body;
      const scriptPath = path.join(process.cwd(), "backend", "regime_volatility_engine.py");

      const pyProcess = spawn("python3", [scriptPath]);
      let stdoutData = "";
      let stderrData = "";

      pyProcess.stdin.write(JSON.stringify(payload));
      pyProcess.stdin.end();

      pyProcess.stdout.on("data", (chunk) => {
        stdoutData += chunk.toString();
      });

      pyProcess.stderr.on("data", (chunk) => {
        stderrData += chunk.toString();
      });

      pyProcess.on("close", (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(stdoutData);
            return res.json(parsed);
          } catch (err: any) {
            return res.status(500).json({ error: "Failed to parse Python JSON output", raw: stdoutData });
          }
        } else {
          return res.status(500).json({ error: `Python process exited with code ${code}`, details: stderrData });
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API 3: Stress Testing Engine (Lehman 2008, COVID 2020, Volmageddon 2018, etc.)
  app.post("/api/stress-test", async (req, res) => {
    try {
      const scenario = req.body.scenario || "covid_2020";
      const scriptPath = path.join(process.cwd(), "backend", "stress_test_engine.py");

      const pyProcess = spawn("python3", [scriptPath, scenario]);
      let stdoutData = "";
      let stderrData = "";

      pyProcess.stdout.on("data", (chunk) => {
        stdoutData += chunk.toString();
      });

      pyProcess.stderr.on("data", (chunk) => {
        stderrData += chunk.toString();
      });

      pyProcess.on("close", (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(stdoutData);
            return res.json(parsed);
          } catch (err) {
            return res.status(500).json({ error: "Failed to parse stress test output" });
          }
        } else {
          return res.status(500).json({ error: stderrData });
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API 4: Gemini Adaptive AI Financial Strategist Analysis
  app.post("/api/gemini-analysis", async (req, res) => {
    try {
      const ai = getGenAI();
      const { currentRegime, confidence, annualizedVol, unconditionalVol, garchPersistence, asset, var95, userQuestion } = req.body;

      if (!ai) {
        // Fallback intelligent quantitative response if key is not configured
        return res.json({
          analysis: `### Adaptive AI Quantitative Regime Assessment: ${asset || "SPY"}

**Current Detected State:** ${currentRegime || "Medium Volatility Neutral"} (${((confidence || 0.85) * 100).toFixed(1)}% Posterior Probability)
**Volatility Dynamics:**
- Annualized Conditional Volatility: **${(annualizedVol || 18.5).toFixed(1)}%** vs Unconditional Equilibrium: **${(unconditionalVol || 16.0).toFixed(1)}%**
- GARCH(1,1) Volatility Persistence (α + β): **${(garchPersistence || 0.94).toFixed(3)}**
- Estimated 1-Day Value-at-Risk (95% CI): **${(var95 || 1.8).toFixed(2)}%**

#### Macroeconomic & Factor Transmission:
The quantitative Hidden Markov model signals elevated volatility clustering consistent with late-cycle regime transitions. With a GARCH persistence of ${(garchPersistence || 0.94).toFixed(3)}, volatility shocks will experience slow mean reversion back to the ergodic steady-state over approximately 22-38 trading days.

#### Institutional Hedging Playbook:
1. **Dynamic Equity Beta Compression:** Reduce broad market exposure to 45-55% baseline, reallocating into short-duration sovereign treasuries.
2. **Volatility Convexity Overlay:** Deploy protective put spread collars or long volatility variance swaps to cap tail drawdowns.
3. **Adaptive Stop-Loss Threshold:** Tighten trailing risk thresholds to 2.8% to preempt sudden transition into High Volatility Crisis state.`,
          isFallback: true
        });
      }

      const prompt = `You are a Chief Quantitative Risk Strategist and Machine Learning Hedge Fund Lead specializing in "Adaptive AI for Market Regime Detection and Volatility Forecasting".

Current Market & Model Diagnostic State:
- Target Asset: ${asset || "S&P 500 (SPY)"}
- Detected Regime: ${currentRegime}
- Regime Confidence: ${(confidence * 100).toFixed(1)}%
- GARCH(1,1) Current Annualized Volatility: ${annualizedVol}%
- GARCH Unconditional Mean Volatility: ${unconditionalVol}%
- GARCH Volatility Persistence (alpha + beta): ${garchPersistence}
- 95% Daily Value-at-Risk: ${var95}%
${userQuestion ? `Specific User Query: "${userQuestion}"` : "Provide a comprehensive institutional quantitative commentary"}

Structure your response cleanly with Markdown:
1. **Executive Regime Diagnosis & Confidence Breakdown** (Explain what the Markov state means mathematically and macro-economically)
2. **Volatility Term Structure & Clustering Forecast** (Explain the GARCH persistence, half-life of shocks, and mean reversion trajectory)
3. **Cross-Asset Transmission & Liquidity Warning Indicators** (What triggers would flip this regime to the next state)
4. **Adaptive Portfolio Allocation & Hedging Matrix** (Explicit target weights for Equities, Fixed Income, Gold, Cash, and Options Overlays)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return res.json({
        analysis: response.text,
        isFallback: false
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API 5: Python Source Code for Inspection and Download
  app.get("/api/python-code", (req, res) => {
    try {
      const fileName = req.query.file === "stress" ? "stress_test_engine.py" : "regime_volatility_engine.py";
      const filePath = path.join(process.cwd(), "backend", fileName);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        return res.json({ fileName, content });
      }
      res.status(404).json({ error: "File not found" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adaptive AI Quantitative Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
