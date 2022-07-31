//Imports«
const{NS,log,cwarn,cerr,xgetobj,globals,Desk,simulate:sim}=Core; 
const{dist}=Core.api;
const{fs,util}=globals;
const{strnum,isarr,isobj,isstr,gbid,mkdv}=util; 
const {//«
    get_path_of_object,
    pathToNode,
    read_file_args_or_stdin,
    serr,
    normpath,
    cur_dir,
    respbr,
    get_var_str,
    refresh,
    failopts,
    cbok,
    cberr,
    wout,
    werr,
    termobj,
    wrap_line,
    kill_register,
    EOF,
    ENV,
	fmt
} = shell_exports;
//»
let desk;
let keyfuncs;
let keyfunc_names;
let keydown;
if (Desk) {
	desk = Desk.get_desk();
	keydown = Desk.keydown;
	keyfuncs = [];
	keyfunc_names = [];
	for (let k in Desk.keysym_funcs){
		keyfunc_names.push(k);
		keyfuncs.push(Desk.keysym_funcs[k]);
	}
}
const fsapi=NS.api.fs;
const capi = Core.api;
const NUM=Number.isFinite;
const w = window.innerWidth;
const h = window.innerHeight;
const noop=()=>{};
const mkkey=(code,metas={})=>{
	return{
		preventDefault:noop,
		keyCode:code,
		ctrlKey:metas.ctrl,
		altKey:metas.alt,
		shiftKey:metas.shift,
	}
}
const mkenter=(metas={})=>{
	return mkkey(13,metas);
}

//»

//Var«

let px_per_s = 800;
let secs_per_step = 0.016;

const mouseops = {
	rs: "resize",
	drg:"dragstart",
	dbl: "dblclick",
	clk: "click",
	dn: "mousedown",
	up: "mouseup",
	mnu: "contextmenu",
	mv: "mousemove"
};
//»

//Funcs«

const getelm=()=>{
	let id = args.shift();
	if (!id) return cberr("No id");
	let elm = gbid(id);
	if (!elm) return cberr(id+": not found");
	return elm;
};
const geticon=(if_icon)=>{
	let num = args.shift();
	if (!num) return cberr("No num");
	if (!num.match(/^[0-9]+$/)) return cberr("Number wanted");
	let img = gbid("img_icon_"+num);
	if (!img) return cberr(num+": not found");
	if (if_icon) return img.wrapper.icon;
	return img.wrapper;
};
const getwin=()=>{
	let num = args.shift();
	if (!num) return cberr("No num");
	if (!num.match(/^[0-9]+$/)) return cberr("Number wanted");
	let win = gbid("win_"+num);
	if (!win) return cberr(num+": not found");
	return win;
};
const getcoords=()=>{
	let coords=args.shift();
	let marr;
	if (!(coords&&(marr=coords.match(/^(-?[0-9]+),(-?[0-9]+)$/)))) return cberr("Invalid coordinates");
	return [marr[1].pi(),marr[2].pi()];
};
const getop=()=>{
	let op = args.shift();
	if (!op) return cberr("No op given");
	let mop = mouseops[op];
	if (!mop) return cberr("Invalid mouse op");
	return mop
};
const get_steps=(x,y,xoff,yoff)=>{
	let d = dist(x,y,x+xoff,y+yoff);
	let s = d/px_per_s;
	let steps = Math.round(s/secs_per_step);
	let x_per_step;
	if (xoff) x_per_step = xoff/steps;
	else x_per_step=0;
	let y_per_step;
	if (yoff) y_per_step = yoff/steps;
	else y_per_step=0;
	return [steps, x_per_step,y_per_step];
};
const wait = (ms)=>{
	return new Promise((y,n)=>{
		setTimeout(y,ms);
	});
};

//»

const coms = {//«

dbl:()=>{//«
	let elm = getelm();
	if (!elm) return;
	sim(elm,'dblclick');
	cbok();
},//»
clicks:async()=>{//«
let killed = false
kill_register(cb=>{
	killed = true;
	cb&&cb();
});
let nstr = args.shift();
if (!nstr) return cberr("Need a number");
let n = nstr.ppi();
if (!NUM(n)) return cberr("Need a positive integer");

for (let i=0; i < w; i+=n){
	for (let j=0; j < h; j+=n){
		let elm = document.elementFromPoint(i,j);
		if (killed) {
console.log("Killed!");
			return;
		}
		sim(elm,'mousedown');
		await wait(5);
		sim(elm,'mouseup');
		sim(elm,'click');
		await wait(5);
	}
}

/*
	let typ = args.shift();
	let elm = getelm();
	if (!elm) return;
	sim(elm,'mousedown');
	await wait(50);
	sim(elm,'mouseup');
	sim(elm,'click');
*/
log("Done");
	cbok();
},//»
dwn:()=>{//«
	let elm = getelm();
	if (!elm) return;
	sim(elm,'mousedown');
	cbok();
},//»
up:()=>{//«
	let elm = getelm();
	if (!elm) return;
	sim(elm,'mouseup');
	cbok();
},//»
deskfuncs:()=>{//«
	let iter=0;
	let s='';
	for (let nm of keyfunc_names){
		s+=`${iter})${nm}  `;
		iter++;
	}
	wout(fmt(s));
	cbok();
},//»
deskfunc:()=>{//«
	let nstr = args.shift();
	if (!nstr) return cberr("Need a number");
	let n = nstr.pnni();
	if (!NUM(n)) return cberr("Need a non-negative integer");
	let fname = keyfunc_names[n];
	if (!fname) return cberr("Not a function number");
	wout(fname);
	keyfuncs[n]();
	cbok();
},//»
point:async()=>{//«
	let arr = getcoords();
	if (!arr) return;
	let d = mkdv();
	d.pos="absolute";
	d.bgcol="red";
	d.w=8;
	d.h=8;
	d.z=10000000000;
	d.loc(arr[0]-4,arr[1]-4);
	document.body.add(d);
	await wait(500);
	d.del();
	cbok();
},//»
mouseop:async()=>{//«
	let op = getop();
	if (!op) return;
	let arr = getcoords();
	if (!arr) return;
	let x = arr[0];
	let y = arr[1];
	let elm = document.elementFromPoint(x,y);
	if (!elm) return cberr(`Nothing found at: ${x},${y}`);
	let id = elm.id;
	let clnm = elm.className;
	let evt={x:x,y:y};
	sim(elm, op,evt);
	cbok();
},//»
winop:async()=>{//«
	let win = getwin();
	if (!win) return;
	let op = getop();
	if (!op) return;
	if (op=="mousemove"||op=="resize"){
		let arr = getcoords();
		if (!arr) return;
		let elm;
		if (op=="resize") elm = win.rs_div;
		else elm = win.titlebar;
		let r = elm.gbcr();
		let x,y;
		if (op=="resize"){
			x = r.right;
			y = r.bottom;
		}
		else{
			x = (r.left+r.right)/2;
			y = (r.top+r.bottom)/2;
		}
		let xoff = arr[0];
		let yoff = arr[1];
		let arr2=get_steps(x,y,xoff,yoff);
		let nsteps = arr2[0];
		let xps = arr2[1];
		let yps = arr2[2];
		sim(elm, 'mousedown',{x:x,y:y});
		await wait(20);
		sim(elm, 'dragstart',{x:x,y:y});
		for (let i=0; i < nsteps; i++){
			sim(desk,'mousemove',{x:x+xps*i,y:y+yps*i});
			await wait(16);
		}
		sim(desk,'mousemove',{x:x+xoff,y:y+yoff});
		sim(desk,'mouseup',{x:x+xoff,y:y+yoff});
	}
	cbok();
},//»
icn2icn:async()=>{//«
	let icn1 = geticon();
	if (!icn1) return;
	let icn2 = geticon();
	if (!icn2) return;
	if (icn1==icn2) return cberr("Same icon");
	let r1 = icn1.gbcr();
	let x1 = (r1.left+r1.right)/2;
	let y1 = (r1.top+r1.bottom)/2;

	let r2 = icn2.gbcr();
	let x2 = (r2.left+r2.right)/2;
	let y2 = (r2.top+r2.bottom)/2;

	let arr=get_steps(x1,y1,x2-x1,y2-y1);
	let nsteps = arr[0];
	let xps = arr[1];
	let yps = arr[2];

	sim(icn1, 'mousedown');
	await wait(20);
	sim(icn1, 'dragstart');
	for (let i=0; i < nsteps; i++){
		sim(desk,'mousemove',{x:x1+xps*i,y:y1+yps*i});
		await wait(16);
	}
	sim(icn2,'mouseover');
	await wait(250);
	sim(icn2,'mouseup');
	cbok();
},//»
icn2win:async()=>{//«
	let icn = geticon();
	if (!icn) return;
	let win = getwin();
	if (!win) return;

	let r1 = icn.gbcr();
	let x1 = (r1.left+r1.right)/2;
	let y1 = (r1.top+r1.bottom)/2;

	let r2 = win.gbcr();
	let x2 = (r2.left+r2.right)/2;
	let y2 = (r2.top+r2.bottom)/2;

	let arr=get_steps(x1,y1,x2-x1,y2-y1);
	let nsteps = arr[0];
	let xps = arr[1];
	let yps = arr[2];

	sim(icn, 'mousedown');
	await wait(20);
	sim(icn, 'dragstart');
	for (let i=0; i < nsteps; i++){
		sim(desk,'mousemove',{x:x1+xps*i,y:y1+yps*i});
		await wait(16);
	}
	sim(win.main,'mouseover');
	await wait(250);
	sim(win.main,'mouseup');
	cbok();
},//»
icn2pt:async()=>{//«
	let icn = geticon();
	if (!icn) return;
	let arr = getcoords();
	if (!arr) return;

	let r1 = icn.gbcr();
	let x1 = (r1.left+r1.right)/2;
	let y1 = (r1.top+r1.bottom)/2;

	let x2 = arr[0];
	let y2 = arr[1];

	let arr2=get_steps(x1,y1,x2-x1,y2-y1);
	let nsteps = arr2[0];
	let xps = arr2[1];
	let yps = arr2[2];

	sim(icn, 'mousedown');
	await wait(20);
	sim(icn, 'dragstart');
	for (let i=0; i < nsteps; i++){
		sim(desk,'mousemove',{x:x1+xps*i,y:y1+yps*i});
		await wait(16);
	}
	sim(desk,'mousemove',{x:x2,y:y2});
	sim(desk,'mouseup',{x:x2,y:y2});
	cbok();
},//»
icons:()=>{//«
	let arr = desk.getElementsByClassName("icon");
	let s='';
	for (let icn of arr) s+=icn.id.replace(/^icon_/,"")+" ";
	wout(fmt(s));
	cbok();
},//»
icon:()=>{//«
	let icn = geticon(true);
	if (!icn) return;
	wout(icn.name);
	log(icn);
	cbok();
},//»
iconop:async()=>{//«
	let icn = geticon();
	if (!icn) return;
	let op = getop();
	if (!op) return;
	if (op=="mousemove"){
		let arr = getcoords();
		if (!arr) return;
		let r = icn.gbcr();
		let x = (r.left+r.right)/2;
		let y = r.bottom;
		let xoff = arr[0];
		let yoff = arr[1];
		let arr2=get_steps(x,y,xoff,yoff);
		let nsteps = arr2[0];
		let xps = arr2[1];
		let yps = arr2[2];
		sim(icn, 'mousedown', {x:x,y:y});
		await wait(20);
		sim(icn, 'dragstart', {x:x,y:y});
		for (let i=0; i < nsteps; i++){
			sim(desk,'mousemove',{x:x+xps*i,y:y+yps*i});
			await wait(16);
		}
		sim(desk,'mousemove',{x:x+xoff,y:y+yoff});
		sim(desk,'mouseup',{x:x+xoff,y:y+yoff});
	}
	else sim(icn,op);
	cbok();
},//»
editiconname:()=>{//«
	let name = args.shift();
	let act = document.activeElement;
	if (!act) return cberr("Nothing found");
	if (act.id=="edit_icon_textarea") {
		act.value = name;
		keydown(mkenter());
		cbok();
	}
	else cberr("Not the edit icon");
},//»
deskop:async()=>{//«
	let op = args.shift();
	if (!op) return cberr("No op given");
	if (op=="lasso") {
		let arr1 = getcoords();
		if (!arr1) return;
		let arr2 = getcoords();
		if (!arr2) return;
		let x = arr1[0];
		let y = arr1[1];
		let arr3=get_steps(x,y,arr2[0]-x,arr2[1]-y);
		let nsteps = arr3[0];
		let xps = arr3[1];
		let yps = arr3[2];

		sim(desk,'mousedown',{x:x,y:y});
		for (let i=0; i < nsteps; i++){
			sim(desk,'mousemove',{x:x+xps*i,y:y+yps*i});
			await wait(16);
		}
		sim(desk,'mousemove',{x:arr2[0],y:arr2[1]});
		sim(desk,'mouseup',{x:arr2[0],y:arr2[1]});
	}
	else if (op=="mnu"){
		let arr1 = getcoords();
		if (!arr1) return;
		sim(desk,'contextmenu',{x:arr1[0],y:arr1[1]});
	}
	else return cberr("Unknown desk op: "+op);
	cbok();
},//»
allids:()=>{//«
	if (!Desk) return cberr("No desk mode");
	let w = window.innerWidth;
	let h = window.innerHeight;
	let ids=[];
	for (let i=0; i < w; i+=5){
		for (let j=0; j < h; j+=5){
			let elm = document.elementFromPoint(i,j);
			if (!elm){
				cberr(`No element @(${i},${j})`);
				return;
			}
			let id = elm.id;
			let cl = elm.className||"";
			if (!elm.id) {
log("Parent",elm.parentNode);
log(elm);
				cberr(`No id @(${i},${j})  class=(${cl})`);
				return;
			}
			if (!ids.includes(id)) ids.push(id);
		}
	}
	wout(fmt(ids.join(" ")));
	cbok();
}//»

}//»

const coms_help={//«
};//»

if (!com) return Object.keys(coms);
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in auto!");
if (args===true) return coms[com];
coms[com](args);

