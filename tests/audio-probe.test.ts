import {it,expect} from "vitest";
import {inspectAudio} from "../lib/audio-probe";
import {wave} from "./support/audio";
it("inspects actual WAV bytes and preserves them unchanged",async()=>{const bytes=wave();const copy=bytes.slice();expect(await inspectAudio(bytes)).toEqual({durationMs:250,mediaType:"audio/wav",extension:"wav"});expect(bytes).toEqual(copy);});
it.each([179.9,180])("accepts real %.1f second audio at the boundary",async(seconds)=>{expect((await inspectAudio(wave(seconds))).durationMs).toBe(Math.ceil(seconds*1000));});
it("rejects actual over-limit audio independent of client metadata",async()=>{await expect(inspectAudio(wave(180.1))).rejects.toMatchObject({code:"audio_too_long"});});
it.each([new Uint8Array(),new TextEncoder().encode("not audio"),wave().slice(0,20),wave().slice(0,100)])("rejects empty, fake or truncated input",async(bytes)=>{await expect(inspectAudio(bytes)).rejects.toMatchObject({status:400});});
