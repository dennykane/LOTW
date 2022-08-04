
/*xTODOx

XXX On deleting notifications, need to update the bottom status!!!!! XXX


XXX GETTING LAST KEY!!! XXX

let ref = get_ref(`/v0/item/${cur_elem.id}/kids`);
ref.limitToLast(1).once('value',snap=>{
	let k = parseInt((Object.keys(snap.val()))[0]);
	log(k); //<-- Number
});




This ref.on.child_added does not seem great/reliable. Let's just use once.value on the kids,
but do an exponential backoff, depending on certain velocity/expectation calculations.




If an item is hotkey refreshed that is being waited for in notifications, then we have to
update the notification and deduct it from the total_new that is in the status_bar


When we goto_item(), we need to check if 

First, do a ref.once to get the entire new kids list, and then wait on incoming new messages 
with ref.on('child_added').



For all refs we are waiting on with ref.on/ref.once, we need to save them in an array 
and then in onkill, we need to do a ref.off



We need 3 screens (at least);

1) Online forum (for browsing currently updating lists of story items)

2) Offline forum (for displaying the items that the user is actively engaged
with, that are not listed in the online forum)

3) Notification area for updates to the messages (eg new comments) that the
user is actively listening for. These will have , eg., buttons/links that will
invoke goto_item(path).



Wait on the number of kids for a given item to increase from current amount...


Every item is located by a fullpath from the toplevel item, accessible via item.path()


Create a directory in ~/.data in which to store the fullpaths of the items that we are
waiting on. Make a file in this directory called, eg, "update_items"

let dirpath =`${globals.home_path}/.data/apps/net/HN`
if (!await fs.mkDir(dirpath)){
	poperr(`Could not get/make directory: ${dirpath}!`);
	return;
}


We have goto_item, which, given a fullpath, goes to (toggling all the parent
items to open) and focuses the item.

The only problem is that goto_item fails if it is not on the current toplist
(resident in memory and showing in the app).  To fix this, we need another kind
of list screen on which we can put all of the toplevel (story) items that we
get from the database.

We are going to wait on items for when they get a child_added event on their 'kids' array
field. Then we can just retrieve the new kids list from firebase, and add this to the item object,
and then save this to the datastore.




await_notices() is where we are going to either: 

1) Find the top story items in the "live list", 
2) or get it from the db (or reget if not in it for some reason), and then add it to into the Offline list.






//https://news.ycombinator.com/reply?id=22514747&goto=item%3Fid%3D22514004%2322514747
//												 goto=item ? id = 22514004 # 22514747
//																  original 
//																    story
*/

//const DEVMODE = true;
const DEVMODE = false;
const MIN_POLL_SECS = 10;
const MIN_POLL_MS = MIN_POLL_SECS*1000;
let MAX_NOTICE_LIMIT = 5;

export const app=function(arg){//«

//Imports«

const {Core,Main:_Main,Desk,NS}=arg;

const Topwin=_Main.top;
const{log,cwarn,cerr,globals}=Core;
const{util,dev_env,dev_mode}=globals;
const{isarr,isobj,isstr,mkdv,mksp,mk}=util;

let popup, popok, poperr,popyesno, popin, popinarea;
let widgets;

let fs;

//»

//Var«

let working = false;
let poll_interval;
let poll_interval_ms = 60000;

const NOTICES={};
let MESSLEN = 100;
let total_new = 0;
let MIN_REGET_MINS = 3;
let GET_NUM_STORIES = 30;
//let GET_NUM_STORIES = 1;

let MAX_CACHE_DIFF_MINUTES = 10;


//const REFS=[];
let notices=[];

let toplist;
let offlist;
let notiflist;
let notif_elem_hold;
let online_elem_hold;
let offline_elem_hold;

let last_path;

let FS = 18;

let last_get;
let is_getting = false;

const DEF_STORY_TYPE = "top";

let cur_elem;

//let time_interval;
//const TIMES=[];


let POPUP_WID=window.outerWidth-100;
let POPUP_HGT=window.outerHeight-100;

let ifapi;
let db;

//const USERDATAPATH =`${globals.home_path}/.data/apps/net/HN`
//const NOTICESFILEPATH =`${USERDATAPATH}/notices`

let USERDATAPATH;
let NOTICESFILEPATH;

const HN_DB_NAME="hackernews";
const HN_DB_VERS=1;
const HN_ITEM_STORE_NAME="items";
const CACHE_PATH = '/var/cache/apps/net/HN';
const HN_BASE_URL = "https://hacker-news.firebaseio.com";
const HN_APPNAME = "hackernews";

//»

//DOM«
const nopropdef=(e)=>{
	e.preventDefault();
	e.stopPropagation();
};
const allnopropdef=(elem)=>{
	elem.onmousedown = nopropdef;
	elem.onclick = nopropdef;
	elem.ondblclick = nopropdef;
};

let statbar = Topwin.status_bar;

_Main.pos="relative";
_Main.bgcol="#030303";
_Main.tcol="#ddd";
_Main.fs=FS;

let Main;

let Online = mkdv();
Online.pos="absolute";
Online.w="100%";
Online.h="100%";
Online.loc(0,0);
Online.overy="scroll";
Online.tabIndex="-1";
Online.style.outline="none";
allnopropdef(Online);

let Offline = mkdv();
Offline.pos="absolute";
Offline.w="100%";
Offline.h="100%";
Offline.loc(0,0);
Offline.overy="scroll";
Offline.tabIndex="-1";
Offline.dis="none";
allnopropdef(Offline);


let Notif = mkdv();
Notif.pos="absolute";
Notif.w="100%";
Notif.h="100%";
Notif.loc(0,0);
Notif.overy="scroll";
Notif.tabIndex="-1";
Notif.dis="none";
allnopropdef(Notif);

_Main.add(Online);
_Main.add(Offline);
_Main.add(Notif);
Main = Online;


//»

//Classes«

const Item = function(arg, _num, _tabpar, _storyid, _paritem) {//«
//log(arg, _num, _par, _tabpar, _storyid);

this.data = arg;
this.type="item";
this.id = _storyid;
this.parent = _paritem;
this.number = _num;
this.tabpar = _tabpar;
this.user = arg.by;
let _path;

//DOM«

let win;
let is_story = arg.type==="story";
let level = _tabpar.tab_level+1;
let thead;
let ncoms;
let comprev;
let coms;
let comwin;
const main = mkdv();//main
allnopropdef(main);
main.is_active=false;

this.main = main;

main.classList.add("tabbable");

main.onescape = ()=>{//«
	if (cont.dis!=="none") {
		this.toggle();
		return true;
	}
	return false;
};//»

main.tabIndex="-1";
main.onfocus=()=>{
	cur_elem = this;
};
main.tab_level = level;
main.mar=10;
main.bor="1px dotted #aaa";
/*
main.onmousedown=()=>{//«
	if (cur_elem !== this){
		if (cur_elem&&cur_elem.blur) cur_elem.blur();
		this.focus();
	}
};//»
*/
//main.ondblclick=()=>{this.toggle();};

const head = mkdv();//header
head.pad=5;
let tit,host;
let info;
if (is_story) {//«
	thead = mkdv();
	info = mkdv();
	thead.dis="flex";
	thead.jsc="space-between";
//	const sc = mkdv();//score
//	sc.innerHTML = `${_num+1}\xa0\xa0(${arg.score} points)`;
	tit = mkdv();//title
	tit.fw="bold";
//	tit.style.whiteSpace="nowrap";
//	tit.innerText = `${_num+1})\xa0\xa0${arg.title}||""`;
//log(arg.title.split(/ +/))
	if (DEVMODE) tit.innerText = (""+(_num+1)+" ").repeat(20).slice(0,20);
	else tit.innerText = (_num+1)+"\xa0\xa0\xa0"+(arg.title||"");
//	host = mkdv();
//	if(arg.url) host.innerText = arg.url.split("//")[1].split("/")[0]
//	else host.innerText = "[self]";
	if (DEVMODE) host = (""+(_num+1)).repeat(10).slice(0,10)+".ext";
	else if(arg.url) host  = arg.url.split("//")[1].split("/")[0]
	else host  = "[self]";
//	thead.add(sc,tit, host);
}//»
const bhead = mkdv();
bhead.dis="flex";
const user = mkdv();
user.style.whiteSpace="nowrap";
user.innerText=arg.by||"?";
user.marr=20;
//const time = mkdv();
//time.marr=20;
//new Time(arg.time, time);


if (is_story) {//«


//bhead.style.alignItems="end";
//bhead.style.justifyContent="end";
//	info.innerText = `(${arg.descendants})\xa0\xa0\xa0${host}`;
//	info.innerText = `${arg.descendants}`;

	tit.tcol=getcolor(arg.descendants);

	info.innerText = "\xa0\xa0"+host;
//	info.padl=3;
	thead.add(tit,info);
	head.add(thead);
}//»
else if(arg.type==="comment"){//«
	comprev = mkdv();

	comprev.style.userSelect="text";
	comprev.over="hidden";
	comprev.style.whiteSpace="nowrap";
//	comprev.fs = FS;
//	bhead.add(user,time,comprev);
	bhead.add(comprev);
	head.add(bhead);
	comprev.innerHTML = "\xa0";
}//»
else{

//cwarn(`Skipping '${arg.type}'`);
//return;

}

const cont = mkdv();//content
cont.pad=5;
//cont.fs=FS;
cont.dis="none";
const body = mkdv();//body
//body.style.whiteSpace ="pre-wrap";
cont.add(body);
cont.onmousedown
body.classList.add("body");
body.tabIndex="-1";
body.tab_level = level+1;
body.pad=5;
//log(body);
if (!arg.url) {
//arg.text.
//let s
	body.innerHTML = (arg.text&&arg.text.replace(/<\/?pre>/g, ""))||"<i>[none]</i>";
//log(body);
	body.style.userSelect="text";
}
else {

let a = mk('a');
a.href = arg.url;
a.tabIndex="-1";
a.innerHTML = arg.url;
body.add(a);
//	this.gotolink=()=>{
this.gotolink=()=>{a.click();};

}
//else body.innerHTML=`<span><u>${arg.url}</u></span>`;
//if (_num===0){
//log(main);
//}
body.onenter=()=>{//«
	if (arg.url){
		if (win&&!win.closed){
			win.focus();
			return;
		}   
		win = window.open(arg.url, arg.url,`width=${POPUP_WID},height=${POPUP_HGT}`)
	}
};//»

body.onfocus=()=>{
log("BODYFOCUS!");
//	cur_elem = body;
};
const combut = mkbut("Comment",cont,()=>{//«
	let url;
	if (arg.id===_storyid) url=`https://news.ycombinator.com/item?id=${_storyid}`;
	else url=`https://news.ycombinator.com/reply?id=${arg.id}&goto=item%3Fid%3D${_storyid}%23${arg.id}`;
	if (comwin&&!comwin.closed){
		comwin.focus();
		return;
	}   
	comwin = window.open(url, url,`width=${POPUP_WID},height=${POPUP_HGT}`)
});//»
this.comment=()=>{
	combut.click();
};
combut.mart=10;
combut.classList.add("tabbable","button");
combut.tabIndex="-1";
combut.tab_level = level+1;

const foot = mkdv();//footer
cont.add(foot);
main.add(head,cont);

//_par.add(main);
if (comprev){//«
//log(comprev);
//log(comprev.clientHeight);
//	comprev.h = comprev.clientHeight;
//_Main.fs=FS;
//comprev.h = FS+1;
//	comprev.h = FS+1;

	comprev.innerHTML = html_to_str(arg.text||"<i>[none]</i>", 200);
	comprev.flg=1;
//	comprev.ta="right";
}//»

do_links(main);

//»

this.toggle = ()=>{//«
	return new Promise(async(Y,N)=>{
		if (cont.dis==="none") {
			cont.dis="";
			main.is_active=true;
			if (comprev) comprev.dis="none";
		}
		else {
			cont.dis="none";
			main.is_active=false;
			if (comprev) comprev.dis="";
			main.scrollIntoView();
			return Y();
		}
		if (arg.type==="story"||arg.type=="comment"){
			if (coms) return Y();
		}
		else return cwarn(`Toggle: ${arg.type}`);

		coms = mkdv();
		foot.add(coms);
		coms.mart=10;

		let kids = arg.kids||[];
		let len = kids.length;

		let list = new List(`Comments\x20(${len})`, coms, level+1, _storyid, this);
		this.list = list;
		list.item = this;
		for (let i=0; i < len;i++){
			let id=kids[i];
			let item = await get_item(id);

			if (!item){
				poperr(`Error getting item: ${id}`);
				return;
			}
			list.add(item);
		}
		Y();
	});
};//»
this.open=()=>{if(cont.dis==="none")return this.toggle();}
this.close=()=>{if(!cont.dis)return this.toggle();}
this.path=(if_str)=>{//«
	if (_path) {
		if (if_str) return JSON.stringify(_path);
		return _path;
	}
	let cur = _paritem;
	let arr = [arg.id];
	while(cur){
		arr.unshift(cur.data.id);
		cur = cur.parent;
	}
	_path = arr;
	if (if_str) return JSON.stringify(_path);
	return _path;
};//»
this.onenter=()=>{//«
	if (cont.dis==="none") return;
	this.list.onenter();
};//»
this.focus=()=>{main.focus();};
this.getkids = ()=>{
	return (arg.kids || []).sort();
};

};//»
const List = function( _tit, _par, _level, _storyid, _paritem) {//«

this.type = "list";
this.id = _storyid;
this.parent = _paritem;

const ALL = [];
this.kids = ALL;
const m = mkdv();//main

_par.add(m);
//log(_storyid);
if (!_storyid) {
	m.classList.add("tabbable","list");
//		m.mar=1;
}
m.classList.add("list");
m.tabIndex="-1";
m.tab_level=_level;
const n = mkdv();//name
//	n.fs=_fs;
n.fw="bold";
n.innerText=_tit;
//	n.marl=n.mart=10;
n.padl=n.padt=5;
n.marb=10;

const l = mkdv();//list
m.add(n,l);
//log(m);
m.mar=2;
this.onenter=()=>{
	if (ALL[0]) ALL[0].main.focus();
};

this.add = (item)=>{
	let rv = new Item(item, ALL.length, m, item.id||_storyid, _paritem)
	rv.list = this;
//log(rv.main);
	m.add(rv.main);
	ALL.push(rv);
};
this.replace=(old, nw)=>{

//let which = ALL.indexOf(old);

//if (which < 0) return cerr("REPLACE!?!?!?!");
nw.list = this;
ALL.splice(old.number, 1, nw);
old.main.replaceWith(nw.main);
nw.main.focus();

};
m.onfocus=()=>{
	cur_elem = this;
	if (!_storyid){
		m.bor="1px solid #fff";
		Main.scrollTop = 0;
	}

};
m.onblur=()=>{
if (!_storyid) {
	m.bor="1px solid transparent";
	cur_elem = null;
}
};
if (!_storyid) {
	m.onescape=()=>{
		if (cur_elem == this){
			m.blur();
			return true;
		}
	};
}
this.focus=()=>{
	m.focus();
};

};//»
const Notice = function(_item, _path, _ndesc){//«

let pathstr = JSON.stringify(_path);

const update=(add)=>{//«

//cwarn(`Updating ${id} => +${nnewkids}`);
	if (nnewkids) numsp.innerHTML=`(${nkids}<span style="color:#0f0">+${nnewkids}</span>)`;
	else numsp.innerHTML=`(${nkids})`;
	total_new+=add;
	stat_total();

};//»

this.type="notice";//«
let id = _item.id;
let kids=[];
//let newkids=[];
if (_item.kids) kids = _item.kids;
let nkids = kids.length;
let nnewkids = 0;
this.item = _item;
this.id=id;
//»
let m = mkdv();//«
let numsp = mksp();
numsp.marr=5;
numsp.innerText=`(${nkids})`;

let messp = mksp();
messp.innerHTML = get_notice_message(_item, _ndesc);
m.mar=2;
m.classList.add("tabbable");
m.tabIndex="-1";
m.add(numsp, messp);
Notif.childNodes[0].add(m);

//»

m.onfocus=()=>{cur_elem=this;};

this.delete = async()=>{//«

//log("DELETE", _path);
//log(REFS, JSON.stringify(_path));
let s=JSON.stringify(_path);
let ind = notices.indexOf(s);
if (ind < 0) return cerr("The path was not in notices!!!",notices, s);
notices.splice(ind, 1);
if (!await fs.writeFile(NOTICESFILEPATH, JSON.stringify(notices))){
	cwarn(`There was a problem writing the file ${NOTICESFILEPATH}`);
}
delete NOTICES[s];
//ref.off();
m.del();
notiflist.focus();
total_new -= nnewkids;
stat_total();

};//»
this.onenter=async()=>{//«
//	let no_refresh = false;
//	if (newkids.length <= kids.length) no_refresh = true;
//	if (newkids.length <= kids.length) no_refresh = true;
	let got;
	if (! (got = await goto_item(JSON.parse(pathstr), !!nnewkids))){
cwarn("Failed to goto item so not updating notification status");
return;
	}
	if (!nnewkids) return;
//	_item.kids = newkids;
//	kids = _item.kids;
	_item = got;
	if (!await add_db_item(_item)){
//		_item.kids=kids;
cerr("Could not add the updated item!");
		return;
	}

//	kids = newkids;
	kids = _item.kids;
	nkids = kids.length;
//	newkids = [];
	total_new-=nnewkids;
	stat_total();
	nnewkids = 0;
	numsp.innerHTML=`(${nkids})`;
};//»
this.setkids=kidsarg=>{//«

	let diff = kidsarg.length - kids.length;
	total_new -= diff;
	stat_total();

	kids = kidsarg;
	nkids = kids.length;
//	newkids = [];
	nnewkids = 0;
	numsp.innerHTML=`(${nkids})`;

};//»
this.focus=()=>{m.focus();};
this.getkids = ()=>{
//	return (arg.kids || []);
let arr=kids.concat(newkids).sort();
return arr;
};
//m.onmousedown=()=>{
//	m.focus();
//};


let last_poll_time = 0;
this.poll = ()=>{
	let time = new Date().getTime();
	if (last_poll_time){
		if (time - last_poll_time < MIN_POLL_MS){
cwarn(`${id}) Must wait > ${MIN_POLL_MS} ms between polls!`);
			return;
		}
	}
	last_poll_time = time;
	let ref = get_ref(`/v0/item/${_item.id}/kids`);
	ref.limitToLast(1).once('value',snap=>{
		let totkids;
		let val = snap.val();
		if (!val) totkids = 0;
		else totkids = parseInt((Object.keys(val))[0])+1;
		let diff = totkids - (nkids+nnewkids);
log(`${id}) Diff: ${diff}`);
//		if (!diff) return;
		nnewkids+=diff;
		update(diff);
//if (diff > nnewkids){
//}
//		if (nnewkids) update(nnewkids);
	});
}
//this.poll();

/*
let refpath = `/v0/item/${_item.id}/kids`;//«
let ref = get_ref(refpath);
if (!ref) return cerr(`No ref from: ${refpath}`);


ref.on("child_added",snap=>{
	let messid = snap.val();
//log(messid);
	if (kids.includes(messid)){
//cwarn("INKIDS", messid);
		return;
	}
	else if (newkids.includes(messid)) {
//cwarn("INNEW", messid);
		return;
	}
//log("IN",messid);
	newkids.push(messid);
	nnewkids++;
	update(1);
});
*/
//REFS.push(ref);

/*
ref.once("value",snap=>{//«

	newkids = snap.val();
	if (!newkids) newkids = [];
	nnewkids = newkids.length - nkids;
	if (nnewkids < 0){
		cerr(`nnewkids(${nnewkids}) < 0 !?!?!?!`);
		return;
	}
	if (nnewkids>0) update(nnewkids);

	ref.on("child_added",snap=>{
		let messid = snap.val();
		if (kids.includes(messid)||newkids.includes(messid)) return;
		nnewkids++;
		update(1);
	});

});//»
*/

//»

}//»
const User =function() {//«

};//»


/*Old«
const Time = function(SECS,par){//«
const time_arr=(secs)=>{//«
	let arr;
	if (secs) arr = new Date(secs*1000).toString().split(" ");
	else arr = new Date().toString().split(" ");
	let tm = arr[4].split(":");
	return [arr[3],arr[1],arr[2].replace(/^0/,""),tm[0],tm[1],tm[2]];
};//»
let d = mksp();
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
	TIMES.splice(TIMES.indexOf(this), 1);
};
par.add(d);
TIMES.push(this);
this.update();
};//»
»*/

//»

//Funcs«

//Util«
const getcolor = n=>{
	let tcol;
//	let n = arg.descendants;
	if (n<6) tcol="#99e";//blue
	else if (n<12) tcol="#bbf";//light blue
	else if (n<25) tcol="#7ff";//turquoise
	else if (n<50) tcol="#8f8";//green
	else if (n < 100) tcol="#ff9";//yellow
	else if (n < 200) tcol="#fa5";//orange
	else tcol = "#f77";//red
	return tcol;	
};
//const update_times=()=>{for(let t of TIMES)t.update();}
const stat_total=()=>{//«
	let sty=' style="padding-left:5px;padding-right:5px;';
	let s = "s";
	if (total_new) {
		sty+=`background-color: #ccc;color: #000;font-weight: 900;"`;
		if (total_new==1) s = "";
	}
	else sty+='"';
	stat(`<span${sty}>${total_new} new message${s}</span>`);
};//»
const stat=(s)=>{
if (!s){
cerr("Got nothing in stat!!?!");
return;
}
	statbar.innerHTML=s;
};
const mkbut = (str, par, fn, opts={})=>{//«
	let butcol="e7e7e7";
	let butborcol="#ccc";
	let disabled = false;
	let d = mkdv();
//	make_tabbable(d, opts.tabLevel, opts.tabParent);
	d.bgcol=butcol;
	d.padt=d.padb=3;
	d.padr=d.padl=5;
	d.dis="inline-flex";
	d.ali="center";
	d.jsc="center";
//	d.fs=15;
	d.innerText=str;
	d.bor=`3px outset ${butborcol}`;
	d.onmousedown=()=>{if(disabled)return;d.bor=`3px inset ${butborcol}`;};
	d.onmouseup=()=>{if(disabled)return;d.bor=`3px outset ${butborcol}`;};
	d.onmouseout=()=>{if(disabled)return;d.bor=`3px outset ${butborcol}`;};
	d.win=Topwin;
	d.tcol="#000";
//	d.active_message = opts.message;
	d.onfocus=(e)=>{
//		cur_elem = d;
//		d.tcol="#00c";
//		stat();
	};
	d.onblur=(e)=>{
//		d.tcol="#000";
//		stat();
	};
	d.onclick=(e)=>{
		if (disabled) return;
		if (e.isTrusted||e===true) {
			fn();
//			stat();
			return 
		}
		d.bor="3px inset #aaa";
		setTimeout(() => {
			d.bor = "3px outset #aaa";
			fn();
//			stat();
		}, 200);
	};
//	if (par) par.add(d);
	d.disable=()=>{
		disabled=true;
		d.tcol="#777";
	};
	d.enable=()=>{
		disabled=false;
	};

	return d;
}//»
const focus_parent=elm=>{//«
	while (elm!==Main){
		if (elm.classList.contains("tabbable")) {
			elm.focus();
			return true;
		}
		elm = elm.parentNode;
	}
	return false;
};//»
const do_links=elm=>{//«
	let lns = Array.from(elm.getElementsByTagName("a"));
	for (let ln of lns){
		ln.tcol="#99f";
		let win;
		ln.onclick=e=>{
			e.preventDefault();
			e.stopPropagation();
			if (win&&!win.closed){
				win.focus();
				return;
			}   
			win = window.open(ln.href, ln.href,`width=${POPUP_WID},height=${POPUP_HGT}`)
		};
		ln.onmousedown=(e)=>{
			e.preventDefault();
			e.stopPropagation();
		}
		ln.oncontextmenu=e=>{
			e.stopPropagation();
		};
	}
};//»
const is_visible = which => {//«
	let mr = Main.getBoundingClientRect();
	let r = which.getBoundingClientRect();
	if(which.is_active) {
		if (r.top > mr.bottom || r.bottom < mr.top) return false;
		return true;
	}

	return (r.top >= mr.top-5 && r.bottom <= mr.bottom+5);
};//»
const cache_file=path=>{//«
	return new Promise(async(y,n)=>{
		let ent = await fs.getFsEntryByPath(`${CACHE_PATH}/${path}`);
		if (!ent) return y();
		ent.file(y);
	});
};//»
const file_to_buf=(file)=>{//«
	return new Promise((y,n)=>{
		let reader = new FileReader();
		reader.onloadend = function(e) {
			y(this.result);
		};
		reader.readAsArrayBuffer(file);
	});
};//»
const file_to_ints = (file)=>{//«
	return new Promise(async(y,n)=>{
		y(new Uint32Array(await file_to_buf(file)));
	});
};//»
const set_widgets=()=>{({popup, popok,poperr,popyesno, popin,popinarea}=widgets);};


//»
//Idb«
const open_db=()=>{//«
	return new Promise(async(y,n)=>{
		let req = indexedDB.open(HN_DB_NAME, HN_DB_VERS);
		req.onsuccess = function (evt) {
			db = this.result;
			y(true);
		};
		req.onerror = function (evt) {
cerr("openDb:", evt.target.errorCode);
			y();
		};
		req.onupgradeneeded = function (evt) {
log("openDb.onupgradeneeded");
			let store = evt.currentTarget.result.createObjectStore(HN_ITEM_STORE_NAME,{keyPath: 'id'});
			store.createIndex('type', 'type', { unique: false });
			store.createIndex('by', 'by', { unique: false });
			store.createIndex('time', 'time', { unique: false });
			store.createIndex('score', 'score', { unique: false });
		};
	});
}//»
const get_object_store=(store_name, mode)=>{//«
//   * @param {string} store_name
//   * @param {string} mode either "readonly" or "readwrite"
	let tx = db.transaction(store_name, mode);
	return tx.objectStore(store_name);
}//»
const add_db_item=(obj)=>{//«
	return new Promise(async(y,n)=>{
		let store = get_object_store(HN_ITEM_STORE_NAME, 'readwrite');
		let req;
		try {
//		  req = store.add(obj);
		  req = store.put(obj);
		}
		catch (e) {
cerr(e);
			y();
			return;
		}
		req.onsuccess = function (evt) {
//log("Insertion in DB successful");
			y(true);
		};
		req.onerror = function() {
cerr("addPublication error", this.error);
			y();
		};
	});
}//»
const get_db_item=(id)=>{//«
	return new Promise(async(y,n)=>{
		let store = get_object_store(HN_ITEM_STORE_NAME, 'readonly');
		if (!store) return y();
		let req = store.get(id);
		req.onsuccess=e=>{
			y(e.target.result);
		};
		req.onerror=e=>{
			cerr(e);
			y();
		};
	});
}//»
const writeCache=(path,val, if_append)=>{//«
	return new Promise(async(y,n)=>{
		let opts={isSys:true, reject:true};
		opts.APPEND = if_append;
		try {
			y(await fs.writeHtml5File(`${CACHE_PATH}/${path}`,val, opts));
		}
		catch(e){
cerr(e);
			await poperr(e);
			y();
		}
	});
};
//»
//»
//Fbase«
const get_ref = (path) =>{//«
	let app = get_hn();
	if (!app) return nofb();
	let dbref = firebase.database(app);
	return dbref.ref(path);
};//»
const get_fbase=(path, type)=>{//«
	return new Promise(async(y,n)=>{
		let ref = get_ref(`/v0/${path}`);
		if (!ref) return y();
		ref.once(type||'value',snap=>{
			y(snap.val());
		});
	});
};//»
const get_fbase_stories=which=>{return get_fbase(`${which}stories`);}
const get_fbase_item=id=>{return get_fbase(`item/${id}`);};
const get_fbase_user=name=>{return get_fbase(`user/${name}`);};
const get_user = async(opts={})=>{//«

/*User object
id	The user's unique username. Case-sensitive. Required.
created	Creation date of the user, in Unix Time.
karma	The user's karma.
about	The user's optional self-description. HTML.
submitted	List of the user's stories, polls and comments.
*/

	let holdelem;
	let user;
	let which = opts.which||"about";
	if (opts.user) user = opts.user;
	else{
		user = cur_elem.user;
		holdelem = cur_elem;
	}

	let about = await get_fbase(`user/${cur_elem.user}/${which}`)
	if (!about) about = "[Nothing]";
	await popup(about, {title: cur_elem.user, wide: true});
	holdelem&&holdelem.focus();

};//»
const get_item=(id, if_reget)=>{//«
	return new Promise(async(y,n)=>{
		let item;
		if (!if_reget) item = await get_db_item(id);
		if (if_reget || !item){
			item = await get_fbase_item(id);
			if (!item) {
cerr(`Could not get item: ${id}`);
				y();
				return;
			}
			item.fetched = new Date().getTime();
			if (!await add_db_item(item)) {
cerr(`Could not add item(${id}) to data store!`);
			}
			else {
//log(`Added item ${id}`);
			}
		}
		y(item)
	});
}//»
const get_stories = which =>{//«
	return new Promise(async(y,n)=>{
		let arr = await get_fbase_stories(which);
		if (!arr) {
			await poperr(`Could not get ${which}stories!`);
			y();
			return; 
		}
		if (!await writeCache(`${which}stories`, new Blob([new Uint32Array(arr)]))) {
cwarn(`Could not cache ${which}stories!`);	
		}
		y(arr);		
	});
};//»
const get_hn=()=>{//«
	if (!window.firebase) return false;
	for (let app of firebase.apps){
		if (app.name==HN_APPNAME) {
			return app;
		}
	}
	return false;
};//»   
const nofb=()=>{poperr("The 'hackernews' firebase module is not running\x20(call 'hnfbup' first)");};
const load_iface=()=>{//«
	return new Promise(async(Y,N)=>{
		let rv = await fs.loadMod("iface.iface",{STATIC:true});
		if (!rv) return Y();
		Y(true);
		if (typeof rv === "string") Core.do_update(`mods.iface.iface`, rv);
	});
}; //»
const load_firebase=()=>{//«
	return new Promise(async(y,n)=>{
		ifapi = NS.api.iface;
		if (!ifapi) {
			if (!await load_iface()) return y("Could not load the interface module!");
			ifapi = NS.api.iface;
		}
		if (!window.firebase) {
			if (!ifapi.didInit()){
				if (!(await ifapi.init())) return y("Could not initialize the realtime database!");
			}
		}
		if (get_hn()) return y(true);
		firebase.initializeApp({databaseURL:HN_BASE_URL}, HN_APPNAME);
		firebase.database().ref(".info/connected").on("value", snap=>{
			if (snap.val() === true){
cwarn("Connected to firebase: "+HN_APPNAME);
				y(true);
			}       
			else{   
cwarn("firebase is disconnected: "+HN_APPNAME);
			}
		});
	});
};//»

//»
//App«

const reload = async()=>{//«
	if (cur_elem.type==="item") await reget_item(cur_elem);
	else if (cur_elem.type=="list" && !cur_elem.id){
		if (Main!==Online) return popup("Cannot reload this screen!");
		let dm = Math.floor((Date.now() - last_get)/60000);
		if (dm < MAX_CACHE_DIFF_MINUTES) {
//log(`${dm}/${MAX_CACHE_DIFF_MINUTES} mins`);
popup(`Still have ${MAX_CACHE_DIFF_MINUTES-dm} minutes left!`);
			return;
		}
		Main.innerHTML="";	
		await init_stories(DEF_STORY_TYPE);
	}
};//»
const reget_item = (item, if_override)=>{//«
	return new Promise(async(Y,N)=>{
		if (item.data.fetched) {
			let then = new Date(item.data.fetched).getTime();
			let now = new Date().getTime();
			if (!if_override) {
				let diff_mins = (now-then)/60000;
				if (diff_mins< MIN_REGET_MINS) {
					await popup(`${diff_mins.toFixed(1)} < MIN_REGET_MINS(${MIN_REGET_MINS})`);
					item.main.focus();
					return;
				}
			}
		}
		if (is_getting){
	cwarn("is_getting == true");
			return;
		}
		is_getting = true;
		let got = await get_item(item.id, true);
		let rv = new Item(got, item.number, item.tabpar, item.id, item.parent)
		item.list.replace(item, rv);
		rv.toggle();	
		let strpath = rv.path(true);
		let note = NOTICES[strpath];
		if (note) note.setkids(got.kids);
		is_getting = false;
		Y(rv);
	});
};//»
const goto_item=(path, if_refresh)=>{//«

return new Promise(async(Y,N)=>{
	const getitem=(list, id)=>{
		for (let itm of list.kids){
			if (itm.data.id == id) return itm;
		}
	};
	let screen;
	let parid = path.shift();

	let par = getitem(toplist, parid);
	if (par) screen = Online;
	else{
//cwarn("Parent not in 'toplist'");
		par = getitem(offlist, parid);
		if (!par){
//cwarn("Parent not in 'offlist'");
			let item = await get_db_item(parid);
			if (!item) {
cerr(`Could not get main item ${parid} from the db`);
				return Y();
			}
			offlist.add(item);
			par = getitem(offlist, parid);
			if (!par){
cerr("Wut, could not get par after JUST ADDING THATT ITEMMM???");
				return Y();
			}
		}
		screen = Offline;
	}
	switch_to_screen(screen);
	goto_main_list();
	let cur = par;
	await cur.open();
	cur.focus();
	let id = path.shift();
	while(id){
		cur = getitem(cur.list, id);
		await cur.open();
		cur.focus();
		id = path.shift();
	}
	let got;
	if (if_refresh) Y(await reget_item(cur, true));
	else Y(true);
});


}//»
const focus_main_list=()=>{//«
	if (Main===Online) toplist.focus();
	else if (Main===Offline) offlist.focus();
	else notiflist.focus();
	
};//»
const unwork=()=>{working = false;};
const goto_main_list=()=>{//«
	if (!cur_elem) return focus_main_list();
	if (cur_elem === toplist || cur_elem === offlist || cur_elem === notiflist) return;
	let iter=0;
	while (!(cur_elem === toplist || cur_elem === offlist || cur_elem === notiflist)){
		iter++;
		if (iter > 100) throw new Error("!?!?!?!?");
		this.onescape();
	}
};//»
const switch_screen=()=>{//«

	if (Main===Online){
		online_elem_hold = cur_elem;
		Main.dis="none";
		Main=Offline;
		Main.dis="";
		cur_elem = offline_elem_hold;
	}

	else if (Main==Offline){
		offline_elem_hold = cur_elem;
		Main.dis="none";
		Main=Notif;
		Main.dis="";
		cur_elem = notif_elem_hold;
		if (notif_elem_hold) notif_elem_hold.focus();
	}

	else if (Main==Notif){
		notif_elem_hold = cur_elem;
		Main.dis="none";
		Main=Online;
		Main.dis="";
		cur_elem = online_elem_hold;
	}
	if (cur_elem) cur_elem.focus();

}//»
const switch_to_screen=(which)=>{//«

	if (Main===which) return;
	switch_screen();
	if (Main===which) return;
	switch_screen();
	if (Main===which) return;
	switch_screen();

}//»
const html_to_str=(html, lenarg)=>{//«
	let uselen = lenarg || MESSLEN;
	let nodes = Array.from((new DOMParser()).parseFromString(html, "text/html").body.childNodes);
	let s="";
	while (nodes.length && s.length < uselen){
		let node = nodes.shift();
		s+=node.textContent+" ";
	}
	let dots="...";
	if (s.length <= uselen) dots="";
	s = s.slice(0,uselen).chomp()+dots;
	return s;
};//»
const get_notice_message=(dat, numdesc)=>{//«
	let mess;
	let str = html_to_str(dat.text||dat.title||"[link] "+dat.url);
	return str;
//	if (dat.title && Number.isFinite(numdesc)) mess = `<span style="color:${getcolor(numdesc)}">${str}</span>`;
//	else mess = str;
//	return mess;
};//»
const set_notice=async(elem)=>{//«
	let path = elem.path();
	let str = JSON.stringify(path);
	if (notices.includes(str)) return popup("Already being notified for the message!");
	if (notices.length >= MAX_NOTICE_LIMIT) return popup(`You have reached MAX_NOTICE_LIMIT (${MAX_NOTICE_LIMIT})`);
	notices.push(str);
	if (!await fs.writeFile(NOTICESFILEPATH, JSON.stringify(notices))) {
cwarn(`Could not write to the file: ${NOTICESFILEPATH}`);
	}
	let dat = elem.data;
	NOTICES[str]=new Notice(dat, path, elem.descendants);
	await popup("The notice has been set!");
	elem.focus();
}//»
const poll_notices=()=>{//«

//cwarn(`Polling ${notices.length} notices @${new Date().toTimeString().split(" ")[0]}`);
for (let n of notices) NOTICES[n].poll();

	working = false;
};//»
const await_notices=async()=>{//«

//switch_to_screen(Notif);


for (let n of notices) {

	let fullpath = JSON.parse(n);
	let messid = fullpath[fullpath.length-1];
	let item = await get_db_item(messid);
//	NOTICES[n]=new Notice(html_to_str(item.text||item.title||"[link] "+item.url), item, fullpath);
	NOTICES[n] = new Notice(item, fullpath, item.descendants);

}

poll_notices();

poll_interval = setInterval(poll_notices, poll_interval_ms);
//let poll_interval_ms = 60000;

};//»

//»
//Init«

const init_stories=async(which)=>{//«

	if (is_getting){
cwarn("is_getting == true");
		return;
	}
	is_getting = true;
	let file = await cache_file(`${which}stories`);
	let arr;
	if (file){
		let dm = Math.floor((Date.now() - file.lastModified)/60000);
		if (dm < MAX_CACHE_DIFF_MINUTES){
//cwarn(`Use cache: ${dm} < ${MAX_CACHE_DIFF_MINUTES}`);
log(`${dm}/${MAX_CACHE_DIFF_MINUTES} mins`);
			arr = await file_to_ints(file);
			last_get = file.lastModified;
		}
		else{
cwarn("Expired!");
			arr = await get_stories(which);
			last_get = Date.now();
		}
	}
	else{
cwarn(`GET: ${which}stories`);
		arr = await get_stories(which);
	}

	if (!(arr&&arr.length)) {
		is_getting = false;
		return;
	}

	toplist = new List(`${which.firstup()}\xa0stories`, Main, 0);

	for (let i=0; i < GET_NUM_STORIES;i++){
		let id=arr[i];
		let item = await get_item(id);
		if (!item){
			poperr(`Error getting item: ${id}`);
			is_getting = false;
			return;
		}
		if (item.type=="story"||item.type=="comment") toplist.add(item);
	}
	toplist.focus();
	is_getting = false;

}//»
const init_offline=()=>{//«
	offlist = new List(`Watched\xa0stories`, Offline, 0);
	offline_elem_hold = offlist;
};//»
const init_notif=()=>{//«
	notiflist = new List(`Notifications`, Notif, 0);
	notif_elem_hold = notiflist;
};//»
const init = async()=>{//«

	let rv;
	if (!NS.api.widgets) {
		stat("Loading 'widgets'...");
		await Core.api.loadMod('sys.widgets');
//		globals.widgets = new NS.mods["sys.widgets"](Core);
		let mod = new NS.mods["sys.widgets"](Core);
//		mod.set_desk(Topwin);
		widgets = NS.api.widgets;
		widgets.setDesk(Topwin);
	}
	else widgets = NS.api.widgets;
	
	set_widgets();
	if (!NS.api.fs){
		stat("Loading 'fs'...");
        await Core.api.loadFs();
	}
	fs = NS.api.fs;
//log(fs);
	if (!globals.home_path) {
		stat("Getting current user...");
		await Core.api.getCurrentUser(fs);
	}
	USERDATAPATH =`${globals.home_path}/.data/apps/net/HN`
	NOTICESFILEPATH =`${USERDATAPATH}/notices`
	
	stat("Opening the database...");
	if (!await open_db()) {
		return poperr("Could not open the database!");
	}
	stat("Loading firebase...");
	rv = await load_firebase();
	if (rv!==true) return poperr(rv);
	if (!await fs.mkHtml5Dir(CACHE_PATH)) {
		cerr (`Could not create '${CACHE_PATH}'!`);
//		return;
	}
	init_stories(DEF_STORY_TYPE);
	init_offline();
	init_notif();

	if (!await fs.mkDir(USERDATAPATH)){
		cerr(`Could not get/make directory: ${USERDATAPATH}!`);
//		return;
	}
	rv = await fs.readFile(NOTICESFILEPATH,{text:true});
	if (rv){
		try{
			notices = JSON.parse(rv);
		}
		catch(e){
cwarn(`Could not parse the file at ${USERDATAPATH} (string below)`);
log(rv);
//			cerr(e);
			notices=[];
		}
	}
	await_notices();
	stat_total();
/*
	if (notices.length) {
//		stat(`Awaiting ${notices.length} items`);
		await_notices();
		stat_total();
	}
	else stat("Ready!");
*/

};//»

//»

//»

//Obj/CB«

this.onkeydown=async(e,s)=>{//«
let code = e.keyCode;
if (code>=16&&code<=18) return;
//if (s==="SPACE_"||s==="TAB_"||s==="ENTER_"){}
//else if (s.match(/^[A-Z]+_$/)) return;
//log(s);
if(s=="=_S"){FS++;_Main.fs=FS;return;}
if(s=="-_"){if(FS<=10)return;FS--;_Main.fs=FS;return;}

if (working){
cwarn("!!!!!!!!!! WORKING !!!!!!!!!!");
return;
}
//log(s);
working = true;

if (s=="ESC_C") {
	await goto_main_list();
	working = false;
	return;
}
if (s=="1_") {
	await switch_to_screen(Online);
	working = false;
	return;
}
if (s=="2_") {
	await switch_to_screen(Offline);
	working = false;
	return;
}
if (s=="3_") {
	await switch_to_screen(Notif);
	working = false;
	return;
}
if (s=="p_") {
	await poll_notices();
	working = false;
	return;
}

let act=document.activeElement;
//log(s);
if (s=="TAB_"||s=="TAB_S"){//«
	e.preventDefault();
	if (!Main.contains(act)) {
		if(cur_elem){
			if (cur_elem.focus) cur_elem.focus();
		}
		await focus_main_list();
		working = false;
		return;
	}
	let arr;
	let is_list;
	let act_is_vis;
	if (act.classList.contains("list")) {
		is_list = true;
		arr = act.getElementsByClassName("tabbable");
	}
	else {
		act_is_vis = is_visible(act);
		arr = act.parentNode.getElementsByClassName("tabbable");
		if (cur_elem && cur_elem.main && cur_elem.main.is_active && cur_elem.onenter){
			await cur_elem.onenter();
			working = false;
			return;
		}
	}
	arr = Array.from(arr);
	if (act_is_vis){
		arr = arr.filter(elm=>{
			if (elm.tab_level === act.tab_level) return elm;
		});
	}
	let ind = arr.indexOf(act);
	let next_ind = ind+1;
	let prev_ind = ind-1;

	if (is_list||!act_is_vis){
		if (s=="TAB_S") arr.reverse();
//		let elm = arr[0];
//		if (!elm) return;
//		if (!is_visible(elm)) elm.scrollIntoView();
		let elm;
		for (let i = next_ind; i < arr.length; i++){
			if (is_visible(arr[i])) {
				elm = arr[i];
				elm.scrollIntoViewIfNeeded();
				break;
			}
		}
		if (!elm){
			for (let i = 0; i < arr.length; i++){
				if (is_visible(arr[i])) {
					elm = arr[i];
					elm.scrollIntoViewIfNeeded();
					break;
				}
			}
		}
		if (elm) {
			act.onescape&&act.onescape();
			elm.focus();
		}
		working = false;
		return;
	}
	if (s=="TAB_"){
		if (!arr[next_ind]) next_ind = 0;
		act.onescape&&act.onescape();
		arr[next_ind].focus();
	}
	else{
		if (prev_ind < 0) prev_ind = arr.length - 1;
		act.onescape&&act.onescape();
		arr[prev_ind].focus();
	}
	working = false;
	return;
}//»

else if(s=="SPACE_"){//«
	e.preventDefault();
	if (!Main.contains(act)) {
		if(cur_elem) cur_elem.focus();
		working = false;
		return;
	}
	if (cur_elem.toggle) {
		await cur_elem.toggle();
	}
	working = false;
	return;
}//»
else if(s=="ENTER_"){//«

	if (!Main.contains(act)) {
		if(cur_elem) cur_elem.focus();
		working = false;
		return;
	}

	if (cur_elem.gotolink) cur_elem.gotolink();
	else if (cur_elem.onenter) cur_elem.onenter();
	else if (cur_elem.click) cur_elem.click();
	else {
cwarn("What is this cur_elem", cur_elem);
	}
	working = false;
	return;
}//»
else if(s=="/_"){
switch_screen();
working = false;
return;
}

if (!cur_elem) return unwork();

if (s=="ENTER_A"){
	if (cur_elem.comment) await cur_elem.comment();
	working = false;
	return;
}

if (s=="r_") {
	await reload();
	working = false;
	return 
}
if (s=="x_"){
	if (cur_elem.type=="notice") await cur_elem.delete();
	working = false;
	return;
}
if (s=="k_"){
	if (!cur_elem.getkids) return unwork();

	let ref = get_ref(`/v0/item/${cur_elem.id}/kids`);
	ref.limitToLast(1).once('value',snap=>{
	let k = parseInt((Object.keys(snap.val()))[0]);
log(k);
	});
//	let got = await get_fbase(`item/${cur_elem.id}/kids`);
//log("CUR",cur_elem.getkids().length);
//log("RET",got?got.length:0);
	working = false;
	return;
}

if (cur_elem.type!=="item") return unwork();
if (s=="c_"){
	if (cur_elem.comment) cur_elem.comment();
	working = false;
}
//else if (s=="g_") cur_elem.gotolink&&cur_elem.gotolink();
else if (s=="u_") {
	get_user();
	working = false;
}
else if (s=="n_") {
	await set_notice(cur_elem);
	working = false;
}

else{
working = false;
}


};//»
this.onescape = ()=>{//«

	let act=document.activeElement;
	if (!Main.contains(act)) return false;
	if (act.onescape) {
		if (act.onescape()) return true;
	}
	return focus_parent(act.parentNode);

};//»
this.onkill=()=>{
	/*	clearInterval(time_interval);*/
	clearInterval(poll_interval);
//	for (let ref of REFS) ref.off();
};
this.onresize=()=>{};
this.onfocus=()=>{//«
	if(cur_elem&&cur_elem.focus) cur_elem.focus();
	else{
//cwarn("NOFOCUS", cur_elem);
//log(toplist);
toplist&&toplist.focus();
	}
//log(cur_elem);
//	Main.focus();
};//»
this.onblur=()=>{}
this.onappinit=init;

//»

}//»


