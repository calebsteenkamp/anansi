import {it,expect} from "vitest";
import {boundedFormData,checkUploadOrigin,MAX_MULTIPART_BYTES} from "../lib/audio-request";
it("rejects foreign or absent upload origins",()=>{for(const origin of ["https://other.example","null",""])expect(()=>checkUploadOrigin(new Request("http://localhost:3000/api/stories/drafts",{headers:{origin}}))).toThrow();expect(()=>checkUploadOrigin(new Request("http://localhost:3000/api/stories/drafts",{headers:{origin:"http://localhost:3000"}}))).not.toThrow();});
it("parses a bounded real multipart file",async()=>{const data=new FormData();data.set("consent","yes");data.set("audio",new File(["fixture"],"test.wav"));const form=await boundedFormData(new Request("http://localhost:3000",{method:"POST",body:data}));expect(form.get("consent")).toBe("yes");expect(form.get("audio")).toBeInstanceOf(File);});
it("rejects oversized declared bodies before reading them",async()=>{await expect(boundedFormData(new Request("http://localhost",{method:"POST",headers:{"content-length":String(MAX_MULTIPART_BYTES+1)},body:"x"}))).rejects.toMatchObject({status:413});});
it("rejects oversized streamed bodies without trusting content-length",async()=>{
 let cancelled=false;
 const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(MAX_MULTIPART_BYTES+1));},cancel(){cancelled=true;}});
 const request=new Request("http://localhost",{method:"POST",headers:{"content-type":"multipart/form-data; boundary=test"},body:stream,duplex:"half"} as RequestInit);
 await expect(boundedFormData(request)).rejects.toMatchObject({status:413});expect(cancelled).toBe(true);
});
it("sanitizes malformed multipart uploads",async()=>{await expect(boundedFormData(new Request("http://localhost",{method:"POST",headers:{"content-type":"multipart/form-data; boundary=test"},body:"bad"}))).rejects.toMatchObject({code:"invalid_upload"});});

it("checks actual LAN Host instead of Next's internal localhost URL",()=>{expect(()=>checkUploadOrigin(new Request("http://localhost:3000/api/stories/drafts",{headers:{host:"192.168.18.157:3000",origin:"http://192.168.18.157:3000"}}))).not.toThrow();expect(()=>checkUploadOrigin(new Request("http://localhost:3000/api/stories/drafts",{headers:{host:"192.168.18.157:3000",origin:"http://attacker.example","x-forwarded-host":"attacker.example"}}))).toThrow();});
