import {AudioError} from "./audio";
export interface Segment {id:string;text:string;start_ms:number;end_ms:number;timing_source:"provider"|"estimated"}
export interface ProviderTiming {text:string;startMs:number;endMs:number}
export const MAX_TRANSCRIPT_CHARS=50000, MAX_SEGMENTS=500;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validId(value:unknown):value is string{return typeof value==="string"&&uuid.test(value);}
export function initialText(text:string):string[]{
 if(!text.trim()||text.length>MAX_TRANSCRIPT_CHARS)throw new AudioError("invalid_transcript","Enter a transcript of 1–50,000 characters.");
 const sentences=Array.from(new Intl.Segmenter("xh",{granularity:"sentence"}).segment(text),part=>part.segment.trim()).filter(Boolean);
 const chunks:string[]=[];
 for(const sentence of sentences){
  let remaining=Array.from(sentence);
  while(remaining.length>300){
   let cut=300;for(let i=299;i>0;i--)if(/\s/u.test(remaining[i])){cut=i;break;}
   chunks.push(remaining.slice(0,cut).join("").trim());remaining=remaining.slice(cut);while(remaining.length&&/\s/u.test(remaining[0]))remaining.shift();
  }
  if(remaining.length)chunks.push(remaining.join("").trim());
 }
 if(chunks.length>MAX_SEGMENTS)throw new AudioError("invalid_transcript","Use at most 500 segments.");
 return chunks;
}
export function estimateTimings(segments:{id:string;text:string}[],duration:number):Segment[]{
 if(!Number.isSafeInteger(duration)||duration<1||!segments.length||segments.length>MAX_SEGMENTS||segments.length>duration)throw new AudioError("invalid_timings","The transcript cannot be aligned to this audio.");
 const rows=segments.map(row=>({...row,text:row.text.trim()}));
 const total=rows.reduce((sum,row)=>sum+Array.from(row.text).length,0);
 if(rows.some(row=>!row.text)||total>MAX_TRANSCRIPT_CHARS)throw new AudioError("invalid_transcript","Each segment needs text; total limit is 50,000 characters.");
 let used=0,previous=0;
 return rows.map((row,index)=>{used+=Array.from(row.text).length;const end=index+1+Math.floor((duration-rows.length)*used/total);const timed={...row,start_ms:previous,end_ms:end,timing_source:"estimated" as const};previous=end;return timed;});
}
export function transcriptSegments(text:string,duration:number,id:()=>string,timings?:ProviderTiming[]):Segment[]{
 const chunks=initialText(text);
 if(timings?.length&&timings.length<=MAX_SEGMENTS&&timings.map(row=>row.text.trim()).join(" ").replace(/\s+/g," ")===text.trim().replace(/\s+/g," ")){
  let previous=0;
  const valid=timings.every(row=>{const okay=!!row.text.trim()&&Array.from(row.text).length<=300&&Number.isSafeInteger(row.startMs)&&Number.isSafeInteger(row.endMs)&&row.startMs>=previous&&row.endMs>row.startMs&&row.endMs<=duration;previous=row.endMs;return okay;});
  if(valid)return timings.map(row=>({id:id(),text:row.text.trim(),start_ms:row.startMs,end_ms:row.endMs,timing_source:"provider"}));
 }
 return estimateTimings(chunks.map(text=>({id:id(),text})),duration);
}
export function validateTranscript(input:unknown,duration:number){
 if(!input||typeof input!=="object")throw new AudioError("invalid_transcript","Enter a title and transcript.");
 const value=input as Record<string,unknown>;
 if(typeof value.title!=="string"||!value.title.trim()||value.title.trim().length>200||!Number.isSafeInteger(value.revision)||Number(value.revision)<0||!Array.isArray(value.segments)||!value.segments.length||value.segments.length>MAX_SEGMENTS)
  throw new AudioError("invalid_transcript","Enter a title (1–200 characters) and 1–500 segments.");
 const rows=value.segments.map(item=>{
  if(!item||typeof item!=="object"||!validId(item.id)||typeof item.text!=="string")throw new AudioError("invalid_transcript","Invalid transcript segment.");
  return {id:item.id as string,text:item.text as string};
 });
 if(new Set(rows.map(row=>row.id)).size!==rows.length)throw new AudioError("invalid_transcript","Segment identifiers must be unique.");
 return {title:value.title.trim(),revision:Number(value.revision),segments:estimateTimings(rows,duration)};
}
export function splitSegment(rows:Segment[],index:number,caret:number,id:string,duration:number){
 const row=rows[index];
 if(!row||!Number.isInteger(caret)||caret<1||caret>=row.text.length||!row.text.slice(0,caret).trim()||!row.text.slice(caret).trim())throw new AudioError("invalid_split","Put the cursor between two nonempty parts of the segment.");
 return estimateTimings([...rows.slice(0,index),{id:row.id,text:row.text.slice(0,caret)},{id,text:row.text.slice(caret)},...rows.slice(index+1)],duration);
}
export function mergeSegment(rows:Segment[],index:number,duration:number){
 if(!rows[index]||!rows[index+1])throw new AudioError("invalid_merge","Select a segment with a following segment.");
 return estimateTimings([...rows.slice(0,index),{id:rows[index].id,text:rows[index].text+" "+rows[index+1].text},...rows.slice(index+2)],duration);
}

// getRandomValues is available on HTTP LAN origins where randomUUID is not.
export function newSegmentId():string {
 const bytes=globalThis.crypto.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,value=>value.toString(16).padStart(2,"0")).join("");
 return hex.slice(0,8)+"-"+hex.slice(8,12)+"-"+hex.slice(12,16)+"-"+hex.slice(16,20)+"-"+hex.slice(20);
}
