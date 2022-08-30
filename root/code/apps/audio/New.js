//Holding the space bar turns the gain on

export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//Var«

if (!globals.audio) Core.api.mkAudio();
const {mixer, ctx}=globals.audio;
const LINEOUT = ctx.createGain();
const OUTGAIN = LINEOUT.gain;
OUTGAIN.value=0;
const PLUG = mixer.plug_in(LINEOUT);

const BARF=s=>{
throw new Error(s);
};

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

const midi_to_note=(midi)=>{
	let freq = MIDINOTES[midi*100];
	for (let k in NOTEMAP){
		if (k.match(/^[CF]b/)||k.match(/^[EB]#/)) continue;
		if (NOTEMAP[k]==freq) {
			return k;
		}
	}
};


const midi_cents_to_freq=(val)=>{//«
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
/*
const make_rand_curve=()=>{//«
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
};//»
*/
const osc=(freq, gain, mod_freq)=>{//«

	if (!gain) gain=1;
//	let if_odd=true;
	let if_odd=false;
	let n_harms = 7;
   
	let o = ctx.createOscillator();
	o.frequency.value = freq;
//	if (if_curve) o.detune.setValueCurveAtTime(make_rand_curve(), ctx.currentTime, 1000);
//  else: More efficient that hard wiring a curve. With enough oscillators, this will
//  not perceptibly repeat
	let mod = ctx.createOscillator();
	mod.frequency.value = mod_freq;
	mod.start();
	let modg = ctx.createGain();
	modg.gain.value = 10;
	mod.connect(modg);
	modg.connect(o.detune);
	let reals=[0,1];
	let imags=[0,0];
//	let usemult
	for (let i=2; i <= n_harms; i++){
		let mult = 1/(i-1);
//		let mult = 1;
		if (if_odd) reals[i] = (i%2)*mult;
		else reals[i] = 1*mult;
		imags[i]=0;
	}
//log(reals);
	let real = new Float32Array(reals);
	let imag = new Float32Array(imags);

	let wave = ctx.createPeriodicWave(real, imag, {disableNormalization: false});
	o.setPeriodicWave(wave);
	o.start();
	let g = ctx.createGain();
	g.gain.value = gain;
	o.connect(g);
	return g;
//	return o;

};//»


const init=()=>{//«

log(MIDINOTES);
log(NOTEMAP);
//log(note_to_midi("C3"));
//log(midi_cents_to_freq(127.99));

let g0 = osc(midi_cents_to_freq(57.75), 0.16, 1/11);
let g1 = osc(midi_cents_to_freq(57.88), 0.2, 1/17);
let g2 = osc(midi_cents_to_freq(58.0), 0.25, 1/23);
let g3 = osc(midi_cents_to_freq(58.13), 0.2, 1/19);
let g4 = osc(midi_cents_to_freq(58.25), 0.16, 1/13);
conp([g0, g1, g2, g3, g4], LINEOUT);

//conp([g2,g3], LINEOUT);
//conp([g1], LINEOUT);
//log(o1);
//o1.connect(LINEOUT);
//log(rands1);
//log(rands2);

log(midi_to_note(60));

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

