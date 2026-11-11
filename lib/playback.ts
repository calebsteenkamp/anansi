export interface TimedSegment {id:string;start_ms:number;end_ms:number}
export interface AlignedTranslation {id:string;text:string;source_segment_id:string|null}
export function activeSegment(segments:TimedSegment[],timeMs:number):string|null {
 if(!Number.isFinite(timeMs)||timeMs<0)return null;
 return segments.find(s=>Number.isFinite(s.start_ms)&&Number.isFinite(s.end_ms)&&s.start_ms>=0&&s.end_ms>s.start_ms&&timeMs>=s.start_ms&&timeMs<s.end_ms)?.id??null;
}
export function seekTime(startMs:number,durationMs:number):number|null {
 if(!Number.isFinite(startMs)||!Number.isFinite(durationMs)||durationMs<=0||startMs<0)return null;
 return Math.min(startMs,durationMs)/1000;
}
export function alignTranslations<T extends AlignedTranslation>(originals:{id:string}[],translations:T[]):(T|null)[]{
 const bySource=new Map<string,T>();const duplicates=new Set<string>();
 for(const row of translations){if(!row.source_segment_id)continue;if(bySource.has(row.source_segment_id))duplicates.add(row.source_segment_id);else bySource.set(row.source_segment_id,row);}
 return originals.map(row=>duplicates.has(row.id)?null:bySource.get(row.id)??null);
}
// One owner per document; starting another player stops the previous owner first.
let current:{owner:symbol;stop:()=>void}|null=null;
export function claimPlayback(owner:symbol,stop:()=>void){const previous=current;current={owner,stop};if(previous&&previous.owner!==owner)previous.stop();}
export function releasePlayback(owner:symbol){if(current?.owner===owner)current=null;}
