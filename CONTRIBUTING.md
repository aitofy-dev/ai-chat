# Contributing to @aitofy/ai-chat

First off, thanks for taking the time to contribute! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include:

- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Minimal code example if possible
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Node version, OS, package version

### Suggesting Features

Feature requests are welcome! Please provide:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other ways to solve this

### Pull Requests

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-chat.git
cd ai-chat

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run integration tests (requires API keys in .env)
cp .env.example .env
# Edit .env with your keys
npm run test:integration
```

## Code Style

- Use TypeScript
- Follow existing patterns
- Add tests for new features
- Update README if needed

## Adding a New Provider

1. Add pricing to `PRICING` constant
2. Add detection logic to `detectProvider()`
3. Create `callNewProvider()` function
4. Add to switch in `AI` class methods
5. Add integration test
6. Update README

## Questions?

Feel free to open a Discussion or reach out via issues.

Thanks! 💙
