import {it,expect} from "vitest";
import {newSegmentId,validId,initialText,estimateTimings,transcriptSegments,validateTranscript,splitSegment,mergeSegment} from "../lib/transcript";
const ids=["11111111-1111-4111-8111-111111111111","22222222-2222-4222-8222-222222222222","33333333-3333-4333-8333-333333333333"];
it("segments sentences and splits long text without dropping words",()=>{
 expect(initialText("Molo. Enkosi!")).toEqual(["Molo.","Enkosi!"]);
 const original="longword ".repeat(100).trim();const chunks=initialText(original);expect(chunks.every(x=>Array.from(x).length<=300)).toBe(true);expect(chunks.join(" ")).toBe(original);
 expect(initialText("x".repeat(601)).map(x=>x.length)).toEqual([300,300,1]);
});
it("rejects empty, oversized and excessive segments",()=>{
 for(const text of [""," ","x".repeat(50001),Array(501).fill("A.").join(" ")])expect(()=>initialText(text)).toThrow();
});
it("produces monotonic bounded approximate timings including very short audio",()=>{
 const rows=estimateTimings(ids.map((id,i)=>({id,text:"x".repeat(i+1)})),5);
 expect(rows.map(x=>x.start_ms)).toEqual([0,1,3]);expect(rows.at(-1)?.end_ms).toBe(5);expect(rows.every(x=>x.end_ms>x.start_ms&&x.timing_source==="estimated")).toBe(true);
 expect(()=>estimateTimings(rows,2)).toThrow();
});
it("accepts valid supplied timings and falls back for invalid or mismatching ones",()=>{
 const timings=[{text:"Molo.",startMs:0,endMs:100},{text:"Enkosi.",startMs:100,endMs:500}];let i=0;
 expect(transcriptSegments("Molo. Enkosi.",500,()=>ids[i++],timings).every(x=>x.timing_source==="provider")).toBe(true);
 for(const bad of [[{...timings[0],startMs:-1}], [{...timings[0],endMs:900}], [{...timings[0],text:"wrong"}], [{...timings[0],startMs:100,endMs:0}]]){
  expect(transcriptSegments("Molo. Enkosi.",500,()=>ids[0],bad).every(x=>x.timing_source==="estimated")).toBe(true);
 }
});
it("retains IDs for edits/split/merge, rejects empty split positions",()=>{
 const rows=estimateTimings([{id:ids[0],text:"Molo enkosi"}],1000);
 const split=splitSegment(rows,0,4,ids[1],1000);expect(split.map(x=>x.id)).toEqual(ids.slice(0,2));expect(split.map(x=>x.text)).toEqual(["Molo","enkosi"]);
 const merged=mergeSegment(split,0,1000);expect(merged[0]).toMatchObject({id:ids[0],text:"Molo enkosi",end_ms:1000});
 for(const caret of [0,11,12])expect(()=>splitSegment(rows,0,caret,ids[1],1000)).toThrow();
 expect(()=>mergeSegment(rows,0,1000)).toThrow();
});
it("validates title/revision/IDs and ignores browser timing claims",()=>{
 const value={title:" Title ",revision:0,segments:[{id:ids[0],text:"Text",start_ms:999999,timing_source:"provider"}]};
 expect(validateTranscript(value,1000)).toMatchObject({title:"Title",segments:[{start_ms:0,end_ms:1000,timing_source:"estimated"}]});
 for(const bad of [{...value,title:""},{...value,revision:-1},{...value,segments:[]},{...value,segments:[value.segments[0],value.segments[0]]},{...value,segments:[{id:"forged",text:"Text"}]}])expect(()=>validateTranscript(bad,1000)).toThrow();
});

it("creates valid v4 segment IDs without the secure-context randomUUID API",()=>{const first=newSegmentId();expect(validId(first)).toBe(true);expect(first[14]).toBe("4");expect(newSegmentId()).not.toBe(first);});
