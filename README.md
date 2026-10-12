# CRAXTEN

> Browser-based AI chat powered by **NVIDIA Serverless API**  
> Free models · Per-model token budgets · Auto-fallback · Search + Hybrid

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Models](https://img.shields.io/badge/free%20models-16+-blue)

---

## Overview

**CRAXTEN** is a single-file HTML AI chat app. No backend, no install — open it in a browser and chat.

It uses NVIDIA’s free NIM endpoints (`integrate.api.nvidia.com`), four search engines, and a liquid-glass UI tuned for mid-range phones.

### Highlights

- **16+ free NVIDIA models** with individual token budgets  
- **Auto-fallback** — if one model fails, the next is tried automatically (no button)  
- **Chat / Search / Hybrid** modes  
- **Search:** main answer only; links stay inside a **Sources** box  
- **New chat**, history with date/time, export, Listen (TTS)  
- **Liquid glass** theme — light blur, safe for mid-range GPUs  
- One static file — GitHub Pages, Netlify, or any host  

---

## Quick start

```bash
# Open locally
open craxten-final.html

# Or serve
python3 -m http.server 8000
# → http://localhost:8000/craxten-final.html
```

Deploy: rename to `index.html`, push to GitHub Pages / Netlify / Vercel.

---

## Modes

| Mode | What it does | Config shown |
|------|----------------|--------------|
| **Chat** | Talk to the selected NVIDIA model | Model only |
| **Search** | Web search (Tavily / Exa / Bytez / BazaarLink) | Search engine only |
| **Hybrid** | Search first → model answers with that context | Both |

Search replies show a **highlighted answer** on top. Extra links open only under **📎 Sources**.

---

## Free models & token budgets

Each model has its own max output tokens. UI can still show a high global cap; the API uses the model’s budget.

| Model ID | Label | Budget |
|----------|--------|--------|
| `nvidia/nemotron-3-super-120b-a12b` | Nemotron Super 120B | 8192 |
| `nvidia/nemotron-3-ultra-550b-a55b` | Nemotron Ultra 550B | 16384 |
| `nvidia/nemotron-3.5-lightning-30b-a3b` | Nemotron Lightning 30B | 8192 |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Nemotron Nano Omni 30B | 8192 |
| `moonshotai/kimi-k3` | Kimi K3 | 8192 |
| `z-ai/glm-5.3` | GLM 5.3 | 8192 |
| `z-ai/glm-5.3-flash` | GLM 5.3 Flash | 4096 |
| `deepseek-ai/deepseek-v4.1-flash` | DeepSeek V4.1 Flash | 8192 |
| `google/gemma-4-31b-it` | Gemma 4 31B | 8192 |
| `meta/muse-glimmer-30b` | Muse Glimmer 30B | 8192 |
| `poolside/laguna-xs-2.1` | Laguna XS 2.1 | 8192 |
| `openai/gpt-oss-20b` | GPT-OSS 20B | 4096 |
| `meta/llama-3.2-11b-vision-instruct` | Llama 3.2 11B Vision | 4096 |
| `meta/llama-3.2-90b-vision-instruct` | Llama 3.2 90B Vision | 8192 |
| `nvidia/llama-3.3-nemotron-super-49b-v1` | Nemotron Super 49B | 8192 |
| `nvidia/llama-3.1-nemotron-ultra-253b-v1` | Nemotron Ultra 253B | 8192 |

Default: **Nemotron Super 120B**.

### Auto-fallback

No extra button. Order:

1. Selected model  
2. Then every other model in the list  

If all fail, an error lists the first few failures. Successful fallback shows the model name in the message source.

---

## Search engines

| Engine | Role |
|--------|------|
| **Tavily** | Fast answers + results |
| **Exa** | Semantic search |
| **Bytez** | Model-inference fallback |
| **BazaarLink** | Tavily-compatible web search |

Answer text is stripped of URLs; links appear only under **Sources**.

---

## Header actions

| Button | Action |
|--------|--------|
| **+** | New chat (clears messages, keeps history) |
| **📋** | History with date & time · restore · export JSON · clear |
| **🗑️** | Clear current chat |
| **✕** | Collapse / expand config |

Every AI bubble has **🔊 Listen** at the bottom (Web Speech API).

---

## Config & status

- **Temperature** 0–2  
- **Model / Search** visibility depends on mode  
- Badge under model: `✓ {budget} tok · auto-fallback`  
- Status: API, limit, message count, last response time  

---

## API keys (in HTML)

```javascript
NVIDIA_API_KEY      // integrate.api.nvidia.com
TAVILY_API_KEY
EXA_API_KEY
BYTEZ_API_KEY
BAZAARLINK_API_KEY
```

Frontend-only app. Prefer HTTPS hosting. Rotate keys if the file is shared publicly.

---

## UI

- Dark **liquid glass** (soft blur 10–14px)  
- Solid fallback if `backdrop-filter` is missing  
- Mid-range phone friendly; lighter blur ≤768px  
- Safe-area insets, 40px+ touch targets  
- `prefers-reduced-motion` respected  

---

## Stack

- HTML5 / CSS3 / Vanilla JS  
- NVIDIA NIM OpenAI-compatible chat  
- Tavily, Exa, Bytez, BazaarLink search  
- No build step, no npm  

**Browsers:** Chrome/Edge 90+, Firefox 88+, Safari 14+, modern mobile.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Network / Failed to fetch | Check network, CORS, API key; fallback will try other models |
| Empty model list | Hard refresh, clear cache |
| Search empty | Switch engine or query |
| Listen silent | Browser speech permission / volume |

---

## Customize

**Keys** — edit the `const …_API_KEY` lines at the top of the script.

**Models / budgets** — edit `NVIDIA_MODELS`:

```javascript
{ value: 'org/model-id', label: 'Display name', maxTokens: 8192 }
```

**Theme** — adjust colors in the `<style>` block (`#5dffb0`, `#00c4e0`, backgrounds).

---

## License

MIT — use, modify, distribute freely.

---

## Changelog

### v1.2.0
- 16+ free NVIDIA NIM models  
- Per-model token budgets  
- Automatic model fallback (no UI toggle)  
- Search: answer-only + collapsible Sources  
- Liquid glass theme for mid-range phones  
- ∞ / ⚡ removed; borderless header actions  
- New Chat (+), history with dates, Listen in bubble  

### v1.1.0
- BazaarLink, mode-aware config, 1M display cap  

### v1.0.0
- Initial NVIDIA chat + search + hybrid  

---

**CRAXTEN** — free NVIDIA models, auto-fallback, search, one file.
