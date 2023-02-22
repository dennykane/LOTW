
/*«

ioctl op=="set-pad"

The arg needs to be something like:
"<padnum>::<somefunction>::func:args:go:here"

Want to be able to change out filter setups or do some kind of automated 
"setknob" thing. In other words, we want to be able to pass along other
"ioctl" type functions when we hit a Pad. Any error message can just be 
logged to console.


"2::ioctl::setknob:<knobnum>:<nodename>:<funcname>:<funcargs>:<inrange>:<outrange>"

"1::setwave::/path/to/file"

Also, want to keep physical knob states so we can automatically sync 
the new functions to the current settings without needing to fiddle with 
them.



Here we can get a new Synth service that we can 

1) Write into via

/serv/<serviceid>/input_handler


2) Read from via

/serv/<serviceid>/output_handler

Now with the "service" command, we can get an id returned which is the handle 
for calling the given service object's input and output handlers via the 
/serv filesystem. We can also request a service sym to be attached to 
this id (whether we fail if we can't fulfill this request is another matter).

service --name=farrhoo up Synth
service -n farrhoo -- up Synth

service down 

»*/

export const mod = function(Core){

//Imports«
const{log,cwarn,cerr,globals,NS}=Core;
const{util,fs}=globals;
const{fs:fsapi}=NS.api;
//let _;
//_=Core;
//let log = _.log;
//let cwarn = _.cwarn;
//let cerr = _.cerr;
//let globals = _.globals;
//let util = globals.util;
//_ = util;
const{
isnotneg,
isid,
isarr,
isobj,
isnum,
isnull,
isint,
ispos,
isneg,
make,
isstr,
strnum
}=util;
//let isstr = _.isstr;
//let strnum = _.strnum;
//let fs = globals.fs;
const services = globals.services._;

const iseof = Core.api.isEOF;
//»
//VAR«
if (!globals.audio) Core.api.mkAudio();

const audio = globals.audio;

const audio_ctx = audio.ctx;
const mixer = audio.mixer;

let NOISE_BUF_SECS = 2;
let samp_rate = audio_ctx.sampleRate;
let noise_buf_sz = samp_rate*NOISE_BUF_SECS;
let white_noise_buf=null;
let pink_noise_buf=null;
let brown_noise_buf=null;

globals.aumod = this;

//»

//Funcs«
var donothing = function(){}

function ReverbGen() {//«

var audioContext = audio_ctx;

function _ReverbGen() {//«
    var getAllChannelData = function(buffer) {//«
      var channels = [];
      for (var i = 0; i < buffer.numberOfChannels; i++) {
        channels[i] = buffer.getChannelData(i);
      }
      return channels;
    };//»
    var randomSample = function() {//«
      return Math.random() * 2 - 1;
    };//»
    var reverbGen = {};
    reverbGen.generateReverb = function(params, callback) {//«
      var sampleRate = audioContext.sampleRate;
      var numChannels = params.numChannels || 2;
      var totalTime = params.decayTime * 1.5;
      var decaySampleFrames = Math.round(params.decayTime * sampleRate);
      var numSampleFrames = Math.round(totalTime * sampleRate);
      var fadeInSampleFrames = Math.round((params.fadeInTime || 0) * sampleRate);
      // 60dB is a factor of 1 million in power, or 1000 in amplitude.
      var decayBase = Math.pow(1 / 1000, 1 / decaySampleFrames);
      var reverbIR = audioContext.createBuffer(numChannels, numSampleFrames, sampleRate);
      for (var i = 0; i < numChannels; i++) {
        var chan = reverbIR.getChannelData(i);
        for (var j = 0; j < numSampleFrames; j++) {
          chan[j] = randomSample() * Math.pow(decayBase, j);
        }
        for (var j = 0; j < fadeInSampleFrames; j++) {
          chan[j] *= (j / fadeInSampleFrames);
        }
      }

      applyGradualLowpass(reverbIR, params.lpFreqStart || 0, params.lpFreqEnd || 0, params.decayTime, callback);
    };//»
    var applyGradualLowpass = function(input, lpFreqStart, lpFreqEnd, lpFreqEndAt, callback) {//«
//Applies a constantly changing lowpass filter to the given sound.
//        @private
//        @param {!AudioBuffer} input
//        @param {number} lpFreqStart
//        @param {number} lpFreqEnd
//        @param {number} lpFreqEndAt
//        @param {!function(!AudioBuffer)} callback May be called immediately within the current execution context, or later.
      if (lpFreqStart == 0) {
        callback(input);
        return;
      }
      var channelData = getAllChannelData(input);
      var context = new OfflineAudioContext(input.numberOfChannels, channelData[0].length, input.sampleRate);
      var player = context.createBufferSource();
      player.buffer = input;
      var filter = context.createBiquadFilter();

      lpFreqStart = Math.min(lpFreqStart, input.sampleRate / 2);
      lpFreqEnd = Math.min(lpFreqEnd, input.sampleRate / 2);

      filter.type = "lowpass";
      filter.Q.value = 0.0001;
      filter.frequency.setValueAtTime(lpFreqStart, 0);
      filter.frequency.linearRampToValueAtTime(lpFreqEnd, lpFreqEndAt);

      player.connect(filter);
      filter.connect(context.destination);
      player.start();
      context.oncomplete = function(event) {
        callback(event.renderedBuffer);
      };
      context.startRendering();
    };//»
    return reverbGen;
}//»
//Var«
var reverbGen;
var reverbIR;
var reverbFilename;
//var audioContext;
var masterGain;
var convolver;
var dryGain;
var wetGain;
//»
function makeAudioContext() {//«
	masterGain = audioContext.createGain();
	masterGain.gain.value = 0.5;
	convolver = audioContext.createConvolver();  
	dryGain = audioContext.createGain();
	wetGain = audioContext.createGain();
	masterGain.connect(dryGain);
	masterGain.connect(convolver);
	convolver.connect(wetGain);
	dryGain.connect(audioContext.destination);
	wetGain.connect(audioContext.destination);
	changeDemoMix();
}//»
this.get_reverb=(params, cb)=>{//«

  reverbGen.generateReverb(params, function(result) {
   cb(result);
  });
}//»
reverbGen = _ReverbGen();

}//»

function get_audio_stream(cb){//«
	navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(function(stream) {
		cb(stream);
//        cb(audio_ctx.createMediaStreamSource(stream));
//        mic_track = stream.getTracks()[0];
	})
//	.catch(err=>{
//		cb(null,err.message)
//	});
}
this.get_audio_stream=get_audio_stream;
//»

function get_audio_ctx() {//«
	return audio_ctx;
//	if (!audio_ctx) {
//		audio_ctx = new AudioContext();
//		samp_rate = audio_ctx.sampleRate;
//		noise_buf_sz = samp_rate * NOISE_BUF_SECS;
//	}
//	return audio_ctx;
}
this.get_audio_ctx = get_audio_ctx;
//»

function make_noise(which) {//«
	if (!audio_ctx) get_audio_ctx();
	var ctx = audio_ctx;
	if (which == "white") {
		if (white_noise_buf) return white_noise_buf;
//log(nose_b);
		white_noise_buf = ctx.createBuffer(1, noise_buf_sz, samp_rate);
		let outbuf = white_noise_buf.getChannelData(0);
		for (let i=0; i < noise_buf_sz; i++) outbuf[i] = Math.random() * 2- 1;
		return white_noise_buf;
	}
	else if (which=="pink") {
		if (pink_noise_buf) return pink_noise_buf;
 		let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
		pink_noise_buf = ctx.createBuffer(1, noise_buf_sz, samp_rate);
		let outbuf = pink_noise_buf.getChannelData(0);
        for (let i = 0; i < noise_buf_sz; i++) {
            let rand = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + rand * 0.0555179;
            b1 = 0.99332 * b1 + rand * 0.0750759;
            b2 = 0.96900 * b2 + rand * 0.1538520;
            b3 = 0.86650 * b3 + rand * 0.3104856;
            b4 = 0.55000 * b4 + rand * 0.5329522;
            b5 = -0.7616 * b5 - rand * 0.0168980;
            outbuf[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + rand * 0.5362;
            outbuf[i] *= 0.11;
            b6 = rand * 0.115926;
        }
		return pink_noise_buf;
	}
	else if (which=="brown") {
		if (brown_noise_buf) return brown_noise_buf;
 		let last=0;
		brown_noise_buf = ctx.createBuffer(1, noise_buf_sz, samp_rate);
		let outbuf = brown_noise_buf.getChannelData(0);
        for (let i = 0; i < noise_buf_sz; i++) {
            let rand = Math.random() * 2 - 1;
            outbuf[i] = (last + (0.02 * rand)) / 1.02;
            last = outbuf[i];
            outbuf[i] *= 3.5; // (roughly) compensate for gain
        }
		return brown_noise_buf;
	}
	return null;
}
this.make_noise = make_noise;
//»

function get_wavetable(srcnode, fftsize) {//«

//Return a function that gets the array object
	
	var ctx = get_audio_ctx();

		function spectrum_to_parts(dat) {//«

			var use_freq = 0.5*ctx.sampleRate / dat.length;
			var freq_step = use_freq;

			var real_arr = [];
			var imag_arr = [];
			imag_arr[0]=0;
			real_arr[0]=0;

			var rand = Math.random;
			var sin = Math.sin;
			var cos = Math.cos;
			var pow = Math.pow;
			var PI_OVER_2 = Math.PI/2;
			var dolen = dat.length-1;
			for (let i=0; i < dolen; i++) {
				let amp = pow(10, dat[i]/20);
				let rand_theta = PI_OVER_2 * rand();
				let usei = i+1;
				real_arr[usei] = amp * cos(rand_theta);
				imag_arr[usei] = amp * sin(rand_theta);
			}
			return [real_arr, imag_arr];
		}//»

	var analyser = ctx.createAnalyser();
	if (fftsize) analyser.fftSize = fftsize;
	srcnode.connect(analyser);

	return function(){
			var arr = new Float32Array(analyser.frequencyBinCount)
			analyser.getFloatFrequencyData(arr);
			srcnode.disconnect(analyser);
			return spectrum_to_parts(arr);
	}

}
this.get_wavetable = get_wavetable; 
//»

function note_to_freq(note) {//«
var noteToScaleIndex = {//«
	'cb': -1,
	'c': 0,
	'c#': 1,
	'db': 1,
	'd': 2,
	'd#': 3,
	'eb': 3,
	'e': 4,
	'e#': 5,
	'fb': 4,
	'f': 5,
	'f#': 6,
	'gb': 6,
	'g': 7,
	'g#': 8,
	'ab': 8,
	'a': 9,
	'a#': 10,
	'bb': 10,
	'b': 11,
	'b#': 12
};//»
	var marr = note.match(/^([a-g]{1}(?:b|#)?)(-?[0-9]+)/i);
	if (!(marr && marr[1] && marr[2])) return null;
	var ind = noteToScaleIndex[marr[1].toLowerCase()];
	var noteNumber = ind + (parseInt(marr[2]) + 1) * 12;
	return (440 * Math.pow(2, (noteNumber - 69)/12));
}
//»

//»

}
