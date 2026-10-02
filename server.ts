import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * AI Endpoint: Smart SOP Extraction & Structuring
 * Takes raw unstructured or draft text and structures it into ISO 17025 standard schema.
 */
app.post('/api/enhance-sop', async (req, res) => {
  try {
    const { rawText, tone } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or empty rawText in request body.' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.' 
      });
    }

    const systemPrompt = `You are a Senior ISO/IEC 17025 & NABL Laboratory Quality Manager and Technical Documentation Expert.
Analyze the user's provided Standard Operating Procedure (SOP) text draft and structure it into a clean, highly professional, standard laboratory SOP schema in JSON.
Preserve all specific data, equations, apparatus names, standards, and step-by-step numbers provided by the user.
If certain metadata (like company address, review frequency, or signatories) is missing from the draft, supply professional, industry-standard defaults suitable for an accredited testing laboratory.

Return ONLY a valid JSON object with the following exact structure:
{
  "companyName": "string",
  "companySubtitle": "string",
  "companyAddress": "string",
  "documentTitle": "string",
  "documentNumber": "string",
  "revisionNumber": "string",
  "effectiveDate": "string",
  "reviewDate": "string",
  "pageCount": "string",
  "department": "string",
  "isoStandard": "string",
  "purpose": "string",
  "scope": "string",
  "definitions": [
    { "term": "string", "definition": "string" }
  ],
  "safetyPrecautions": [
    { "title": "string", "desc": "string", "level": "Mandatory" | "Critical Caution" | "Standard" }
  ],
  "apparatus": [
    { "name": "string", "spec": "string", "tolerance": "string", "calibDue": "string" }
  ],
  "reagents": "string",
  "sampleHandling": "string",
  "procedureStages": [
    {
      "stageName": "string",
      "steps": [
        { "step": number, "title": "string", "text": "string" }
      ]
    }
  ],
  "calculations": [
    {
      "name": "string",
      "formula": "string",
      "explanation": "string",
      "variables": [
        { "symbol": "string", "description": "string", "unit": "string" }
      ]
    }
  ],
  "qualityControl": "string",
  "references": [ "string" ],
  "signatories": [
    { "role": "Prepared By" | "Reviewed By" | "Approved By", "name": "string", "designation": "string", "date": "string" }
  ],
  "revisionHistory": [
    { "rev": "string", "date": "string", "description": "string", "preparedBy": "string", "approvedBy": "string" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nHere is the raw SOP text input:\n${rawText}` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({ success: true, sop: parsedData });
  } catch (error: any) {
    console.error('Error enhancing SOP via Gemini API:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process SOP text via Gemini AI.' 
    });
  }
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Laboratory SOP Server listening on http://localhost:${PORT}`);
  });
}

startServer();
