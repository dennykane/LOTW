/*«

Need positions of:
- Segment.Size
- Info.Duration
- Cluster.Size

- Break into BlockGroups



In each BlockGroup (0xa0), after each Block (0xa1), we can insert a
BlockDuration ID (0x9b) followed by the number value (e.g., 0x9e = 0b10011110) in order to
specify how many ticks (1 tick = (1/30)s, or ~ 33ms) of the ticker we want a
given frames to be displayed.

The example of 0x9e for the number is 30 ticks because we have to subtract 0b100000000.
Then we need to multiply whatever the Duration is by 30, which should give us 60 seconds.


*/
/*

The issue here is adding the duration to the webm blob that is given to us after
the MediaRecorder finishes, so that when we play it, we can seek into it.

We are ass_u_me'ing that the value of the length of the Info section is encoded in
one byte, at exactly position 52 and will not overflow when 11 (2 bytes for
Duration_ID 0x4489, 1 byte 0x88 for encoding the length of the duration, and 8
bytes for the floating point representation of duration) is added to it. Have
been seeing the value as 0x99 (153), which adding 11 to gives 0xa4 (164).

Doing this quick and dirty little hack stops us from getting pulled too deeply  into 
binary file/codec insanity and filling up this nice little file with every conceivable
EBML/Matroska type of thing...
»*/

export const lib = (comarg, args, Core, Shell)=>{


const COMS = {

'webmfile':async function(){//«

//General types anywhere:
//ec void
//bf crc32
let path = args.shift();
if (!path) return cberr('No path given!');
let rv = await fsapi.readFile(normpath(path),{binary:true});
if (!rv) return cberr(`${path}: not found`);

let iter=0;
let done = false;
let all=[];
const parse_section=(buf, par)=>{//«
//log(1);
//This has to return something!?!?!
	if (done) return;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}
//log("parse", par);

let c=0;
let flen = buf.length;
let rv;
//let out = par.out;
//let out = {};
//par.out=out;
let kids = [];
while(1){
	if (done) return kids;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}

	let s;
	try{
		s=buf[c].toString(16);
	}
	catch(e){
		werr(`Read error @${c} in ${par.id}`);
		done=true;
		return;
	}
	let ch = s[0];
	let n;

	if (ch=="1"){n=4;}
	else if (ch.match(/[23]/)){n=3;}
	else if (ch.match(/[4-7]/)){n=2;}
	else n=1;
	rv=gethex(buf, c, n);
	let kid = par.kids[rv];

	if (rv=="ec"){}
	else if (!kid){
		cberr(`Invalid id (${rv}) in ${par.id} @${c}`);
		return;
	}
	c+=n;
	let id = rv;
	if (!(rv = ebml_sz(buf,c))) {
//cerr("RETURN!!!");
		return;
	}
	let bytes = buf.slice(rv[1],rv[0]+rv[1]);
	if (kid) {//If not "Void" (0xec)
		kids.push(`${kid.id}:${id}`);
		if (kid.kids) {
			kids.push(parse_section(bytes, kid));
		}
		else {
			kids.push(bytes);
		}

	}
	c=rv[0]+rv[1];
	if (c==flen) break;

}	

return kids;
//all.push(kids);
//return out;

};//»

//let file={};
//log(1);
let got = parse_section(rv, WEBM);
log(got);
//log("DONE",WEBM.kids["18538067"].kids["1f43b675"].kids["a0"].out["a1"]);
//log(WEBM.kids["18538067"].kids["1f43b675"]);
//log(WEBM);
//log(all);
cbok();

},//»

'oldwebmfile':async function(){//«
const check_sz=(v)=>{if(v[0]==-1)return false;return true;};

//«
const SeekHead_ID = "114d9b74";
const Info_ID = "1549a966";
const Tracks_ID = "1654ae6b";
const Cues_ID = "1c53bb6b";
const Cluster_ID = "1f43b675";
const Attachments_ID = "1941a469";
const Chapters_ID = "1043a770";
const Tags_ID = "1254c367";
const Void_ID="ec";
const Segment_IDs = [//«
	Void_ID,
	SeekHead_ID,
	Info_ID,
	Tracks_ID,
	Cues_ID,
	Cluster_ID,
	Attachments_ID,
	Chapters_ID,
	Tags_ID
];//»
const Segments = [//«
"Void",
"SeekHead",
"Info",
"Tracks",
"Cues",
"Cluster",
"Attachments",
"Chapters",
"Tags"
];//»
const Timestamp_ID="e7";
const SilentTracks_ID="5854";
const Position_ID="a7";
const PrevSize_ID="aB";
const SimpleBlock_ID="a3";
const BlockGroup_ID="a0";

const Cluster_IDs=[
	Timestamp_ID,
	SilentTracks_ID,
	Position_ID,
	PrevSize_ID,
	SimpleBlock_ID,
	BlockGroup_ID
];

const Clusters=[
	"Timestamp",
	"SilentTracks",
	"Position",
	"PrevSize",
	"SimpleBlock",
	"BlockGroup"
];
//»

let webm={};
let duration;
let seg={
	Cluster:[]
};
webm.Segment=seg;
let path = args.shift();
if (!path) return cberr('No path given!');

let rv = await fsapi.readFile(normpath(path),{binary:true});
if (!rv) return cberr(`${path}: not found`);
let b, c;
let o={};

let flen = rv.length;
b = rv;

if (!(b[0]==0x1a&&b[1]==0x45&&b[2]==0xdf&&b[3]==0xa3)) return cberr('Not ebml');

rv = ebml_sz(b,4);
webm.Header = b.slice(rv[1], rv[0]+5);
c = rv[1]+rv[0];
if (!(b[c]==0x18&&b[c+1]==0x53&&b[c+2]==0x80&&b[c+3]==0x67)) return cberr('Segment not found');
c+=4;
if (!(rv = ebml_sz(b,c))) return;
c=rv[1];
let iter=0;
let clusters=[];
while(1){//«
	iter++;
	if (iter>=100) {
		cerr("yinifinitee smigizzm!?!?");
		break;
	}
	if (b[c]==0xec) {
		rv = "ec";
		c++;
	}
	else {
		rv=gethex(b, c, 4);
		c+=4;
	}
	let pos = Segment_IDs.indexOf(rv);
	let idstr = Segments[pos];
	if (pos===-1){
		break;
	}
	if (!(rv = ebml_sz(b,c))) return;
	let bytes = b.slice(rv[1],rv[0]+rv[1]);
	if (idstr=="Cluster") clusters.push(bytes);
	else if (idstr=="Info"){

		let c=0;
		let iter=0;
		let b = bytes;
		let flen = b.length;
		let o={};
		let rv;

		let ids={
			"73a4":"SegmentUID",
			"7384":"SegmentFilename",
			"3cb923":"PrevUID",
			"3c83ab":"PrevFilename",
			"3eb923":"NextUID",
			"3e83bb":"NextFilename",
			"4444":"SegmentFamily",
			"6924":"ChapterTranslate",
			"2ad7b1":"TimestampScale",
			"4489":"Duration",
			"4461":"DateUTC",
			"7ba9":"Title",
			"4d80":"MuxingApp",
			"5741":"WritingApp"
		};

		while(1){//«
			iter++;
			if (iter>=100) {
				cerr("drininititie finititeeee!?!?");

				break;
			}
			let s=b[c].toString(16);
			let ch = s[0];
			let n;
			if (s=="1"){n=4;}
			else if (s.match(/[23]/)){n=3;}
			else if (s.match(/[4-7]/)){n=2;}
			else n=1;
			rv=gethex(b, c, n);
			let id = ids[rv];
			if (!id){
				cberr(`Invalid id in Info @${c}`);
				return;
			}
			c+=n;
			if (!(rv = ebml_sz(b,c))) {
				return;
			}
			let dat = b.slice(rv[1],rv[0]+rv[1]);
			if (id=="Duration"){

				let dur;
				dat.reverse();
				let view;
				if (dat.length==4) view = new Float32Array(dat.buffer);
				else if (dat.length==8) view = new Float64Array(dat.buffer);
				else {
console.log(dat);
					return cberr(`Invalid duration data @${c+rv[1]}! (see console)`);
				}
				duration = view[0];
				o.Duration=duration;
			}
			else o[id]=dat;
			c=rv[0]+rv[1];
			if (c==flen) {
				break;
			}
		}//»

		seg.Info = o;

	}
	else seg[idstr] = bytes;
	c=rv[0]+rv[1];
	if (c==flen) break;
}
//»
for (let b of clusters) {//«
flen = b.length;
iter=0;
c=0;
let blocks = [];
let cluster={};
cluster.Blocks=blocks;
while(1){
	iter++;
	if (iter>=10000) {
		cerr("yinifinitee smigizzm!?!?");
		break;
	}
	if (b[c]==0x58&&b[c+1]==0x54) {
		rv = "5854";
		c+=2;
	}
	else {
		rv=gethex(b, c, 1);
		c++;
	}
	let pos = Cluster_IDs.indexOf(rv);
	if (pos===-1){
		break;
	}
	let idstr = Clusters[pos];
	if (!(rv = ebml_sz(b,c))) return;
	let bytes=b.slice(rv[1],rv[0]+rv[1])
	if (idstr=="SimpleBlock"||idstr=="BlockGroup") {//«
///*
		let ids={//«
			"a1":"Block",
			"75a1":"BlockAdditions",
			"9b":"BlockDuration",
			"fa":"ReferencePriority",
			"fb":"ReferenceBlock",
			"a4":"CodecState",
			"75a2":"DiscardPadding",
			"8e":"Slices"
		};//»

		let c=0;
		let iter=0;
		let b = bytes;
		let flen = b.length;
		let o={};
		let rv;

		while(1){//«
			iter++;
			if (iter>=100) {
				cerr("drininititie finititeeee!?!?");

				break;
			}
			let chold=c;
			let s=b[c].toString(16);
			if (b[c]<0x80) {
				s+=b[c+1].toString(16);
				c++;
			}
			c++;
			let idstr = ids[s];
			if (!idstr){
				cberr(`Invalid id in BlockGroup @${chold}`);
				return;
			}
			if (!(rv = ebml_sz(b,c))) {
				return;
			}
			let dat = b.slice(rv[1],rv[0]+rv[1]);
			o[idstr]=dat;
			bytes=o;
			c=rv[0]+rv[1];
			if (c==flen) {
				break;
			}
		}//»

//*/
		blocks.push(bytes);
	}//»
	else if (idstr=="Timestamp"){
		let arr = [];
		for (let i=0; i < 4; i++)arr[i] = bytes[i];
		cluster.Timestamp = new Uint32Array(arr)[0];
	}
	c=rv[0]+rv[1];
	if (c==flen) break;
}
seg.Cluster.push(cluster);

}//»
//log(webm);
//webm.toString=function(){
//	return `[Webm(${(duration?duration:"?")+"ms"})]`;
//}
//woutobj(webm);
log(webm);
cbok();

},//»

'termrec':function(){//«

let image_w = 1366;
let image_h = 768;
let ms;

if (!args.length) return cberr("No arg!");
let which = args.shift();
if (!which.match(/^[0-9]+$/)) return cberr("Invalid term arg");
let win = document.getElementById(`win_${which}`);
if (!(win&&win.obj)) return cberr("No window/app");
if (!win.app=="sys.Terminal") return cberr("Not a terminal");
globals.termrec_termobj = win.obj;

werr("q to quit");

let arr = new TermSnapArray(image_w, image_h);
let nframes=0;
let start;

const dumpit=async()=>{
try{
	let blob = await arr.toImgVideo();
	let b = new Uint8Array(await Core.api.toBuf(blob));
if (!(b[48]===0x15&&b[49]===0x49&&b[50]===0xa9&&b[51]===0x66)){
log(b);
//const Info_ID = "1549a966";
return cberr(`webm container: Expecting Info_ID 0x1549a966 (21,73,169,162) at byte 48!? Check console.`);
}
if (b[INFO_STARTS_AT_BYTE]!==0x99){
console.error(`b[INFO_STARTS_AT_BYTE] !== 0x99 (got: ${b[INFO_STARTS_AT_BYTE]})`);
}
	b[INFO_STARTS_AT_BYTE]+=11;

	let fview = new Float64Array(1);
	fview[0] = parseFloat(`${ms}.0`);
	werr(`Okay, want to add ${ms}...`);
	let bview = new Uint8Array(fview.buffer);
	let nums = [0x44, 0x89, 0x88];
	nums = nums.concat(...(bview.reverse()));
	let mid = new Uint8Array(nums);
	let beg = b.slice(0,INFO_STARTS_AT_BYTE+1);
	let end = b.slice(INFO_STARTS_AT_BYTE+1);
	woutobj(new Blob([beg,mid,end],{type:"video/webm"}));
	cbok();
}
catch(e){
cberr(`Error: ${e}`);
}
};
const cleanup=()=>{
	termobj.getch_loop(null);
	delete globals.termrec_snap;
	globals.termrec_snap=undefined;
	delete globals.termrec_termobj;
	globals.termrec_termobj=undefined;
};
termobj.kill_register(cb=>{
	cleanup();
	cb&&cb();
});

termobj.getch_loop(ch=>{//«
	if (ch=="q"||ch=="Q"){
		cleanup();
//		wout(arr);
//		cbok();
		werr("Stopped. Now recording...");
		dumpit();
	}
});//»
globals.termrec_snap=(obj)=>{//«
	let now;
	if (!nframes) now = start = window.performance.now();
	else now = window.performance.now();
	let off = Math.floor(now-start);
	nframes++;
	ms=off;
	wclerr(`frames: ${nframes}   off: ${off}ms`);
	obj.off = off;
//	all.push(obj);
//	all.push(new TermSnap(obj));
	arr.add(new TermSnap(obj, image_w, image_h, nframes));
};//»

},//»

'beep':function(){//«

	var type;
	var waveform;
	var ctx = globals.audio.ctx;
	var freq;
	var msdur;
	var maxgain=1;

	function start(){//«
		var osc = ctx.createOscillator();
		var out = ctx.createGain();
		out.gain.value = 0;
		if (waveform) osc.setPeriodicWave(waveform);
		else if (type) osc.type=type;
		if (freq) osc.frequency.value = freq;
		osc.connect(out);
		out.connect(ctx.destination);
		osc.start();
		out.gain.linearRampToValueAtTime(maxgain, ctx.currentTime+0.005);
		var killed=false;
		var done = (killcb)=>{
			if (killed) return;
			killed=true;
//			cbok();
			out.gain.linearRampToValueAtTime(0, ctx.currentTime+0.005);
			setTimeout(()=>{
				out.disconnect();
			},25);
			killcb&&killcb();
		}
		termobj.kill_register(done);
		if (msdur) setTimeout(done,msdur);

	}//»
	var sws = failopts(args,{SHORT:{t:3,f:3,g:3}});
	if (!sws) return;

	var freqstr = sws.f;
	if (freqstr) {
		let num = strnum(freqstr, 0.01, 20000);
		if (!num) return cberr("Invalid freq parameter (need 0.01-20000)");
		freq = num;
	}
	var timestr = sws.t;
	if (timestr){
		let num = strnum(timestr,0.1,60);
		if (!num) return cberr("Invalid time parameter (need 0.1 - 60 seconds)");
		msdur = Math.floor(num*1000);
	}
	var gainstr = sws.g;
	if (gainstr){
		let num = strnum(gainstr,0,1);
		if (!num) return cberr("Invalid gain (need 0-1)");
		maxgain = num;
	}


	var which = args.shift();
	if (which){
		if (["sine","square","sawtooth","triangle"].includes(which)) {
			type = which;
			start();
		}
		else {
			fs.get_json_file(_.normpath(which),(arr,err)=>{
				if (!arr) return cberr(which+ " Could not get the json file!");
				if (!(arr && arr.length==2 && arr[0].length==arr[1].length)) return cberr("Invalid json waveform data");
				try {
					waveform = ctx.createPeriodicWave(new Float32Array(arr[0]), new Float32Array(arr[1]));
				} 
				catch(e) {
					cberr("Invalid waveform data: ");
					return;
				}
				start();
			});
		}
	}
	else start();

},//»
'analyze':function(){//«
	var ctx = globals.audio.ctx;
	var fftnum=5;
	var msdur = null;
	var sws = failopts(args, {
		SHORT: {"t":3, "n":3}//t==time(seconds), n=fft number, 5-15, FFTSIZE=2^n
	});
	if (!sws) return;
	var numstr = sws.n;
	if (numstr) {
		let num = strnum(numstr, 5, 15);
		if (!num) return cberr("Invalid FFT parameter (need base2 exponent: 5-15)");
		fftnum = num;
	}
	var timestr = sws.t;
	if (timestr){
		let num = strnum(timestr,0.1,60);
		if (!num) return cberr("Invalid time parameter (need 0.1 - 60 seconds)");
		msdur = Math.floor(num*1000);
	}
	if (!aumod) return cberr("No audio module!");
	aumod.get_audio_stream((stream,err)=>{
		if (!stream) return  cberr(err);
		var track = stream.getTracks()[0];
		var src = ctx.createMediaStreamSource(stream);
		var FFTSIZE = 2**(fftnum);
		var func = aumod.get_wavetable(src, FFTSIZE);
		var killed = false;
		var done = ()=>{
			if (killed) return;
			killed = true;
			cbok(JSON.stringify(func(),null,"  "));
			track.stop();
		}
		termobj.kill_register(done);
		if (msdur) setTimeout(done,msdur);
		werr("Analyzing... (^C to stop)");
	});
},//»
'auviz':function(){//«
	var analyser;
	var analyser_arr;
	var killed = false;
	var stdincb;
	const TIME = 1;
	const FREQ = 2;
	function render(){
		if (killed) return;
		if (which==TIME) analyser.getByteTimeDomainData(analyser_arr);
		else analyser.getByteFrequencyData(analyser_arr);

//		analyser.getFloatTimeDomainData(analyser_arr);
		stdincb(analyser_arr);
		requestAnimationFrame(render);
	}
	var ctx = globals.audio.ctx;
	var fftnum=5;
	var msdur = null;
	var sws = failopts(args, {
		SHORT: {"t":3, "n":3}//t==time(seconds), n=fft number, 5-15, FFTSIZE=2^n
	});
	if (!sws) return;
	var numstr = sws.n;
	if (numstr) {
		let num = strnum(numstr, 5, 15);
		if (!num) return cberr("Invalid FFT parameter (need base2 exponent: 5-15)");
		fftnum = num;
	}
	var timestr = sws.t;
	if (timestr){
		let num = strnum(timestr,0.1,60);
		if (!num) return cberr("Invalid time parameter (need 0.1 - 60 seconds)");
		msdur = Math.floor(num*1000);
	}

	var serv = args.shift();
	if (!serv) return cberr("Service needed!");
	var which = args.shift();
	if (!which||which=="time") which = TIME;
	else if (which=="freq") which = FREQ;
	else return cberr("Unknown type: " + which);
	ptw(serv,fobj=>{//«
		if (!(fobj&&fobj.root.TYPE=="service"&&isobj(fobj._)&&isobj(fobj._.exports))) return cberr(serv+": Not a service");
		if (!(fobj._.exports.name == "AudioRenderer")) return cberr("The service is not named 'AudioRenderer', but: "+fobj._.exports.name);

		if (which==TIME) stdincb = fobj._.exports.timein;
		else stdincb = fobj._.exports.freqin;

		if (!stdincb instanceof Function) return cberr("No stdin export function!?!?!?!");
		if (!aumod) return cberr("No audio module!");
		aumod.get_audio_stream((stream,err)=>{
			if (!stream) return  cberr(err);
			var track = stream.getTracks()[0];
			var src = ctx.createMediaStreamSource(stream);
			var FFTSIZE = 2**(fftnum);
			analyser = ctx.createAnalyser();
			analyser.fftSize = FFTSIZE;
//				analyser_arr = new Float32Array(analyser.frequencyBinCount)
			analyser_arr = new Uint8Array(analyser.frequencyBinCount)
			analyser.smoothingTimeConstant = 0;
			src.connect(analyser);
			var done = ()=>{
				if (killed) return;
				killed = true;
				cbok();
				track.stop();
			}
			termobj.kill_register(done);
			if (msdur) setTimeout(done,msdur);
			werr("Rendering... (^C to stop)");
			requestAnimationFrame(render)
		});
	});//»
},//»
'opusdec':function(){//«
	var arr = [];
	//«
	var sws = failopts(args,{//«
		SHORT:{
			b:3,
			c:3
		},
		LONG:{
			rate:3,
			channels:3,
		}
	});//»
	if (!sws) return;
	var tmp;
	var channels=1;
	tmp = sws.channels||sws.c;
	if (tmp) {
		tmp = strnum(num);
		if (!(isint(tmp)&&tmp>=1&&tmp<=8)) return cberr("Invalid number of channels");
		channels = tmp;
	}

	var rate = 8000;
	tmp = sws.rate;
	if (tmp) {
		tmp = strnum(tmp);
		if (!(isint(tmp)&&tmp>4000&&tmp<96000)) return cberr("Invalid rate");
		rate = tmp;
	}
	//»
	const MAX_FRAME_SIZE = 960*6;
	var packin, outbuf, malloc;
	var heapu8,heap32;
	var mod,asm;
	var od;
	var is_ready=false;
	const BUFSIZE = 2**12;
	fs.getmod("util.wasm",(wasm)=>{//«
		if (!wasm) return cberr("No wasm module!");
		Core.get_wasm('opus',(wasmret)=>{
			if (!wasmret) return cberr("No opus.wasm!");
			wasm.WASM({wasmBinary:wasmret}, "opus", (modarg)=>{
				mod=modarg;
				asm = mod.asm;
				heapu8 = mod.HEAPU8;
				heap32 = mod.HEAP32;
				malloc=mod._malloc;
				od = asm._opus_decoder_create(rate, channels, malloc(4));
				if (!od) return cberr("_opus_decoder_create: fail");
				packin = malloc(1000);
				outbuf = malloc(MAX_FRAME_SIZE*4);
				is_ready=true;
			});
		});
	});//»
	read_stdin(obj=>{//«
		if (iseof(obj)) return cbok();
		if (!is_ready) return;
		if (!(isobj(obj)&&obj.is_audio)) return;
		var dat = obj.data;
		var len = dat.length;
		if (len > MAX_FRAME_SIZE) return cerr("PACKET SIZE TOO BIG: "+len);
		heapu8.set(dat, packin);
		var frame_size = asm._opus_decode_float(od, packin, len, outbuf, MAX_FRAME_SIZE, 0);
		if (frame_size < 0) return cerr("BADDECODE");
		var samps = new Float32Array((heapu8.slice(outbuf, outbuf+channels*frame_size*4)).buffer);
		woutobj(mkfakeobj("auf32",{is_audio:true, data: samps},[samps.length]));
	});//»
},//»
'opusenc':function(){//«
	var tmp, ret; //«
	var sws = failopts(args,{//«
		SHORT:{
			b:3,
			c:3,
			i:3,
			o:3,
			f:3
		},
		LONG:{
			bitrate:3,
			channels:3,
			input_rate:3,
			output_rate:3,
			frame_size:3
		}
	});//»
	if (!sws) return;
	var channels=1;
	tmp = sws.channels||sws.c;
	if (tmp) {
		tmp = strnum(tmp);
		if (!(isint(tmp)&&tmp>=1&&tmp<=8)) return cberr("Invalid number of channels");
		channels = tmp;
	}

	var bitrate=32000;
	tmp = sws.bitrate||sws.b;
	if (tmp) {
		tmp = strnum(tmp);
		if (!(isint(tmp)&&tmp>500&&tmp<1024000)) return cberr("Invalid bitrate");
		bitrate = tmp;
	}

	var input_rate = 8000;
	tmp = sws.input_rate;
	if (tmp) {
		tmp = strnum(tmp);
		if (!(isint(tmp)&&tmp>4000&&tmp<96000)) return cberr("Invalid input_rate");
		input_rate = tmp;
	}

	var coding_rate;

	if(input_rate>24000)coding_rate=48000;
	else if(input_rate>16000)coding_rate=24000;
	else if(input_rate>12000)coding_rate=16000;
	else if(input_rate>8000)coding_rate=12000;
	else coding_rate=8000;

	var frame_size = 960;
	var fr_sz_map={//«
		"2.5":120,
		"5":240,
		"10":480,
		"20":960,
		"40":1920,
		"60":2880
	}//»
	tmp = sws.frame_size||sws.f;
	if (tmp) {
		tmp = fr_sz_map[tmp];
		if (!tmp) return cberr("Invalid frame size (need: 2.5, 5, 10, 20, 40, or 60");
		frame_size = tmp;
	}
	frame_size=frame_size/(48000/coding_rate);

	//»
	const OPUS_APPLICATION_VOIP = 2048;
	const OPUS_APPLICATION_AUDIO = 2049;

	var malloc, error;

	var is_ready = false;
	var heapu8, heap32;
	var oe;//OpusEncoder
	var max_frame_bytes = (1275*3+7);
	var min_bytes = max_frame_bytes;
	var packet,input;
	var mod,asm;
	fs.getmod("util.wasm",(wasm)=>{//«
		if (!wasm) return cberr("No wasm module!");
		Core.get_wasm('opus',(wasmret)=>{
			if (!wasmret) return cberr("No opus.wasm!");
			wasm.WASM({wasmBinary:wasmret}, "opus", (modarg)=>{
				if (!modarg) return cberr("No module!!");
				mod = modarg;
				asm = mod.asm;
				heapu8 = mod.HEAPU8;
				heap32 = mod.HEAP32;
				malloc = mod._malloc;
				error = malloc(4);
				packet = malloc(max_frame_bytes);
				input = malloc(frame_size*4);
				oe = asm._opus_encoder_create(coding_rate, channels, OPUS_APPLICATION_AUDIO, error);
				if (!oe) return cberr("_opus_encoder_create: fail");
				var bitrate_arr = new Uint8Array((new Uint32Array([bitrate])).buffer);
				var bitrate_ptr = oe+(37*4);
				heapu8.set(bitrate_arr, bitrate_ptr);
				heapu8.set(bitrate_arr, bitrate_ptr+4);
				is_ready = true;
			});
		});
	});//»
	var hold = null;
	var buffer = null;
	var zeros = new Uint8Array(max_frame_bytes);
	respbr();
	read_stdin(obj=>{//«
		if (iseof(obj)) return cbok();
		if (!is_ready) return;
		if (!(isobj(obj)&&obj.is_audio)) return;
		var samps = obj.data;
		var endpos = 0;
		if (!buffer) {
			let mult = 1+(Math.floor(samps.length/frame_size));
			buffer = new Float32Array(mult*frame_size);
		}
		if (hold) {
			buffer.set(hold,0);
			endpos+=hold.length;
		}
		buffer.set(samps, endpos);
		endpos+=samps.length;
		for (let i=0; i < endpos;i+=frame_size) {
			let got_samps = buffer.slice(i, i+frame_size);
			let diff = frame_size - got_samps.length;
			if (diff) {
				hold = got_samps;
				break;
			}
			else hold = null;
			let arr = new Uint8Array(got_samps.buffer);
			heapu8.set(arr, input);
			let nbytes = asm._opus_encode_float(oe, input, frame_size-diff, packet, max_frame_bytes);
			if (nbytes < 0) {
				return cberr("Encoding failed: " + nbytes);
			}
			let bytes = heapu8.slice(packet, packet+nbytes);
			woutobj(mkfakeobj("auenc",{
				is_audio:true, 
				rate: coding_rate,
				channels: channels,
				data: bytes
			},[bytes.length]));
		}
	});//»
},//»
'resample':function(){//«
	var which = args.shift();
	if (!(which=="up"||which=="down")) return cberr("Need 'up' or 'down'!");

	const NUM_CHANNELS = 1;
	const BUFFER_LEN = 2**12;
	const BYTES_PER_FRAME = 4;
	var converter = 2;
	var sample_rate_in;
	var sample_rate_out;
	if (which=="down") {
		sample_rate_in = 48000;
		sample_rate_out = 8000;
	}
	else {
		sample_rate_in = 8000;
		sample_rate_out = 48000;
	}
	var src_ratio = sample_rate_out/sample_rate_in;
	var src_data, src_data_ptrs, src_data_val, src_state;
	var input, output;
	var heapu8;
	var mod = null;
	var malloc, tmp, ret, error;
	var is_ready = false;
	var asm;
	fs.getmod("util.wasm",(wasm)=>{//«
		if (!wasm) return cberr("No wasm module!");
		Core.get_wasm('samplerate',(wasmret)=>{
			if (!wasmret) return cberr("No samplerate.wasm!");
			wasm.WASM({wasmBinary:wasmret}, "samplerate", (modarg)=>{
				if (!modarg) return cberr("No module!!");
				mod = modarg;
				asm = mod.asm;
				heapu8 = mod.HEAPU8;
				malloc = mod._malloc;
				src_data = malloc(36);
				src_data_ptrs ={//«
					data_in:src_data,
					data_out:src_data+4,
					input_frames:src_data+8,
					output_frames:src_data+12,
					input_frames_used:src_data+16,
					output_frames_gen:src_data+20,
					end_of_input:src_data+24,
					src_ratio:src_data+28
				}//»
				src_data_val = (key)=>{//«
					var loc = src_data_ptrs[key];
					if (!loc) {
					cerr("Unknown src_data key: " + key);
						return null;
					}
					if (key=="src_ratio") return (new Float64Array(heapu8.slice(loc,loc+8).buffer))[0];
					return (new Uint32Array(heapu8.slice(loc,loc+4).buffer))[0];
				}//»
				error = malloc(4);
				src_state = asm._src_new(converter, NUM_CHANNELS , error);

				input = malloc(BUFFER_LEN);
				tmp = new Uint32Array([input]);
				heapu8.set(new Uint8Array(tmp.buffer), src_data);//*data_in

				output = malloc(BUFFER_LEN);
				tmp = new Uint32Array([output]);
				heapu8.set(new Uint8Array(tmp.buffer), src_data+4);//*data_out
				ret = asm._src_set_ratio_init(src_data, src_ratio);
				tmp = new Uint32Array([(BUFFER_LEN/NUM_CHANNELS)/BYTES_PER_FRAME]);
				heapu8.set(new Uint8Array(tmp.buffer), src_data+12);//output_frames
				is_ready = true;
			});
		})
	});//»
	read_stdin(samps=>{//«
		if (iseof(samps)) return cbok();
		if (!is_ready) return;
		if (!(isobj(samps)&&samps.is_audio)) return;
		var voicefloat = samps.data;

		tmp = new Uint32Array([voicefloat.length]);
		heapu8.set(new Uint8Array(tmp.buffer), src_data+8);//input_frames

		heapu8.set(new Uint8Array(voicefloat.buffer), input);//&input
		error = asm._src_process(src_state, src_data);
	//	error = mod._src_process(src_state, src_data);
		if (error) {
			cberr("Error: "+error);
			return;
		}
		let output_frames_gen = src_data_val("output_frames_gen");
		var samps = new Float32Array(heapu8.slice(output, output+output_frames_gen*BYTES_PER_FRAME).buffer);
		woutobj(mkfakeobj("auf32",{is_audio:true, data: samps},[samps.length]));
	});//»
},//»
'play': function() {//«

	var samps_arr=[];
	var scrnode = audio_ctx.createScriptProcessor(BUFSIZE, 1, 1);
	var BUFSIZE = 2**12;
	scrnode.onaudioprocess = function(evt) {
		var buf = new Float32Array(BUFSIZE);
		var totlen = 0;
		var iter=0;
		while(1) {
			if (!samps_arr.length) break;
			let arr = samps_arr.shift();
			let subarr = arr.slice(0,BUFSIZE-totlen);
			buf.set(subarr, totlen);
			totlen+=subarr.length;
			if (subarr.length < arr.length) {
				samps_arr.unshift(arr.slice(subarr.length));
				break;
			}
		}
		evt.outputBuffer.copyToChannel(buf,0);
	};
	scrnode.connect(audio_ctx.destination);

	read_stdin(obj=>{
		if (iseof(obj)) return cbok();
		if (!(isobj(obj)&&obj.is_audio)) return;
		samps_arr.push(obj.data);
	});

},//»
'midi2synth':function() {//«

	var eout = function(str){werr(str);refresh();};
	var pi = _=>parseInt(_);

	var didparse = false;

	var defs = [];

function evtin(e) {//«
	var einval = _=>eout("Invalid midi packet");
//console.log(e);
	if (!isobj(e)) return;
	if (iseof(e)) return cbok();
	if (!didparse) return;
	var dat = e.data;
	if (!(dat&&isarr(dat))) return;
	var datlen = dat.length;
	if (!(datlen==2||datlen==3)) return einval();
	var n1 = dat[0], n2 = dat[1];
	if (!(n1 >= 0 && n1 <= 255 && n2 >=0 && n2 <= 255)) return einval();
	var n3;
	if (datlen==3) {
		n3 = dat[2];
		if (!(n3 >= 0 && n3 <= 255)) return einval();
	}

	let maj = defs[n1];
	if (!maj) return cwarn("No major: " + n1);
	if (!isarr(maj)) {
		cerr("MAJ NOT AN ARRAY!??!?!??!");
		log(maj);
		return;
	}
	if (maj[0] instanceof Function) {
		for (let f of maj) f(dat);
		return;
	}

	let min = maj[n2];
	if (!min) return cwarn("No minor: " + n2);
	if (isobj(min)) {//«
		if (dat.length==2) return cwarn("Got value object with dat.length==2");
		let marr;
		for (let k of getkeys(min)) {
			if (marr=k.match(/^(\d+)(?:-(\d+))?$/)) {
				let low = pi(marr[1]);
				if (!marr[2]) {
					if (n3===low) {
						if (isarr(min[k])) {
							for (let f of min[k]) f(dat);
						}
					}
				}
				else {
					let hi = pi(marr[2]);
					if (n3 >= low && n3 <= hi) {
						if (isarr(min[k])) {
							for (let f of min[k]) f(dat);
						}
					}
				}
			}
		}
	}//»
	else if (isarr(min)) {
		if (min[0] instanceof Function) {
//log(min);
			for (let f of min) f(dat);
		}
		else {
cerr("WHADDA HELL IM YIM MIN");
log(min)
		}
	}
	else {
cwarn("WHAT IM YIM MIN");
log(min)
	}
}//»

	function parse(arr, exports){//«
/*«
0

176 , 1

knob/k1 $VAL 

»*/
		var curarr, curmin, curmax;
		var marr;
		var iter = 0;
		for (let ln of arr) {
			iter++;
			let lnerr = str=>{cberr(str+", line "+iter);}
			ln = ln.trim();
			if (!ln) continue;
			if (marr=ln.match(/^(\d+)(?: *, *(\d+)(?:-(\d+))?(?: *, *(\d+)(?:-(\d+))?)?)?$/)) {//«

			/*«

			MAJDEFS:=[ 
					   Maj_Function_1 | MINOR_DEF_1, 
					   Maj_Function_2 | MINOR_DEF_2, 
					   ..., 
					   Maj_Function_N | MINOR_DEF_N
					 ]

			MINOR_DEF:= [
						Min_Function_1 | {"val1_1": Val_Function_1} | {"val1_1-val2_1": Val_Function_1},
						Min_Function_2 | {"val1_2": Val_Function_2} | {"val1_2-val2_2": Val_Function_2},
						...
						Min_Function_3 | {"val1_3": Val_Function_3} | {"val1_3-val2_3": Val_Function_3},
					]

			»*/

			let maj = pi(marr[1]),min1,min2,val1,val2;
			if (marr[2]) {
				min1 = pi(marr[2]);
				if (marr[3]) {
					min2 = pi(marr[3]);
					if (min2 <= min1) return lnerr("Bad minor range");
				}
				if (marr[4]) {
					val1 = pi(marr[4]);
					if (marr[5]) {
						val2 = pi(marr[5]);
						if (val2 <= val1) return lnerr("Bad value range");
					}
				}
			}
	//cwarn("MIDI DEF IN");log(maj,min1,min2,val1,val2);
			if (isnull(min1)) {
				curarr = defs;
				curmin = maj;
				curmax = maj;
			}
			else {
				let gotarr = defs[maj];
				if (!gotarr) {
					gotarr = [];
					defs[maj] = gotarr;
				}
				curarr = gotarr;
				curmin = min1;
				if (isnum(min2)) curmax = min2;
				else curmax = min1;
				if (isnum(val1)) {
					let valstr = ""+val1;
					if (isnum(val2)) valstr+="-"+val2;
					let gotobj;

					for (let i=curmin; i <= curmax; i++) {
						gotobj = curarr[i];
						if (!gotobj) {
							gotobj = {};
							curarr[i] = gotobj;
						}
		//				let obj = {};
						gotobj[valstr] = 0;
					}
				}
			}

			}//»
			else {
		//	path/to/func 	val_to_send 	[val_func]
	// 
		//log(curarr);
		//log(curmin, curmax);
				let toks = [];
	//Get toks«
				let chars = ln.split("");
				let tok="";

				let instr = false;
				for (let i=0; i < chars.length; i++) {
					let ch = chars[i];
					if (ch==='"') {
						if (!instr) {
							if (tok) toks.push(tok);
							instr = true;
							tok = "";
						}
						else {
							toks.push(tok);
							instr = false;
							tok = "";
						}
						continue;
					}
					else if (!instr) {
						if (ch==" "||ch=="\t") {
							if (tok) {
								toks.push(tok);
								tok="";
							}
							continue;
						}
						else if (ch=="#") break;
						else tok+=ch;
					}
					else tok+=ch;
				}
				if (instr) return cberr("Unterminated quote, line: "+iter);

				if (tok) toks.push(tok);
				//»
				if (toks.length < 2) return lnerr("Need at least a function and value");
				let funcname = toks[0];
				let strval = toks[1];
				let expfunc = exports[funcname];
				if (!(expfunc instanceof Function)) return lnerr(funcname+": Not a function");
				let func = function(args){
					let val;
					if (strval=="$VAL") val = args[2];
					else if (strval=="$MAJ") val = args[0];
					else if (strval=="$MIN") val = args[1];
					else {
						val = strval;
						if (val.match(/^\d+$/)) val = pi(val);
					}
					expfunc(val);
				}
				for (let i = curmin; i <= curmax; i++) {//«
					let obj = curarr[i];
					let arr;
					if (isobj(obj)) {
						for (let k of getkeys(obj)) {
							arr = obj[k];
							if (!arr) {
								arr = [];
								obj[k] = arr;
							}
							arr.push(func);
						}
					}
					else {
						arr = curarr[i];
						if (!arr) {
							arr = [];
							curarr[i] = arr;
						}
						arr.push(func);
					}
				}//»
			}
		}
		return true;
	}//»

	var sws = failopts(args,{SHORT:{},LONG:{}});
	if (!sws) return;

	var reader = get_reader();
	var ispipe = reader.is_pipe;
	var conffile = args.shift();
	if (!conffile) return cberr("No configuration file!");
	var name;
	arg2con(conffile, function(ret) {//«
		if (!isstr(ret)) return cberr(conffile+": Could not get the contents");
		var arr = ret.split("\n");

/*NOTES«

//VARS:

//$MAJ = current major number
//$MIN = current minor number
//$VAL = current value

//File format:

//<num> or link_path #This is the first line

//maj[,min0[-min1][,val0[-val1]]] 
//	path/to/func/1 val_to_send_1 opt_val_func_1 #comments
//	path/to/func/2 val_to_send_2 opt_val_func_2 #comments


Map 1, 2, or 3  numbers to: a number, string, or boolean

VARS:

$MAJ = current major number
$MIN = current minor number
$VAL = current value

File format:

<num> or link_path #This is the first line

maj[,min0[-min1][,val0[-val1]]] path/to/func val_to_send opt_val_func #comments


For each, event we can have any number of values that map to 
any number of functions, which are named by files in /serv/<num>/.

Get the functions like this:
fs.get_serv_func(fullpath, function(funcret, errret){});

So, for example, for any given keydown, we can do this:

1) write a frequency to something like /serv/synth<n>/data/dat1 
2) call a start function of an envelope/trigger at /serv/synth<n>/triggers/trg1

There is also the possibility to use a data node to trigger an 
envelope.

Right now in Data, we do: 
1) check for a setval function
2) try{conn.value=inval}. 
But we can also check for other kinds of functions (like trigger).
Or possibly, we can have a "default" function that the node wants us
to call if there are no preconceptions about what is happening.




***************************************************************



Just need to parse this file something like:

MAJ 144 	#For all keydowns (major)
MIN 48-72	#For every key in this range (minor), 

type key 					#Set "type" field to string "key"
key some_name_func($min) 	#Set the "key" field to a value given by function: 
						 	#some_name_func
is_down bool(true) 			#Set the "is_down" field to the boolean
blah WHATEVER				#Set the "blah" field to the string "WHATEVER"
forks: num(50)				#Set the "forks" field to the number 50

Send this object:

{
	type: "key",
	key:<the_output_name>, 
	is_down: true,
	blah: "WHATEVER",
	forks: 50
}

»*/

		if (!arr.length) return cberr(conffile+": No contents");
		var id_or_path = arr.shift();
		if (!id_or_path) {
			cberr(conffile+": Bad id in file");
			return;
		}

		var path;

		if (id_or_path.match(/^\d+$/)) path = "/serv/synth"+id_or_path.trim();
		else path = id_or_path.trim();
		eout("Getting service: "+path);
		ptw(path, function(ret) {//«
			if (!ret) return cberr("Nothing returned: " + path);

			if (ret.par.TYPE!="service") return cberr(path+": Not a service");

			var servobj = ret._;

			if (!servobj) return cberr(path+": Got no servobj?!?!? HAHAHA");

			var exports=servobj.exports;
			if (!exports) return cberr(path+": the service has no exports!?!?!? YOYOYO");

			if (!parse(arr,exports)) return;

			servobj.register_reload(()=>{parse(arr,servobj.exports);});

			didparse = true;
			respbr();
			if (ispipe) eout("Reading from pipe...");
			else {
				let startms = Date.now();
				let min_ms_diff = 250;
				let gotevt = false;
				let is_reading = false;
				setTimeout(function() {
					if (!is_reading) eout("/dev/midi seems okay!");
				}, min_ms_diff);
				eout("Trying to read from /dev/midi...");
				fs.read_file("/dev/midi", (ret, arg2, arg3)=>{
					if (arg2) {
//console.warn("ARG2");
//console.log(arg2);
return;
					}
					if (iseof(ret)) {
						if (gotevt) return cbok();
						let diff = Date.now() - startms;
						if (diff > min_ms_diff) return cbok();
						else if (reader.is_terminal){
							eout("Falling back to reading parsed stdin from console...");
							is_reading = true;
							read_stdin(str=>{
								let obj;
								try {
									evtin(JSON.parse(str));
								}
								catch(e) {
									eout(e.message);
								}
							});
						}
						else cberr("Invalid reader!");
					}
					else {
						gotevt = true;
						evtin(ret);
					}

				}, null, cb=>{
			termobj.kill_register(cbarg=>{
console.warn("midi2synth: KILLED!!!");
//cbok();
cb&&cb();
cbarg&&cbarg();
});
				});
			}
		});//»
	});//»
	if (ispipe) read_stdin(evtin);
	else {
	}

},//»
'wavetable':function() {//«

	var sws = failopts(args,{//«
							SHORT:{
								s:3,
								e:3,
								f:3
							},
							LONG:{
								start:3,
								end:3,
								fftsize:3
							}
						});
	//»
	if (!sws) return;
//	var sws = ret[0];

	function aumod_cb(amod) {//«
		if (!amod) return cberr("No audio module");
//log(amod);
		var start;
		var end=0;
		var startstr = sws.start||sws.s;
		var fftsize = null;
		var callfunc;
		if (!startstr) start = 0;
		else {
			start = strnum(startstr);
			if (!isnotneg(start)) return cberr("Invalid start: " + startstr);
		}

		var endstr = sws.end||sws.e;
		if (endstr) {
			end = strnum(endstr);
			if (!ispos(end)) return cberr("Invalid endtime: " + endstr);
			if (start >= end) return cberr("End must be after start");
		}

		var fftstr = sws.fftsize||sws.f;

		if (fftstr) {//«
			fftsize = strnum(fftstr);
			if (!ispos(fftsize)) return cberr("fftsize must be positive");
			let gotok = false;
			for (let i=5; i <=15; i++) {
				if (fftsize==Math.pow(2,i)) {
					gotok = true;
					break;
				}
			}
			if (!gotok) return cberr("Invalid fft size (must be a power of 2 between 32 and 32768)");
		}//»

		var fname = args.shift();

		if (!fname) return cberr("No file given");

		var url=null;//«
		if (fname.match(/^https?:\/\//)) url = fname;
		else {
			let path = normpath(fname);
			if ((new RegExp("^/site/")).test(path)) url = '/static/online'+path;
			else url = fs_url(fname);
		}
//»

		var aud = make('audio');//«
		var audiv = make('div');
		audiv.pos="absolute";
		audiv.w=1;
		audiv.h=1;
		audiv.loc(-1,-1);
		audiv.op=0;
		audiv.over="hidden";
		audiv.appendChild(aud);
		document.body.appendChild(audiv);
	//»

		aud.onloadedmetadata = function() {//«

			function getbytes() {//«
				audiv.del();
				cbok(JSON.stringify(callfunc(),null,"  "));
			}//»

			if (!end) end = this.duration;
			else if (end > this.duration) {
				werr("Warning: Clipping end time to audio duration, " + end);
				end = this.duration;
			}
			if (start >= end) return _.cberr("Start time >= duration (" + end + ")");

			werr("Analyzing from: " + start + " -> " + end);
			refresh();
			respbr(true);
			var ctx = amod.get_audio_ctx();
			var medsrc = ctx.createMediaElementSource(this);
			var analyser = ctx.createAnalyser();
			if (fftsize) analyser.fftSize = fftsize;

			var did_end = false;
			var last_sec = 0;

			aud.onended = function() {//«
				if (did_end) return;
				did_end = true;
				getbytes();
			}//»
			aud.ontimeupdate = function() {//«
				if (did_end) return;
				if (this.currentTime >= end) {
					did_end = true;
					getbytes();
					return;
				}
				var gotsec = Math.floor(this.currentTime);
				if (gotsec>last_sec) {
					wclerr("Progress: " + gotsec + " / " + end.toFixed(2));
					refresh();
					last_sec = gotsec;
				}
			}//»

			aud.currentTime = start;
			aud.play();
			callfunc = amod.get_wavetable(medsrc, fftsize);
		};//»
		aud.onerror = function(e) {//«
			audiv.del();
			cberr("MediaError: " + fname);
		}//»
		aud._src = url;
	} //»
	if (!aumod) return cberr("No audio module!");

	aumod_cb(aumod);

},//»

}
if (!comarg) return Object.keys(COMS);


const INFO_STARTS_AT_BYTE=52;

//Imports«

let _;//«
let getkeys = Core.api.getKeys;
_=Core;
let log = _.log;
let cwarn = _.cwarn;
let cerr = _.cerr;
let xget = _.xget;

let globals = _.globals;
if (!globals.audio) Core.api.mkAudio();

let audio_ctx = globals.audio.ctx;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let isint = _.isint;
let isstr = _.isstr;
let isnull = _.isnull;
let make = _.make;
let iseof=Core.api.isEOF;
let fs = globals.fs;

let fs_url = Core.fs_url;
let aumod=null;
//»

const {NS}=Core;

const fsapi = NS.api.fs;

fs.getmod("av.audio", modret=>{//«
	if (!modret) return cerr("No audio module!");
	aumod = modret;
}, {STATIC: true});


//»

const {//«
	wclerr,
	normpath,
	arg2con,
	get_reader,
	refresh,
	respbr,
	woutobj,
	read_stdin,
	cberr,
	failopts,
	cbok,
	termobj,
	werr,
	wout,
	ptw,
	read_file_args_or_stdin,
	set_obj_val
} = Shell;//»

let mkfakeobj=(type, obj, args)=>{//«
    var type_to_str={
        auf32: "audioFloat32Data",
        auenc: "audioEncodedData"
    }   
    var argstr="";
    if (args&&isarr(args)) argstr = args.join(",");
    obj.toString = ()=>{
        return "["+(type_to_str[type]||"Object")+" ("+argstr+")]";
    }   
    return obj;
}; //»
//»

//Funcs«

const TermSnap=function(obj,snapw,snaph,frame_num){//«

const {cols,ed,x,y,w,h,sim,lns}=obj;
let cury=y;
let curx=x;
if (sim) {
	cury=h-1;
	curx+=sim.length;
}
this.toString=()=>{return JSON.stringify(obj);};
const to_svg=()=>{//«
let out = `
<svg viewBox="0 0 ${snapw} ${snaph}" xmlns="http://www.w3.org/2000/svg">
<style>
.s{font: 24px monospace; fill: #e3e3e3; white-space: pre;}
</style>
<rect x="0" y="0" width="${snapw}" height="${snaph}" fill="#000" />
<rect x="${curx*14}" y="${6+cury*26}" width="12" height="24" fill="#00f" />
`;
let ypos=26;
for (let ln of lns){
	out+=`<text x="0" y="${ypos}" class="s">${ln}</text>\n`;
	ypos+=26;
}
out+="</svg>";
return out;
};//»
this.toSVG=to_svg;

this.toImage=()=>{//«
	return new Promise((y,n)=>{
		let img=new Image;
		img.onload=(e)=>{
			img._off = obj.off;
			this.img=img;
			y(img);
		};
img.onerror=()=>{
console.log(to_svg());
n(`Bad Unicode in SVG? (frame: ${frame_num})`);
};
		img.src=URL.createObjectURL(new Blob([to_svg()], {type: 'image/svg+xml'}));
	});
};//»

};//»
const TermSnapArray=function(vidw, vidh){//«

let arr=[];
let data;
let imgs;
let rafId;
this.cancel=()=>{
	if (rafId){
		cancelAnimationFrame(rafId);
		rafId=null;
	}
};
this.add=(snap)=>{arr.push(snap);};

this.toString=()=>{//«
let s = '[';
for (let o of arr){
	s+=o.toString()+",";
}
return s.replace(/,$/,"")+"]";
};//»

this.toImages=()=>{//«
	return new Promise(async(y,n)=>{
		if (imgs) return y(true);
try{
		let proms=[];
		for (let o of arr) proms.push(o.toImage());
		await Promise.all(proms);
		imgs=[];
		for (let p of proms) imgs.push(await p);
}
catch(e){
n(e);
return;
}
		y(true);
	});
};//»

const to_img_video=()=>{//«

return new Promise(async(y,n)=>{//«

try{
await this.toImages();
}
catch(e){
n(e);
return;
}
let start;
if (imgs.length==0) {
	y();
	return;
}

let canvas = make('canvas');
canvas.width=vidw;
canvas.height=vidh;
let ctx = canvas.getContext("2d");

let videoStream = canvas.captureStream(5);
let mediaRecorder = new MediaRecorder(videoStream);

let chunks = [];

mediaRecorder.ondataavailable = function(e) {
	chunks.push(e.data);
};

mediaRecorder.onstop = function(e) {
	let blob = new Blob(chunks, { 'type' : 'video/webm' });
	y(blob);
};

const maybe_add_frame=()=>{
	let next = imgs[0];
	let off = window.performance.now()-start;
	if (off >= next._off) {

		let next_1 = imgs[1];
		while(next_1 && off >= next_1._off){
			next = next_1;
			imgs.shift();
			next_1 = imgs[1];
		}
		ctx.drawImage(next,0,0);
		imgs.shift();
		if (!imgs.length) {
			mediaRecorder.stop();
			return;
		}
	}
	rafId=requestAnimationFrame(maybe_add_frame);
};

start = window.performance.now();
mediaRecorder.start();
ctx.drawImage(imgs.shift(),0,0);
rafId=requestAnimationFrame(maybe_add_frame);

});//»


};//»

this.toImgVideo=to_img_video;

};//»

const ebml_sz=(buf, pos)=>{//«
	let nb;
	let b = buf[pos];

//xxxxxxxx
	if (b&128) {nb = 1; b^=128;}
	else if (b&64) {nb = 2;b^=64;}
	else if (b&32) {nb = 3;b^=32;}
	else if (b&16) {nb = 4;b^=16;}
	else if (b&8) {nb = 5;b^=8;}
	else if (b&4) {nb = 6;b^=4;}
	else if (b&2) {nb = 7;b^=2;}
	else if (b&1) {nb = 8;b^=1;}
	let str = "0x"+(b.toString(16));
	let end = pos+nb;
	if (end>=buf.length) {
		cberr(`Invalid ebml size @${pos}`);
		return false;
	}
	let ch; 
	for (let i=pos+1; i < end; i++) {
		ch = buf[i].toString(16);
		if (ch.length==1) ch = "0"+ch;
		str = str + ch;
	}   
	return [parseInt(str), end]
}//»
const arr2text=(arr)=>{//«
	let ret="";
	for (let i=0; i < arr.length; i++) {
		let code = arr[i];
		if (code===0) ret+=" ";
		else ret+=String.fromCharCode(code);
	}
	return ret;
}//»
const hex2text=(val)=>{//«
	let ret="";
	for (let j=0; j < val.length; j+=2) ret+=String.fromCharCode(parseInt("0x"+val.slice(j,j+2)));
	return ret;
}//»
const hexeq=(bufarg, start, offset, strarg, if_nowarn)=>{//«
	var arr =Array.prototype.slice.call(bufarg.slice(start,start+offset));
	var ret = arr.map(x=>{
		let s = ""+x.toString(16);
		if (s.length == 1) return "0"+s;
		return s;
	});
	var str = ret.toString().replace(/,/g,"");
	return (strarg===str);
}//»
const gethex=(bufarg, start, offset, if_fmt)=>{//«
	var arr =Array.prototype.slice.call(bufarg.slice(start,start+offset));
	var ret = arr.map(x=>{
		let s = ""+x.toString(16);
		if (s.length == 1) return "0"+s;
		return s;
	});
	let raw = ret.toString().replace(/,/g,"");
	let ret_str="";
	if (!if_fmt) ret_str = raw;
	else {
		for (let i=0; i < raw.length; i+=2) ret_str += raw[i]+raw[i+1]+" ";
	}
	return ret_str;
}//»
const read_1byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 1));}
const read_2byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 2));}
const read_4byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 4));}
const read_8byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 8));}
//function read_4byte_float(bufarg, offset){return parseFloat("0x"+gethex(bufarg, offset, 4));}
//»

const WEBM = {//«
"id":"WEBM",
"kids": {
	"1a45dfa3": {
		"id": "HEADER",
		"kids": {
			"4286": {"id": "EBMLVERSION"},
			"42f7": {"id": "EBMLREADVERSION"},
			"42f2": {"id": "EBMLMAXIDLENGTH"},
			"42f3": {"id": "EBMLMAXSIZELENGTH"},
			"4282": {"id": "DOCTYPE"},
			"4287": {"id": "DOCTYPEVERSION"},
			"4285": {"id": "DOCTYPEREADVERSION"}
		}
	},
	"18538067": {
		"id": "SEGMENT",
		"kids": {
			"1549a966": {
				"id": "INFO",
				"kids": {
					"2ad7b1": {"id": "TIMECODESCALE"},
					"4489": {"id": "DURATION"},
					"7ba9": {"id": "TITLE"},
					"5741": {"id": "WRITINGAPP"},
					"4d80": {"id": "MUXINGAPP"},
					"4461": {"id": "DATEUTC"},
					"73a4": {"id": "SEGMENTUID"}
				}
			},
			"1654ae6b": {
				"id": "TRACKS",
				"kids": {
					"ae": {
						"id": "TRACKENTRY",    //MULT
						"out":[],
						"mult": true,
						"kids": {
							"d7": {"id": "TRACKNUMBER"},
							"73c5": {"id": "TRACKUID"},
							"83": {"id": "TRACKTYPE"},
							"e0": {
								"id": "TRACKVIDEO",
								"kids": {
									"2383e3": {"id": "VIDEOFRAMERATE"},
									"54b0": {"id": "VIDEODISPLAYWIDTH"},
									"54ba": {"id": "VIDEODISPLAYHEIGHT"},
									"b0": {"id": "VIDEOPIXELWIDTH"},
									"ba": {"id": "VIDEOPIXELHEIGHT"},
									"54aa": {"id": "VIDEOPIXELCROPB"},
									"54bb": {"id": "VIDEOPIXELCROPT"},
									"54cc": {"id": "VIDEOPIXELCROPL"},
									"54dd": {"id": "VIDEOPIXELCROPR"},
									"54b2": {"id": "VIDEODISPLAYUNIT"},
									"9a": {"id": "VIDEOFLAGINTERLACED"},
									"9d": {"id": "VIDEOFIELDORDER"},
									"53b8": {"id": "VIDEOSTEREOMODE"},
									"53c0": {"id": "VIDEOALPHAMODE"},
									"54b3": {"id": "VIDEOASPECTRATIO"},
									"2eb524": {"id": "VIDEOCOLORSPACE"},
									"55b0": {"id": "VIDEOCOLOR"},
									"55b1": {"id": "VIDEOCOLORMATRIXCOEFF"},
									"55b2": {"id": "VIDEOCOLORBITSPERCHANNEL"},
									"55b3": {"id": "VIDEOCOLORCHROMASUBHORZ"},
									"55b4": {"id": "VIDEOCOLORCHROMASUBVERT"},
									"55b5": {"id": "VIDEOCOLORCBSUBHORZ"},
									"55b6": {"id": "VIDEOCOLORCBSUBVERT"},
									"55b7": {"id": "VIDEOCOLORCHROMASITINGHORZ"},
									"55b8": {"id": "VIDEOCOLORCHROMASITINGVERT"},
									"55b9": {"id": "VIDEOCOLORRANGE"},
									"55ba": {"id": "VIDEOCOLORTRANSFERCHARACTERISTICS"},
									"55bb": {"id": "VIDEOCOLORPRIMARIES"},
									"55bc": {"id": "VIDEOCOLORMAXCLL"},
									"55bd": {"id": "VIDEOCOLORMAXFALL"},
									"55d0": {"id": "VIDEOCOLORMASTERINGMETA"},
									"55d1": {"id": "VIDEOCOLORRX"},
									"55d2": {"id": "VIDEOCOLORRY"},
									"55d3": {"id": "VIDEOCOLORGX"},
									"55d4": {"id": "VIDEOCOLORGY"},
									"55d5": {"id": "VIDEOCOLORBX"},
									"55d6": {"id": "VIDEOCOLORBY"},
									"55d7": {"id": "VIDEOCOLORWHITEX"},
									"55d8": {"id": "VIDEOCOLORWHITEY"},
									"55d9": {"id": "VIDEOCOLORLUMINANCEMAX"},
									"55da": {"id": "VIDEOCOLORLUMINANCEMIN"},
									"7670": {"id": "VIDEOPROJECTION"},
									"7671": {"id": "VIDEOPROJECTIONTYPE"},
									"7672": {"id": "VIDEOPROJECTIONPRIVATE"},
									"7673": {"id": "VIDEOPROJECTIONPOSEYAW"},
									"7674": {"id": "VIDEOPROJECTIONPOSEPITCH"},
									"7675": {"id": "VIDEOPROJECTIONPOSEROLL"}
								}
							},
							"e1": {
								"id": "TRACKAUDIO",
								"kids": {
									"b5": {"id": "AUDIOSAMPLINGFREQ"},
									"78b5": {"id": "AUDIOOUTSAMPLINGFREQ"},
									"6264": {"id": "AUDIOBITDEPTH"},
									"9f": {"id": "AUDIOCHANNELS"}
								}
							},
							"e2": {"id": "TRACKOPERATION"},
							"e3": {"id": "TRACKCOMBINEPLANES"},
							"e4": {"id": "TRACKPLANE"},
							"e5": {"id": "TRACKPLANEUID"},
							"e6": {"id": "TRACKPLANETYPE"},
							"86": {"id": "CODECID"},
							"63a2": {"id": "CODECPRIVATE"},
							"258688": {"id": "CODECNAME"},
							"3b4040": {"id": "CODECINFOURL"},
							"26b240": {"id": "CODECDOWNLOADURL"},
							"aa": {"id": "CODECDECODEALL"},
							"56aa": {"id": "CODECDELAY"},
							"56bb": {"id": "SEEKPREROLL"},
							"536e": {"id": "TRACKNAME"},
							"22b59c": {"id": "TRACKLANGUAGE"},
							"b9": {"id": "TRACKFLAGENABLED"},
							"88": {"id": "TRACKFLAGDEFAULT"},
							"55aa": {"id": "TRACKFLAGFORCED"},
							"55ab": {"id": "TRACKFLAGHEARINGIMPAIRED"},
							"55ac": {"id": "TRACKFLAGVISUALIMPAIRED"},
							"55ad": {"id": "TRACKFLAGTEXTDESCRIPTIONS"},
							"55ae": {"id": "TRACKFLAGORIGINAL"},
							"55af": {"id": "TRACKFLAGCOMMENTARY"},
							"9c": {"id": "TRACKFLAGLACING"},
							"6de7": {"id": "TRACKMINCACHE"},
							"6df8": {"id": "TRACKMAXCACHE"},
							"23e383": {"id": "TRACKDEFAULTDURATION"},
							"6d80": {"id": "TRACKCONTENTENCODINGS"},
							"6240": {
								"id": "TRACKCONTENTENCODING",
								"kids": {
									"5031": {"id": "ENCODINGORDER"},
									"5032": {"id": "ENCODINGSCOPE"},
									"5033": {"id": "ENCODINGTYPE"},
									"5034": {"id": "ENCODINGCOMPRESSION"},
									"4254": {"id": "ENCODINGCOMPALGO"},
									"4255": {"id": "ENCODINGCOMPSETTINGS"},
									"5035": {"id": "ENCODINGENCRYPTION"},
									"47e7": {"id": "ENCODINGENCAESSETTINGS"},
									"47e1": {"id": "ENCODINGENCALGO"},
									"47e2": {"id": "ENCODINGENCKEYID"},
									"47e5": {"id": "ENCODINGSIGALGO"},
									"47e6": {"id": "ENCODINGSIGHASHALGO"},
									"47e4": {"id": "ENCODINGSIGKEYID"},
									"47e3": {"id": "ENCODINGSIGNATURE"}
								}
							},
							"23314f": {"id": "TRACKTIMECODESCALE"},
							"55ee": {"id": "TRACKMAXBLKADDID"}
						}
					}
				}
			},
			"1c53bb6b": {
				"id": "CUES",
				"kids": {
					"bb": {
						"id": "POINTENTRY",		//MULT
						"out":[],
						"mult":true,
						"kids": {
							"b3": {"id": "CUETIME"},
							"b7": {
								"id": "CUETRACKPOSITION",
								"kids": {
									"f7": {"id": "CUETRACK"},
									"f1": {"id": "CUECLUSTERPOSITION"},
									"f0": {"id": "CUERELATIVEPOSITION"},
									"b2": {"id": "CUEDURATION"},
									"5378": {"id": "CUEBLOCKNUMBER"}
								}
							}	
						}
					}				
				}
			},
			"1254c367": {
				"id": "TAGS",
				"kids": {
					"7373": {"id": "TAG"},
					"67c8": {"id": "SIMPLETAG"},
					"45a3": {"id": "TAGNAME"},
					"4487": {"id": "TAGSTRING"},
					"447a": {"id": "TAGLANG"},
					"4484": {"id": "TAGDEFAULT"},
					"44b4": {"id": "BUG"},
					"63c0": {"id": "TAGTARGETS"},
					"63ca": {"id": "TYPE"},
					"68ca": {"id": "TYPEVALUE"},
					"63c5": {"id": "TRACKUID"},
					"63c4": {"id": "CHAPTERUID"},
					"63c6": {"id": "ATTACHUID"}
				}
			},
			"114d9b74": {
				"id": "SEEKHEAD",
				"kids": {
					"4dbb": {
						"id": "SEEKENTRY", 		//MULT
						"out":[],
						"mult":true,
						"kids": {
							"53ab": {"id": "SEEKID"},
							"53ac": {"id": "SEEKPOSITION"}
						}
					}
				}
			},
			"1941a469": {
				"id": "ATTACHMENTS",
				"kids": {
					"61a7": {"id": "ATTACHEDFILE"},
					"467e": {"id": "FILEDESC"},
					"466e": {"id": "FILENAME"},
					"4660": {"id": "FILEMIMETYPE"},
					"465c": {"id": "FILEDATA"},
					"46ae": {"id": "FILEUID"}
				}
			},
			"1f43b675": {
				"id": "CLUSTER",		// MULT
				"out":[],
				"mult":true,
				"kids": {
					"e7": {"id": "CLUSTERTIMECODE"},
					"a7": {"id": "CLUSTERPOSITION"},
					"ab": {"id": "CLUSTERPREVSIZE"},
					"a3": {"id": "SIMPLEBLOCK"},
					"a0": {
						"id": "BLOCKGROUP",
						"out":[],
						"mult":true,
						"kids": {
							"a1": {"id": "BLOCK"},
							"9b": {"id": "BLOCKDURATION"},
							"fb": {"id": "BLOCKREFERENCE"},
							"a4": {"id": "CODECSTATE"},
							"75a2": {"id": "DISCARDPADDING"},
							"75a1": {
								"id": "BLOCKADDITIONS",
								"kids": {
									"a6": {
										"id": "BLOCKMORE",
										"kids": {
											"ee": {"id": "BLOCKADDID"},
											"a5": {"id": "BLOCKADDITIONAL"}
										}
									}
								}
							}
						}
					}
				}
			},
			"1043a770": {
				"id": "CHAPTERS",
				"kids": {
					"45b9": {"id": "EDITIONENTRY"},
					"b6": {"id": "CHAPTERATOM"},
					"91": {"id": "CHAPTERTIMESTART"},
					"92": {"id": "CHAPTERTIMEEND"},
					"80": {"id": "CHAPTERDISPLAY"},
					"85": {"id": "CHAPSTRING"},
					"437c": {"id": "CHAPLANG"},
					"437e": {"id": "CHAPCOUNTRY"},
					"45bc": {"id": "EDITIONUID"},
					"45bd": {"id": "EDITIONFLAGHIDDEN"},
					"45db": {"id": "EDITIONFLAGDEFAULT"},
					"45dd": {"id": "EDITIONFLAGORDERED"},
					"73c4": {"id": "CHAPTERUID"},
					"98": {"id": "CHAPTERFLAGHIDDEN"},
					"4598": {"id": "CHAPTERFLAGENABLED"},
					"63c3": {"id": "CHAPTERPHYSEQUIV"}
				}
			}
		}
	}
}

};//»


COMS[comarg](args);



}

