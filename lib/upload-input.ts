import {AudioError,validateAudioSize} from "./audio";
export function uploadInput(body:Record<string,unknown>){
 if(body.consent!==true)throw new AudioError("consent_required","Confirm permission to upload this audio.",400);
 if(typeof body.size!=="number")throw new AudioError("invalid_upload","Choose a valid audio file.",400);validateAudioSize(body.size);
 const mime=typeof body.mediaType==="string"?body.mediaType.split(";")[0].toLowerCase():"";
 const extensions:Record<string,string>={mp3:"audio/mpeg",mp4:"audio/mp4",m4a:"audio/mp4",wav:"audio/wav",webm:"audio/webm"};
 const media=["audio/mpeg","audio/mp4","audio/wav","audio/webm"].includes(mime)?mime:typeof body.filename==="string"?extensions[body.filename.split(".").pop()!.toLowerCase()]:undefined;
 if(!media)throw new AudioError("invalid_upload","Choose MP3, MP4/M4A, WAV or WebM audio.",400);
 return {size:body.size,media};
}
