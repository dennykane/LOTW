/*

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

TODO: update the multiplier @AIUMNEJUB:
let mult = 1/(i-1);
... in order to control how the higher harmonics decay.

*/
export const app = function(arg) {

//false = buzzy, true = hollow
//let USE_ODD_HARMS = true; 
let USE_ODD_HARMS = false; 

let CENTER_MIDI = 48;
let NUM_OSC = 5;
let FREQ_SPREAD = 0.5;

let OSC_MOD_DEPTH = 10;
let OSC_MOD_FREQ = 10;


//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//Var«

//WebAudio«
if (!globals.audio) Core.api.mkAudio();
const {mixer, ctx}=globals.audio;
const LINEOUT = ctx.createGain();
const OUTGAIN = LINEOUT.gain;
OUTGAIN.value=0;
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
    return (MIDINOTES.indexOf(freq))/100;
};//»

const vol=val=>{//«
	if(OUTGAIN.value===val) return;
	OUTGAIN.value=val;
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


const osc=(freq, gain, mod_freq_arg)=>{//«

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
	let n_harms = 10;
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
		imags[i] = 0;
	}
//log(reals);
	real = new Float32Array(reals);
	imag = new Float32Array(imags);
}
   
	let o = ctx.createOscillator();
	o.frequency.value = freq;

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


const multi_osc = (center, num, spread)=>{//«

let nodes = [];
/*
let g0 = osc(midi_cents_to_freq(57.75), 0.16, 1/3);
let g1 = osc(midi_cents_to_freq(57.88), 0.2, 1/7);
let g2 = osc(midi_cents_to_freq(58.0), 0.25, 1/11);
let g3 = osc(midi_cents_to_freq(58.13), 0.2, 1/5);
let g4 = osc(midi_cents_to_freq(58.25), 0.16, 1);
conp([g0, g1, g2, g3, g4], LINEOUT);
*/

/*
If odd, there is a node with center_freq
*/
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

cwarn(center_gain, center_gain_delt);
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
log("FREQS",freqs);
log("GAINS",gains);
log("GAINS TOT",gains.reduce((a, b)=>{return a + b;}, 0));

for (let i=0; i < freqs.length; i++){
//let g4 = osc(midi_cents_to_freq(58.25), 0.16, 1);
	nodes.push(osc(midi_cents_to_freq(freqs[i]), gains[i], PRIMES[i]));
}
//log(nodes);
conp(nodes, LINEOUT);
//log(gains);
//log(lo, hi, delt, num_half);

};//»

const init=()=>{//«

multi_osc(CENTER_MIDI, NUM_OSC, FREQ_SPREAD);

//log(MIDINOTES);
//log(NOTEMAP);
//cwarn("Examples");
//log("midi_to_note(58) ->", '"'+midi_to_note(58)+'"');
//log('note_to_midi("Eb2") -> ', note_to_midi("Eb2"));
//log("midi_cents_to_freq(89.379) -> ", midi_cents_to_freq(89.379));
//log("midi_cents_to_freq(89.375) -> ", midi_cents_to_freq(89.375));
//log("midi_cents_to_freq(89.374) -> ", midi_cents_to_freq(89.374));
//log("midi_cents_to_freq(89.370) -> ", midi_cents_to_freq(89.370));

}//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = function(e,s) {//«
	if (s==="SPACE_") vol(1);
}//»
this.onkeyup=(e)=>{//«
	if (e.code=="Space") vol(0);
};//»
this.onkeypress=e=>{//«
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

