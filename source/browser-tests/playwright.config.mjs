import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.mjs",
  workers: 1,
  timeout: 30_000,
  globalTimeout: 300_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    headless: true,
    baseURL: "http://127.0.0.1:8080",
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "dx build --web --bin papyrus-web --locked && dx serve --web --bin papyrus-web --locked --addr 127.0.0.1 --port 8080 --open false --interactive false --hot-reload false",
    cwd: "..",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
