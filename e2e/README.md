# Running tests

- Runs the end-to-end tests.
```bash  
pnpm exec playwright test
```

- Starts the interactive UI mode.
```bash
pnpm exec playwright test --ui
```

- Runs the tests only on Desktop Chrome.
```bash
pnpm exec playwright test --project=chromium
```

- Runs the tests in a specific file.
```bash
pnpm exec playwright test example
```

- Runs the tests in debug mode.
```bash
pnpm exec playwright test --debug
```

- Auto generate tests with Codegen.
```bash
pnpm exec playwright codegen
```

Visit https://playwright.dev/docs/intro for more information. ✨

Happy hacking! 🎭
