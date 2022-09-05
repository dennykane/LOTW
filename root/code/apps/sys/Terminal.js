/*

@ODJTBQIKXH 
XXX IS IT CORRECT TO DO: 'if (y>=h) {' XXX???

Just added the math to include num_stat_lines inside of scroll_into_view().
Whenever we've had stat_lines before, we've never needed to call scroll_into_view(), because
it has always been in vim or less, where we had a completely different control flow of
how to handle keypresses and output.


Looking for a way, in normal shell mode, to subract n (1, maybe 2) lines from the bottom of
the screen to use it as a output area for instructions/status related to the given 
'getch_loop' mode that a command might be doing. How does vim/less do the status line thing
anyway?

OK: In this.getch_loop, we added an nstatlns arg (like in this.init_edit_mode), which lets us
use the bottom nstatlns of the screen as a quick and dirty status/app messaging area.
Now we have a this.stat_render, which lets us set the stat_lines array, then do a render.

In the render loop @PDJNUWLKH, we do a regex to negative lookahead with <'s, to see that
it is not a span tag (slosing or opening). So, all non-span-tag <'s get replaced with "&lt;".

Also, all &'s are being turned into &amp;'s.

*/
//METACHAR_ESCAPE: This escapes the shell's metacharacters when autocompleting
/*

TYhdlT65: When typing Ctrl+d during app mode, we need to send an EOF, and let the current
command finish on its own terms!

*/
/*«

Step 1) Tidy up terminal, so that 'fs.' => '(await)? fsapi.'//«


FS444: get_dir_contents, if it is type==fs and it isn't "done"
FS666: get_dir_contents, if not above, but there are no kids and we are not remote or local (maybe /serv?) 
fs.populate_dirobj => api.popDir //Given a node

FS555: get_dir_contents, and no kids with remote or local
fs.populate_rem_dirobj => api.popDir

FS777: TAB gives one result that is a Folder
fs.populate_dirobj_by_path => api.populateDirObjByPath

FS888: TAB gives one result that is a Link, then...
fs.path_to_obj => api.pathToNode




//»

Step 2) Implement a minimal fs//«
pathToNode
popDir //Given a node
populateDirObjByPath
readHtml5File
//»

Step 3) Implement a minimal shell//«

shell = new mods["util.shell"](Core, termobj);

shell.execute(str, cur_dir, {init:if_init, root:root_state})
	returns Promise that resolves to return value (non-zero is error)

//Minimal echoing shell
this.execute = (runcom, dir_arg, opts={}) => {
	return new Promise((Y,N)=>{
		//response({SUCC:wrap_line(runcom).split("\n")});
		response({SUCC:fmt(runcom).split("\n")});
		Y(0);
	});
}

...then do a basic 'ls', etc.
//»

Step 4) Implement simple interfaces to vim, less, man, help, etc.


»*/

//Development COM/LIB/MOD deleting«

const DEL_COMS=[
"bin.dummy"
]
const DEL_LIBS=[
//	"math.trading",
//	"admin"
//	"wasm"
//	"synth",
//	"net",
//	"fs",
	"net.hn",
	"dev.testing",
//	"js",
//	"iface",
	"av"
//	"crypto",
//	"imap"
];
const DEL_MODS=[
//	"math.trading",
//	"sys.idb",
//	"iface.net",
	"sys.fs",
	"util.shell",
//	"util.esmangle",
//	"av.tone",
//	"util.vim",
//	"util.pager"
];
//»
//Issues«

/*

Example of using 'wout' to print an error message with darkish red background
wout("Unknown size",{color:["","#a00"],error:1});

Doing encrypt, which might call read_stdin, thisline looks like [""]. How does this null
string get in lines? Also, what puts a single space in? 
//GHTYEKS
		else if (!if_force_nl && thisline.length == 1 && thisline[0]==" ") lines[lines.length-1] = outi.split("");
*/
///XXX BADBUG123 (Found 1/23/20 @7:30am)
//»

export const app = function (arg) {

//Imports/Decs«

//const fsapi = NS.api.fs;

let fsapi;
const {Core, Main, NS}=arg;

const init_str = arg.INIT;
const init_cb = arg.INIT_CB;
let did_init = false;
const global_winname = arg.window_name;
const{api:capi,KC,kc,log,cwarn,cerr,globals, Desk}=Core;
const{util,FOLDER_APP}=globals;
const{strnum,isstr,isnum,make}=util;

const main = Main;
const topwin = main.top;
const winid = topwin.id;
const init_prompt = arg.PROMPT||globals.name.NAME+`\x20(${winid.replace("_","#")})`;

const termobj = this;
termobj.winid = winid;
termobj.topwin = topwin;
termobj.num_prompts=0;



//»
//Var«

const ENV = {PATH:"/bin"}

let is_scrolling = false;
let wheel_iter;
let dblclick_timeout;
let downevt=null;

let MAX_TAB_SIZE=256;
let awaiting_remote_tab_completion = false;
//const com_completers = ["help","man", "examples"];
const com_completers = ["app","lib","import"];
const STAT_OK=1;
const STAT_WARNING=2;
const STAT_ERROR=3;
let nrows, ncols;
let x=0, y=0;
let w,h;
let xhold,yhold;
let hold_x, hold_y;

let editor;
let pager;
let app_input_cb;
let app_cb;
let app_prompt;

let num_ctrl_d = 0;
let CLEAN_COPIED_STRING_MODE = false;
let DO_EXTRACT_PROMPT = true;
const MAX_OVERLAY_LENGTH = 42;
let TERMINAL_IS_LOCKED = false;
let buffer_scroll_num = null;
let buffer_hold;
let line_height;

let FF = "monospace";
let FW = "500";
let CURBG = "#00f";
let CURFG = "#fff";
let OVERLAYOP = "0.75";
let TCOL = "#e3e3e3";

let topwin_focused = true;
let no_prompt_mode = false;
let overlay_str = '<div style="opacity: '+OVERLAYOP+';border-radius: 15px; font-size: xx-large; padding: 0.2em 0.5em; position: absolute; -webkit-user-select: none; transition: opacity 180ms ease-in; color: rgb(16, 16, 16); background-color: rgb(240, 240, 240); font-family: monospace;"></div>';

let getch_cb=null;
let getch_loop_cb=null;
let min_height;

let com_scroll_mode = false;

let num_stat_lines = 0;
let num_lines = 0;
let scroll_num = 0;
let scrollnum_hold;
let seek_stops=[];

let min_fs = 8;
let def_fs = 24;
let gr_fs;

this.scroll_num = scroll_num;
this.file_objects = {};
this.dirty = {};
this.ENV = ENV;
this.FUNCS={};
this.ALIASES={};

let echo_mode = true;

let kill_funcs = [];
let add_com = null;
let max_scroll_num=50;
let max_fmt_len = 4997;

let last_com_str=null;
let last_mode;

let root_state = null;
let cur_shell = null;
let shell = null;
let term_mode = "shell";
let ls_padding = 2;
let await_next_tab = null;

let command_return = [];
let cur_prompt_line = 0;
let line_continue_flag = false;
let cur_scroll_command;
let prompt_str;
let prompt_len;
let buf_lines = [];
let shadow_lines;
let lines = [];
let line_colors = [];
let lines_hold_2;
let lines_hold;
let line_colors_hold;

let current_cut_str = "";

let buffer = [];

let command_hold = null;
let command_pos_hold = 0;
let bufpos = 0;

let sleeping = null;

let cur_ps1;
let cur_prompt="$";
let cur_dir;

//»
//Key Syms«
this.can_override = true;
this.overrides = {//«
	"UP_C": 1,
	"DOWN_C": 1,
	"LEFT_C": 1,
	"RIGHT_C": 1,
	"UP_CA": 1,
	"DOWN_CA": 1,
	"LEFT_CA": 1,
	"RIGHT_CA": 1,
	"h_CAS": 1,
	"d_CAS": 1,
	"c_CAS": 1,
	"o_CAS": 1,
	"l_C": 1,
	"k_C": 1,
	"l_A":1,
//	"c_A":1
};//»
//»
//Obj/CB«

this.set_shell=arg=>{shell = arg;};
this.set_tab_size = (s)=>{//«
	if (!s.match(/[0-9]+/)) return;
	let n = parseInt(s);
	if (n==0||n>MAX_TAB_SIZE) return;
	tabdiv.style.tabSize = n;
	this.tabsize = tabdiv.style.tabSize;
	return true;
};//»
this.set_desk = arg=>{Desk = arg;}
this.onescape=()=>{//«
	textarea.focus();
	if (check_scrolling()) return true;
	let dorender=false;
	if (buffer_scroll_num !== null) {
		buffer_scroll_num = null;
		x = hold_x;
		y = hold_y;
		dorender = true;
	}
//YTUR
	if (dorender) return true;
	return false;
}
//»
this.is_busy=_=>{return !!cur_shell;}
this.onsave=_=>{//«
	if (editor) editor.save();
}//»
this.closewin=_=>{topwin.force_kill();}
this.try_kill=_=>{//«
	if (editor) {
		editor.set_stat_message("Really close the window? [y/N]");
		render();
		editor.set_ask_close_cb();
	}
}//»
this.onkill = (if_dev_reload)=>{//«
	let keys = Object.keys(termobj.file_objects);
	for (let k of keys) {
		let fobj = termobj.file_objects[k];
		if (fobj.kill) fobj.kill();
	}
	Core.set_appvar(topwin, "BUFFER", buffer);
	execute_kill_funcs();

if (if_dev_reload) {
	delete_mods();
	delete_libs();
	delete_coms();
}
}//»
this.close=_=>{//«
	if (topwin && topwin.close) {
		topwin.force_kill();
	}
}//»
this.onappinit=()=>{
	topwin.attset("did-init","");
};
this.onfocus=()=>{//«
	topwin_focused=true;
	if (cur_scroll_command) insert_cur_scroll();
	render();
	textarea.focus();
}//»
this.onblur=_=>{//«
	topwin_focused=false;
	render();
	textarea.blur();
	if (cur_scroll_command) insert_cur_scroll();
}//»
this.set_password_mode=_=>{//«
	echo_mode = false;
	shadow_lines = [];
}//»
this.set_root_state = (which)=>{//«
	root_state = which;
}//»
this.kill_register = (funcarg)=>{//«
	kill_funcs.push(funcarg);
}//»
this.kill_unregister = (funcarg)=>{//«
	let which = kill_funcs.indexOf(funcarg);
	if (which < 0) {
console.error("Could not find the funcarg");
		return;
	}
	kill_funcs.splice(which, 1);
}//»
this.getch = (cb)=>{getch_cb = cb;}
this.getch_loop = (cb, nstatlns, minhgt)=>{
	if (cb){
		if (nstatlns) {
			if (y+nstatlns >= h){
				let diff = h - (y + nstatlns+1);
				y+=diff;
				scroll_num-=diff;
			}
			num_stat_lines = nstatlns;
		}
		if (minhgt) min_height = minhgt;
	}
	else {
		num_stat_lines = 0;
		stat_lines = null;
		min_height = null;
	}
	getch_loop_cb = cb;
	render();
}
/*
this.lock_term = ()=>{//«
//	if (TERMINAL_IS_LOCKED) return;
//	TERMINAL_IS_LOCKED = true;
	do_ctrl_C();
	lines[cy()]="The system is locked! Is it open in another tab?".split("");
	scroll_into_view();
	render();
}//»
*/
this.set_blob_drops=arr=>{//«
let blobs = ENV["BLOB_DROPS"]||[];
blobs=blobs.concat(arr);
ENV["BLOB_DROPS"]= blobs;
do_fs_overlay("Blob drops handled (have "+blobs.length+")");
};//»
this.set_seek_stop=()=>{seek_stops.push(scroll_num+y);};
//»
//DOM«

const SCISSORS_ICON = "\u2702";

let fakediv = make('div');
fakediv.innerHTML = overlay_str;
let fs_overlay = fakediv.childNodes[0];
fs_overlay.id = "overlay_"+winid;
let fs_overlay_timer = null;
let overdiv = make('div');
overdiv.pos="absolute";
overdiv.loc(0,0);
overdiv.w="100%";
overdiv.h="100%";
overdiv.onmousemove = e=>{
	e.stopPropagation();
	if (Desk) Desk.mousemove(e);
};

topwin.overdiv=overdiv;

let wrapdiv = make('div');
wrapdiv.id="termwrapdiv_"+winid;
wrapdiv.bgcol="#000";
wrapdiv.pos="absolute";
wrapdiv.loc(0,0);
wrapdiv.tcol = TCOL;
wrapdiv.fw = FW;
wrapdiv.ff = FF;
wrapdiv.style.whiteSpace = "pre";
main.onscroll=e=>{
	e.preventDefault();
	scroll_middle();
};


main.onwheel=e=>{
	if (term_mode=="shell" && !sleeping){
		let dy = e.deltaY;
		if (!is_scrolling){
			if (!scroll_num) return;
			if (dy > 0) return;
			scrollnum_hold = scroll_num;
			is_scrolling = true;
			wheel_iter = 0;
		}
let skip_factor = 10;
if (ENV.SCROLL_SKIP_FACTOR){
let got = ENV.SCROLL_SKIP_FACTOR.ppi();
if (!Number.isFinite(got)) cwarn(`Invalid SCROLL_SKIP_FACTOR: ${ENV.SCROLL_SKIP_FACTOR}`);
else skip_factor = got;
}

		wheel_iter++;
		if (wheel_iter%skip_factor) return;
		if (dy < 0) dy = Math.ceil(4*dy);
		else dy = Math.floor(4*dy);
if (!dy) {
cwarn("SKIP", dy);
	return;
}
		scroll_num += dy;
		if (scroll_num < 0) scroll_num = 0;
		else if (scroll_num >= scrollnum_hold) {
			scroll_num = scrollnum_hold;
			is_scrolling = false;
		}
		render();
	}
};

main.appendChild(wrapdiv);

let tabdiv = make('div');
tabdiv.id="termtabdiv_"+winid;
tabdiv.w="100%";
tabdiv.style.userSelect = "text"
tabdiv.pos="absolute";
tabdiv.onmousedown=(e)=>{downevt=e;};
tabdiv.onmouseup=e=>{
	if (!downevt) return;
	let d = Core.api.dist(e.clientX,e.clientY,downevt.clientX, downevt.clientY);
	if (d < 10) return;
	focus_or_copy();
};
tabdiv.onclick=e=>{
	e.stopPropagation();
	if (dblclick_timeout){
		clearTimeout(dblclick_timeout);
		dblclick_timeout=null;
		setTimeout(focus_or_copy,333);
		return;
	}
	setTimeout(focus_or_copy,500);
}
tabdiv.ondblclick=e=>{e.stopPropagation();dblclick_timeout=setTimeout(focus_or_copy,500);}

tabdiv.loc(0,0);
tabdiv.style.tabSize = 4;
this.tabsize = tabdiv.style.tabSize;

wrapdiv.tabdiv = tabdiv;
wrapdiv.appendChild(tabdiv);

let textarea = make('textarea');//«
textarea._noinput = true;
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
main.tcol="black";
main.bgcol="black";
main.appendChild(areadiv);
textarea.focus();
const handle_insert=val=>{
	let arr = val.split("");
	let gotspace = false;
	for (let ch of arr) {
		let code = ch.charCodeAt();
		if (!(code >= 32 && code <= 126)) {
			if (code==10) continue;
			code = 32;
		}
		if (code==32) {
			if (gotspace) continue;
			gotspace = true;
		}
		else gotspace = false;
		handle_priv(null,code, null, true);
	}
};
this.handle_insert=handle_insert;
function dopaste(){//«
	let val = textarea.value;
	if (val && val.length) {
		if (editor) {
			let arr = val.split("\n");
			if (arr.length>1 && arr[0]==="") arr.shift();
			editor.insert_lines(arr);
			render();
		}
		else {			
			handle_insert(val);
		}
	}
	textarea.value="";
}
this.dopaste=dopaste;
//»
textarea.onpaste = e=>{//«

if (pager) return;
textarea.value="";
setTimeout(()=>{
	let val = textarea.value;
	if (!(val&&val.length)) return;
	if (editor) {
		editor.check_paste(val);
	}
	else dopaste();
}
,25);

}//»
//»

main.onclick=()=>{textarea.focus();}
this.mainwin = main;

//»
//Render«
let stat_lines;
const render=()=>{//«

const diagnose=n=>{
/*
//let val = Math.floor(100*real_lines[scroll_num]/(real_lines[lines.length-1]||real_lines[lines.length-2]));
console.error(`NAN${n}`);
log("scroll", scroll_num);
log("usescroll", usescroll);
log("lines.length",lines.length);
log(real_lines);
*/
};

	let actor = editor||pager;
	if (actor) ({x,y,scroll_num}=actor);
	let visual_line_mode;
	let visual_block_mode;
	let visual_mode;
	let macro_mode;
	let seltop;
	let selbot;
	let selleft;
	let selright;
	let selmark;
	let stat_input_mode;
	let stat_com_arr;
	let stat_message, stat_message_type;
	let error_cursor;
	let real_lines;
	let real_line_mode=false;
	let show_marks;
	let opts = {};
	if (actor) ({stat_input_mode,stat_com_arr,stat_message,stat_message_type,real_line_mode}=actor);
	if (!stat_input_mode) stat_input_mode="";
	if (editor) ({macro_mode,visual_block_mode,visual_line_mode,visual_mode,show_marks,seltop,selbot,selleft,selright,selmark,error_cursor,real_lines, opts}=editor);
	if (!(ncols&&nrows)) return;

	let docursor = false;
	if (opts.nocursor){}
	else if (!TERMINAL_IS_LOCKED) docursor = true;


	let usescroll = scroll_num;
	let is_buf_scroll = false;
	if (buffer_scroll_num!==null) {
		usescroll = buffer_scroll_num;
		is_buf_scroll = true;
	}
	let scry=usescroll;
	let slicefrom = scry;
	let sliceto = scry + nrows;
	let uselines=[];
	let is_str = false;
	let xoff = 0;
	if (editor) xoff = Math.floor(x/w)*w;
	let usex = x;
	usex = x-xoff;

	let reclines=null;
	if (this===globals.termrec_termobj) reclines=[];

	for (let i=slicefrom; i < sliceto; i++) {
		let ln = lines[i];
		if (!ln) {
			if (editor) {
				if (reclines) uselines.push(['~']);
				else uselines.push(['<span style="color: #6c97c4;">~</span>']);
			}
			else uselines.push([""]);
		}
		else {
			let arr = ln.slice(xoff,xoff+w);
			let newln = arr;
			newln.tcolor = ln.tcolor;
			newln.marks = ln.marks;
			uselines.push(newln);
		}
	}

	let outarr = [];
	let donum;
	let len = uselines.length;
	let reccols;
	if (reclines) reccols={};
	if (len + num_stat_lines != h) {
		donum = h - num_stat_lines;
	}
	else donum = len;
	for (let i = 0; i < donum; i++) {//«
		let ind;
		let arr = uselines[i];
		while((ind=arr.indexOf("&"))>-1) arr[ind] = "&amp;";
		while((ind=arr.indexOf("<"))>-1) arr[ind] = "&lt;";
		while((ind=arr.indexOf(">"))>-1) arr[ind] = "&gt;";
		if(reclines) reclines.push(arr.join(""));

		let marks=null;
		if (!arr||(arr.length==1&&!arr.marks&&arr[0]=="")) arr = [" "];
		if (editor && show_marks && arr.marks) marks = arr.marks
		let gotit = arr.indexOf(null);
		if (gotit > -1) arr[gotit] = " ";
		let curnum = i+usescroll;
		let colobj = line_colors[curnum];
		if (reclines) reccols[i] = colobj;
		if ((visual_line_mode||visual_mode||visual_block_mode)&&seltop<=curnum&&selbot>=curnum){//«
			if (visual_line_mode) {
				let ln_min1 = arr.length-1;
				if (ln_min1 == -1) ln_min1=0;
				arr[0] = '<span style="background-color:#aaa;color:#000;">'+(arr[0]||" ");
				arr[ln_min1] = (arr[ln_min1]||" ")+'</span>';
			}
			else if (visual_mode){
				let useleft, useright;
				if (seltop==curnum && selbot==curnum){
					useleft = selleft;
					useright = selright;
				}
				else if (curnum > seltop && curnum < selbot){
					useleft = 0;
					useright = arr.length-1;
				}
				else if (seltop===curnum){
					useright = arr.length-1;
					useleft = (curnum==cy())?x:selmark;
				}
				else if (selbot===curnum){
					useleft = 0;
					useright = (curnum==cy())?x:selmark;
				}
				else{
					throw new Error("WUTUTUTU");
				}
				let str = '<span style="color:#000;background-color:#aaa;">'+(arr[useleft]||" ");
				arr[useleft]=str;
				if (useright == -1) useright = 0;
				if (arr[useright]) arr[useright] = arr[useright]+"</span>";
				else arr[useright] = "</span>";
			}
			else {
				let str = '<span style="color:#000;background-color:#aaa;">'+(arr[selleft]||"");
				arr[selleft]=str;
				if (arr[selright]) arr[selright] = arr[selright]+"</span>";
				else arr[selright] = "</span>";
			}
		}//»
		else if (arr[0]=="\xd7"){
			arr[0]=`<span style="color:rgb(95,215,255);">${arr[0]}`
			arr[arr.length-1]=`${arr[arr.length-1]}</span>`;
		}
		else if (colobj){//«
			let nums = Object.keys(colobj);
			for (let numstr of nums) {
				if (numstr.match(/^_/)) continue;
				let num1 = parseInt(numstr)-xoff;
				let obj = colobj[numstr];
				let num2 = num1 + obj[0]-1;
				let col = obj[1];
				let bgcol = obj[2];
				let str = '<span style="color:'+col+";";
				if (bgcol) str += "background-color:"+bgcol+";"
				if (!arr[num1]) str += '"> ';
				else str += '">'+arr[num1];
				arr[num1] = str;
				if (arr[num2]) arr[num2] = arr[num2]+"</span>";
				else arr[num2] = "</span>";
if (num2 > w) {
//console.log("LONGLINE");
	break;
}
			}
		}//»
		if (marks){//«
			for (let s of marks){
				let pos = s.ln.indexOf(s);
//log(s,pos);
				if (pos >= 0) {
					let str=arr[pos];
					let tag1 = "";
					let tag2 = "";
					let marr;
					if (marr=str.match(/^(<.+>)(.)$/)) tag1 = marr[1];
					else if (marr=str.match(/^(.)(<.+>)$/)) tag2 = marr[2];
					let usebg = "#ccc";
					let usefg="#000";
					let usech = s.mark||" ";
					if (!(pos==usex&&i==y)) arr[pos] = tag1+'<span style="background-color:'+usebg+';color:'+usefg+';">'+usech+"</span>"+tag2;
				}
			}
		}//»

		if (!(pager||is_buf_scroll||stat_input_mode||is_scrolling)) {//«
//		if (!(pager||is_buf_scroll||stat_input_mode||scroll_cursor_mode)) {
//			if (docursor && i==y && topwin_focused) {
			if (docursor && i==y) {
				if (!arr[usex]||arr[usex]=="\x00") {
					arr[usex]=" ";
				}
				else if (arr[usex]=="\n") arr[usex] = " <br>";
				let usebg = CURBG;
//				if (ssh_mode) usebg = "red";
				let ch = arr[usex]||" ";
				let pre="";
				let usech;
				if (ch.match(/^</)&&!ch.match(/>$/)){
					let arr = ch.split(">");
					usech = arr.pop();
					pre = arr[0]+">";
				}
				else usech = ch;
				if (!usech.length) usech = " ";
				let sty;
				if (topwin_focused) sty = `background-color:${usebg}`;
				else sty=`border:1px solid ${usebg}`;
				arr[usex] = pre+`<span id="cursor_${winid}" style="${sty}">${usech}</span>`;
			}
		}//»
		else if (error_cursor) {//«
			if (i+usescroll == error_cursor[0]) {
				let str = '<span style="color:#fff;background-color:#f00;"';
				let num1 = error_cursor[1];
				if (!arr[num1]) str += '"> ';
				else str += '">'+arr[num1];
				arr[num1] = str+"</span>";
			}
		}//»

		outarr.push(arr.join(""));
	}//»
	if (actor) {//«
		let usestr;
		let recstr;
		if (stat_input_mode) {
			let arr,ind;
		
			if (!stat_com_arr.slice) arr = [];
			else arr = stat_com_arr.slice();
			while((ind=arr.indexOf("&"))>-1) arr[ind] = "&amp;";
			while((ind=arr.indexOf("<"))>-1) arr[ind] = "&lt;";
			while((ind=arr.indexOf(">"))>-1) arr[ind] = "&gt;";
			if (!arr[x]) arr[x] = " ";
			let arrstr=arr.join("");
			arr[x] = '<span style="background-color:'+CURBG+';color:'+CURFG+'">'+arr[x]+"</span>";
			if (visual_line_mode) {
				usestr = `${stat_input_mode}'&lt;,'&gt;${arr.join("")}`;
				if (reclines) recstr = arrstr;
			}
			else {
				usestr = stat_input_mode + arr.join("");
				if (reclines) recstr = stat_input_mode + arrstr;
			}
		}
		else if (editor) {//«
			let mess="", messtype, messln=0;
			let recmess="";
			if (stat_message) {
				mess = stat_message;
				messln = mess.length;
				mess = mess.replace(/&/g,"&amp;");
				mess = mess.replace(/</g,"&lt;");
				recmess = mess;
				let t = stat_message_type;
				let bgcol=null;
				let tcol="#000";
				if (macro_mode){
					bgcol="#551a8b";
					tcol="#fff";
				}
				else if (t==STAT_OK) bgcol="#090";
				else if (t==STAT_WARNING) bgcol="#dd6";
				else if (t==STAT_ERROR) {
					bgcol="#c44";
					tcol="#fff";
				}
				if (bgcol) mess = '<span style="color:'+tcol+';background-color:'+bgcol+'">'+mess+'</span>';
				editor.unset_stat_message();
			}
			else if (editor.insert) recmess = mess = "-- INSERT --";
			else if (visual_line_mode) recmess = mess = "-- VISUAL LINE --";
			else if (visual_mode) recmess = mess = "-- VISUAL --";
			else if (visual_block_mode) recmess = mess = "-- VISUAL BLOCK --";
			if (mess && !messln) messln = mess.length-7;
			
			let per;
			let t,b;
			if (scroll_num==0) t = true;
			if (!lines[sliceto-1]) b=true;
			if (t&&b) per = "All";
			else if (t) per="Top";
			else if (b) per = "Bot";
			else {
				if (real_lines) {
					let val = Math.floor(100*real_lines[scroll_num]/(real_lines[lines.length-1]||real_lines[lines.length-2]));
					if (isNaN(val)) {
						diagnose(1);
					}
					per = (val)+"%";
				}
				else {
					let val = Math.floor(100*scroll_num/lines.length-1);
					if (isNaN(val)) {
						diagnose(2);
					}
					per = (val)+"%";
				}
			}
			let perln = per.length;
			let perx = w-5;
			try {
				if (perln > 4) per = "?%";
				per = "\x20".repeat(4-perln)+per;
			}
			catch(e){
//cerr("Bad perlen", perln);
//log("per", per);
//log("real_lines",real_lines);
//log("scroll_num",scroll_num);
//log(real_lines[scroll_num]);
//log("lines.length-1",lines.length-1);
//log(real_lines[lines.length-1]);
			}
			let add_one = 1;
			if (real_line_mode) add_one = 0;
			let lncol;
			if (real_lines) {
				let val = real_lines[y+usescroll]+add_one;
				if (isNaN(val)) diagnose(3);
				lncol = (val)+","+(x+add_one);
			}
			else lncol = (y+usescroll+add_one)+","+(x+add_one);
			let lncolln = lncol.length;
			let lncolx = w - 18;
			let diff = lncolx - messln;
			if (diff <= 0) diff = 1;
			let diff2 = (perx - lncolx - lncolln);
			if (diff2 <= 0) diff2 = 1;
			let spaces = "\x20".repeat(diff) + lncol + "\x20".repeat(diff2)+per;
			if (reclines) recstr = recmess + spaces;
			let str = mess + spaces;
			usestr = '<span>'+str+'</span>';

		}//»
		else if (stat_message) {
			recstr = usestr = stat_message;
			stat_message = null;
		}
		else if (pager) {
			let per = Math.floor(100*(usescroll+donum)/lines.length);
			if (per > 100) per = 100;
			recstr = usestr = `${pager.fname} ${per}% of ${lines.length} lines (press q to quit)`;
		}

		if (pager) {
			if (!stat_input_mode) usestr = '<span style=background-color:#aaa;color:#000>'+usestr+'</span>'
		}
		outarr.push(usestr);
		if (reclines) reclines.push(recstr);		
	}//»
	if (stat_lines){
		//for (let ln of stat_lines) outarr.push(ln.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"));
		for (let i=0; i < num_stat_lines; i++){
			let ln = stat_lines[i];
			if (!ln) ln = "";
//PDJNUWLKH
//			outarr.push(ln.replace(/&(?!amp)/g,"&amp;").replace(/<(?!\/?span)/ig,"&lt;").replace(/>/g,"&gt;"));
			outarr.push(ln.replace(/&/g,"&amp;").replace(/<(?!\/?span)/ig,"&lt;"));
		}
	}
	if (min_height && h < min_height){
		tabdiv.innerHTML=`<center><span style="background-color:#f00;color:#fff;">Min height: ${min_height}</span></center>`;
	}
	else tabdiv.innerHTML = outarr.join("\n");
	if (reclines){
		globals.termrec_snap({
			cols:reccols,
			ed:!!editor,
			x:x,
			y:y,
			w:w,
			h:h,
			sim:stat_input_mode,
			lns:reclines
//			time:Math.round(window.performance.now())
		});
	}
};//»
this.stat_render=(arr)=>{
if (arr.length > num_stat_lines){
console.error(`the arr argument has length ${arr.length} (expected <= ${num_stat_lines})`);
return;
}
	stat_lines = arr;
	render();
};
const getgrid=()=>{//«
	let _ = wrapdiv;
	let tdiv = tabdiv;
	if (!(_.w&&_.h)) {
		if (topwin.killed) return;
		return cerr("DIMS NOT SET");
	}
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
};//»

this.refresh = render;

//»
//Util«
const scroll_middle=()=>{
	let y1 = main.scrollTop;
	main.scrollTop=(main.scrollHeight-main.clientHeight)/2;
	let y2 = main.scrollTop;
};
const focus_or_copy=()=>{
	let sel = window.getSelection();
	if (sel.isCollapsed) textarea.focus();
	else do_clipboard_copy();
};
const delete_coms=()=>{
	for (let l of DEL_COMS){
		delete NS.coms[l];
		NS.coms[l]=undefined;
	}
};
const delete_libs=()=>{
	for (let l of DEL_LIBS){
		delete NS.libs[l];
		NS.libs[l]=undefined;
	}
};
const delete_mods=()=>{
	for (let m of DEL_MODS){
		delete NS.mods[m];
		NS.mods[m]=undefined;
	}
};
this.get_cwd=()=>{return cur_dir;};
const get_homedir=()=>{
	if (root_state) return "/";
	return globals.home_path;
};
this.get_homedir = get_homedir;
const get_buffer=(if_str, if_no_buf)=>{//«
	let ret=[];
	if (if_str) ret = "";
	let ln;
	if (!if_no_buf) {
		if (buf_lines) {
			for (let i=0; i < buf_lines.length; i++) {
				ln = buf_lines[i].join("").replace(/\u00a0/g, " ");
				if (if_str) ret +=  ln + "\n"
				else ret.push(ln);
			}
		}
	}
	for (let i=0; i < lines.length; i++) {
			ln = lines[i].join("").replace(/\u00a0/g, " ");
			if (if_str) ret +=  ln + "\n"
			else ret.push(ln);
	}
	return ret;
};
this.real_get_buffer=get_buffer;
this.get_buffer=()=>{return get_buffer();}
//»
const cur_date_str=()=>{//«
	let d = new Date();
	return (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear().toString().substr(2);
};//»
this.set_line_colors = arg=>{line_colors=arg;};
let extract_prompt_from_str=(str)=>{//«
	if (!DO_EXTRACT_PROMPT) return str;
	let prstr = get_prompt_str();
	let re = new RegExp("^"+prstr.replace("$","\\$"));
	if (re.test(str)) str = str.substr(prstr.length);
	return str;
};//»
this.replace_command_history=arr=>{buffer=arr;}
this.append_command_history=arr=>{buffer=buffer.concat(arr);}
const copy_text=(str, mess)=>{//«
	if (!mess) mess = SCISSORS_ICON;
	textarea.focus();
	textarea.value = str;
	textarea.select();
	document.execCommand("copy")
	do_fs_overlay(mess);
};//»
const trim_lines=()=>{while (cur_prompt_line+1 != lines.length) lines.pop();};
const do_clear_line=()=>{//«
	if (cur_shell) return;
	let str="";
	for (let i = lines.length; i > y+scroll_num+1; i--) str = lines.pop().join("") + str;
	let ln = lines[y+scroll_num];
	str = ln.slice(x).join("") + str;
	lines[y+scroll_num] = ln.slice(0, x);	
	if (cur_prompt_line < scroll_num) {
		scroll_num -= (scroll_num - cur_prompt_line);
		y=0;
	}
	current_cut_str = str;
	render();
};//»
const do_clipboard_copy=(if_buffer, strarg)=>{//«
const do_copy=str=>{//«
    if (!str) return;
    str = str.replace(/^[\/a-zA-Z]*[$#] /,"");
    let copySource = make("pre");
    copySource.textContent = str;
    copySource.style.cssText = "-webkit-user-select: text;position: absolute;top: -99px";
    document.body.appendChild(copySource);
    let selection = document.getSelection();
    let anchorNode = selection.anchorNode;
    let anchorOffset = selection.anchorOffset;
    let focusNode = selection.focusNode;
    let focusOffset = selection.focusOffset;
    selection.selectAllChildren(copySource);

    document.execCommand("copy")
    if (selection.extend) {
        selection.collapse(anchorNode, anchorOffset);
        selection.extend(focusNode, focusOffset)
    }
    copySource.del();
}//»
	let str;
	if (strarg) str = strarg;
	else if (if_buffer) str = get_buffer(true);
	else str = getSelection().toString()
	if (CLEAN_COPIED_STRING_MODE) {
		str = str.replace(/\n/g,"");
		str = extract_prompt_from_str(str);
	}
	else {
//cwarn("Do you really ever want this string to be stripped of newlines and the prompt? CLEAN_COPIED_STRING_MODE==false !!!");
	}

	do_copy(str);
	textarea.focus();
	do_fs_overlay(`Copied: ${str.slice(0,9)}...`);
};//»
this.clipboard_copy=(s)=>{do_clipboard_copy(null,s);};
const do_clipboard_paste=()=>{//«
	textarea.value = "";
	document.execCommand("paste")
};//»
const do_fs_overlay=(strarg)=>{//«
	let str;
	if (strarg) {
		str = strarg;
		if (str.length > MAX_OVERLAY_LENGTH) str = str.slice(0,MAX_OVERLAY_LENGTH)+"...";
	}
	else str = w+"x"+h;
	fs_overlay.innerText = str;
	if (fs_overlay_timer) clearTimeout(fs_overlay_timer);
	else main.appendChild(fs_overlay);
	Core.api.center(fs_overlay, main);
	fs_overlay_timer = setTimeout(()=>{
		fs_overlay_timer = null;
		fs_overlay.del();
	}, 1500);
};//»
const set_new_fs=(val)=>{//«
	gr_fs = val;
	localStorage.Terminal_fs = gr_fs;
	wrapdiv.fs = gr_fs;
	resize();
};//»
const cx=()=>{return x;}
const cy=()=>{return y + scroll_num;}
const get_max_len=()=>{//«
	var max_len = max_fmt_len;
	var maxlenarg = ENV['MAX_FMT_LEN'];
	if (maxlenarg && maxlenarg.match(/^[0-9]+$/)) max_len = parseInt(maxlenarg);
	return max_len;
};//»
const check_line_len=(dy)=>{//«
	if (!dy) dy = 0;
	if (lines[cy()+dy].length > w) {
		let diff = lines[cy()+dy].length-w;
		for (let i=0; i < diff; i++) lines[cy()+dy].pop();
	}
};//»

//»
//Init/End: App/Alt modes (editor,pager)«
this.init_app_mode = async(which, cb, appcb, use_prompt)=>{//«
	app_input_cb = cb;
	if (which == "stdin") {
		if (use_prompt) app_prompt = use_prompt;
		else {
			app_prompt="";
			prompt_len = 0;
		}
	}
	else app_prompt = which+"> ";
	buffer_hold = buffer;
	buffer = await capi.getHistory(which, false);
	term_mode = which;
	sleeping = null;
	let parser_hold = cur_shell;
	setTimeout(()=>{
		cur_shell = null;
	},10);
	response_end();
	app_cb = ()=>{
		sleeping = true;
		cur_shell = parser_hold;
		appcb();
	};
}//»
this.app_line_out = (str, err)=>{//«
	if (err) {
		resperr(err, true);
	}
	else {
		if (!str) str = "";
		let arr = str.split("\n");
		if (arr[arr.length-1]=="") arr.pop();
		respsucclines(arr);
	}
}//»
const end_app_mode=(last_str)=>{//«
	term_mode = "shell";
	buffer = buffer_hold;
//	if (!if_no_cb&&app_cb) app_cb(true, last_str);
	if (app_cb) app_cb(true, last_str);
	else if (app_input_cb) app_input_cb(termobj.EOF);
};
this.end_app_mode = end_app_mode;
//»
const modequit=()=>{//«
	let actor = editor||pager;
	scroll_num = scrollnum_hold;
	lines = lines_hold;
	line_colors = line_colors_hold;
	y = yhold;
	x = xhold;
	num_stat_lines = 0;
	delete termobj.is_editing;
	if (app_cb) app_cb();
	editor=pager=null;
	app_cb=null;

	if (actor&&actor.cb) actor.cb();
	execute_kill_funcs();
};
this.modequit = modequit;
//»
this.hold_lines = ()=>{
	lines_hold = lines;
	line_colors_hold = line_colors;
};
this.set_lines = (linesarg, colorsarg)=>{
	lines = linesarg;
	line_colors = colorsarg;
};
this.init_edit_mode=(ed, nstatlns)=>{
	yhold=y;
	xhold=x;
	scrollnum_hold = scroll_num;
	scroll_num=x=y=0;
	editor = ed;
	num_stat_lines=nstatlns;
};
this.init_pager_mode=(pg, nstatlns)=>{
	yhold=y;
	xhold=x;
	scrollnum_hold = scroll_num;
	scroll_num=x=y=0;
	pager = pg;
	num_stat_lines=nstatlns;
};


//»
//Curses«

const clear_table=(if_keep_buf)=>{//«
	if (if_keep_buf) {
		buf_lines = buf_lines.concat(lines.slice(0, scroll_num));
		lines =  lines.slice(scroll_num);
		line_colors =  line_colors.slice(scroll_num);
	}
	else {
		lines = [];
		line_colors = [];
	}
	scroll_num = 0;
	render();
};//»
const clear=(if_keep_buffer)=>{//«
	clear_table(if_keep_buffer);
	if (!if_keep_buffer) response_end();
	if (if_keep_buffer) cur_prompt_line = y;
};
this.clear=clear;
//»
const shift_line=(x1, y1, x2, y2, if_shadow)=>{//«
	let uselines = lines;
	if (if_shadow) uselines = shadow_lines;
	let str_arr = [];
	let start_len = 0;
	if (uselines[scroll_num + y1]) {
		str_arr = uselines[scroll_num + y1].slice(x1);
		start_len = uselines[scroll_num + y1].length;
	}
	if (y1 == (y2 + 1)) {
		if (uselines[scroll_num + y2]) uselines[scroll_num + y2] = uselines[scroll_num + y2].concat(str_arr);
		uselines.splice(y1 + scroll_num, 1);
	}
	return str_arr;
};//»
const scroll_into_view=(which)=>{//«
	if (!h) return;
	const doscroll=()=>{//«
		if (lines.length-scroll_num+num_stat_lines <= h) return false;
		else {
//ODJTBQIKXH
//				vvvv // Is this correct? Everything seems to work now!!!
			if (y>=h) {
				scroll_num=lines.length-h+num_stat_lines;
				y=h-1;
			}
			else {
				scroll_num++;
				y--;
			}
			return true;
		}
	};//»
	let did_scroll = false;
	while (doscroll()) did_scroll = true;
	return did_scroll;
};//»
const resize=()=>{//«
	if (topwin.killed) return;
	wrapdiv.w = main.clientWidth;
	wrapdiv.h = main.clientHeight;
	let oldw = w;
	let oldh = h;
	ncols=nrows=0;
	getgrid();
	if (!(ncols&&nrows)) return;
	w = ncols;
	h = nrows;
	if (!(oldw==w&&oldh==h)) do_fs_overlay();
	termobj.w = w;
	termobj.h = h;
	line_height = wrapdiv.clientHeight/h;
	scroll_into_view();
	scroll_middle();
if (editor){
if (editor.resize) editor.resize(w,h);
return;
}
	render();
};
this.onresize = resize;
//»

//»
//FMT«

const fmt_ls=(arr, lens, col_arg)=>{//«
	let pad = ls_padding;
	if (col_arg == 1) {
		for (let i=0; i < arr.length; i++) {
			if (w >= arr[i].length) command_return.push(arr[i]);
			else {
				let iter = 0;
				let str = null;
				while(str != "") {
					str = arr[i].substr(iter, iter+w);
					command_return.push(str);
					iter += w;
				}
			}
		}
		return;
	}
	const min_col_wid=(col_num, use_cols)=>{
		let max_len = 0;
		let got_len;
		let use_pad = pad;
		for (let i=col_num; i < num ; i+=use_cols) {
			if (i+1 == use_cols) use_pad = 0;
			got_len = lens[i]+use_pad;
			if (got_len > max_len) max_len = got_len;
		}
		return max_len;
	};
	let num = arr.length;
	let col_wids = [];
	let col_pos = [0];
	let max_cols = col_arg;
	if (!max_cols) {
		let min_wid = 1 + pad;
		max_cols = Math.floor(w/min_wid);
		if (arr.length < max_cols) max_cols = arr.length;
	}
	let num_rows = Math.floor(num/max_cols);
	let num_cols = max_cols;
	let rem = num%num_cols;
	let tot_wid = 0;
	let min_wid;
	for (let i=0; i < max_cols; i++) {
		min_wid = min_col_wid(i, num_cols);
		tot_wid += min_wid;
		if (tot_wid > w) {
			fmt_ls(arr, lens, (num_cols - 1));
			return;
		}
		col_wids.push(min_wid);
		col_pos.push(tot_wid);
	}
	col_pos.pop();
	let matrix = [];
	let row_num;
	let col_num;
	let cur_row = -1;
	for (let i=0; i < num; i++) {
		col_num = Math.floor(i%num_cols);
		row_num = Math.floor(i/num_cols);
		if (row_num != cur_row) matrix.push([]);
		matrix[row_num][col_num] = arr[i] + " ".rep(col_wids[col_num] - arr[i].length);
		cur_row = row_num;
	}
	for (let i=0; i < matrix.length; i++) command_return.push(matrix[i].join(""));
	return;
};//»
const fmt2=(str, type, maxlen)=>{//«
    if (type) str = type + ": " + str;
    let ret = [];
    let w = termobj.w;
    let dopad = 0;
    if (maxlen&&maxlen < w) {
        dopad = Math.floor((w - maxlen)/2);
        w = maxlen;
    }

    let wordarr = str.split(/\x20+/);
    let curln = "";
    for (let i=0; i < wordarr.length; i++){
        let w1 = wordarr[i];
        if (((curln + " " + w1).length) >= w){
            if (dopad) ret.push((" ".repeat(dopad))+curln);
            else ret.push(curln);
            curln = w1;
        }
        else {
            if (!curln) curln = w1;
            else curln += " " + w1;
        }
        if (i+1==wordarr.length) {
            if (dopad) ret.push((" ".repeat(dopad))+curln);
            else ret.push(curln);
        }
    }
//    return ret.join("\n");
    return ret;
}
//»
const fmt=(str, startx)=>{//«
	if (str === termobj.EOF) return [];
	let use_max_len = get_max_len();
	if (str instanceof Blob) str = "[Blob " + str.type + " ("+str.size+")]"
	else if (str.length > use_max_len) str = str.slice(0, use_max_len)+"...";
	
//	if (type) str = type + ": " + str;
	let ret = [];
	let iter =  0;
	let do_wide = null;
	let marr;
	if (str.match && str.match(/[\x80-\xFE]/)) {
		do_wide = true;
		let arr = str.split("");
		for (let i=0; i < arr.length; i++) {
			if (arr[i].match(/[\x80-\xFE]/)) {
				arr.splice(i+1, 0, "\x03");
				i++;
			}
		}
		str = arr.join("");
	}
	let doadd = 0;
	if (startx) doadd = startx;
	if (!str.split) str = str+"";
	let arr = str.split("\n");
	let ln;
	for (ln of arr) {
		while((ln.length+doadd) >= w) {
			iter++;
			let val = ln.slice(0,w-doadd);
			if (do_wide) val = val.replace(/\x03/g, "");
			ret.push(val);
			ln = ln.slice(w-doadd);
			str = ln;
			doadd = 0;
		}
	}
	if (do_wide) ret.push(ln.replace(/\x03/g, ""));
	else ret.push(ln);
	return ret;
};//»
this.fmt = fmt;
const fmt_lines_sync=(arr, startx)=>{//«
    let all = [];
	let usestart = startx;
    for (let i=0; i < arr.length; i++) {
		all = all.concat(fmt(arr[i],usestart));
		usestart = 0;
	}
    return all;
};//»

//»
//Kill«
const do_ctrl_C=()=>{//«
	if (cur_shell) {
//This needs to propagate an EOF through the pipeline
//If cat is reading a "forever" file  (eg, /dev/midi), it needs
//to send an EOF. That needs to be a kill_func that it registers.
		ENV['?'] = 0;
		add_com = null;
		if (cur_shell.stdin) {
			cur_shell.stdin(null, true);
			delete cur_shell.stdin;
		}
		cur_shell.cancel();
		execute_kill_funcs(()=>{
			cur_shell = null;
			response_end(true);
		});
	}
	else if (term_mode != "shell") end_app_mode();
	else {
		handle_priv(null,"^".charCodeAt(), null, true);
		handle_priv(null,"C".charCodeAt(), null, true);
		if (root_state && cur_dir.match(/^\/cache/)) cur_dir = get_homedir();
		root_state = null;
		bufpos = 0;
		command_hold = null;
		ENV['?'] = 0;
		add_com = null;
		response_end(null,null,true);
	}
};//»
const do_ctrl_D=()=>{//«
	if (term_mode != "shell") {
/*
TYhdlT65
Need to send EOF first before ending app mode!!!
*/
		let arr=get_com_arr();
		let str="";
		if (arr&&arr.join) str = arr.join("");
		if ((cur_prompt_line  ==  cy()) && (x  == prompt_len)) end_app_mode(str);
		else handle_enter();
//		else if (num_ctrl_d) end_app_mode(null,str);
//		num_ctrl_d = 1;
	}
	else {
		if ((cur_prompt_line  ==  cy()) && (x  == prompt_len)) {
			if (!Desk) {
				let str = "Not exiting...";
				for (let ch of str) handle_priv(null,ch.charCodeAt(), null, true);
				response_end();
			}
			else termobj.close();
		}
	}
};//»
const execute_kill_funcs=(cb)=>{//«
//log("execute_kill_funcs");
	let iter = -1;
	let dokill=()=>{
		iter++;
		let fn = kill_funcs[iter];
//log(iter, fn);
		if (!fn) {
			kill_funcs = [];
			if (cb) cb();
			return 
		}
		fn(dokill);
	}
	dokill();
};//»
//»
//Command/Parse/Prompt«

const get_com_pos=()=>{//«
	let add_x=0;
	if (cy() > cur_prompt_line) {
		add_x = w - prompt_len + x;
		for (let i=cur_prompt_line+1; i < cy(); i++) add_x+=w;
	}
	else add_x = x - prompt_len;
	return add_x;
};//»
const get_com_arr=(from_x, is_stdin)=>{//«
	let uselines = lines;
	if (!echo_mode) uselines = shadow_lines;
	let com_arr = [];
	let j, line;
	for (let i = cur_prompt_line; i < uselines.length; i++) {
		line = uselines[i];
		if (i==cur_prompt_line) j=prompt_len;
		else j=0;
		let len = line.length;
		for (; j < len; j++) com_arr.push(line[j]);
		if (len < w && i < uselines.length-1) com_arr.push("\n");
	}
	return com_arr;
};
//»
const get_command_arr=async (dir, pattern, cb)=>{//«
	const dokids = kids=>{
		if (!kids) return;
		let keys = Object.keys(kids);
		for (let k of keys){
			let app = kids[k].APP;
			if ((!app||app=="Com") && re.test(k)){
				match_arr.push([k, "Command"]);
			}
		}
	};
	let arr;
	if (term_mode == "shell") {
		if (!termobj.builtins){
			cwarn("termobj.builtins is only being defined in the shell. If this is the first command in a session, then termobj.builtins has not been defined yet!!!");
			return [];
		}
		arr = termobj.builtins;
		if (root_state) arr = arr.concat(termobj.sys_builtins);
		arr = arr.concat(Object.keys(termobj.FUNCS));
		arr = arr.concat(Object.keys(termobj.ALIASES));
	}
	else {
log(`get_command_arr(): ${term_mode}`);
		return [];
	}
	if (!arr) return;
	let match_arr = [];
	let re = new RegExp("^" + pattern);
	for (let i=0; i < arr.length; i++) {
		if (pattern == "") match_arr.push([arr[i], "Command"]);
		else if (re.test(arr[i])) match_arr.push([arr[i], "Command"]);
	}
	if (ENV.PATH) {
		for (let p of ENV.PATH.split(":")){
			try {
				await fsapi.pathToNode(p)
				.then(async obj=>{
					if (obj.root.TYPE=="fs" && !obj.done) {
						await fsapi.popHtml5DirProm(p)
						.then(rv=>{
							dokids(rv);
						});
					}
					else dokids(obj.KIDS);
				});
			}catch(e){}
		}
	}
	cb(match_arr);
};//»
const execute=(str, if_init, halt_on_fail)=>{//«
	getch_loop_cb = null;
	termobj.file_objects = {};
	termobj.dirty = {};
	ENV['USER'] = Core.get_username();
	kill_funcs = [];
	cur_shell = shell;
	if (add_com) {
		str = add_com+"\n"+str;
		if (!if_init) buffer.pop();
	}
	if (!if_init) {
		if (str==":") {}
		else if (buffer.length > 0) {
			if	(str != buffer[buffer.length-1]) buffer.push(str);
		}
		else buffer.push(str);
	}
	str = str.replace(/\x7f/g, "");
	return shell.execute(str, cur_dir, {init:if_init, root:root_state, halt_on_fail: halt_on_fail});
};
this.execute = execute;
//»
const get_prompt_str=()=>{//«
	if (term_mode != "shell") {
//		if (term_mode=="ssh") {if (ssh_dir) return ssh_dir+":"+app_prompt;}
		return app_prompt;
	}
//log(user);
	let goodch = ["u", "U", "h", "H", "d", "t", "w"];
	let gotps = ENV.PS1;
	let ds = "\$";
	if (root_state) {
		ds = "#"; 
		gotps = "\\w" + ds;
	}
	else if (!gotps) gotps = "\\w" + ds;
	if (gotps) {//«
		cur_ps1 = gotps;
		let arr = cur_ps1.split("");
		let str = "";
		for (let i=0; i < arr.length; i++) {
			let c = arr[i];
			let c1 = arr[i+1];
			if (c == "\\" && c1 && goodch.includes(c1)) {
				if (c1 == "w") str += cur_dir.replace(/^\/+/, "/");
				else if (c1 == "u" || c1 == "U") {
					if (ENV.USER) {
						if (c1 == "u") str += ENV.USER.toLowerCase();
						else str += ENV.USER;
					}
					else str += "user";
				}
				else if (c1 == "h" || c1 == "H") {
					if (ENV.HOSTNAME) {
						if (c1 == "h") str += ENV.HOSTNAME.toLowerCase();
						else  str += ENV.HOSTNAME;
					}
					else str += "home";
				}
				else if (c1 == "t") str += new Date().toTimeString().split(" ")[0];
				else if (c1 == "d") str += cur_date_str();
				i++;
			}
			else str += c;
		}
		cur_prompt = str;
	}//»
	if (ENV.USER) {
		if ((new RegExp("^/home/"+ENV.USER+"\\$$")).test(cur_prompt)) {
			cur_prompt = "~$";
		}
		else if ((new RegExp("^/home/"+ENV.USER+"/")).test(cur_prompt)) cur_prompt = cur_prompt.replace(/^\/home\/[^\/]+\x2f/,"~/");
	}
	cur_prompt=cur_prompt.replace(/ *$/, " ");
	return cur_prompt.replace(/ /g, "\xa0");
};//»
const set_prompt=(str_arg, opts={})=>{//«
	let if_force = opts.FORCEBR;
	let if_nopush = opts.NOPUSH;
	let if_noscroll = opts.NOSCROLL;
	let use_str;
	if (isstr(str_arg)) use_str = str_arg;
	else use_str = get_prompt_str();

	if (!opts.FROMCOM && !global_winname) topwin.title=use_str.replace(/..$/,"");
	
	let plines;
	if (use_str==="") plines = [[""]];
	else{
		if (opts.FROMCOM){
			let arr = fmt(use_str, 0);
			plines=[];
			for (let ln of arr) plines.push([...ln]);
		}
		else{
			if (use_str.length+1 >= w) use_str = "..."+use_str.substr(-(w-5));
			plines = [use_str.split("")];
		}
	}
	let line;
	let use_col = null;
	let len_min1;
	if (!lines.length) {
		lines = plines;
		len_min1 = lines.length-1;
		cur_prompt_line = 0;
	}
	else {
		len_min1 = lines.length-1;
		line = plines.shift();
		if (line_continue_flag) lines[len_min1] = lines[len_min1].concat(line);
		else if (if_force) {
			lines.push(line);
			len_min1++;
		}
		else {
			if (!lines[len_min1][0]) lines[len_min1] = line;
			else {
				lines.push(line);
				len_min1++;
			}
		}
		if (use_col) line_colors[len_min1] = {'0': [line.length, use_col]};
		while(plines.length) {
			line = plines.shift();
			lines.push(line);
			len_min1++;
			if (use_col) line_colors[len_min1] = {'0': [line.length, use_col]};
		}
		if (!if_noscroll) {
			cur_prompt_line = len_min1;
			scroll_into_view();
		}
	}
	prompt_len = lines[len_min1].length;
	if (prompt_len==1 && lines[len_min1][0]==="") prompt_len=0;
	x=prompt_len;
	y=lines.length - 1 - scroll_num;
	line_continue_flag = false;
};
this.set_prompt = set_prompt;
//»
const insert_cur_scroll=()=>{//«
	com_scroll_mode = false;
	lines = lines_hold_2.slice(0, lines.length);
	let str = cur_scroll_command;
	let arr = fmt_lines_sync(str.split("\n"), prompt_len);
	let curarr;
	if (term_mode=="stdin") curarr=[];
	else curarr = get_prompt_str().split("");
	for (let i=0; i < arr.length; i++) {
		let charr = arr[i].split("");
		for (let j=0; j < charr.length; j++) curarr.push(charr[j]);
		lines[cur_prompt_line + i] = curarr;
		y = cur_prompt_line + i - scroll_num;
		x = curarr.length;
		curarr = [];
	}
	if (x == w-1) {
		x=0;
		y++;
	}
	cur_scroll_command = null;
	return str;
};//»
const get_dir_contents=async(dir, pattern, cb)=>{//«
	if (dir===null) throw new Error("get_dir_contents() no dir!");
	let ret = await fsapi.pathToNode(dir,{root:root_state});
	if (!(ret&&ret.APP==FOLDER_APP)) return cb([]);
	let type = ret.root.TYPE;
	let kids=ret.KIDS;
	let keys=Object.keys(kids);
	const domatch=()=>{//«
		kids = ret.KIDS;
		keys = Object.keys(kids);
		let match_arr = [];
		pattern = pattern.replace(/\*/g, "[a-zA-Z_]*");
		pattern = pattern.replace(/\xa0/g, " ");
		let re = new RegExp("^" + pattern.replace(/\./g,"\\."));
		for (let i=0; i < keys.length; i++) {
			let key = keys[i];
			if (key=="."||key=="..") continue;
			let kid = kids[key];
			if (!root_state){
				let cur = kid;
				while (cur.treeroot !== true) {
					if (cur.rootonly === true) {
						kid = null;
						break;
					}
					cur = cur.par;
				}
				if (!kid) continue;
			}
			let useapp = kid.APP;
			let ret = [keys[i], useapp];
			if (useapp == "Link") ret.push(kid.LINK);
			if (pattern == "" || re.test(keys[i])) match_arr.push(ret);
		}
		cb(match_arr);
	};//»
	if (type=="fs"&&!ret.done) {
		let ret2 = await fsapi.popDir(ret,{});
		if (!ret2) return cb([]);
		ret.done = true;
		ret.KIDS = ret2;
		domatch();
	}
	else if (keys.length==2) {
		if (type=="remote"||type=="local") {
			if (!ret.checked) {
				if (awaiting_remote_tab_completion) {
cwarn("AWAITING REMOTE DIR LOOKUP: "+dir);
					return;
				}
				awaiting_remote_tab_completion = true;
//FS555
				let ret2 = await fsapi.popDir(ret,{});
				if (!ret2) {
					awaiting_remote_tab_completion = false;
					return cb([]);
				}
				ret.KIDS = ret2;
				domatch();
				awaiting_remote_tab_completion = false;
			}
			else cb([]);
		}
		else{
//FS666
			let ret2 = await fsapi.popDir(ret);
			if (!ret2) return cb([]);
			ret.KIDS = ret2;
			domatch();
		}
	}
	else domatch();
};
this.get_dir_contents=get_dir_contents;
//»

//»
//Response«

const obj_to_string = obj=>{
	if (obj.id) return `[object ${obj.constructor.name}(${obj.id})]`;
	return `[object ${obj.constructor.name}]`;
};
const resperrobj=()=>{resperr(obj.toString());};
const response_end=(if_nopush, which, if_force)=>{//«
	if (!did_init) return;
	if (pager) return;
//	if (ssh_mode)resp_done_cb();

	add_com = null;
	set_prompt(null, {FORCEBR: if_force});
	termobj.num_prompts++;
	scroll_into_view();
	sleeping = null;
	bufpos = 0;
	Core.save_shell_com(last_com_str, last_mode);
	setTimeout(()=>{cur_shell = null;},10);
	render();
};
this.response_end = response_end;
//»
const resperrch=(str)=>{response({"CH": str}, {NOEND: true});};
const respsuccch=(str)=>{response({"CH": str}, {NOEND: true});};
const resperr=(str, if_no_cur, cb, opts)=>{//«
	if (!opts) opts = {};
//cerr("ERR", str);
//	response({"ERR": [str]}, {NOEND: true, NOCUR: if_no_cur, CLEAR: opts.CLEAR});
	response({"ERR": fmt(str)}, {NOEND: true, NOCUR: if_no_cur, CLEAR: opts.CLEAR});

};//»
const respsucc=(str, if_no_cur, cb, opts)=>{//«
	if (!opts) opts = {};
//cwarn("SUCC", str);
//	response({"SUCC": [str]}, {NOEND: true, NOCUR: if_no_cur, CLEAR: opts.CLEAR, NONL: opts.NONL, FORCELINE: opts.FORCELINE});
	response({"SUCC": fmt(str)}, {NOEND: true, NOCUR: if_no_cur, CLEAR: opts.CLEAR, NONL: opts.NONL, FORCELINE: opts.FORCELINE});
	if (cb) cb(1);
};//»
const respsuccobj=(obj, if_no_cur, cb, if_clear, if_nonl)=>{//«
	response({"SUCC": [obj_to_string(obj)]}, {NOEND: true, NOCUR: if_no_cur, CLEAR: if_clear, NONL: if_nonl});
	if (cb) cb(1);
};//»
const respsucclines=(arr, colorargs, norowargs, usetimeout, cb, write_cb, if_clear)=>{//«
	response({"SUCC": arr, 'COLORS': colorargs}, {NOEND: true, NOCUR: true, CLEARONE: if_clear});
	if (cb) cb();
	if (write_cb) write_cb(1);
};//»
const resperrlines=(arr, colorargs, norowargs, usetimeout, cb, write_cb, if_clear)=>{
	response({"ERR": arr, 'COLORS': colorargs}, {NOEND: true, NOCUR: true, CLEARONE: if_clear});
	if (cb) cb();
	if (write_cb) write_cb(1);
};
const respsuccblob=(blob, if_no_cur, cb, if_clear, noarg, if_nonl)=>{//«
	response({"SUCC": [blob.toString()]}, {NOEND: true, NOCUR: if_no_cur, CLEAR: if_clear, NONL: if_nonl});
	if (cb) cb(1);
};//»
const response = (outarg, opts)=>{//«
	if (!opts) opts = {};
	let if_noend = opts.NOEND;//1
	let next_cb = opts.NEXTCB;//3
	let if_nocur = opts.NOCUR;//4
	let if_clear = opts.CLEAR;//5
	let if_clear_one = opts.CLEARONE;//6
	let if_force_nl = opts.FORCELINE;
	let if_soft_break = opts.SOFTBREAK;
	let if_break = opts.BREAK;
//This means that there is a "line continuation" flag for the next addition to 
//lines (usually in set_prompt?)
	let if_nonl = opts.NONL;
	if (if_nonl) line_continue_flag = true;
	if (!lines[0]) lines[0] = [];
	let out;
	let outi;
	let use_cb=()=>{};
	if (next_cb) use_cb = next_cb;

	if (outarg['CONT']) {//«
		setTimeout(()=>{
			cur_shell = null;
			sleeping = null;
		}, 10);
		y++;
		set_prompt("> ",{NOPUSH:true});
		termobj.num_prompts++;
		add_com = outarg.CONT;
		scroll_into_view(1);
		render();
		return;
	}//»
	if (outarg['CD']) {//«
		cur_dir = outarg['CD'];
		if (!if_noend) response_end();
		else get_prompt_str();
		return;
	}//»

	let colors = outarg['COLORS'];

	if (outarg['SUCC']) {
		out = outarg['SUCC'];
//		if (ssh_mode) stdout_cb(out);
	}
	else if (outarg["ERR"]) {
		out = outarg["ERR"];
//		if (ssh_mode) stderr_cb(out);
	}

	let do_append = false;
	if (if_clear === false) do_append = true;
	
	let thisline = lines[lines.length-1];
	let is_empty = null;
	if (thisline) {
		if (if_clear) thisline = [];
		if (!thisline.length) is_empty = true;
	}
	let use_inc = 1;
	if (is_empty) use_inc = 0;
	if (colors) {
		for (let i=0; i < colors.length; i++) {
			line_colors[scroll_num + y + i + use_inc] = colors[i];
		}
	}
	const doend=()=>{//«
		use_cb();
		y=lines.length-1-scroll_num;
		x=lines[cy()].length;
		cur_prompt_line = lines.length - 1;
		if (!if_noend) response_end();
	}//»
	let numlines = out.length;
	if (!if_break&&!if_force_nl&&out.length==1&&out[0]==="\x00") return;
	if (out.length==1&&out[0]==="") {
		if (if_force_nl) lines.push([""]);
		doend();
		return;
	}
	for (let i=0; i < out.length; i++) {//«
		outi = out[i];
//log(outi);
		if(outi.EOF===true) continue;

//Coerce it into a string
		if (outi.toString instanceof Function) outi = outi.toString();
		else outi+="";

//If a null byte, push a Newline
//But we didn't do a formfeed, ie, increasing the cur_prompt_line
		if (outi == "\x00") {//«
			if ((if_soft_break || !if_force_nl) && is_empty) {
				if (cur_shell){
					if (if_soft_break) return;
				}
				else return;
			}
			if (line_continue_flag) return doend();
			if (if_force_nl) lines.push([null]);
			else lines.push([]);
			scroll_into_view();
			y=lines.length-1-scroll_num;
			x=lines[cy()].length;
			cur_prompt_line = lines.length - 1;
			continue;
		}//»
//If no line, make a new one
//If not a char, output an object type
		if (!thisline) {
			thisline = [];
			lines.push(thisline);
		}
//If there is just a space here, stick all the chars there
		if (do_append) {
			lines[lines.length-1] = lines[lines.length-1].concat(outi.split(""));
		}
//GHTYEKS
		else if (!if_force_nl && thisline.length == 1 && (thisline[0]==""||thisline[0]==" ")) lines[lines.length-1] = outi.split("");
		else {
//Overflow marker
			if (w-outi.length < 0) {
cwarn("Overflow");
log(outi);
				outi = outi.slice(0,w-1)+"+";
				let col = {};
				col[w-1+""]=[1,"#000","#cc0"];
				let usenum = lines.length;
				if (is_empty)usenum--;
				line_colors[usenum] = col;
			}
			if (is_empty) {
				lines[lines.length-1] = outi.split("");
				if (!if_clear) lines.push([]);
			}
			else lines.push(outi.split(""));
			scroll_into_view();
		}
	}//»
	doend();
};
this.response = response;
//»

//»
//KeyHandlers«

const handle_line_str=(str, from_scroll, uselen, if_no_render)=>{//«
	var did_fail = false;
	const copy_lines=(arr, howmany)=>{//«
		var newarr = [];
		for (let i=0; i <= howmany; i++) {
			let ln = arr[i];
			if (!ln) {
				did_fail = true;
				ln = [" "];
			}
			newarr.push(ln);
		}
		return newarr;
	}//»
	if (str=="") {}
	else if (!str) return;
	let curnum = cur_prompt_line;
	let curx;
	if (typeof uselen=="number") curx=uselen;
	else curx = prompt_len;
	lines_hold_2 = lines;
	if (!com_scroll_mode) {
		lines = copy_lines(lines, cur_prompt_line)
		if (did_fail) {
			clear();
			return 
		}
	}
	lines[lines.length-1] = lines[lines.length-1].slice(0, prompt_len);

	let curpos = prompt_len;
	cur_scroll_command = str;
	let arr = str.split("\n");
	let addlines = 0;

	for (let lnstr of arr) {
		let i;
		if (!lnstr) lnstr = "";
		for (i=curnum;lnstr.length>0;i++) {
			let curln = lines[i];
			if (!curln) curln = [];
			let strbeg = lnstr.slice(0,w-curpos);
			curx = curpos + strbeg.length;
			curln.push(...strbeg);
			lines[i] = curln;
			lnstr = lnstr.slice(w-curpos);
			if (lnstr.length > 0) {
				curnum++;
				curx = 0;
			}
			curpos = 0;
			addlines++;
		}
		curnum++;
	}
	scroll_into_view();
	y = lines.length-1-scroll_num;
	x = curx;
	if (x==w) {
		y++;
		if (!lines[y+scroll_num]) lines.push([]);
		x=0;
		scroll_into_view();
	}
	if (!if_no_render) render();
};
this.handle_line_str = handle_line_str;
//»

const normalize_path = (path, cwd) => {//«
	if (!(path.match(/^\x2f/) || (cwd && cwd.match(/^\x2f/)))) {
		cerr("normalize_path():INCORRECT ARGS:", path, cwd);
		return null;
	}
	if (!path.match(/^\x2f/) && cwd) path = cwd + "/" + path;
	let str = path.regpath();
	while (str.match(/\/\.\x2f/)) str = str.replace(/\/\.\x2f/, "/");
	str = str.replace(/\/\.$/, "");
	str = str.regpath();
	let arr = str.split("/");
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == "..") {
			arr.splice(i - 1, 2);
			i -= 2;
		}
	}
	let newpath = arr.join("/").regpath();
	if (!newpath) newpath = "/";
	return newpath;
}//»

const get_fullpath = (path, cur_dir) => {//«
	if (!path) return;
	if (path.match(/^\x2f/)) return path;
	if (!cur_dir) return cwarn("get_fullpath():No cur_dir given with relative path:" + path);
	let usedir;
	if (cur_dir == "/") usedir = "/";
	else usedir = cur_dir + "/";
	return normalize_path(usedir + path);
}//»

const handle_tab=async()=>{//«
/*
If term_mode !=
*/
if (term_mode != "shell"){
cwarn(`TAB: term_mode='${term_mode}'`);
return;
}
	if (cur_scroll_command) insert_cur_scroll();
	let contents;
	let use_dir = cur_dir;
	const docontents=async()=>{//«
		if (contents.length == 1) {//«

//METACHAR_ESCAPE

//\x22 -> "
//\x27 -> '
//\x60 -> `
//\x5b -> [
			let chars = contents[0][0].replace(/[ \x22\x27\x5b\x60#~{<>$|&!;()]/g, "\\$&").split("");
			let type = contents[0][1];
			tok = tok.replace(/\*$/,"");
			let str = tok;
			for (let i=tok.length; i < chars.length; i++) {
				let gotch = chars[i];
				str+=gotch;
				handle_letter_press(gotch);
			}
			if (type==FOLDER_APP) {
				handle_letter_press("/");//"/"
//FS777
				let rv = await fsapi.populateDirObjByPath(use_dir+"/"+str,{root:root_state});
				if (!rv) return cerr(NS.error.message);
			}
///*
			else if (type=="appDir"||type=="libDir"){
				handle_letter_press(".");//"/"
			}
			else if (type=="Link") {
				let link = contents[0][2];
				if (!link){
cwarn("WHAT DOES THIS MEAN: contents[0][2]?!?!?!?");
				}
				else if (!link.match(/^\x2f/)) {
cwarn("handle_tab():  GOWDA LINK YO NOT FULLPATH LALA");
				}
				else {
//FS888
					let obj = await fsapi.pathToNode(link, {root:root_state});
					if (obj&&obj.APP==FOLDER_APP) handle_letter_press("/");
					else {
						if (!lines[cy()][cx()]) handle_letter_press(" ");
					}
				}
			}
			else {
				if (!lines[cy()][cx()]) handle_letter_press(" ");
			}
		}//»
		else if (contents.length > 1) {//«
			if (await_next_tab) {//«
				let last_line = lines[cy()];
				let repeat_arr = last_line.slice(prompt_len);
				let ret_arr = [];
				for (let i=0; i < contents.length; i++) ret_arr.push(contents[i][0]);
				let names_sorted = ret_arr.sort();
				let name_lens = [];
				for (let nm of names_sorted) name_lens.push(nm.length);
				fmt_ls(names_sorted, name_lens);
				let holdx = x;
				response({"SUCC": command_return}, {NOEND: true, NOCUR: true});
				response_end();
				for (let i=0; i < repeat_arr.length; i++) handle_letter_press(repeat_arr[i]);
				render();
				command_return = [];
				x = holdx;
			}//»
			else {//«
				if (!tok.length) {await_next_tab = true;return;}
				let max_len = tok.length;
				let got_substr = "";
				let curstr = tok;
				let curpos = tok.length;
				TABLOOP: while(true) {
					let curch = null;
					for (let arr of contents) {
						let word = arr[0];
						if (curpos == word.length) break TABLOOP;
						if (!curch) curch = word[curpos];
						else if (curch!==word[curpos]) break TABLOOP;
					}
					curstr += curch;
					curpos++;
				}
				got_substr = curstr;

				let got_rest = got_substr.substr(tok.length);
				if (got_rest.length > 0) {
					if (contents.length > 1)await_next_tab = true;
					else await_next_tab = null;
					
					let chars = got_rest.split("");
					for (let i=0; i < chars.length; i++) {
						let gotch = chars[i];
						if (gotch == " ") gotch = "\xa0";
						handle_letter_press(gotch);
					}
				}
				else await_next_tab = true;
			}//»
		}//»
	};//»
	if (cur_shell) return;
	let arr_pos = get_com_pos();
	let arr = get_com_arr();
	let tok = "";
	let new_arr = arr.slice(0, arr_pos);
	new_arr = new_arr.join("").split(/ +/);
	if (!new_arr[0] && new_arr[1]) new_arr.shift();
	let tokpos = new_arr.length;
	if (tokpos > 1) {
		if (new_arr[new_arr.length-2].match(/[\x60\(|;] *$/)) tokpos = 1;
	}

	let tok0 = new_arr[0];
	tok = new_arr.pop();
	tok = tok.replace(/^[^<>=]*[<>=]+/,"")

	if (tok.match(/^[^\x60;|&(]*[\x60;|&(][\/.a-zA-Z_]/)) {
		tok = tok.replace(/^[^\x60;|&(]*[\x60;|&(]/,"");
		tokpos = 1;
	}

	let got_path = null;

	if (tok.match(/\x2f/)) {//«
		tok = tok.replace(/^~\x2f/, "/home/"+ENV.USER+"/");
		got_path = true;
		let dir_arr = tok.split("/");
		tok = dir_arr.pop();
		let dir_str;
		let new_dir_str;
		if (dir_arr.length == 1 && dir_arr[0] == "") new_dir_str = "/";
		else {
			dir_str = dir_arr.join("/");
			let use_cur = cur_dir;
			if (dir_str.match(/^\x2f/)) use_cur = null;
//FS222
			new_dir_str = get_fullpath(dir_str, cur_dir);
		}
		use_dir = new_dir_str;
	}//»
	let nogood = null;
/*ONLINE TAB COMPLETION COOLNESS:«
If we have a command like "man" that has 
a lot of resources to choose from on the server, and we know there is 
only one option, then we can just make sure we have the right command 
and we are in the correct option position, then get the options.
Otherwise, do the default tab completion procedure...
»*/

/*
//Man Pages«
var man_options = null;
var getting_man_options = false;
this.get_man_options = function(tok, cb) {//«
    function get_matches() {
        let match_arr = [];
        let re = new RegExp("^" + tok);
        for (let i=0; i < man_options.length; i++) {
            let opt = man_options[i];
            if (tok == "") match_arr.push([opt, "Command"]);
            else if (re.exec(opt)) match_arr.push([opt, "Command"]);
        }
        return match_arr;
    }
    if (man_options) return get_matches();
    if (getting_man_options) return null;
    getting_man_options = true;
    setTimeout(function() {
//If we never got anything because we were offline, we can try again after this timeout.
        getting_man_options = false;
    }, 60000);
    Core.xgetobj('/online/man/list.json', function(ret) {
        if (ret) man_options = ret;
        else {
log("YARR WHAT MAN OPTIONS????");
        }
    });
    return null;
}//»
//»
*/
/*«
	if (tokpos==2 && tok0=="man") contents = util.get_man_options(tok);
	else if (tokpos == 1 && !got_path) {
		let arr = get_command_arr(use_dir, tok);
		contents = arr;
	}
»*/

	const do_gdc = () => {
		get_dir_contents(use_dir, tok, ret => {
			if (!ret.length) return;
			contents = ret;
			docontents();
		});
	};
	if (!got_path && (tokpos==1||(tokpos==2 && com_completers.includes(tok0)))) {
		if (tokpos==1) {
			get_command_arr(use_dir, tok, rv=>{
				contents = rv;
				if (contents && contents.length) docontents();
				else do_gdc();
			});
		}
		else {
			if (tok0==="app"||tok0=="lib"||tok0=="import"){
				if (tok0=="import") tok0="lib";
				let path="";
				if (tok) path=`?path=${tok}`;
				let rv = await fetch(`/_get${tok0}${path}`);
				let arr = await rv.json();
				let all = [];
				for (let n of arr) {
					if (n.match(/\.js$/)) all.push([n.replace(/\.js$/,""),"File"]);
					else all.push([n,`${tok0}Dir`]);
				}
				contents = all;
				if (tok.match(/\./)){
					let arr = tok.split(".");
					tok = arr.pop();
				}
				docontents();
			}

		}
	}
	else {
		do_gdc();
	}	
	
};//»
const handle_buffer_scroll=(if_up)=>{//«
	if (buffer_scroll_num===null) {
		buffer_scroll_num = scroll_num;
		scroll_cursor_y = y;
		hold_x = x;
		hold_y = y;
	}
	let n = buffer_scroll_num;
	if (if_up) {//«
		if (n == 0) return;
		let donum;
		if (n - h > 0) {
			donum = h;
			n -= h;
		}
		else n = 0;
		y=0;
	}//»
	else {//«
		let donum = h;
		if (n + donum >= lines.length) return;
		n += donum;
		if (n + h > lines.length) {
			n = lines.length - h;
			if (n < 0) n = 0;
		}
		y=0;
	}//»
	buffer_scroll_num = n;
	render();
};//»
const handle_arrow=(code, mod, sym)=>{//«

	if (mod == "") {//«
		if (code == KC['UP']) {//«
			if (cur_shell) return;
			if (bufpos < buffer.length) {
				if (command_hold == null && bufpos == 0) {
					command_hold = get_com_arr().join("");
					command_pos_hold = get_com_pos() + prompt_len;
				}
				bufpos++;
			}
			else return;
			let str = buffer[buffer.length - bufpos];
			if (str) {
				let diffy = scroll_num - cur_prompt_line;
				if (diffy > 0) {
					y=0;
					scroll_num -= diffy;
					cur_prompt_line = scroll_num;
					set_prompt(null,{NOPUSH:1, NOSCROLL:1});
				}
				else y = cur_prompt_line;
				while (cur_prompt_line+1 != lines.length) { 
if (!lines.length){
console.error("COULDA BEEN INFINITE LOOP: "+(cur_prompt_line+1) +" != "+lines.length);
break;
}
					lines.pop();
				}
				handle_line_str(str.trim(), true);
				com_scroll_mode = true;
			}
		}//»
		else if (code == KC['DOWN']) {//«
			if (cur_shell) return;
			if (bufpos > 0) bufpos--;
			else return;
			if (command_hold==null) return;
			let pos = buffer.length - bufpos;
			if (bufpos == 0) {
				trim_lines();
				handle_line_str(command_hold.replace(/\n$/,""),null,null,true);
				x = command_pos_hold;
				command_hold = null;
				render();
			}
			else {
				let str = buffer[buffer.length - bufpos];
				if (str) {
					let diffy = scroll_num - cur_prompt_line;
					if (diffy > 0) {
						y=0;
						scroll_num -= diffy;
						cur_prompt_line = scroll_num;
						set_prompt(null,{NOPUSH:1, NOSCROLL:1});
					}
					trim_lines();
					handle_line_str(str.trim(), true);
					com_scroll_mode = true;
				}
			}
		}//»
		else if (code == KC["LEFT"]) {//«
			if (cur_scroll_command) insert_cur_scroll();
			if (cx() == 0) {
				if (cy() == 0) return;
				if (cy() > cur_prompt_line) {
					if (y==0) {
						scroll_num--;
					}
					else y--;
					x = lines[cy()].length;
					if (x==w) x--;
					if (x<0) x = 0;
					render();
					return;
				}
				else return;
			}
			if (cy()==cur_prompt_line && x==prompt_len) return;
			x--;
			render();

		}//»
		else if (code == KC["RIGHT"]) {//«
			if (cur_scroll_command) insert_cur_scroll();
//Or if this is less than w-2 with a newline for a CONT like current CLI environment.
			let nextline = lines[cy()+1];
			let thisline = lines[cy()];
			let thisch = thisline[cx()];
			let thislinelen = thisline.length;

			if (x == w-1 || ((x < w-1) && nextline && ((x==0&&!thislinelen) || (x==lines[cy()].length)))) {//«
				if (x<w-1){
					if (!thisch) {
						if (!nextline) return;
					}
				}
				else if (!thisch) return;
				if (lines[cy() + 1]) {
					x=0;
					if (y+1==h) scroll_num++;
					else y++;
					render();
				}
				else { 
					lines.push([]);
					x=0;
					y++;
					if (!scroll_into_view(9)) render();
					return;
				}
			}//»
			else {
				if (x==thislinelen||!thisch) return;
				x++;
				render();
			}
		}//»
	}//»
	else if (mod=="C") {//«
		if (kc(code,"UP")) {//«
			if (bufpos < buffer.length) {
				if (command_hold == null && bufpos == 0) {
					command_hold = get_com_arr().join("");
					command_pos_hold = get_com_pos() + prompt_len;
				}
				bufpos++;
			}
			else return;

			let re = new RegExp("^" + command_hold);
			for (let i = buffer.length - bufpos; bufpos <= buffer.length; bufpos++) {
				let str = buffer[buffer.length - bufpos];
				if (re.test(str)) {
					trim_lines();
					handle_line_str(str.trim(), true);
					com_scroll_mode = true;
					break;
				}
			}
		}//»
		else if (kc(code,"DOWN")) {//«
			if (bufpos > 0 && command_hold) bufpos--;
			else return;
			let re = new RegExp("^" + command_hold);
			for (let i = buffer.length - bufpos; bufpos > 0; bufpos--) {
				let str = buffer[buffer.length - bufpos];
				if (re.test(str)) {
					trim_lines();
					handle_line_str(str.trim(), true);
					com_scroll_mode = true;
					return;
				}
			}
			if (command_hold) {
				trim_lines();
				handle_line_str(command_hold.trim(), true);
				com_scroll_mode = true;
				command_hold = null;
			}
			else {
			}
		}//»
		else if (kc(code,"LEFT")) {//«
			if (cur_scroll_command) insert_cur_scroll();
			let arr = get_com_arr();
			let pos;
			let start_x;
			let char_pos = null;
			let use_pos = null;
			let add_x = get_com_pos();
			if (add_x==0) return;
			start_x = add_x;
			if (arr[add_x] && arr[add_x] != " " && arr[add_x-1] == " ") add_x--;
			if (!arr[add_x] || arr[add_x] == " ") {
				add_x--;
				while(add_x > 0 && (!arr[add_x] || arr[add_x] == " ")) add_x--;
				char_pos = add_x;
			}
			else char_pos = add_x;
			if (char_pos > 0 && arr[char_pos-1] == " ") use_pos = char_pos;
			while(char_pos > 0 && arr[char_pos] != " ") char_pos--;
			if (char_pos == 0) use_pos = 0;
			else use_pos = char_pos+1;
			for (let i=0; i < start_x - use_pos; i++) handle_arrow(KC["LEFT"], "");
		}//»
		else if (kc(code,"RIGHT")) {//«
			if (cur_scroll_command) insert_cur_scroll();
			let arr;
			arr = get_com_arr();
			let pos;
			let start_x;
			let char_pos = null;
			let use_pos = null;
			let add_x = get_com_pos();
			if (add_x == arr.length) return;
			else if (!arr[add_x]) return;
			start_x = add_x;
			if (arr[add_x] != " ") {
				add_x++;
				while(add_x != arr.length && arr[add_x] != " ") add_x++;
				char_pos = add_x;
				if (char_pos == arr.length) use_pos = char_pos;
				else {
					char_pos++;
					while(char_pos != arr.length && arr[char_pos] == " ") char_pos++;
					use_pos = char_pos;
				}
			}
			else {
				add_x++;
				while(add_x != arr.length && arr[add_x] == " ") add_x++;
				use_pos = add_x;
			}
			for (let i=0; i < use_pos - start_x; i++) handle_arrow(KC["RIGHT"], "");
		}//»
	}//»

};//»
const handle_page=(sym)=>{//«
	if (sym=="HOME_") {//«
		if (cur_shell) return;
		if (bufpos < buffer.length) {
			if (command_hold == null && bufpos == 0) {
				command_hold = get_com_arr().join("");
				command_pos_hold = get_com_pos() + prompt_len;
			}
			bufpos = buffer.length;
			let str = buffer[0];
			if (str) {
				trim_lines();
				handle_line_str(str.trim(), true);
			}
		}
	}//»
	else if (sym=="END_") {//«
		if (cur_shell) return;
		if (bufpos > 0) {
			bufpos = 0;
			if (command_hold!=null) {
				trim_lines();
				handle_line_str(command_hold.trim(), true);
				command_hold = null;
			}
		}
	}//»
};//»
const handle_backspace=()=>{//«
	let prevch = lines[cy()][cx()-1];
	if (((y+scroll_num) ==  cur_prompt_line) && (x == prompt_len)) return;
	else {
		let do_check = true;
		let is_zero = null;
		if (cx()==0 && y==0) return;
		if (cx()==0 && (cy()-1) < cur_prompt_line) return;
		if (cur_scroll_command) insert_cur_scroll();

		if (cx()==0 && cy() > 0) {//«
			if (lines[cy()].length < w) {//«
				let char_arg = lines[cy()][0];
				if (char_arg) {
					check_line_len(-1);
					is_zero = true;
					lines[cy()].splice(x, 1);
					lines[cy()-1].pop();
					lines[cy()-1].push(char_arg);
					y--;
					x = lines[cy()].length - 1;
					render();
				}
				else {
					lines[cy()-1].pop();
					lines.splice(cy(), 1);
					y--;
					x=lines[cy()].length;
					check_line_len();
					render();
					return;
				}
			}//»
			else {//«
				y--;
				do_check = true;
				lines[cy()].pop();
				x = lines[cy()].length;
				render();
			}//»
		}//»
		else {//«
			x--;
			lines[cy()].splice(x, 1);
		}//»

		let usey=2;
		if (!is_zero) {
			usey = 1;
			do_check = true;
		}

		if (do_check && lines[cy()+usey] && lines[cy()].length == w-1) {//«
			let char_arg = lines[cy()+usey][0];
			if (char_arg) lines[cy()].push(char_arg);
			else lines.splice(cy()+usey, 1);
			if(lines[cy()+usey]) {//«
				lines[cy()+usey].splice(0, 1);
				let line;
				for (let i=usey+1; line = lines[cy()+i]; i++) {
					let char_arg = line[0];
					if (char_arg) {
						line.splice(0,1);
						lines[cy()+i-1].push(char_arg);
						if (!line.length) lines.splice(i+1, 1);
					}
				}
			}//»
		}//»

	}
	render();
};//»
const handle_delete=(mod)=>{//«
	if (mod == "") {
		if (lines[cy()+1]) {
			handle_arrow(KC.RIGHT, "");
			handle_backspace();
		}
		else {
			lines[cy()].splice(x, 1);
			render();
		}
	}
};
//»
const handle_enter=async(if_paste)=>{//«
	if ((cur_shell && cur_shell.stdin) || !sleeping){
		bufpos = 0;
		command_hold = null;
		let str;
		let is_stdin = null;
		if (cur_shell && cur_shell.stdin) is_stdin = true;
		if (cur_shell && !is_stdin) {//«
			var ret = get_com_arr(1);
			if (str == null && term_mode == "shell") return response_end();
			str = ret.join("");
		}//»
		else {//«
			if (is_stdin) {//«
				ret = get_com_arr(null,true)
				echo_mode = true;
				no_prompt_mode = false;
				shadow_lines = null;
				str = ret.join("");
			}//»
			else {//«
				if (cur_scroll_command) str = insert_cur_scroll();
				else str = get_com_arr().join("");
				if (!add_com && !str && term_mode == "shell") {
					ENV['?']="0";
					response_end(null,null,true);
					return;
				}
			}//»
		}//»
		x=0;
		y++;
		response({"SUCC":["\x00"]}, {BREAK: true,NOEND:true});
		render();
		if (cur_shell && cur_shell.stdin) return cur_shell.stdin(str);
		if (!(add_com || str || term_mode != "shell")) return response_end();
		if (str) {
			last_com_str = str;
			last_mode = term_mode;
		}
		if (!if_paste) sleeping = true;
		if (term_mode == "shell") {
			await execute(str);
			sleeping = null;
			return;	
		}
		if (!app_input_cb) return console.error("TERM_MODE != com and NO CLI_INPUT_CB!!!!!!!!");
		if (!str) str = "\n";
		app_input_cb(str);
		if (buffer.length > 0) {
			if	(str != buffer[buffer.length-1]) buffer.push(str);
		}
		else buffer.push(str);
	}
};//»
this.enter=handle_enter;
const handle_letter_press=(char_arg, if_no_render)=>{//«
	var line;
	if (lines && lines[scroll_num + y]) {
		if ((x) < lines[scroll_num + y].length && lines[scroll_num + y][0]) {
			if (!echo_mode) {
				if (!shadow_lines[scroll_num+y]) shadow_lines[scroll_num+y] = lines[scroll_num+y].join("").split("");
				shadow_lines[scroll_num+y].splice(x, 0, char_arg);
				lines[scroll_num + y].splice(x, 0, "*");
			}
			else lines[scroll_num + y].splice(x, 0, char_arg);
			if (!echo_mode) shift_line(x-1, y, x, y, true);
			shift_line(x-1, y, x, y);
		}
	}

	let usex = x+1;
	let usey = y;
	y = usey;

	let endch = null;
	let didinc = false;
	if (usex == w) {
		if (lines[cy()][cx()+1]) endch = lines[cy()].pop();
		didinc = true;
		usey++;
		usex=0;
	}
	if (!lines[cy()]) {//«
		lines[cy()] = [];
		if (!echo_mode) shadow_lines[cy()] = [];

		if (!echo_mode) {
			lines[cy()][0] = "*";
			shadow_lines[cy()][0] = char_arg;
		}
		else lines[cy()][0] = char_arg;
	}//»
	else if (lines[cy()] && char_arg) {//«
		let do_line = null;
		if (lines[cy()][x]) do_line = true;
		if (!echo_mode) {
			if (!shadow_lines[cy()]) shadow_lines[cy()] = lines[cy()].join("").split("");
			shadow_lines[cy()][x] = char_arg;
			lines[cy()][x] = "*";
		}
		else lines[cy()][x] = char_arg;
	}//»
	let ln = lines[scroll_num+usey];
	if (ln && ln[usex]) {//«
		if (x+1==w) {
			if (!didinc) {
				usey++;
				usex=0;
			}
			if (endch) {
				if (!echo_mode) {
					if (!shadow_lines[scroll_num+usey]||!shadow_lines[scroll_num+usey].length||shadow_lines[scroll_num+usey][0]===null) shadow_lines[scroll_num+usey] = [endch];
					else shadow_lines[scroll_num+usey].unshift(endch);	

					if (!ln||!ln.length||lines[scroll_num+usey][0]===null) lines[scroll_num+usey] = ["*"];
					else ln.unshift("*");	
				}
				else {
					if (!ln||!ln.length||ln[0]===null) lines[scroll_num+usey] = [endch];
					else ln.unshift(endch);	
				}
			}
		}
		else usex = x+1;
	}//»
	else {//«
		if (!echo_mode) {
			if (!shadow_lines[scroll_num+usey]||!shadow_lines[scroll_num+usey].length||shadow_lines[scroll_num+usey][0]===null) {
				shadow_lines[scroll_num+usey] = [endch];
			}
			if (!ln||!ln.length||ln[0]===null) lines[scroll_num+usey] = ["*"];
		}
		else {
			if (!ln||!ln.length||ln[0]===null) {
				lines[scroll_num+usey] = [endch];
			}
		}
	}//»
	x = usex;
	y = usey;
	const dounshift=(uselines)=>{//«
		if ((uselines[cy()].length) > w) {
			let use_char = uselines[cy()].pop()
			if (!uselines[cy()+1]) uselines[cy()+1] = [use_char];
			else uselines[cy()+1].unshift(use_char);
			if (x==w) {
				x=0;
				y++;
			}
			for (let i=1; line = uselines[cy()+i]; i++) {
				if (line.length > w) {
					if (uselines[cy()+i+1]) uselines[cy()+i+1].unshift(line.pop());
					else uselines[cy()+i+1] = [line.pop()];
				}
				else {
					if (uselines[cy()+i-1].length > w) {
						line.unshift(uselines[cy()+i-1].pop());
					}
				}
			}
		}
	};//»
	dounshift(lines);
	if (!echo_mode) dounshift(shadow_lines);
	scroll_into_view(8);
	if (!if_no_render) render();
	textarea.value = "";
};//»
const handle_priv=(sym, code, mod, ispress, e)=>{//«

//	if (ispress && (getch_cb||getch_loop_cb)){
	if ((getch_cb||getch_loop_cb)){
		if (!ispress) {
			if (sym == "c_C") return do_ctrl_C();
	//		if (sym == "d_C") return do_ctrl_D();
	//		num_ctrl_d = 0;
			if (getch_cb) {
	//			getch_cb(String.fromCharCode(code));
				getch_cb(sym);
				getch_cb = null;
			}
	//		else if (getch_loop_cb) getch_loop_cb(String.fromCharCode(code));
			else if (getch_loop_cb) getch_loop_cb(sym);
		}
		return;
	}
	if (cur_shell&&cur_shell.stdin){}
	else if (sleeping) {
		if (ispress || sym=="BACK_") return;
	}
	
	if (!lines[cy()]) {
		if (code == 75 && alt) return;
		else {
			if (cy() > 1 && !lines[cy()-1]) set_prompt();
			else lines[cy()] = [null];
		}
	}
	let ret = null;
 	if (ispress) {
		num_ctrl_d = 0;
//		if (scroll_cursor_mode) {exit_scroll_cursor();return;}
		if (buffer_scroll_num!==null){
			buffer_scroll_num = null;
			x = hold_x;
			y = hold_y;
			render();
		}
		if (cur_scroll_command) insert_cur_scroll();
		if (code == 0) return;
		else if (code == 1 || code == 2) code = 32;
		else if (code == 8226 || code == 9633) code = "+".charCodeAt();
		else if (code == 8211) code = "-".charCodeAt();
		else if (code == 3) {}
		else if (code < 32) code = 127;
		ret = handle_letter_press(String.fromCharCode(code)); 
	}
	else {
		if (sym == "d_C") return do_ctrl_D();
		num_ctrl_d = 0;
//SDJK
		if (sym=="PGUP_S"||sym=="PGDOWN_S") return handle_buffer_scroll(sym==="PGUP_S");
		if (buffer_scroll_num!==null){
			buffer_scroll_num = null;
			x = hold_x;
			y = hold_y;
			render();
		}
		if (code >= 37 && code <= 40) handle_arrow(code, mod, sym);
		else if (sym=="HOME_"||sym=="END_") handle_page(sym);
		else if (code == KC['DEL']) handle_delete(mod);
		else if (sym=="TAB_") handle_tab();
		else if (sym=="BACK_")  handle_backspace();
		else if (sym=="ENTER_") {
			if (getch_cb) {
				getch_cb();
				getch_cb = null;
			}
			else if (getch_loop_cb) getch_loop_cb(null, true);
			else handle_enter();
		}
		else if (sym == "c_C") do_ctrl_C();
		else if (sym == "k_C") do_clear_line();
		else if (sym == "y_C") {
			for (let i=0; i < current_cut_str.length; i++) handle_letter_press(current_cut_str[i]);
		}
		else if (sym == "c_CAS") clear();
		
		else if (sym=="a_C") {//«
			e.preventDefault();
			if (cur_scroll_command) insert_cur_scroll();
			x=prompt_len;
			y=cur_prompt_line - scroll_num;
			if (y<0) {
				scroll_num+=y;
				y=0;
			}
			render();
		}//»
		else if (sym=="e_C") {//«
			if (cur_scroll_command) insert_cur_scroll();
			y=lines.length-scroll_num-1;
			if (y>=h){
				scroll_num+=y-h+1
				y=h-1;
			}
			if (lines[cy()].length == 1 && !lines[cy()][0]) x = 0;
			else x=lines[cy()].length;
			render();
		}//»
else if (sym=="l_A") log(line_colors);
	}
	return ret;
};
//»

const check_scrolling=()=>{
	if (is_scrolling){
		scroll_num = scrollnum_hold;
//		y = yhold;
		is_scrolling = false;
		render();
		return true;
	}
	return false;
}

const handle=(sym, e, ispress, code, mod)=>{//«
	let marr;
	if (is_scrolling){
		if (!ispress) {
			if (sym.match(/^[A-Z]+_$/)){
				if (sym==="SPACE_") return;
			}
			else return;
		}
		scroll_num = scrollnum_hold;
		is_scrolling = false;
		render();
		return;
	}
	if (e && sym=="d_C") e.preventDefault();

	if (!ispress) {//«
		if (sym == "=_C") {
			e.preventDefault();
			set_new_fs(gr_fs+1);
			return;
		}
		else if (sym == "-_C") {
			e.preventDefault();
			if (gr_fs-1 <= min_fs) return;
			set_new_fs(gr_fs-1);
			return;
		}
		else if (sym=="0_C") {
			gr_fs = def_fs;
			set_new_fs(gr_fs);
			return;
		}
		else if (sym=="c_CS") return do_clipboard_copy();
		else if (sym=="v_CS") return do_clipboard_paste();
		else if (sym=="a_CA") return copy_text(get_buffer(true), "Copied: entire buffer");
//		else if (marr=sym.match(/^([0-9])_CAS$/)) return copy_prev_line(parseInt(marr[1]));
	}//»
	if (code == KC['TAB'] && e) e.preventDefault();
	else await_next_tab = null;
	if (e&&sym=="o_C") e.preventDefault();

	if (pager && (!ispress || (ispress&&term_mode=="shell"))) {//«
		pager.key_handler(sym, e, ispress, code);
		return 
	}//»
	else if (editor) return editor.key_handler(sym, e, ispress, code);

	if (ispress){}
	else if (!sym) return;

	handle_priv(sym, code, mod, ispress, e);
};
this.onkeydown=(e,sym,mod)=>{handle(sym,e,false,e.keyCode,mod);};
this.onkeypress=(e)=>{handle(e.key,e,true,e.charCode,"");};
this.onkeyup = (e,sym)=>{
if (editor && editor.key_up_handler) editor.key_up_handler(sym,e);
};
//»

//»
//FileObj«
const FileObj=function(flags) {

let _parser, _fent, _read, _write, _seek, _buffer, _iter=0;
let thisobj=this;

this.reset=_=>{//«
	thisobj.read = _read;
	thisobj.write = _write;
	thisobj.seek = _seek;
};//»
this.set_reader=reader_arg=>{thisobj.read = reader_arg;};
this.set_writer=writer_arg=>{thisobj.write = writer_arg;};
this.set_seeker=seeker_arg=>{thisobj.seek = seeker_arg;};
this.set_parser=parser_arg=>{_parser = parser_arg;};
const Reader=function() {//«
	thisobj.stdin_reader = true;
	this.is_terminal = true;
	let cbarg;
	this.readline=cb=>{cbarg = cb;}
	this.line = (cb, if_noend)=>{
		_parser.stdin = (str, cancel)=>{
			if (str) str = str.replace(/\n$/,"");
			else if (cancel) return cb(termobj.EOF);
			cb(str);
			if (cbarg) cbarg(str);
			if (!if_noend) _parser.stdin = null;
		}
	}
};//»
const Seeker=function() {//«
	this.start=_=>{}
	this.end=_=>{}
};//»
const Writer=function() {//«
	this.is_terminal = true;
	if (flags.error) {
		this.line = resperr; 
		this.ch = resperrch; 
		this.lines = resperrlines; 
		this.object = resperrobj; 
	}
	else {
		this.line = respsucc;
		this.object = respsuccobj; 
		this.ch = respsuccch;
		this.lines = respsucclines;
		this.blob = respsuccblob;
		thisobj.stdout_writer = true;
	}
	this.flush=_=>{}
};//»

if (flags.read) _read = new Reader();
if (flags.write) _write = new Writer();
_seek = new Seeker();
thisobj.reset();
return thisobj;

};

const make_default_files=()=>{//«
	var arr = [];
	arr[0] = new FileObj({read:true});
	arr[1] = new FileObj({write:true});
	arr[2] = new FileObj({write:true,error:true});
	return arr;
};//»
this.FILES = make_default_files();

//»

//Startup«
const start=async()=>{//«
	let mods = window[__OS_NS__].mods;
	fsapi=globals.fs.api;
	const cursorinit=()=>{if(global_winname)topwin.title=global_winname;setTimeout(()=>{sleeping=null;},5);}
	const init=async()=>{
		shell = new mods["util.shell"](Core, termobj);
		if(init_str) {
			respsucclines(["Initializing the system..."]);
			await execute(init_str, true, true);
			if (init_cb) return init_cb(topwin);
		}
		if (init_prompt) respsucclines(init_prompt.split("\n"));
		did_init = true;
		await execute(load_com, true);
		cursorinit();
	};
	const load_mods=async()=>{
//		if (mods["util.shell"]&&mods["util.pager"]) return init();
		if (mods["util.shell"]) return init();
		let rv = await capi.loadMod("util.shell");
		if (!rv){
			main.pad=10;
			main.bgcol="#000";
			main.tcol="#aaa";
			main.fs=21;
			main.innerHTML ="<br><div style='text-align:center;color:#f55;font-size:34;font-weight:bold;'>Error</div><br><b>Fatal: the util.shell module could not be loaded</b>";
			return;
		}
/*
		rv = await capi.loadMod("util.pager");
		if (!rv) resperr("Could not load the system pager!");
*/
		init();
	}
	sleeping = true;
	let load_com;
	let rv = await fsapi.readHtml5File(`${globals.home_path}/.bashrc`);
	cur_dir = get_homedir();
	if (rv) load_com = rv;
	else load_com = ":";
	load_mods();
};//»

(async()=>{

let gotbuf = Core.get_appvar(topwin, "BUFFER");
if (!gotbuf) gotbuf = await capi.getHistory("shell");
buffer = gotbuf;

let gotfs = localStorage.Terminal_fs;
if (gotfs) {
	let val = strnum(gotfs);
	if (isnum(val,true)) gr_fs = val;
	else {
		gr_fs = def_fs;
		delete localStorage.Terminal_fs;
	}
}
else gr_fs = def_fs;
wrapdiv.fs = gr_fs;
resize();
if (globals.fs) return start();
await capi.loadFs();
await capi.initFs(!arg.is_app);//If is_app, we don't reinit
start();

})();


//»

}

