# vitest-playwright-docker-repro

Reproduces and fixes Vitest not honoring Playwright's `PW_TEST_CONNECT_*` env vars.

## The problem

[`dtinth/setup-playwright-test-docker`](https://github.com/dtinth/setup-playwright-test-docker) lets Playwright's own test runner connect to a Docker-hosted browser via two env vars:

- `PW_TEST_CONNECT_WS_ENDPOINT` — WebSocket URL of the remote Playwright server
- `PW_TEST_CONNECT_EXPOSE_NETWORK` — network to expose through the SOCKS bridge (e.g. `*`)
- `PW_TEST_CONNECT_HEADERS` — extra HTTP headers for the WS handshake (JSON-encoded)

Playwright's test runner reads these automatically. Vitest does not.

## The fix

`vitest.config.ts` reads the same env vars and passes them as `connectOptions` to the `@vitest/browser-playwright` provider, which already supports remote connections natively.

```ts
provider: playwright(
  wsEndpoint
    ? { connectOptions: { wsEndpoint, exposeNetwork, headers } }
    : {},
)
```

## Behavior

| Env vars set? | Result |
|---|---|
| No | Fails: `Executable doesn't exist … run pnpm exec playwright install` |
| Yes | Connects to remote server, tests pass — no local browser needed |

## Running locally with Docker

```sh
# Start a Playwright server in Docker
docker run -d --rm --init --name pw-server \
  -p 127.0.0.1:43424:43424 \
  --workdir /home/pwuser --user pwuser \
  -v /path/to/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright:/playwright:ro \
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  node /playwright/cli.js run-server --port 43424 --host 0.0.0.0

# Run tests against it
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:43424/ \
PW_TEST_CONNECT_EXPOSE_NETWORK=* \
pnpm test --run
```

On GitHub Actions, use `dtinth/setup-playwright-test-docker` and the env vars are set automatically.
