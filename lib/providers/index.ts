import "server-only";
import { createAdapters, configFromEnv } from "./core";
export { ProviderError } from "./types";
export type { Adapters, AudioInput, Config, Transcript, Translation } from "./types";
// Only this entrypoint reads secrets; core supports offline injected-transport tests/CLI.
export function providers() { return createAdapters(configFromEnv(process.env)); }
