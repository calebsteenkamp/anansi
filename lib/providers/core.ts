import {intentExamples,translationPrompt} from "../intent-examples";
import { ProviderError, type Config, type Adapters, type Provider, type Provenance } from "./types";

function text(value: unknown): string {
 if (typeof value !== "string" || !value.trim()) throw new ProviderError("malformed");
 return value.trim();
}
function object(value: unknown): Record<string, unknown> {
 if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProviderError("malformed");
 return value as Record<string, unknown>;
}
function provenance(provider: Provider, model: string): Provenance { return {provider, model, mock: provider === "mock"}; }
export function createAdapters(config: Config, transport: typeof fetch = fetch): Adapters {
 if (![config.transcription, config.translation].every(p => ["mock","openai","vulavula"].includes(p))) throw new ProviderError("configuration");
 const timeoutMs = config.timeoutMs ?? 160000;
 if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new ProviderError("configuration");
 async function request(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
   const response = await transport(url, {...init, signal: controller.signal});
   if (!response.ok) {
    const code = response.status === 401 || response.status === 403 ? "credentials" : response.status === 429 ? "quota" : response.status === 400 || response.status === 422 ? "invalid_input" : "provider";
    throw new ProviderError(code);
   }
   try { return object(await response.json()); } catch (error) {
    if (controller.signal.aborted) throw new ProviderError("timeout");
    if (error instanceof ProviderError) throw error;
    throw new ProviderError("malformed");
   }
  } catch (error) {
   if (controller.signal.aborted) throw new ProviderError("timeout");
   if (error instanceof ProviderError) throw error;
   throw new ProviderError("network");
  } finally { clearTimeout(timer); }
 }
 function required(value?: string): string { if (!value?.trim()) throw new ProviderError("configuration"); return value; }
 return {
  async transcribe(audio, language) {
   if (language !== "xh") throw new ProviderError("unsupported");
   if (!audio.bytes.byteLength || !audio.filename || !audio.mimeType.startsWith("audio/")) throw new ProviderError("invalid_input");
   const provider = config.transcription;
   if (provider === "vulavula") throw new ProviderError("unsupported");
   if (provider === "mock") return {text: "Synthetic mock transcript. Not a real transcription.", provenance: provenance(provider,"synthetic-v1")};
   const model = required(config.openaiTranscriptionModel);
   const form = new FormData();
   form.append("file",new Blob([new Uint8Array(audio.bytes)],{type: audio.mimeType}),audio.filename);
   form.append("model",model);
   // No guessed language-code or timestamp parameters: verify support in the live spike.
   form.append("response_format","json");
   const result = await request("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization: `Bearer ${required(config.openaiKey)}`},body:form});
   return {text:text(result.text),provenance:provenance(provider,model)};
  },
  async translate(input, source, target, context) {
   const examples=intentExamples(context);
   if (source !== "xh" || target !== "en") throw new ProviderError("unsupported");
   if (!input.trim()) throw new ProviderError("invalid_input");
   const provider = config.translation;
   if (provider === "mock") return {text:"Synthetic mock English translation. Not a linguistic evaluation.",provenance:provenance(provider,"synthetic-v1")};
   if (provider === "vulavula") {
    if(examples.length)throw new ProviderError("unsupported");
    const result = await request("https://api.lelapa.ai/v1/translate/process",{method:"POST",headers:{"Content-Type":"application/json","X-CLIENT-TOKEN":required(config.vulavulaKey)},body:JSON.stringify({input_text:input,source_lang:"xho_Latn",target_lang:"eng_Latn"})});
    if (!Array.isArray(result.translation) || result.translation.length !== 1) throw new ProviderError("malformed");
    return {text:text(object(result.translation[0]).translated_text),provenance:provenance(provider,"vulavula-translate-api")};
   }
   const model = required(config.openaiTranslationModel);
   const maxOutput = config.openaiMaxOutputTokens ?? 4096;
   if (!Number.isSafeInteger(maxOutput) || maxOutput < 1 || maxOutput > 4096) throw new ProviderError("configuration");
   const result = await request("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${required(config.openaiKey)}`},body:JSON.stringify({model,max_output_tokens:maxOutput,store:false,...translationPrompt(input,examples)})});
   if (result.status && result.status !== "completed") throw new ProviderError("malformed");
   if (!Array.isArray(result.output)) throw new ProviderError("malformed");
   const parts: string[] = [];
   for (const item of result.output) {
    const message = object(item);
    if (message.type !== "message") continue;
    if (!Array.isArray(message.content)) throw new ProviderError("malformed");
    for (const part of message.content) { const content = object(part); if(content.type === "output_text") parts.push(text(content.text)); }
   }
   return {text:text(parts.join("\n")),provenance:provenance(provider,model)};
  }
 };
}
export function configFromEnv(env: Record<string,string|undefined>): Config {
 function provider(value?: string): Provider {
  const p = value ?? "openai";
  if (p !== "mock" && p !== "openai" && p !== "vulavula") throw new ProviderError("configuration");
  return p;
 }
 return {transcription:provider(env.TRANSCRIPTION_PROVIDER),translation:provider(env.TRANSLATION_PROVIDER),openaiKey:env.OPENAI_API_KEY,openaiTranscriptionModel:env.OPENAI_TRANSCRIPTION_MODEL,openaiTranslationModel:env.OPENAI_TRANSLATION_MODEL ?? "gpt-5.4-mini-2026-03-17",vulavulaKey:env.VULAVULA_API_KEY};
}
