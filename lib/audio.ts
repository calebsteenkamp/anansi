export const MAX_AUDIO_SECONDS = 180;
export const MAX_AUDIO_BYTES = 25_000_000;
export const AUDIO_ACCEPT = ".mp3,.mp4,.m4a,.wav,.webm,audio/mpeg,audio/mp4,audio/wav,audio/webm";
export const RECORDING_TYPES = ["audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm"] as const;
export class AudioError extends Error {
 constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function validateConsent(consent: unknown) {
 if (consent !== "yes") throw new AudioError("consent_required", "Confirm that you own or have permission to record and upload this audio.");
}
export function validateAudioSize(size: number) {
 if (!Number.isInteger(size) || size < 1) throw new AudioError("empty_audio", "Choose a nonempty audio file.");
 if (size > MAX_AUDIO_BYTES) throw new AudioError("audio_too_large", "Audio must be 25 MB or smaller.", 413);
}
export function validateDuration(seconds: number) {
 if (!Number.isFinite(seconds) || seconds <= 0) throw new AudioError("invalid_audio", "The audio duration could not be read.");
 // Compare before rounding: 180.0001 must not become an accepted 180000 ms.
 if (seconds > MAX_AUDIO_SECONDS) throw new AudioError("audio_too_long", "Audio must be 180 seconds or shorter.");
 return Math.max(1, Math.ceil(seconds * 1000));
}
export function selectRecordingType(isSupported: (type: string) => boolean) {
 return RECORDING_TYPES.find(isSupported) ?? null;
}

// RFC 6716 sections 3.1/3.2: duration from the encoded Opus TOC/frame count.
export function opusPacketDuration(data: Uint8Array) {
 if (!data.length) throw new AudioError("invalid_audio", "Empty Opus packet.");
 const config = data[0] >> 3, packing = data[0] & 3;
 const frameMs = config >= 16 ? 2.5 * (1 << (config & 3)) : config >= 12 ? 10 * (1 << (config & 1)) : (config & 3) === 3 ? 60 : 10 * (1 << (config & 3));
 if (packing === 3 && data.length < 2) throw new AudioError("invalid_audio", "Missing Opus frame count.");
 const count = packing === 0 ? 1 : packing === 3 ? data[1] & 63 : 2;
 if (!count || count * frameMs > 120) throw new AudioError("invalid_audio", "Invalid Opus packet duration.");
 return count * frameMs / 1000;
}
