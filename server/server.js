require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const EXA_API_KEY = process.env.EXA_API_KEY || '';
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY || '';
const BAZAARLINK_API_KEY = process.env.BAZAARLINK_API_KEY || '';

// Available models
const MODELS = {
  'nvidia/nemotron-3-super-120b-a12b': { name: 'Nemotron Super 120B', maxTokens: 8192 },
  'nvidia/nemotron-3-ultra-550b-a55b': { name: 'Nemotron Ultra 550B', maxTokens: 16384 },
  'google/gemma-4-31b-it': { name: 'Gemma 4 31B', maxTokens: 8192 },
  'deepseek-ai/deepseek-v4.1-flash': { name: 'DeepSeek V4.1', maxTokens: 8192 },
  'meta/llama-3.2-90b-vision-instruct': { name: 'Llama 3.2 90B', maxTokens: 8192 }
};

const FALLBACK_CHAIN = [
  'nvidia/nemotron-3-super-120b-a12b',
  'nvidia/nemotron-3-ultra-550b-a55b',
  'google/gemma-4-31b-it',
  'deepseek-ai/deepseek-v4.1-flash',
  'meta/llama-3.2-90b-vision-instruct'
];

// ========== NVIDIA API PROXY ==========
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, temperature = 0.7, max_tokens = 8192 } = req.body;

    if (!NVIDIA_API_KEY) {
      return res.status(500).json({ error: 'NVIDIA_API_KEY not configured' });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || FALLBACK_CHAIN[0],
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: errorText.substring(0, 200) 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== NVIDIA API WITH AUTO-FALLBACK ==========
app.post('/api/chat-fallback', async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 8192, preferred_model } = req.body;

    if (!NVIDIA_API_KEY) {
      return res.status(500).json({ error: 'NVIDIA_API_KEY not configured' });
    }

    const modelsToTry = preferred_model 
      ? [preferred_model, ...FALLBACK_CHAIN.filter(m => m !== preferred_model)]
      : FALLBACK_CHAIN;
    
    const errors = [];

    for (const modelId of modelsToTry) {
      try {
        const modelInfo = MODELS[modelId];
        const budget = Math.min(max_tokens, modelInfo?.maxTokens || 8192);

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages,
            temperature: temperature,
            max_tokens: budget,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return res.json({ ...data, model: modelId });
      } catch (err) {
        errors.push(`${modelId}: ${err.message}`);
        console.warn(`Model ${modelId} failed:`, err.message);
      }
    }

    res.status(500).json({ 
      error: 'All models failed', 
      details: errors.slice(0, 3) 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== TAVILY SEARCH PROXY ==========
app.post('/api/search/tavily', async (req, res) => {
  try {
    const { query, search_depth = 'basic', max_results = 5, include_answer = true } = req.body;

    if (!TAVILY_API_KEY) {
      return res.status(500).json({ error: 'TAVILY_API_KEY not configured' });
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: search_depth,
        max_results: max_results,
        include_answer: include_answer
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== EXA SEARCH PROXY ==========
app.post('/api/search/exa', async (req, res) => {
  try {
    const { query, type = 'auto', numResults = 5 } = req.body;

    if (!EXA_API_KEY) {
      return res.status(500).json({ error: 'EXA_API_KEY not configured' });
    }

    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': EXA_API_KEY
      },
      body: JSON.stringify({
        query: query,
        type: type,
        numResults: numResults,
        contents: { highlights: true }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== MODELS INFO ==========
app.get('/api/models', (req, res) => {
  res.json(MODELS);
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeys: {
      nvidia: !!NVIDIA_API_KEY,
      tavily: !!TAVILY_API_KEY,
      exa: !!EXA_API_KEY
    }
  });
});

// ========== STATIC FILES (for client) ==========
app.use(express.static('../client'));

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 CRAXTEN Server Running!                            ║
  ║                                                           ║
  ║   📍 Local:   http://localhost:${PORT}                  ║
  ║   🌐 Network: http://YOUR_IP:${PORT}                     ║
  ║                                                           ║
  ║   ✅ NVIDIA API: ${!!NVIDIA_API_KEY ? 'Configured' : 'NOT CONFIGURED'}
  ║   ✅ Tavily API: ${!!TAVILY_API_KEY ? 'Configured' : 'NOT CONFIGURED'}
  ║   ✅ Exa API: ${!!EXA_API_KEY ? 'Configured' : 'NOT CONFIGURED'}
  ║                                                           ║
  ║   Open: http://localhost:${PORT}/index.html              ║
  ║                                                           ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
