import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for schema-based decision generation
const DECISION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Clean normalized title of the decision' },
    summary: { type: Type.STRING, description: 'High-level executive summary of the dilemma' },
    options: {
      type: Type.ARRAY,
      description: 'Analysis for each option',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Unique slug or ID for option e.g. opt-1' },
          name: { type: Type.STRING, description: 'Option title or name' },
          tagline: { type: Type.STRING, description: 'Short 4-8 word essence of this option' },
          summary: { type: Type.STRING, description: '1-2 sentence overview of this path' },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: 'Concise pro point' },
                category: {
                  type: Type.STRING,
                  description: 'Category: Financial, Career & Growth, Time & Energy, Emotional & Wellbeing, Risk & Security, or Strategic',
                },
                score: { type: Type.NUMBER, description: 'Impact score from 1 to 5' },
                explanation: { type: Type.STRING, description: 'Brief rationale for why this is significant' },
              },
              required: ['id', 'text', 'category', 'score', 'explanation'],
            },
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: 'Concise con or drawback point' },
                category: {
                  type: Type.STRING,
                  description: 'Category: Financial, Career & Growth, Time & Energy, Emotional & Wellbeing, Risk & Security, or Strategic',
                },
                score: { type: Type.NUMBER, description: 'Impact or severity score from 1 to 5' },
                explanation: { type: Type.STRING, description: 'Brief rationale of the downside or friction' },
              },
              required: ['id', 'text', 'category', 'score', 'explanation'],
            },
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
          },
          keyTradeoff: { type: Type.STRING, description: 'The fundamental tradeoff accepting this option implies' },
        },
        required: ['id', 'name', 'tagline', 'summary', 'pros', 'cons', 'swot', 'keyTradeoff'],
      },
    },
    matrix: {
      type: Type.OBJECT,
      properties: {
        criteria: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: 'Evaluation criteria, e.g. Financial Return, Work-Life Balance, Growth Curve, Execution Risk' },
              description: { type: Type.STRING, description: 'Why this criterion matters for this decision' },
              weight: { type: Type.NUMBER, description: 'Default importance weight from 1 to 3' },
              scores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    optionId: { type: Type.STRING },
                    score: { type: Type.NUMBER, description: 'Score between 1 and 10' },
                    rationale: { type: Type.STRING, description: 'Short justification for this score' },
                  },
                  required: ['optionId', 'score', 'rationale'],
                },
              },
            },
            required: ['id', 'name', 'description', 'weight', 'scores'],
          },
        },
      },
      required: ['criteria'],
    },
    verdict: {
      type: Type.OBJECT,
      properties: {
        recommendedOptionId: { type: Type.STRING, description: 'ID of the recommended option' },
        recommendedOptionName: { type: Type.STRING, description: 'Name of the recommended option' },
        confidenceScore: { type: Type.NUMBER, description: 'Confidence percentage from 50 to 95' },
        headlineVerdict: { type: Type.STRING, description: 'Decisive, punchy headline recommendation' },
        detailedRationale: { type: Type.STRING, description: 'Balanced 2-3 paragraph breakdown explaining why this choice edges out' },
        criticalFactor: { type: Type.STRING, description: 'The single tipping factor that breaks the tie' },
        devilsAdvocate: {
          type: Type.OBJECT,
          properties: {
            potentialPitfall: { type: Type.STRING, description: 'The biggest blind spot or risk of following this recommendation' },
            hedgeStrategy: { type: Type.STRING, description: 'How to hedge or de-risk this path immediately' },
            whenToReconsider: { type: Type.STRING, description: 'Clear trigger point when you should pivot or pick the alternate' },
          },
          required: ['potentialPitfall', 'hedgeStrategy', 'whenToReconsider'],
        },
        rule101010: {
          type: Type.OBJECT,
          properties: {
            tenMinutes: { type: Type.STRING, description: 'Emotional/practical impact in 10 minutes' },
            tenMonths: { type: Type.STRING, description: 'Impact in 10 months' },
            tenYears: { type: Type.STRING, description: 'Long-term reflection in 10 years' },
          },
          required: ['tenMinutes', 'tenMonths', 'tenYears'],
        },
        gutCheckQuestion: { type: Type.STRING, description: 'A sharp introspective question to reveal their subconscious preference' },
      },
      required: [
        'recommendedOptionId',
        'recommendedOptionName',
        'confidenceScore',
        'headlineVerdict',
        'detailedRationale',
        'criticalFactor',
        'devilsAdvocate',
        'rule101010',
        'gutCheckQuestion',
      ],
    },
  },
  required: ['title', 'summary', 'options', 'matrix', 'verdict'],
};

// API: Analyze Decision
app.post('/api/analyze-decision', async (req: Request, res: Response) => {
  try {
    const { title, context, options, userPriorities } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Please provide a decision to evaluate.' });
    }

    const optionsList = Array.isArray(options) && options.length >= 2 
      ? options 
      : ['Option A', 'Option B'];

    const prompt = `
You are "The Tiebreaker", an elite decision strategist and analytical advisor.
Your job is to rigorously evaluate a difficult decision dilemma and break the tie with objective, nuanced, and actionable analysis.

Decision Dilemma: "${title}"
Background Context & Circumstances: "${context || 'No specific background provided by user'}"
User Stated Priorities & Values: "${userPriorities || 'Balanced evaluation across long-term growth, fulfillment, and risk'}"
Options Under Consideration:
${optionsList.map((opt: string, i: number) => `- Option ${i + 1} (id: "opt-${i + 1}"): "${opt}"`).join('\n')}

INSTRUCTIONS:
1. Provide a comprehensive, non-biased, deeply empathetic yet razor-sharp analysis.
2. For each option:
   - Provide 3-5 distinct Pros (with realistic impact scores 1-5 and appropriate category).
   - Provide 3-5 distinct Cons (with severity/friction scores 1-5 and appropriate category).
   - Provide a complete SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) with 2-4 concrete bullet points each.
   - Clarify the core tradeoff.
3. For the Comparison Matrix:
   - Create 4 to 6 relevant comparison criteria specifically tailored to this exact dilemma (e.g., Financial ROI, Mental Peace, Growth Ceiling, Reversibility/Flexibility, Immediate Friction).
   - Assign appropriate weights (1 = normal, 2 = high, 3 = critical).
   - Score each option from 1 to 10 for every criterion with a brief 1-sentence rationale.
4. For The Tiebreaker Verdict:
   - Pick the winning option firmly. DO NOT say "it depends on what you want" without picking a clear winner. Back it up with decisive logic based on the user's situation and asymmetric upside/downside.
   - Provide a confidence score (e.g. 78% or 86%).
   - Include Devil's Advocate stress-testing (the main pitfall, how to hedge against it, and exact pivot triggers).
   - Apply Suzy Welch's 10/10/10 rule (10 minutes, 10 months, 10 years).
   - Formulate a potent "Gut Check" introspective question.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are The Tiebreaker, an expert decision strategist. Always return strictly valid JSON matching the requested schema. Provide insightful, realistic, and highly practical reasoning without generic fluff.',
        responseMimeType: 'application/json',
        responseSchema: DECISION_SCHEMA,
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze decision. Please verify your GEMINI_API_KEY.',
    });
  }
});

// API: Refine Decision / Ask Follow-Up / Adjust Criteria
app.post('/api/refine-decision', async (req: Request, res: Response) => {
  try {
    const { currentDecision, refinementPrompt } = req.body;

    if (!currentDecision || !refinementPrompt) {
      return res.status(400).json({ error: 'Missing current decision or refinement prompt.' });
    }

    const prompt = `
You are "The Tiebreaker". The user already had an existing decision analysis, but has introduced a new constraint, what-if scenario, or refinement:

Refinement Request: "${refinementPrompt}"

Current Decision Title: "${currentDecision.title}"
Current Recommended Option: "${currentDecision.verdict?.recommendedOptionName}"

Here is the current decision object in JSON:
${JSON.stringify(currentDecision)}

TASK:
Re-evaluate the entire decision taking this new context, constraint, or condition into account.
Update the pros, cons, SWOT, matrix scores, and re-determine the Tiebreaker Verdict (the recommendation can change if the new factor decisively tips the scale, or remain the same with updated rationale).

Return the full updated decision structure matching the original schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are The Tiebreaker. Re-evaluate the decision incorporating the new constraint or perspective. Return strictly JSON.',
        responseMimeType: 'application/json',
        responseSchema: DECISION_SCHEMA,
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error refining decision:', error);
    return res.status(500).json({
      error: error.message || 'Failed to refine decision.',
    });
  }
});

// API: Quick AI Brainstorm Options
app.post('/api/brainstorm-options', async (req: Request, res: Response) => {
  try {
    const { dilemma } = req.body;
    if (!dilemma) return res.status(400).json({ error: 'Dilemma required' });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Given this decision dilemma: "${dilemma}", suggest 3 to 4 sensible, creative, or distinct viable options or paths forward, including unconventional "Third Way" middle grounds. Return a JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text || '[]';
    return res.json({ options: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error brainstorming options:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Tiebreaker] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
