
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

/*
	BLAH:async()=>{

		let dirpath =`${globals.home_path}/.data/apps/what/Cool`
		wout(`Making directory: ${dirpath}`);
		if (await fs.mkDir(dirpath)) return cbok();
		cberr("Failed");

	}
*/

PLAYTEST:async()=>{//«

//Worklet Source«
const WORKLET_SRC=`
class RecorderWorkletProcessor extends AudioWorkletProcessor {
	static get parameterDescriptors(){return [{name:'isRecording',defaultValue:0}];}
	process(inputs, outputs, parameters) {
		if (parameters.isRecording[0] === 1) this.port.postMessage({eventType:'data', data: inputs});
		else if(!this.stopped){this.stopped=true;this.port.postMessage({eventType:'done'});}
		return true;
	}
}
registerProcessor('recorder-worklet', RecorderWorkletProcessor);
`;
//»

	let debug = false;
//	let debug = true;
	let path = args.shift();
	if (!path) return cberr("No path");
	let node = await fs.pathToNode(normpath(path));
	if (!node) return cberr("File not found");
	let rafId;
	let mark1="", mark2="";
	let doloop=false;
	let dorec="";
	let buflen;
	let ctx;
	let rec_secs;
	killreg(cb=>{//«
		cancelAnimationFrame(rafId);
		audio.pause();
		termobj.getch_loop(null);
		if (ctx) ctx.close();
		cb&&cb();
	});//»
	const markstr=(val)=>{//«
		if (val==="") return "?";
		return val.toFixed(2);
	};//»
	const send=(dat)=>{//«
		let nchans = dat[0][0].length;
		let len = dat[0][0][0].length;
		let chanlen = dat.length * len;
		let out = [];
		for (let i=0; i < nchans; i++){
			let off=0;
			let chan = new Float32Array(chanlen);
			for (let j=0; j < dat.length; j++){
				let arr = dat[j];
				let a = arr[0][i];
				chan.set(a, off);
				off+=len;
			}
			out.push(chan);
		}
		let buf = ctx.createBuffer(nchans, ctx.sampleRate * rec_secs, ctx.sampleRate);
		for (let i=0; i < nchans; i++) {
			buf.copyToChannel(out[i], i);
		}
		{
			let fname;
			let arr = node.name.split(".");
			if (arr.length > 1) arr.pop();
			fname = arr.join(".")
			let from = Math.round(100*mark1);
			let to = Math.round(100*mark2);
			set_var_str("CUR_FNAME", `${fname}%${from}-${to}.wav`);
		}
		woutobj(bufferToWave(buf));
		ctx.close();
		ctx = null;
		termobj.getch_loop(null);
		cbok();
		dodebug(buf);
	};//»
	const dodebug=(buf)=>{//«
		if (debug) {
			werr("Debugging...");
			if (!globals.audio) Core.api.mkAudio();
			const {mixer, ctx}=globals.audio;
			let source = ctx.createBufferSource();
			source.buffer = buf;
			source.connect(ctx.destination);
			source.start();
		}
	};//»
	const record = async()=>{//«
		dorec = "[REC]";
		audio.currentTime = mark1;
		ctx = new AudioContext();
		let src = ctx.createMediaElementSource(audio);
		let url = URL.createObjectURL(new Blob([WORKLET_SRC], { type:'application/javascript'}));
		await ctx.audioWorklet.addModule(url);
		let worker = new AudioWorkletNode(ctx, 'recorder-worklet');
		let all = [];
		worker.port.onmessage = (e) => {
			if (e.data.eventType === 'data') {
				all.push(e.data.data);
			}
			else if (e.data.eventType === 'done') {
				cancelAnimationFrame(rafId);
				wclerr(`${markstr(mark2)} ${audio.playbackRate}x ${markstr(mark1)}-${markstr(mark2)} [DONE]`);
				dorec = "";
				src.disconnect();
				audio.pause();
				send(all);
			}
			else if (e.data.eventType === 'debug') {
cwarn(e.data.msg);
			}
			else log(e.data);
		};
		worker.parameters.get('isRecording').setValueAtTime(1, ctx.currentTime);
		rec_secs = mark2 - mark1;
		worker.parameters.get('isRecording').setValueAtTime(0, ctx.currentTime + rec_secs);
		src.connect(worker);
		src.connect(ctx.destination);
		audio.play();
	};//»
	const audioloop=()=>{//«
		if (doloop && audio.currentTime >= mark2){
			audio.currentTime = mark1;
		}
		wclerr(`${audio.currentTime.toFixed(2)} ${audio.playbackRate}x ${markstr(mark1)}-${markstr(mark2)} ${dorec}`);
		rafId=requestAnimationFrame(audioloop);
	}//»
	termobj.getch_loop(s=>{//«
		if (dorec){
			return;
		}
		else if (s=="x_"){
			if (!(mark1===""||mark2==="")) {
				audio.pause();
				record();
			}
			return;
		}
		if (s=="LEFT_") audio.currentTime-=10;
		else if (s=="RIGHT_") audio.currentTime+=10;
		else if (s=="LEFT_C") audio.currentTime-=1;
		else if (s=="RIGHT_C") audio.currentTime+=1;
		else if (s=="LEFT_CA") audio.currentTime-=0.1;
		else if (s=="RIGHT_CA") audio.currentTime+=0.1;
		else if (s=="LEFT_CAS") audio.currentTime-=0.01;
		else if (s=="RIGHT_CAS") audio.currentTime+=0.01;

		else if (s=="8_S") audio.playbackRate*=2;//8_S == "*"
		else if (s=="/_") audio.playbackRate/=2;
		else if (s=="SPACE_"){
			if (audio.paused) audio.play();
			else audio.pause();
		}
		else if (s=="1_") {
			if (doloop) return;
			if (Number.isFinite(mark2) && audio.currentTime >= mark2) return;
			mark1 = audio.currentTime;
		}
		else if (s=="2_") {
			if (doloop) return;
			if (Number.isFinite(mark1) && audio.currentTime <= mark1) return;
			mark2 = audio.currentTime;
		}
		else if (s=="c_") {
			mark1=mark2="";
			if (doloop) doloop = false;
		}
		else if (s=="l_") {
			if (!(mark1===""||mark2==="")) {
				doloop = !doloop;
				audio.currentTime = mark1;
			}
		}
	});//»
	let mk = capi.mk;
	let audio = mk('audio');
	audio.src = Core.fs_url(node.fullpath);
	rafId=requestAnimationFrame(audioloop);
},//»

LOOPDOOP:async()=>{//«

killreg(cb=>{
    termobj.getch_loop(null);
	cb&&cb();
})
termobj.getch_loop(ch=>{
	log("IN",ch);
});

},//»

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fs = NS.api.fs;
const capi = Core.api;

const{
	wout,
	werr,
	woutobj,
	cbok,
	cberr,
	normpath,
	kill_register: killreg,
	termobj,
	wclerr,
	set_var_str,
	ENV
} = Shell;

//»


//const bufferToWave=(abuffer, len)=>{
const bufferToWave=(abuffer)=>{//«
  const setUint16=(data)=>{view.setUint16(pos,data,true);pos+=2;};
  const setUint32=(data)=>{view.setUint32(pos,data,true);pos+=4;};
	let numOfChan = abuffer.numberOfChannels;
	let length = abuffer.length * numOfChan * 2 + 44;
//	length = len * numOfChan * 2 + 44,
	let	buffer = new ArrayBuffer(length);
	let view = new DataView(buffer);
	let	channels = [], i, sample;
	let	offset = 0;
 	let	pos = 0;

  // write WAVE header
	setUint32(0x46464952);                         // "RIFF"
	setUint32(length - 8);                         // file length - 8
	setUint32(0x45564157);                         // "WAVE"

	setUint32(0x20746d66);                         // "fmt " chunk
	setUint32(16);                                 // length = 16
	setUint16(1);                                  // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(abuffer.sampleRate);
	setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2);                      // block-align
	setUint16(16);                                 // 16-bit (hardcoded in this demo)

	setUint32(0x61746164);                         // "data" - chunk
	setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
	for(i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

	while(pos < length) {
		for(i = 0; i < numOfChan; i++) {//interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset]));//clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; //scale to 16-bit signed int
			view.setInt16(pos, sample, true);// write 16-bit sample
			pos += 2;
		}
		offset++; // next source sample
	}
//log(view);
  // create Blob
  return new Blob([buffer], {type: "audio/wav"});

}//»


COMS[comarg](args);

}
