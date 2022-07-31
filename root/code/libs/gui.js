export const lib = (comarg, args, Core, Shell)=>{



const COMS = {//«

'render':async args=>{//«

let time_interval;
let POPUP_DIMS=`width=${window.outerWidth-100},height=${window.outerHeight-100}`;

const Time = function(SECS,par){//«
const time_arr=(secs)=>{//«
	let arr;
	if (secs) arr = new Date(secs*1000).toString().split(" ");
	else arr = new Date().toString().split(" ");
	let tm = arr[4].split(":");
	return [arr[3],arr[1],arr[2].replace(/^0/,""),tm[0],tm[1],tm[2]];
};//»
let d = par.ownerDocument.createElement('span');
let TMARR = time_arr(SECS);
this.update=()=>{
if (!d.isConnected) return;
let now = Math.floor(Date.now()/1000);
let diff = now - SECS;
let num, unit;
let val;
let pref="";
if (diff <= 15) val = "just now";
else if (diff < 60){
	pref="<";
	num = 1;
	unit = "min";
}
else if (diff < 3600){
	num = Math.floor(diff/60);
	unit="min";
}
else if (diff < 86400){
	num = Math.floor(diff/3600);
	unit = "hr";
}
else{
	num = Math.floor(diff/86400);
	unit = "day";
}
if (!val) {
	if (num!==1) unit = unit+"s";
	val = `${pref}${num}\xa0${unit}\xa0ago`
}
d.innerText = val;
};
this.kill=()=>{
};
par.appendChild(d);
this.update();
};//»
const write_to_win = (str, opts={}) => {//«
	let outmake = (which) => {
		return w.document.createElement(which);
	};
	let wrapper;
	let content;
	let body;
	if (is_external) {
		wrapper = outmake('div');
		content = outmake('div');
	}
	else {
		wrapper = mkdv();
		content = make('div');
	}
	wrapper.style.border = "1px dotted gray";
	wrapper.style.margin = 7;
	wrapper.style.padding = 7;
	content.innerHTML = str;
	if (opts.bgcol) wrapper.style.backgroundColor=opts.bgcol;
	if (opts.tcol) wrapper.style.color=opts.tcol;
	if (opts.center) wrapper.style.textAlign="center";
	wrapper.appendChild(content);
	if (is_external) {
		body=w.document.body;
	}
	else {
		body = w.main;
	}
	if (opts.prepend && body.childElementCount){
		body.insertBefore(wrapper, body.childNodes[0]);
	}
	else body.appendChild(wrapper);
	
	if (!is_external){
		let lns = Array.from(body.getElementsByTagName("a"));
		for (let ln of lns){
			let win;
			ln.onclick=e=>{
				e.preventDefault();
				e.stopPropagation();
				if (win&&!win.closed){
					win.focus();
					return;
				}
				win = window.open(ln.href, ln.href,POPUP_DIMS)
			};
			ln.onmousedown=(e)=>{
				e.preventDefault();
				e.stopPropagation();
			}
			ln.oncontextmenu=e=>{
				e.stopPropagation();
			};
		}
	}
	return content;
};//»
const write_time=()=>{//«
	if (time_interval) clearInterval(time_interval);
	let tm = new Date().toLocaleTimeString();
	let arr = new Date().toUTCString().split(" ");
	arr.pop();
	arr.pop();
	let date = arr.join(" ")
	let elem = write_to_win(`<b>Updated: ${tm} ${date}</b>`);
	let tmsp = elem.ownerDocument.createElement('div');
	elem.style.display="flex";
	elem.style.justifyContent="space-between";
	elem.appendChild(tmsp);
	let time = new Time(Math.floor(Date.now()/1000), tmsp);
	time_interval=setInterval(()=>{
		time.update();
	},1000);
};//»
const clear_win=()=>{//«
	if (is_external) w.document.body.innerHTML="";
	else w.main.innerHTML="";
};//»

if (!_Desk) return cberr(ENODESK);
let opts = failopts(args,{LONG:{external:1,popup:1,append:1,title:3,icon:3},SHORT:{x:1,p:1,a:1,t:3,i:3}});
if (!opts) return;
let w;
let is_external = opts.external||opts.x;
let use_title = opts.title||opts.t;
let use_title_icon;
if (opts.icon||opts.i){
	try{
		use_title_icon=JSON.parse(opts.icon||opts.i);
	}
	catch(e){
		cberr("Could not parse the 'icon arg'");
		return;
	}
}
read_stdin(rv=>{//«
	if (is_external && w.closed){
		werr("The external window has been closed!");
		cbok();
		return;
	}
	if (isEOF(rv)){
		if (time_interval) clearInterval(time_interval);
		if (w) write_to_win('<h2 style="margin:0;">Stopped</h2>', {prepend:true,bgcol:"#900",tcol:"#fff",center:true});
		cbok();
		return;
	}
	if (isarr(rv)&&isstr(rv[0])) rv = rv.join("\n");
	if (!isstr(rv)||rv==="\x00"){
		if (isobj(rv)) {
			if (rv.CLEAR===true) return clear_win();
			if (rv.TIME===true) return write_time();
		}
		return;
	}
	write_to_win(rv);
});//»
if (is_external) {//«
	if (opts.popup||opts.p) w=window.open(undefined, `render::${window.location.href}`,POPUP_DIMS);
	else w=window.open(undefined, `render::${window.location.href}`);
}
else {
	w = await _Desk.openApp("None",true)
	if (use_title) w.title = use_title;
	if (use_title_icon) w.titleimg = use_title_icon;
	let mn = w.main;
	w.obj.onfocus=()=>{
		mn.focus();
	};
	w.obj.onkill=()=>{
		werr("The window has been closed!");
		cbok();
	};
	mn.overy="scroll";
	mn.tabIndex="-1";
	mn.style.outline="none";
	mn.style.userSelect="text";
	mn.focus();
}//»

},//»
	'cmenu': function() {//«
		let opts = failopts(args,{});
		if (!opts) return;
		if (!_Desk) return cberr("No Desktop!");
		let which = args.shift();
		if (which=="on") _Desk.set_cmenu_state(true);
		else if (which=="off") _Desk.set_cmenu_state(false);
		else return cberr("Invalid (or no) arg");
		cbok();
	},//»
	'popup': function() {//«
		let didpop=false;
		const dopop=(str)=>{//«
			if (didpop) return;
			didpop=true;
			WDG.make_popup({
				WIDTH: wid,
				HEIGHT: hgt,
				WIDE:opts.wide,
				VERYBIG:opts.huge,
				STR: str,
				TYPE: type, 
				TITLE: title, 
				INPUT: input, 
				CB: ret=>{
					if (util.isstr(ret)) cbok(ret);
					else cbok();
				}
			});
		};//»
		if (!_Desk) return cberr(ENODESK);
		let opts = failopts(args,{//«
			SHORT:{
				i:1,
				w:3,
				h:3
			},
			LONG: {
				input : 1,
				type: 3,
				title: 3,
//				text: 3,
				wide:1,
				huge:1,
				width:3,
				height:3
			}
		});//»
		if (!opts) return;
//		if ((opts.huge||opts.h)&&(opts.wide||opts.w)) return cberr("Conflicting size args");
		let wid,hgt;
		let widstr = opts.width||opts.w;
		if (widstr){
			wid = widstr.ppi();
			if (!NUM(wid)) return cberr(`${widstr}: invalid width`);
		}
		let hgtstr = opts.height||opts.h;
		if (hgtstr){
			hgt = hgtstr.ppi();
			if (!NUM(hgt)) return cberr(`${hgtstr}: invalid height`);
		}

		let type = opts.type||"alert";
		let types = ["idea","alert","error","ok","yesno"];
		if (!types.includes(type)) return cberr("Invalid type: " + type);
		let title = opts.title||"Script alert";
		let input = opts.input||opts.i;
		let rdr = get_reader();
		let text = args.join(" ");
		if (rdr.is_pipe){
			if (text) return cberr("Have stdin with text!");
			let s='';
			read_stdin(rv=>{
				if (isEOF(rv)){
					dopop(s);
					return;
				}
				if (isstr(rv)){
					if (!s) s = rv;
					else s+="\n"+rv;
				}
				else if(isarr(rv)){
					for(let ln of rv){
						if (!s) s = ln+"";
						else s+="\n"+ln;
					}
				}
				else{
					if (!s) s = rv+"";
					else s+="\n"+rv;
				}
			});
		}
		else dopop(text);
	},//»
	'setbgcol':()=>{//«
		if (!_Desk) return cberr(ENODESK);
		let col = args.shift();
		if (!col) return cberr("No color arg!");
		_Desk.set_bgcol(col);
		cbok();
	},//»
	'setbgimg':async()=>{//«
		if (!_Desk) return cberr(ENODESK);
		let path = args.shift();
		if (!path) return cberr("No img file path arg!");

		let useop = 1;
		let opstr = args.shift();
		if (opstr) {
			let num = opstr.pf();
			if (!(NUM(num) && num > 0 && num <= 1)) return cberr("Invalid opacity arg");
			useop = num;
		}
		let rv = await readFile(path);
		if (rv===false) return cberr(`${path}:\x20not found`);
		if (!rv instanceof Blob) {
console.log(rv);
			return cberr("Did not receive a blob (check console)");
		}
		let url = URL.createObjectURL(rv);
		_Desk.set_bgimg(url, useop);
		cbok();
	}//»

}//»

if (!comarg) return Object.keys(COMS);

//Imports«

let Desk = Core.Desk;
let log = Core.log;
let cwarn = Core.cwarn;
let cerr = Core.cerr;

let globals = Core.globals;
let util = globals.util;
let WDG = globals.widgets;

const{
	isarr,
	isstr,
	isobj,
	make,
	mkdv
}=util;
const {
	ENODESK,
	readFile,
	cbok,
	cberr,
	wout,
	werr,
	werrarr,
	get_options,
	failopts,
	read_stdin,
	get_reader,
	termobj
} = Shell;
const{
isEOF
}=Core.api;
let _Desk;
if (termobj) _Desk = Desk;

const NUM=Number.isFinite;
//»

COMS[comarg](args);


}

/*

'style': function(args) {//«
	var _ = this.exports;
	if (!_Desk) return _.cberr(_.ENODESK);
	var ret = _.getopts(args,{//«
		LONG: {
			bgop:3,
			bgcol: 3,
			bgimg: 3,
			bgrep:3,
			bgpos:3,
			bgsz:3
		}
	});//»
	var opts = ret[0];
	var err = ret[1];
	if (err.length) {
		_.werrarr(err);
		_.cberr();
		return;
	}
	var keys = Core.api.getKeys(opts);
	for (let k of keys) _Desk.styler(k, opts[k]);
	_.cbok();

},//»

*/


