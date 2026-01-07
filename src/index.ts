/**
 * @aitofy/ai-chat - Lightweight Unified AI SDK
 * 
 * Features:
 * - Result-based (no try-catch needed)
 * - Streaming support
 * - Tools/Function calling
 * - Structured output (JSON mode)
 * - Vision (image input)
 * - Cost tracking
 */

// ============================================================================
// RESULT TYPE (No try-catch needed!)
// ============================================================================

export type Result<T, E = Error> =
    | { ok: true; data: T; error: null }
    | { ok: false; data: null; error: E };

function Ok<T>(data: T): { ok: true; data: T; error: null } {
    return { ok: true, data, error: null };
}

function Err<E>(error: E): { ok: false; data: null; error: E } {
    return { ok: false, data: null, error };
}

// ============================================================================
// TYPES
// ============================================================================

export type Provider = 'openai' | 'anthropic' | 'google' | 'xai' | 'groq' | 'deepseek';

// Message types with vision support
export interface TextContent {
    type: 'text';
    text: string;
}

export interface ImageContent {
    type: 'image';
    url?: string;      // URL to image
    base64?: string;   // Base64 encoded image
    mimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
}

export type MessageContent = string | (TextContent | ImageContent)[];

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: MessageContent;
}

export interface Usage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface Cost {
    input: number;
    output: number;
    total: number;
}

// Tool/Function types
export interface ToolParameter {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    enum?: string[];
    items?: ToolParameter;
    properties?: Record<string, ToolParameter>;
    required?: string[];
}

export interface Tool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, ToolParameter>;
        required?: string[];
    };
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

// Response types
export interface ChatResult {
    content: string;
    model: string;
    provider: Provider;
    usage: Usage;
    cost: Cost;
    latency: number;
    toolCalls?: ToolCall[];
    finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

// Streaming types
export interface StreamChunk {
    type: 'text' | 'tool_call' | 'done' | 'error';
    content?: string;
    toolCall?: Partial<ToolCall>;
    error?: AIError;
    usage?: Usage;
}

// Error types
export interface AIError {
    code: 'NO_API_KEY' | 'INVALID_API_KEY' | 'RATE_LIMIT' | 'INVALID_MODEL' |
    'NETWORK' | 'API_ERROR' | 'TIMEOUT' | 'CONTENT_FILTER' | 'INVALID_REQUEST';
    message: string;
    provider?: Provider;
    status?: number;
    retryAfter?: number;
}

export interface ProviderConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface BaseAIConfig {
    providers?: Partial<Record<Provider, ProviderConfig>>;
    timeout?: number;
    maxRetries?: number;
    debug?: boolean;
}

// Chat options type
export interface ChatOptions {
    model: string;
    messages: Message[];
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    tools?: Tool[];
    toolChoice?: 'auto' | 'none' | { name: string };
    responseFormat?: 'text' | 'json';
    stream?: boolean;
    signal?: AbortSignal;
    timeout?: number;
}

// ============================================================================
// PRICING DATA
// ============================================================================

interface PricingEntry {
    input: number;
    output: number;
    provider: Provider;
    vision?: boolean;
    tools?: boolean;
}

const PRICING: Record<string, PricingEntry> = {
    // ========== OpenAI (from official pricing page) ==========
    // GPT-5.2 series
    'gpt-5.2': { input: 1.75, output: 14, provider: 'openai', vision: true, tools: true },
    'gpt-5.2-pro': { input: 21, output: 168, provider: 'openai', vision: true, tools: true },
    'gpt-5.2-chat-latest': { input: 1.75, output: 14, provider: 'openai', vision: true, tools: true },
    // GPT-5.1 series
    'gpt-5.1': { input: 1.25, output: 10, provider: 'openai', vision: true, tools: true },
    'gpt-5.1-chat-latest': { input: 1.25, output: 10, provider: 'openai', vision: true, tools: true },
    'gpt-5.1-codex': { input: 1.25, output: 10, provider: 'openai', tools: true },
    'gpt-5.1-codex-mini': { input: 0.25, output: 2, provider: 'openai', tools: true },
    // GPT-5 series
    'gpt-5': { input: 1.25, output: 10, provider: 'openai', vision: true, tools: true },
    'gpt-5-pro': { input: 15, output: 120, provider: 'openai', vision: true, tools: true },
    'gpt-5-mini': { input: 0.25, output: 2, provider: 'openai', vision: true, tools: true },
    'gpt-5-nano': { input: 0.05, output: 0.4, provider: 'openai', tools: true },
    'gpt-5-codex': { input: 1.25, output: 10, provider: 'openai', tools: true },
    // GPT-4.1 series
    'gpt-4.1': { input: 2, output: 8, provider: 'openai', vision: true, tools: true },
    'gpt-4.1-mini': { input: 0.4, output: 1.6, provider: 'openai', vision: true, tools: true },
    'gpt-4.1-nano': { input: 0.1, output: 0.4, provider: 'openai', tools: true },
    // GPT-4o series
    'gpt-4o': { input: 2.5, output: 10, provider: 'openai', vision: true, tools: true },
    'gpt-4o-mini': { input: 0.15, output: 0.6, provider: 'openai', vision: true, tools: true },
    'gpt-4o-2024-05-13': { input: 5, output: 15, provider: 'openai', vision: true, tools: true },
    // o1 series
    'o1': { input: 15, output: 60, provider: 'openai', vision: true, tools: true },
    'o1-pro': { input: 150, output: 600, provider: 'openai', vision: true, tools: true },
    'o1-mini': { input: 1.1, output: 4.4, provider: 'openai', tools: true },
    // o3 series
    'o3': { input: 2, output: 8, provider: 'openai', tools: true },
    'o3-pro': { input: 20, output: 80, provider: 'openai', tools: true },
    'o3-mini': { input: 1.1, output: 4.4, provider: 'openai', tools: true },
    'o3-deep-research': { input: 10, output: 40, provider: 'openai', tools: true },
    // o4 series
    'o4-mini': { input: 1.1, output: 4.4, provider: 'openai', tools: true },
    'o4-mini-deep-research': { input: 2, output: 8, provider: 'openai', tools: true },
    // Realtime
    'gpt-realtime': { input: 4, output: 16, provider: 'openai', tools: true },
    'gpt-realtime-mini': { input: 0.6, output: 2.4, provider: 'openai', tools: true },
    // Computer use
    'computer-use-preview': { input: 3, output: 12, provider: 'openai', vision: true, tools: true },
    // Image models
    'gpt-image-1.5': { input: 5, output: 10, provider: 'openai' },
    'gpt-image-1': { input: 5, output: 1.25, provider: 'openai' },
    'gpt-image-1-mini': { input: 2, output: 0.2, provider: 'openai' },
    // Legacy
    'gpt-4-turbo-2024-04-09': { input: 10, output: 30, provider: 'openai', vision: true, tools: true },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5, provider: 'openai', tools: true },

    // ========== Anthropic (from official pricing table) ==========
    // Opus family
    'claude-opus-4.5': { input: 5, output: 25, provider: 'anthropic', vision: true, tools: true },
    'claude-opus-4.1': { input: 15, output: 75, provider: 'anthropic', vision: true, tools: true },
    'claude-opus-4': { input: 15, output: 75, provider: 'anthropic', vision: true, tools: true },
    'claude-opus-3': { input: 15, output: 75, provider: 'anthropic', vision: true, tools: true },  // deprecated
    // Sonnet family
    'claude-sonnet-4.5': { input: 3, output: 15, provider: 'anthropic', vision: true, tools: true },
    'claude-sonnet-4': { input: 3, output: 15, provider: 'anthropic', vision: true, tools: true },
    'claude-sonnet-3.7': { input: 3, output: 15, provider: 'anthropic', vision: true, tools: true },  // deprecated
    // Haiku family
    'claude-haiku-4.5': { input: 1, output: 5, provider: 'anthropic', vision: true, tools: true },
    'claude-haiku-3.5': { input: 0.8, output: 4, provider: 'anthropic', vision: true, tools: true },
    'claude-haiku-3': { input: 0.25, output: 1.25, provider: 'anthropic', vision: true, tools: true },

    // ========== Google Gemini (from official pricing page - prices in $/1M tokens) ==========
    // Gemini 3 series
    'gemini-3-pro-preview': { input: 2, output: 12, provider: 'google', vision: true, tools: true },
    'gemini-3-flash-preview': { input: 0.10, output: 0.40, provider: 'google', vision: true, tools: true },
    'gemini-3-pro-image-preview': { input: 2, output: 12, provider: 'google', vision: true },  // images: $120/1M
    // Gemini 2.5 Pro
    'gemini-2.5-pro': { input: 1.25, output: 10, provider: 'google', vision: true, tools: true },  // >200k: $2.50/$15
    'gemini-2.5-pro-preview-tts': { input: 1.25, output: 10, provider: 'google' },
    // Gemini 2.5 Flash
    'gemini-2.5-flash': { input: 0.30, output: 2.50, provider: 'google', vision: true, tools: true },
    'gemini-2.5-flash-preview': { input: 0.30, output: 2.50, provider: 'google', vision: true, tools: true },
    'gemini-2.5-flash-lite': { input: 0.10, output: 0.40, provider: 'google', vision: true, tools: true },
    'gemini-2.5-flash-lite-preview': { input: 0.10, output: 0.40, provider: 'google', vision: true, tools: true },
    'gemini-2.5-flash-native-audio': { input: 1.00, output: 2.50, provider: 'google' },  // audio: $1.00
    'gemini-2.5-flash-image': { input: 0.30, output: 2.50, provider: 'google', vision: true },
    'gemini-2.5-flash-preview-tts': { input: 0.30, output: 2.50, provider: 'google' },
    'gemini-2.5-computer-use-preview': { input: 1.25, output: 10, provider: 'google', vision: true },
    // Gemini 2.0
    'gemini-2.0-flash': { input: 0.10, output: 0.40, provider: 'google', vision: true, tools: true },
    'gemini-2.0-flash-lite': { input: 0.04, output: 0.15, provider: 'google', vision: true, tools: true },
    // Image/Video generation (pricing per image/video, not tokens)
    'imagen-4': { input: 0, output: 0.04, provider: 'google' },          // $0.04/image (standard)
    'imagen-4-fast': { input: 0, output: 0.02, provider: 'google' },     // $0.02/image (fast)
    'imagen-4-ultra': { input: 0, output: 0.06, provider: 'google' },    // $0.06/image (ultra)
    'imagen-3': { input: 0, output: 0.03, provider: 'google' },          // $0.03/image
    'veo-3.1': { input: 0, output: 0.40, provider: 'google' },           // $0.40/video (standard)
    'veo-3.1-fast': { input: 0, output: 0.15, provider: 'google' },      // $0.15/video (fast)
    'veo-3': { input: 0, output: 0.35, provider: 'google' },             // $0.35/video
    'veo-2': { input: 0, output: 0.35, provider: 'google' },             // $0.35/video

    // ========== xAI Grok ==========
    // Grok 4 series
    'grok-4-1-fast-reasoning': { input: 0.2, output: 0.5, provider: 'xai', tools: true },
    'grok-4-1-fast-non-reasoning': { input: 0.2, output: 0.5, provider: 'xai', tools: true },
    'grok-4-fast-reasoning': { input: 0.2, output: 0.5, provider: 'xai', tools: true },
    'grok-4-fast-non-reasoning': { input: 0.2, output: 0.5, provider: 'xai', tools: true },
    'grok-4-0709': { input: 3, output: 15, provider: 'xai', tools: true },
    // Grok 3 series
    'grok-3': { input: 3, output: 15, provider: 'xai', tools: true },
    'grok-3-mini': { input: 0.3, output: 0.5, provider: 'xai', tools: true },
    // Grok 2 series
    'grok-2-vision-1212': { input: 2, output: 10, provider: 'xai', vision: true },
    'grok-2-image-1212': { input: 0, output: 0.07, provider: 'xai' },  // $0.07/image
    // Code
    'grok-code-fast-1': { input: 0.2, output: 1.5, provider: 'xai', tools: true },

    // ========== Groq (from official pricing page) ==========
    // GPT OSS series
    'gpt-oss-20b': { input: 0.075, output: 0.30, provider: 'groq', tools: true },
    'gpt-oss-safeguard-20b': { input: 0.075, output: 0.30, provider: 'groq', tools: true },
    'gpt-oss-120b': { input: 0.15, output: 0.60, provider: 'groq', tools: true },
    // Kimi
    'kimi-k2': { input: 1.00, output: 3.00, provider: 'groq', tools: true },
    // Llama 4
    'llama-4-scout': { input: 0.11, output: 0.34, provider: 'groq', tools: true },
    'llama-4-maverick': { input: 0.20, output: 0.60, provider: 'groq', tools: true },
    'llama-guard-4-12b': { input: 0.20, output: 0.20, provider: 'groq', tools: true },
    // Qwen
    'qwen3-32b': { input: 0.29, output: 0.59, provider: 'groq', tools: true },
    // Llama 3.x
    'llama-3.3-70b-versatile': { input: 0.59, output: 0.79, provider: 'groq', tools: true },
    'llama-3.1-8b-instant': { input: 0.05, output: 0.08, provider: 'groq', tools: true },

    // ========== DeepSeek (from official pricing page) ==========
    'deepseek-chat': { input: 0.28, output: 0.42, provider: 'deepseek', tools: true },      // DeepSeek-V3.2 (Non-thinking)
    'deepseek-reasoner': { input: 0.28, output: 0.42, provider: 'deepseek', tools: true },  // DeepSeek-V3.2 (Thinking Mode)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectProvider(model: string): Provider | null {
    // First check PRICING table (most accurate)
    if (PRICING[model]) return PRICING[model].provider;

    // Groq-specific models (check before gpt- to avoid conflict)
    if (model.startsWith('gpt-oss')) return 'groq';
    if (model.startsWith('kimi')) return 'groq';
    if (model.startsWith('qwen')) return 'groq';
    if (model.startsWith('llama-4')) return 'groq';
    if (model.startsWith('llama-guard')) return 'groq';

    // OpenAI
    if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) return 'openai';
    if (model.startsWith('computer-use')) return 'openai';

    // Anthropic
    if (model.startsWith('claude')) return 'anthropic';

    // Google
    if (model.startsWith('gemini')) return 'google';
    if (model.startsWith('imagen')) return 'google';
    if (model.startsWith('veo')) return 'google';

    // xAI
    if (model.startsWith('grok')) return 'xai';

    // Groq (Meta models)
    if (model.startsWith('llama') || model.startsWith('mixtral') || model.startsWith('gemma')) return 'groq';

    // DeepSeek
    if (model.startsWith('deepseek')) return 'deepseek';

    return null;
}

function getProviderBaseUrl(provider: Provider): string {
    switch (provider) {
        case 'openai': return 'https://api.openai.com/v1';
        case 'anthropic': return 'https://api.anthropic.com/v1';
        case 'google': return 'https://generativelanguage.googleapis.com/v1beta';
        case 'xai': return 'https://api.x.ai/v1';
        case 'groq': return 'https://api.groq.com/openai/v1';
        case 'deepseek': return 'https://api.deepseek.com/v1';
    }
}

function calculateCost(model: string, usage: Usage): Cost {
    const pricing = PRICING[model] || { input: 0, output: 0 };
    const input = (usage.inputTokens / 1_000_000) * pricing.input;
    const output = (usage.outputTokens / 1_000_000) * pricing.output;
    return { input, output, total: input + output };
}

function parseError(text: string, provider: Provider, status: number): AIError {
    let errorMessage = text;
    let code: AIError['code'] = 'API_ERROR';

    try {
        const json = JSON.parse(text);
        errorMessage = json.error?.message || json.message || json.error || text;

        // Check for content filter
        if (errorMessage.toLowerCase().includes('content') && errorMessage.toLowerCase().includes('filter')) {
            code = 'CONTENT_FILTER';
        }
    } catch { }

    if (status === 401 || status === 403) {
        code = 'INVALID_API_KEY';
        errorMessage = 'Invalid API key';
    } else if (status === 429) {
        code = 'RATE_LIMIT';
    } else if (status === 400) {
        code = 'INVALID_REQUEST';
    }

    return { code, message: errorMessage, provider, status };
}

// Convert messages to provider-specific format
function formatMessagesForOpenAI(messages: Message[]): any[] {
    return messages.map(m => {
        if (typeof m.content === 'string') {
            return { role: m.role, content: m.content };
        }
        // Vision support
        const content = m.content.map(c => {
            if (c.type === 'text') {
                return { type: 'text', text: c.text };
            }
            // Image
            const imageUrl = c.url || `data:${c.mimeType || 'image/jpeg'};base64,${c.base64}`;
            return { type: 'image_url', image_url: { url: imageUrl } };
        });
        return { role: m.role, content };
    });
}

function formatToolsForOpenAI(tools: Tool[]): any[] {
    return tools.map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
        },
    }));
}

// ============================================================================
// OPENAI CALLER
// ============================================================================

async function callOpenAI(
    config: ProviderConfig,
    options: ChatOptions,
    providerOverride?: Provider,
): Promise<Result<ChatResult, AIError>> {
    const startTime = Date.now();
    const provider = providerOverride || 'openai';
    const baseUrl = config.baseUrl || getProviderBaseUrl(provider);

    try {
        const body: any = {
            model: options.model,
            messages: formatMessagesForOpenAI(options.messages),
            temperature: options.temperature ?? 0.7,
        };

        if (options.maxTokens) body.max_tokens = options.maxTokens;
        if (options.tools?.length) {
            body.tools = formatToolsForOpenAI(options.tools);
            if (options.toolChoice) {
                body.tool_choice = options.toolChoice === 'auto' ? 'auto'
                    : options.toolChoice === 'none' ? 'none'
                        : { type: 'function', function: { name: options.toolChoice.name } };
            }
        }
        if (options.responseFormat === 'json') {
            body.response_format = { type: 'json_object' };
        }
        if (options.topP !== undefined) body.top_p = options.topP;
        if (options.frequencyPenalty !== undefined) body.frequency_penalty = options.frequencyPenalty;
        if (options.presencePenalty !== undefined) body.presence_penalty = options.presencePenalty;
        if (options.stop?.length) body.stop = options.stop;

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            const error = parseError(text, provider, response.status);
            if (response.status === 429) {
                error.retryAfter = parseInt(response.headers.get('retry-after') || '60');
            }
            return Err(error);
        }

        const data = await response.json() as any;
        const latency = Date.now() - startTime;
        const message = data.choices[0]?.message;

        const usage: Usage = {
            inputTokens: data.usage?.prompt_tokens || 0,
            outputTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
        };

        // Parse tool calls
        let toolCalls: ToolCall[] | undefined;
        if (message?.tool_calls?.length) {
            toolCalls = message.tool_calls.map((tc: any) => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments || '{}'),
            }));
        }

        return Ok({
            content: message?.content || '',
            model: data.model,
            provider,
            usage,
            cost: calculateCost(options.model, usage),
            latency,
            toolCalls,
            finishReason: data.choices[0]?.finish_reason,
        });
    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            return Err({ code: 'TIMEOUT', message: 'Request aborted', provider });
        }
        return Err({ code: 'NETWORK', message: (e as Error).message, provider });
    }
}

// ============================================================================
// ANTHROPIC CALLER
// ============================================================================

// Map SDK model names to Anthropic API model names
const ANTHROPIC_MODEL_MAP: Record<string, string> = {
    'claude-opus-4.5': 'claude-opus-4-5-20250514',
    'claude-opus-4.1': 'claude-opus-4-1-20250414',
    'claude-opus-4': 'claude-opus-4-20250514',
    'claude-opus-3': 'claude-3-opus-latest',
    'claude-sonnet-4.5': 'claude-sonnet-4-5-20250514',
    'claude-sonnet-4': 'claude-sonnet-4-20250514',
    'claude-sonnet-3.7': 'claude-3-5-sonnet-latest',
    'claude-haiku-4.5': 'claude-haiku-4-5-20250514',
    'claude-haiku-3.5': 'claude-3-5-haiku-latest',
    'claude-haiku-3': 'claude-3-haiku-20240307',
};

function getAnthropicModelName(model: string): string {
    return ANTHROPIC_MODEL_MAP[model] || model;
}

async function callAnthropic(
    config: ProviderConfig,
    options: ChatOptions,
): Promise<Result<ChatResult, AIError>> {
    const startTime = Date.now();

    // Extract system and format messages
    const systemContent = options.messages
        .filter(m => m.role === 'system')
        .map(m => typeof m.content === 'string' ? m.content :
            m.content.filter(c => c.type === 'text').map(c => (c as TextContent).text).join('\n'))
        .join('\n');

    const chatMessages = options.messages
        .filter(m => m.role !== 'system')
        .map(m => {
            if (typeof m.content === 'string') {
                return { role: m.role, content: m.content };
            }
            // Vision support
            const content = m.content.map(c => {
                if (c.type === 'text') return { type: 'text', text: c.text };
                // Image for Anthropic
                if (c.base64) {
                    return {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: c.mimeType || 'image/jpeg',
                            data: c.base64,
                        },
                    };
                }
                // URL - need to fetch and convert
                return { type: 'image', source: { type: 'url', url: c.url } };
            });
            return { role: m.role, content };
        });

    try {
        const body: any = {
            model: getAnthropicModelName(options.model),
            max_tokens: options.maxTokens || 4096,
            messages: chatMessages,
            temperature: options.temperature ?? 0.7,
        };

        if (systemContent) body.system = systemContent;

        // Tools
        if (options.tools?.length) {
            body.tools = options.tools.map(t => ({
                name: t.name,
                description: t.description,
                input_schema: t.parameters,
            }));
            if (options.toolChoice) {
                body.tool_choice = options.toolChoice === 'auto' ? { type: 'auto' }
                    : options.toolChoice === 'none' ? { type: 'none' }
                        : { type: 'tool', name: options.toolChoice.name };
            }
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            const error = parseError(text, 'anthropic', response.status);
            if (response.status === 429) {
                error.retryAfter = parseInt(response.headers.get('retry-after') || '60');
            }
            return Err(error);
        }

        const data = await response.json() as any;
        const latency = Date.now() - startTime;

        const usage: Usage = {
            inputTokens: data.usage?.input_tokens || 0,
            outputTokens: data.usage?.output_tokens || 0,
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        };

        // Parse content and tool calls
        let content = '';
        let toolCalls: ToolCall[] | undefined;

        for (const block of data.content || []) {
            if (block.type === 'text') {
                content += block.text;
            } else if (block.type === 'tool_use') {
                if (!toolCalls) toolCalls = [];
                toolCalls.push({
                    id: block.id,
                    name: block.name,
                    arguments: block.input || {},
                });
            }
        }

        return Ok({
            content,
            model: data.model,
            provider: 'anthropic',
            usage,
            cost: calculateCost(options.model, usage),
            latency,
            toolCalls,
            finishReason: data.stop_reason === 'end_turn' ? 'stop'
                : data.stop_reason === 'tool_use' ? 'tool_calls'
                    : data.stop_reason,
        });
    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            return Err({ code: 'TIMEOUT', message: 'Request aborted', provider: 'anthropic' });
        }
        return Err({ code: 'NETWORK', message: (e as Error).message, provider: 'anthropic' });
    }
}

// ============================================================================
// GOOGLE CALLER
// ============================================================================

async function callGoogle(
    config: ProviderConfig,
    options: ChatOptions,
): Promise<Result<ChatResult, AIError>> {
    const startTime = Date.now();

    // Convert messages to Gemini format
    const systemInstruction = options.messages
        .filter(m => m.role === 'system')
        .map(m => typeof m.content === 'string' ? m.content :
            m.content.filter(c => c.type === 'text').map(c => (c as TextContent).text).join('\n'))
        .join('\n');

    const contents = options.messages
        .filter(m => m.role !== 'system')
        .map(m => {
            const parts: any[] = [];
            if (typeof m.content === 'string') {
                parts.push({ text: m.content });
            } else {
                for (const c of m.content) {
                    if (c.type === 'text') {
                        parts.push({ text: c.text });
                    } else {
                        // Image for Gemini
                        if (c.base64) {
                            parts.push({
                                inline_data: {
                                    mime_type: c.mimeType || 'image/jpeg',
                                    data: c.base64,
                                },
                            });
                        }
                    }
                }
            }
            return { role: m.role === 'assistant' ? 'model' : 'user', parts };
        });

    try {
        const body: any = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
            },
        };

        if (options.maxTokens) body.generationConfig.maxOutputTokens = options.maxTokens;
        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        // Tools for Gemini
        if (options.tools?.length) {
            body.tools = [{
                functionDeclarations: options.tools.map(t => ({
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters,
                })),
            }];
        }

        // JSON mode
        if (options.responseFormat === 'json') {
            body.generationConfig.responseMimeType = 'application/json';
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${config.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: options.signal,
            }
        );

        if (!response.ok) {
            const text = await response.text();
            return Err(parseError(text, 'google', response.status));
        }

        const data = await response.json() as any;
        const latency = Date.now() - startTime;

        // Check for blocked content
        if (data.promptFeedback?.blockReason) {
            return Err({
                code: 'CONTENT_FILTER',
                message: `Content blocked: ${data.promptFeedback.blockReason}`,
                provider: 'google',
            });
        }

        const usage: Usage = {
            inputTokens: data.usageMetadata?.promptTokenCount || 0,
            outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata?.totalTokenCount || 0,
        };

        // Parse content and function calls
        let content = '';
        let toolCalls: ToolCall[] | undefined;
        const candidate = data.candidates?.[0];

        for (const part of candidate?.content?.parts || []) {
            if (part.text) {
                content += part.text;
            } else if (part.functionCall) {
                if (!toolCalls) toolCalls = [];
                toolCalls.push({
                    id: `call_${Date.now()}`,
                    name: part.functionCall.name,
                    arguments: part.functionCall.args || {},
                });
            }
        }

        return Ok({
            content,
            model: options.model,
            provider: 'google',
            usage,
            cost: calculateCost(options.model, usage),
            latency,
            toolCalls,
            finishReason: candidate?.finishReason === 'STOP' ? 'stop' : candidate?.finishReason,
        });
    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            return Err({ code: 'TIMEOUT', message: 'Request aborted', provider: 'google' });
        }
        return Err({ code: 'NETWORK', message: (e as Error).message, provider: 'google' });
    }
}

// ============================================================================
// STREAMING
// ============================================================================

async function* streamOpenAI(
    config: ProviderConfig,
    options: ChatOptions,
    providerOverride?: Provider,
): AsyncIterable<StreamChunk> {
    const provider = providerOverride || 'openai';
    const baseUrl = config.baseUrl || getProviderBaseUrl(provider);

    try {
        const body: any = {
            model: options.model,
            messages: formatMessagesForOpenAI(options.messages),
            temperature: options.temperature ?? 0.7,
            stream: true,
        };

        if (options.maxTokens) body.max_tokens = options.maxTokens;
        if (options.tools?.length) {
            body.tools = formatToolsForOpenAI(options.tools);
        }

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            const error = parseError(text, provider, response.status);
            yield { type: 'error', error };
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentToolCall: Partial<ToolCall> | null = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6);
                if (data === '[DONE]') {
                    yield { type: 'done' };
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices[0]?.delta;

                    if (delta?.content) {
                        yield { type: 'text', content: delta.content };
                    }

                    // Handle tool calls
                    if (delta?.tool_calls?.[0]) {
                        const tc = delta.tool_calls[0];
                        if (tc.id) {
                            // New tool call
                            if (currentToolCall) {
                                yield { type: 'tool_call', toolCall: currentToolCall };
                            }
                            currentToolCall = { id: tc.id, name: tc.function?.name, arguments: {} };
                        }
                        if (tc.function?.arguments && currentToolCall) {
                            // Append arguments (streamed as JSON string chunks)
                            const currentArgs = JSON.stringify(currentToolCall.arguments || {});
                            try {
                                currentToolCall.arguments = JSON.parse(
                                    currentArgs.slice(0, -1) + tc.function.arguments + '}'
                                );
                            } catch {
                                // Accumulate string for later parsing
                            }
                        }
                    }

                    // Usage in final chunk
                    if (parsed.usage) {
                        yield {
                            type: 'done',
                            usage: {
                                inputTokens: parsed.usage.prompt_tokens,
                                outputTokens: parsed.usage.completion_tokens,
                                totalTokens: parsed.usage.total_tokens,
                            },
                        };
                    }
                } catch { }
            }
        }

        // Emit final tool call if any
        if (currentToolCall) {
            yield { type: 'tool_call', toolCall: currentToolCall };
        }
        yield { type: 'done' };

    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            yield { type: 'error', error: { code: 'TIMEOUT', message: 'Request aborted', provider } };
        } else {
            yield { type: 'error', error: { code: 'NETWORK', message: (e as Error).message, provider } };
        }
    }
}

async function* streamAnthropic(
    config: ProviderConfig,
    options: ChatOptions,
): AsyncIterable<StreamChunk> {
    const systemContent = options.messages
        .filter(m => m.role === 'system')
        .map(m => typeof m.content === 'string' ? m.content : '')
        .join('\n');

    const chatMessages = options.messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' }));

    try {
        const body: any = {
            model: options.model,
            max_tokens: options.maxTokens || 4096,
            messages: chatMessages,
            temperature: options.temperature ?? 0.7,
            stream: true,
        };

        if (systemContent) body.system = systemContent;
        if (options.tools?.length) {
            body.tools = options.tools.map(t => ({
                name: t.name,
                description: t.description,
                input_schema: t.parameters,
            }));
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            yield { type: 'error', error: parseError(text, 'anthropic', response.status) };
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentToolCall: Partial<ToolCall> | null = null;
        let toolInputJson = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                try {
                    const event = JSON.parse(line.slice(6));

                    if (event.type === 'content_block_start') {
                        if (event.content_block?.type === 'tool_use') {
                            currentToolCall = {
                                id: event.content_block.id,
                                name: event.content_block.name,
                            };
                            toolInputJson = '';
                        }
                    } else if (event.type === 'content_block_delta') {
                        if (event.delta?.type === 'text_delta') {
                            yield { type: 'text', content: event.delta.text };
                        } else if (event.delta?.type === 'input_json_delta') {
                            toolInputJson += event.delta.partial_json;
                        }
                    } else if (event.type === 'content_block_stop') {
                        if (currentToolCall) {
                            try {
                                currentToolCall.arguments = JSON.parse(toolInputJson);
                            } catch { }
                            yield { type: 'tool_call', toolCall: currentToolCall };
                            currentToolCall = null;
                        }
                    } else if (event.type === 'message_delta') {
                        if (event.usage) {
                            yield {
                                type: 'done',
                                usage: {
                                    inputTokens: event.usage.input_tokens || 0,
                                    outputTokens: event.usage.output_tokens || 0,
                                    totalTokens: (event.usage.input_tokens || 0) + (event.usage.output_tokens || 0),
                                },
                            };
                        }
                    } else if (event.type === 'message_stop') {
                        yield { type: 'done' };
                        return;
                    }
                } catch { }
            }
        }

        yield { type: 'done' };

    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            yield { type: 'error', error: { code: 'TIMEOUT', message: 'Request aborted', provider: 'anthropic' } };
        } else {
            yield { type: 'error', error: { code: 'NETWORK', message: (e as Error).message, provider: 'anthropic' } };
        }
    }
}

async function* streamGoogle(
    config: ProviderConfig,
    options: ChatOptions,
): AsyncIterable<StreamChunk> {
    const systemInstruction = options.messages
        .filter(m => m.role === 'system')
        .map(m => typeof m.content === 'string' ? m.content : '')
        .join('\n');

    const contents = options.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof m.content === 'string' ? m.content : '' }],
        }));

    try {
        const body: any = {
            contents,
            generationConfig: { temperature: options.temperature ?? 0.7 },
        };

        if (options.maxTokens) body.generationConfig.maxOutputTokens = options.maxTokens;
        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:streamGenerateContent?key=${config.apiKey}&alt=sse`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: options.signal,
            }
        );

        if (!response.ok) {
            const text = await response.text();
            yield { type: 'error', error: parseError(text, 'google', response.status) };
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                try {
                    const data = JSON.parse(line.slice(6));
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        yield { type: 'text', content: text };
                    }

                    if (data.usageMetadata) {
                        yield {
                            type: 'done',
                            usage: {
                                inputTokens: data.usageMetadata.promptTokenCount || 0,
                                outputTokens: data.usageMetadata.candidatesTokenCount || 0,
                                totalTokens: data.usageMetadata.totalTokenCount || 0,
                            },
                        };
                    }
                } catch { }
            }
        }

        yield { type: 'done' };

    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            yield { type: 'error', error: { code: 'TIMEOUT', message: 'Request aborted', provider: 'google' } };
        } else {
            yield { type: 'error', error: { code: 'NETWORK', message: (e as Error).message, provider: 'google' } };
        }
    }
}

// ============================================================================
// CHAT REQUEST BUILDER (Fluent API)
// ============================================================================

export class ChatRequest {
    private _model: string;
    private _messages: Message[] = [];
    private _maxTokens?: number;
    private _temperature?: number;
    private _topP?: number;
    private _frequencyPenalty?: number;
    private _presencePenalty?: number;
    private _stop?: string[];
    private _tools?: Tool[];
    private _toolChoice?: 'auto' | 'none' | { name: string };
    private _responseFormat?: 'text' | 'json';
    private _timeout?: number;
    private _signal?: AbortSignal;
    private _config: AIConfig;

    constructor(model: string, config: AIConfig) {
        this._model = model;
        this._config = config;

        // Apply global defaults (can be overridden per-request)
        if (config.defaults) {
            this._temperature = config.defaults.temperature;
            this._maxTokens = config.defaults.maxTokens;
            this._topP = config.defaults.topP;
            this._frequencyPenalty = config.defaults.frequencyPenalty;
            this._presencePenalty = config.defaults.presencePenalty;
            this._stop = config.defaults.stop;
            this._timeout = config.defaults.timeout;
            this._responseFormat = config.defaults.responseFormat;
        }
    }

    system(content: string): this {
        this._messages.push({ role: 'system', content });
        return this;
    }

    user(content: MessageContent): this {
        this._messages.push({ role: 'user', content });
        return this;
    }

    assistant(content: string): this {
        this._messages.push({ role: 'assistant', content });
        return this;
    }

    messages(msgs: Message[]): this {
        this._messages = msgs;
        return this;
    }

    maxTokens(n: number): this {
        this._maxTokens = n;
        return this;
    }

    temperature(t: number): this {
        this._temperature = t;
        return this;
    }

    tools(tools: Tool[]): this {
        this._tools = tools;
        return this;
    }

    toolChoice(choice: 'auto' | 'none' | { name: string }): this {
        this._toolChoice = choice;
        return this;
    }

    json(): this {
        this._responseFormat = 'json';
        return this;
    }

    responseFormat(format: 'text' | 'json'): this {
        this._responseFormat = format;
        return this;
    }

    topP(value: number): this {
        this._topP = value;
        return this;
    }

    frequencyPenalty(value: number): this {
        this._frequencyPenalty = value;
        return this;
    }

    presencePenalty(value: number): this {
        this._presencePenalty = value;
        return this;
    }

    stop(sequences: string[]): this {
        this._stop = sequences;
        return this;
    }

    timeout(ms: number): this {
        this._timeout = ms;
        return this;
    }

    signal(signal: AbortSignal): this {
        this._signal = signal;
        return this;
    }

    /** Add an image by URL */
    image(url: string): this {
        const lastMsg = this._messages[this._messages.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
            if (typeof lastMsg.content === 'string') {
                lastMsg.content = [
                    { type: 'text', text: lastMsg.content },
                    { type: 'image', url }
                ];
            } else if (Array.isArray(lastMsg.content)) {
                (lastMsg.content as (TextContent | ImageContent)[]).push({ type: 'image', url });
            }
        }
        return this;
    }

    /** Add an image by base64 data */
    imageBase64(base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/png'): this {
        const lastMsg = this._messages[this._messages.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
            if (typeof lastMsg.content === 'string') {
                lastMsg.content = [
                    { type: 'text', text: lastMsg.content },
                    { type: 'image', base64, mimeType }
                ];
            } else if (Array.isArray(lastMsg.content)) {
                (lastMsg.content as (TextContent | ImageContent)[]).push({ type: 'image', base64, mimeType });
            }
        }
        return this;
    }

    estimateCost(): { inputCost: number; model: string; provider: Provider | null } {
        const provider = detectProvider(this._model);
        const pricing = PRICING[this._model] || { input: 0, output: 0 };
        const estimatedTokens = this._messages.reduce((sum, m) => {
            const content = typeof m.content === 'string' ? m.content :
                m.content.map(c => c.type === 'text' ? c.text : '[image]').join('');
            return sum + content.length / 4;
        }, 0);
        return { inputCost: (estimatedTokens / 1_000_000) * pricing.input, model: this._model, provider };
    }

    async send(): Promise<Result<ChatResult, AIError>> {
        const provider = detectProvider(this._model);

        if (!provider) {
            return Err({ code: 'INVALID_MODEL', message: `Unknown model: ${this._model}` });
        }

        const providerConfig = this._config.providers?.[provider];

        if (!providerConfig?.apiKey) {
            return Err({ code: 'NO_API_KEY', message: `No API key for: ${provider}`, provider });
        }

        const options: ChatOptions = {
            model: this._model,
            messages: this._messages,
            maxTokens: this._maxTokens,
            temperature: this._temperature,
            topP: this._topP,
            frequencyPenalty: this._frequencyPenalty,
            presencePenalty: this._presencePenalty,
            stop: this._stop,
            tools: this._tools,
            toolChoice: this._toolChoice,
            responseFormat: this._responseFormat,
            timeout: this._timeout,
            signal: this._signal,
        };

        if (this._config.debug) {
            console.log(`[AI] ${provider}/${this._model}...`);
        }

        let result: Result<ChatResult, AIError>;

        switch (provider) {
            case 'openai':
                result = await callOpenAI(providerConfig, options);
                break;
            case 'anthropic':
                result = await callAnthropic(providerConfig, options);
                break;
            case 'google':
                result = await callGoogle(providerConfig, options);
                break;
            case 'xai':
            case 'groq':
            case 'deepseek':
                result = await callOpenAI(providerConfig, options, provider);
                break;
            default:
                return Err({ code: 'INVALID_MODEL', message: `Unsupported: ${provider}` });
        }

        if (this._config.debug && result.ok) {
            console.log(`[AI] ✓ ${result.data.latency}ms | $${result.data.cost.total.toFixed(6)}`);
        }

        return result;
    }

    async *stream(): AsyncIterable<StreamChunk> {
        const provider = detectProvider(this._model);

        if (!provider) {
            yield { type: 'error', error: { code: 'INVALID_MODEL', message: `Unknown model: ${this._model}` } };
            return;
        }

        const providerConfig = this._config.providers?.[provider];

        if (!providerConfig?.apiKey) {
            yield { type: 'error', error: { code: 'NO_API_KEY', message: `No API key for: ${provider}`, provider } };
            return;
        }

        const options: ChatOptions = {
            model: this._model,
            messages: this._messages,
            maxTokens: this._maxTokens,
            temperature: this._temperature,
            tools: this._tools,
            stream: true,
        };

        switch (provider) {
            case 'openai':
            case 'xai':
            case 'groq':
            case 'deepseek':
                yield* streamOpenAI(providerConfig, options, provider);
                break;
            case 'anthropic':
                yield* streamAnthropic(providerConfig, options);
                break;
            case 'google':
                yield* streamGoogle(providerConfig, options);
                break;
        }
    }
}

// ============================================================================
// MODEL ALIASES - Solve "which model should I use?"
// ============================================================================

const MODEL_ALIASES: Record<string, string> = {
    // Speed-optimized (low latency)
    'fast': 'gemini-2.5-flash-lite',      // $0.10/$0.40 - fast & cheap
    'fastest': 'llama-3.1-8b-instant',    // $0.05/$0.08 - Groq ultra low latency
    'turbo': 'grok-4-1-fast-reasoning',   // $0.20/$0.50 - xAI fast

    // Quality-optimized (best results)
    'best': 'claude-opus-4.5',            // $5/$25 - top quality
    'smartest': 'gpt-5.2-pro',            // $21/$168 - most capable
    'pro': 'gpt-5.2-pro',                 // $21/$168 - premium

    // Cost-optimized
    'cheap': 'gpt-4o-mini',               // $0.15/$0.60 - good balance
    'cheapest': 'llama-3.1-8b-instant',   // $0.05/$0.08 - lowest cost
    'free': 'gemini-2.5-flash',           // Free tier available
    'mini': 'gpt-5-nano',                 // $0.05/$0.40 - smallest

    // Balanced (quality/cost trade-off)
    'default': 'gpt-4o',                  // $2.5/$10 - mainstream choice
    'balanced': 'claude-sonnet-4',        // $3/$15 - balanced

    // Specific use cases
    'code': 'gpt-5.1-codex',              // $1.25/$10 - optimized for code
    'coding': 'grok-code-fast-1',         // $0.20/$1.50 - fast code
    'vision': 'gpt-4o',                   // $2.5/$10 - best vision
    'image': 'imagen-4',                  // $0.04/image - image gen
    'video': 'veo-3.1',                   // $0.40/video - video gen
    'long': 'gemini-2.5-pro',             // $1.25/$10 - 1M+ context
    'reasoning': 'o3',                    // $2/$8 - reasoning model
    'thinking': 'o1',                     // $15/$60 - deep thinking
};

function resolveModelAlias(model: string): string {
    return MODEL_ALIASES[model.toLowerCase()] || model;
}

// ============================================================================
// AUTO ENV DETECTION - Zero config setup
// ============================================================================

const ENV_KEYS: Record<Provider, string[]> = {
    openai: ['OPENAI_API_KEY', 'OPENAI_KEY'],
    anthropic: ['ANTHROPIC_API_KEY', 'ANTHROPIC_KEY', 'CLAUDE_API_KEY'],
    google: ['GOOGLE_AI_KEY', 'GOOGLE_API_KEY', 'GEMINI_API_KEY'],
    xai: ['XAI_API_KEY', 'GROK_API_KEY'],
    groq: ['GROQ_API_KEY'],
    deepseek: ['DEEPSEEK_API_KEY'],
};

function autoDetectProviders(): Partial<Record<Provider, ProviderConfig>> {
    const providers: Partial<Record<Provider, ProviderConfig>> = {};

    for (const [provider, keys] of Object.entries(ENV_KEYS)) {
        for (const key of keys) {
            const value = process.env[key];
            if (value) {
                providers[provider as Provider] = { apiKey: value };
                break;
            }
        }
    }

    return providers;
}

// ============================================================================
// MAIN AI CLASS - Enhanced with outstanding features
// ============================================================================

export interface AIConfig extends BaseAIConfig {
    /** Auto-detect API keys from environment variables */
    autoDetect?: boolean;
    /** Maximum cost per request (USD) */
    maxCostPerRequest?: number;
    /** Maximum total cost for this session (USD) */
    budgetLimit?: number;
    /** Auto-retry failed requests with exponential backoff */
    retry?: boolean | { maxAttempts?: number; initialDelay?: number };
    /** Fallback chain: try providers in order if one fails */
    fallback?: string[];
    /** Log all requests and responses */
    logging?: boolean | 'verbose';
    /** Track costs to local file (default: true) */
    trackCosts?: boolean;
    /** Custom path for cost analytics file */
    costFilePath?: string;

    /** Global defaults for all requests (can be overridden per-request) */
    defaults?: {
        /** Default temperature (0.0 - 2.0) */
        temperature?: number;
        /** Default max output tokens */
        maxTokens?: number;
        /** Default top_p (nucleus sampling) */
        topP?: number;
        /** Default frequency penalty (-2.0 to 2.0) */
        frequencyPenalty?: number;
        /** Default presence penalty (-2.0 to 2.0) */
        presencePenalty?: number;
        /** Default stop sequences */
        stop?: string[];
        /** Default request timeout (ms) */
        timeout?: number;
        /** Default response format */
        responseFormat?: 'text' | 'json';
    };

    /** Custom model aliases (override or add to defaults) */
    aliases?: Record<string, string>;
}

export class AI {
    private config: AIConfig;
    private _totalCost = 0;
    private _requestCount = 0;
    private _providers: Partial<Record<Provider, ProviderConfig>>;
    private _aliases: Record<string, string>;

    constructor(config: AIConfig = {}) {
        // Auto-detect if no providers specified or autoDetect is true
        const shouldAutoDetect = config.autoDetect !== false &&
            (!config.providers || Object.keys(config.providers).length === 0);

        this._providers = shouldAutoDetect
            ? { ...autoDetectProviders(), ...config.providers }
            : config.providers || {};

        // Merge custom aliases with defaults (custom overrides)
        this._aliases = { ...MODEL_ALIASES, ...config.aliases };

        this.config = {
            ...config,
            providers: this._providers,
        };

        // Log detected providers
        if (config.debug || config.logging) {
            const detected = Object.keys(this._providers);
            console.log(`[AI] Detected providers: ${detected.join(', ') || 'none'}`);
        }
    }

    /** 
     * Start a chat request 
     * @param model - Model name OR alias: 'fast', 'best', 'cheap', 'code', 'vision'
     */
    chat(model: string): ChatRequest {
        const resolvedModel = this._resolveAlias(model);
        const request = new ChatRequest(resolvedModel, {
            ...this.config,
            providers: this._providers,
        });
        return request;
    }

    /** Resolve alias using instance aliases (custom + defaults) */
    private _resolveAlias(model: string): string {
        const lower = model.toLowerCase();
        return this._aliases[lower] || model;
    }

    /**
     * Quick one-liner with all enhancements
     */
    async ask(
        model: string,
        prompt: string,
        options?: { maxCost?: number }
    ): Promise<Result<ChatResult, AIError>> {
        const resolvedModel = this._resolveAlias(model);

        // Pre-check cost estimate
        if (options?.maxCost || this.config.maxCostPerRequest) {
            const maxCost = options?.maxCost || this.config.maxCostPerRequest!;
            const estimate = this.chat(resolvedModel).user(prompt).estimateCost();
            if (estimate.inputCost > maxCost) {
                return Err({
                    code: 'INVALID_REQUEST',
                    message: `Estimated cost $${estimate.inputCost.toFixed(4)} exceeds max $${maxCost}`,
                });
            }
        }

        // Check budget
        if (this.config.budgetLimit && this._totalCost >= this.config.budgetLimit) {
            return Err({
                code: 'INVALID_REQUEST',
                message: `Budget limit reached: $${this._totalCost.toFixed(4)} / $${this.config.budgetLimit}`,
            });
        }

        // Execute with retry if enabled
        const result = await this._executeWithRetry(resolvedModel, prompt);

        if (result.ok) {
            this._totalCost += result.data.cost.total;
            this._requestCount++;

            // Track to persistent storage if enabled
            if (this.config.trackCosts !== false) {
                getCostTracker().track(
                    result.data.model,
                    result.data.provider,
                    result.data.usage,
                    result.data.cost
                );
            }

            if (this.config.logging === 'verbose') {
                console.log(`[AI] ${result.data.provider}/${result.data.model}`);
                console.log(`[AI] Latency: ${result.data.latency}ms`);
                console.log(`[AI] Cost: $${result.data.cost.total.toFixed(6)}`);
                console.log(`[AI] Tokens: ${result.data.usage.totalTokens}`);
            }
        }

        return result;
    }

    private async _executeWithRetry(
        model: string,
        prompt: string
    ): Promise<Result<ChatResult, AIError>> {
        const retryConfig = this.config.retry;
        const maxAttempts = typeof retryConfig === 'object'
            ? retryConfig.maxAttempts || 3
            : retryConfig ? 3 : 1;
        const initialDelay = typeof retryConfig === 'object'
            ? retryConfig.initialDelay || 1000
            : 1000;

        let lastError: AIError | null = null;

        // Try with fallback chain if configured
        const models = this.config.fallback
            ? [model, ...this.config.fallback.map(m => resolveModelAlias(m))]
            : [model];

        for (const tryModel of models) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                const result = await this.chat(tryModel).user(prompt).send();

                if (result.ok) {
                    return result;
                }

                lastError = result.error;

                // Don't retry certain errors
                if (['NO_API_KEY', 'INVALID_API_KEY', 'INVALID_MODEL', 'CONTENT_FILTER', 'INVALID_REQUEST'].includes(result.error.code)) {
                    if (this.config.debug) {
                        console.log(`[AI] ${tryModel}: ${result.error.code} - trying next`);
                    }
                    break; // Try next model in fallback chain
                }

                // Retry with backoff for transient errors
                if (attempt < maxAttempts && retryConfig) {
                    const delay = result.error.code === 'RATE_LIMIT' && result.error.retryAfter
                        ? result.error.retryAfter * 1000
                        : initialDelay * Math.pow(2, attempt - 1);

                    if (this.config.debug) {
                        console.log(`[AI] Retry ${attempt}/${maxAttempts} after ${delay}ms`);
                    }

                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        return Err(lastError || { code: 'API_ERROR', message: 'All attempts failed' });
    }

    /** Get pricing for a model (or alias) */
    pricing(model: string): PricingEntry | null {
        const resolved = resolveModelAlias(model);
        return PRICING[resolved] || null;
    }

    /** List all known models */
    models(): string[] {
        return Object.keys(PRICING);
    }

    /** List default model aliases (use .aliases getter for current aliases) */
    getDefaultAliases(): Record<string, string> {
        return { ...MODEL_ALIASES };
    }

    /** List models for a specific provider */
    modelsFor(provider: Provider): string[] {
        return Object.entries(PRICING)
            .filter(([_, p]) => p.provider === provider)
            .map(([model]) => model);
    }

    /** List models that support vision */
    modelsWithVision(): string[] {
        return Object.entries(PRICING)
            .filter(([_, p]) => p.vision)
            .map(([model]) => model);
    }

    /** List models that support tools */
    modelsWithTools(): string[] {
        return Object.entries(PRICING)
            .filter(([_, p]) => p.tools)
            .map(([model]) => model);
    }

    /** Check which providers are configured */
    availableProviders(): Provider[] {
        return Object.keys(this._providers) as Provider[];
    }

    /** Total cost of all requests */
    get totalCost(): number {
        return this._totalCost;
    }

    /** Total number of requests */
    get requestCount(): number {
        return this._requestCount;
    }

    /** Remaining budget (if budgetLimit set) */
    get remainingBudget(): number | null {
        return this.config.budgetLimit
            ? this.config.budgetLimit - this._totalCost
            : null;
    }

    /** Reset cost tracking */
    resetCost(): void {
        this._totalCost = 0;
        this._requestCount = 0;
    }

    /** Get current aliases (default + custom) */
    get aliases(): Record<string, string> {
        return { ...this._aliases };
    }

    /** Set/override a single alias */
    setAlias(alias: string, model: string): void {
        this._aliases[alias.toLowerCase()] = model;
    }

    /** Set multiple aliases at once */
    setAliases(aliases: Record<string, string>): void {
        for (const [alias, model] of Object.entries(aliases)) {
            this._aliases[alias.toLowerCase()] = model;
        }
    }

    /** Get the resolved model for an alias */
    resolveAlias(alias: string): string {
        return this._resolveAlias(alias);
    }
}

// ============================================================================
// COST ANALYTICS - Track daily costs locally
// ============================================================================

interface CostEntry {
    timestamp: string;
    model: string;
    provider: Provider;
    inputTokens: number;
    outputTokens: number;
    cost: number;
}

interface DailyCost {
    date: string;
    totalCost: number;
    requestCount: number;
    byModel: Record<string, { cost: number; count: number }>;
    byProvider: Record<string, { cost: number; count: number }>;
    entries: CostEntry[];
}

interface CostAnalytics {
    version: string;
    lastUpdated: string;
    totalCost: number;
    dailyCosts: Record<string, DailyCost>;
}

export class CostTracker {
    private filePath: string;
    private data: CostAnalytics;
    private autoSave: boolean;

    constructor(options: { filePath?: string; autoSave?: boolean } = {}) {
        this.filePath = options.filePath || '.ai-costs.json';
        this.autoSave = options.autoSave ?? true;
        this.data = this.load();
    }

    /** Load analytics from file */
    private load(): CostAnalytics {
        try {
            // Node.js only - use fs
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                if (fs.existsSync(this.filePath)) {
                    return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
                }
            }
        } catch { /* ignore */ }

        return {
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            totalCost: 0,
            dailyCosts: {},
        };
    }

    /** Save analytics to file */
    save(): void {
        try {
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                this.data.lastUpdated = new Date().toISOString();
                fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            }
        } catch { /* ignore in browser */ }
    }

    /** Track a cost entry */
    track(model: string, provider: Provider, usage: Usage, cost: Cost): void {
        const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD

        if (!this.data.dailyCosts[today]) {
            this.data.dailyCosts[today] = {
                date: today,
                totalCost: 0,
                requestCount: 0,
                byModel: {},
                byProvider: {},
                entries: [],
            };
        }

        const daily = this.data.dailyCosts[today];

        // Update totals
        daily.totalCost += cost.total;
        daily.requestCount += 1;
        this.data.totalCost += cost.total;

        // By model
        if (!daily.byModel[model]) daily.byModel[model] = { cost: 0, count: 0 };
        daily.byModel[model].cost += cost.total;
        daily.byModel[model].count += 1;

        // By provider
        if (!daily.byProvider[provider]) daily.byProvider[provider] = { cost: 0, count: 0 };
        daily.byProvider[provider].cost += cost.total;
        daily.byProvider[provider].count += 1;

        // Add entry
        daily.entries.push({
            timestamp: new Date().toISOString(),
            model,
            provider,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            cost: cost.total,
        });

        if (this.autoSave) this.save();
    }

    /** Get today's cost */
    get today(): number {
        const today = new Date().toISOString().split('T')[0];
        return this.data.dailyCosts[today]?.totalCost || 0;
    }

    /** Get cost for a specific date (YYYY-MM-DD) */
    getDate(date: string): DailyCost | null {
        return this.data.dailyCosts[date] || null;
    }

    /** Get cost for last N days */
    getLastDays(days: number): { date: string; cost: number; requests: number }[] {
        const result: { date: string; cost: number; requests: number }[] = [];
        const now = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const daily = this.data.dailyCosts[dateStr];
            result.push({
                date: dateStr,
                cost: daily?.totalCost || 0,
                requests: daily?.requestCount || 0,
            });
        }

        return result;
    }

    /** Get this week's cost (last 7 days) */
    get thisWeek(): number {
        return this.getLastDays(7).reduce((sum, d) => sum + d.cost, 0);
    }

    /** Get this month's cost (last 30 days) */
    get thisMonth(): number {
        return this.getLastDays(30).reduce((sum, d) => sum + d.cost, 0);
    }

    /** Get total cost all time */
    get total(): number {
        return this.data.totalCost;
    }

    /** Get summary report */
    summary(): {
        today: number;
        thisWeek: number;
        thisMonth: number;
        total: number;
        topModels: { model: string; cost: number }[];
        topProviders: { provider: string; cost: number }[];
    } {
        // Aggregate by model and provider across all days
        const modelCosts: Record<string, number> = {};
        const providerCosts: Record<string, number> = {};

        Object.values(this.data.dailyCosts).forEach(daily => {
            Object.entries(daily.byModel).forEach(([model, data]) => {
                modelCosts[model] = (modelCosts[model] || 0) + data.cost;
            });
            Object.entries(daily.byProvider).forEach(([provider, data]) => {
                providerCosts[provider] = (providerCosts[provider] || 0) + data.cost;
            });
        });

        const topModels = Object.entries(modelCosts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([model, cost]) => ({ model, cost }));

        const topProviders = Object.entries(providerCosts)
            .sort((a, b) => b[1] - a[1])
            .map(([provider, cost]) => ({ provider, cost }));

        return {
            today: this.today,
            thisWeek: this.thisWeek,
            thisMonth: this.thisMonth,
            total: this.total,
            topModels,
            topProviders,
        };
    }

    /** Clear all data */
    clear(): void {
        this.data = {
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            totalCost: 0,
            dailyCosts: {},
        };
        if (this.autoSave) this.save();
    }

    /** Print formatted report to console */
    printReport(): void {
        const s = this.summary();
        console.log('\n📊 AI Cost Analytics Report');
        console.log('═'.repeat(40));
        console.log(`📅 Today:      $${s.today.toFixed(4)}`);
        console.log(`📆 This Week:  $${s.thisWeek.toFixed(4)}`);
        console.log(`📅 This Month: $${s.thisMonth.toFixed(4)}`);
        console.log(`💰 All Time:   $${s.total.toFixed(4)}`);

        if (s.topModels.length) {
            console.log('\n🏆 Top Models:');
            s.topModels.forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.model}: $${m.cost.toFixed(4)}`);
            });
        }

        if (s.topProviders.length) {
            console.log('\n🏢 By Provider:');
            s.topProviders.forEach(p => {
                console.log(`   • ${p.provider}: $${p.cost.toFixed(4)}`);
            });
        }
        console.log('═'.repeat(40) + '\n');
    }
}

// Global cost tracker instance
let globalCostTracker: CostTracker | null = null;

export function getCostTracker(options?: { filePath?: string }): CostTracker {
    if (!globalCostTracker) {
        globalCostTracker = new CostTracker(options);
    }
    return globalCostTracker;
}

// ============================================================================
// CONVENIENCE FUNCTIONS - Zero config usage
// ============================================================================

let defaultInstance: AI | null = null;

/** Get or create the default AI instance (auto-detects env vars) */
export function getAI(config?: AIConfig): AI {
    if (!defaultInstance || config) {
        defaultInstance = new AI(config);
    }
    return defaultInstance;
}

/** Quick ask with auto-config (zero setup!) */
export async function ask(
    model: string,
    prompt: string
): Promise<Result<ChatResult, AIError>> {
    return getAI().ask(model, prompt);
}

/** Quick chat builder with auto-config */
export function chat(model: string): ChatRequest {
    return getAI().chat(model);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AI;
export {
    PRICING,
    detectProvider,
    resolveModelAlias,
    MODEL_ALIASES,
    autoDetectProviders,
    Ok,
    Err
};
export type { PricingEntry };

