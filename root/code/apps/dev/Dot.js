
export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
Main.top.title="Dot";
const{log,cwarn,cerr, globals, Desk}=Core;

const{util}=globals;
const{make,mkdv,mk,mksp}=util;

//»

//Var«

let SCREEN_HEIGHT, SCREEN_WIDTH, ASPECT;

let cx,cy;
let cwid = 6;
let cwid_half = cwid/2;

//»

//DOM«

let canvas, ctx;
let w = Main.clientWidth;
let h = Main.clientHeight;

Main.bgcol="#171717";

let _ = Main.style;
_.display="flex";
_.alignItems="center";
_.justifyContent="center";
_.flexDirection="column";

//»

//Funcs«

const stat=s=>{Main.top.status_bar.innerHTML=s;};
const draw=()=>{//«
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,w,h);
	if (cy < 0) cy=0;
	else if (cy > SCREEN_HEIGHT) cy = SCREEN_HEIGHT;
	if (cx < 0) cx=0;
	else if (cx > SCREEN_WIDTH) cx = SCREEN_WIDTH;
	ctx.fillStyle = 'white';
	ctx.fillRect(cx-cwid_half,cy-cwid_half,cwid,cwid);
};//»
const init=()=>{//«
	SCREEN_WIDTH = w;
	SCREEN_HEIGHT = h;
	ASPECT = SCREEN_WIDTH/SCREEN_HEIGHT;
	canvas = make("canvas"); 
	canvas.width=SCREEN_WIDTH;
	canvas.height=SCREEN_HEIGHT;
	canvas.onclick=e=>{
		cx = e.offsetX;
		cy = e.offsetY;
		draw();
	};
	cx = SCREEN_WIDTH/2;
	cy = SCREEN_HEIGHT/2;
	canvas.style.margin="auto";
	Main.add(canvas);
	ctx = canvas.getContext('2d');
	draw();
}//»
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
	draw();
}//»

//»

//OBJ/CB«

this.onkeydown = function(e,s) {//«
	if (s=="LEFT_") {cx-=cwid;draw();}
	else if (s=="RIGHT_") {cx+=cwid;draw();}
	else if (s=="UP_") {cy-=cwid;draw();}
	else if (s=="DOWN_") {cy+=cwid;draw();}
	else if (s=="o_"){
		cx = SCREEN_WIDTH/2;
		cy = SCREEN_HEIGHT/2;
		draw();
	}
}//»
this.onkill = function() {//«
}//»
this.onresize = function() {//«
	w = Main.clientWidth;
	h = Main.clientHeight;
	resize();
}//»

//»

	stat("Use arrow keys or click around");
	init();

}
