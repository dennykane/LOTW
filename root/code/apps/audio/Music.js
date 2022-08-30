/*Knobs«


Want a toggler that sets knobs in reset/rezero mode, so that we can visually/quickly
set the knobs to roughly the middle level of 63/64. The actual physical number does not 
matter because once we go back to live knob mode, the last number registered is taken 
to be the zero level. We can also have the zero level be physical knob zero (which only
allows positive changes) or physical knob 127 (which only allows negative changes).


»*/
/*Music Theory«

A "step" is a semitone of the western 12 step per octave system.


It is only at THIS level of abstraction (Scale+Degree) that all the complexity
related to chord quality comes into play. This is pure relativity (spatial). In
other words, this is the only level in which logic comes into play. 

At the level of keyname+octave, there is simply math, ie QM (spectral frequencies).

		 1-8 2-7 3-6 4-5 5-4 6-3 7-2 8-1
	Deg	 Ton SpT Med SbD Dom SbM Lea Ton
Scale
Maj 	  |	2 |	2 |	1 |	2 |	2 |	2 |	1 |
Nat	 	  |	2 |	1 |	2 |	2 |	1 |	2 |	2 |
Har 	  |	2 |	1 |	2 |	2 |	1 |	3 |	1 |


Unused
Mel	Asc	  |	2 |	1 |	2 |	2 |	2 |	2 |	1 |
	Des	  |	2 |	2 |	1 |	2 |	2 |	1 |	2 |

Issues: P5 (7 steps away) from Lea Maj/Har does not land on a note of the scale.


Instrument theory:

All instruments can be used to create music, but not all instruments are
*musical*, in themselves.  To be intrinsically *musical* there needs to be a
capacity to sound several notes at once (piano, guitar).


To create all physical chords (triads/5ths, quarts/7ths, quints/9ths, sexts/11ths, septs/13ths):

num_scales 	* 	num_degrees * 	num_semitones 	* num_octaves 	* how_many_chords
	3 		*		7		*		12			*		4		*		5			= 	5040

Inversions are just a matter of dividing the frequencies of the higher notes in half


»*/



export const app = function(arg) {//«

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//DOM«
const statbar = Win.status_bar;
//»

//Var«

//WebAudio«
if (!globals.audio) Core.api.mkAudio();
const {mixer, ctx}=globals.audio;
const LINEOUT = ctx.createGain();
const OUTGAIN = LINEOUT.gain;
OUTGAIN.value=1;
const PLUG = mixer.plug_in(LINEOUT);
//»


//Gamepad«
let gp_rafId;
let X_AXIS_1="0.000";
let Y_AXIS_1="0.000";
let X_AXIS_2="0.000";
let Y_AXIS_2="0.000";
//»


const MIDINOTES=(()=>{//«
//const noteToFreq=note=>{
//    let a = 440; //frequency of A (common value is 440Hz)
//    return (a / 32) * (2 ** ((note - 9) / 12));
//}
	let arr = [];
	for (let i=0; i < 128; i++) arr[i]=13.75*(2**((i-9)/12));
	return arr;
})();//»
const NOTE_TO_MIDI={};
const NOTEMAP=(()=>{//«
	let notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	let obj = {};
	let iter=0;
	OUTERLOOP: for (let j=-1; j <= 9; j++){
		for (let i=0; i < notes.length; i++){
			if (iter>127) break OUTERLOOP;
			let n = notes[i];
			let s = `${n}${j}`;
			let v = MIDINOTES[iter];
			obj[s] = v;
			NOTE_TO_MIDI[s]=iter;
			if (n=="C#") {
				obj[`Db${j}`]=v;
				NOTE_TO_MIDI[`Db${j}`]=iter;
			}
			else if (n=="D#") {
				obj[`Eb${j}`]=v;
				NOTE_TO_MIDI[`Eb${j}`]=iter;
			}
			else if (n=="F#") {
				obj[`Gb${j}`]=v;
				NOTE_TO_MIDI[`Gb${j}`]=iter;
			}
			else if (n=="G#") {
				obj[`Ab${j}`]=v;
				NOTE_TO_MIDI[`Ab${j}`]=iter;
			}
			else if (n=="A#") {
				obj[`Bb${j}`]=v;
				NOTE_TO_MIDI[`Bb${j}`]=iter;
			}
			else if (n=="E") {
				obj[`Fb${j}`] = v;
				NOTE_TO_MIDI[`Fb${j}`]=iter;
			}
			else if (n=="F") {
				obj[`E#${j}`] = v;
				NOTE_TO_MIDI[`E#${j}`]=iter;
			}
			else if (n=="C") {
				obj[`B#${j}`] = MIDINOTES[iter+12];
				NOTE_TO_MIDI[`B#${j}`]=iter+12;
			}
			else if (n=="B") {
				obj[`Cb${j}`] = MIDINOTES[iter-12];
				NOTE_TO_MIDI[`Cb${j}`]=iter-12;
			}
			iter++;
		}
	}
	return obj;
})();//»

/*«
const KEYMAP={//«
"1":"C",
"2":"C#",
"3":"D",
"4":"D#",
"5":"E",
"6":"F",
"7":"F#",
"8":"G",
"9":"G#",
"0":"A",
"-":"A#",
"=":"B"
};//»
const SCALES=["m_S","n_S","h_S","l_S"];
const DEGREEMAP={//«
"1":"Ton",
"2":"SpT",
"3":"Med",
"4":"SbD",
"5":"Dom",
"6":"SbM",
"7":"Lea"
};//»

let keyname="C";
let octave="4";
let scale="Maj";
let degree="Ton";

//				  0		1	  2		3	  4  	5	  6
const DEGREES=[ "Ton","SpT","Med","SbD","Dom","SbM","Lea" ];

const MAJ = [2,2,1,2,2,2,1];
const NAT = [2,1,2,2,1,2,2];
const HAR = [2,1,2,2,1,3,1];
»*/

//»

//Funcs«

const note_to_midi=(which)=>{//«
//note_to_midi("Db-1") -> 1
//note_to_midi("c#-1") -> 1
//note_to_midi("A4") -> 69
//note_to_midi("a4") -> 69
//note_to_midi("gb9") -> 126
//note_to_midi("F#9") -> 126
	let first = which[0].toUpperCase();
	let rest = which.slice(1);
	let freq = NOTEMAP[`${first}${rest}`];
	if (!freq) return;
	return MIDINOTES.indexOf(freq);
};//»

const stat=(s)=>{statbar.innerHTML=s;};
//const statkey=()=>{stat(`${keyname}${octave} ${scale} ${degree}`);};

const vol=val=>{if(OUTGAIN.value===val)return;OUTGAIN.value=val;};
const togglevol=()=>{//«
	if(OUTGAIN.value===1)OUTGAIN.value=0;
	else OUTGAIN.value=1;
};//»
const GN = (val)=>{//«
	let g = ctx.createGain();
	if (Number.isFinite(val)) g.gain.value = val;
	return g;
};//»
//Osc«

const Osc = function(arg){//«
	let o = ctx.createOscillator();
	let g = ctx.createGain();
	g.gain.value=arg.gain;
//	g.gain.setValueAtTime(0.0000001, ctx.currentTime);
	o.frequency.value = 0;
	o.type = arg.type;
	o.connect(g);
	g.connect(LINEOUT);
	o.start();
	this.start=(level)=>{
//		g.gain.linearRampToValueAtTime(level?level:1, ctx.currentTime+1);
//log("START",level);
//		NOTES[note].frequency.setValueAtTime(0, ctx.currentTime);
		o.frequency.setValueAtTime(arg.freq, ctx.currentTime);
//		g.gain.exponentialRampToValueAtTime(level?level:1, ctx.currentTime+0.1);
//		g.gain.setValueAtTime(level?level:1, ctx.currentTime+0.1);
	}
	this.stop=()=>{
		o.frequency.setValueAtTime(0, ctx.currentTime);
//		g.gain.exponentialRampToValueAtTime(0.0000001, ctx.currentTime+0.1);
	};
//	return o;

};//»
const SIN = (freq, gain)=>{return new Osc({type: "sine", freq: freq, gain: gain})};
const TRI = (freq)=>{return new Osc({type: "triangle", freq: freq})};
const SAW = (freq)=>{return new Osc({type: "sawtooth", freq: freq})};
const SQR = (freq)=>{return new Osc({type: "square", freq: freq})};

//»
//Bqf«
const BQF = (type, freq, opts={})=>{//«
/*Filter types«
lowpass	
Standard second-order resonant lowpass filter with 12dB/octave rolloff. Frequencies below the cutoff pass through; frequencies above it are attenuated.	
freq: The cutoff frequency.	
Q: Indicates how peaked the frequency is around the cutoff. The greater the value is, the greater is the peak.	
gain: Not used

highpass
Standard second-order resonant highpass filter with 12dB/octave rolloff. Frequencies below the cutoff are attenuated; frequencies above it pass through
freq: The cutoff frequency.
Q: Indicates how peaked the frequency is around the cutoff. The greater the value, the greater the peak.
gain: Not used

bandpass
Standard second-order bandpass filter. Frequencies outside the given range of frequencies are attenuated; the frequencies inside it pass through.
freq: The center of the range of frequencies.
Q: Controls the width of the frequency band. The greater the Q value, the larger the frequency band.
gain: Not used

lowshelf
Standard second-order lowshelf filer. Frequencies lower than the frequency get a boost, or an attenuation; frequencies over it are unchanged.
freq: The upper limit of the frequencies getting a boost or an attenuation.	
Q: Not used	
gain: The boost, in dB, to be applied; if negative, it will be an attenuation.

highshelf
Standard second-order highshelf filer. Frequencies higher than the frequency get a boost or an attenuation; frequencies lower than it are unchanged.
freq: The lower limit of the frequencies getting a boost or an attenuation.
Q: Not used
gain: The boost, in dB, to be applied; if negative, it will be an attenuation.

peaking
Frequencies inside the range get a boost or an attenuation; frequencies outside it are unchanged.
freq: The middle of the frequency range getting a boost or an attenuation.
Q: Controls the width of the frequency band. The greater the Q value, the larger the frequency band.
gain: The boost, in dB, to be applied; if negative, it will be an attenuation.

notch
Standard notch filter, also called a band-stop or band-rejection filter. It is the opposite of a bandpass filter: frequencies outside the give range of frequencies pass through; frequencies inside it are attenuated.
freq: The center of the range of frequencies.
Q: Controls the width of the frequency band. The greater the Q value, the larger the frequency band.
gain: Not used

allpass
Standard second-order allpass filter. It Lets all frequencies through, but changes the phase-relationship between the various frequencies.
freq: The frequency with the maximal group delay, that is, the frequency where the center of the phase transition occurs.
Q: Controls how sharp the transition is at the medium frequency. The larger this parameter is, the sharper and larger the transition will be.
gain: Not user
»*/
/*
gains are -40 -> 40
Qs are 0.0001 to 1000
*/
	let f = ctx.createBiquadFilter();
	f.frequency.value = freq;
	f.type = type;
	let q = opts.q;
	if (Number.isFinite(q)){
		if (q < 0.0001 || q > 1000){
			throw Error("BQF Q is out of range");
			f.Q.value = q;
		}
	}
	let g = opts.g;
	if (Number.isFinite(g)){
		if (g < -40 || g > 40){
			throw Error("BQF gain is out of range");
			f.gain.value = g;
		}
	}
	return f;
};//»
const LPF = (freq,q) => BQF("lowpass",freq,{q:q});
const HPF = (freq,q) => BQF("highpass",freq,{q:q});
const BPF = (freq,q) => BQF("bandpass",freq,{q:q});
const APF = (freq,q) => BQF("allpass",freq,{q:q});
const NF = (freq,q) => BQF("notch",freq,{q:q});
const LSF = (freq,g) => BQF("lowshelf",freq,{g:g});
const HSF = (freq,g) => BQF("highshelf",freq,{g:g});
const PKF = (freq,g, q) => BQF("peaking",freq,{g:g, q:q});
//»
const con=(node1,node2)=>{node1.connect(node2);};
const cons=(arr)=>{let to=arr.length-1;for(let i=0;i<to;i++)arr[i].connect(arr[i+1]);};
const conp=(arg1,arg2)=>{//«
//log(arg1, arg2);
//log (arg1 instanceof AudioNode)
let arr1;
if (arg1.connect) arr1 = [arg1];
else if (arg1.length) arr1 = arg1;
else throw "Bad arg1";

let arr2;
if (arg2.connect) arr2 = [arg2];
else if (arg2.length) arr2 = arg2;
else throw "Bad arg2";

for (let n1 of arr1){
	for (let n2 of arr2){
//log(n1,n2);
		n1.connect(n2);
	}
}

};//»
const gamepad_loop = ()=>{//«
//log("LOOP");
const gamepad_cb=()=>{//«

let gp  = navigator.getGamepads()[0];
if (gp){

let axes = gp.axes;
let x_axis_1 = axes[0].toFixed(3);
let y_axis_1 = axes[1].toFixed(3);
let x_axis_2 = axes[2].toFixed(3);
let y_axis_2 = axes[3].toFixed(3);

if (x_axis_1 !== X_AXIS_1){
//cwarn("X1", x_axis_1);
}
if (y_axis_1 !== Y_AXIS_1){
//cwarn("Y1", y_axis_1);
}
if (x_axis_2 !== X_AXIS_2){
//cwarn("X2", x_axis_2);
}
if (y_axis_2 !== Y_AXIS_2){
//cwarn("Y2", y_axis_2);
}

X_AXIS_1 = x_axis_1;
Y_AXIS_1 = y_axis_1;
X_AXIS_2 = x_axis_2;
Y_AXIS_2 = y_axis_2;

}

gp_rafId = requestAnimationFrame(gamepad_cb);

};//»

gp_rafId = requestAnimationFrame(gamepad_cb);

};//»



/*
const NOTES = {};
const play_note=(n,if_stop)=>{//«
//log(n, if_stop);
//log()
let note = CHAR_TO_NOTE[n];
if (!note) return;
if (if_stop){
	NOTES[note].frequency.setValueAtTime(0, ctx.currentTime);
//	NOTES[note].stop();
}
else{
	NOTES[note] = SIN(NOTEMAP[note]);
}
//log(NOTEMAP[note]);


};//»
*/

///*

/*
const NOTES = {
	C4: SIN(NOTEMAP["C4"], 0.5),
	E4: SIN(NOTEMAP["E4"], 0.3),
	G4: SIN(NOTEMAP["G4"], 0.15)
};
*/
//for (let)
//const all_notes=[];

const DOWN={};
const NOTES={};
const CHAR_TO_NOTE={//«

//Start 4
	q: "C5",
	"2": "C#5",
	w: "D5",
	"3": "D#5",
	e: "E5",
	r: "F5",
	"5": "F#5",
	t: "G5",
	"6": "G#5",
	y: "A5",
	"7": "A#5",
	u: "B5",
//End 4

//Start 5
	i: "C6",
	"9": "C#6",
	o: "D6",
	"0": "D#6",
	p: "E6",
	"[": "F6",
	"=": "F#6",

	"]": "G6",
	"BACK:": "G#6",
	"\x6c": "A5",

//	a: "A#5",
//	z: "B5",


	a: "F#4",
	z: "G4",
	s: "G#4",
	x: "A4",
	d: "A#4",
	c: "B4",
//End 5

//Start 6
	v: "C5",
	g: "C#5",
	b: "D5",
	h: "D#5",
	n: "E5",
	m: "F5",
	k: "F#5",
	",": "G5",
	l: "G#5",
	".": "A5",
	";": "A#5",
	"/": "B5",
//End 6

};//»
const ALL_NOTES=[//«
//Start 3
 "C3",
 "C#3",
 "D3",
"D#3",

 "E3",
 "F3",
"F#3",
 "G3",
"G#3",
 "A3",
"A#3",
 "B3",
//End 3

//Start 4
 "C4",
 "C#4",
 "D4",
 "D#4",
 "E4",
 "F4",
"F#4",
 "G4",
 "G#4",
 "A4",

 "A#4",
 "B4",
//End 4


//Start 5
 "C5",
 "C#5",
 "D5",
 "D#5",
 "E5",
 "F5",
 "F#5",
 "G5",
 "G#5",
 "A5",
 "A#5",
 "B5",
//End 5

//Start 6
 "C6",
 "C#6",
 "D6",
 "D#6",
 "E6",
 "F6",
 "F#6",
 "G6"
];//»
//const CHAR_TO_NOTE={};


const set_notes=()=>{
	let amp = 1.0;
	let ampmult = 1;
	for (let note of ALL_NOTES){
		//	C4: SIN(NOTEMAP["C4"], 0.5),
		//	E4: SIN(NOTEMAP["E4"], 0.3),
		//	G4: SIN(NOTEMAP["G4"], 0.15)
		NOTES[note] = SIN(NOTEMAP[note], amp);
		amp*=ampmult;
	}
};
const play_note=(n,if_stop)=>{//«
//log(n, if_stop);
//log()
let note = CHAR_TO_NOTE[n];
if (!note) return;
if (if_stop){
NOTES[note].stop();
//NOTES[note].frequency.value = 0;
//NOTES[note].frequency.setValueAtTime(0, ctx.currentTime);
}
else{
NOTES[note].start();

//log(NOTEMAP[note]);
//NOTES[note].frequency.setValueAtTime(NOTEMAP[note], ctx.currentTime);
//value = NOTEMAP[note];
//log(NOTES[note]);
}
//log(NOTEMAP[note]);


};//»
//*/

//»

//OBJ/CB«

this.onappinit=()=>{

//statkey();
set_notes();
log(CHAR_TO_NOTE);
//log(NOTEMAP);
//log(NOTE_TO_MIDI);
//log(MIDINOTES);
//gamepad_loop();

};

this.onkill = function() {//«
	PLUG.disconnect();
	cancelAnimationFrame(gp_rafId);
}//»


this.onkeydown = (e,s)=>{//«

let code = e.code;
let marr;

if (marr=s.match(/^([-=,.;\x2e\x2f\x27\x5b\x5c\x5da-z0-9])_$/)) {
	let which = marr[1];
	if (DOWN[which]) return;
	DOWN[which]=true;
	return play_note(which);
}

/*
if (marr=code.match(/^Numpad(.+)$/)){
	let which = marr[1];
	if (NP_DOWN[which]) return;
	NP_DOWN[which]=true;
//cwarn("NPDN",which);
	play_note(which);
	return;
}
*/
/*«
if (marr=s.match(/^([-=0-9])_$/)){
	keyname = KEYMAP[marr[1]];
	statkey();
	return;
}

if (marr=s.match(/^([0-9])_S$/)){
	octave = marr[1];
	statkey();
	return;
}
if (marr=s.match(/^([1-7])_CS$/)){
	degree = DEGREEMAP[marr[1]];
	statkey();
	return;
}

if (SCALES.includes(s)){
	if (s=="m_S") scale="Maj";
	else if (s=="n_S") scale="Nat";
	else if (s=="h_S") scale="Harm";
	else if (s=="l_S") scale="Mel";
	statkey();
	return;
}»*/

if (s=="SPACE_") togglevol();
	

}//»
this.onkeyup=(e,s)=>{//«
let code = e.code;
let marr;

if (marr=s.match(/^([-=,.;\x2e\x2f\x27\x5b\x5c\x5da-z0-9])_$/)) {
//if (marr=s.match(/^([,;\x2e\x2f\x27\x5b\x5da-z0-9])_$/)) {
	let which = marr[1];
	delete DOWN[which];
	return play_note(which, true);
}

/*
if (marr=code.match(/^Numpad(.+)$/)){
let which = marr[1];
//cwarn("NPUP",which);
delete NP_DOWN[which];
play_note(which, true);
return;
}
*/
//	if (e.code=="Space"){
//		vol(0);
//	}
};//»
this.onkeypress=e=>{//«
};//»
this.onresize = function() {//«
}//»
this.onfocus=()=>{//«
}//»
this.onblur=()=>{//«
}//»
this.onmidi=e=>{
log(e);
};

//»


}//»





















/*«

const MIDINOTES2=(()=>{//«
//const noteToFreq=note=>{
//    let a = 440; //frequency of A (common value is 440Hz)
//    return (a / 32) * (2 ** ((note - 9) / 12));
//}
	let arr = [];
	for (let i=0; i < 128; i++) arr[i]=13.75*(2**((i-9)/16));
	return arr;
})();//»
const midicents=(()=>{//«
	let arr = [];
	for (let i=0; i < 12800; i++) arr[i]=(1375*(2**((i-900)/1200)))/100;
	return arr;
})();//»

const start=()=>{//«

	let o1 = SIN(NOTEMAP["C4"]);//261
	let o2 = SIN(NOTEMAP["E4"]);//329
	let o3 = SIN(NOTEMAP["G4"]);//392
	let o4 = SIN(NOTEMAP["B4"]);//493

//	let f1 = LPF(2000, 1);
	let g = GN(0.25);

	cons([g,LINEOUT]);
//	con(f1,g)
	conp([o1,o2,o3,o4],g);	

}//»

/Theory

(()=>{

const NUM_STEPS_PER_OCTAVE = 12;
const HIGH_FREQ = 880;
const LOW_FREQ = 110;

let n = NUM_STEPS_PER_OCTAVE;
let mult = 1- Math.pow(2, -1/n);

let val = HIGH_FREQ;
let low = LOW_FREQ;
let notes = [HIGH_FREQ];

for (let i=1; val >= low; i++){
	val = val - val*mult;
	notes[i]=val;
}
console.log(notes);

})();


//log(NOTEMAP);

//log(MIDINOTES[0]);
//log(MIDINOTES[1]);
//log(MIDINOTES[2]);
//log(MIDINOTES);
/*
log(MIDICENTS[0]);
log(MIDICENTS[1]);
log(MIDICENTS[2]);
log(MIDICENTS[3]);
log(MIDICENTS[4]);
log(MIDICENTS[5]);
log(MIDICENTS[6]);
log(MIDICENTS[7]);
log(MIDICENTS[8]);
log(MIDICENTS[9]);
log(MIDICENTS[10]);
*/
//for (let i=0; i <= 100; i++) log(MIDICENTS[i]);
//log(MIDINOTES[10]-MIDINOTES[9]);
//log(MIDICENTS[1200]-MIDICENTS[0]);
//log(MIDINOTES[127]);
//log(MIDICENTS[12700]-MI);
//log(MIDICENTS[12600]);
//log(MIDICENTS);
//log(MIDICENTS[100]);
//log(MIDICENTS[200]);
//log(MIDINOTES[0]);
//log(MIDINOTES[1]);
//log("...");
//log(MIDICENTS[0]);
//log(MIDICENTS[100]);

//for (let i=0; i <= 127; i++){
//log(Math.abs(parseFloat((MIDICENTS[i*100]-MIDINOTES[i]).toFixed(5))));
//}

//log(MIDINOTES[127]);
//log(MIDICENTS[12799]);

//log(MIDICENTS.length);

//log((n[7]-n[0])/(n[12]-n[0]));
//log(MIDINOTES2[89]);

//log((n[0]/n[1]));
//log((n[51]/n[52]));
//log((n[21]/n[22]));
//log((n[121]/n[122]));

//log(n2[89]);


//»*/

