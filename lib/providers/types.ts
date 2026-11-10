export type Provider = "mock" | "openai" | "vulavula";
export type ErrorCode = "configuration" | "unsupported" | "invalid_input" | "credentials" | "quota" | "timeout" | "network" | "provider" | "malformed";
export class ProviderError extends Error {
  constructor(public readonly code: ErrorCode) { super(`Provider request failed: ${code}`); this.name = "ProviderError"; }
}
export interface Provenance { provider: Provider; model: string; mock: boolean }
export interface Transcript { text: string; provenance: Provenance }
export interface Translation { text: string; provenance: Provenance }
export interface AudioInput { bytes: Uint8Array; filename: string; mimeType: string }
export interface Adapters {
 transcribe(audio: AudioInput, language: "xh"): Promise<Transcript>;
 translate(text: string, source: "xh", target: "en"): Promise<Translation>;
}
export interface Config { transcription: Provider; translation: Provider; openaiKey?: string; openaiTranscriptionModel?: string; openaiTranslationModel?: string; vulavulaKey?: string; openaiMaxOutputTokens?: number; timeoutMs?: number }
