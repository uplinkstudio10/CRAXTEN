# CRAXTEN

> **Browser-based AI Chat Assistant powered by NVIDIA Serverless API**
> 
> ✅ **100% Client-Side Free** | ✅ **Server-Side API Keys** | ✅ **Bengali & English Support** | ✅ **Auto-Fallback System**

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Models](https://img.shields.io/badge/free%20models-5+-blue)

---

## 🚀 Overview

**CRAXTEN** is a **secure, production-ready AI chat application** with a **client-server architecture**. 

- **Client**: Pure HTML/CSS/JS (single file)
- **Server**: Node.js + Express (API key proxy)
- **AI**: NVIDIA's free NIM endpoints with **server-side API keys**
- **Security**: API keys never exposed to the client

### 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **Secure API Keys** | All API keys stored server-side only |
| 🤖 **Multi-Model** | 5+ free NVIDIA models with auto-fallback |
| 🌍 **Bengali Support** | Auto-detection + manual language preference |
| ⚡ **Auto-Fallback** | If one model fails, automatically tries the next |
| 🎛️ **Configurable** | Temperature, max tokens, model selection |
| 📱 **Responsive** | Works on mobile, tablet, desktop |
| 💬 **Markdown** | Formatted responses with code blocks |
| 🧹 **Clean UI** | Modern dark theme with glassmorphism |

---

## 📦 Project Structure

```
craxten/
├── client/
│   └── index.html          # Frontend (no API keys)
├── server/
│   ├── server.js           # Express server (API proxy)
│   ├── package.json        # Node.js dependencies
│   ├── .env.example        # Environment template
│   └── .env                # API keys (add your own)
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/uplinkstudio10/CRAXTEN.git
cd CRAXTEN

# Setup server
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Start server (Terminal 1)
node server.js

# Open client (Terminal 2)
cd ../client
python3 -m http.server 8000
# Open: http://localhost:8000
```

### Option 2: Production Deployment

#### Deploy Server (Railway.app - Free)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd server
railway up
```

#### Deploy Client (Vercel / Netlify / GitHub Pages)
- Upload `client/` folder
- Set API endpoint in client code if different from server URL

---

## 🔐 Server Configuration

### Environment Variables (.env)

```env
# Required
NVIDIA_API_KEY=your_nvidia_api_key_here

# Optional (for search features)
TAVILY_API_KEY=your_tavily_api_key_here
EXA_API_KEY=your_exa_api_key_here
BYTEZ_API_KEY=your_bytez_api_key_here
BAZAARLINK_API_KEY=your_bazaarlink_api_key_here

# Server settings
PORT=3000
NODE_ENV=production
```

### Get Free API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| **NVIDIA** | [NVIDIA Developer](https://build.nvidia.com/) | Free models |
| **Tavily** | [Tavily](https://tavily.com/) | Free search |
| **Exa** | [Exa.ai](https://exa.ai/) | Free search |

---

## 🤖 Available AI Models

| Model ID | Name | Max Tokens | Speed |
|----------|------|------------|-------|
| `nvidia/nemotron-3-super-120b-a12b` | Nemotron Super 120B | 8192 | ⚡ Fast |
| `nvidia/nemotron-3-ultra-550b-a55b` | Nemotron Ultra 550B | 16384 | 🐢 Slow |
| `google/gemma-4-31b-it` | Gemma 4 31B | 8192 | ⚡ Fast |
| `deepseek-ai/deepseek-v4.1-flash` | DeepSeek V4.1 | 8192 | ⚡⚡ Very Fast |
| `meta/llama-3.2-90b-vision-instruct` | Llama 3.2 90B | 8192 | ⚡ Fast |

**Default**: Nemotron Super 120B

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Single model chat |
| POST | `/api/chat-fallback` | Auto-fallback chat |
| POST | `/api/search/tavily` | Tavily search |
| POST | `/api/search/exa` | Exa search |
| GET | `/api/models` | Get available models |
| GET | `/api/health` | Health check |

---

## 🎛️ Client Features

### UI Controls

| Element | Function |
|---------|----------|
| Model Dropdown | Select AI model |
| ⚙️ Settings | Open settings modal |
| 🗑️ Clear | Clear current chat |
| Temperature Slider | Control creativity (0-2) |
| Max Tokens Slider | Control response length |
| Language Select | Bengali/English preference |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |

---

## 🔧 Settings

### Temperature
- **0.0 - 0.3**: Focused, deterministic, factual
- **0.4 - 0.7**: Balanced (recommended)
- **0.8 - 1.2**: Creative, varied responses
- **1.3 - 2.0**: Very creative, random

### Max Tokens
- **1024**: Short, concise answers
- **4096**: Medium length responses
- **8192**: Detailed answers (default)
- **16384**: Very long responses

### Language Preference
- **Auto Detect**: AI detects language from question
- **English Only**: Always respond in English
- **Bengali Preferred**: Always respond in Bengali

---

## 🛡️ Security Best Practices

### ✅ DO
- Store API keys in environment variables
- Use HTTPS in production
- Rotate API keys regularly
- Use .gitignore for .env files

### ❌ DON'T
- Hardcode API keys in client code
- Commit .env files to Git
- Use HTTP in production
- Share API keys publicly

---

## 📊 Performance Tips

1. **Use Auto-Fallback**: If one model is busy, it automatically tries the next
2. **Optimize Token Usage**: Set appropriate max_tokens for your use case
3. **Cache Responses**: Store frequent query responses (client-side)
4. **Use Streaming**: For better UX (not implemented yet, but API supports it)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **API keys not working** | Check .env file, restart server |
| **CORS errors** | Ensure server is running, check network |
| **Model not responding** | Try different model, check NVIDIA status |
| **Slow responses** | Use faster models (DeepSeek, Gemma) |
| **Rate limited** | Wait and retry, or use fallback models |

---

## 🏗️ Tech Stack

### Client
- HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- No frameworks, no build step
- Responsive design

### Server
- Node.js 18+
- Express.js
- Fetch API
- Environment variables

### AI Backend
- NVIDIA NIM (integrate.api.nvidia.com)
- OpenAI-compatible API
- Multiple free models

---

## 📜 Changelog

### v2.0.0 (Current)
- ✅ **Server-Side Architecture**: API keys moved to server
- ✅ **Auto-Fallback System**: Automatic model retry
- ✅ **Bengali Support**: Language detection & preference
- ✅ **Improved UI**: Clean, modern design
- ✅ **Settings Modal**: Temperature, tokens, language
- ✅ **Markdown Formatting**: Code blocks, bold, lists

### v1.2.0
- 16+ free NVIDIA NIM models
- Per-model token budgets
- Automatic model fallback
- Liquid glass theme

### v1.0.0
- Initial release
- Basic NVIDIA chat

---

## 📄 License

**MIT License** - Free to use, modify, and distribute.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🙏 Support

- **Issues**: [GitHub Issues](https://github.com/uplinkstudio10/CRAXTEN/issues)
- **Discussions**: [GitHub Discussions](https://github.com/uplinkstudio10/CRAXTEN/discussions)

---

**Made with ❤️ for AI Enthusiasts**

*CRAXTEN - Your secure, private AI assistant*
