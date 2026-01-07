/**
 * @aitofy/ai-chat - Unit Tests
 * 
 * These tests DON'T call real APIs - they test internal logic only.
 * Run once to verify, then skip to save API costs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AI, {
    PRICING,
    detectProvider,
    resolveModelAlias,
    MODEL_ALIASES,
    CostTracker,
    getCostTracker,
    Ok,
    Err,
} from '../src/index';

// ============================================================================
// PRICING DATA TESTS
// ============================================================================

describe('PRICING', () => {
    it('should have correct OpenAI models', () => {
        expect(PRICING['gpt-4o']).toBeDefined();
        expect(PRICING['gpt-4o'].provider).toBe('openai');
        expect(PRICING['gpt-4o'].input).toBe(2.5);
        expect(PRICING['gpt-4o'].output).toBe(10);

        expect(PRICING['gpt-5.2']).toBeDefined();
        expect(PRICING['gpt-5.2-pro']).toBeDefined();
        expect(PRICING['o1']).toBeDefined();
        expect(PRICING['o3']).toBeDefined();
    });

    it('should have correct Anthropic models', () => {
        expect(PRICING['claude-sonnet-4']).toBeDefined();
        expect(PRICING['claude-sonnet-4'].provider).toBe('anthropic');
        expect(PRICING['claude-sonnet-4'].input).toBe(3);
        expect(PRICING['claude-sonnet-4'].output).toBe(15);

        expect(PRICING['claude-opus-4.5']).toBeDefined();
        expect(PRICING['claude-haiku-3.5']).toBeDefined();
    });

    it('should have correct Google models', () => {
        expect(PRICING['gemini-2.5-flash']).toBeDefined();
        expect(PRICING['gemini-2.5-flash'].provider).toBe('google');
        expect(PRICING['gemini-2.5-flash'].input).toBe(0.30);
        expect(PRICING['gemini-2.5-flash'].output).toBe(2.50);

        expect(PRICING['gemini-2.5-pro']).toBeDefined();
        expect(PRICING['imagen-4']).toBeDefined();
        expect(PRICING['veo-3.1']).toBeDefined();
    });

    it('should have correct xAI models', () => {
        expect(PRICING['grok-3']).toBeDefined();
        expect(PRICING['grok-3'].provider).toBe('xai');
        expect(PRICING['grok-4-1-fast-reasoning']).toBeDefined();
    });

    it('should have correct Groq models', () => {
        expect(PRICING['llama-3.3-70b-versatile']).toBeDefined();
        expect(PRICING['llama-3.3-70b-versatile'].provider).toBe('groq');
        expect(PRICING['llama-3.3-70b-versatile'].input).toBe(0.59);
        expect(PRICING['llama-3.3-70b-versatile'].output).toBe(0.79);

        expect(PRICING['llama-3.1-8b-instant']).toBeDefined();
        expect(PRICING['qwen3-32b']).toBeDefined();
    });

    it('should have correct DeepSeek models', () => {
        expect(PRICING['deepseek-chat']).toBeDefined();
        expect(PRICING['deepseek-chat'].provider).toBe('deepseek');
        expect(PRICING['deepseek-chat'].input).toBe(0.28);
        expect(PRICING['deepseek-chat'].output).toBe(0.42);

        expect(PRICING['deepseek-reasoner']).toBeDefined();
    });

    it('should have at least 90 models', () => {
        const modelCount = Object.keys(PRICING).length;
        expect(modelCount).toBeGreaterThanOrEqual(90);
    });

    it('should have valid pricing for all models', () => {
        for (const [model, entry] of Object.entries(PRICING)) {
            expect(entry.input).toBeGreaterThanOrEqual(0);
            expect(entry.output).toBeGreaterThanOrEqual(0);
            expect(['openai', 'anthropic', 'google', 'xai', 'groq', 'deepseek']).toContain(entry.provider);
        }
    });
});

// ============================================================================
// DETECT PROVIDER TESTS
// ============================================================================

describe('detectProvider', () => {
    it('should detect OpenAI models', () => {
        expect(detectProvider('gpt-4o')).toBe('openai');
        expect(detectProvider('gpt-5.2')).toBe('openai');
        expect(detectProvider('o1')).toBe('openai');
        expect(detectProvider('o3-pro')).toBe('openai');
        expect(detectProvider('o4-mini')).toBe('openai');
    });

    it('should detect Anthropic models', () => {
        expect(detectProvider('claude-sonnet-4')).toBe('anthropic');
        expect(detectProvider('claude-opus-4.5')).toBe('anthropic');
        expect(detectProvider('claude-haiku-3')).toBe('anthropic');
    });

    it('should detect Google models', () => {
        expect(detectProvider('gemini-2.5-flash')).toBe('google');
        expect(detectProvider('gemini-3-pro-preview')).toBe('google');
        expect(detectProvider('imagen-4')).toBe('google');
        expect(detectProvider('veo-3.1')).toBe('google');
    });

    it('should detect xAI models', () => {
        expect(detectProvider('grok-3')).toBe('xai');
        expect(detectProvider('grok-4-1-fast-reasoning')).toBe('xai');
    });

    it('should detect Groq models correctly (gpt-oss should be groq, not openai)', () => {
        expect(detectProvider('gpt-oss-20b')).toBe('groq');
        expect(detectProvider('gpt-oss-120b')).toBe('groq');
        expect(detectProvider('llama-3.3-70b-versatile')).toBe('groq');
        expect(detectProvider('llama-4-scout')).toBe('groq');
        expect(detectProvider('qwen3-32b')).toBe('groq');
        expect(detectProvider('kimi-k2')).toBe('groq');
    });

    it('should detect DeepSeek models', () => {
        expect(detectProvider('deepseek-chat')).toBe('deepseek');
        expect(detectProvider('deepseek-reasoner')).toBe('deepseek');
    });

    it('should return null for unknown models', () => {
        expect(detectProvider('unknown-model')).toBeNull();
        expect(detectProvider('some-random-thing')).toBeNull();
    });
});

// ============================================================================
// MODEL ALIASES TESTS
// ============================================================================

describe('MODEL_ALIASES', () => {
    it('should have speed-optimized aliases', () => {
        expect(MODEL_ALIASES['fast']).toBeDefined();
        expect(MODEL_ALIASES['fastest']).toBeDefined();
        expect(MODEL_ALIASES['turbo']).toBeDefined();
    });

    it('should have quality-optimized aliases', () => {
        expect(MODEL_ALIASES['best']).toBeDefined();
        expect(MODEL_ALIASES['smartest']).toBeDefined();
        expect(MODEL_ALIASES['pro']).toBeDefined();
    });

    it('should have cost-optimized aliases', () => {
        expect(MODEL_ALIASES['cheap']).toBeDefined();
        expect(MODEL_ALIASES['cheapest']).toBeDefined();
        expect(MODEL_ALIASES['free']).toBeDefined();
        expect(MODEL_ALIASES['mini']).toBeDefined();
    });

    it('should have use-case aliases', () => {
        expect(MODEL_ALIASES['code']).toBeDefined();
        expect(MODEL_ALIASES['vision']).toBeDefined();
        expect(MODEL_ALIASES['image']).toBeDefined();
        expect(MODEL_ALIASES['video']).toBeDefined();
        expect(MODEL_ALIASES['long']).toBeDefined();
        expect(MODEL_ALIASES['reasoning']).toBeDefined();
        expect(MODEL_ALIASES['thinking']).toBeDefined();
    });

    it('should map to valid models in PRICING', () => {
        for (const [alias, model] of Object.entries(MODEL_ALIASES)) {
            expect(PRICING[model]).toBeDefined();
        }
    });
});

describe('resolveModelAlias', () => {
    it('should resolve known aliases', () => {
        expect(resolveModelAlias('fast')).toBe(MODEL_ALIASES['fast']);
        expect(resolveModelAlias('best')).toBe(MODEL_ALIASES['best']);
        expect(resolveModelAlias('cheap')).toBe(MODEL_ALIASES['cheap']);
    });

    it('should be case-insensitive', () => {
        expect(resolveModelAlias('FAST')).toBe(MODEL_ALIASES['fast']);
        expect(resolveModelAlias('Fast')).toBe(MODEL_ALIASES['fast']);
        expect(resolveModelAlias('BEST')).toBe(MODEL_ALIASES['best']);
    });

    it('should return original if not an alias', () => {
        expect(resolveModelAlias('gpt-4o')).toBe('gpt-4o');
        expect(resolveModelAlias('claude-sonnet-4')).toBe('claude-sonnet-4');
    });
});

// ============================================================================
// RESULT TYPE TESTS
// ============================================================================

describe('Result type helpers', () => {
    it('Ok() should create success result', () => {
        const result = Ok({ data: 'test' });
        expect(result.ok).toBe(true);
        expect(result.data).toEqual({ data: 'test' });
        expect(result.error).toBeNull();
    });

    it('Err() should create error result', () => {
        const result = Err({ code: 'TEST_ERROR', message: 'Test' });
        expect(result.ok).toBe(false);
        expect(result.data).toBeNull();
        expect(result.error).toEqual({ code: 'TEST_ERROR', message: 'Test' });
    });
});

// ============================================================================
// COST TRACKER TESTS
// ============================================================================

describe('CostTracker', () => {
    let tracker: CostTracker;

    beforeEach(() => {
        tracker = new CostTracker({ autoSave: false }); // Don't write to disk in tests
        tracker.clear();
    });

    it('should track costs', () => {
        tracker.track('gpt-4o', 'openai',
            { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
            { input: 0.00025, output: 0.0005, total: 0.00075 }
        );

        expect(tracker.today).toBe(0.00075);
        expect(tracker.total).toBe(0.00075);
    });

    it('should aggregate multiple tracks', () => {
        tracker.track('gpt-4o', 'openai',
            { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
            { input: 0.001, output: 0.002, total: 0.003 }
        );
        tracker.track('claude-sonnet-4', 'anthropic',
            { inputTokens: 200, outputTokens: 100, totalTokens: 300 },
            { input: 0.002, output: 0.004, total: 0.006 }
        );

        expect(tracker.today).toBeCloseTo(0.009, 6);
        expect(tracker.total).toBeCloseTo(0.009, 6);
    });

    it('should provide summary', () => {
        tracker.track('gpt-4o', 'openai',
            { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
            { input: 0.001, output: 0.002, total: 0.003 }
        );

        const summary = tracker.summary();
        expect(summary.today).toBe(0.003);
        expect(summary.total).toBe(0.003);
        expect(summary.topModels.length).toBeGreaterThan(0);
        expect(summary.topProviders.length).toBeGreaterThan(0);
    });

    it('should clear data', () => {
        tracker.track('gpt-4o', 'openai',
            { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
            { input: 0.001, output: 0.002, total: 0.003 }
        );

        tracker.clear();
        expect(tracker.today).toBe(0);
        expect(tracker.total).toBe(0);
    });
});

// ============================================================================
// AI CLASS TESTS (No API calls)
// ============================================================================

describe('AI class', () => {
    it('should create instance with defaults', () => {
        const ai = new AI();
        expect(ai).toBeDefined();
    });

    it('should create instance with config', () => {
        const ai = new AI({
            providers: {
                openai: { apiKey: 'test-key' }
            },
            defaults: {
                temperature: 0.5,
                maxTokens: 500
            }
        });
        expect(ai).toBeDefined();
    });

    it('should expose pricing method', () => {
        const ai = new AI();
        const pricing = ai.pricing('gpt-4o');
        expect(pricing).toBeDefined();
        expect(pricing?.input).toBe(2.5);
        expect(pricing?.output).toBe(10);
    });

    it('should expose modelsFor method', () => {
        const ai = new AI();
        const openaiModels = ai.modelsFor('openai');
        expect(openaiModels.length).toBeGreaterThan(0);
        expect(openaiModels).toContain('gpt-4o');
    });

    it('should resolve aliases in chat()', () => {
        const ai = new AI({ providers: { openai: { apiKey: 'test' } } });
        const request = ai.chat('fast');
        expect(request).toBeDefined();
    });

    it('should track cost metrics', () => {
        const ai = new AI();
        expect(ai.totalCost).toBe(0);
        expect(ai.requestCount).toBe(0);
    });

    it('should support budget limit check', () => {
        const ai = new AI({ budgetLimit: 1.00 });
        expect(ai.remainingBudget).toBe(1.00);
    });
});

// ============================================================================
// CHAT REQUEST BUILDER TESTS (No API calls)
// ============================================================================

describe('ChatRequest builder', () => {
    let ai: AI;

    beforeEach(() => {
        ai = new AI({
            providers: { openai: { apiKey: 'test-key' } }
        });
    });

    it('should chain system/user/assistant', () => {
        const request = ai.chat('gpt-4o')
            .system('You are helpful')
            .user('Hello')
            .assistant('Hi there!')
            .user('How are you?');

        expect(request).toBeDefined();
    });

    it('should chain temperature and maxTokens', () => {
        const request = ai.chat('gpt-4o')
            .temperature(0.5)
            .maxTokens(500);

        expect(request).toBeDefined();
    });

    it('should chain all options', () => {
        const request = ai.chat('gpt-4o')
            .system('Be concise')
            .user('Hello')
            .temperature(0.7)
            .maxTokens(1000)
            .topP(0.9)
            .frequencyPenalty(0.5)
            .presencePenalty(0.5)
            .stop(['END'])
            .json()
            .timeout(30000);

        expect(request).toBeDefined();
    });

    it('should estimate cost', () => {
        const estimate = ai.chat('gpt-4o')
            .user('Hello world')
            .estimateCost();

        expect(estimate).toBeDefined();
        expect(estimate.model).toBe('gpt-4o');
        expect(estimate.provider).toBe('openai');
        expect(estimate.inputCost).toBeGreaterThanOrEqual(0);
    });

    it('should apply global defaults', () => {
        const aiWithDefaults = new AI({
            providers: { openai: { apiKey: 'test' } },
            defaults: {
                temperature: 0.3,
                maxTokens: 200
            }
        });

        const request = aiWithDefaults.chat('gpt-4o').user('Test');
        // Defaults are applied internally, we can't easily inspect them
        // but we can verify the request is created
        expect(request).toBeDefined();
    });
});

// ============================================================================
// ERROR HANDLING TESTS (No API calls)
// ============================================================================

describe('Error handling', () => {
    it('should return error for missing API key', async () => {
        const ai = new AI({ providers: {} });
        const result = await ai.ask('gpt-4o', 'Hello');

        expect(result.ok).toBe(false);
        expect(result.error?.code).toBe('NO_API_KEY');
    });

    it('should return error for unknown model', async () => {
        const ai = new AI({ providers: { openai: { apiKey: 'test' } } });
        const result = await ai.ask('unknown-model-xyz', 'Hello');

        expect(result.ok).toBe(false);
        expect(result.error?.code).toBe('INVALID_MODEL');
    });
});

// ============================================================================
// INTEGRATION TESTS (Optional - requires real API keys)
// ============================================================================

describe.skip('Integration tests (requires API keys)', () => {
    // These tests will be skipped by default
    // Run manually with: OPENAI_API_KEY=sk-xxx npm run test

    it('should call OpenAI API', async () => {
        const ai = new AI(); // Auto-detect from env
        const result = await ai.ask('gpt-4o-mini', 'Say "hello" and nothing else');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('hello');
            expect(result.data.provider).toBe('openai');
            expect(result.data.usage.totalTokens).toBeGreaterThan(0);
            expect(result.data.cost.total).toBeGreaterThan(0);
        }
    });

    it('should stream response', async () => {
        const ai = new AI();
        let content = '';

        for await (const chunk of ai.chat('gpt-4o-mini').user('Say "hi"').stream()) {
            if (chunk.type === 'text') {
                content += chunk.content;
            }
        }

        expect(content.toLowerCase()).toContain('hi');
    });
});

console.log('✅ All unit tests defined. Run with: npm run test:run');
