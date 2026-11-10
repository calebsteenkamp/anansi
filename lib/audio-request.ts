import {isSameOrigin} from "./request-origin";
import {AudioError, MAX_AUDIO_BYTES} from "./audio";
export const MAX_MULTIPART_BYTES = MAX_AUDIO_BYTES + 65_536;
export function checkUploadOrigin(request: Request) {
 if (!isSameOrigin(request))
  throw new AudioError("forbidden_origin", "Upload from the Anansi page in this browser.", 403);
}
export async function boundedFormData(request: Request) {
 const declared = request.headers.get("content-length");
 if (declared && Number(declared) > MAX_MULTIPART_BYTES)
  throw new AudioError("audio_too_large", "Audio must be 25 MB or smaller.", 413);
 if (!request.headers.get("content-type")?.startsWith("multipart/form-data;") || !request.body)
  throw new AudioError("invalid_upload", "Choose an audio file and try again.");
 const reader = request.body.getReader();
 const chunks: Uint8Array[] = [];
 let size = 0;
 try {
  while (true) {
   const {value, done} = await reader.read();
   if (done) break;
   size += value.byteLength;
   if (size > MAX_MULTIPART_BYTES) {
    await reader.cancel();
    throw new AudioError("audio_too_large", "Audio must be 25 MB or smaller.", 413);
   }
   chunks.push(value);
  }
 } finally { reader.releaseLock(); }
 const bytes = new Uint8Array(size);
 let offset = 0;
 for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
 try {
  return await new Request(request.url, {method:"POST",headers:{"content-type":request.headers.get("content-type")!},body:bytes}).formData();
 } catch { throw new AudioError("invalid_upload", "The upload could not be read. Choose the audio again."); }
}
