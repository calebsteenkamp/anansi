import {it,expect} from "vitest";
import {opusPacketDuration, MAX_AUDIO_BYTES, selectRecordingType,validateAudioSize,validateConsent,validateDuration} from "../lib/audio";
it("requires explicit permission consent",()=>{for(const value of [null,undefined,false,true,"true","no",""])expect(()=>validateConsent(value)).toThrow(/permission/);expect(()=>validateConsent("yes")).not.toThrow();});
it("accepts exactly 180 seconds and rejects any over-limit duration before rounding",()=>{
 for(const duration of [0.001,179.9,180])expect(validateDuration(duration)).toBe(Math.ceil(duration*1000));
 for(const duration of [0,-1,NaN,Infinity,180.0001,180.1])expect(()=>validateDuration(duration)).toThrow();
});
it("bounds actual upload bytes",()=>{expect(()=>validateAudioSize(MAX_AUDIO_BYTES)).not.toThrow();for(const size of [0,-1,1.5,MAX_AUDIO_BYTES+1])expect(()=>validateAudioSize(size)).toThrow();});
it("selects supported recording formats and handles upload-only browsers",()=>{
 expect(selectRecordingType(t=>t==="audio/mp4")).toBe("audio/mp4");
 expect(selectRecordingType(()=>false)).toBeNull();
 expect(selectRecordingType(()=>true)).toBe("audio/webm;codecs=opus");
});

it("reads intrinsic Opus timing and rejects invalid frame counts",()=>{
 expect(opusPacketDuration(new Uint8Array([0xf8,0]))).toBe(0.02);
 expect(opusPacketDuration(new Uint8Array([0x18,0]))).toBe(0.06);
 expect(opusPacketDuration(new Uint8Array([0xfb,6]))).toBe(0.12);
 for(const bytes of [[],[0xfb],[0xfb,0],[0xfb,7]])expect(()=>opusPacketDuration(new Uint8Array(bytes))).toThrow();
});
