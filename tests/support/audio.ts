// Synthetic mono 8 kHz PCM sine wave. No user recordings or provider calls.
export function wave(seconds = 0.25): Uint8Array {
 const samples = Math.round(seconds * 8000);
 const bytes = new Uint8Array(44 + samples * 2);
 const view = new DataView(bytes.buffer);
 const text = (offset: number, value: string) => {for (let n=0;n<value.length;n++) view.setUint8(offset+n,value.charCodeAt(n));};
 text(0,"RIFF"); view.setUint32(4,bytes.length-8,true); text(8,"WAVE");text(12,"fmt ");
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true);
 view.setUint32(28,16000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,"data");view.setUint32(40,samples*2,true);
 for(let i=0;i<samples;i++)view.setInt16(44+i*2,Math.round(Math.sin(i*2*Math.PI*440/8000)*3000),true);
 return bytes;
}
