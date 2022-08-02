
export const app = function(arg) {

//Var«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr, globals}=Core;
const{util}=globals;
const{make}=util;
const topwin = Main.top;
const statbar = topwin.status_bar;
const lines = [];

const winid = topwin.id;

let y=0, scroll_num=0;
let w,h;
let nrows,ncols;

let FF = "monospace";
let FW = "500";
let CURBG = "#00f";
let CURFG = "#fff";
let OVERLAYOP = "0.42";
let TCOL = "#e3e3e3";
//»

//DOM«
let wrapdiv = make('div');
wrapdiv.bgcol="#000";
wrapdiv.pos="absolute";
wrapdiv.loc(0,0);
wrapdiv.tcol = TCOL;
wrapdiv.fw = FW;
wrapdiv.ff = FF;
wrapdiv.fs = 21;
wrapdiv.webkitFontSmoothing="antialiased";

wrapdiv.style.whiteSpace = "pre";

Main.appendChild(wrapdiv);

let tabdiv = make('div');
tabdiv.id="tabdiv_"+winid;
tabdiv.w="100%";
tabdiv.style.userSelect = "text"
tabdiv.pos="absolute";
tabdiv.onclick=e=>{
    e.stopPropagation();
    setTimeout(_=>{
        if (window.getSelection().isCollapsed) textarea.focus();
    },10);
}
tabdiv.loc(0,0);
tabdiv.style.tabSize = 4;

wrapdiv.tabdiv = tabdiv;
wrapdiv.appendChild(tabdiv);

let textarea = make('textarea');//«
textarea.width = 1;
textarea.height = 1;
textarea.style.opacity = 0;
let areadiv = make('div');
areadiv.pos="absolute";
areadiv.loc(0,0);
areadiv.z=-1;
areadiv.appendChild(textarea);
this.areadiv = areadiv;
this.textarea = textarea; 
Main.tcol="black";
Main.bgcol="black";
Main.fs=19;
Main.appendChild(areadiv);
textarea.focus();
//»

//»

//Funcs«

const getgrid=()=>{//«
    let _ = wrapdiv;
    let tdiv = tabdiv;
//    if (!(_.w&&_.h)) {
//        if (topwin.killed) return;
//        return cerr("DIMS NOT SET");
//    }
    let usech = "X";
    let str = "";
    let iter = 0;
    wrapdiv.over="auto";
    while (true) {
        if (topwin.killed) return;
        str+=usech;
        tdiv.innerHTML = str;
        if (tdiv.scrollWidth > _.w) {
            tdiv.innerHTML = usech.repeat(str.length-1);
            _.w = tdiv.clientWidth;
            ncols = str.length - 1;
            break;
        }
        iter++;
        if (iter > 10000) {
log(wrapdiv);
            cwarn("INFINITE LOOP ALERT DOING WIDTH: " + tdiv.scrollWidth + " > " + w);
            return
        }
    }
    str = usech;
    iter = 0;
    while (true) {
        tdiv.innerHTML = str;
        if (tdiv.scrollHeight > _.h) {
            let newarr = str.split("\n");
            newarr.pop();
            tdiv.innerHTML = newarr.join("\n");
            _.h = tdiv.clientHeight;
            nrows = newarr.length;
            break;
        }
        str+="\n"+usech;
        iter++;
        if (iter > 10000) {
log(wrapdiv);
            return cwarn("INFINITE LOOP ALERT DOING HEIGHT: " + tdiv.scrollHeight + " > " + h);
        }
    }
    tdiv.innerHTML="";
    wrapdiv.over="hidden";
}//»

const render=()=>{
	let usescroll = scroll_num;
	let scry=usescroll;
	let slicefrom = scry;
	let sliceto = scry + nrows;
	let uselines=[];
	for (let i=slicefrom; i < sliceto; i++) {
		let ln = lines[i];
		if (!ln) uselines.push([""]);
		else {
			let newln = ln.slice(0,w);
			uselines.push(newln);
		}
	}
	let outarr = [];
	let len = uselines.length;
	let donum = len;
	for (let i = 0; i < donum; i++) {
		let arr = uselines[i];
		let ind;
//		while((ind=arr.indexOf("&"))>-1) arr[ind] = "&amp;";
//		while((ind=arr.indexOf("<"))>-1) arr[ind] = "&lt;";
		outarr.push(arr.join(""));
	}
//	tabdiv.innerHTML = outarr.join("\n");
	tabdiv.innerText = outarr.join("\n");
};

//»

//CBs«
const resize=()=>{
	wrapdiv.w=Main.clientWidth;
	wrapdiv.h=Main.clientHeight;
    ncols=nrows=0;
    getgrid();
    if (!(ncols&&nrows)) return;
    w = ncols;
    h = nrows;
	render();
};
this.onresize=resize;

this.onkill=()=>{
};

this.onloadfile=bytes=>{
	let str = Core.api.bytesToStr(bytes);
	resize();
	let all = str.split("\n");
	for (let ln of all){
		lines.push(ln.split(""));
	}
	render();
};
this.onkeydown=(e,k)=>{
	if (k=="DOWN_"){
		if(scroll_num+1+h>lines.length)return;
		scroll_num++;
		render();
	}
	else if (k=="UP_"){
		if (scroll_num > 0) {
			scroll_num--;
			render();
		}
	}
	else if(k=="PGDOWN_"){
		if(scroll_num+1+h>lines.length)return;
		scroll_num+=h;
		if (scroll_num+h > lines.length){
			scroll_num = lines.length-h;
		}
		render();
	}
	else if(k=="PGUP_"){
		scroll_num -=h;
		if (scroll_num<0)scroll_num=0;
		render();
	}
	else if (k=="HOME_"){
		if (scroll_num == 0 ) return;
		scroll_num=0;
		render();
	}
	else if (k=="END_"){
		if (scroll_num == lines.length-h) return;
		scroll_num = lines.length-h;
		render();
	}
};
//»

statbar.innerHTML="Use the paging keys to scroll: Up, Down, PgUp, PgDown, Home and End";

log(topwin);
//log(statbar);

}
