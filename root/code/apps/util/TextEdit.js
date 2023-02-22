export const app = function(arg) {


//Imports«
/*
let Desk = arg.DESK;
let Core = arg.CORE;
let log = Core.log;
let cwarn = Core.cwarn;
let cerr = Core.cerr;

let globals = Core.globals;
let widgets = globals.widgets;
let fs = globals.fs;
let util = globals.util;
let make_popup = widgets.make_popup;
let poperr = widgets.poperr;
let KC = util.Tools["KC"];
let kc = util.kc;
let make = util.make;
let ks2str = util.keysym_to_str;
*/
//log(gui);

const {Core, Main, NS}=arg;
const{log,cwarn,cerr, globals}=Core;
const{util}=globals;
const{make}=util;
const fsapi=NS.api.fs;

//const topwin = Main.top;

let main = Main;

let win = Main.top;
let topwin = win;

const statbar = topwin.status_bar;

let winid = arg['WINID'];

//»

//Vars«

const EXTENSIONS=[
	'txt', 
	'sh', 
	'js', 
	'json', 
	'app', 
	'html', 
	'css', 
	'synth'
];
let USE_EXT = 0;

//let is_saving;
//let cur_save_folder;

let thisobj = this;
let yes_cb, no_cb;
let popdiv;
let current_bytes;
let modified = false;
let focused = false;

let area = make('textarea');
//area.spellcheck=false;
area.onmousedown=function(e) {
	e.stopPropagation();
}

win.area = area;
//log(arg.WID);
//»

//OBJ/CB«

//OVERRIDE«
this.can_override = true;
this.overrides = {
	's_A': 1,
	'b_CAS': 1
};//»
//SYMS«

var keysym_map = {
    's_A': {"ON":1,"DESC":"Save file","NAME":"write_file"}
};

var keysym_funcs = {//«
    "write_file":function() {save_context_cb();}
}//»

//»
this.onresize = function() {//«
//	area.w=main.w; 
//	var diff = 0;
//	area.h=parseInt(main.h) - diff; 
//	if (popdiv) Core.api.center(popdiv, main);
}//»
this.onfocus = function() {//«
	if (topwin.cur_save_folder){
		setTimeout(()=>{
			if(topwin.cur_save_folder) topwin.cur_save_folder.winon();
		},10);
		return;
	}
	if (modified) return;
	focused = true;
	if (win.area) {
		win.area.disabled = false;
		win.area.focus();
	}
}//»
this.onblur = function() {//«
	if (modified) return;
	focused = false;
	if (win.area) {
		win.area.disabled = true;
		win.area.blur();
	}
}
//»
this.kill = function(cb) {//«
}//»
this.onloadfile=function(bytes, if_dump) {//«

	if (!bytes) return;
//	if (text.buffer) text = text.buffer;
    let text = Core.api.bytesToStr(bytes);
	area.value = text;
	area.setSelectionRange(0,0);
}
//»
this.winsave = save_context_cb;
this.set_details = function(name, path, ext) {//«
	topwin.set_winname(name);
	topwin.path=path;
	topwin.ext=ext;
	delete topwin.nosave;
}//»
this.gettext = function() {//«
	return area.value;
}//»
this.getbytes = async function(cb) {//«
	if (!cb) {
cwarn("TextEdit: called getbytes() without a callback!");
return;
	}
	cb(await Core.api.blobAsBytes(new Blob([win.area.value],{type:"blob"})));
}//»

this.onmodified = function(bytesarg) {//«
	current_bytes = bytesarg;
	if (modified) return;

//console.error("obj.modified HAS BEEN CALLED!");
//return;

//	popdiv = globals.widgets.make_popup({STR:"The file has been modified.<br>Reload it now?", TYP:"yesno"},null, main);
	popdiv = globals.widgets.make_popup({STR:"The file has been modified.<br>Reload it now?", TYP:"yesno", WIN: main});
	modified = true;
	yes_cb = function() {
		yes_cb = null;
		no_cb = null;
		popdiv.del();
		popdiv = null;
		area.value = Core.api.bytesToStr(current_bytes);
		if (focused) area.disabled = false;
		modified = false;
	}
	popdiv.ok_button.onclick = yes_cb;
	no_cb = function() {
		yes_cb = null;
		no_cb = null;
		popdiv.del();
		popdiv = null;
		if (focused) {
			area.disabled = false;
			area.focus();
		}
		modified = false;
	}
	popdiv.cancel_button.onclick = no_cb;
	area.disabled = true;

}//»
/*
this.key_handler = function(sym, e, ispress, code, mod) {//«
	if (modified) {
		if (sym=="ENTER_") {
			yes_cb();
		}
		return;
	}
	var gotobj = keysym_map[sym];
	var gotfunc;
	if (gotobj) {
		gotfunc = keysym_funcs[gotobj.NAME]
		if (!gotfunc) {
			return cerr("No keysym_func for: <"+str+">  ("+gotobj.NAME+")");
		}
		gotfunc();
	}
else if (sym=="a_C"){
//log("HI");
area.select();
}
}//»
*/
this.onescape=()=>{

if (area.selectionStart!==area.selectionEnd) {
	area.selectionEnd = area.selectionStart;
	return true;
}

};
this.onkeydown=(e,k)=>{
//log(e);
	if (k=="s_C"){
		save_context_cb();
	}
	else if (k=="TAB_"){
		e.preventDefault();
		if (area.selectionStart===area.selectionEnd) area.setRangeText("\x09",area.selectionStart,area.selectionStart,'end');
	}
};
this.get_context = function() {
//log(document.activeElement);
	area.blur();
//setTimeout(()=>{
//log(document.activeElement);
//}, 500);
	let as="";
	if (!topwin._fullpath) as = "\xa0as...";
	let arr = [`Save${as}`, save_context_cb]
	if (!topwin._fullpath){
		let ext = EXTENSIONS[USE_EXT];
		arr.push("Set\xa0Ext");
		let ext_func_arr=[];
		for (let i=0; i < EXTENSIONS.length; i++){
			if (i===USE_EXT) continue;
			ext_func_arr.push(EXTENSIONS[i],()=>{USE_EXT = i;});
		}
		arr.push(ext_func_arr);
		arr.push(`Current\xa0Ext:\xa0${ext}`,null);
	}
	return arr;
};

//»

//Funcs«


async function save_context_cb() {//«

if (globals.read_only){
	globals.widgets.poperr("Cannot save in 'read only' mode");
	return;
}

if (topwin._fullpath){
	let rv = await fsapi.writeFile(topwin._fullpath, area.value, {NOMAKEICON: true});
	if (!rv) {
cwarn("Nothing returned!?!?!?");
	return;
	}
	statbar.innerText = `${rv.file.size} bytes written`;
}
else{
	await Core.Desk.api.saveAs(topwin, area.value||"", EXTENSIONS[USE_EXT]);
}


}//»
function get_win_path() {//«
	if (!topwin.path) return null;
	var path = topwin.path+"/"+topwin.name
	if (topwin.ext) path += "."+topwin.ext;
	return path;

}//»

//»

//DOM Maker«
win.over="hidden";
main.over="hidden";
area.bgcol="#211";
area.tcol="#EEEEEE";
area.bor="1px solid #322";

area.style.resize = "none";
area.ff="monospace";
area.fs=20;
area.fw=600;
main.tcol="black";
//area.w=main.w;
//area.h=main.h;
area.w="100%";
area.h="100%";
area.win = win;
area.style.outline = "none";
main.area = area;
win.area = area;
main.add(area);
//»



}


