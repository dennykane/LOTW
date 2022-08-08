import webmWasm from "./webm-wasm.js";
import defaultConfig from "./defaults.js";

const log=(...args)=>{console.log(...args)};
const cerr=(...args)=>{console.error(...args)};
const cwarn=(...args)=>{console.warn(...args)};

let parentPort = self;
let nframes;
let module;
let Instance;

const nextMessage=(target)=>{//«
  return new Promise(resolve => {
    if ("once" in target) {
      return target.once("message", resolve);
    }
    return target.addEventListener("message", e => resolve(e.data), {
      once: true
    });
  });
}//»

const initWasmModule=(moduleFactory, wasmUrl)=>{//«
  return new Promise(resolve => {
    const module = moduleFactory({
      // Just to be safe, don't automatically invoke any wasm functions
      noInitialRun: true,
      locateFile(url) {
        if (url.endsWith(".wasm")) {
          return wasmUrl;
        }
        return url;
      },
      onRuntimeInitialized() {
        // An Emscripten is a then-able that resolves with itself, causing an infite loop when you
        // wrap it in a real promise. Delete the `then` prop solves this for now.
        // https://github.com/kripken/emscripten/issues/5820
        delete module.then;
        resolve(module);
      }
    });
  });
}//»

const Webm=function(userParams){//«
	let params = Object.assign({}, defaultConfig, userParams);
	if(!('kLive' in params)) {
		params.kLive = params.realtime;
	}
	const instance = new module.WebmEncoder(//«
		params.timebaseNum,
		params.timebaseDen,
		params.width,
		params.height,
		params.bitrate,
		params.realtime,
		params.kLive,
		chunk => {
			const copy = new Uint8Array(chunk);
			parentPort.postMessage(copy.buffer, [copy.buffer]);
		}
	);//»
	///  return target.addEventListener("message", e => f(e.data));
	this.instance = instance;
	this.onmessage=(msg)=>{
		if (!msg) {
			// This will invoke the callback to flush
			instance.finalize();
			// Signal the end-of-stream
			parentPort.postMessage(null);
			// Free up the memory.
			instance.delete();
			Instance = null;
			return;
		}
		instance.addRGBAFrame(msg);
log(nframes++);
	};
};//»

const initModule=async()=>{//«
	module = await initWasmModule(webmWasm, "./webm-wasm.wasm");
	parentPort.postMessage("OK!");
}//»

parentPort.addEventListener("message",e=>{//«
	let msg = e.data;
	if (msg&&msg.params===true){
		if (Instance){
///*
			if (msg==="kill"){
				Instance.instance.delete();
				Instance = null;
				parentPort.postMessage("killed");
				return;
			}
//*/
cerr("Instance exists!");
			return;
		}
		nframes = 0;
		Instance = new Webm(msg);
		return;
	}
	if (!Instance){
cerr("No instance!");
		return;
	}
	Instance.onmessage(msg);	
});//»

initModule();

