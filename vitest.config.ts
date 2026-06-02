import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

const wsEndpoint = process.env.PW_TEST_CONNECT_WS_ENDPOINT
const headersRaw = process.env.PW_TEST_CONNECT_HEADERS

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(
        wsEndpoint
          ? {
              connectOptions: {
                wsEndpoint,
                exposeNetwork: process.env.PW_TEST_CONNECT_EXPOSE_NETWORK,
                headers: headersRaw ? JSON.parse(headersRaw) : undefined,
              },
            }
          : {},
      ),
      instances: [{ browser: 'chromium' }],
    },
  },
})
