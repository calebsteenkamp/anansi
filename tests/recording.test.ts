import {it,expect,vi} from "vitest";
import {recordingSession} from "../lib/recording";
function fixture() {
 const release=vi.fn();
 const fake={state:"recording",mimeType:"audio/webm",ondataavailable:null,onstop:null,onerror:null,stop:vi.fn(function(){fake.state="inactive";})};
 const recorder=fake as unknown as MediaRecorder;
 const ready=vi.fn(),error=vi.fn();
 const session=recordingSession(recorder,{getTracks:()=>[{stop:release}]} as unknown as MediaStream,"audio/webm",ready,error);
 const data=()=>recorder.ondataavailable?.({data:new Blob(["final audio bytes"])} as BlobEvent);
 const end=()=>recorder.onstop?.(new Event("stop"));
 return {fake,recorder,release,ready,error,session,data,end};
}
it("waits for final encoded data before releasing tracks and stopping twice is harmless",()=>{
 const f=fixture();f.session.stop();f.session.stop();expect(f.fake.stop).toHaveBeenCalledTimes(1);expect(f.release).not.toHaveBeenCalled();f.data();f.end();expect(f.ready.mock.calls[0][0].size).toBe(17);expect(f.release).toHaveBeenCalledTimes(1);expect(f.error).not.toHaveBeenCalled();
});
it("reports an empty recording instead of announcing a usable preview",()=>{const f=fixture();f.session.stop();f.end();expect(f.ready).not.toHaveBeenCalled();expect(f.error).toHaveBeenCalledWith(expect.stringContaining("No usable recording"));expect(f.release).toHaveBeenCalledTimes(1);});
it("disposal releases the microphone and suppresses late callbacks",()=>{const f=fixture();f.session.dispose();f.data();f.end();expect(f.ready).not.toHaveBeenCalled();expect(f.error).not.toHaveBeenCalled();expect(f.release).toHaveBeenCalledTimes(1);});
it("recorder errors release resources without later success",()=>{const f=fixture();f.recorder.onerror?.(new Event("error") as ErrorEvent);f.data();f.end();expect(f.error).toHaveBeenCalledTimes(1);expect(f.ready).not.toHaveBeenCalled();expect(f.release).toHaveBeenCalledTimes(1);});
