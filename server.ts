import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Financial Summary Generator
  app.post('/api/financial-summary', async (req, res) => {
    try {
      const { scenario, tierName, tierCode, revenue, grossMargin, netMargin, netProfit, cacPercent, overheadPercent, currency } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured. Please ensure your API key is set in Settings > Secrets.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Generate a concise, high-impact, institutional-grade one-paragraph investment thesis summary (approx. 55-75 words) for Spenta Inc. (Enterprise Spatial XR & Physical AI with a San Jose HQ and Dhaka R&D dual-shore structure).

Current Selected Parameters:
- Growth & Financial Scenario: ${scenario} (choose focus based on whether it is Base Model, Aggressive Growth, or Market-Fit / Conservative)
- Commercial Tier: ${tierCode} - ${tierName}
- Scenario Revenue Baseline: ${revenue} (${currency})
- Audited Gross Margin: ${grossMargin}%
- Customer Acquisition Cost (CAC): ${cacPercent}%
- Overhead & G&A Reserve: ${overheadPercent}%
- Net Operating Profit: ${netProfit} (${netMargin}% Net Margin)

Instructions:
- Write exactly ONE authoritative paragraph suitable for an institutional venture capital memo.
- Emphasize how Spenta's dual-shore arbitrage, modular 6-layer fusion architecture, and strict margin governance (${grossMargin}% gross / ${netMargin}% net) create defensible capital efficiency and 5-year compounding ROI under this specific scenario.
- Do not use markdown headers or bullet points—return plain paragraph text only.`;

      const systemInstruction = 'You are an institutional venture capital partner and enterprise financial analyst writing a crisp, authoritative one-paragraph investment thesis for Spenta XR & Physical AI.';
      const candidateModels: Array<{ model: string; useThinking: boolean }> = [
        { model: 'gemini-4-hydrogen', useThinking: true },
        { model: 'gemini-3.1-flash-lite', useThinking: false },
      ];

      let lastError: any = null;
      let summaryText = '';

      for (let i = 0; i < candidateModels.length; i++) {
        const candidate = candidateModels[i];
        try {
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents: prompt,
            config: {
              systemInstruction,
              ...(candidate.useThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
            },
          });
          summaryText = response.text?.trim() || '';
          if (summaryText) break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code;
          const isTransient = status === 503 || status === 429 || String(err?.message || '').includes('503');
          if (isTransient && i < candidateModels.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }
          throw err;
        }
      }

      if (!summaryText && lastError) {
        throw lastError;
      }

      return res.json({ summary: summaryText });
    } catch (error: any) {
      const status = typeof error?.status === 'number' ? error.status : 500;
      console.warn(`[/api/financial-summary] Upstream Gemini status ${status}`);
      return res.status(status).json({
        error: 'The AI summary service is temporarily experiencing high demand. Please click Regenerate in a moment.'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        port: PORT,
        hmr: hmrDisabled ? false : { server: httpServer },
        ...(hmrDisabled ? { ws: false } : {}),
      },
      plugins: hmrDisabled
        ? [
            {
              name: 'disable-hmr-client-ws',
              transform(code, id) {
                if (id.includes('vite/dist/client/client.mjs')) {
                  return code.replace(
                    'transport.connect(createHMRHandler(handleMessage));',
                    '/* HMR WebSocket disabled via DISABLE_HMR=true */'
                  );
                }
              },
            },
          ]
        : [],
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Spenta Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
