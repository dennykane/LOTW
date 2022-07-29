
//XPath to query for an 'isActive' member of a classList
// $x('//*[contains(concat(" ", normalize-space(@class), " "), " isActive ")]')

/*«

!!!   PUPPETEER CAPTURES WEBSOCKET DATA   !!!

Use tesseract-ocr in Node.js/puppeteer in order to go from pixels to text string.
We can cache the results of the pixels using some kind of checksum (md5/sha1/etc)
so we don't need to keep calling tesseract for every image.

First, we can define a crop rectangle for all raw incoming images.
Then, we want to be able to stop a stream to inspect an image's pixels.
Want to draw a rectangle on the base image, which opens up a zoom layer.

»*/

let SCALE_FAC = 40;

export const app = function(arg) {

//Imports«

const APPNAME="Puppet";

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

Main.top.title=APPNAME;
const{util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

const fs = NS.api.fs;

//»

//DOM«

Main.over="scroll";

//»

//Var«

const SERVERIP = "192.168.0.14";
const SERVERPORT = 6019;
const SERVER_URL = `http://${SERVERIP}:${SERVERPORT}`;
//const WSURL = `ws://${SERVERIP}:${SERVERPORT}`;
const WPT_URL = "https://lobby.clubwpt.com";

//let stream_interval = 1000;
let stream_ms = 250;
let stream_interval;

let killed = false;
let screenshot_in_progress;
let com_in_progress;
let blob_iter=0;
let interval;
let html_str;
let curblob;
let curdiv;
let curimgdata;
let curdata;
let curpos;
let curcan;
let curcandata;

let get_messages = false;

//»

//Funcs«

const parse_nav_page = s => {//«
	let parser = new DOMParser();
	let doc = parser.parseFromString(s, "text/html");
	let navs = Array.from(doc.getElementsByClassName("keywords-poker-wrapper")[0].children);
	let iter=0;
	for (let nav of navs){
//log(.classList);
		let kid0 = nav.children[0];
		let kids = kid0.children[0].children[0].children[0].children;
		let type = kids[0].innerText.replace(/[\n\s\t]/g,"");
		let which = kids[1].innerText.replace(/[\n\s\t]/g,"");
//log(which, type);
		if(kid0.classList.contains("isActive")){
			cwarn(iter, which, type);
		}
		else log(iter, which, type);
		iter++;
	}
///*
//	let grid = doc.getElementsByTagName("tournaments-grid")[0];
//	let grid = doc.getElementsByTagName("grid-poker")[0].children[1].children[0];
log(doc.getElementsByTagName("grid-poker")[0]);
	let cols = Array.from( doc.getElementsByTagName("grid-poker")[0].children[0].children[0].children[0].children[0].children[0].children);
	iter=0;
	for (let col of cols){
		if (!col.children.length) continue;
		let paras = col.getElementsByTagName("p");
		//log(paras);
		let o={};
		for (let p of paras){
			let k = p.children[0].innerText.replace(/: /,"");
			o[k] = p.children[1].innerText;
		}
		o.Button = col.getElementsByTagName("button")[0];
		o.Iter = iter++;
		log(o);
	}
//log(o);
//log(cols);
//log(grid);
//log(grid.children);
/*
	let cols = Array.from(grid.children[0].children[0].children[0].children);
*/
//*/

};//»

const get = (which, if_json) => {//«
	return new Promise(async(Y,N)=>{
		let rv = await fetch(`${SERVER_URL}/${which}`);
		if (!rv.ok){
			cerr(`Could not get: ${which}`);
			Y();
			return;
		}
		if (if_json) Y(await rv.json());
		else Y(await rv.text());
	});
};//»

const stat = s =>{//«
	if (!s) s = "";
	Win.status_bar.innerHTML=`<b>${s}</b>`;
};//»

const screenshot = async()=>{//«
	if (screenshot_in_progress) return;
	screenshot_in_progress = true;
	let rv ;
	try {
		rv = await fetch(`${SERVER_URL}/screenshot`);
	}
	catch(e){
		screenshot_in_progress = false;
		return;
	};
	if (!rv.ok) {
		screenshot_in_progress = false;
		return;
	}
	let dat = await rv.blob();
cwarn(blob_iter++, dat.size);

	let img = new Image;
	let imdiv = mkdv();
	imdiv.pos="absolute";
	imdiv.loc(0,0);	
	img.src = URL.createObjectURL(dat);
	imdiv.add(img);
	Main.add(imdiv);
	if (curdiv) {
		let oldcur = curdiv;
		setTimeout(()=>{
			oldcur.del();
		},10);
	}
	curdiv = imdiv;
	screenshot_in_progress = false;
	imdiv.onclick = async(e)=>{
//	send({click:{x: e.offsetX, y: e.offsetY}});
		let rv = await fetch(`${SERVER_URL}/click?x=${e.offsetX}&y=${e.offsetY}`);
if (!rv.ok)	return cerr("CLICK???");
log(await rv.text());
	}
};//»

const setpage = async(url)=>{//«
	if (com_in_progress) return;
	com_in_progress = true;
	let rv ;
	try {
		rv = await fetch(`${SERVER_URL}/setpage?page=${encodeURIComponent(url)}`);
	}
	catch(e){
		com_in_progress = false;
		return;
	};
	if (!rv.ok) {
		com_in_progress = false;
cerr(rv);
		return;
	}
	log(await rv.text());
	com_in_progress = false;
};//»

const rgb_from_point = (x,y)=>{//«
	let val = 4*(y * curimgdata.width + x);
	return [`r: ${curdata[val]}`,`g: ${curdata[val+1]}`,`b: ${curdata[val+2]}`];
};//»

const make_image_from_data=(arr, xarg, yarg, w, h, scale_fac)=>{//«

let can = mk('canvas');
let ctx = can.getContext('2d');
can.width = w;
can.height = h;
let dat = ctx.createImageData(w, h);
dat.data.set(arr);
ctx.putImageData(dat, 0, 0);


let can2 = mk('canvas');
let ctx2 = can2.getContext('2d');
can2.width = scale_fac*w;
can2.height = scale_fac*h; 
ctx2.imageSmoothingEnabled = false;
ctx2.drawImage(can,0,0,scale_fac*w,scale_fac*h);

can2.onmousemove=(e)=>{//«

	let x = xarg+Math.floor(e.offsetX/scale_fac);
	let y = yarg+Math.floor(e.offsetY/scale_fac);
	let str = `x:\xa0${x}\xa0\xa0y:\xa0${y}`;
	if (str !== curpos) {
		stat(`${str}\xa0\xa0|\xa0\xa0${rgb_from_point(x,y).join("\xa0\xa0")}`);
	}
	curpos = str;

};//»

curdiv.dis="none";

Main.add(can2);
curcan = can2;
curcan._original = can;

}//»

const set_image = dat => {//«

return new Promise((Y,N)=>{

//cwarn(blob_iter++, dat.size);
	let img = new Image;
	img.draggable = false;
	let imdiv = mkdv();

	let isdown = null;
	let rdiv = mkdv();
	rdiv.pos="absolute";
	rdiv.bor="1px solid #ff0";

	imdiv.onmousedown=e=>{
		isdown = e;
		imdiv.add(rdiv);
		rdiv.x = e.offsetX;
		rdiv.y = e.offsetY;
	};

	imdiv.onmousemove=e=>{
		e.preventDefault();

		let x = e.offsetX;
		let y = e.offsetY;
		let str = `x:\xa0${x}\xa0\xa0y:\xa0${y}`;
		let col;
		if (str !== curpos) {
			stat(`${str}\xa0\xa0|\xa0\xa0${rgb_from_point(x,y).join("\xa0\xa0")}`);
		}
		curpos = str;

		if (!isdown) return;
		let dx = e.clientX - isdown.clientX;
		let dy = e.clientY - isdown.clientY;
		if (dx > 0 && dy > 0){
			rdiv.w=dx;
			rdiv.h=dy;
		}
	};

	imdiv.onmouseup=e=>{
		if (!isdown) return;
		let w = rdiv.w;
		let h = rdiv.h;
		let x = isdown.offsetX;
		let y = isdown.offsetY;
		if (isdown && w && h) {
			curcandata = get_rect(x, y, w, h);
			make_image_from_data(curcandata, x, y, w, h, SCALE_FAC);
		}
		rdiv.w=0;
		rdiv.h=0;
		rdiv.del();
		isdown = null;
	};

	imdiv.onmouseleave=e=>{
		rdiv.w=0;
		rdiv.h=0;
		rdiv.del();
		isdown = null;
	};


	imdiv.pos="absolute";
	imdiv.loc(0,0);	
	img.onload=e=>{
		let can = mk('canvas');
		let ctx = can.getContext('2d');
		let w = e.target.width;
		let h = e.target.height;
		can.width=w;
		can.height=h;
		ctx.drawImage(img,0,0);
		Y(ctx.getImageData(0,0,w, h));

	};
	img.src = window.URL.createObjectURL(dat);
	imdiv.add(img);
	Main.add(imdiv);
	if (curdiv) {
		let oldcur = curdiv;
		setTimeout(()=>{
			oldcur.del();
		},10);
	}
	curdiv = imdiv;

});

};//»

const get_rect = (x_start, y_start, w, h)=>{//«
	let rowstride = curimgdata.width*4;
	let start = y_start*rowstride + (4*x_start);
	let out = new Uint8ClampedArray(4*h*w);
	for (let i=start, j=0; j < h ;i+=rowstride, j++) out.set(curdata.slice(i, i+4*w), 4*w*j);
	return out;
}//»

const init = async(arg)=>{//«

	let rv = await fs.readHtml5File("/home/me/poker.html");
//parse_nav_page(rv);
	let parser = new DOMParser();
	let doc = parser.parseFromString(rv, "text/html");
//log(doc.getElementById("scrollUp"));
//log(doc);
//	let xpath = "/html/body/ion-app/ng-component[@class='app-root']";
//	let xpath = "/div";

//This star can be <tournaments-grid> or <cashgames-grid>
	let xpath="//grid-poker/div/*[1]/ion-grid/ion-row/ion-col";
	let evaluator = new XPathEvaluator();
	let result = evaluator.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

if (!result.snapshotLength) cwarn(`Nothing found for XPath:  ${xpath}`);

for (let i=0; i < result.snapshotLength; i++){
log(i, result.snapshotItem(i));
}



//	let expression = evaluator.createExpression(xpath);
//	let result = expression.evaluate(doc, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

//log(result.snapshotItem(0));

//log(doc);

//	let rv = await fs.readFile("/home/me/poker.html");
/*
	let rv = await fs.readFile("/home/me/Desktop/1.png");
	curblob = rv;
	curimgdata = await set_image(rv);
	curdata = curimgdata.data;
*/

//getmesg();

}//»

const save=()=>{//«

	let dat;
	let blob;
	if (curcan) {
		let url = curcan._original.toDataURL("image/png");
		let dat = atob((url.replace(/^data:image\/png;base64,/,"")));
		let len = dat.length;
		let arr = new Uint8Array(len);
		for (let i=0; i < len; i++) arr[i] = dat[i].charCodeAt();
		blob = new Blob([arr],{type:"image/png"});
	}
	else blob = curblob;

	Core.api.download(blob,"puppet_image.png");

};//»

const getmesg = async()=>{//«

if (killed) return;
let rv = await fetch(`${SERVER_URL}/msgin`);
if (!rv.ok){
	cerr(rv);
	return;
}
let o = await rv.json();
log(o);
getmesg();
//setTimeout(getmesg, 10);

};//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = async(e,s)=>{//«

	if (s=="s_") {
		screenshot();
	}
	else if (s=="i_"){
		stream_interval = setInterval(screenshot, stream_ms);
	}
	else if (s=="e_"){
		clearInterval(stream_interval);
	}
	else if (s=="o_"){
		setpage(WPT_URL);
	}
	else if (s=="s_A"){
		save();
	}
	else if (s=="m_"){
		if (!get_messages){
			let rv = await fetch(`${SERVER_URL}/msgon`);
cwarn("ON: ", rv.ok);
			get_messages = true;
		}
		else{
			let rv = await fetch(`${SERVER_URL}/msgoff`);
cwarn("OFF: ", rv.ok);
			get_messages = false;
		}
	}
	else if (s=="g_") getmesg();
	else if (s=="c_"){
		parse_nav_page(await get('content'));
	}
	else if (s=="w_"){
let rv = await get("wrapper");
log(rv);
	}
	else if (s=="l_"){
let rv = await get("grid");
log(rv);

	}
	
}//»

this.onkeypress=e=>{//«

};//»

this.onkill = async()=>{//«
	killed = true;
/*
try{
	let rv = await fetch(`${SERVER_URL}/msgoff`);
	log("MSGOFF", rv.ok);
}catch(e){}
*/
}//»
this.onresize = ()=>{//«
}//»
this.onfocus=()=>{//«
}//»

this.onblur=()=>{//«
}//»
this.onescape = ()=>{//«

	if (curcan){
		stat();
		curcan.del();
		curcan = null;
		curdiv.dis="";
		return true;
	}
	return false;

};//»

//»

}








//OldFuncs«

/*

const Socket = function(){//«

let ws;
let page_url;
let msg_cb;
let discon_cb;

const create_socket = ()=>{//«

return new Promise((Y,N)=>{

	ws = new WebSocket(WSURL);

	ws.onopen=()=>{
console.warn("open");
		Y();
	};

	ws.onclose=()=>{
		ws = null;
		if (discon_cb) discon_cb();
console.error('disconnected');
	};
	ws.onmessage = e => {//«

		let dat = e.data;
		if (dat[0]=="{"){
			let o = JSON.parse(dat);
			if (o.opened) {
				page_url = o.opened;
console.log("opened", page_url);
			}
			else{
console.warn("Unknown object key:");
				for (let k in o) console.log(k)
			}
		}
		else if (dat instanceof Blob){
			if (msg_cb) msg_cb(dat);
		}
		else{
console.warn("GOTWHAT", dat);
		}

	};//»


});


};//»

this.didinit=()=>{return !!ws;};
this.init = ()=>{//«

	if (ws) return Y(true);
	return create_socket();

};//»
this.close = () => {
	if (ws) ws.close();
};
this.send = val => {//«

	if (val instanceof Object) ws.send(JSON.stringify(val));
	else ws.send(val);

};//»
this.open_page = arg => {//«
	if (page_url === arg){
		cwarn("Already opened: ", arg);
		return;
	}
	this.send({open: arg});
};//»
this.onmessage = cb => {msg_cb = cb;};

this.screenshot=()=>{//«
	if (!page_url){
console.error("There is no page opened in puppeteer");
		return;
	}
	this.send({screenshot: true});
};//»
this.ondisconnect=arg=>{
	discon_cb = arg;
};

this.stream=()=>{
	if (!page_url){
console.error("There is no page opened in puppeteer");
		return;
	}
	this.send({setinterval: stream_interval});
};
this.end_stream=()=>{
	this.send({clearinterval: true});
};
this.launch=()=>{
	this.send({launch: true});
};

};//»

const init = async(arg)=>{//«

sock = Main.get_appvar("socket");
if (sock){
	sock.ondisconnect(()=>{sock = null;});
	sock.onmessage(handle_blob)
}


}//»
this.onkeydown = async(e,s)=>{//«

if (!sock) {

	if (s=="y_"){
		sock = new Socket();
		await sock.init();
log(sock);
		sock.ondisconnect(()=>{
			sock = null;
		});
		sock.onmessage(handle_blob)
	}
	else cerr("NOSOCKET");

	return;

}
if (s=="s_") {
//log("SHOOT");
//	sock.screenshot();
screenshot();
//log(blob);

}
else if (s=="o_"){
log("Opening...");
	sock.open_page(PAGE_URL);
}
else if (s=="i_"){

interval = setInterval(screenshot, 250);
//	start();
//	sock.stream();

//screenshots();

}
else if (s=="e_"){

clearInterval(interval);

//	start();
//	sock.end_stream();
}
else if (s=="x_"){
	sock.close();
}
else if (s=="l_"){
	sock.launch();
}



}//»
*/

//Very uninteresting (eeb'd) HTML parsing crap...«
/*
let rv = await fsapi.readHtml5File("/home/me/poker.html");
let parser = new DOMParser();
let doc = parser.parseFromString(rv, "text/html");
//log(doc);
*/
/*This gets the top navigation stuff for the different parts of the lobby (Tourneys, Sit&Go, Ring Games)
let navs = Array.from(doc.getElementsByClassName("keywords-poker-wrapper")[0].children);
for (let nav of navs){
let kids = nav.children[0].children[0].children[0].children[0].children;
//log(kids);
let type = kids[0].innerText.replace(/[\n\s\t]/g,"");
let which = kids[1].innerText.replace(/[\n\s\t]/g,"");
log(which, type);
}
*/

/*This gets all of the listings...
let grid = doc.getElementsByTagName("tournaments-grid")[0];
let cols = Array.from(grid.children[0].children[0].children[0].children);
for (let col of cols){
if (!col.children.length) continue;
let paras = col.getElementsByTagName("p");
//log(paras);
let o={};
for (let p of paras){
let k = p.children[0].innerText.replace(/: /,"");
o[k] = p.children[1].innerText;
}
o.Button = col.getElementsByTagName("button")[0];
}
*/

//»

/*


	ws.onmessage=async(e)=>{//«

		let dat = e.data;
		if (dat instanceof Blob){
			Main.innerHTML="";
			let img = new Image;
			img.src = window.URL.createObjectURL(dat);
			Main.add(img);
		}
		else if (dat[0]=="{"){
			let o = JSON.parse(dat);
			if (o.ok) {
				let cb = MSG_PROMS[o.ok];
				if (!cb) return cerr(`NO CB FOR MSG ITER: ${o.ok}`);
				cb();
			}
			else if (o.content){
//let rv = await fsapi.writeHtml5File("/home/me/poker.html", o.content);
//log(rv);
//log(o.content);
//let parser = new DOMParser();
//let doc = parser.parseFromString(o.content, "text/html");
//let grid = doc.getElementsByTagName("tournaments-grid")[0];
//let cols = grid.children[0].children[0].children[0].children;
//if (cols[0])

//let cols = grid.childNodes[0].childNodes[0].childNodes[0];
//log(cols);
//log(grids[0].innerHTML);
// HTMLDocument

			}
		}
	};//»


Main.ael("click",(e)=>{
log(e.offsetX, e.offsetY);
	send({click:{x: e.offsetX, y: e.offsetY}});
});
*/

/*

const send=(arg)=>{//«

return new Promise((Y,N)=>{
	arg.id = ws_msg_iter++;
	ws.send(JSON.stringify(arg));
	MSG_PROMS[arg.id] = Y;
});


};//»

const screenshot = async()=>{//«
	send({screenshot: true});
};//»
const start=async()=>{//«

//	await send({open: "https://google.com"});
//	await send({open: "https://lobby.clubwpt.com"});
//	await send({open: "https://yahoo.com"});
log("init");
};//»

*/




//»

