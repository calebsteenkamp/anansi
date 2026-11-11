import {claimPlayback,releasePlayback} from "./playback";
export interface DeviceVoice {lang:string;localService:boolean;default?:boolean;voiceURI?:string;name?:string}
export function englishDeviceVoices<T extends DeviceVoice>(voices:T[]):T[]{return voices.filter(v=>v.localService&&/^en(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>Number(!!b.default)-Number(!!a.default));}
export interface SpeechPart {id:string;text:string}
export function speechParts(rows:SpeechPart[]):SpeechPart[]{
 const result:SpeechPart[]=[];
 for(const row of rows){let text=row.text.trim();while(text){const chars=Array.from(text);let end=Math.min(240,chars.length);if(chars.length>end){for(let i=end;i>0;i--)if(/\s/u.test(chars[i])){end=i;break;}}result.push({id:row.id,text:chars.slice(0,end).join("")});text=chars.slice(end).join("").trim();}}
 return result;
}
export interface SpeechCallbacks {active:(id:string|null)=>void;done:()=>void;error:()=>void}
export class DeviceNarrator {
 private owner=Symbol("device voice");private generation=0;private running=false;private utterance:SpeechSynthesisUtterance|null=null;private callbacks:SpeechCallbacks|null=null;
 constructor(private engine:Pick<SpeechSynthesis,"speak"|"cancel">,private create:(text:string)=>SpeechSynthesisUtterance){}
 stop(){
  const wasRunning=this.running;this.generation++;this.running=false;
  if(this.utterance){this.utterance.onstart=null;this.utterance.onend=null;this.utterance.onerror=null;this.utterance=null;}
  if(wasRunning){this.engine.cancel();this.callbacks?.active(null);}this.callbacks=null;releasePlayback(this.owner);
 }
 start(rows:SpeechPart[],voice:SpeechSynthesisVoice,callbacks:SpeechCallbacks){
  this.stop();if(!englishDeviceVoices([voice]).length){callbacks.error();return;}
  const parts=speechParts(rows);if(!parts.length){callbacks.error();return;}
  const generation=++this.generation;this.running=true;this.callbacks=callbacks;claimPlayback(this.owner,()=>this.stop());
  const next=(index:number)=>{
   if(!this.running||generation!==this.generation)return;
   if(index>=parts.length){this.running=false;this.utterance=null;this.callbacks=null;releasePlayback(this.owner);callbacks.active(null);callbacks.done();return;}
   try{
    const part=parts[index],utterance=this.create(part.text);this.utterance=utterance;utterance.voice=voice;utterance.lang=voice.lang;
    utterance.onstart=()=>{if(this.running&&generation===this.generation)callbacks.active(part.id);};
    utterance.onend=()=>{if(generation===this.generation){utterance.onstart=null;utterance.onend=null;utterance.onerror=null;next(index+1);}};
    utterance.onerror=()=>{if(this.running&&generation===this.generation){this.stop();callbacks.error();}};
    this.engine.speak(utterance);
   }catch{if(generation===this.generation){this.stop();callbacks.error();}}
  };next(0);
 }
}
