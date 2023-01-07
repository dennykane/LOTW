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
let is_saving;
let cur_save_folder;

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
//if (topwin.modified) 
if (is_saving){
//cwarn("is_saving == true");
if (!cur_save_folder){
cerr("NO cur_save_folder!!!!");
return;
}
setTimeout(()=>{
if(cur_save_folder) cur_save_folder.winon();
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
this.blurwin = function() {//«
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

this.modified = function(bytesarg) {//«
	current_bytes = bytesarg;
	if (modified) return;

console.error("obj.modified HAS BEEN CALLED!");
return;

	popdiv = make_popup({STR:"The file has been modified.<br>Reload it now?", TYP:"yesno"},null, main);
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

if (k=="s_C"){
save_context_cb();
}
else if (k=="TAB_"){
e.preventDefault();
if (area.selectionStart===area.selectionEnd) area.setRangeText("\x09",area.selectionStart,area.selectionStart,'end');
}

}

this.get_context = function() {
	return ["Save...", save_context_cb]
//	return ["Save...", save_context_cb, "Nothing", ["Blar",()=>{},"Food",null]]
}

//»

//Funcs«

function dosave(path, obj) {//«
//	if (topwin.iconlink && topwin.iconlink.match(/^\/dev\//)) return poperr("Looks like this file is from '/dev' !");
	if (!path) path = get_win_path();
	let arr = path.split("/");
	let fname = arr.pop();
	let parpath = arr.join("/");
	fs.ptw(parpath, parfobj=>{
		function doit(ret) {//«
			if (ret) {
				if (obj) {
//					let parobj = obj.PAR;
					topwin.set_winname(obj.WINNAME);
					topwin.name = obj.WINNAME;
					topwin.path = obj.PATH;
					topwin.ext = obj.EXT;
					delete topwin.nosave;
				}
				Desk.saveflash(topwin);
				Desk.make_icon_if_new(path, topwin);
			}
			else poperr("Could not save the file!");
		}//»
		if (!(parfobj&&parfobj.KIDS)) return poperr(parpath+":could not get the parent file system object");
		var rtype = parfobj.root.TYPE;
		if (rtype=="fs") {
			if (!fs.check_fs_dir_perm(parfobj)) {
				poperr("Permission denied");
				return Desk.saveflasherr(topwin);
			}
			fs.savefile(path, area.value, doit, {WINID: winid});
		}
		else if (rtype=="remote") {
			if (!fs.check_user_perm(parfobj)) return poperr("Cannot modify the remote file");
			fs.save_remote(path, area.value, doit);
		}
		else if (rtype=="local") poperr("Not (yet) handling saving to local services!");
		
		else poperr("What filesystem type: " + rtype);
	});
}//»
function got_save_ok(arg, cb) {//«
	if (!arg) return;
	var obj = arg.SUCC;
	if (obj) {
		var fullpath = obj.PATH+"/"+obj.FULLNAME;
		if (obj.OBJ) poperr("The file exists!");
		else dosave(fullpath, obj);
	}
	else if (arg.ERR) poperr(arg.ERR);
}//»
async function save_context_cb() {//«

if (topwin._fullpath){
	let rv = await fsapi.writeFile(topwin._fullpath, area.value, {NOMAKEICON: true});
	if (!rv) {
cwarn("Nothing returned!?!?!?");
	return;
	}
	statbar.innerText = `${rv.entry._currentSize} bytes written`;
}
else{

is_saving = true;

Core.Desk.open_file_by_path(globals.home_path, null, {
	SAVE_FOLDER_CB: fwin=>{cur_save_folder = fwin;},
	SAVE_CB:async (fwin)=>{
		if (!fwin){
			is_saving = false;
			cur_save_folder = null;
			return;
		}
		let icn = await Core.Desk.make_new_file(area.value||"","txt", fwin._fullpath, fwin);
		if (!icn ) {
cwarn("GOT NO ICON AFTER Desk.make_new_file!!!");
			cur_save_folder.force_kill();
		}
		else {
//log(icn._entry);
			icn.parwin.force_kill();
			topwin._fullpath = icn.fullpath();
			topwin.title = icn.name;
			statbar.innerText = `${icn._entry._currentSize} bytes written`;
		}
		is_saving = false;
		cur_save_folder = null;
		area.focus();
	}
});

}

//	if (!topwin.path) win.nosave=true;
//	if (win.nosave) Desk.save_dialog(win, got_save_ok, ["txt","sh","js","json"]);
//	else dosave();

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

