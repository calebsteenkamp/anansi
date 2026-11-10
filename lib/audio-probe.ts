import {BufferSource, EncodedPacketSink, Input, MP3, MP4, WAVE, WEBM} from "mediabunny";
import {AudioError, opusPacketDuration, validateAudioSize, validateDuration} from "./audio";
import type {InspectedAudio} from "./drafts";

// Used only by the Node upload handler; no remote URL sources, decoding, conversion or providers.
export async function inspectAudio(bytes: Uint8Array): Promise<InspectedAudio> {
 validateAudioSize(bytes.byteLength);
 const input = new Input({source:new BufferSource(bytes),formats:[MP3, MP4, WAVE, WEBM]});
 try {
  const format = await input.getFormat();
  if (format === WAVE) validateWaveEnvelope(bytes);
  const audio = await input.getAudioTracks();
  const video = await input.getVideoTracks();
  if (audio.length !== 1 || video.length) throw new AudioError("unsupported_audio","Choose a file with one audio track and no video.");
  const track = audio[0];
  const codec = track.codec;
  const supported = format === MP3 ? codec === "mp3" :
   format === MP4 ? codec === "aac" || codec === "mp3" || codec === "opus" :
   format === WEBM ? codec === "opus" || codec === "vorbis" :
   format === WAVE && !!codec?.startsWith("pcm-");
  if (!supported) throw new AudioError("unsupported_audio","This audio codec is unsupported. Upload MP3, AAC M4A/MP4, PCM WAV, or Opus/Vorbis WebM.");
  // Scan real packets, including duration-less MediaRecorder WebM, instead of trusting a form field
  // or the container's advertised overall duration. This inspects encoded media, not audio quality.
  let end = 0, count = 0;
  const started = performance.now();
  for await (const packet of new EncodedPacketSink(track).packets(undefined,undefined,{skipLiveWait:true})) {
   const duration = codec === "opus" ? opusPacketDuration(packet.data) : packet.duration;
   if (!packet.data.length || !Number.isFinite(packet.timestamp) || !Number.isFinite(duration) || duration <= 0)
    throw new AudioError("invalid_audio","The file has invalid or empty audio packets.");
   end = Math.max(end, packet.timestamp + duration);
   // Round numerical noise below a nanosecond, not user-visible over-limit audio.
   validateDuration(Math.round(end * 1e9) / 1e9);
   if (++count > 100000 || performance.now() - started > 15000)
    throw new AudioError("invalid_audio","Audio inspection took too long. Try a shorter file.");
  }
  if (!count) throw new AudioError("invalid_audio","The file contains no readable audio.");
  const durationMs = validateDuration(Math.round(end * 1e9) / 1e9);
  if (format === MP3) return {durationMs,mediaType:"audio/mpeg",extension:"mp3"};
  if (format === MP4) return {durationMs,mediaType:"audio/mp4",extension:"m4a"};
  if (format === WEBM) return {durationMs,mediaType:"audio/webm",extension:"webm"};
  return {durationMs,mediaType:"audio/wav",extension:"wav"};
 } catch (error) {
  if (error instanceof AudioError) throw error;
  throw new AudioError("invalid_audio","The file is malformed or unsupported. Choose a valid MP3, MP4/M4A, WAV or WebM audio file.");
 } finally {input.dispose();}
}

// The demuxer tolerates truncated WAV payloads. Reject inconsistent RIFF/chunk lengths explicitly.
function validateWaveEnvelope(bytes: Uint8Array) {
 const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
 const invalid = () => new AudioError("invalid_audio", "The WAV file is truncated or has invalid chunk lengths.");
 if (bytes.length < 12 || view.getUint32(0,false) !== 0x52494646 || view.getUint32(4,true) + 8 !== bytes.length) throw invalid();
 let offset = 12;
 while (offset < bytes.length) {
  if (offset + 8 > bytes.length) throw invalid();
  const size = view.getUint32(offset+4,true);
  offset += 8 + size + (size % 2);
  if (offset > bytes.length) throw invalid();
 }
}
