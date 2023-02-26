/*
If we are in the process of saving a file via the Filesaver mechanism...
*/
/* !!! LOGIC BUG @EJMNCYLKIFB !!!

If we cancel the saving operation during the period between the icon being created as New_File_1 (or whatever)
and the "real name" we want for it


*/
/*

If you close this window when it is in the "Save As" mode (for e.g. TextEdit), it is still treated as
the child_window...

*/
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
//log(topwin);
let winid = topwin.id;
let path = topwin._fullpath;
let statbar = topwin.status_bar;
let num_entries = 0;

const{poperr} = globals.widgets;

let picker_mode;

// = false;


//»

//DOM«

///*
const FOOTER_HGT = 0;
//const FOOTER_HGT = 38;
//let Main = _Main;
let savebut, canbut;
//*/
/*
const FOOTER_HGT = 38;
let Main = mkdv();
Main.pos="absolute";
Main.loc(0,0);
Main.w="100%";
Main.overy="hidden";
Main.h=_Main.h-FOOTER_HGT;
_Main.add(Main);
topwin.main = Main;
*/
//log(_Main);
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

const reload = async(newpath)=>{//«
	if (is_loading) return;
	if (newpath) path = newpath;
	is_loading = true;
	Main.scrollTop=0;
	icondv.innerHTML="";
	await init(true);
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
/*

If this 'got' should be "owned" by a FileSaver that is writing to it, then we want to
be able to call a callback with 'got' and get an updating overdiv put on it.

Right now, FileSaver creates the kid node upon end_blob_stream, but we should do
it upon start_blob_stream.

*/
if (!got){
cwarn("Not found in kids: "+ kid.dataset.name);
kid.del();
return;
}
		let icn = makeIcon(got, kid, observer);
if (got.filesaver_cb) got.filesaver_cb(icn);
icn.pos="relative";
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
const init=(if_reinit)=>{//«

return new Promise(async(Y,N)=>{
	if (topwin._savecb) {
		picker_mode = true;
		topwin.title = `Save\xa0Location\xa0:\xa0'${topwin.title}'`;

let botdiv = topwin.bottom_div;
let both = botdiv.getBoundingClientRect().height-4;
savebut = mk('button');
savebut.fw="bold";
savebut.bgcol="#dde";
savebut.innerText="\xa0Save\xa0";
savebut.style.cssFloat="right";
savebut.h = both;
savebut.marr=5;
canbut = mk('button');
canbut.fw="bold";
canbut.bgcol="#dde";
canbut.marr=5;
canbut.innerText="Cancel";
canbut.style.cssFloat="right";
canbut.h = both;

topwin._save_escape_cb=()=>{
	savebut.disabled = false;
};
savebut.onclick=()=>{
	topwin._savecb(topwin);
	savebut.disabled = true;
};
canbut.onclick=()=>{
//	topwin._savecb(topwin);
	topwin.close_button.click();
};

botdiv.add(canbut);
botdiv.add(savebut);
//savebut.tabIndex="-1";
//canbut.tabIndex="-1";
//savebut.focus();
	}

	dir = await fs.pathToNode(path);
	if (!dir) {
if (path) poperr(`Directory not found: ${path}`);
else cwarn("Opening in 'app mode'");
		return;
	}
//HDKMHHNDUH
//	if (if_reinit || !dir.done){

//Show a loading message in the Main window of the Folder app: //«
//In apps/sys/Folder.js->init
    if (!dir.done){
        stat("Getting entries...");
        let cb=(ents)=>{
            num_entries+=ents.length;
            stat_num();
            if (numdiv) numdiv.innerHTML=`${num_entries} entries loaded`;
        };
        let numdiv;
        let done = false;
        setTimeout(()=>{
            if (done) return;
            numdiv = make("div");
            numdiv.tcol="#bbb";
            numdiv.pad=10;
            numdiv.fs=24;
            numdiv.fw="bold";
            numdiv.ta="center";
            numdiv.innerHTML=`${num_entries} entries loaded`;
            numdiv.pos="absolute";
            numdiv.vcenter();
            Main.add(numdiv);
        }, 100);
        await fs.populateDirObjByPath(path, {par:dir,streamCb:cb});
        done = true;
        if (numdiv) numdiv.del();
        dir.done=true;
        load_dir();
    }
	else{
		load_dir();
	}
//»
/*
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
*/
	if (dir.root.TYPE!=="fs") {
		num_entries = Object.keys(dir.KIDS).length-2;
		stat_num();
	}

	Y();
});

}//»

//»

//OBJ/CB«

this.reload=reload;
this.onescape=()=>{

if (savebut) {
let act = document.activeElement;
if (act===savebut) {
	savebut.blur();
	return true;
}
if (act===canbut) {
	canbut.blur();
	return true;
}
}
return false;
};
this.onkeydown = function(e,s) {//«

if (s=="r_")reload(path);
else if (s=="0_"){
	if (topwin.CURSOR&&topwin.CURSOR.ison()) {
		topwin.CURSOR.zero();
	}
//topwin.CURSOR.set();
}
else if (s=="b_"){

if (path=="//"||path==="/") return;
let arr = path.split("/");
arr.pop();
let opts = {WINARGS: {X: topwin.x, Y:topwin.y, WID: Main.w, HGT: Main.h, BOTTOMPAD: topwin._bottompad}};
if (topwin._savecb) {
	opts.SAVE_CB = topwin._savecb;
	opts.SAVE_FOLDER_CB = topwin._savefoldercb;
}
topwin.easy_kill();
Desk.open_file_by_path(arr.join("/"), null, opts);

}
else if (s=="s_"||s=="s_C"){

//EJMNCYLKIFB
if (topwin._savecb) {
//log("GOT SAVECB");
	topwin._savecb(topwin);
//	topwin._savecb = null;
}
else{
//log("NO SAVECB");

}

}
else if (s==="TAB_"){

if (savebut) {
e.preventDefault();
let act = document.activeElement;

if (act===savebut) canbut.focus();
else {
//log("?");
	savebut.focus();
}
}
}
}//»
this.onkill = function(if_reload, if_force) {//«
	if (if_force){
		if (topwin._savecb) {
//cwarn("HAVE SAVECB");
			topwin._savecb(null, 1);
			topwin._savecb = null;
		}
	}
	icondv.del();
}//»
this.onresize = function() {//«

	if (FOOTER_HGT) Main.h=_Main.h-FOOTER_HGT;

	let cur = topwin.CURSOR;
	if (!cur) return;
	let icn = Main.lasticon;
	if (!icn) return;
	icn.scrollIntoViewIfNeeded();
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

