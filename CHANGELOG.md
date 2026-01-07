# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-07

### Added

- 🚀 Initial release
- **6 Providers**: OpenAI, Anthropic, Google, xAI, Groq, DeepSeek
- **90+ Models**: Full pricing data for all major models
- **Model Aliases**: `fast`, `best`, `cheap`, `code`, `vision`, etc.
- **Custom Aliases**: Override defaults or add your own
- **Fluent API**: Chainable `.system().user().send()` pattern
- **Streaming**: Async iterator support for real-time responses
- **Tools/Function Calling**: Built-in support across providers
- **Vision**: Image input via URL or base64
- **Cost Tracking**: Real-time cost calculation per request
- **Cost Analytics**: Daily/weekly/monthly reports saved locally
- **Global Defaults**: Set temperature, maxTokens, etc. once for all requests
- **Per-Request Options**: Override defaults for individual requests
- **Auto-Retry**: Exponential backoff for rate limits
- **Fallback Chain**: Auto-switch providers on failure
- **Budget Limits**: Max cost per request/session
- **Result-Based API**: No try-catch needed, clear error handling
- **Zero Dependencies**: Uses native `fetch`
- **TypeScript**: Full type definitions included
- **Bundle Size**: ~52 KB (ESM)

### Providers & Models

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-5.2, o1, o3, o4-mini, etc. |
| Anthropic | claude-opus-4.5, claude-sonnet-4, claude-haiku-3.5, etc. |
| Google | gemini-2.5-pro, gemini-2.5-flash, imagen-4, veo-3.1, etc. |
| xAI | grok-3, grok-4, etc. |
| Groq | llama-3.3-70b, qwen3-32b, etc. |
| DeepSeek | deepseek-chat, deepseek-reasoner |
