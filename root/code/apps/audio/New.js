/*


_TODO_ @WPMHDYET: Want to initialize/cache these kinds of arrays so we don't need to build
them every time we trigger a note!


Initial foray into sound quality (ie, no robotic beeping sounds!)

Now: To make an instrument note, do an ADSR (setValueCurveAtTime) and do a lowpass filter
sweep from high to low (higher harmonics naturally dissipate faster).

Goal: To show the minimum of how to be identifiably "musical" (ie, certain notes
are being played), yet not too identifiably synthesized. In other words, I want
it to be only very discerning ears that can tell this is not a recording of
a "real" instrument or voice.

There are 5 oscillators created with setPeriodicWave(), all at slightly
different frequencies (total range of 1/2 semitone apart), which are all being
detuned at slightly different frequencies. Since these detune frequencies are:
1/1 cycles/sec 1/3 cycles/sec, 1/5 cycles/sec, 1/7 cycles/sec, and 1/11
cycles/sec, it takes 3*5*7*11 (1155) seconds to complete a full
cycle, which is over 19 minutes. The human ear definitely cannot detect any
regularity happening at the rate of once every 19 minutes...

Changing the "modg" gain's value from the current default of 7 (which gives each oscillator 
a 14 cent total detune range) to something wacky like 100 (or more) is interesting. Since
this is a trivially settable parameter...

diditTODO: update the multiplier @AIUMNEJUB:
let mult = 1/(i-1);
... in order to control how the higher harmonics decay.

*/
export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

const status_bar = Win.status_bar;

//»


const NOTES={};

let RANDOMIZE_IMAG_TERM = true;
//let RANDOMIZE_IMAG_TERM = false;

//false = buzzy, true = hollow

let USE_ODD_HARMS = true; 
//let USE_ODD_HARMS = false; 

let NUM_OSC_HARMS = 16;

//let MIDI_CENTER = 60;
let CENTER_NOTE = "C2";
let MIDI_SPREAD = 0.33;//How wide the spectrum (in midi units) around the central freq.
let NUM_OSC = 5;

let OSC_MOD_DEPTH = 10;
let OSC_MOD_FREQ = 10;

let NOTE_DUR = 15;

//Larger means faster fall off
let FREQ_SWEEP_DECAY_FACTOR = 15;

const CHARMAP={
	a:CENTER_NOTE
};

//Var«



//WebAudio«
if (!globals.audio) Core.api.mkAudio();
const {mixer, ctx}=globals.audio;
const LINEOUT = ctx.createGain();
const OUTGAIN = LINEOUT.gain;
//OUTGAIN.value=0;
const PLUG = mixer.plug_in(LINEOUT);
//»

const BARF=s=>{throw new Error(s);};

const PRIMES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

const MIDINOTES=(()=>{//«
    let arr = [];
    for (let i=0; i < 12800; i++) arr[i]=(1375*(2**((i-900)/1200)))/100;
    return arr;
})();//»

//const MIDINOTES=(()=>{//«
//const noteToFreq=note=>{
//    let a = 440; //frequency of A (common value is 440Hz)
//    return (a / 32) * (2 ** ((note - 9) / 12));
//}
//	let arr = [];
//	for (let i=0; i < 128; i++) arr[i]=13.75*(2**((i-9)/12));
//	return arr;
//})();//»
const NOTEMAP=(()=>{//«
	let notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	let obj = {};
	let iter=0;
	OUTERLOOP: for (let j=-1; j <= 9; j++){
		for (let i=0; i < notes.length; i++){
			if (iter>127) break OUTERLOOP;
			let n = notes[i];
			let s = `${n}${j}`;
//			let v = MIDINOTES[iter];
			let v = MIDINOTES[iter*100];
			obj[s] = v;
			if (n=="C#") obj[`Db${j}`]=v;
			else if (n=="D#") obj[`Eb${j}`]=v;
			else if (n=="F#") obj[`Gb${j}`]=v;
			else if (n=="G#") obj[`Ab${j}`]=v;
			else if (n=="A#") obj[`Bb${j}`]=v;
			else if (n=="E") obj[`Fb${j}`] = v;
			else if (n=="F") obj[`E#${j}`] = v;
			else if (n=="C") obj[`B#${j}`] = MIDINOTES[(iter*100)+1200];
			else if (n=="B") obj[`Cb${j}`] = MIDINOTES[(iter*100)-1200];
//			else if (n=="C") obj[`B#${j}`] = MIDINOTES[iter+12];
//			else if (n=="B") obj[`Cb${j}`] = MIDINOTES[iter-12];
			iter++;
		}
	}
	return obj;
})();//»


//const 

const midi_to_note=(midi)=>{//«
	let freq = MIDINOTES[midi*100];
	for (let k in NOTEMAP){
		if (k.match(/^[CF]b/)||k.match(/^[EB]#/)) continue;
		if (NOTEMAP[k]==freq) {
			return k;
		}
	}
};//»

const midi_cents_to_freq=(val)=>{//«
	val = parseFloat(val.toFixed(2));
	let str = val+"";
	let arr = str.split(".");
	if (!arr[1]) arr[1]=0;
	let maj = parseInt(arr[0]);
	let min = parseInt(arr[1]);

	if (!(maj >= 0 && maj <= 127)) return BARF("Invalid 'major' midi value");
	if (!(min >= 0 && min <= 99)) return BARF("Invalid 'minor' midi value");

	let num = Math.floor(val*100);
	return MIDINOTES[num];
};//»
const mctf = midi_cents_to_freq;

//»

//Funcs«

//Status/Volume«
const stat=s=>{
	status_bar.innerHTML=s;
};
const vol=val=>{//«
	if(OUTGAIN.value===val) return;
	OUTGAIN.value=val;
};//»
const statvol=()=>{
	stat(`Volume: ${OUTGAIN.value}`);
};
const toggle_volume=()=>{
	if (OUTGAIN.value==1) OUTGAIN.value = 0;
	else OUTGAIN.value = 1;
	statvol();
};
//»

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
    return (MIDINOTES.indexOf(freq))/100;
};//»
const conp=(arg1,arg2)=>{//«
	let arr1;
	if (arg1.connect) arr1 = [arg1];
	else if (arg1.length) arr1 = arg1;
	else throw "Bad arg1";

	let arr2;
	if (arg2.connect) arr2 = [arg2];
	else if (arg2.length) arr2 = arg2;
	else throw "Bad arg2";

	for (let n1 of arr1){
		for (let n2 of arr2) n1.connect(n2);
	}
};//»


const Note = function(freq, amp, filt, num_secs){//«
	let now = ctx.currentTime;
	this.trigger=()=>{
		filt.frequency.setValueCurveAtTime(filt._freqs, now, num_secs/FREQ_SWEEP_DECAY_FACTOR);
		amp.gain.setValueCurveAtTime([0,1,3/4,2/3,1/2,1/3,1/4,1/5,1/6,1/7,1/8,1/9,1/10,1/11,1/12,1/13], now, num_secs);
		amp.gain.setTargetAtTime(0, now+num_secs, num_secs/2)
	};
	this.stop=()=>{
		amp.gain.cancelScheduledValues(now);
		amp.gain.setTargetAtTime(0, now, 0.1)
		setTimeout(()=>{
			amp.disconnect();
		}, 1000);
	};

};//»


const osc=(midi_cents, gain, mod_freq_arg)=>{//«

/*const make_rand_curve=()=>{//«
	let rands1=[];
	//let rands2=[];
	let nrands=2500;
	let rand_range=50;
	let rand_range_half=rand_range/2;
	for (let i=0; i < nrands; i++){
		rands1.push(Math.floor(rand_range*Math.random()-rand_range_half));
	//	rands2.push(Math.floor(rand_range*Math.random()-rand_range_half));
	}
	return rands1;
};»*/

	if (!gain) gain=1;
	let real, imag;
{
	let use_odd_harms = USE_ODD_HARMS;
	let n_harms = NUM_OSC_HARMS;

	let reals=[0,1];
	let imags=[0,0];
//Higher number means slower drop off
	let mult_exp_denom = 2;
	let mult_exp = 1/mult_exp_denom;
	for (let i=2; i <= n_harms; i++){
//		let mult = 1/(i-1); //AIUMNEJUB
		let mult = Math.pow(1/(i), mult_exp); //AIUMNEJUB
		if (use_odd_harms) reals[i] = (i%2)*mult;
		else reals[i] = 1*mult;
		if (RANDOMIZE_IMAG_TERM) imags[i] = Math.random();
		else imags[i] = 0;
	}
//log(reals);
	real = new Float32Array(reals);
	imag = new Float32Array(imags);
}
   
	let o = ctx.createOscillator();
	o.frequency.value = midi_cents_to_freq(midi_cents);

//	if (if_curve) o.detune.setValueCurveAtTime(make_rand_curve(), ctx.currentTime, 1000);
//  else: More efficient that hard wiring a curve. With enough oscillators being detuned at low
//  enough frequencies, this will not perceptibly repeat

	let mod = ctx.createOscillator();
	mod.frequency.value = mod_freq_arg;
	mod.start();
	let modg = ctx.createGain();

	let modgmod = ctx.createOscillator();
	modgmod.frequency.value = OSC_MOD_FREQ;
	modgmod.start();
	let modgmodg = ctx.createGain();
	modgmodg.gain.value = OSC_MOD_DEPTH;
	modgmod.connect(modgmodg);
	modgmodg.connect(modg.gain);	
//	modg.gain.value = 7;

	mod.connect(modg);
	modg.connect(o.detune);

	let wave = ctx.createPeriodicWave(real, imag, {disableNormalization: false});
	o.setPeriodicWave(wave);
	o.start();
	let g = ctx.createGain();
	g.gain.value = gain;
	o.connect(g);
	return g;
//	return o;

};//»
const multi_osc = (center, num, spread, num_secs)=>{//«

let nodes = [];

//If odd, there is a node with center_freq
let is_odd = false;
let center_gain = 1/num;
if (num%2){
	num--;
	is_odd = true;
}
let num_half = num/2;
let delt = spread/num;
let spread_half = spread/2;
let lo = center - spread_half;
let hi = center + spread_half;
let freqs=[];
let gains=[];

let center_gain_delt = 1/(10*num);
//let center_gain_delt = 0.05;

let iter=0;
//let tot
if (is_odd) gains = [center_gain];
else gains = [];
for (let i=0; i < num_half; i++){
	freqs.push(lo+(iter*delt), hi-(iter*delt));
	iter++;
	let gn = center_gain-(iter*center_gain_delt);
//	gains.unshift(center_gain-(iter*center_gain_delt),center_gain+(iter*center_gain_delt));
	gains.unshift(gn, gn);
}
if (is_odd) {
	freqs.push(center);
}
//cwarn(center_gain, center_gain_delt);
//log("FREQS",freqs);
//log("GAINS",gains);
//log("GAINS TOT",gains.reduce((a, b)=>{return a + b;}, 0));

for (let i=0; i < freqs.length; i++){
	nodes.push(osc(freqs[i], gains[i], PRIMES[i]));
}

const f = ctx.createBiquadFilter();
f.type = "lowpass";

f.Q.value=1;

let startmidi = center;
let endmidi = freq_to_midi_cents(NUM_OSC_HARMS*midi_cents_to_freq(startmidi));
let filter_freqs=[];
for (let i = endmidi; i >= startmidi; i-=0.1){
	filter_freqs.push(midi_cents_to_freq(i));
}
/*WPMHDYET: 
For basic arrays like this, do:
	-Create all of these on app startup and store them somewhere
	-If there is too many "all", then find a place to cache them after creating them
*/
f._freqs = filter_freqs;

conp(nodes, f);

const amp = ctx.createGain();
amp.gain.value = 0;
f.connect(amp)
amp.connect(LINEOUT);

return new Note(center, amp, f, num_secs);

};//»

const freq_to_midi_cents=(freq)=>{//«
	for (let i=0; i < MIDINOTES.length; i++){
		let f = MIDINOTES[i];
		if (f >= freq) return i/100;
	}
};//»
const ftmc = freq_to_midi_cents;

const init=()=>{//«

//multi_osc(MIDI_CENTER, NUM_OSC, MIDI_SPREAD);
//log(NOTEMAP);

//NOTES[CENTER_NOTE] = multi_osc(note_to_midi(CENTER_NOTE), NUM_OSC, MIDI_SPREAD, NOTE_DUR);

//log(MIDINOTES);
//log(MIDINOTES);
//log(NOTEMAP);
//cwarn("Examples");
//log("midi_to_note(58) ->", '"'+midi_to_note(58)+'"');
//log('note_to_midi("Eb2") -> ', note_to_midi("Eb2"));
//log("midi_cents_to_freq(89.379) -> ", midi_cents_to_freq(89.379));
//log("midi_cents_to_freq(89.375) -> ", midi_cents_to_freq(89.375));
//log("midi_cents_to_freq(89.374) -> ", midi_cents_to_freq(89.374));
//log("midi_cents_to_freq(89.370) -> ", midi_cents_to_freq(89.370));
statvol();
}//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = function(e,s) {//«
//log(e);
if (s==="SPACE_") return toggle_volume();

//let marr;

//if (marr = s.match(/^([a-z])_$/)){
//let got = NOTES[CHARMAP[marr[1]]];
//if (got) got.trigger();
//}

if (s=="a_"){
	if (NOTES[CENTER_NOTE]) NOTES[CENTER_NOTE].stop();
	NOTES[CENTER_NOTE] = multi_osc(note_to_midi(CENTER_NOTE), NUM_OSC, MIDI_SPREAD, NOTE_DUR);
	NOTES[CENTER_NOTE].trigger();
}
//if ()

	
}//»
this.onkeyup=(e)=>{//«
//	if (e.code=="Space") vol(0);
};//»

this.onkeypress=e=>{//«
//log(e);
};//»
this.onkill = function() {//«
	PLUG.disconnect();
}//»
this.onresize = function() {//«
}//»
this.onfocus=()=>{//«
}//»

this.onblur=()=>{//«
}//»

//»

}




/*«
//Waveshaper example
//const shaper = ctx.createWaveShaper();
//shaper.curve = getcurve();
//log(shaper.curve);
//conp(nodes, shaper);

//shaper.connect(LINEOUT);
const getcurve=()=>{//«
	let NUM=100;
	let NUM_HALF=50;
//	let USEMULT=-2.5;
	let USEMULT=-2.5;
	let USECLIP=false;
	const CURVE=(x,opts={mult:1, clip:true})=>{
		let num_half_cycles = 1;
		let val = 1-(0.5*(1-Math.cos((num_half_cycles*x*Math.PI/NUM))));
		let flat = (x-NUM_HALF)/NUM_HALF;
		let got = 1+(2*-val);
		let diff = got-flat;
		let isneg = x < NUM_HALF;
		let mdf = opts.mult*diff-flat;
		if (opts.clip) {
			if (isneg) {
				if( mdf < 0) mdf = 0;
			}
			else {
				if (mdf > 0) mdf = 0;
			}
		}

		let rv = 0.5*(mdf)+0.5;
		if (rv > 1 && opts.clip) rv = 1;
		else if (rv < 0 && opts.clip) rv = 0;
		return rv;
	};
    let arr = new Float32Array(NUM+1);
    for (let i=0; i<=NUM; i++){
        let y = CURVE(i,{mult:USEMULT, clip: USECLIP});
        arr[i]=2*(0.5-y);
    };
    return arr;
//log(arr);
}//»
»*/



