/*//«

@HWUEPINGTM: When killing the app, we can put this ArrayBuffer in a memory pool
to reuse it, since it doesn't seem to get freed up... 

let gp = navigator.getGamepads()[0]
let buts = gp.buttons
0 B
1 A
2 Y
3 X
4 Left Top
5 Right Top
6 Left Bot
7 Right Bot
8 Select
9 Start
10 Left Joystick down
11 Right Joystick down

Arrows
12 //UP
13 //DOWN
14 //LEFT
15 //RIGHT

S9xMapButton(SDLK_RIGHT, S9xGetCommandT("Joypad1 Right"), false);		15 39
S9xMapButton(SDLK_LEFT, S9xGetCommandT("Joypad1 Left"), false); 		14 37
S9xMapButton(SDLK_DOWN, S9xGetCommandT("Joypad1 Down"), false);			13 40
S9xMapButton(SDLK_UP, S9xGetCommandT("Joypad1 Up"), false);				12 38
S9xMapButton(SDLK_RETURN, S9xGetCommandT("Joypad1 Start"), false);		9 13
S9xMapButton(SDLK_SPACE,  S9xGetCommandT("Joypad1 Select"), false);		8 32
S9xMapButton(SDLK_d, S9xGetCommandT("Joypad1 A"), false);				1 68
S9xMapButton(SDLK_c, S9xGetCommandT("Joypad1 B"), false);				0 67
S9xMapButton(SDLK_s, S9xGetCommandT("Joypad1 X"), false);				3 83
S9xMapButton(SDLK_x, S9xGetCommandT("Joypad1 Y"), false);				2 88
S9xMapButton(SDLK_a, S9xGetCommandT("Joypad1 L"), false);				4 65
S9xMapButton(SDLK_z, S9xGetCommandT("Joypad1 R"), false);				5 90

//»*/
const APPNAME="SNES";
const MODNAME = "games.SNESEmulator";

export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

//Main.top.title=APPNAME;
const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;


//»

//Var«
let SCREEN_HEIGHT, SCREEN_WIDTH, ASPECT;
const DIMS = {w: 256, h: 224};
let mod;
let canvas = make('canvas');
//let canvas;
let keylistener = ()=>{};
//Main.add(canvas);
let w = Main.clientWidth;
let h = Main.clientHeight;
//_ = main.style;
Main.bgcol="#070707";
Main.dis="flex";
Main.style.alignItems="center";
Main.style.justifyContent="center";
Main.style.flexDirection="column";
Main.tcol="#fff";
Main.innerHTML="<h2>Loading emulator...</h2>";

let bUP,bDOWN,bLEFT,bRIGHT;
let bB, bA, bY, bX;
let bSelect, bStart;
let bLSh, bRSh;

let UP,DOWN,LEFT,RIGHT;
let B ,A, Y, X;
let SELECT, START;
let LSH, RSH;

let gp;

//»

//Funcs«

const stat=s=>{//«
	Win.status_bar.innerHTML = s;
};//»

const stat_memory=()=>{//«
	const MB = 1024*1024;
	let mem = window.performance.memory;
	let lim = mem.jsHeapSizeLimit;
	let used = mem.usedJSHeapSize;
	let per = Math.floor(100*used/lim);

	let limmb = Math.round(lim/MB);
	let usedmb = Math.round(used/MB);
	stat(`Memory: ${usedmb}MB/${limmb}MB  (${per}%)`);
};//»

const resize=()=>{//«
    if (!canvas) return;
    if (h*ASPECT > w) {
        canvas.w = w;
        canvas.h = w/ASPECT;
    }
    else {
        canvas.h = h;
        canvas.w = h*ASPECT;
    }
//canvas.attset("width", canvas.w);
//canvas.attset("height", canvas.h);
//log(canvas);
}//»

const init_canvas=(dims)=>{//«
//    did_init = true;
    Main.innerHTML="";
    SCREEN_WIDTH = dims.w;
    SCREEN_HEIGHT = dims.h;
    ASPECT = SCREEN_WIDTH/SCREEN_HEIGHT;
//    canvas = make("canvas");
    canvas.width=SCREEN_WIDTH;
    canvas.height=SCREEN_HEIGHT;
    canvas.style.margin="auto";
//  canvas.bor="1px solid gray";
    Main.add(canvas);
//    outgain.gain.exponentialRampToValueAtTime(0.75, audio_ctx.currentTime+1);
//setTimeout(()=>{
//  outgain.gain.value = 0.8;
//},100);
}//»

const set_buttons = () => {//«
	let buts = gp.buttons;
	bB = buts[0];
	bA = buts[1];
	bY = buts[2];
	bX = buts[3];
	bLSh = buts[4];
	bRSh = buts[5];
	bSelect = buts[8];
	bStart = buts[9];
	bUP = buts[12];
	bDOWN = buts[13];
	bLEFT = buts[14];
	bRIGHT = buts[15];
};//»

const sendkey = (key, if_down)=>{
	let which = if_down?"keydown":"keyup";
	keylistener({type: which, keyCode: key, preventDefault:()=>{}});
}

const poll_gamepad =()=>{//«
/*
let func = (key, if_down)=>{
	let which = if_down?"keydown":"keyup";
	keylistener({type: which, keyCode: key, preventDefault:()=>{}});
}
*/
gp  = navigator.getGamepads()[0];
if (!gp) return;

set_buttons();

if (bStart.pressed){//«
//13 Enter
	if (!START) {
		sendkey(13,true);
		START=true;
	}
}
else {
	if (START) sendkey(13,false);
	START = false;
}//»
if (bSelect.pressed){//«
//32 Spacebar
	if (!SELECT) {
		sendkey(32,true);
		SELECT=true;
	}
}
else {
	if (SELECT) sendkey(32,false);
	SELECT = false;
}//»
if (bB.pressed){//«
//67 c

	if (!B) {
		sendkey(67,true);
		B=true;
	}
}
else {
	if (B) sendkey(67,false);
	B = false;
}//»
if (bA.pressed){//«
//68 d
	if (!A) {
		sendkey(68,true);
		A=true;
	}
}
else {
	if (A) sendkey(68,false);
	A = false;
}//»
if (bX.pressed){//«
//83 s
	if (!X) {
		sendkey(83,true);
		X=true;
	}
}
else {
	if (X) sendkey(83,false);
	X = false;
}//»
if (bY.pressed){//«
//88 x
	if (!Y) {
		sendkey(88,true);
		Y=true;
	}
}
else {
	if (Y) sendkey(88,false);
	Y = false;
}//»
if (bDOWN.pressed){//«
//40 Down
	if (!DOWN) {
		sendkey(40,true);
		DOWN=true;
	}
}
else {
	if (DOWN) sendkey(40,false);
	DOWN = false;
}//»
if (bUP.pressed){//«
//38 Up
	if (!UP) {
		sendkey(38,true);
		UP=true;
	}
}
else {
	if (UP) sendkey(38,false);
	UP = false;
}//»
if (bLEFT.pressed){//«
//37 Left
	if (!LEFT) {
		sendkey(37,true);
		LEFT=true;
	}
}
else {
	if (LEFT) sendkey(37,false);
	LEFT = false;
}//»
if (bRIGHT.pressed){//«
//39 Right
	if (!RIGHT) {
		sendkey(39,true);
		RIGHT=true;
	}
}
else {
	if (RIGHT) sendkey(39,false);
	RIGHT = false;
}//»
if (bLSh.pressed){//«
//65 a
	if (!LSH) {
		sendkey(65,true);
		LSH=true;
	}
}
else {
	if (LSH) sendkey(65,false);
	LSH = false;
}//»
if (bRSh.pressed){//«
//90 z
	if (!RSH) {
		sendkey(90,true);
		RSH=true;
	}
}
else {
	if (RSH) sendkey(90,false);
	RSH = false;
}//»


}//»

const load=async(bytes)=>{//«

//return new Promise(async(Y,N)=>{
if (!await capi.loadMod(MODNAME)) return cerr(`Could not load module: ${MODNAME}`);
NS.mods[MODNAME](Module, globals.memory);
Module.FS_createDataFile("/", "_.smc", bytes , true, true);

//	Y();
//});

}//»

const start=()=>{//«
	Module._run();
    Module._toggle_display_framerate();
	Module.noExitRuntime = false;
	keylistener = Module._keyListener;
	init_canvas(DIMS);
	w = Main.clientWidth;
	h = Main.clientHeight;
	resize();
//log(Module.noExitRuntime);
/*
setInterval(()=>{
log(Module.noExitRuntime);
Module.noExitRuntime = false;
},1000);
*/
};//»

const init=async(bytes)=>{//«

stat_memory();
load(bytes);

//start();

/*
let iter = 0;
let interval = setInterval(()=>{
	try{
		start();
		clearInterval(interval);
	}
	catch(e){
		iter++;
		if (iter>100){
			clearInterval(interval);
			cerr("GIVING UP!!!");
		}
	}
},100);
*/

//log(Module);
//log(bytes);
};//»

const Module = {//«
	muted: false,
	doNotCaptureKeyboard: true,
	pollGamepad: poll_gamepad,
	preRun: [],
	postRun: start,
	print: (function() {
//		var element = document.getElementById('output');
//		if (element) element.value = ''; // clear browser cache
		return function(text) {
//			text&&log(text);
	/*
			if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
			if (text) console.log(text);
			if (element) {
				element.value += text + "\n";
				element.scrollTop = element.scrollHeight; // focus on bottom
			}
	*/
		};
	})(),
	printErr: function(text) {
		if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
//		if (0) { // XXX disabled for safety typeof dump == 'function') {
//		dump(text + '\n'); // fast, straight to the real console
//		} else {
	//		console.error(text);
//		cerr(text);
//		}
	},
	canvas: (function() {
		//var canvas = document.getElementById('canvas');
		// As a default initial behavior, pop up an alert when webgl context is lost. To make your
		// application robust, you may want to override this behavior before shipping!
		// See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
		canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);
		return canvas;
	})(),
	setStatus: function(text) {//«
	//console.log(text);
/*
	if (text==="Running..."){
		console.warn("OK!");
//start();
		return;
	}
*/
	/*«
	if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
	if (text === Module.setStatus.text) return;
	var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
	var now = Date.now();
	if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
	if (m) {
	text = m[1];
	progressElement.value = parseInt(m[2])*100;
	progressElement.max = parseInt(m[4])*100;
	progressElement.hidden = false;
	//            spinnerElement.hidden = false;
	} else {
	progressElement.value = null;
	progressElement.max = null;
	progressElement.hidden = true;
	}
	»*/
	},//»
	totalDependencies: 0,
	monitorRunDependencies: function(left) {
		this.totalDependencies = Math.max(this.totalDependencies, left);
		Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
	}
};//»



//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{
//resize();
init(bytes);
//log(bytes);
};



this.onkeydown = function(e,s) {//«

if (s=="m_"){
Module.muted = !Module.muted;
}
else if (s=="SPACE_") sendkey(13, true);
else if (s=="ENTER_") sendkey(32, true);
else if (s=="w_") sendkey(38, true);
else if (s=="a_") sendkey(37, true);
else if (s=="s_") sendkey(40, true);
else if (s=="d_") sendkey(39, true);
else if (s==";_") sendkey(83, true);
else if (s=="'_")sendkey(68,true);
else if (s=="._")sendkey(88, true);
else if (s=="/_")sendkey(67,true);

//log(e.type);
//if (s.match(/_$/)) keylistener(e);

}//»

this.onkeyup = function(e,s) {//«

if (s=="SPACE_") sendkey(13, false);
else if (s=="ENTER_")sendkey(32, false);
else if (s=="w_") sendkey(38, false);
else if (s=="a_") sendkey(37, false);
else if (s=="s_") sendkey(40, false);
else if (s=="d_") sendkey(39, false);
else if (s==";_") sendkey(83, false);
else if (s=="'_")sendkey(68,false);
else if (s=="._")sendkey(88, false);
else if (s=="/_")sendkey(67,false);
//log(e.type);
//log(s);
//keylistener(e);
//if (s.match(/_$/)) keylistener(e);

}//»

this.onkeypress=function(e){//«
//log("p",e);

//keylistener(e);

//keylistener(e);

};//»
this.onkill = function() {//«

//HWUEPINGTM
//log("REUSE THIS:",Module._buffer);
cancelAnimationFrame(Module.rafId);
Module.killed = true;

globals.memory.push(Module._buffer);
//log("RAFID",Module.rafId);

try{

Module.exit && Module.exit(1);

}
catch(e){
log(e.message);
}

}//»
this.onresize = function() {//«
    w = Main.clientWidth;
    h = Main.clientHeight;
    resize();
}//»
this.onfocus=()=>{//«
}//»

this.onblur=()=>{//«
}//»

//»


}

