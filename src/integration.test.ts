/**
 * @aitofy/ai-chat - Integration Tests (Real API)
 * 
 * These tests call REAL APIs and cost money!
 * Each passed test is saved to .test-results.json to avoid re-running.
 * 
 * Run with: npm run test:integration
 */

// Load .env file
import * as dotenv from 'dotenv';
dotenv.config();

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import AI, { ask, chat, getCostTracker } from '../src/index';

// ============================================================================
// TEST RESULT TRACKING - Avoid duplicate API calls
// ============================================================================

const RESULTS_FILE = path.join(__dirname, '../.test-results.json');

interface TestResults {
    passedTests: Record<string, {
        passedAt: string;
        cost?: number;
        latency?: number;
        provider?: string;
    }>;
    totalCost: number;
    lastRun: string;
}

function loadResults(): TestResults {
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
        }
    } catch { }
    return { passedTests: {}, totalCost: 0, lastRun: '' };
}

function saveResults(results: TestResults): void {
    results.lastRun = new Date().toISOString();
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

function isTestPassed(testName: string): boolean {
    const results = loadResults();
    return !!results.passedTests[testName];
}

function markTestPassed(testName: string, meta?: { cost?: number; latency?: number; provider?: string }): void {
    const results = loadResults();
    results.passedTests[testName] = {
        passedAt: new Date().toISOString(),
        ...meta
    };
    if (meta?.cost) {
        results.totalCost += meta.cost;
    }
    saveResults(results);
}

// Skip if already passed
function skipIfPassed(testName: string): boolean {
    if (isTestPassed(testName)) {
        console.log(`⏭️  Skipping "${testName}" (already passed)`);
        return true;
    }
    return false;
}

// ============================================================================
// SETUP
// ============================================================================

let ai: AI;

beforeAll(() => {
    ai = new AI({
        autoDetect: true,
        logging: true,
        trackCosts: false  // Don't double-track in this test
    });
});

// ============================================================================
// OPENAI TESTS
// ============================================================================

describe('OpenAI Integration', () => {
    const TEST_NAME = 'openai:gpt-4o-mini:basic';

    it('should call gpt-4o-mini successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('gpt-4o-mini', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('openai');
            expect(result.data.usage.totalTokens).toBeGreaterThan(0);
            expect(result.data.cost.total).toBeGreaterThan(0);

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

describe('OpenAI Streaming', () => {
    const TEST_NAME = 'openai:gpt-4o-mini:streaming';

    it('should stream response', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        let content = '';
        let tokenCount = 0;

        for await (const chunk of ai.chat('gpt-4o-mini').user('Say "hi"').stream()) {
            if (chunk.type === 'text' && chunk.content) {
                content += chunk.content;
            }
            if (chunk.type === 'done' && chunk.usage) {
                tokenCount = chunk.usage.totalTokens;
            }
        }

        expect(content.toLowerCase()).toContain('hi');
        markTestPassed(TEST_NAME, { latency: 0 });
        console.log(`✅ ${TEST_NAME} passed!`);
    });
});

// ============================================================================
// ANTHROPIC TESTS
// ============================================================================

describe('Anthropic Integration', () => {
    const TEST_NAME = 'anthropic:claude-haiku:basic';

    it('should call claude-haiku-3.5 successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('claude-haiku-3.5', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('anthropic');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// GOOGLE TESTS
// ============================================================================

describe('Google Gemini Integration', () => {
    const TEST_NAME = 'google:gemini-flash:basic';

    it('should call gemini-2.5-flash successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('gemini-2.5-flash', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('google');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// GROQ TESTS
// ============================================================================

describe('Groq Integration', () => {
    const TEST_NAME = 'groq:llama-8b:basic';

    it('should call llama-3.1-8b-instant successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('llama-3.1-8b-instant', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('groq');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// XAI TESTS
// ============================================================================

describe('xAI Grok Integration', () => {
    const TEST_NAME = 'xai:grok-3-mini:basic';

    it('should call grok-3-mini successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('grok-3-mini', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('xai');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// DEEPSEEK TESTS
// ============================================================================

describe('DeepSeek Integration', () => {
    const TEST_NAME = 'deepseek:chat:basic';

    it('should call deepseek-chat successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ai.ask('deepseek-chat', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');
            expect(result.data.provider).toBe('deepseek');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// MODEL ALIASES TESTS
// ============================================================================

describe('Model Aliases Integration', () => {
    const TEST_NAME = 'alias:fast:basic';

    it('should resolve "fast" alias and call successfully', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await ask('fast', 'Reply with exactly: "OK"');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Model: ${result.data.model}, Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// FLUENT API TESTS
// ============================================================================

describe('Fluent API Integration', () => {
    const TEST_NAME = 'fluent:chat-builder:basic';

    it('should work with fluent chat builder', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await chat('fast')
            .system('You are a test bot. Always reply with exactly "OK".')
            .user('Test')
            .temperature(0.1)
            .maxTokens(10)
            .send();

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.content.toLowerCase()).toContain('ok');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// JSON MODE TEST
// ============================================================================

describe('JSON Mode Integration', () => {
    const TEST_NAME = 'json-mode:basic';

    it('should return valid JSON', async () => {
        if (skipIfPassed(TEST_NAME)) {
            expect(true).toBe(true);
            return;
        }

        const result = await chat('gpt-4o-mini')
            .system('Return a JSON object with a "status" field set to "ok"')
            .user('Give me the status')
            .json()
            .maxTokens(50)
            .send();

        expect(result.ok).toBe(true);
        if (result.ok) {
            const parsed = JSON.parse(result.data.content);
            expect(parsed.status).toBe('ok');

            markTestPassed(TEST_NAME, {
                cost: result.data.cost.total,
                latency: result.data.latency,
                provider: result.data.provider
            });

            console.log(`✅ ${TEST_NAME} passed! Cost: $${result.data.cost.total.toFixed(6)}`);
        }
    });
});

// ============================================================================
// SUMMARY
// ============================================================================

describe('Test Summary', () => {
    it('should print summary', () => {
        const results = loadResults();
        const passedCount = Object.keys(results.passedTests).length;

        console.log('\n' + '='.repeat(50));
        console.log('📊 INTEGRATION TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Passed tests: ${passedCount}`);
        console.log(`💰 Total cost: $${results.totalCost.toFixed(6)}`);
        console.log(`🕐 Last run: ${results.lastRun}`);
        console.log('='.repeat(50) + '\n');

        expect(true).toBe(true);
    });
});
