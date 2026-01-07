# @aitofy/ai-chat

> Lightweight Chat/LLM SDK - OpenAI, Claude, Gemini, Grok in one unified API

[![npm version](https://badge.fury.io/js/%40aitofy%2Fai-chat.svg)](https://www.npmjs.com/package/@aitofy/ai-chat)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@aitofy/ai-chat)](https://bundlephobia.com/package/@aitofy/ai-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Zero dependencies** - Uses native `fetch`, no bloat
- 🎯 **Result-based** - No try-catch needed, clear error handling
- 💰 **Cost tracking** - Know exactly what each request costs
- 📊 **Cost analytics** - Daily/weekly/monthly cost reports saved locally
- ⚡ **~52KB bundle** - Tiny footprint
- 🔧 **Fluent API** - Chainable, readable code
- 🌐 **6 providers** - OpenAI, Anthropic, Google, xAI, Groq, DeepSeek
- 🎯 **90+ models** - All major models with built-in pricing
- 🏷️ **Model aliases** - Use `fast`, `best`, `cheap` instead of model names
- 🎨 **Custom aliases** - Override defaults or add your own
- ⚙️ **Global defaults** - Set once, apply to all requests
- 🔄 **Auto-retry** - Exponential backoff for rate limits
- 🔀 **Fallback chain** - Auto-switch providers on failure
- 💸 **Budget limits** - Set max cost per request/session
- 👁️ **Vision support** - Image input via URL or base64
- 🛠️ **Tools/Functions** - Function calling support

## 📦 Installation

```bash
npm install @aitofy/ai-chat
# or
pnpm add @aitofy/ai-chat
# or
yarn add @aitofy/ai-chat
```

## 🚀 Quick Start (Zero Config!)

```typescript
// Just set env vars - that's it!
// OPENAI_API_KEY=sk-xxx
// ANTHROPIC_API_KEY=sk-ant-xxx

import { ask } from '@aitofy/ai-chat';

// One-liner with auto-config
const result = await ask('fast', 'What is 2+2?');

if (result.ok) {
  console.log(result.data.content);  // "4"
  console.log(result.data.cost);     // { total: 0.00001 }
}
```

## 🏷️ Model Aliases

Don't know which model to use? Use aliases!

```typescript
await ask('fast', 'Quick question');      // → gemini-2.5-flash-lite
await ask('fastest', 'Urgent!');          // → llama-3.1-8b-instant (Groq)
await ask('cheap', 'Save money');         // → gpt-4o-mini
await ask('cheapest', 'Budget mode');     // → llama-3.1-8b-instant
await ask('best', 'Important task');      // → claude-opus-4.5
await ask('smartest', 'Complex task');    // → gpt-5.2-pro
await ask('code', 'Write a function');    // → gpt-5.1-codex
await ask('vision', 'Describe image');    // → gpt-4o
await ask('long', 'Very long text');      // → gemini-2.5-pro (1M+ tokens)
await ask('reasoning', 'Think step by step'); // → o3
await ask('thinking', 'Deep analysis');   // → o1
await ask('image', 'Generate an image');  // → imagen-4
await ask('video', 'Generate a video');   // → veo-3.1
```

### Custom Aliases

Override defaults or add your own:

```typescript
const ai = new AI({
  aliases: {
    'fast': 'gpt-4o-mini',          // Override default
    'mybot': 'claude-sonnet-4',     // Add new alias
  }
});

// Or set at runtime
ai.setAlias('fast', 'gemini-2.5-flash');

// Set multiple
ai.setAliases({
  'dev': 'gpt-4o-mini',
  'prod': 'gpt-5.2-pro'
});

// Use your aliases
await ai.ask('mybot', 'Hello');

// Check resolution
console.log(ai.resolveAlias('fast')); // 'gemini-2.5-flash'
console.log(ai.aliases);               // All current aliases
```

### Explore Models & Pricing

```typescript
const ai = new AI();

// List all 90+ models
console.log(ai.models());  // ['gpt-4o', 'claude-sonnet-4', ...]

// List models for a provider
console.log(ai.modelsFor('openai'));  // ['gpt-4o', 'gpt-5.2', 'o1', ...]

// Get pricing for any model
console.log(ai.pricing('gpt-4o'));  // { input: 2.5, output: 10, provider: 'openai' }

// Get all aliases
console.log(ai.aliases);  // { fast: 'gemini-2.5-flash-lite', best: 'claude-opus-4.5', ... }
```

## 📖 API

### Fluent API

```typescript
import { chat } from '@aitofy/ai-chat';

const result = await chat('best')
  .system('You are a helpful assistant')
  .user('Explain quantum computing')
  .maxTokens(500)
  .temperature(0.7)
  .send();
```

### Cost Estimation

```typescript
// Estimate cost BEFORE sending
const estimate = chat('gpt-4o')
  .user('Very long prompt here...')
  .estimateCost();

console.log(`Estimated: $${estimate.inputCost.toFixed(6)}`);
```

### Streaming

```typescript
for await (const chunk of chat('fast').user('Tell me a story').stream()) {
  if (chunk.type === 'content') {
    process.stdout.write(chunk.content);
  }
}
```

### Tools / Function Calling

```typescript
const result = await chat('best')
  .user('What is the weather in Tokyo?')
  .tools([{
    name: 'get_weather',
    description: 'Get current weather',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string' }
      }
    }
  }])
  .send();

if (result.data.toolCalls) {
  console.log(result.data.toolCalls[0].arguments.city); // "Tokyo"
}
```

### Vision (Image Input)

```typescript
const result = await chat('vision')
  .user('What is in this image?')
  .image('https://example.com/photo.jpg')
  .send();
```

## 📊 Cost Analytics

Automatically track costs to local file:

```typescript
import { ask, getCostTracker } from '@aitofy/ai-chat';

// All requests auto-tracked
await ask('fast', 'Hello');
await ask('cheap', 'World');

// View report
const tracker = getCostTracker();
tracker.printReport();

// Output:
// 📊 AI Cost Analytics Report
// ════════════════════════════════════════
// 📅 Today:      $0.0012
// 📆 This Week:  $0.0245
// 📅 This Month: $0.1234
// 💰 All Time:   $1.5678
//
// 🏆 Top Models:
//    1. gpt-4o-mini: $0.5432
//    2. gemini-2.5-flash: $0.3210
//
// 🏢 By Provider:
//    • openai: $0.8765
//    • google: $0.4321
// ════════════════════════════════════════
```

### Analytics API

```typescript
const tracker = getCostTracker();

tracker.today        // Today's cost
tracker.thisWeek     // Last 7 days
tracker.thisMonth    // Last 30 days
tracker.total        // All time total

tracker.getDate('2026-01-07')   // Specific date
tracker.getLastDays(7)          // Array of last N days
tracker.summary()               // Full summary object

tracker.clear()                 // Reset all data
```

## ⚙️ Advanced Configuration

```typescript
import AI from '@aitofy/ai-chat';

const ai = new AI({
  // Auto-detect from env vars (default: true)
  autoDetect: true,
  
  // Or manually configure
  providers: {
    openai: { apiKey: 'sk-...' },
    anthropic: { apiKey: 'sk-ant-...' },
    google: { apiKey: 'AIza...' },
  },
  
  // Budget protection
  maxCostPerRequest: 0.10,  // Max $0.10 per request
  budgetLimit: 5.00,        // Max $5 total
  
  // Auto-retry with backoff
  retry: true,  // or { maxAttempts: 5, initialDelay: 1000 }
  
  // Fallback chain
  fallback: ['claude-sonnet-4', 'gpt-4o', 'gemini-2.5-pro'],
  
  // Logging
  logging: 'verbose',  // or true for basic
  
  // Cost tracking
  trackCosts: true,   // Save to .ai-costs.json
  
  // 🆕 Global defaults for ALL requests (can be overridden per-request)
  defaults: {
    temperature: 0.7,      // Default creativity
    maxTokens: 1000,       // Default max output
    topP: 0.9,             // Nucleus sampling
    frequencyPenalty: 0,   // Reduce repetition
    presencePenalty: 0,    // Encourage new topics
    timeout: 30000,        // 30s timeout
    responseFormat: 'text' // 'text' or 'json'
  }
});

// Now all requests use these defaults:
await ai.ask('fast', 'Hello');  // Uses temperature=0.7, maxTokens=1000, etc.

// Override per-request when needed:
await ai.chat('fast')
  .temperature(0.2)   // Override: more deterministic
  .maxTokens(500)     // Override: shorter output
  .user('Hello')
  .send();
```

### Per-Request Options

```typescript
import { chat } from '@aitofy/ai-chat';

const result = await chat('best')
  // Messages
  .system('You are a coding assistant')
  .user('Write a function')
  .assistant('Here is the function...')  // Prior assistant response
  
  // Generation settings
  .temperature(0.7)           // 0.0 - 2.0 (default: 0.7)
  .maxTokens(1000)            // Max output tokens
  .topP(0.9)                  // Nucleus sampling
  .frequencyPenalty(0.5)      // Reduce repetition
  .presencePenalty(0.5)       // Encourage new topics
  .stop(['END', '---'])       // Stop sequences
  
  // Output format
  .json()                     // Force JSON output
  .responseFormat('json')     // Same as .json()
  
  // Vision (attach images)
  .image('https://example.com/photo.jpg')
  .imageBase64('data:image/png;base64,...')
  
  // Tools / Function calling
  .tools([{ name: 'get_weather', ... }])
  .toolChoice('auto')         // 'auto' | 'none' | { name: 'fn_name' }
  
  // Control
  .timeout(30000)             // 30 second timeout
  .signal(abortController.signal)  // Abort controller
  
  .send();

// Or get as stream
for await (const chunk of chat('fast').user('Tell story').stream()) {
  process.stdout.write(chunk.content || '');
}
```

### Cost Estimation Before Sending

```typescript
const builder = chat('gpt-4o')
  .system('You are helpful')
  .user('Very long prompt here...');

// Estimate BEFORE sending
const estimate = builder.estimateCost();
console.log(`Input: $${estimate.inputCost.toFixed(6)}`);
console.log(`Est output: $${estimate.estimatedOutputCost.toFixed(6)}`);

// Only send if under budget
if (estimate.inputCost < 0.01) {
  const result = await builder.send();
}
```

## 🎯 Error Handling

No try-catch needed! Every response is a `Result<T, E>`:

```typescript
const result = await ask('gpt-4o', 'Hello');

if (result.ok) {
  console.log(result.data.content);
} else {
  switch (result.error.code) {
    case 'NO_API_KEY': console.log('Missing API key'); break;
    case 'RATE_LIMIT': console.log(`Retry in ${result.error.retryAfter}s`); break;
    case 'INVALID_MODEL': console.log('Unknown model'); break;
    case 'API_ERROR': console.log(`API error: ${result.error.status}`); break;
    case 'NETWORK': console.log('Network error'); break;
    case 'TIMEOUT': console.log('Request timed out'); break;
  }
}
```

## 🤖 Supported Models (90+)

| Provider | Models |
|----------|--------|
| **OpenAI** (37) | gpt-5.2, gpt-5.2-pro, gpt-5, gpt-5-mini, gpt-4.1, gpt-4o, gpt-4o-mini, o1, o3, o4-mini, gpt-realtime, gpt-image-* |
| **Anthropic** (10) | claude-opus-4.5/4.1/4, claude-sonnet-4.5/4, claude-haiku-4.5/3.5/3 |
| **Google** (22) | gemini-3-pro/flash, gemini-2.5-pro/flash/flash-lite, gemini-2.0-flash, imagen-4/3, veo-3.1/3/2 |
| **xAI** (10) | grok-4-*/3/3-mini, grok-code-fast-1, grok-2-vision |
| **Groq** (10) | gpt-oss-*, llama-4-*, llama-3.3-70b, llama-3.1-8b, qwen3-32b, kimi-k2 |
| **DeepSeek** (2) | deepseek-chat, deepseek-reasoner |

## 💰 Built-in Pricing

Pricing data is embedded - no API calls needed:

```typescript
import { PRICING } from '@aitofy/ai-chat';

const pricing = PRICING['gpt-4o'];
// { input: 2.5, output: 10, provider: 'openai', vision: true, tools: true }
```

## 📊 Response Structure

```typescript
interface ChatResult {
  content: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'groq' | 'deepseek';
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: {
    input: number;   // USD
    output: number;  // USD
    total: number;   // USD
  };
  latency: number;   // milliseconds
  toolCalls?: ToolCall[];
  finishReason?: string;
}
```

## 🆚 Why @aitofy/ai-chat?

| Feature | @aitofy/ai-chat | Vercel AI SDK | LangChain |
|---------|:---------------:|:-------------:|:---------:|
| Bundle size | **52 KB** | ~500 KB | ~2 MB |
| Dependencies | **0** | Many | Many |
| Result-based errors | ✅ | ❌ | ❌ |
| Cost tracking | ✅ | ❌ | ❌ |
| Cost analytics | ✅ | ❌ | ❌ |
| Model aliases | ✅ | ❌ | ❌ |
| Custom aliases | ✅ | ❌ | ❌ |
| Global defaults | ✅ | ❌ | ❌ |
| Vision support | ✅ | ✅ | ✅ |
| Auto-retry | ✅ | ✅ | ✅ |
| Budget limits | ✅ | ❌ | ❌ |
| Zero config | ✅ | ❌ | ❌ |
| Learning curve | Low | Medium | High |

## 📚 Related Packages

- [@aitofy/ai-speech](https://npmjs.com/package/@aitofy/ai-speech) - TTS/STT
- [@aitofy/ai-image](https://npmjs.com/package/@aitofy/ai-image) - Image generation
- [@aitofy/ai](https://npmjs.com/package/@aitofy/ai) - All-in-one bundle

## 📄 License

MIT © [Aitofy](https://aitofy.dev)
