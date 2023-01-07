export const app = function(arg) {

 

//Just pass the window geometry
//log(topwin.x, topwin.y, Main.w, Main.h);

//let picker_mode = false;

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;
const {makeIcon} = Desk.api;
const {getAppIcon}= capi;
const{util}=globals;
const{FOLDER_APP}=globals;
const{make,mkdv,mk,mksp}=util;
const {fs}=NS.api;
let CUR_FOLDER_XOFF = 5;
let topwin = Main.top;
let winid = topwin.id;
let path = topwin._fullpath;
let statbar = topwin.status_bar;
let num_entries = 0;

const{poperr} = globals.widgets;

let picker_mode;
// = false;


//»

//DOM«

let WDIE;
let dd = mkdv();
dd.pos = 'absolute';
dd.bor = '1px solid white';
dd.bgcol = 'gray';
dd.op = 0.5;
dd.loc(-1, -1);
dd.w = 0;
dd.h = 0;
Main.add(dd);

//Main.bgcol="#332323";
//Main.bgcol="#544";
Main.overy="auto";
Main.overx="hidden";
Main.tabIndex="-1";
//Main.pad=5;
const icondv = mkdv();
icondv.mar=5;
icondv.main = Main;
icondv.win = Main.top;
icondv.pos = "relative";
icondv.dis="flex";
icondv.style.flexBasis=`100px`;
icondv.style.flexShrink=0;
icondv.style.flexGrow=0;
icondv.style.flexWrap="wrap";
Main.add(icondv);

topwin.drag_div = dd;
topwin.icon_div = icondv;
Main.icon_div = icondv;
//log(topwin);

//»
//Var«

//let ICONS=[];
let is_loading = false;
let drag_timeout;
let dir;
let kids;
let curnum;
let observer;
//»

//Funcs«

const reload = (newpath)=>{//«
	if (is_loading) return;
	if (newpath) path = newpath;
	is_loading = true;
	Main.scrollTop=0;
	icondv.innerHTML="";
	init();
	stat(`${dir.KIDS._keys.length-2} entries`);
	if (topwin.CURSOR) topwin.CURSOR.set();
};//»

const stat=(s)=>{statbar.innerHTML=s;};
const NOOP=()=>{};

const load_dir=()=>{//«

let typ = dir.root.TYPE;
kids = dir.KIDS;
let keys = kids._keys;
keys.splice(keys.indexOf("."),1);
keys.splice(keys.indexOf(".."),1);
if (picker_mode){
	let arr = [];
	for (let k of keys){
//log(kids[k].APP, FOLDER_APP);
		if(kids[k].APP===FOLDER_APP) arr.push(k);
	}
	keys = arr;
}
keys.sort();
curnum = keys.length
num_entries = keys.length;
stat_num();
let s = '';
for (let i=0; i < curnum; i++){
	s+=`<div data-name="${keys[i]}" class="icon"></div>`;
}
icondv.innerHTML=s;
const options = {
	root: Main,
	rootMargin: '0px',
	threshold: 0.001
}

observer = new IntersectionObserver((ents)=>{
	ents.forEach(ent => {
		let d = ent.target;
		if (ent.isIntersecting) d.show();
		else d.hide();
	});
}, options);

for (let kid of icondv.children) {

	kid.show = ()=>{
		let got = kids[kid.dataset.name];
if (!got){
cwarn("Not found in kids: "+ kid.dataset.name);
kid.del();
return;
}
		let icn = makeIcon(got, kid, observer);
		icn.parwin = topwin;
		kid.showing = true;
	};
	kid.hide = ()=>{
		kid.innerHTML="";
		kid.showing = false;
	};
		observer.observe(kid);
	}
	is_loading = false;

}//»
const stat_num=()=>{//«
	if (!num_entries) stat("Empty");
	else if (num_entries==1) stat("1 entry");
	else stat(`${num_entries} entries`);
};//»
const init=async()=>{//«

	if (topwin._savecb) {
		picker_mode = true;
		topwin.title = `Save\xa0Location\xa0:\xa0'${topwin.title}'`;
	}
//log(topwin._savecb);

	dir = await fs.pathToNode(path);
	if (!dir) {
if (path) poperr(`Directory not found: ${path}`);
else cwarn("Opening in 'app mode'");
		return;
	}
	if (!dir.done){
		stat("Getting entries...");
		let cb=(ents)=>{
//			num_entries+=ents.length;
//			stat_num();
		};
		await fs.populateDirObjByPath(path, {par:dir,streamCb:cb});
		dir.done=true;
		load_dir();
	}
	else{
		load_dir();
	}
	if (dir.root.TYPE!=="fs") {
		num_entries = Object.keys(dir.KIDS).length-2;
		stat_num();
	}
}//»

//»

//OBJ/CB«

this.reload=reload;

this.onkeydown = function(e,s) {//«

if (s=="r_")reload(path);
else if (s=="0_"){
	if (topwin.CURSOR) {
		topwin.CURSOR.zero();
	}
//topwin.CURSOR.set();
}
else if (s=="b_"){

if (path=="//"||path==="/") return;
let arr = path.split("/");
arr.pop();
let opts = {WINARGS: {X: topwin.x, Y:topwin.y, WID: Main.w, HGT: Main.h}};
if (topwin._savecb) {
	opts.SAVE_CB = topwin._savecb;
opts.SAVE_FOLDER_CB = topwin._savefoldercb;
}
Desk.open_file_by_path(arr.join("/"), null, opts);
topwin.force_kill();

}
else if (s=="s_"||s=="s_C"){

if (topwin._savecb) {
	topwin._savecb(topwin);
	topwin._savecb = null;
}
}
}//»
this.onkill = function() {//«
	icondv.del();
}//»
this.onresize = function() {//«
let cur = topwin.CURSOR;
if (!cur) return;
let icn = Main.lasticon;
if (!icn) return;
icn.scrollIntoViewIfNeeded();
//cur.loc(icn.offsetLeft+CUR_FOLDER_XOFF, icn.offsetTop);
cur.loc(icn.offsetLeft+2, icn.offsetTop+2);


}//»

this.onfocus=()=>{Main.focus();};
this.onblur=()=>{Main.blur();};
this.onload=()=>{init();};
this.update=()=>{stat(`${dir.KIDS._keys.length-2} entries`);};
this.add_icon=(icn)=>{Main.scrollTop=0;};
this.stat=stat;

//»

Main.focus();
Desk.add_folder_listeners(topwin);

}

