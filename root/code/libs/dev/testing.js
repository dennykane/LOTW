/*

In terms of the whole youtube-dl/yt-dlp workflow:

I am going to assume that you know all the meta stuff for a given video id, taken from
the Youtube API (https://www.googleapis.com/youtube/v3/). The only things you might not
know are the available downloadable formats (webm/mp4/m4a audio/video resolutions/bitrates).

To check for videos, we want to see if we have filenames that match /^title/ (with all 
bad characters removed).

*/
/*Youtube API 'fields' parameter syntax«

https://www.googleapis.com/youtube/v3/something?part=skrumpt,cheeg&fields=... 

Comma-separated list to select multiple fields
	fields=a,b

Asterisk as a wildcard to identify all fields
	fields=*

Parentheses to specify a group of nested properties
	fields=a(b,c)

Forward slash to identify a nested property
	fields=a/b

»*/

export const lib = (comarg, args, Core, Shell)=>{

const COMS={

'GETUNIQUEPATH':async args=>{
let path = args.shift();
if (!path) return cberr("No path");
let rv = await NS.api.fs.getUniquePath(normpath(path));
if (!rv) return cberr("Error");
wout(rv[0]);
//log(rv);
cbok();
},
GRUND:()=>{
werr("1a");
werr("1b");
wclerr("2");
wclerr("2");
wclerr("2");
werr("3a");
werr("3b");
wclerr("4");
wclerr("4");
wclerr("4");
cbok();
},

/*Simple API to spin up indexedDB's.«

let db = await new capi.db("DBName", DBVersion);
if (!await db.init("StoreName", "keyname",[{name: "field1"}, {name: "field2", unique: true}])){
	cberr("Database Init Error");
	return;
}
db.add(data);
db.get(keyname);
//Need another method to get by unique field names
db.rm(keyname);
db.close();

db.delete_db();
db.delete_store(store_name);
»*/
DODB:async()=>{//«

/*

The only way to go through onupgradeneeded is to increase the db number (2nd arg).

*/
let db = await new capi.db("Food", 3);

//if (!await db.delete_db()) cberr("Arghghgh");
//else cbok("Yay");
//return;

if (!await db.init("Sleemers", "id",[{name: "hrunt"}, {name: "sports", unique: true}])){
//if (!await db.delete_store("Sleemers")){

	cberr("BadOK");
	return;
}
//Need to close it in order to not get blocked...
db.close();
cbok();
},//»

//Extract tracks (array sequences of midi notes) from .midi file
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

//Play audio file, create start and end marks, then slice it to .wav by sending
//through AudioWorkletNode and slice to .webm by sending to MediaRecorder. This
//depends on sitting through the recording process.
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

//A getch_loop that uses 1 or more status lines at the bottom of the screen.
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
//		termobj.stat_render(["<blar>&& &amp; &&</blar>",'   <span style="color: #770">Fooey!!!</span> LONGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR']);
		termobj.stat_render(['   <span style="color: #770">Fooey!!!</span> LONGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR']);
	}
	else if (ch.match(/^[a-z]_S$/)){
		termobj.stat_render(["?!?!?!?!?"]);
	}
	else if (ch.match(/^[0-9]_/)){
//		termobj.stat_render(["Blar","ZZLEEPPPPPP"]);
		termobj.stat_render(["Blar"]);
	}
	else{
	}
}, 1, minh);
termobj.stat_render(["Welcomme> to the hwoinx???"]);
//termobj.stat_render(["Welcomme> to the hwoinx???","[Sppek in the har on the bloan!!!]"]);

setTimeout(()=>{
wout("Thing in the place");
setTimeout(()=>{
wout("Yibber ouderbbeddd!");
setTimeout(()=>{
wout("Zloyyyymoooooo!!!!!!!!!");
}, 350);
}, 350);
}, 350);

},//»

//Use Youtube API to search for videos, channels, playlists
SEARCHYT:async()=>{//«

/*

Parameters

Required parameters//«

part//«

string

The part parameter specifies a comma-separated list of one or more search
resource properties that the API response will include. Set the parameter value
to snippet.

//»

//»

Filters (specify 0 or 1 of the following parameters)//«

relatedToVideoId//«

string

The relatedToVideoId parameter retrieves a list of videos that are related to
the video that the parameter value identifies. The parameter value must be set
to a YouTube video ID and, if you are using this parameter, the type parameter
must be set to video.

Note that if the relatedToVideoId parameter is set, the only other supported
parameters are part, maxResults, pageToken, regionCode, relevanceLanguage,
safeSearch, type (which must be set to video), and fields.

//»

forContentOwner//«

boolean

This parameter can only be used in a properly authorized request, and it is
intended exclusively for YouTube content partners.

The forContentOwner parameter restricts the search to only retrieve videos
owned by the content owner identified by the onBehalfOfContentOwner parameter.
If forContentOwner is set to true, the request must also meet these
requirements:

The onBehalfOfContentOwner parameter is required.

The user authorizing the request must be using an account linked to the
specified content owner.

The type parameter value must be set to video.

None of the following other parameters can be set: videoDefinition,
videoDimension, videoDuration, videoLicense, videoEmbeddable, videoSyndicated,
videoType.

//»
forDeveloper//«

boolean

This parameter can only be used in a properly authorized request. The
forDeveloper parameter restricts the search to only retrieve videos uploaded
via the developer's application or website. The API server uses the request's
authorization credentials to identify the developer. The forDeveloper parameter
can be used in conjunction with optional search parameters like the q
parameter.

For this feature, each uploaded video is automatically tagged with the project
number that is associated with the developer's application in the Google
Developers Console.

When a search request subsequently sets the forDeveloper parameter to true, the
API server uses the request's authorization credentials to identify the
developer. Therefore, a developer can restrict results to videos uploaded
through the developer's own app or website but not to videos uploaded through
other apps or sites.

//»
forMine//«

boolean

This parameter can only be used in a properly authorized request. The forMine
parameter restricts the search to only retrieve videos owned by the
authenticated user. If you set this parameter to true, then the type
parameter's value must also be set to video. In addition, none of the following
other parameters can be set in the same request: videoDefinition,
videoDimension, videoDuration, videoLicense, videoEmbeddable, videoSyndicated,
videoType.

//»

//»

Optional parameters//«

//Search Filters«
q//«
string
The q parameter specifies the query term to search for.

Your request can also use the Boolean NOT (-) and OR (|) operators to exclude
videos or to find videos that are associated with one of several search terms.
For example, to search for videos matching either "boating" or "sailing", set
the q parameter value to boating|sailing. Similarly, to search for videos
matching either "boating" or "sailing" but not "fishing", set the q parameter
value to boating|sailing -fishing. Note that the pipe character must be
URL-escaped when it is sent in your API request. The URL-escaped value for the
pipe character is %7C.

//»
type//«
string
The type parameter restricts a search query to only retrieve a particular type of resource. The value is a comma-separated list of resource types. The default value is video,channel,playlist.

Acceptable values are:
channel
playlist
video//»
topicId//«
string

The topicId parameter indicates that the API response should only contain
resources associated with the specified topic. The value identifies a Freebase
topic ID.

Important: Due to the deprecation of Freebase and the Freebase API, the topicId
parameter started working differently as of February 27, 2017. At that time,
YouTube started supporting a small set of curated topic IDs, and you can only
use that smaller set of IDs as values for this parameter.

See topic IDs supported as of February 15, 2017

Topics

Music topics//«
/m/04rlf
Music (parent topic)
/m/02mscn
Christian music
/m/0ggq0m
Classical music
/m/01lyv
Country
/m/02lkt
Electronic music
/m/0glt670
Hip hop music
/m/05rwpb
Independent music
/m/03_d0
Jazz
/m/028sqc
Music of Asia
/m/0g293
Music of Latin America
/m/064t9
Pop music
/m/06cqb
Reggae
/m/06j6l
Rhythm and blues
/m/06by7
Rock music
/m/0gywn
Soul music
//»
Gaming topics//«
/m/0bzvm2
Gaming (parent topic)
/m/025zzc
Action game
/m/02ntfj
Action-adventure game
/m/0b1vjn
Casual game
/m/02hygl
Music video game
/m/04q1x3q
Puzzle video game
/m/01sjng
Racing video game
/m/0403l3g
Role-playing video game
/m/021bp2
Simulation video game
/m/022dc6
Sports game
/m/03hf_rm
Strategy video game//»
Sports topics//«
/m/06ntj
Sports (parent topic)
/m/0jm_
American football
/m/018jz
Baseball
/m/018w8
Basketball
/m/01cgz
Boxing
/m/09xp_
Cricket
/m/02vx4
Football
/m/037hz
Golf
/m/03tmr
Ice hockey
/m/01h7lh
Mixed martial arts
/m/0410tth
Motorsport
/m/07bs0
Tennis
/m/07_53
Volleyball//»
Entertainment topics//«
/m/02jjt
Entertainment (parent topic)
/m/09kqc
Humor
/m/02vxn
Movies
/m/05qjc
Performing arts
/m/066wd
Professional wrestling
/m/0f2f9
TV shows
//»
Lifestyle topics//«
/m/019_rr
Lifestyle (parent topic)
/m/032tl
Fashion
/m/027x7n
Fitness
/m/02wbm
Food
/m/03glg
Hobby
/m/068hy
Pets
/m/041xxh
Physical attractiveness [Beauty]
/m/07c1v
Technology
/m/07bxq
Tourism
/m/07yv9
Vehicles//»
Society topics//«
/m/098wr
Society (parent topic)
/m/09s1f
Business
/m/0kt51
Health
/m/01h6rj
Military
/m/05qt0
Politics
/m/06bvp
Religion//»
Other topics//«
/m/01k8wb
Knowledge//»

//»
eventType//«
string

The eventType parameter restricts a search to broadcast events. If you specify
a value for this parameter, you must also set the type parameter's value to
video.

Acceptable values are:
completed – Only include completed broadcasts.
live – Only include active broadcasts.
upcoming – Only include upcoming broadcasts.//»
safeSearch//«

string

The safeSearch parameter indicates whether the search results should include
restricted content as well as standard content.

Acceptable values are:

moderate – YouTube will filter some content from search results and, at the
least, will filter content that is restricted in your locale. Based on their
content, search results could be removed from search results or demoted in
search results. This is the default parameter value.

none – YouTube will not filter the search result set.

strict – YouTube will try to exclude all restricted content from the search
result set. Based on their content, search results could be removed from search
results or demoted in search results.

//»
//»
//Channel«
channelId//«
string

The channelId parameter indicates that the API response should only contain
resources created by the channel.

Note: Search results are constrained to a maximum of 500 videos if your request
specifies a value for the channelId parameter and sets the type parameter value
to video, but it does not also set one of the forContentOwner, forDeveloper, or
forMine filters.

//»
channelType//«
string
The channelType parameter lets you restrict a search to a particular type of channel.

Acceptable values are:
any – Return all channels.
show – Only retrieve shows.//»
//»
//Video«
videoCaption//«
string
The videoCaption parameter indicates whether the API should filter video search results based on whether they have captions. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Do not filter results based on caption availability.
closedCaption – Only include videos that have captions.
none – Only include videos that do not have captions.//»
videoCategoryId//«
string
The videoCategoryId parameter filters video search results based on their category. If you specify a value for this parameter, you must also set the type parameter's value to video.//»
videoDefinition//«
string
The videoDefinition parameter lets you restrict a search to only include either high definition (HD) or standard definition (SD) videos. HD videos are available for playback in at least 720p, though higher resolutions, like 1080p, might also be available. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Return all videos, regardless of their resolution.
high – Only retrieve HD videos.
standard – Only retrieve videos in standard definition.//»
videoDimension//«
string
The videoDimension parameter lets you restrict a search to only retrieve 2D or 3D videos. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
2d – Restrict search results to exclude 3D videos.
3d – Restrict search results to only include 3D videos.
any – Include both 3D and non-3D videos in returned results. This is the default value.//»
videoDuration//«
string
The videoDuration parameter filters video search results based on their duration. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Do not filter video search results based on their duration. This is the default value.
long – Only include videos longer than 20 minutes.
medium – Only include videos that are between four and 20 minutes long (inclusive).
short – Only include videos that are less than four minutes long.//»
videoEmbeddable//«
string
The videoEmbeddable parameter lets you to restrict a search to only videos that can be embedded into a webpage. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Return all videos, embeddable or not.
true – Only retrieve embeddable videos.//»
videoLicense//«
string
The videoLicense parameter filters search results to only include videos with a particular license. YouTube lets video uploaders choose to attach either the Creative Commons license or the standard YouTube license to each of their videos. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Return all videos, regardless of which license they have, that match the query parameters.
creativeCommon – Only return videos that have a Creative Commons license. Users can reuse videos with this license in other videos that they create. Learn more.
youtube – Only return videos that have the standard YouTube license.//»
videoSyndicated//«
string
The videoSyndicated parameter lets you to restrict a search to only videos that can be played outside youtube.com. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Return all videos, syndicated or not.
true – Only retrieve syndicated videos.//»
videoType//«
string
The videoType parameter lets you restrict a search to a particular type of videos. If you specify a value for this parameter, you must also set the type parameter's value to video.

Acceptable values are:
any – Return all videos.
episode – Only retrieve episodes of shows.
movie – Only retrieve movies.
//»
//»
//Region/Location«
relevanceLanguage//«

string

The relevanceLanguage parameter instructs the API to return search results that
are most relevant to the specified language. The parameter value is typically
an ISO 639-1 two-letter language code. However, you should use the values
zh-Hans for simplified Chinese and zh-Hant for traditional Chinese. Please note
that results in other languages will still be returned if they are highly
relevant to the search query term.

//»
regionCode//«
string

The regionCode parameter instructs the API to return search results for videos
that can be viewed in the specified country. The parameter value is an ISO
3166-1 alpha-2 country code.

//»
location//«

string

The location parameter, in conjunction with the locationRadius parameter,
defines a circular geographic area and also restricts a search to videos that
specify, in their metadata, a geographic location that falls within that area.
The parameter value is a string that specifies latitude/longitude coordinates
e.g. (37.42307,-122.08427).

The location parameter value identifies the point at the center of the area.

The locationRadius parameter specifies the maximum distance that the location
associated with a video can be from that point for the video to still be
included in the search results.

The API returns an error if your request specifies a value for the location
parameter but does not also specify a value for the locationRadius parameter.

Note: If you specify a value for this parameter, you must also set the type
parameter's value to video.

//»
locationRadius//«

string

The locationRadius parameter, in conjunction with the location parameter,
defines a circular geographic area.

The parameter value must be a floating point number followed by a measurement
unit. Valid measurement units are m, km, ft, and mi. For example, valid
parameter values include 1500m, 5km, 10000ft, and 0.75mi. The API does not
support locationRadius parameter values larger than 1000 kilometers.

Note: See the definition of the location parameter for more information.//»
//»
//Results/Ordering«
maxResults//«
unsigned integer

The maxResults parameter specifies the maximum number of items that should be
returned in the result set. Acceptable values are 0 to 50, inclusive. The
default value is 5.

//»
order//«
string
The order parameter specifies the method that will be used to order resources in the API response. The default value is relevance.

Acceptable values are:
date – Resources are sorted in reverse chronological order based on the date they were created.
rating – Resources are sorted from highest to lowest rating.
relevance – Resources are sorted based on their relevance to the search query. This is the default value for this parameter.
title – Resources are sorted alphabetically by title.
videoCount – Channels are sorted in descending order of their number of uploaded videos.
viewCount – Resources are sorted from highest to lowest number of views. For live broadcasts, videos are sorted by number of concurrent viewers while the broadcasts are ongoing.//»
pageToken//«
string
The pageToken parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved.
publishedAfter
datetime
The publishedAfter parameter indicates that the API response should only contain resources created at or after the specified time. The value is an RFC 3339 formatted date-time value (1970-01-01T00:00:00Z).
publishedBefore
datetime
The publishedBefore parameter indicates that the API response should only contain resources created before or at the specified time. The value is an RFC 3339 formatted date-time value (1970-01-01T00:00:00Z).//»
//»

onBehalfOfContentOwner//«
string

This parameter can only be used in a properly authorized request. Note: This
parameter is intended exclusively for YouTube content partners.

The onBehalfOfContentOwner parameter indicates that the request's authorization
credentials identify a YouTube CMS user who is acting on behalf of the content
owner specified in the parameter value. This parameter is intended for YouTube
content partners that own and manage many different YouTube channels. It allows
content owners to authenticate once and get access to all their video and
channel data, without having to provide authentication credentials for each
individual channel. The CMS account that the user authenticates with must be
linked to the specified YouTube content owner.//»

//»

*/

let opts = failopts(args,{s:{v:1, c:1, p:1},l:{video:1,channel:1,playlist:1}});
if (!opts) return;
if (!args.length) return cberr("No args");
let key = get_var_str("YT_KEY");
if (!key) return cberr('YT_KEY is not set in the environment!');
let types = [];
if (opts.video||opts.v) types.push("video");
if (opts.channel||opts.c) types.push("channel");
if (opts.playlist||opts.p) types.push("playlist");

let base ='https://www.googleapis.com/youtube/v3'; 
let url=`${base}/search?q=${args.join("+")}&maxResults=50&part=snippet`;

/*

 "kind": "youtube#video",//«
  "snippet": {

    "title": string,
    "description": string,
    "publishedAt": datetime,
    "channelId": string,
    "channelTitle": string,
    "categoryId": string,

    "tags":[ string ],
    "liveBroadcastContent": string,
    "defaultLanguage": string,
    "localized":{"title":string,"description":string},
    "defaultAudioLanguage": string,
    "thumbnails": {//«
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },//»
  },
//»

 "kind": "youtube#playlist",//«
  "snippet": {

    "title": string,
    "description": string,
    "publishedAt": datetime,
    "channelId": string,
    "channelTitle": string,

    "defaultLanguage": string,
    "localized":{"title":string,"description":string},
    "thumbnails": {//«
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },//»

  },
//»

  "kind": "youtube#channel",//«
  "snippet": {

    "title": string,
    "description": string,
    "publishedAt": datetime,
    "customUrl": string,

    "defaultLanguage": string,
    "localized":{"title":string,"description":string},
    "country": string,
    "thumbnails": {//«
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },//»

  },//»


channelId: "UCD57pYXVsBNdDm87mimkByw"
channelTitle: "Scottish Hostels"
description: "At Scottish Hostels, all of our hostels are independently owned and run. They are great places to stay for people who don't need ..."
liveBroadcastContent: "none"
publishedAt//When channel was created
publishTime: "2012-04-10T12:28:41Z"
*/

//url += '&fields=items(snippet(channelId, channelTitle, description))';

let type_str = types.join(",");
if (type_str) url+=`&type=${type_str}`;

url+=`&key=${key}`;

log(url);

let rv = await fetch(`${url}&`);

if (!rv.ok){
	cberr(`Bad response: ${rv.status} (${rv.statusText})`);
	log(await rv.text());
	return;
}
let obj = await rv.json();
log(obj);
cbok();

},//»
//Use Youtube API to get a youtube channel, playlist information or playlist videos
THINGYT:async()=>{//«Playlist/PlaylistItems/Channel


//PL6uAUC9pJzA8byjHbA5p74CL10HUO0EtM

//Given: Channel id
//UU7AtGlWzcIfOXi64LdKfgxA

//Uploads playlist
//UC7AtGlWzcIfOXi64LdKfgxA

if (!args.length) return cberr("No args");
let key = get_var_str("YT_KEY");
if (!key) return cberr('YT_KEY is not set in the environment!');
let base ='https://www.googleapis.com/youtube/v3'; 
let id = args.shift();

let url;

//if (!id && id.match(/^[-_a-z0-9]{34}$/i)) return cberr("Bad list id (wanted 34 characters)???");

/*Playlist«

{ //JSON«
  "kind": "youtube#playlist",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "defaultLanguage": string,
    "localized": {
      "title": string,
      "description": string
    }
  },
  "status": {
    "privacyStatus": string
  },
  "contentDetails": {
    "itemCount": unsigned integer
  },
  "player": {
    "embedHtml": string
  },
  "localizations": {
    (key): {
      "title": string,
      "description": string
    }
  }
}//»

Part names//«
contentDetails
id
localizations
player
snippet
status
//»

Filters (specify exactly one of the following parameters)//«

channelId string

This value indicates that the API should only return the specified channel's playlists.

id string

The id parameter specifies a comma-separated list of the YouTube playlist ID(s)
for the resource(s) that are being retrieved. In a playlist resource, the id
property specifies the playlist's YouTube playlist ID.

mine boolean

This parameter can only be used in a properly authorized request. Set this
parameter's value to true to instruct the API to only return playlists owned by
the authenticated user.
//»

Optional parameters//«

hl string//«

The hl parameter instructs the API to retrieve localized resource metadata for
a specific application language that the YouTube website supports. The
parameter value must be a language code included in the list returned by the
i18nLanguages.list method.

If localized resource details are available in that language, the resource's
snippet.localized object will contain the localized values. However, if
localized details are not available, the snippet.localized object will contain
resource details in the resource's default language.
//»

maxResults unsigned integer//«

The maxResults parameter specifies the maximum number of items that should be
returned in the result set. Acceptable values are 0 to 50, inclusive. The
default value is 5.
//»

onBehalfOfContentOwner string//«

This parameter can only be used in a properly authorized request. Note: This
parameter is intended exclusively for YouTube content partners.

The onBehalfOfContentOwner parameter indicates that the request's authorization
credentials identify a YouTube CMS user who is acting on behalf of the content
owner specified in the parameter value. This parameter is intended for YouTube
content partners that own and manage many different YouTube channels. It allows
content owners to authenticate once and get access to all their video and
channel data, without having to provide authentication credentials for each
individual channel. The CMS account that the user authenticates with must be
linked to the specified YouTube content owner.
//»

onBehalfOfContentOwnerChannel string//«

This parameter can only be used in a properly authorized request. Note: This
parameter is intended exclusively for YouTube content partners.

The onBehalfOfContentOwnerChannel parameter specifies the YouTube channel ID of
the channel to which a video is being added. This parameter is required when a
request specifies a value for the onBehalfOfContentOwner parameter, and it can
only be used in conjunction with that parameter. In addition, the request must
be authorized using a CMS account that is linked to the content owner that the
onBehalfOfContentOwner parameter specifies. Finally, the channel that the
onBehalfOfContentOwnerChannel parameter value specifies must be linked to the
content owner that the onBehalfOfContentOwner parameter specifies.

This parameter is intended for YouTube content partners that own and manage
many different YouTube channels. It allows content owners to authenticate once
and perform actions on behalf of the channel specified in the parameter value,
without having to provide authentication credentials for each separate channel.
//»

pageToken string//«

The pageToken parameter identifies a specific page in the result set that
should be returned. In an API response, the nextPageToken and prevPageToken
properties identify other pages that could be retrieved.
//»
//»

Get all playlists from a given channel:

/playlists?part=snippet&channelId=UCXXXXXXXXXXXXXXXXXXXXXX

*/

//Get playlist meta information (no actual videos)
url=`${base}/playlists?id=${id}&part=id,snippet,status,contentDetails`;

//»

/*Playlist Items«

Required parameters//«

part string//«

The part parameter specifies a comma-separated list of one or more playlistItem
resource properties that the API response will include.

If the parameter identifies a property that contains child properties, the
child properties will be included in the response. For example, in a
playlistItem resource, the snippet property contains numerous fields, including
the title, description, position, and resourceId properties. As such, if you
set part=snippet, the API response will contain all of those properties.

The following list contains the part names that you can include in the parameter value:

contentDetails
id
snippet
status
//»

//»

Filters (specify exactly one of the following parameters)//«

id string//«

The id parameter specifies a comma-separated list of one or more unique
playlist item IDs.
//»
playlistId string//«

The playlistId parameter specifies the unique ID of the playlist for which you
want to retrieve playlist items. Note that even though this is an optional
parameter, every request to retrieve playlist items must specify a value for
either the id parameter or the playlistId parameter.
//»

//»

Optional parameters//«

maxResults unsigned integer//«

The maxResults parameter specifies the maximum number of items that should be
returned in the result set. Acceptable values are 0 to 50, inclusive. The
default value is 5.
//»

pageToken string//«

The pageToken parameter identifies a specific page in the result set that
should be returned. In an API response, the nextPageToken and prevPageToken
properties identify other pages that could be retrieved.

//»

videoId string//«

The videoId parameter specifies that the request should return only the
playlist items that contain the specified video.
//»

onBehalfOfContentOwner string//«

This parameter can only be used in a properly authorized request. Note: This
parameter is intended exclusively for YouTube content partners.

The onBehalfOfContentOwner parameter indicates that the request's authorization
credentials identify a YouTube CMS user who is acting on behalf of the content
owner specified in the parameter value. This parameter is intended for YouTube
content partners that own and manage many different YouTube channels. It allows
content owners to authenticate once and get access to all their video and
channel data, without having to provide authentication credentials for each
individual channel. The CMS account that the user authenticates with must be
linked to the specified YouTube content owner.
//»

//»

//url=`${base}/playlistItems?maxResults=50&playlistId=${listid}&part=snippet,contentDetails`;
//url += '&fields=items(contentDetails(videoId),snippet(title))';

»*/

/*Channel«

Required parameters//«

part string//«
The part parameter specifies a comma-separated list of one or more channel resource properties that the API response will include.

If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a channel resource, the contentDetails property contains other properties, such as the uploads properties. As such, if you set part=contentDetails, the API response will also contain all of those nested properties.

The following list contains the part names that you can include in the parameter value:

auditDetails
brandingSettings
contentDetails
contentOwnerDetails
id
localizations
snippet
statistics
status
topicDetails
//»

Filters (specify exactly one of the following parameters)

categoryId string
This parameter has been deprecated. The categoryId parameter specified a YouTube guide category and could be used to request YouTube channels associated with that category.

forUsername string
The forUsername parameter specifies a YouTube username, thereby requesting the channel associated with that username.

id string
The id parameter specifies a comma-separated list of the YouTube channel ID(s) for the resource(s) that are being retrieved. In a channel resource, the id property specifies the channel's YouTube channel ID.

managedByMe boolean
This parameter can only be used in a properly authorized request. Note: This parameter is intended exclusively for YouTube content partners.

Set this parameter's value to true to instruct the API to only return channels managed by the content owner that the onBehalfOfContentOwner parameter specifies. The user must be authenticated as a CMS account linked to the specified content owner and onBehalfOfContentOwner must be provided.

mine boolean
This parameter can only be used in a properly authorized request. Set this parameter's value to true to instruct the API to only return channels owned by the authenticated user.
//»

Optional parameters//«

hl string//«
The hl parameter instructs the API to retrieve localized resource metadata for a specific application language that the YouTube website supports. The parameter value must be a language code included in the list returned by the i18nLanguages.list method.
If localized resource details are available in that language, the resource's snippet.localized object will contain the localized values. However, if localized details are not available, the snippet.localized object will contain resource details in the resource's default language.
//»

maxResults unsigned integer//«
The maxResults parameter specifies the maximum number of items that should be returned in the result set. Acceptable values are 0 to 50, inclusive. The default value is 5.
//»
onBehalfOfContentOwner string//«
This parameter can only be used in a properly authorized request. Note: This parameter is intended exclusively for YouTube content partners.
The onBehalfOfContentOwner parameter indicates that the request's authorization credentials identify a YouTube CMS user who is acting on behalf of the content owner specified in the parameter value. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and get access to all their video and channel data, without having to provide authentication credentials for each individual channel. The CMS account that the user authenticates with must be linked to the specified YouTube content owner.
//»

pageToken string//«
The pageToken parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved.
//»

{ //JSON«
  "kind": "youtube#channel",
  "etag": etag,
  "id": string,
  "snippet": {
    "title": string,
    "description": string,
    "customUrl": string,
    "publishedAt": datetime,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "defaultLanguage": string,
    "localized": {
      "title": string,
      "description": string
    },
    "country": string
  },
  "contentDetails": {
    "relatedPlaylists": {
      "likes": string,
      "favorites": string,
      "uploads": string
    }
  },
  "statistics": {
    "viewCount": unsigned long,
    "subscriberCount": unsigned long,  // this value is rounded to three significant figures
    "hiddenSubscriberCount": boolean,
    "videoCount": unsigned long
  },
  "topicDetails": {
    "topicIds": [
      string
    ],
    "topicCategories": [
      string
    ]
  },
  "status": {
    "privacyStatus": string,
    "isLinked": boolean,
    "longUploadsStatus": string,
    "madeForKids": boolean,
    "selfDeclaredMadeForKids": boolean
  },
  "brandingSettings": {
    "channel": {
      "title": string,
      "description": string,
      "keywords": string,
      "trackingAnalyticsAccountId": string,
      "moderateComments": boolean,
      "unsubscribedTrailer": string,
      "defaultLanguage": string,
      "country": string
    },
    "watch": {
      "textColor": string,
      "backgroundColor": string,
      "featuredPlaylistId": string
    }
  },
  "auditDetails": {
    "overallGoodStanding": boolean,
    "communityGuidelinesGoodStanding": boolean,
    "copyrightStrikesGoodStanding": boolean,
    "contentIdClaimsGoodStanding": boolean
  },
  "contentOwnerDetails": {
    "contentOwner": string,
    "timeLinked": datetime
  },
  "localizations": {
    (key): {
      "title": string,
      "description": string
    }
  }
}//»


//»

//Get Uploads playlist id by channel name
//This works: the input must be the LITERAL unique channel name (rather than the name that shows up next to the avatar)
// Should return: items(1) -> items[0].contentDetails.relatedPlaylists.uploads == 
// url=`${base}/channels?forUsername=${encodeURIComponent(args.join(" "))}&part=contentDetails`;

»*/

url+=`&key=${key}`;

log(url);
//cbok();
//return;
let rv = await fetch(url);

if (!rv.ok){
	cberr(`Bad response: ${rv.status} (${rv.statusText})`);
	log(await rv.text());
	return;
}
let obj = await rv.json();
log(obj);
cbok();


},//»
//Use Youtube API to get one or more video information objects
VIDYT:async()=>{//«

if (!args.length) return cberr("No args");
let key = get_var_str("YT_KEY");
if (!key) return cberr('YT_KEY is not set in the environment!');
let base ='https://www.googleapis.com/youtube/v3'; 

/*«

Required parameters//«

part string//«
The part parameter specifies a comma-separated list of one or more video resource properties that the API response will include.

If the parameter identifies a property that contains child properties, the child properties will be included in the response. For example, in a video resource, the snippet property contains the channelId, title, description, tags, and categoryId properties. As such, if you set part=snippet, the API response will contain all of those properties.

The following list contains the part names that you can include in the parameter value:
contentDetails
fileDetails
id
liveStreamingDetails
localizations
player
processingDetails
recordingDetails
snippet
statistics
status
suggestions
topicDetails
//»

//»

Filters (specify exactly one of the following parameters)//«

chart string//«
The chart parameter identifies the chart that you want to retrieve.

Acceptable values are:
mostPopular – Return the most popular videos for the specified content region and video category.
//»
id string//«

The id parameter specifies a comma-separated list of the YouTube video ID(s)
for the resource(s) that are being retrieved. In a video resource, the id
property specifies the video's ID.

//»
myRating string//«

This parameter can only be used in a properly authorized request. Set this
parameter's value to like or dislike to instruct the API to only return videos
liked or disliked by the authenticated user.

Acceptable values are:
dislike – Returns only videos disliked by the authenticated user.
like – Returns only video liked by the authenticated user.
//»

//»

Optional parameters//«

hl string//«

The hl parameter instructs the API to retrieve localized resource metadata for
a specific application language that the YouTube website supports. The
parameter value must be a language code included in the list returned by the
i18nLanguages.list method.

If localized resource details are available in that language, the resource's
snippet.localized object will contain the localized values. However, if
localized details are not available, the snippet.localized object will contain
resource details in the resource's default language.

//»
maxHeight unsigned integer//«
The maxHeight parameter specifies the maximum height of the embedded player returned in the player.embedHtml property. You can use this parameter to specify that instead of the default dimensions, the embed code should use a height appropriate for your application layout. If the maxWidth parameter is also provided, the player may be shorter than the maxHeight in order to not violate the maximum width. Acceptable values are 72 to 8192, inclusive.
//»
maxResults unsigned integer//«
The maxResults parameter specifies the maximum number of items that should be returned in the result set.

Note: This parameter is supported for use in conjunction with the myRating parameter, but it is not supported for use in conjunction with the id parameter. Acceptable values are 1 to 50, inclusive. The default value is 5.
//»
maxWidth unsigned integer//«
The maxWidth parameter specifies the maximum width of the embedded player returned in the player.embedHtml property. You can use this parameter to specify that instead of the default dimensions, the embed code should use a width appropriate for your application layout.

If the maxHeight parameter is also provided, the player may be narrower than maxWidth in order to not violate the maximum height. Acceptable values are 72 to 8192, inclusive.
//»
onBehalfOfContentOwner string//«
This parameter can only be used in a properly authorized request. Note: This parameter is intended exclusively for YouTube content partners.

The onBehalfOfContentOwner parameter indicates that the request's authorization credentials identify a YouTube CMS user who is acting on behalf of the content owner specified in the parameter value. This parameter is intended for YouTube content partners that own and manage many different YouTube channels. It allows content owners to authenticate once and get access to all their video and channel data, without having to provide authentication credentials for each individual channel. The CMS account that the user authenticates with must be linked to the specified YouTube content owner.
//»
pageToken string//«
The pageToken parameter identifies a specific page in the result set that should be returned. In an API response, the nextPageToken and prevPageToken properties identify other pages that could be retrieved.

Note: This parameter is supported for use in conjunction with the myRating parameter, but it is not supported for use in conjunction with the id parameter.
//»
regionCode string//«

The regionCode parameter instructs the API to select a video chart available in
the specified region. This parameter can only be used in conjunction with the
chart parameter. The parameter value is an ISO 3166-1 alpha-2 country code.

//»
videoCategoryId string//«
The videoCategoryId parameter identifies the video category for which the chart should be retrieved. This parameter can only be used in conjunction with the chart parameter. By default, charts are not restricted to a particular category. The default value is 0.
//»

//»


// JSON « {
  "kind": "youtube#video",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "tags": [
      string
    ],
    "categoryId": string,
    "liveBroadcastContent": string,
    "defaultLanguage": string,
    "localized": {
      "title": string,
      "description": string
    },
    "defaultAudioLanguage": string
  },
  "contentDetails": {
    "duration": string,
    "dimension": string,
    "definition": string,
    "caption": string,
    "licensedContent": boolean,
    "regionRestriction": {
      "allowed": [
        string
      ],
      "blocked": [
        string
      ]
    },
    "contentRating": {
      "mpaaRating": string,
      "mpaatRating": string,
      "ytRating": string
    },
    "projection": string,
    "hasCustomThumbnail": boolean
  },
  "status": {
    "uploadStatus": string,
    "failureReason": string,
    "rejectionReason": string,
    "privacyStatus": string,
    "publishAt": datetime,
    "license": string,
    "embeddable": boolean,
    "publicStatsViewable": boolean,
    "madeForKids": boolean,
    "selfDeclaredMadeForKids": boolean
  },
  "statistics": {
    "viewCount": string,
    "likeCount": string,
    "dislikeCount": string,
    "favoriteCount": string,
    "commentCount": string
  },
  "player": {
    "embedHtml": string,
    "embedHeight": long,
    "embedWidth": long
  },
  "topicDetails": {
    "topicIds": [
      string
    ],
    "relevantTopicIds": [
      string
    ],
    "topicCategories": [
      string
    ]
  },
  "recordingDetails": {
    "recordingDate": datetime
  },
  "fileDetails": {
    "fileName": string,
    "fileSize": unsigned long,
    "fileType": string,
    "container": string,
    "videoStreams": [
      {
        "widthPixels": unsigned integer,
        "heightPixels": unsigned integer,
        "frameRateFps": double,
        "aspectRatio": double,
        "codec": string,
        "bitrateBps": unsigned long,
        "rotation": string,
        "vendor": string
      }
    ],
    "audioStreams": [
      {
        "channelCount": unsigned integer,
        "codec": string,
        "bitrateBps": unsigned long,
        "vendor": string
      }
    ],
    "durationMs": unsigned long,
    "bitrateBps": unsigned long,
    "creationTime": string
  },
  "processingDetails": {
    "processingStatus": string,
    "processingProgress": {
      "partsTotal": unsigned long,
      "partsProcessed": unsigned long,
      "timeLeftMs": unsigned long
    },
    "processingFailureReason": string,
    "fileDetailsAvailability": string,
    "processingIssuesAvailability": string,
    "tagSuggestionsAvailability": string,
    "editorSuggestionsAvailability": string,
    "thumbnailsAvailability": string
  },
  "suggestions": {
    "processingErrors": [
      string
    ],
    "processingWarnings": [
      string
    ],
    "processingHints": [
      string
    ],
    "tagSuggestions": [
      {
        "tag": string,
        "categoryRestricts": [
          string
        ]
      }
    ],
    "editorSuggestions": [
      string
    ]
  },
  "liveStreamingDetails": {
    "actualStartTime": datetime,
    "actualEndTime": datetime,
    "scheduledStartTime": datetime,
    "scheduledEndTime": datetime,
    "concurrentViewers": unsigned long,
    "activeLiveChatId": string
  },
  "localizations": {
    (key): {
      "title": string,
      "description": string
    }
  }
}
//»

Parts: comma separated list of top-level properties

search
let url=`${base}/search?key=${key}`;
let rv = await fetch(`${url}&q=${args.join("+")}`);

https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=YOUR_API_KEY
     
&fields=items(id,snippet(channelId,title,categoryId),statistics)
&part=snippet,statistics

categoryId: "27"
channelId: "UCP5tjEmvPItGyLhmjdwP7Ww"
channelTitle: "RealLifeLore"
defaultAudioLanguage: "en"
description: "The first 1,000 people to sign up for Skillshare will get their first 2 months for free; http://skl.sh/reallifelore14 \n\nGet RealLifeLore T-shirts here: http://standard.tv/reallifelore\n\nPlease Subscribe: http://bit.ly/2dB7VTO\n\nAnimations courtesy of Josh Sherrington of Heliosphere: https://www.youtube.com/c/heliosphere\n\nAdditional animations courtesy of David Powell\n\nFacebook: https://www.facebook.com/RealLifeLore/\nTwitter: https://twitter.com/RealLifeLore1\nReddit: https://www.reddit.com/r/RealLifeLore/\nInstagram: https://www.instagram.com/joseph_pise... \n\nSubreddit is moderated by Oliver Bourdouxhe\n\nSpecial thanks to my Patrons: Danny Clemens, Adam Kelly, Sarah Hughes, Greg Parham, Owen, Donna\n\nVideos explaining things. Mostly over topics like history, geography, economics and science. \n\nWe believe that the world is a wonderfully fascinating place, and you can find wonder anywhere you look. That is what our videos attempt to convey. \n\nCurrently, I try my best to release one video every week. Bear with me :)"
liveBroadcastContent: "none"
localized: {title: 'What Every Country in the World is Best At (Part 1)', description: 'The first 1,000 people to sign up for Skillshare w… to release one video every week. Bear with me :)'}
publishedAt: "2018-07-21T16:11:07Z"
tags: (18) ['real life lore', 'real life lore maps', 'real life lore geography', 'real life maps', 'world map', 'world map is wrong', 'world map with countries', 'world map real size', 'map of the world', 'world geography', 'geography', 'geography (field of study)', 'facts you didn’t know', 'what every country is best at', 'best in the world', 'every country in the world', 'part 1', 'country facts']
thumbnails: {default: {…}, medium: {…}, high: {…}, standard: {…}, maxres: {…}}
title: "What Every Country in the World is Best At (Part 1)"

items(id,statistics,snippet(channelTitle, description, publishedAt, title))

PT#S,
PT#M#S,
PT#H#M#S,
P#DT#H#M#S

»*/

let vid = args.shift();
if (!vid && vid.match(/^[-_a-z0-9]{11}$/i)) return cberr("Bad video id!");
const parts=[
"snippet",
"contentDetails",
//"fileDetails",
//"player",
//"processingDetails",
//"recordingDetails",
"statistics",
//"status",
//"suggestions",
//"topicDetails"
]
//let url=`${base}/videos?id=${vid}&part=id%2C+snippet`
//let url=`${base}/videos?id=${vid}&part=id,snippet,statistics&fields=items(id,statistics,snippet(channelTitle,description,publishedAt,title))`
//let url=`${base}/videos?id=${vid}&part=id,snippet,statistics,contentDetails`;
let url=`${base}/videos?id=${vid}&part=id,snippet,statistics,contentDetails&fields=items(id,statistics(viewCount),contentDetails(duration),snippet(channelTitle,description,publishedAt,title, channelId))`
url+=`&key=${key}`;
//wout(url);
//cbok();
//return;


log(url);
//log(encodeURIComponent(url));
//cbok();
//return;
let rv = await fetch(url);

if (!rv.ok){
	cberr(`Bad response: ${rv.status} (${rv.statusText})`);
	log(await rv.text());
	return;
}
let obj = await rv.json();
let itm = obj.items[0];
let snp = itm.snippet;
let durs = itm.contentDetails.duration;
let days=0,hrs=0,mins=0,secs=0;
let marr;
//PT#S,
//PT#M#S,
//PT#H#M#S,
//P#DT#H#M#S
if (marr = durs.match(/^PT(\d+)S$/)){
	secs = parseInt(marr[1]);
}
else if (marr = durs.match(/^PT(\d+)M(\d+)S$/)){
	mins = parseInt(marr[1]);
	secs = parseInt(marr[2]);
}
else if (marr = durs.match(/^PT(\d+)H(\d+)M(\d+)S$/)){
	hrs = parseInt(marr[1]);
	mins = parseInt(marr[2]);
	secs = parseInt(marr[3]);
}
else if (marr = durs.match(/^P(\d+)DT(\d+)H(\d+)M(\d+)S$/)){
	days = parseInt(marr[1]);
	hrs = parseInt(marr[2]);
	mins = parseInt(marr[3]);
	secs = parseInt(marr[4]);
}


let o={};
o.id = itm.id;
o.date = Math.round(new Date(snp.publishedAt).getTime()/1000);
o.title = snp.title;
o.desc = snp.description;
o.chanTitle = snp.channelTitle;
o.chanId = snp.channelId;
o.dur = secs+(mins*60)+(hrs*3600)+(days*86400);
o.views = itm.statistics.viewCount;


jlog(obj);

jlog(o);


//log(JSON.stringify(o,null, "  "));
//for (let item of o.items){
//	wout(item.id.videoId);
//}

cbok();

},//»

//Use the backend ytdl service to get audio files. It uses indexedDB (not the
//new api) to save the mapping from the 11 character base64 id to the name
//of the video file's name. If this is found in ~/Downloads with a ".part" at
//the end, we need to continue the download, and instruct the server to create
//an arbitrary file of n bytes to get the remainding chunks.
YTDL:async()=>{//«

/*

Do a nice little getch_loop here, using the bottom 1 (or 2) line(s) for "app" status/instructions.

We can use

*/
//xTODOx Clean up everything in svcs/ytdl.js (remove the /tmp/yt-dl upon finishing the download...)


const YTDL_DB_NAME="ytdl";
const YTDL_DB_VERS=1;
const YTDL_STORE_NAME="videos";
let db;
let vid;
let listid;
let index;
let chunks=[];
let fname;
let ws;
let killed = false;
let get_name="";
let path = `/home/${ENV.USER}/Downloads`;
let fullpath, partpath;
let tot_bytes_written=0;
let writing=false;
let got_error=false;
let resume_from = null;
let resume_name = null;
let partial="";
await fs.mkDir(path);

/*
const INSTRUCTIONS_LINE = `Press whatever for whatever!`;
const stat = (s)=>{//«
	if (s) log(s);
	if (!s) s = "";
	termobj.stat_render([s, INSTRUCTIONS_LINE]);
};//»
*/

const open_db=()=>{//«
	return new Promise(async(y,n)=>{
		let req = indexedDB.open(YTDL_DB_NAME, YTDL_DB_VERS);
		req.onsuccess = function (evt) {
			db = this.result;
			y(true);
		};
		req.onerror = function (evt) {
cerr("openDb:", evt.target.errorCode);
			y();
		};
		req.onupgradeneeded = function (evt) {
log("openDb.onupgradeneeded");
			let store = evt.currentTarget.result.createObjectStore(YTDL_STORE_NAME,{keyPath: 'id'});
//			store.createIndex('type', 'type', { unique: false });
//			store.createIndex('by', 'by', { unique: false });
//			store.createIndex('time', 'time', { unique: false });
//			store.createIndex('score', 'score', { unique: false });
		};
	});
}//»
const get_object_store=(store_name, mode)=>{//«
//   * @param {string} store_name
//   * @param {string} mode either "readonly" or "readwrite"
	let tx = db.transaction(store_name, mode);
	return tx.objectStore(store_name);
}//»
const add_db_item=(obj)=>{//«
	return new Promise(async(y,n)=>{
		let store = get_object_store(YTDL_STORE_NAME, 'readwrite');
		let req;
		try {
		  req = store.put(obj);
		}
		catch (e) {
cerr(e);
			y();
			return;
		}
		req.onsuccess = function (evt) {
			y(true);
		};
		req.onerror = function() {
cerr("addPublication error", this.error);
			y();
		};
	});
}//»
const get_db_item=id=>{//«
	return new Promise(async(y,n)=>{
		let store = get_object_store(YTDL_STORE_NAME, 'readonly');
		if (!store) return y();
		let req = store.get(id);
		req.onsuccess=e=>{
			y(e.target.result);
		};
		req.onerror=e=>{
			cerr(e);
			y();
		};
	});
}//»
const rm_db_item=id=>{//«
	return new Promise(async(Y,N)=>{
		let store = get_object_store(YTDL_STORE_NAME, 'readwrite');
		if (!store) return Y();
		let req = store.delete(id);
		req.onsuccess = ()=> {Y(true);}
		req.onerror = (err)=> {
			Y();
cerr(err);
		}
	});
}//»

const doend=()=>{//«
	if (ws) ws.close();
//	termobj.getch_loop(null);
	cbok();
	killed = true;
};//»
const abort=()=>{//«
	if (ws&&!killed) {
		ws.send("Abort");
		setTimeout(doend, 250);
	}
	killed = true;
};//»

const trywrite=()=>{//«
	return new Promise(async(Y,N)=>{
		if (writing) return Y(true);
		let chunk = chunks.shift();
		if (!chunk) return Y();
		writing = true;
		if (!await fs.writeFile(partpath, chunk, {append: true})){
cerr(`Could not write to ${partpath}`);
		}
		tot_bytes_written+=chunk.size;
		writing = false;
		Y(true);
	})
};//»
const finish_writing=()=>{//«
	return new Promise(async(Y,N)=>{
		let iter=0;
		while (await trywrite()){
			iter++;
			if (iter > 1000){
cerr("Infinite looper????");
				break;
			}
		}
//cwarn("Bytes written: ", tot_bytes_written);
		Y();
	});
};//»
const saveit=async()=>{//«
	if (!fullpath) return doend();
	await finish_writing();
	werr(`Moving to: '${fullpath}'...`);
	if (!await fs.mvFileByPath(partpath, fullpath)){
		werr("Failed!");
	}
//	await fs.writeFile(fullpath, new Blob(chunks));
if (!await(rm_db_item(vid))){
cerr(`Could not delete: ${vid}`);
}
	cbok();
	if (ws) {
		ws.send("Cleanup");
		setTimeout(()=>{
			ws.close();
		}, 250);
	}
//    termobj.getch_loop(null);
};//»
const init_file=()=>{//«
	return new Promise(async(Y,N)=>{
		fullpath = `${path}/${fname}`;
		partpath = `${fullpath}.part`;
		if (get_name) {
			wout(fname);
			doend();
			Y();
			return;
		}

		if (await fs.pathToNode(fullpath)){
			werr(`The file already exists: ${fullpath}`);
			doend();
			Y();
			return;
		}

		if (!await add_db_item({id: vid, path: partpath})){
	werr("Could not add item  to the database");
	doend();
	Y();
	return;
		}

		let rv = await fs.pathToNode(partpath);
		if (rv){
			if (!Number.isFinite(rv.SZ)){
				werr(`Want to resume download, but no 'SZ' in node!`);
				doend();
				Y();
			}
			else {
				tot_bytes_written = rv.SZ;
				werr(`Resume download @${rv.SZ}`);
				ws.send("Abort");
				let fname = fullpath.split("/").pop();
				setTimeout(()=>{ws.send(`VID:${vid} ${fname} ${rv.SZ}`);}, 250);
				Y(true);
			}
			return;
		}
		Y(true);
	});
};//»
const startws=()=>{//«

ws = new WebSocket(`ws://${window.location.hostname}:${port}/`);

ws.onopen=()=>{//«
//log(`VID${get_name}:${vid}`);

if (resume_name) ws.send(`VID${get_name}:${vid} ${resume_name} ${resume_from}`);
else ws.send(`VID${get_name}:${vid}`);

};//»
ws.onclose = ()=>{//«

//log('disconnected');
if (!killed) {
	werr("Unexpectedly closing...");
	cberr();
//	termobj.getch_loop(null);
}

};//»
ws.onmessage = async e =>{//«

let dat = e.data;
//log(dat);
if (dat instanceof Blob) {
//log(dat);
	chunks.push(dat);
	trywrite();
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
if (s.match(/^{"id":/)||partial){//«
let o;
try{
	partial=partial+s;
	o=JSON.parse(partial.replace(/\n/g,"\\n"));
}
catch(e){
cwarn("Caught JSON parse error!");
cerr(e);
let pos = parseInt(e.message.split(" ").pop());
log(pos, s[pos], s[pos].charCodeAt());
return;
}
partial = null;
/*Object fields«

categories: ['Gaming']
channel: "Kurisu-pyon"
channel_follower_count: 1720
channel_id: "UC7AtGlWzcIfOXi64LdKfgxA"
description: "From South Park - S21E04 (No. 281) - The Franchise Prequel\nFrom Enter the Dragon (1973)"
duration: 46
epoch: 1662467589
title: "What's your shtyle/style/shtoyle?! (South Park/Enter the Dragon)"
upload_date: "20171012"
uploader: "Kurisu-pyon"
uploader_id: "LycisAhara"
uploader_url: "http://www.youtube.com/user/LycisAhara"
thumbnail: "https://i.ytimg.com/vi_webp/cnY5YK2ttaM/maxresdefault.webp"
tags: (2) ['enter the dragon', 'south park']
view_count: 409497

filesize: 761929
format: "251 - audio only (medium)"
format_id: "251"
format_note: "medium"



abr: 132.276
acodec: "opus"
age_limit: 0
asr: 48000
audio_channels: 2
audio_ext: "webm"
automatic_captions: {}
availability: "public"
average_rating: null
categories: ['Gaming']
channel: "Kurisu-pyon"
channel_follower_count: 1720
channel_id: "UC7AtGlWzcIfOXi64LdKfgxA"
channel_url: "https://www.youtube.com/channel/UC7AtGlWzcIfOXi64LdKfgxA"
chapters: null
comment_count: 246
container: "webm_dash"
description: "From South Park - S21E04 (No. 281) - The Franchise Prequel\nFrom Enter the Dragon (1973)"
display_id: "cnY5YK2ttaM"
downloader_options: {http_chunk_size: 10485760}
duration: 46
duration_string: "46"
dynamic_range: null
epoch: 1662467589
ext: "webm"
extractor: "youtube"
extractor_key: "Youtube"
filename: "/tmp/ytdl-ixzEvK/What_s_your_shtyle_style_shtoyle_South_Park_Enter_the_Dragon-251.webm"
filesize: 761929
format: "251 - audio only (medium)"
format_id: "251"
format_note: "medium"
formats: (23) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
fps: null
fulltitle: "What's your shtyle/style/shtoyle?! (South Park/Enter the Dragon)"
has_drm: false
height: null
http_headers: {User-Agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb…ML, like Gecko) Chrome/94.0.4606.41 Safari/537.36', Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,;q=0.8', Accept-Language: 'en-us,en;q=0.5', Sec-Fetch-Mode: 'navigate'}
id: "cnY5YK2ttaM"
is_live: false
language: ""
language_preference: -1
like_count: 4185
live_status: "not_live"
original_url: "cnY5YK2ttaM"
playable_in_embed: true
playlist: null
playlist_index: null
preference: null
protocol: "https"
quality: 3
release_timestamp: null
requested_subtitles: null
resolution: "audio only"
source_preference: -1
subtitles: {}
tags: (2) ['enter the dragon', 'south park']
tbr: 132.276
thumbnail: "https://i.ytimg.com/vi_webp/cnY5YK2ttaM/maxresdefault.webp"
thumbnails: (42) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
title: "What's your shtyle/style/shtoyle?! (South Park/Enter the Dragon)"
upload_date: "20171012"
uploader: "Kurisu-pyon"
uploader_id: "LycisAhara"
uploader_url: "http://www.youtube.com/user/LycisAhara"
url: "https://rr2---sn-5uaeznyy.googlevideo.com/videoplayback?expire=1662489190&ei=Bj4XY6noC6aj0_wP6Me10Aw&ip=2600%3A8807%3Ac2d7%3A8700%3A1c89%3Afd55%3A1f10%3Aac8&id=o-AOxlV4Si3ExbLDdAquNFOgpeX4BcIJgd6cj3ZvfU5z1T&itag=251&source=youtube&requiressl=yes&mh=Fr&mm=31%2C26&mn=sn-5uaeznyy%2Csn-p5qddn7k&ms=au%2Conr&mv=m&mvi=2&pl=35&initcwndbps=1532500&spc=lT-Khl3iJjY0mz0U-CDWAo7Tzh0iu54&vprv=1&svpuc=1&mime=audio%2Fwebm&gir=yes&clen=761929&dur=46.081&lmt=1507881540644933&mt=1662467101&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=ANDROID&rbqsm=fr&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAMbvChOlkw0Wo-Qce0fiiRakii5hRqg5OcH0mhVSLP3oAiA8Ef607DgIp-iYB6asPNAXoxbyyPBB5GW96xR9Sn0Y5g%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAKiX6x8PaQhP0Y1tUs2bc1LylwbtORMUKFs4pa7HbO9TAiEAmB07Y253lI3cNeA7qPrG6xwWAFOmKz-lfNkxaKbxNPM%3D"
urls: "https://rr2---sn-5uaeznyy.googlevideo.com/videoplayback?expire=1662489190&ei=Bj4XY6noC6aj0_wP6Me10Aw&ip=2600%3A8807%3Ac2d7%3A8700%3A1c89%3Afd55%3A1f10%3Aac8&id=o-AOxlV4Si3ExbLDdAquNFOgpeX4BcIJgd6cj3ZvfU5z1T&itag=251&source=youtube&requiressl=yes&mh=Fr&mm=31%2C26&mn=sn-5uaeznyy%2Csn-p5qddn7k&ms=au%2Conr&mv=m&mvi=2&pl=35&initcwndbps=1532500&spc=lT-Khl3iJjY0mz0U-CDWAo7Tzh0iu54&vprv=1&svpuc=1&mime=audio%2Fwebm&gir=yes&clen=761929&dur=46.081&lmt=1507881540644933&mt=1662467101&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=ANDROID&rbqsm=fr&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRQIhAMbvChOlkw0Wo-Qce0fiiRakii5hRqg5OcH0mhVSLP3oAiA8Ef607DgIp-iYB6asPNAXoxbyyPBB5GW96xR9Sn0Y5g%3D%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAKiX6x8PaQhP0Y1tUs2bc1LylwbtORMUKFs4pa7HbO9TAiEAmB07Y253lI3cNeA7qPrG6xwWAFOmKz-lfNkxaKbxNPM%3D"
vcodec: "none"
video_ext: "none"
view_count: 409497
was_live: false
webpage_url: "https://www.youtube.com/watch?v=cnY5YK2ttaM"
webpage_url_basename: "watch"
webpage_url_domain: "youtube.com"
width: null
_filename: "/tmp/ytdl-ixzEvK/What_s_your_shtyle_style_shtoyle_South_Park_Enter_the_Dragon-251.webm"
_has_drm: null
_type: "video"


categories: ['Gaming']
channel: "Kurisu-pyon"
channel_follower_count: 1720
channel_id: "UC7AtGlWzcIfOXi64LdKfgxA"
description: "From South Park - S21E04 (No. 281) - The Franchise Prequel\nFrom Enter the Dragon (1973)"
duration: 46
epoch: 1662467589
title: "What's your shtyle/style/shtoyle?! (South Park/Enter the Dragon)"
upload_date: "20171012"
uploader: "Kurisu-pyon"
uploader_id: "LycisAhara"
uploader_url: "http://www.youtube.com/user/LycisAhara"
thumbnail: "https://i.ytimg.com/vi_webp/cnY5YK2ttaM/maxresdefault.webp"
tags: (2) ['enter the dragon', 'south park']
view_count: 409497

»*/
ws.send("FILEPATH:"+o.filename);
fname = o.filename.split("/").pop();
if (! await init_file()) return;

let obj={};
//uploader and channel can be the same (but not always?!?!?)
let keys=[//«
"categories",//[]
"channel",
"channel_follower_count",
"channel_id",
"description",
"duration",
"title",
"upload_date",
"uploader",
"uploader_id",
"thumbnail",
"tags",//[]
"view_count"
];//»
for (let k of keys)obj[k] = o[k];
log("INFO",obj);
return;
}//»
	if (s.match(/^\[download\]/)) wclerr((s.split("\n").pop()));
	else werr(s);
}
else if (obj.err) {

let s = obj.err;
if (s.match(/^WARNING: ffmpeg-location \/blah/)||s.match(/^WARNING: [-_0-9a-zA-Z]{11}: writing DASH/)){}

else {
/*

Need to handle errors:

ERROR: unable to download video data: <urlopen error [Errno -3] Temporary failure in name resolution>

Also, the "403 Forbidden" one...

*/
let err = obj.err;
if (err.match(/ERROR:/)) got_error = true;
werr(obj.err);

}

}
else if (obj.name) {
//log(obj);
	if (obj.resume){
cwarn("Resuming...");
return;
	}
	fname = obj.name;
//	init_fil

}
else if (obj.done) {
	saveit();
}
else{
cwarn("WHAT IS THIS???");
log(obj);
}

};//»

}//»
const initloop=()=>{//«

let n_scroll_lines = 2;
let minh = n_scroll_lines+1;
if (termobj.h < minh){
	cberr(`Need height >= ${minh}!`);
	return;
}
killreg(cb=>{
	if (!killed) {
		if (ws) {
			ws.send("Abort");
			setTimeout(()=>{
				ws.close();
			}, 250);
		}
//		termobj.getch_loop(null);
		finish_writing();
	}
	cb&&cb();
	killed = true;
})
/*
termobj.getch_loop(ch=>{
	if (termobj.h < minh) return;
}, n_scroll_lines, minh);
stat();
*/

};//»

if (!await open_db()) return cberr("No database!");

//Startup«
let port = 20003;

let opts=failopts(args,{s:{p:3, n:1},l:{port:3,name:1}});
if (!opts) return;
if (opts.name||opts.n) get_name = "_NAME";
let portarg = opts.port||opts.p;
if (portarg){
	let portnum = portarg.pi({MIN:1024, MAX: 65535});
	if (!Number.isFinite(portnum)) return cberr("Invalid port");
	port = portnum;
}

let arg = args.shift();
if (!arg) return cberr("No arg given!");
if (arg.match(/youtube\.com/)){
	let url;
	try{
		url = new URL(arg);
	}
	catch(e){
		return cberr(e.message);
	}
	if (!url.hostname.match(/youtube\.com$/)) return cberr("Does not appear to be a youtube.com link!");
	let params = url.searchParams;
	vid = params.get("v");
	listid = params.get("list");
	index = params.get("index");
}
else if (arg.match(/^[-_a-zA-Z0-9]+$/)) {
	if (arg.length === 11) vid = arg;
	else if (arg.length >= 24 && arg.match(/^[A-Z][A-Z]/)) listid = arg;
	
	else return cberr("Bad looking ID");
}
//vid = arg;
//if (!vid)
if (listid){
	werr("TODO: implement lists")
	cbok();
	return;
}
if (vid && vid.match(/^[-_a-zA-Z0-9]{11}$/)){
	let rv = await get_db_item(vid);
	if (rv){
		let node = await fs.pathToNode(rv.path);
		if (!node){
cwarn(`Could not find path ${rv.path}, deleting db item...`);
			await rm_db_item(vid);
		}
		if (!Number.isFinite(node.SZ)){
			cberr(`Invalid node.SZ (${node.SZ})!?`);
			return;
		}
		partpath = rv.path;
		fullpath = partpath.replace(/\.part$/,"");
		resume_name = node.NAME.replace(/\.part$/,"");
		resume_from = node.SZ;
	}
	initloop();
	startws();

}
else cberr("BARFID");
//»

}//»

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fs = NS.api.fs;
const capi = Core.api;
const {jlog}=capi;

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
	get_var_str,
	failopts,
	ENV
} = Shell;

//»

const bufferToWave=(abuffer)=>{//«
//const bufferToWave=(abuffer, len)=>{
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


//Old«

/*«
'addremuser':async(args)=>{

//Set file
//let rv = await fetch(`/_1001?q=${btoa("username p@$$w0rd Filename.js")}`,{method: "POST", body:bytes.buffer});

	let user = args.shift();
	let pass = args.shift();
	if (!(user&&pass)) return cberr("Need username and password!");
	let q = btoa(`${user} ${pass}`);
	let rv = await fetch(`/_aru?q=${q}`);
	if (!rv.ok) return cberr("Error");
	cbok("OK");

},
'setremapp':async(args)=>{

	let user = args.shift();
	let pass = args.shift();
	let fname = args.shift();
	if (!fname) return cberr("No arg!");
	let bytes = await readFile(fname, {binary: true});
	if (!bytes) return cberr(`${fname}: not found`);
	let usename = fname.split("/").pop();
	log(usename);
	let q = btoa(`${user} ${pass} ${usename}`);
	let rv = await fetch(`/_sra?q=${q}`,{method: "POST", body:bytes.buffer});
	if (!rv.ok) return cberr("Error");
	cbok();
},
»*/
//Synth stuff«

//Midi file«
/*How to convert from ticks to seconds:«

Question:
I want to know how to convert MIDI ticks to actual playback seconds.

For example, if the MIDI PPQ (Pulses per quarter note) is 1120, how would I
convert it into real world playback seconds?

Answer:
The formula is 60000 / (BPM * PPQ) (milliseconds).

Where BPM is the tempo of the track (Beats Per Minute).

(i.e. a 120 BPM track would have a MIDI time of (60000 / (120 * 192)) or 2.604 ms for 1 tick.

If you don't know the BPM then you'll have to determine that first. MIDI times
are entirely dependent on the track tempo.

»*/
/*JSON Object«



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
}
//»*/
/*
'midi':async(args)=>{//«

//Midi note to freq
//Midi note 50 is the frequency at freqs[50]
let freqs = [];
for (let i=0; i <= 127; i++) freqs[i]= 13.75*(2**((i-9)/12));

if (!await capi.loadMod("av.miditojson")) return cberr("Midi could not be loaded!");

let mod = NS.mods["av.miditojson"].Midi;
let path = args.shift();
if (!path) return cberr("No path given!");
let node = await pathToNode(path);
if (!node) return cberr(`${path}: not found`);
let t = node.root.TYPE;

let rv = await readFile(node.fullpath);
if (!(rv instanceof Blob)) return cberr("Did not get a blob!");
let midi = new mod(await capi.toBuf(rv));
let head = midi.header;
let tracks = midi.tracks;
let ppq = head.ppq;
wout(`PPQ: ${ppq}`);
wout(`Tracks: ${tracks.length}`);
let temps = head.tempos;
wout("Tempos (ms per tick):");
for (let i=0; i < temps.length; i++){
	//The formula is 60000 / (BPM * PPQ) (milliseconds).
	let tmp = temps[i];
	//log(tmp);
	let ms_per_tick = 60000/(tmp.bpm*ppq);
	wout(`${i}) ${ms_per_tick}`);
}
log(head);
log(tracks);

//}
//else return cberr(`'${t}: not yet implemented'`);

cbok();

},//»
*/
//»

/*
'midiup':async()=>{
	if (await capi.initMidi()) return cbok();
	return cberr("Midi could not be enabled!");
},
'synth':()=>{
//	termobj.ENV['?']=0;
	termobj.init_app_mode("synth", 
		ret=>{//«
//			if (servobj.killed) {
//				termobj.app_line_out("Killed");
//				return termobj.end_app_mode();
//			}
			let gotcom = ret.trim();
			if (gotcom) wout(`OK: ${gotcom}`);
			termobj.response_end();
		},//» 
		cbok
	)
},

»*/
/*//«'hncomments':async()=>{
const kid = (elem, ...arr)=>{
let cur = elem;
for (let num of arr){
cur = cur.children[num];
}
return cur;

};
let str = await fsapi.readFile("/home/me/Desktop/snayderr.html");
if (!str) return cberr("Got nada");

let parser = new DOMParser();
let doc = parser.parseFromString(str, "text/html");
let coms = doc.getElementsByClassName("comment-tree")[0].children[0].childNodes;
for (let com of coms){
let got = kid(com,0,0,0,0,2);
//log(got);
//let got = com.children[0].children[0].children[0].children[0].children[2];
let user = kid(got, 0, 0, 0);
log(user.innerText);
//log(got);
}
//log(coms);
cbok();
},
»*/

/*«
'swon': async () => {
	if (await capi.initSW()) return cbok("The service worker has been registered");
	cberr("There was a problem registering the service worker");
},
'swoff':async()=>{if(await capi.initSW(true))return cbok("The service worker has been unregistered");cberr("There was a problem unregistering the service worker");},

'comstr':(args)=>{//«
	let opts = failopts(args,{LONG:{nowrap:1},SHORT:{}});
	if (!opts) return;
	let com = args.shift();
	if (!com) return cberr("No arg given!");
	let func = builtins[com];
	if (!func) {
		let got = shell_lib[com];
		if (got) func = got._func();
		if (!func) return cberr(`${com}:\x20function not found`);
	}
	let arr = func.toString().split("\n");
	for (let ln of arr){
		if (opts.nowrap) wout(ln);
		else wout(wrap_line(ln));
	}
	cbok();
},//»
//Help«

const builtins_help={
ls:`List out the contents of one or more directories`,
cd:`Change into a new directory`,
swon: 'Enable service workers for the current url for offline usage',
swoff: 'Disable the active service worker',
swurl:'Print out the url for which the active service worker is registered',
help:'Show a short message about system usage (no args) or an individual command',
libs:'List out the available command libraries',
lib:'List out the commands in a given command library',
mkdir:'Make a directory',
login:`Login to the system via the standard google app engine login procedure. No permissions are asked for.`,
logout:`Logout of the system`,
import:`Import a command library into the current shell execution context`,
pwd:`Print out the current working directory`,
setname:`Set your public facing username to something other than the username used for your gmail address`,
lockname:`Lock your username so that setname -u doesn't work`,
unlockname:`Allows you to change your username via setname -u`,
cp:`Copy files`,
mv:`Move or rename files or folders`,
cat:`Print out the contents of files`,
echo:`Print out the command arguments`,
open:`Open an application window in the Desktop environment`,
close:`Close an application window given its id`,
hist:`Print out the command line history`
};


//»

'help': async args => {

	let which = args.shift();

	let str = null;
	if (!which) {
		str = help_str;
		which = "overview";
	}
	else if (builtins[which]) str = builtins_help[which];
	else if (shell_lib[which]) str = shell_lib[which]._help();
	else return cberr(`help:\x20${which}:\x20command not found`);
	if (!str) {
		werr(`help:\x20${which}:\x20nothing was returned`);
		cbok();
		return;
	}
	let mod = NS.mods["util.pager"];
	if (!mod){
		wout(fmt_lines(str));
		cbok();
		return;
	}
	let pager = new mod(Core, shell_exports);
	pager.init(fmt_lines(str).split("\n"),`help(${which})`,cbok);
},
'libs': async() => {
	let arr=[];
	let rv;
	let hashes = "#".rep(Math.ceil((termobj.w-11)/2));
	arr=arr.concat(fmt("Here are the directory listings of the locally cached and server-side command libaries that are available for importing into the shell's runtime environment. To refer to a library, remove its file path up to '/libs/', replace subdirectories with a '.', and remove the '.js' extension, for example:"));
	arr.push("$ import fs");
	arr.push("$ import math.stats");
	arr.push(" ");
	arr.push(`${hashes}\xa0\xa0Cached\xa0\xa0${hashes}`);
	arr.push(" ");
	arr=arr.concat(...(await do_ls(["-pfR", "/code/libs"])));
	arr.push(" ");
	arr.push(`${hashes}\xa0\xa0Server\xa0\xa0${hashes}`);
	arr.push(" ");
	arr=arr.concat(...(await do_ls(["-pfR", "/site/root/code/libs"])));
	let str = arr.join("\n");
	let mod = NS.mods["util.pager"];
	if (!mod){
		wout(str);
		cbok();
		return;
	}
	let pager = new mod(Core, shell_exports);
	pager.init(str.split("\n"),`libs`,cbok);
},
'swon':async()=>{if(await capi.initSW())return cbok("The service worker has been registered");cberr("There was a problem registering the service worker");},
'swoff':async()=>{if(await capi.initSW(true))return cbok("The service worker has been unregistered");cberr("There was a problem unregistering the service worker");},
'swurl':()=>{try{cbok(window.location.origin+(decodeURIComponent(navigator.serviceWorker.controller.scriptURL.split("?")[1]).replace(/^path=\./,"")));}catch(e){cberr("ServiceWorker not activated!");}},

jseval:(args)=>{//«
const runit = s=>{
	if (!s.length){
		cbok();
		return;
	}
//log(s);
	run_js_script(s, "eval", [], "eval");
};
let didrun=false;
if (!args.length||args[0]=="-"){
	let s = '';
	read_stdin(ret => {
		if (isobj(ret) && ret.EOF) {
			if (didrun) return;
			runit(s);
			return;
		}
		if (isarr(ret)) {
			if (!isstr(ret[0])) return cberr("Bad input");
			didrun=true;
			runit(ret.join("\n"));
		}
		else if (isstr(ret)){
			s+=ret+"\n";
		}
		else{
cwarn(ret);
		}
	}, {
		SENDEOF: true
	});
}
else{
	let s = '';
	for (let arg of args) s+= " " + arg;
	runit(s);
}
},//»
//»*/

//»

/*


//Stupid language to ISO language code mapping
//e.g. english -> en
SETLANGS:()=>{//«

const LANGUAGES = {//«
'afrikaans':'af'	,
'albanian':'sq',
'amharic':'am',
'arabic':'ar',
'armenian':'hy',
'azerbaijani':'az',
'basque':'eu',
'belarusian':'be',
'bengali':'bn',
'bosnian':'bs',
'bulgarian':'bg',
'catalan':'ca',
'chichewa':'ny',
'corsican':'co',
'croatian':'hr',
'czech':'cs',
'danish':'da',
'dutch':'nl',
'english':'en',
'esperanto':'eo',
'estonian':'et',
'filipino':'tl',
'finnish':'fi',
'french':'fr',
'frisian':'fy',
'galician':'gl',
'georgian':'ka',
'german':'de',
'greek':'el',
'gujarati':'gu',
'haitian creole':'ht',
'hausa':'ha',
//'hebrew':'iw',
'hebrew':'he',
'hindi':'hi',
'hungarian':'hu',
'icelandic':'is',
'igbo':'ig',
'indonesian':'id',
'irish':'ga',
'italian':'it',
'japanese':'ja',
'javanese':'jw',
'kannada':'kn',
'kazakh':'kk',
'khmer':'km',
'korean':'ko',
'kurdish':'ku',
'kyrgyz':'ky',
'lao':'lo',
'latin':'la',
'latvian':'lv',
'lithuanian':'lt',
'luxembourgish':'lb',
'macedonian':'mk',
'malagasy':'mg',
'malay':'ms',
'malayalam':'ml',
'maltese':'mt',
'maori':'mi',
'marathi':'mr',
'mongolian':'mn',
'burmese':'my',
'nepali':'ne',
'norwegian':'no',
'odia':'or',
'pashto':'ps',
'persian':'fa',
'polish':'pl',
'portuguese':'pt',
'punjabi':'pa',
'romanian':'ro',
'russian':'ru',
'samoan':'sm',
'scots gaelic':'gd',
'serbian':'sr',
'sesotho':'st',
'shona':'sn',
'sindhi':'sd',
'sinhala':'si',
'slovak':'sk',
'slovenian':'sl',
'somali':'so',
'spanish':'es',
'sundanese':'su',
'swahili':'sw',
'swedish':'sv',
'tajik':'tg',
'tamil':'ta',
'telugu':'te',
'thai':'th',
'turkish':'tr',
'ukrainian':'uk',
'urdu':'ur',
'uyghur':'ug',
'uzbek':'uz',
'vietnamese':'vi',
'welsh':'cy',
'xhosa':'xh',
'yiddish':'yi',
'yoruba':'yo',
'zulu':'zu',
'cebuano':'ceb',
'hawaiian':'haw',
'hmong':'hmn',
'chinese (simplified)':'zh-Hans',
'chinese (traditional)': 'zh-Hant',
//'chinese (simplified)':'zh-cn',
//'chinese (traditional)': 'zh-tw',
}
//»

localStorage["data-language_codes"] = JSON.stringify(LANGUAGES);

cbok();

},//»
LANGS:()=>{//«

let ALL = localStorage["data-language_codes"];
if (!ALL) return cberr("localStorage['data-language_codes'] has not been set!");

let langs;
try {
	langs = JSON.parse(ALL);
}
catch(e){
	cberr("Invalid JSON in localStorage['data-language_codes']!");
	return;
}

let matches=[];
for (let k in langs){
	if ((new RegExp(args.join(" "),"i")).test(k)) matches.push(langs[k], k);
}
if (matches.length===2) {
	wout(matches[0]);
	werr(matches[1]);
}
else{
	werr(`${matches.length/2} matches`);
	for (let i=0; i < matches.length; i+=2) werr(`${matches[i]}: ${matches[i+1]}`);
}

cbok();

},//»

//Stupid country to ISO country code mapping
//e.g. United States -> US
SETCCS:()=>{//«

//Used for regionCode in youtube search, which figures out availability/
//viewability in the given country. For relevanceLanguage, use the language code
//returned from the LANGS command.
//
//ISO 3166-1 alpha-2 codes are two-letter country codes defined in ISO 3166-1,
//part of the ISO 3166 standard[1] published by the International Organization
//for Standardization (ISO), to represent countries, dependent territories, and
//special areas of geographical interest.

//«

const COUNTRY_CODES=`AD	Andorra	1974	.ad	
AE	United Arab Emirates	1974	.ae	
AF	Afghanistan	1974	.af	
AG	Antigua and Barbuda	1974	.ag	
AI	Anguilla	1985	.ai	AI previously represented French Afars and Issas
AL	Albania	1974	.al	
AM	Armenia	1992	.am	
AO	Angola	1974	.ao	
AQ	Antarctica	1974	.aq	Covers the territories south of 60° south latitude	Code taken from name in French: Antarctique
AR	Argentina	1974	.ar	
AS	American Samoa	1974	.as	
AT	Austria	1974	.at	
AU	Australia	1974	.au	Includes the Ashmore and Cartier Islands and the Coral Sea Islands
AW	Aruba	1986	.aw	
AX	Aland Islands	2004	.ax	An autonomous county of Finland
AZ	Azerbaijan	1992	.az	
BA	Bosnia and Herzegovina	1992	.ba	
BB	Barbados	1974	.bb	
BD	Bangladesh	1974	.bd	
BE	Belgium	1974	.be	
BF	Burkina Faso	1984	.bf	Name changed from Upper Volta (HV)
BG	Bulgaria	1974	.bg	
BH	Bahrain	1974	.bh	
BI	Burundi	1974	.bi	
BJ	Benin	1977	.bj	Name changed from Dahomey (DY)
BL	Saint Barthelemy	2007	.bl	
BM	Bermuda	1974	.bm	
BN	Brunei Darussalam	1974	.bn	Previous ISO country name: Brunei
BO	Bolivia	1974	.bo	Previous ISO country name: Bolivia
BQ	Bonaire, Sint Eustatius and Saba	2010	.bq	Consists of three Caribbean "special municipalities", which are part of the Netherlands proper: Bonaire, Sint Eustatius, and Saba (the BES Islands)	Previous ISO country name: Bonaire, Saint Eustatius and Saba	BQ previously represented British Antarctic Territory
BR	Brazil	1974	.br	
BS	Bahamas	1974	.bs	
BT	Bhutan	1974	.bt	
BV	Bouvet Island	1974	.bv	Belongs to Norway
BW	Botswana	1974	.bw	
BY	Belarus	1974	.by	Code taken from previous ISO country name: Byelorussian SSR (now assigned ISO 3166-3 code BYAA)	Code assigned as the country was already a UN member since 1945[14]
BZ	Belize	1974	.bz	
CA	Canada	1974	.ca	
CC	Cocos (Keeling) Islands	1974	.cc	Belongs to Australia
CD	Congo, Democratic Republic of the	1997	.cd	Name changed from Zaire (ZR)
CF	Central African Republic	1974	.cf	
CG	Congo	1974	.cg	
CH	Switzerland	1974	.ch	Code taken from name in Latin: Confoederatio Helvetica
CI	Cote d'Ivoire	1974	.ci	ISO country name follows UN designation (common name and previous ISO country name: Ivory Coast)
CK	Cook Islands	1974	.ck	
CL	Chile	1974	.cl	
CM	Cameroon	1974	.cm	Previous ISO country name: Cameroon, United Republic of
CN	China	1974	.cn	
CO	Colombia	1974	.co	
CR	Costa Rica	1974	.cr	
CU	Cuba	1974	.cu	
CV	Cabo Verde	1974	.cv	ISO country name follows UN designation (common name and previous ISO country name: Cape Verde, another previous ISO country name: Cape Verde Islands)
CW	Curacao	2010	.cw	
CX	Christmas Island	1974	.cx	Belongs to Australia
CY	Cyprus	1974	.cy	
CZ	Czechia	1993	.cz	Previous ISO country name: Czech Republic
DE	Germany	1974	.de	Code taken from name in German: Deutschland	Code used for West Germany before 1990 (previous ISO country name: Germany, Federal Republic of)
DJ	Djibouti	1977	.dj	Name changed from French Afars and Issas (AI)
DK	Denmark	1974	.dk	
DM	Dominica	1974	.dm	
DO	Dominican Republic	1974	.do	
DZ	Algeria	1974	.dz	Code taken from name in Arabic الجزائر al-Djazā'ir, Algerian Arabic الدزاير al-Dzāyīr, or Berber ⴷⵣⴰⵢⵔ Dzayer
EC	Ecuador	1974	.ec	
EE	Estonia	1992	.ee	Code taken from name in Estonian: Eesti
EG	Egypt	1974	.eg	
EH	Western Sahara	1974	.eh		Previous ISO country name: Spanish Sahara (code taken from name in Spanish: Sahara español)	.eh ccTLD has not been implemented.[15]
ER	Eritrea	1993	.er	
ES	Spain	1974	.es	Code taken from name in Spanish: España
ET	Ethiopia	1974	.et	
FI	Finland	1974	.fi	
FJ	Fiji	1974	.fj	
FK	Falkland Islands (Malvinas)	1974	.fk	ISO country name follows UN designation due to the Falkland Islands sovereignty dispute (local common name: Falkland Islands)[16]
FM	Micronesia	1986	.fm	Previous ISO country name: Micronesia
FO	Faroe Islands	1974	.fo	Code taken from name in Faroese: Føroyar
FR	France	1974	.fr	Includes Clipperton Island
GA	Gabon	1974	.ga	
GB	United Kingdom of Great Britain and Northern Ireland	1974	.uk		(Also .gb)	Includes Akrotiri and Dhekelia (Sovereign Base Areas)	Code taken from Great Britain (from official name: United Kingdom of Great Britain and Northern Ireland)[17]	Previous ISO country name: United Kingdom	.uk is the primary ccTLD of the United Kingdom instead of .gb (see code UK, which is exceptionally reserved)
GD	Grenada	1974	.gd	
GE	Georgia	1992	.ge	GE previously represented Gilbert and Ellice Islands
GF	French Guiana	1974	.gf	Code taken from name in French: Guyane française
GG	Guernsey	2006	.gg	A British Crown Dependency
GH	Ghana	1974	.gh	
GI	Gibraltar	1974	.gi	
GL	Greenland	1974	.gl	
GM	Gambia	1974	.gm	
GN	Guinea	1974	.gn	
GP	Guadeloupe	1974	.gp	
GQ	Equatorial Guinea	1974	.gq	Code taken from name in French: Guinée équatoriale
GR	Greece	1974	.gr	
GS	South Georgia and the South Sandwich Islands	1993	.gs	
GT	Guatemala	1974	.gt	
GU	Guam	1974	.gu	
GW	Guinea-Bissau	1974	.gw	
GY	Guyana	1974	.gy	
HK	Hong Kong	1974	.hk	Hong Kong is officially a Special Administrative Region of the People's Republic of China since 01 July 1997
HM	Heard Island and McDonald Islands	1974	.hm	Belongs to Australia
HN	Honduras	1974	.hn	
HR	Croatia	1992	.hr	Code taken from name in Croatian: Hrvatska
HT	Haiti	1974	.ht	
HU	Hungary	1974	.hu	
ID	Indonesia	1974	.id	
IE	Ireland	1974	.ie	
IL	Israel	1974	.il	
IM	Isle of Man	2006	.im	A British Crown Dependency
IN	India	1974	.in	
IO	British Indian Ocean Territory	1974	.io	
IQ	Iraq	1974	.iq	
IR	Iran (Islamic Republic of)	1974	.ir	Previous ISO country name: Iran
IS	Iceland	1974	.is	Code taken from name in Icelandic: Ísland
IT	Italy	1974	.it	
JE	Jersey	2006	.je	A British Crown Dependency
JM	Jamaica	1974	.jm	
JO	Jordan	1974	.jo	
JP	Japan	1974	.jp	
KE	Kenya	1974	.ke	
KG	Kyrgyzstan	1992	.kg	
KH	Cambodia	1974	.kh	Code taken from former name: Khmer Republic	Previous ISO country name: Kampuchea, Democratic
KI	Kiribati	1979	.ki	Name changed from Gilbert Islands (GE)
KM	Comoros	1974	.km	Code taken from name in Comorian: Komori	Previous ISO country name: Comoro Islands
KN	Saint Kitts and Nevis	1974	.kn	Previous ISO country name: Saint Kitts-Nevis-Anguilla
KP	Korea (Democratic People's Republic of)	1974	.kp	ISO country name follows UN designation (common name: North Korea)
KR	Korea, Republic of	1974	.kr	ISO country name follows UN designation (common name: South Korea)
KW	Kuwait	1974	.kw	
KY	Cayman Islands	1974	.ky	
KZ	Kazakhstan	1992	.kz	Previous ISO country name: Kazakstan
LA	Lao People's Democratic Republic	1974	.la	ISO country name follows UN designation (common name and previous ISO country name: Laos)
LB	Lebanon	1974	.lb	
LC	Saint Lucia	1974	.lc	
LI	Liechtenstein	1974	.li	
LK	Sri Lanka	1974	.lk	
LR	Liberia	1974	.lr	
LS	Lesotho	1974	.ls	
LT	Lithuania	1992	.lt	
LU	Luxembourg	1974	.lu	
LV	Latvia	1992	.lv	
LY	Libya	1974	.ly	Previous ISO country name: Libyan Arab Jamahiriya
MA	Morocco	1974	.ma	Code taken from name in French: Maroc
MC	Monaco	1974	.mc	
MD	Moldova, Republic of	1992	.md	Previous ISO country name: Moldova (briefly from 2008 to 2009)
ME	Montenegro	2006	.me	
MF	Saint Martin (French part)	2007	.mf	The Dutch part of Saint Martin island is assigned code SX
MG	Madagascar	1974	.mg	
MH	Marshall Islands	1986	.mh	
MK	North Macedonia	1993	.mk	Code taken from name in Macedonian: Severna Makedonija	Previous ISO country name: Macedonia, the former Yugoslav Republic of (designated as such due to Macedonia naming dispute)
ML	Mali	1974	.ml	
MM	Myanmar	1989	.mm	Name changed from Burma (BU)
MN	Mongolia	1974	.mn	
MO	Macao	1974	.mo	Previous ISO country name: Macau; Macao is officially a Special Administrative Region of the People's Republic of China since 20 December 1999
MP	Northern Mariana Islands	1986	.mp	
MQ	Martinique	1974	.mq	
MR	Mauritania	1974	.mr	
MS	Montserrat	1974	.ms	
MT	Malta	1974	.mt	
MU	Mauritius	1974	.mu	
MV	Maldives	1974	.mv	
MW	Malawi	1974	.mw	
MX	Mexico	1974	.mx	
MY	Malaysia	1974	.my	
MZ	Mozambique	1974	.mz	
NA	Namibia	1974	.na	
NC	New Caledonia	1974	.nc	
NE	Niger	1974	.ne	
NF	Norfolk Island	1974	.nf	Belongs to Australia
NG	Nigeria	1974	.ng	
NI	Nicaragua	1974	.ni	
NL	Netherlands	1974	.nl	Officially includes the islands Bonaire, Saint Eustatius and Saba, which also have code BQ in ISO 3166-1. Within ISO 3166-2, Aruba (AW), Curaçao (CW), and Sint Maarten (SX) are also coded as subdivisions of NL.[18]
NO	Norway	1974	.no	
NP	Nepal	1974	.np	
NR	Nauru	1974	.nr	
NU	Niue	1974	.nu	Previous ISO country name: Niue Island
NZ	New Zealand	1974	.nz	
OM	Oman	1974	.om	
PA	Panama	1974	.pa	
PE	Peru	1974	.pe	
PF	French Polynesia	1974	.pf	Code taken from name in French: Polynésie française
PG	Papua New Guinea	1974	.pg	
PH	Philippines	1974	.ph	
PK	Pakistan	1974	.pk	
PL	Poland	1974	.pl	
PM	Saint Pierre and Miquelon	1974	.pm	
PN	Pitcairn	1974	.pn	Previous ISO country name: Pitcairn Islands
PR	Puerto Rico	1974	.pr	
PS	Palestine, State of	1999	.ps	Previous ISO country name: Palestinian Territory, Occupied	Consists of the West Bank and the Gaza Strip
PT	Portugal	1974	.pt	
PW	Palau	1986	.pw	
PY	Paraguay	1974	.py	
QA	Qatar	1974	.qa	
RE	Reunion	1974	.re	
RO	Romania	1974	.ro	
RS	Serbia	2006	.rs	Republic of Serbia
RU	Russian Federation	1992	.ru	ISO country name follows UN designation (common name: Russia)
RW	Rwanda	1974	.rw	
SA	Saudi Arabia	1974	.sa	
SB	Solomon Islands	1974	.sb	Code taken from former name: British Solomon Islands
SC	Seychelles	1974	.sc	
SD	Sudan	1974	.sd	
SE	Sweden	1974	.se	
SG	Singapore	1974	.sg	
SH	Saint Helena, Ascension and Tristan da Cunha	1974	.sh	Previous ISO country name: Saint Helena.
SI	Slovenia	1992	.si	
SJ	Svalbard and Jan Mayen	1974	.sj	Previous ISO name: Svalbard and Jan Mayen Islands	Consists of two Arctic territories of Norway: Svalbard and Jan Mayen
SK	Slovakia	1993	.sk	SK previously represented the Kingdom of Sikkim
SL	Sierra Leone	1974	.sl	
SM	San Marino	1974	.sm	
SN	Senegal	1974	.sn	
SO	Somalia	1974	.so	
SR	Suriname	1974	.sr	Previous ISO country name: Surinam
SS	South Sudan	2011	.ss	
ST	Sao Tome and Principe	1974	.st	
SV	El Salvador	1974	.sv	
SX	Sint Maarten (Dutch part)	2010	.sx	The French part of Saint Martin island is assigned code MF
SY	Syrian Arab Republic	1974	.sy	ISO country name follows UN designation (common name and previous ISO country name: Syria)
SZ	Eswatini	1974	.sz	Previous ISO country name: Swaziland
TC	Turks and Caicos Islands	1974	.tc	
TD	Chad	1974	.td	Code taken from name in French: Tchad
TF	French Southern Territories	1979	.tf	Covers the French Southern and Antarctic Lands except Adélie Land	Code taken from name in French: Terres australes françaises
TG	Togo	1974	.tg	
TH	Thailand	1974	.th	
TJ	Tajikistan	1992	.tj	
TK	Tokelau	1974	.tk	Previous ISO country name: Tokelau Islands
TL	Timor-Leste	2002	.tl	Name changed from East Timor (TP)
TM	Turkmenistan	1992	.tm	
TN	Tunisia	1974	.tn	
TO	Tonga	1974	.to	
TR	Turkey	1974	.tr	Actual name: Turkiye
TT	Trinidad and Tobago	1974	.tt	
TV	Tuvalu	1977	.tv	
TW	Taiwan, Province of China	1974	.tw	Covers the current jurisdiction of the Republic of China	ISO country name follows UN designation (due to political status of Taiwan within the UN)[17] (common name: Taiwan)
TZ	Tanzania	1974	.tz	
UA	Ukraine	1974	.ua	Previous ISO country name: Ukrainian SSR	Code assigned as the country was already a UN member since 1945[14]
UG	Uganda	1974	.ug	
UM	United States Minor Outlying Islands	1986	.um	Consists of nine minor insular areas of the United States: Baker Island, Howland Island, Jarvis Island, Johnston Atoll, Kingman Reef, Midway Islands, Navassa Island, Palmyra Atoll, and Wake Island	.um ccTLD was revoked in 2007[19]	The United States Department of State uses the following user assigned alpha-2 codes for the nine territories, respectively, XB, XH, XQ, XU, XM, QM, XV, XL, and QW.[20]
US	United States of America	1974	.us	Previous ISO country name: United States
UY	Uruguay	1974	.uy	
UZ	Uzbekistan	1992	.uz	
VA	Vatican City	1974	.va	Actual name: Holy See	Covers Vatican City, territory of the Holy See	Previous ISO country names: Vatican City State (Holy See) and Holy See (Vatican City State)
VC	Saint Vincent and the Grenadines	1974	.vc	
VE	Venezuela (Bolivarian Republic of)	1974	.ve	Previous ISO country name: Venezuela
VG	Virgin Islands (British)	1974	.vg	
VI	Virgin Islands (US)	1974	.vi	
VN	Vietnam	1974	.vn	ISO country name follows UN designation (common name: Vietnam)	Code used for Republic of Viet Nam (common name: South Vietnam) before 1977
VU	Vanuatu	1980	.vu	Name changed from New Hebrides (NH)
WF	Wallis and Futuna	1974	.wf	Previous ISO country name: Wallis and Futuna Islands
WS	Samoa	1974	.ws	Code taken from former name: Western Samoa
YE	Yemen	1974	.ye	Previous ISO country name: Yemen, Republic of (for three years after the unification)	Code used for North Yemen before 1990
YT	Mayotte	1993	.yt	
ZA	South Africa	1974	.za	Code taken from name in Dutch: Zuid-Afrika
ZM	Zambia	1974	.zm	
ZW	Zimbabwe	1980	.zw	Name changed from Southern Rhodesia (RH)`;
//»

localStorage["data-country_codes"] = COUNTRY_CODES;

cbok();

},//»
CCS:async()=>{//«

let ALL = localStorage["data-country_codes"];
if (!ALL) return cberr("localStorage['data-country_codes'] has not been set!");

if (!args.length) return cberr("Got nothing!");

//log(ALL.length);
let countries={};
let all = ALL.split("\n");
for (let ln of all){

let arr = ln.split("\t");
let code = arr.shift();
let name = arr.shift();
let yr = arr.shift();
let tld = arr.shift();
let notes = arr.join("\n");
countries[name]={
	code:code,
	year: yr,
	tld: tld,
	notes: notes
};

}
let matches=[];
for (let k in countries){
	if ((new RegExp(args.join(" "),"i")).test(k)) matches.push(countries[k].code, k);
}
if (matches.length===2) {
	wout(matches[0]);
	werr(matches[1]);
}
else{
	werr(`${matches.length/2} matches`);
	for (let i=0; i < matches.length; i+=2) werr(`${matches[i]}: ${matches[i+1]}`);
}

cbok();

},//»

*/
