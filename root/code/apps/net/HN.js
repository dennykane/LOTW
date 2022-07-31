
/*xTODOx


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


*/


//https://news.ycombinator.com/reply?id=22514747&goto=item%3Fid%3D22514004%2322514747
//												 goto=item ? id = 22514004 # 22514747
//																  original 
//																    story

export const app=function(arg){

//Imports«
const {Core,Main,Desk,NS}=arg;

const Topwin=Main.top;
const {log,cwarn,cerr,globals}=Core;
//log(Core,Main,Desk);
//const{fs,util,widgets,dev_env,dev_mode}=globals;
const{util,dev_env,dev_mode}=globals;
const{isarr,isobj,isstr,mkdv,mksp,mk}=util;
const {popup:_popup,popok:_popok,poperr:_poperr,popyesno:_popyesno, popin:_popin,popinarea:_popinarea}=NS.api.widgets;
const popup=(s,opts={})=>{
	return new Promise((y,n)=>{
		opts.win = Topwin;
		opts.cb = y;
		_popup(s,opts);
	});
};
const popin=(s)=>{return _popin(s,{win:Topwin});};
const popinarea=(tit)=>{return _popinarea("",tit,{win:Topwin});};
const popok=(s)=>{return new Promise((y,n)=>{_popok(s,{win:Topwin,cb:y});});};
const poperr=(s)=>{return new Promise((y,n)=>{_poperr(s,{win:Topwin,cb:y});});};
const popyesno=(s)=>{return new Promise((y,n)=>{_popyesno(s,{win:Topwin,cb:y});});};

const fsapi=NS.api.fs;

//Topwin.titleimg={TCOL:"#ff6600",BGCOL:"#000"};

//»

//Var«
let toplist;

let FS = 24;

let last_get;
let is_getting = false;
let MIN_REGET_MINS = 3;

const DEF_STORY_TYPE = "top";

let cur_elem;

let time_interval;
const TIMES=[];

//let GET_NUM_STORIES = 30;
let GET_NUM_STORIES = 1;

let MAX_CACHE_DIFF_MINUTES = 10;

let POPUP_WID=window.outerWidth-100;
let POPUP_HGT=window.outerHeight-100;

let ifapi;
let db;

const HN_DB_NAME="hackernews";
const HN_DB_VERS=1;
const HN_ITEM_STORE_NAME="items";


const CACHE_PATH = '/var/cache/apps/net/HN';

const HN_BASE_URL = "https://hacker-news.firebaseio.com";
        
const HN_APPNAME = "hackernews";

//»

//DOM«


Main.bgcol="#030303";
Main.tcol="#ddd";
Main.fs=19;
Main.overy="scroll";
Main.tabIndex="-1";
Main.style.outline="none";
//Main.tab_level = 0;

//»

//Classes«

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
main.is_active=false;

this.main = main;

main.classList.add("tabbable");

main.onescape = ()=>{
	if (cont.dis!=="none") {
		this.toggle();
		return true;
	}
	return false;
};

main.tabIndex="-1";
main.onfocus=()=>{
	cur_elem = this;
};
main.tab_level = level;
main.mar=10;
main.bor="1px dotted #aaa";

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
	tit.style.whiteSpace="nowrap";
//	tit.innerText = `${_num+1})\xa0\xa0${arg.title}||""`;
	tit.innerText = (_num+1)+")\xa0\xa0"+(arg.title||"");
//	host = mkdv();
//	if(arg.url) host.innerText = arg.url.split("//")[1].split("/")[0]
//	else host.innerText = "[self]";
	if(arg.url) host  = arg.url.split("//")[1].split("/")[0]
	else host  = "[self]";
//	thead.add(sc,tit, host);
}//»
const bhead = mkdv();
bhead.dis="flex";
const user = mkdv();
user.style.whiteSpace="nowrap";
user.innerText=arg.by||"?";
user.marr=20;
const time = mkdv();
time.marr=20;
new Time(arg.time, time);

if (is_story) {//«
//bhead.style.alignItems="end";
//bhead.style.justifyContent="end";
//	info.innerText = `(${arg.descendants})\xa0\xa0\xa0${host}`;
//	info.innerText = `${arg.descendants}`;
let tcol;
let n = arg.descendants;
if (n<6) tcol="#99e";//blue
else if (n<12) tcol="#bbf";//light blue
else if (n<25) tcol="#7ff";//turquoise
else if (n<50) tcol="#8f8";//green
else if (n < 100) tcol="#ff9";//yellow
else if (n < 200) tcol="#fa5";//orange
else tcol = "#f77";//red
tit.tcol=tcol;

	info.innerText = host;
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
cont.fs=FS;
cont.dis="none";
const body = mkdv();//body
cont.add(body);
body.classList.add("body");
body.tabIndex="-1";
body.tab_level = level+1;
body.pad=5;

if (!arg.url) {
	body.innerHTML = arg.text||"<i>[none]</i>";
	body.style.userSelect="text";
}
else {
let a = mk('a');
a.href = arg.url;
a.tabIndex="-1";
a.innerHTML = arg.url;
body.add(a);
	this.gotolink=()=>{
		a.click();
	};
}
//else body.innerHTML=`<span><u>${arg.url}</u></span>`;

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
	cur_elem = body;
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
	comprev.h = FS+1;

	comprev.innerHTML = arg.text||"<i>[none]</i>";
	comprev.flg=1;
//	comprev.ta="right";
}//»

do_links(main);

//»

this.toggle = async()=>{//«
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
		return;
	}
	if (arg.type==="story"||arg.type=="comment"){
		if (coms) return;
	}
	else return cwarn(`Toggle: ${arg.type}`);

	coms = mkdv();
	foot.add(coms);
	coms.mart=10;

	let kids = arg.kids||[];
	let len = kids.length;

	let list = new List(`Comments\x20(${len})`, coms, level+1, 19, _storyid, this);
	this.list = list;
	list.item = this;
	for (let i=0; i < len;i++){
		let id=kids[i];
		let item = await get_item(id);
		if (!item){
			poperr(`Error getting item: ${id}`);
			return;
		}
		list.add(i, item);
	}
};//»

this.open=()=>{

if (cont.dis==="none") this.toggle();

}

this.path=()=>{
	if (_path) return _path;
	let cur = _paritem;
	let arr = [arg.id];
	while(cur){
		arr.unshift(cur.data.id);
		cur = cur.parent;
	}
	_path = arr;
	return _path;
};

this.onenter=()=>{
	if (cont.dis==="none") return;
	this.list.onenter();
};

this.focus =()=>{
	main.focus();
};

};//»

const List = function( _tit, _par, _level, _fs, _storyid, _paritem) {//«

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
		m.mar=1;
	}
	m.classList.add("list");
	m.tabIndex="-1";
	m.tab_level=_level;
	const n = mkdv();//name
	n.fs=_fs;
	n.fw="bold";
	n.innerText=_tit;
//	n.marl=n.mart=10;
	n.padl=n.padt=5;
	n.marb=10;

	const l = mkdv();//list
	m.add(n,l);
	this.onenter=()=>{
		if (ALL[0]) ALL[0].main.focus();
	};

	this.add = (num, item)=>{
		let rv = new Item(item, num, m, item.id||_storyid, _paritem)
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

const User =function() {//«

};//»

//»

//Funcs«

const stat=()=>{}

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
	d.fs=15;
	d.innerText=str;
	d.bor=`3px outset ${butborcol}`;
	d.onmousedown=()=>{if(disabled)return;d.bor=`3px inset ${butborcol}`;};
	d.onmouseup=()=>{if(disabled)return;d.bor=`3px outset ${butborcol}`;};
	d.onmouseout=()=>{if(disabled)return;d.bor=`3px outset ${butborcol}`;};
	d.win=Topwin;
	d.tcol="#000";
//	d.active_message = opts.message;
	d.onfocus=(e)=>{
		cur_elem = d;
//		d.tcol="#00c";
		stat();
	};
	d.onblur=(e)=>{
//		d.tcol="#000";
		stat();
	};
	d.onclick=(e)=>{
		if (disabled) return;
		if (e.isTrusted||e===true) {
			fn();
			stat();
			return 
		}
		d.bor="3px inset #aaa";
		setTimeout(() => {
			d.bor = "3px outset #aaa";
			fn();
			stat();
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
			y(await fsapi.writeHtml5File(`${CACHE_PATH}/${path}`,val, opts));
		}
		catch(e){
cerr(e);
			await poperr(e);
			y();
		}
	});
};
//»
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
		let rv = await fsapi.loadMod("iface.iface",{STATIC:true});
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
const cache_file=path=>{//«
	return new Promise(async(y,n)=>{
		let ent = await fsapi.getFsEntryByPath(`${CACHE_PATH}/${path}`);
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

//cwarn(`Found: ${GET_NUM_STORIES} stories`);
//	let items = [];

	toplist = new List(`${which.firstup()}stories`, Main, 0, 23);

	for (let i=0; i < GET_NUM_STORIES;i++){
		let id=arr[i];
		let item = await get_item(id);
		if (!item){
			poperr(`Error getting item: ${id}`);
			is_getting = false;
			return;
		}
//if (item.type)
		if (item.type=="story"||item.type=="comment") toplist.add(i, item);
	}
	toplist.focus();
	is_getting = false;

}//»
const update_times=()=>{for(let t of TIMES)t.update();}
const init = async()=>{//«

	if (!await open_db()) return poperr("Could not open the database!");

	let rv = await load_firebase();
	if (rv!==true) return poperr(rv);
	if (!await fsapi.mkHtml5Dir(CACHE_PATH)) {
		await poperr (`Could not create '${CACHE_PATH}'!`);
		return;
	}
//	Main.focus();
	init_stories(DEF_STORY_TYPE);
//	update_times();
//	time_interval = setInterval(update_times,1000);

};//»

const reget_item = async item=>{//«

//log(item);
//return;
if (item.data.fetched) {
let then = new Date(item.data.fetched).getTime();
let now = new Date().getTime();

let diff_mins = (now-then)/60000;
if (diff_mins< MIN_REGET_MINS) {
//cwarn();
await popup(`${diff_mins.toFixed(1)} < MIN_REGET_MINS(${MIN_REGET_MINS})`);
//log("DONE");
item.main.focus();
return;
}

}
//return;
///*
	if (is_getting){
cwarn("is_getting == true");
		return;
	}
	is_getting = true;
	let got = await get_item(item.id, true);
	let rv = new Item(got, item.number, item.tabpar, item.id, item.parent)
log("RV", rv);
	item.list.replace(item, rv);
	rv.toggle();	
	is_getting = false;
	

//*/


};//»

const goto_item=(path)=>{//«

const getitem=(list, id)=>{

for (let itm of list.kids){
	if (itm.data.id == id) return itm;
}

};

let parid = path.shift();

let par = getitem(toplist, parid);
if (!par){
	cwarn("Parent not in 'toplist'");
	return;
}

let cur = par;
let id = path.shift();
cur.open();
while(id){
	cur = getitem(cur.list, id);
	cur.open();
	cur.focus();
	id = path.shift();
}

}//»

//»

//Obj/CB«

let last_path;

this.onkeydown=async(e,s)=>{//«

let act=document.activeElement;

if (s=="TAB_"||s=="TAB_S"){//«
	e.preventDefault();
	if (!Main.contains(act)) {
		if(cur_elem){
			if (cur_elem.focus) cur_elem.focus();
		}
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
			cur_elem.onenter();
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
		let elm = arr[0];
		if (!is_visible(elm)) elm.scrollIntoView();
		act.onescape&&act.onescape();
		elm.focus();
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
	return;
}//»
else if(s=="SPACE_"){//«
	e.preventDefault();
	if (!Main.contains(act)) {
		if(cur_elem) cur_elem.focus();
		return;
	}
	if (cur_elem.toggle) cur_elem.toggle();
	return;
}//»
else if(s=="ENTER_"){//«

	if (!Main.contains(act)) {
		if(cur_elem) cur_elem.focus();
		return;
	}

	if (cur_elem.onenter) cur_elem.onenter();
	else if (cur_elem.onclick) cur_elem.click();
	else {
cwarn("What is this cur_elem", cur_elem);
	}
	return;
}//»

else if (s=="i_"){
if (!last_path) return;
goto_item(last_path);
}

if (!cur_elem) return;

if (s=="r_") {
//log(cur_elem);
	if (cur_elem.type==="item") reget_item(cur_elem);
	else if (cur_elem.type=="list" && !cur_elem.id){
		let dm = Math.floor((Date.now() - last_get)/60000);
		if (dm < MAX_CACHE_DIFF_MINUTES) {
log(`${dm}/${MAX_CACHE_DIFF_MINUTES} mins`);
return;
		}

Main.innerHTML="";	
init_stories(DEF_STORY_TYPE);

	}
	return;
}

if (cur_elem.type!=="item") return;
if (s=="c_"){
	if (cur_elem.comment) cur_elem.comment();
}
else if (s=="k_"){
if (!cur_elem.id) return;
let got = await get_fbase(`item/${cur_elem.id}/kids`);
}
else if (s=="g_") cur_elem.gotolink&&cur_elem.gotolink();
else if (s=="u_") get_user();
else if (s=="p_"){

last_path = cur_elem.path();
log(last_path);

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
this.onkill=()=>{clearInterval(time_interval);};
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

//»

init();

}



/*
*/


