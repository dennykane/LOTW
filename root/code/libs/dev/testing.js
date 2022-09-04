
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

URL:()=>{//«
let arg = args.shift();
if (!arg) return cberr("NAAH");
let url;
try{
url = new URL(arg);
}
catch(e){
return cberr(e.message);
}
if (!url.hostname.match(/youtube.com$/)) return cberr("Does not appear to be a youtube.com link!");
let params = url.searchParams;
let vid = params.get("v");
let list = params.get("list");
let ind = params.get("index");



cbok();

},//»

YTDL:async()=>{//«

//xTODOx Clean up everything in svcs/ytdl.js (remove the /tmp/yt-dl upon finishing the download...)


let chunks=[];
let fname;
let ws;

const saveit=async()=>{//«
	let path = `/home/${ENV.USER}/Downloads`;
	let fullpath = `${path}/${fname}`;
	await fs.mkDir(path);
	wout(`Saving to: '${fullpath}'...`);
	await fs.writeFile(fullpath, new Blob(chunks));
	cbok();
	if (ws) {
		ws.send("Cleanup");
		setTimeout(()=>{
			ws.close();
		}, 250);
	}
};//»
const startws=()=>{//«
let killed = false;

killreg(cb=>{//«
	killed = true;
	if (ws) ws.close();
	cb&&cb();
});//»

ws = new WebSocket(`ws://${window.location.hostname}:${port}/`);

ws.onopen=()=>{//«
ws.send(`VID:${vid}`);
//wout('connected');
//ws.send(Date.now());
};//»
ws.onclose = ()=>{//«

log('disconnected');
if (!killed) {
	werr("Unexpectedly closing...");
	cberr();
}

};//»
ws.onmessage = e =>{//«

let dat = e.data;
log(dat);
if (dat instanceof Blob) {
	chunks.push(dat);
	return 
}
else if (!(typeof dat === 'string')){
	cerr("What the hell in onmessage???");
	log(dat);
	return;
}
let obj;
try{
	obj = JSON.parse(dat);
}
catch(e){
	cerr("What the hell no good JSON in onmessage???");
	log(dat);
	return;
}

if (obj.out){
	let s = obj.out.replace(/\n$/,"");
	if (s.match(/^\[download\]/)) wclerr(s.split("\n").pop());
	else werr(s);
}
else if (obj.err) werr(obj.err);
else if (obj.name) fname = obj.name;
else if (obj.done) saveit();

};//»

}//»

let port = 20003;

let opts=failopts(args,{s:{p:3},l:{port:3}});
if (!opts) return;
let portarg = opts.port||opts.p;
if (portarg){
	let portnum = portarg.pi({MIN:1024, MAX: 65535});
	if (!Number.isFinite(portnum)) return cberr("Invalid port");
	port = portnum;
}

let arg = args.shift();
if (!arg) return cberr("No arg given!");
let url;
try{
	url = new URL(arg);
}
catch(e){
	return cberr(e.message);
}
if (!url.hostname.match(/youtube.com$/)) return cberr("Does not appear to be a youtube.com link!");
let params = url.searchParams;
let vid = params.get("v");
//let list = params.get("list");
//let ind = params.get("index");
//if (!vid)
if (vid && vid.match(/^[-_a-zA-Z0-9]{11}$/)){
	startws();
}
else cberr("BARFID");


},//»

MIDITRACKS:async()=>{//«

/*«

//JSON Format«
{
  // the transport and timing data
  header: {
    name: String,                     // the name of the first empty track, 
                                      // which is usually the song name
    tempos: TempoEvent[],             // the tempo, e.g. 120
    timeSignatures: TimeSignatureEvent[],  // the time signature, e.g. [4, 4],

    PPQ: Number                       // the Pulses Per Quarter of the midi file
                                      // this is read only
  },

  duration: Number,                   // the time until the last note finishes

  // an array of midi tracks
  tracks: [
    {
      name: String,                   // the track name if one was given

      channel: Number,                // channel
                                      // the ID for this channel; 9 and 10 are
                                      // reserved for percussion
      notes: [
        {
          midi: Number,               // midi number, e.g. 60
          time: Number,               // time in seconds
          ticks: Number,              // time in ticks
          name: String,               // note name, e.g. "C4",
          pitch: String,              // the pitch class, e.g. "C",
          octave : Number,            // the octave, e.g. 4
          velocity: Number,           // normalized 0-1 velocity
          duration: Number,           // duration in seconds between noteOn and noteOff
        }
      ],

      // midi control changes
      controlChanges: {
        // if there are control changes in the midi file
        '91': [
          {
            number: Number,           // the cc number
            ticks: Number,            // time in ticks
            time: Number,             // time in seconds
            value: Number,            // normalized 0-1
          }
        ],
      },

      instrument: {                   // and object representing the program change events
        number : Number,              // the instrument number 0-127
        family: String,               // the family of instruments, read only.
        name : String,                // the name of the instrument
        percussion: Boolean,          // if the instrument is a percussion instrument
      },          
    }
  ]
}//»
Instruments//«
0	Piano	Acoustic Grand Piano
1	Piano	Bright Acoustic Piano
2	Piano	Electric Grand Piano
3	Piano	Honky-tonk Piano
4	Piano	Rhodes Piano
5	Piano	Chorused Piano
6	Piano	Harpsichord
7	Piano	Clavinet
8	Chromatic Percussion	Celesta
9	Chromatic Percussion	Glockenspiel
10	Chromatic Percussion	Music box
11	Chromatic Percussion	Vibraphone
12	Chromatic Percussion	Marimba
13	Chromatic Percussion	Xylophone
14	Chromatic Percussion	Tubular Bells
15	Chromatic Percussion	Dulcimer
16	Organ	Hammond Organ
17	Organ	Percussive Organ
18	Organ	Rock Organ
19	Organ	Church Organ
20	Organ	Reed Organ
21	Organ	Accordion
22	Organ	Harmonica
23	Organ	Tango Accordion
24	Guitar	Acoustic Guitar (nylon)
25	Guitar	Acoustic Guitar (steel)
26	Guitar	Electric Guitar (jazz)
27	Guitar	Electric Guitar (clean)
28	Guitar	Electric Guitar (muted)
29	Guitar	Overdriven Guitar
30	Guitar	Distortion Guitar
31	Guitar	Guitar Harmonics
32	Bass	Acoustic Bass
33	Bass	Electric Bass (finger)
34	Bass	Electric Bass (pick)
35	Bass	Fretless Bass
36	Bass	Slap Bass 1
37	Bass	Slap Bass 2
38	Bass	Synth Bass 1
39	Bass	Synth Bass 2
40	Strings	Violin
41	Strings	Viola
42	Strings	Cello
43	Strings	Contrabass
44	Strings	Tremolo Strings
45	Strings	Pizzicato Strings
46	Strings	Orchestral Harp
47	Strings	Timpani
48	Ensemble	String Ensemble 1
49	Ensemble	String Ensemble 2
50	Ensemble	Synth Strings 1
51	Ensemble	Synth Strings 2
52	Ensemble	Choir Aahs
53	Ensemble	Voice Oohs
54	Ensemble	Synth Voice
55	Ensemble	Orchestra Hit
56	Brass	Trumpet
57	Brass	Trombone
58	Brass	Tuba
59	Brass	Muted Trumpet
60	Brass	French Horn
61	Brass	Brass Section
62	Brass	Synth Brass 1
63	Brass	Synth Brass 2
64	Reed	Soprano Sax
65	Reed	Alto Sax
66	Reed	Tenor Sax
67	Reed	Baritone Sax
68	Reed	Oboe
69	Reed	English Horn
70	Reed	Bassoon
71	Reed	Clarinet
72	Pipe	Piccolo
73	Pipe	Flute
74	Pipe	Recorder
75	Pipe	Pan Flute
76	Pipe	Bottle Blow
77	Pipe	Shakuhachi
78	Pipe	Whistle
79	Pipe	Ocarina
80	Synth Lead	Lead 1 (square)
81	Synth Lead	Lead 2 (sawtooth)
82	Synth Lead	Lead 3 (calliope lead)
83	Synth Lead	Lead 4 (chiffer lead)
84	Synth Lead	Lead 5 (charang)
85	Synth Lead	Lead 6 (voice)
86	Synth Lead	Lead 7 (fifths)
87	Synth Lead	Lead 8 (brass + lead)
88	Synth Pad	Pad 1 (new age)
89	Synth Pad	Pad 2 (warm)
90	Synth Pad	Pad 3 (polysynth)
91	Synth Pad	Pad 4 (choir)
92	Synth Pad	Pad 5 (bowed)
93	Synth Pad	Pad 6 (metallic)
94	Synth Pad	Pad 7 (halo)
95	Synth Pad	Pad 8 (sweep)
96	Synth Effects	FX 1 (rain)
97	Synth Effects	FX 2 (soundtrack)
98	Synth Effects	FX 3 (crystal)
99	Synth Effects	FX 4 (atmosphere)
100	Synth Effects	FX 5 (brightness)
101	Synth Effects	FX 6 (goblins)
102	Synth Effects	FX 7 (echoes)
103	Synth Effects	FX 8 (sci-fi)
104	Ethnic	Sitar
105	Ethnic	Banjo
106	Ethnic	Shamisen
107	Ethnic	Koto
108	Ethnic	Kalimba
109	Ethnic	Bagpipe
110	Ethnic	Fiddle
111	Ethnic	Shana
112	Percussive	Tinkle Bell
113	Percussive	Agogo
114	Percussive	Steel Drums
115	Percussive	Woodblock
116	Percussive	Taiko Drum
117	Percussive	Melodic Tom
118	Percussive	Synth Drum
119	Percussive	Reverse Cymbal
120	Sound Effects	Guitar Fret Noise
121	Sound Effects	Breath Noise
122	Sound Effects	Seashore
123	Sound Effects	Bird Tweet
124	Sound Effects	Telephone Ring
125	Sound Effects	Helicopter
126	Sound Effects	Applause
127	Sound Effects	Gunshot
//»
Control Changes://«

//Most common
1 – Modulation wheel
2 – Breath control
7 – Volume
10 – Pan
11 – Expression
64 – Sustain pedal (on/off)
65 – Portamento CC control (on/off)
71 – Resonance (filter)
74 – Frequency cutoff (filter)

//All«
0 Bank Select (MSB)
1 Modulation Wheel
2 Breath controller
3 = Undefined
4 Foot Pedal (MSB)
5 Portamento Time (MSB)
6 Data Entry (MSB)
7 Volume (MSB)
8 Balance (MSB
9 = Undefined
10 Pan position (MSB)
11 Expression (MSB)
12 Effect Control 1 (MSB)
13 Effect Control 2 (MSB)
14 = Undefined
15 = Undefined
16-19 = General Purpose
20-31 = Undefined
32-63 = Controller 0-31
64 Hold Pedal (on/off)
65 Portamento (on/off)
66 Sostenuto Pedal (on/off)
67 Soft Pedal (on/off)
68 Legato Pedal (on/off)
69 Hold 2 Pedal (on/off)
70 Sound Variation
71 Resonance (Timbre)
72 Sound Release Time
73 Sound Attack Time
74 Frequency Cutoff (Brightness)
75 Sound Control 6
76 Sound Control 7
77 Sound Control 8
78 Sound Control 9
79 Sound Control 10
80 Decay or General Purpose Button 1 (on/off) Roland Tone level 1
81 Hi Pass Filter Frequency or General Purpose Button 2 (on/off) Roland Tone level 2
82 General Purpose Button 3 (on/off) Roland Tone level 3
83 General Purpose Button 4 (on/off) Roland Tone level 4
84 Portamento Amount
85-90 = Undefined
91 Reverb Level
92 Tremolo Level
93 Chorus Level
94 Detune Level
95 Phaser Level
96 Data Button increment
97 Data Button decrement
98 Non-registered Parameter (LSB)
99 Non-registered Parameter (MSB)
100 Registered Parameter (LSB)
101 Registered Parameter (MSB)
102-119 = Undefined
120 All Sound Off
121 All Controllers Off
122 Local Keyboard (on/off)
123 All Notes Off
124 Omni Mode Off
125 Omni Mode On
126 Mono Operation
127 Poly Mode
//»

//»

»*/

let modname = "av.midi.miditojson";
if (!await capi.loadMod(modname)) return cberr("Midi could not be loaded!");
let mod = Core.NS.mods[modname].Midi;
let path = args.shift();
if (!path) return cberr("No path given!");
let node = await fs.pathToNode(path);
if (!node) return cberr(`${path}: not found`);
let t = node.root.TYPE;

let rv = await fs.readFile(node.fullpath);
if (!(rv instanceof Blob)) return cberr("Did not get a blob!");
let midi = new mod(await capi.toBuf(rv));
let head = midi.header;
let tracks = midi.tracks;
log(tracks);
cbok();

},//»

PLAYTEST:async()=>{//«
/*

TO RECORD TO WEBM AUDIO

src = createMediaElementSource(audio)
dest = createMediaStreamDestination().
src.connect(dest)

chunks=[];
recorder = new MediaRecorder(dest.stream, {mimeType:"audio/webm"})
recorder.ondataavailable=e=>{
	chunks.push(e.data)
}
recorder.start()


This cuts a portion of a playable audio media file and turns it into a .wav blob. 
Therefore, this only involves the browser's internal decoding via the <audio> element.

I don't think I want to mess with the world of LOTW-level (JS space) encoding, at least
not at the present moment. I am happy enough with having .wav files.

As far as enabling "something like" an encoder/transcoder is concerned, I would like to
(go back to) doing some kind of sending the file over WebSockets to node.js, and
then doing the ffmpeg command, and sending back over to LOTW.

*/

	let debug = false;
//	let debug = true;
	let opts=failopts(args,{s:{f:3},l:{format:3}});
	if (!opts) return;
	let ok_exts=["webm","wav"];
	let fileext="webm";
	let fmt = opts.format||opts.f
	if (!fmt) werr(`Defaulting to ${fileext}`);
	else if (!ok_exts.includes(fmt)) return cberr(`${fmt}: Invalid file extension`);
	else fileext = fmt;
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
	let mediarecorder;
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
	const doneout=()=>{//«
		wclerr(`${markstr(mark2)} ${audio.playbackRate}x ${markstr(mark1)}-${markstr(mark2)} [DONE]`);
	};//»
	const get_wav_blob=(dat)=>{//«
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
		return bufferToWave(buf);
	}//»
	const send=blob=>{//«
		{
			let fname;
			let arr = node.name.split(".");
			if (arr.length > 1) arr.pop();
			fname = arr.join(".")
			let from = Math.round(100*mark1);
			let to = Math.round(100*mark2);
			set_var_str("CUR_FNAME", `${fname}%${from}-${to}.${fileext}`);
		}
//		woutobj(bufferToWave(buf));
		woutobj(blob);
		ctx.close();
		ctx = null;
		termobj.getch_loop(null);
		cbok();
//		dodebug(buf);
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
		if (fileext==="webm"){
			let dest = ctx.createMediaStreamDestination();
			src.connect(dest)
			let chunks=[];
			mediarecorder = new MediaRecorder(dest.stream, {mimeType:"audio/webm", audioBitsPerSecond: 128000})
			mediarecorder.ondataavailable=e=>{
				send(e.data);
			}
			mediarecorder.start()
		}
		else if (fileext==="wav"){
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
					doneout();
					dorec = "";
					src.disconnect();
					audio.pause();
	//				send(all);
					send(get_wav_blob(all));
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
		}
		else cberr("?!?!?!?!?");

		src.connect(ctx.destination);
		audio.play();
	};//»
	const audioloop=()=>{//«
		if (audio.currentTime >= mark2) {
			if (doloop) audio.currentTime = mark1;
			else if (mediarecorder) {
				mediarecorder.stop();
				doneout();
				return;
			}
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

let minh = 3;
if (termobj.h < minh){
	cberr(`Need height >= ${minh}!`);
	return;
}

killreg(cb=>{
    termobj.getch_loop(null);
	cb&&cb();
})
termobj.getch_loop(ch=>{
	if (termobj.h < minh) return;
	if (ch.match(/^[a-z]_$/)){
		termobj.stat_render(["<blar>&& &amp; &&</blar>",'   <span style="color: #770">Fooey!!!</span>']);
	}
	else if (ch.match(/^[a-z]_S$/)){
		termobj.stat_render(["?!?!?!?!?"]);
	}
	else if (ch.match(/^[0-9]_/)){
		termobj.stat_render(["Blar","ZZLEEPPPPPP"]);
	}
	else{
	}
}, 2, minh);
termobj.stat_render(["Welcomme> to the hwoinx???","[Sppek in the har on the bloan!!!]"]);

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
	failopts,
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
