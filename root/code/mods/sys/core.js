

window.__OS_NS__="LOTW";
window[__OS_NS__]={error:{message:""},libs:{}, test:{}, coms:{}, devapps:{}, apps:{}, mods:{}, sys:{}, api:{}, init:{}};
const NS = window[__OS_NS__];

const Core = function(qobj){

const LINK_EXT = "_lnk";
const LINK_RE = new RegExp("."+LINK_EXT+"$");

//Official Application/Extension Registry«
const ALL_EXTENSIONS=[];

//Fullly qualified name here.
let DEF_APP = "util.BinView";
const APP_ARR=[//«
	"Link",
	"Application",
    "util.TextView",
    "util.Unzip",
    "games.Arcade",
    "audio.Synth",
	"util.ImageView",
	"media.MediaPlayer",
	"games.SNES"
//    "audio.Noisecraft"
];//»

//Extension points to the array position above
const EXT_TO_APP_MAP={//«
	[LINK_EXT]:0,
	app:1,
    txt:2,
    js:2,
    sh:2,
    json:2,
    cfg:2,
	html:2,
    zip:3,
    gb:4,
    nes:4,
    synth:5,
	jpg:6,
	png:6,
	gif:6,
	webp:6,
	webm:7,
	mp4:7,
	m4a:7,
	smc: 8
//	ncft: 8
};//»
for (let k in EXT_TO_APP_MAP) ALL_EXTENSIONS.push(k);

const APPICONS={//«
//	Folder:"1f5c2",
	Folder:"1f4c1",
	Hello:"1f64b",
	TextView:"1f4dd",
	BinView:"1f51f",
	Terminal:"1f5b3",
	Synth:"1f39b",
	Noisecraft:"1f3b9",
	XSynth:"1f39a",
	Arcade:"1f579",
	SNES:"1f579",
	Unzip:"1f5dc",
	Mail:"1f4ec",
	Help:"26a1",
	About:"1f4ca",
	Login:"1f464",
	Forum:"1f5e3",
	Hello:"1f64b",
	MediaPlayer:"1f3a6",
	HelloWorld:"270b",
	ImageView:"1f304"
}//»

//»
//Var«

let did_get_midi = false;
let did_get_midi_inputs = false;
let num_midi_inputs = 0;
let midi;
const midi_cbs = [];


let VERNUM=1;
const NOOP=()=>{};
const FOLDER_APP = "sys.Folder";
const TEXT_APP = "util.TextView";

const INIT_SCRIPT="/etc/init.sh";
let init_str;

let Desk;

const Core = this;
Core.do_update=()=>{};
Core.NS=NS;

let initlog = NS.initlog;
let current_user, users;
const _mods = NS.mods;
const _apps = NS.apps;

const make=(which)=>{return document.createElement(which);}
const mk=make;

let winw =()=>{return window.innerWidth};
let winh =()=>{return window.innerHeight};
let winx =()=>{return 0;};
let winy =()=>{return 0;};

let home_path, desk_path;
let FSLET;
let FSBRANCH;
let FSPREF;
let fsapi;
const body = document.body;
const is_iframe = (window.parent !== window);
const NUM=Number.isFinite;

let winorig = window.location.origin;

let is_offline = false;
if (qobj.cached) is_offline = true;

let fs;
let fs_str = null;
let last_history_com = null;

let last_job_id = 1;
let drop_iter=0;

//Modes/Flags«

let dev_mode = true;
let dev_env = false;

//»
//Storage«

let fs_type = "temporary";
let use_fs_type;
//let fs_type, use_fs_type;
let lst = localStorage;
const root = {NAME: "/", APP: FOLDER_APP, KIDS: {}, treeroot: true, TYPE: "fs", sys: true, fullpath: "/"};
root.KIDS['.'] = root;
root.KIDS['..'] = root;
root.root = root;

//»
//Arrays/Objects«
const UPDATES = {};
const ENV={};
let jobs = [];
let system_channel, system_messages = [];
let global_drops = [];
let gzip = null;
let terminals;
let current_term;
let historys = {};

const KC = {//«
	'BACK': 8,
	8: 'BACK',
	'TAB': 9,
	9: 'TAB',
	'ENTER': 13,
	13: 'ENTER',
	'SHIFT': 16,
//	16: 'SHIFT',
	16: '',
	'CTRL': 17,
//	17: 'CTRL',
	17: '',
	'ALT': 18,
//	18: 'ALT',
	18: '',
	'ESC': 27,
	27: 'ESC',
	'SPACE': 32,
	32: 'SPACE',
	'PGUP': 33,
	33: 'PGUP',
	'PGDOWN': 34,
	34: 'PGDOWN',
	'END': 35,
	35: 'END',
	'HOME': 36,
	36: 'HOME',
	'LEFT': 37,
	37: 'LEFT',
	'UP': 38,
	38: 'UP',
	'RIGHT': 39,
	39: 'RIGHT',
	'DOWN': 40,
	40: 'DOWN',
	'INS': 45,
	45: 'INS',
	'DEL': 46,
	46: 'DEL',
	48:'0',
	49:'1',
	50:'2',
	51:'3',
	52:'4',
	53:'5',
	54:'6',
	55:'7',
	56:'8',
	57:'9',
/*
	101:'5',
	102:'6',
	104:'8',
	105:'9',
*/
	'a': 65,
	65: 'a',
	'b': 66,
	66: 'b',
	'c': 67,
	67: 'c',
	'd': 68,
	68: 'd',
	'e': 69,
	69: 'e',
	'f': 70,
	70: 'f',
	'g': 71,
	71: 'g',
	'h': 72,
	72: 'h',
	'i': 73,
	73: 'i',
	'j': 74,
	74: 'j',
	'k': 75,
	75: 'k',
	'l': 76,
	76: 'l',
	'm': 77,
	77: 'm',
	'n': 78,
	78: 'n',
	'o': 79,
	79: 'o',
	'p': 80,
	80: 'p',
	'q': 81,
	81: 'q',
	'r': 82,
	82: 'r',
	's': 83,
	83: 's',
	't': 84,
	84: 't',
	'u': 85,
	85: 'u',
	'v': 86,
	86: 'v',
	'w': 87,
	87: 'w',
	'x': 88,
	88: 'x',
	'y': 89,
	89: 'y',
	'z': 90,
	90: 'z',
	'OSKEY': 91,
	91: 'OSKEY',
	';': 186,
	186: ';',
	'=': 187,
	187: '=',
	',': 188,
	188: ',',
	'-': 189,
	189: '-',
	'.': 190,
	190: '.',
	'/': 191,
	191: '/',
	'\x60': 192,
	192: '\x60',
	'[': 219,
	219: '[',
	'\\': 220,
	220: '\\',
	']': 221,
	221: ']',
	"'": 222,
	222: "'",
	"LAST_KC": 223
}
this.KC=KC;
//»
const kc=(num,str)=>{if(num==KC[str])return true;return false;};
this.kc = kc;

//»
//Audio/Mixer«
/*

const AUDIO = (()=>{
let ctx = new AudioContext();
const Mixer = function() {
	let plugs = [];
	const master = ctx.createGain();
	master.connect(ctx.destination);
	const Plug = function(elm) {
		let gain = ctx.createGain();
		elm.connect(gain);
		gain.connect(master);
		this.elm = elm;
		this.set_volume = val => {
			gain.gain.value = val;
		};
		this.disconnect = _ => {
			gain.disconnect();
			let num = plugs.indexOf(this);
			if (num < 0) {
				cerr("Could not find the plug in plugs", this);
				return;
			}
			plugs.splice(num, 1);
		};
	};
	this.set_volume = val => {
		master.gain.value = val;
	};
	this.plugs = plugs;
	this.plug_in = elm => {
		let plug = new Plug(elm);
		plugs.push(plug);
		return plug;
	};
};
return {
mixer: new Mixer(),
ctx: ctx
}
})();
*/
//»
const globals = {//«
//	audio:AUDIO,
	memory:[],
	LINK_EXT: LINK_EXT,
	LINK_RE: LINK_RE,
	emulators:{},
	FOLDER_APP: FOLDER_APP,
	TEXT_APP: TEXT_APP,
	lst:lst,
	ext_app_arr: APP_ARR,
	ext_to_app_map: EXT_TO_APP_MAP,
	all_extensions: ALL_EXTENSIONS,
//	blobs:blobs,
	is_offline: is_offline,
	cacheExpires: 86400,
	mods:{}, 
	AppVars: {}, 
	services:{
		num: 0, 
		maxnum:0,
		_:[]
	}
};
Core.globals = globals;

let hostname = window.location.hostname;

let SYSNAME, SYSACRONYM, SYSVERSION;
//SYSNAME = "CheeryOS";
//SYSACRONYM = "ChOS";
SYSNAME = "Linux on the Web";
SYSACRONYM = "LOTW";

SYSVERSION = "0.1";
globals.name = {
	NAME: SYSNAME,
	ACRONYM: SYSACRONYM,
	VERSION: SYSVERSION
}

//»
//»
//API«

//const copydiv=mk('div');
const getAppIcon=(arg,opts={})=>{
//	if (!arg) return APPICONS.BinView;
	let app = arg.split(".").pop();
	let ch = APPICONS[app];
	if (!ch) return app[0];
	if (opts.html) return `&#x${ch};`;
//	return `\\u{${ch}}`;
	return eval(`"\\u{${ch}}"`);
};
const copyarea=mk('textarea');

const gbid=id=>{return document.getElementById(id);};
const api = (()=>{


const DB = function(DB_NAME, DB_VERS){//«

const get_object_store=(mode)=>{let tx = db.transaction(STORE_NAME);return tx.objectStore(STORE_NAME);}
const need_init=()=>{throw new Error("Did not init the db!");};

let db;
let did_init;
let STORE_NAME;
const thisdb = this;
this.init=(store_name, keypath, indexes=[])=>{//«

	if (!(api.isStr(DB_NAME)&&Number.isFinite((""+DB_VERS).ppi())&&api.isStr(store_name))) throw new Error("Usage: new DB(db_name(str), db_version(posint), store_name(str))");
	STORE_NAME = store_name;
	if (!keypath) keypath = "id";
cwarn(`store: ${STORE_NAME}, keypath: ${keypath}`);
for (let ind of indexes) log(ind);
	return new Promise(async(y,n)=>{
		let req = indexedDB.open(DB_NAME, DB_VERS);
		req.onsuccess = function (evt) {
			db = this.result;
			did_init = true;
			y(true);
		};
		req.onerror = function (evt) {
cerr(evt.target.error);
thisdb.error = evt;
			y();
		};
		req.onblocked = (e) => {
cerr("onblocked", e);
			y();
		};
		req.onupgradeneeded = function (evt) {
log("openDb.onupgradeneeded");
			let store = evt.currentTarget.result.createObjectStore(STORE_NAME,{keyPath: keypath});
			for (let ind of indexes) store.createIndex(ind.name, ind.name, {unique: !!ind.unique});
		};
	});
}//»
this.delete_db=()=>{//«
	return new Promise((Y,N)=>{
	const DBDeleteRequest = indexedDB.deleteDatabase(DB_NAME);
		DBDeleteRequest.onerror = e => {
cerr(e.target.error);
thisdb.error = e;
			Y();
		};
		DBDeleteRequest.onsuccess = e => {
			Y(true);
		};
	});
};//»
this.delete_store=(store_name)=>{//«
	let did_upgrade;
	return new Promise(async(y,n)=>{
		let req = indexedDB.open(DB_NAME, DB_VERS);
		req.onsuccess = function (evt) {
			y(did_upgrade);
		};
		req.onerror = function (evt) {
thisdb.error = evt;
cerr(evt.target.error);
			y();
		};
		req.onblocked = (e) => {
cerr("onblocked", e);
thisdb.error = e||"Blocked";
			y();
		};
		req.onupgradeneeded = function (evt) {
//log("openDb.onupgradeneeded");
			req.result.deleteObjectStore(store_name);
			did_upgrade = true;
		};
	});
};//»
this.add=(obj)=>{//«
	if (!did_init) return need_init();
	return new Promise(async(y,n)=>{
		let store = get_object_store('readwrite');
		let req;
		try {
		  req = store.put(obj);
		}
		catch (e) {
cerr(e);
			y();
			return;
		}
		req.onsuccess = function (evt) {
			y(true);
		};
		req.onerror = function(e) {
thisdb.error = e;
cerr("addPublication error", this.error);
			y();
		};
	});
}//»
this.get=id=>{//«
	if (!did_init) return need_init();
	return new Promise(async(y,n)=>{
		let store = get_object_store('readonly');
		if (!store) return y();
		let req = store.get(id);
		req.onsuccess=e=>{
			y(e.target.result);
		};
		req.onerror=e=>{
thisdb.error = e;
			cerr(e);
			y();
		};
	});
}//»
this.rm=id=>{//«
	if (!did_init) return need_init();
	return new Promise(async(Y,N)=>{
		let store = get_object_store('readwrite');
		if (!store) return Y();
		let req = store.delete(id);
		req.onsuccess = ()=> {Y(true);}
		req.onerror = (err)=> {
thisdb.error = err;
			Y();
cerr(err);
		}
	});
}//»
this.close=()=>{//«
	if (!db) return;
cwarn("Closing...");
	db.close();
	db = null;
};//»

}//»
const decompress = (blob, opts = {}) => {//«
	return new Promise(async (y, n) => {
		if (!(blob instanceof Blob)) return n("decompress expected Blob");
		let which;
		if (opts.deflate) which = "deflate";
		else which = "gzip";
//		let blob = new Blob([arg]);
		let ds = new DecompressionStream(which);
		let stream = blob.stream().pipeThrough(ds);
		let prom;
		if (opts.toObj) prom = new Response(stream).json();
		else if (opts.toBuf) prom = new Response(stream).arrayBuffer();
		else if (opts.toBlob) prom = new Response(stream).blob();
		else prom = new Response(stream).text();
		y(await prom);
	});
};//»
const compress = (arg, opts = {}) => {//«
	return new Promise(async (y, n) => {
		let input = await api.toBuf(arg);
		let which;
		if (opts.deflate) which = "deflate";
		else which = "gzip";
		let cs = new CompressionStream(which);
		let writer = cs.writable.getWriter();
		writer.write(input);
		writer.close();
		let arr = [];
		let reader = cs.readable.getReader();
		let sz = 0;
		while (true) {
			const {
				value,
				done
			} = await reader.read();
			if (done) break;
			arr.push(value);
			sz += value.byteLength;
		}
		let out = new Uint8Array(sz);
		let off = 0;
		for (let ar of arr) {
			out.set(ar, off);
			off += ar.byteLength;
		}
		if (opts.toBytes) return y(out);
		if (opts.toBuf) return y(out.buffer);
		y(new Blob([out]));
	});
};//»
const rand = (min,max)=>(Math.floor(Math.random()*(max-min+1))+min);
const strToBuf=s=>{return blobToBuf(new Blob([s],{type:"text/plain"}));};
const isStr=arg=>{return typeof arg==="string" || arg instanceof String;};
const isNum=arg=>{return((typeof arg==="number")||(arg instanceof Number));};
const isZero=arg=>{return arg===0;};
const isInt=arg=>{if(!isNum(arg))return false;return !((arg+"").match(/\./));};
const hashsum = (which, arg) => {
	return new Promise(async (Y, N) => {
		let doit = buf => {
			crypto.subtle.digest(which, buf).then(ret => {
				let arr = new Uint8Array(ret);
				let str = '';
				for (let ch of arr) str += ch.toString(16).lpad(2, "0");
				Y(str);
			}).catch(e => {
				N(e);
			})
		};
		if (!crypto.subtle) return Y("FAKE-HASH-SUM-NO-CRYPTO.SUBTLE");
		if (isStr(arg)) doit(await strToBuf(arg));
		else if (arg instanceof Blob) doit(await blobToBuf(arg));
		else if (arg instanceof ArrayBuffer) doit(arg);
		else if (arg && arg.buffer instanceof ArrayBuffer) doit(arg.buffer);
		else N("Core.api.hashsum called without a valid type(String,\xa0Blob,\xa0,TypedArray,\xa0or ArrayBuffer!)");
	});
};
const isObj=arg=>{return (arg && typeof arg === "object"&& typeof arg.length === "undefined");};
const getNameExt = (fullname, if_fullpath, if_in_parts) => {//«
	let fullpath;
	if (fullname.match(/\x2f/)) {
		let arr = fullname.split("/");
		if (!arr[arr.length - 1]) arr.pop();
		fullname = arr.pop();
		fullpath = arr.join("/");
	}
	let marr;
	let ext = "";
	let name;
	if ((marr = fullname.match(/\.([_a-zA-Z][_a-zA-Z0-9]*)$/))) {
		let tryext = marr[1];
		if (globals.all_extensions.includes(tryext)) {
			ext = tryext;
			name = fullname.replace(/\.([_a-zA-Z][_a-zA-Z0-9]*)$/, "");
		} else name = fullname;
	} else name = fullname;
	if (if_in_parts) return [fullpath, name, ext];
	if (if_fullpath) return [fullpath + "/" + name, ext];
	return [name, ext]
};//»
const strNum=(str,min,max,if_exclude_min)=>{let num=null;if(isNum(str))return str;if(!isStr(str))return;if(str.match(/^-?[0-9]+$/))num=parseInt(str);else if(str.match(/^-?([0-9]+)?\.[0-9]+$/))num=parseFloat(str);if(isNum(min)){if(if_exclude_min && num<=min)return null;else if(num<min)return null;}if(isNum(max)&& num>max)return null;return num;};
const isArr=arg=>{return (arg && typeof arg === "object" && typeof arg.length !== "undefined");};
const isBool=arg=>{return typeof arg === "boolean";};
const bufToStr=arg=>{return (new TextDecoder('utf-8').decode(new DataView(arg)));};
const blobToBuf=b=>{return new Promise((Y,N)=>{let rdr=new FileReader();rdr.onloadend=()=>{Y(rdr.result);};rdr.onerror=N;rdr.readAsArrayBuffer(b);});};
const toBuf = dat => {
	if (!dat) return null;
	if (dat instanceof ArrayBuffer) return dat;
	if (dat.buffer instanceof ArrayBuffer) return dat.buffer;
	if (isStr(dat)) return strToBuf(dat);
	if (isArr(dat) && isStr(dat[0])) return strToBuf(dat.join("\n"));
	if (dat instanceof Blob) return blobToBuf(dat);
	if (typeof dat === "object"){
		try{
			return strToBuf(JSON.stringify(dat));
		}
		catch(e){};
	}
	return null;
};
const blobToStr=b=>{return new Promise(async(Y,N)=>{Y(bufToStr(await blobToBuf(b)));});};
const bytesToStr=bytearg=>{let bytes2str=(bytes)=>{let arr=[];for(let i=0;i<bytes.length;i++)arr[i]=String.fromCharCode(bytes[i]);return arr.join("");};if(bytearg instanceof ArrayBuffer){let tmp=new Uint8Array(bytearg);bytearg=tmp;}if(bytearg.buffer){try{var decoder=new TextDecoder('utf-8');var view=new DataView(bytearg.buffer);return decoder.decode(view);}catch(e){return bytes2str(bytearg);}}else if(typeof bytearg==="string")return bytearg;};
const toStr=dat=>{if(typeof dat==="string" || dat instanceof String)return dat;if(dat instanceof ArrayBuffer || dat.buffer instanceof ArrayBuffer)return bytesToStr(dat);if(dat instanceof Blob)return blobToStr(dat);try{return dat.toString();}catch(e){}console.error("Unknown object in to capi.toStr");};

return {
db: DB,
extToApp:(arg)=>{
	let ext = arg.split(".").pop();
	let num = EXT_TO_APP_MAP[ext];
	if (!Number.isFinite(num)) return DEF_APP;
	return APP_ARR[num];
},
getAppIcon:getAppIcon,
getStore:(name,opts={})=>{
    return new Promise(async(Y,N)=>{
        if (!await fsapi.loadMod("sys.idb")) {
			if (opts.reject) return N("Cannot load module: sys.idb!");
			else return Y();
		}
        let mod = new NS.mods["sys.idb"](Core);
        mod.init(name);
        Y(mod.tx());
    });
},
mkAudio:()=>{

if (globals.audio) return;

globals.audio = (()=>{
let ctx = new AudioContext();
const Mixer = function() {
    let plugs = [];
    const master = ctx.createGain();
	const compressor = ctx.createDynamicsCompressor();
//	compressor.threshold.value=-50;
	master.connect(compressor);
	compressor.connect(ctx.destination);
//    master.connect(ctx.destination);
    const Plug = function(elm) {
        let gain = ctx.createGain();
        elm.connect(gain);
        gain.connect(master);
        this.elm = elm;
        this.set_volume = val => {
            gain.gain.value = val;
        };
        this.disconnect = _ => {
            gain.disconnect();
            let num = plugs.indexOf(this);
            if (num < 0) {
                cerr("Could not find the plug in plugs", this);
                return;
            }
            plugs.splice(num, 1);
        };
    };
    this.set_volume = val => {
        master.gain.value = val;
    };
    this.plugs = plugs;
    this.plug_in = elm => {
        let plug = new Plug(elm);
        plugs.push(plug);
        return plug;
    };
	this.plugin=this.plug_in;
};
return {
mixer: new Mixer(),
ctx: ctx
}
})();

},
compress:compress,
decompress:decompress,
clipCopy:s=>{copyarea.value=s;copyarea.select();document.execCommand("copy");},
blobToStr:blobToStr,
bytesToStr:bytesToStr,
toStr:toStr,
setEnv:(k,v)=>{ENV[k]=v;},
getEnv:k=>{return ENV[k];},
delEnv:k=>{return ENV[k];},
toBuf:toBuf,
toBytes:dat=>{return new Promise(async(Y,N)=>{let buf=await toBuf(dat);if(!buf)return Y(null);Y(new Uint8Array(buf));});},
jlog:obj=>{log(JSON.stringify(obj,null,"  "));},
center:(elem,usewin,dims)=>{let usew=winw();let useh=winh();let r;if(usewin){if(usewin.main)r=usewin.main.getBoundingClientRect();else r=usewin.getBoundingClientRect();usew=r.width;useh=r.height;}r=elem.getBoundingClientRect();let elemw=r.width;let elemh=r.height;if(dims){elemw=dims.X;elemh=dims.Y;}let usex=(usew / 2)-(elemw / 2);let usey=(useh / 2)-(elemh / 2);if(usex<0)usex=0;if(usey<0)usey=0;elem.x=usex;elem.y=usey;},
pathParts:arg=>{return getNameExt(arg, true, true);},
getNameExt:getNameExt,
getKeys:obj=>{if(!obj)obj={};let arr=Object.keys(obj);let ret=[];for(let k of arr)if(obj.hasOwnProperty(k))ret.push(k);return ret;},
textToBytes:async s=>{return new Uint8Array(await strToBuf(s));},
isEOF:arg=>{if(isObj(arg)){if(arg.EOF ||(arg.lines&&arg.lines.EOF))return true;}return false;},
blobAsBytes:blob=>{return new Promise((Y,N)=>{let reader=new FileReader();reader.onloadend=()=>{Y(new Uint8Array(reader.result));};reader.onerror=N;reader.readAsArrayBuffer(blob);});},
download: (blob, name) => {
	if (!name) name = "LOTW_DL";
	if (typeof blob == "string") blob = new Blob([blob], {
		type: "text/plain"
	});
	let url = URL.createObjectURL(blob);
	let a = make('a');
	a.attset('href', url);
	a.attset('download', name);
	a.dis = "none";
	document.body.appendChild(a);
	a.click();
	a.del();
},
evt2Sym: e => {
	let mod_str = "";
	if (e.ctrlKey) mod_str = "C";
	if (e.altKey) mod_str += "A";
	if (e.shiftKey) mod_str += "S";
	return (KC[e.keyCode] + "_" + mod_str);
},
gbid:gbid,
isNum:isNum,
isBool:isBool,
isInt:isInt,
isArr:isArr,
isPosInt:arg=>{return isInt(arg)&&arg>0;},
isNegInt:arg=>{return isInt(arg)&&arg<0;},
isPos:arg=>{return isNum(arg)&& arg>0;},
isNeg:arg=>{return isNum(arg)&& arg<0;},
isNotNeg:arg=>{return isNum(arg)&& arg>=0;},
is0:isZero,
isZero:isZero,
isStr:isStr,
isNull:arg=>{return (arg===null||arg===undefined);},
isArr:arg=>{return (arg && typeof arg === "object" && typeof arg.length !== "undefined");},
isObj:isObj,
isId:str=>{return !!(str && str.match && str.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/));},
isFunc:arg=>{return (arg instanceof Function);},
isBlob:arg=>{return (arg instanceof Blob);},
strNum:strNum,
strNumMinEx:(str,num)=>{return strNum(str,num,null,true);},

typeOf:arg=>{if(isStr(arg))return "string";if(isArr(arg))return "array";if(isObj(arg))return "object";if(isNum(arg))return "number";if(isBool(arg))return "boolean";if(arg===null)return "null";if(arg===undefined)return "undefined";if(isNaN(arg))return "NaN";return "???";},

strToBuf:strToBuf,
bufToStr:bufToStr,
tmStamp:()=>{return Math.floor(Date.now()/1000);},

sha1:arg=>{return hashsum("SHA-1",arg);},
sha256:arg=>{return hashsum("SHA-256",arg);},
sha384:arg=>{return hashsum("SHA-384",arg);},
sha512:arg=>{return hashsum("SHA-512",arg);},

mk:which=>(document.createElement(which)),
mkbut:s=>{let d=document.createElement('button');if(s)d.innerHTML=s;return d;},
mkdv:s=>{let d=document.createElement('div');if(s)d.innerHTML=s;return d;},
mksp:s=>{let d=document.createElement('span');if(s)d.innerHTML=s;return d;},
mktxt:str=>{if(!str)str="";return document.createTextNode(str);},
text:str=>{return document.createTextNode(str);},
bodyact:()=>{if(document.body==document.activeElement)return true;return false;},
clear:()=>{window.getSelection().removeAllRanges();},
//winw:()=>{return pi(window.innerWidth);},
//winh:()=>{return pi(window.innerHeight);},
noprop:e=>{e.stopPropagation();},

dist:(x1,y1,x2,y2)=>{return(Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)))},

rand:rand,
randCol: (op) =>{
	if (NUM(op)) return (`rgba(${rand(0,255)},${rand(0,255)},${rand(0,255)},${op})`)
	return (`rgb(${rand(0,255)},${rand(0,255)},${rand(0,255)})`)
//	return ("rgb(" + rand(0, 255) + "," + rand(0, 255) + "," + rand(0, 255) + ")")
},
randStr:(numarg, ifdash)=>{//«
	let got = 0;
	let retstr = "";
	let gotit = null;
	let do_batch=()=>{
		let arr = new Uint16Array(2);
		window.crypto.getRandomValues(arr);
		let iter=0;
		while (iter < 2) {
			let n = parseInt(arr[iter], 16);
			if (n >= 48 && n <= 57 || n >= 65 && n <= 90 || n >= 97 && n <= 122 || n == 95 || (ifdash && n == 45)){
				if (got == numarg) return true;
				got++;
				retstr += String.fromCharCode(n);
			}
			iter++;
		}
		return null;
	};
	if (typeof(numarg) == "number" && numarg > 0 && numarg <= 250) {
		while (!do_batch()){}
		return retstr;
	}
	else throw new Error("Invalid arg to randstr");
},//»
numberLines:arr=>{if(!arr)arr=[];let tmp=[];let num=0;let numwid=(arr.length+"").length;for(let ln of arr){let numstr=(++num)+"";tmp.push(("0".repeat(numwid-numstr.length)+numstr)+ "\x20"+ln);}return tmp;},

initMidi:()=>{
///*

//MIDI«

//const init_midi = ()=>{

return new Promise(async(y,n)=>{

if (did_get_midi) return y(true);

if (navigator.requestMIDIAccess) {
	const midi_in = (mess) => {
		if (!did_get_midi) {
			cwarn("Midi UP!");
			did_get_midi = true;
		}
		mess.toString = () => {
			let dat = mess.data;
			let str = "[event Midi(" + dat[0] + "," + dat[1];
			if (isnum(dat[2])) str += "," + dat[2];
			str += ")]";
			return str;
		};
		if (Desk) Desk.onmidi(mess);
		for (let cb of midi_cbs) {
			if (cb) cb(mess);
		}
	};
	let midiarg;
	try {
		midiarg	= await navigator.requestMIDIAccess({sysex: false});
	}
	catch(e){
		cerr("navitagor.requestMIDIAccess():", e);
		y();
		return;
	}
	const getinputs = (e) => {//«
		if (e) {
			if (e instanceof MIDIConnectionEvent) {} else {
				cwarn("WHAT MIDISTATECHANGE EVENT?");
				log(e);
			}
		}
		let inputs = midi.inputs.values();
		num_midi_inputs = 0;
		for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
			if (!input.value.name.match(/^Midi Through Port/)) {
				num_midi_inputs++;
				input.value.onmidimessage = midi_in;
			}
		}
		if (num_midi_inputs) {
			if (!did_get_midi_inputs) {
				cwarn("MIDI:connected(" + num_midi_inputs + ")");
				did_get_midi_inputs = true;
			}
		} else {
			for (let cb of midi_cbs) {
				if (cb) cb({
					EOF: true
				});
			}
			did_get_midi_inputs = false;
		}
	};//»
	midi = midiarg;
log(midi);
	midi.onstatechange = getinputs;
	getinputs();
	y(true);
}
else{
cwarn("navigator.requestMIDIAccess: not found!");
	y();
}

})

//}
//this.init_midi = init_midi;
//window.init_midi = init_midi;

//»

//*/

}

}
})();
Core.api = api;

const util = (()=>{//«
return {
gbid:gbid,
jlog:api.jlog,
isnotneg:api.isNotNeg,
isint:api.isInt,
isnum:api.isNum,
ispos:api.isPos,
isneg:api.isNeg,
isfunc:api.isFunc,
isblob:api.isBlob,
isobj:api.isObj,
isarr:api.isArr,
isstr:api.isStr,
isbool:api.isBool,
isnull:api.isNull,
strnum:api.strNum,
strnum_minex:api.strNumMinEx,
isid:api.isId,
typeof:api.typeOf,
mk:api.mk,
make:api.mk,
mkbut:api.mkbut,
mkdv:api.mkdv,
mkbr:api.mkbr,
mksp:api.mksp,
mktxt:api.mktxt,
text:api.text,
bodyact:api.bodyact,
clear:api.clear,
//winw:api.winw,
//winh:api.winh,
noprop:api.noprop,
center:api.center
}

})();
globals.util=util;
//»

//»
//FS«

const loadFs=(initstep)=>{//«

if(!initstep)initstep=()=>{return{fail:NOOP,ok:NOOP}};
let step;

return new Promise(async(Y,N)=>{

const load_fs_shim=()=>{//«
return new Promise(async(Y,N)=>{

	step = await initstep("Reverting to a polyfill");
	let scr = document.createElement('script');
	document.body.appendChild(scr);
	scr.onerror = function(e){
		step.fail();
		return;
	}
	scr.onload = function(e){
		if (window.requestFileSystem instanceof Function){
			step.ok();
			Y();
			return;
		}
		step.fail();
		console.error(e);
	}
	scr.src = '/www/js/fs-shim.js';

});
};//»

step=await initstep("Checking for the native HTML5 FileSystem API");
if (!window.requestFileSystem) window.requestFileSystem = window.webkitRequestFileSystem;
if (window.requestFileSystem instanceof Function) step.ok();
else {
	step.fail(true);
	await load_fs_shim();
}

const do_request=async(fsarg, num_bytes)=>{//«

//let fs_type = "temporary";
let srch = window.location.search;
if (srch.match(/[&?]fstype=persist(ent)?/)) use_fs_type = "persistent";
else if (srch.match(/[&?]fstype=temp(orary)?/)) use_fs_type = "temporary";
let which = (use_fs_type||fs_type);
let fslet = which[0];
FSLET = fslet;
globals.fs_let = FSLET;
globals.FSLET = FSLET;
//	argobj.USEFSTYPE = which;
//	argobj.FSLET = fslet;

//	use_fs_type = arg.USEFSTYPE;
//	globals.use_fs_type = use_fs_type;

if (!use_fs_type && (lst.FSTYPE!=fs_type)) lst.FSTYPE = fs_type;
globals.fs_type = fs_type;
use_fs_type = which;
globals.use_fs_type = use_fs_type;

//	if (!use_fs_type && (lst.FSTYPE!=fs_type)) lst.FSTYPE = fs_type;
//	globals.fs_type = fs_type;

window.requestFileSystem(fsarg, num_bytes, async fsret=>{//«
	step.ok();
	let use_branch;
	let lst = localStorage;
	let key = "_"+fslet+"CURBRANCH";
	let cobj = {create:true};
	if (qobj.setbranch){//«
		lst[key] = qobj.setbranch;
		use_branch = qobj.setbranch;
		initlog("Setting branch to: " + use_branch);
	}
	else if (qobj.usebranch) {
		cobj={};
		use_branch = qobj.usebranch;
		initlog("Temporarily using branch: " + use_branch);
	}
	else if (lst[key]){
		use_branch = lst[key];
		initlog("Using current branch: " + use_branch);
	}
	else use_branch = "def";

	FSBRANCH = use_branch;
	globals.fs_branch = FSBRANCH;
	globals.FSBRANCH = FSBRANCH;


//»
	step=await initstep("Requesting the root directory for branch: "+use_branch);
	fsret.root.getDirectory(use_branch, cobj, async ret=>{//«
		globals.fs_root = ret;
		FSPREF = FSLET+"-"+FSBRANCH;
		globals.FSPREF = FSPREF;
		step.ok();
		await loadModule("sys.fs");
		fs = new NS.mods["sys.fs"](Core, root);
		globals.fs = fs;
		fs.make_all_trees(Y);
		return;
	}, e=>{
		step.fail();
		initlog("Could not get branch: " + use_branch + " to initialize the filesystem!");
	});//»
}, ()=>{
	step.fail();
	initlog("Could not initialize the HTML5 Filesystem API!");
});//»
}//»
try {//«
if ((use_fs_type == "persistent") || (use_fs_type != "temporary" && localStorage.FSTYPE=="persistent")) {
	step=await initstep("Checking for persistent storage quota...");
	navigator.webkitPersistentStorage.queryUsageAndQuota(async(used, granted)=>{
		if (granted) {
			fs_type = "persistent";
			step.val(granted);
			step=await initstep("Requesting persistent filesystem");
			do_request(PERSISTENT, granted);
		}
		else {
			step.fail(true);
			step=await initstep("Requesting temporary filesystem as a fallback");
			do_request(TEMPORARY, 5242880);
		}
	},e=>{
		step.fail();
	});
}
else {
	step=await initstep("Requesting temporary filesystem");
	do_request(TEMPORARY, 5242880);
}
}
catch(e){
step=await initstep("Requesting temporary filesystem");
do_request(TEMPORARY, 5242880);
}//»

});
};//»
api.loadFs=loadFs;

const sys_url = path => {//«
	let err = s => {
		console.error(s);
	};
	let sysroot = qobj.sysroot;
	if (sysroot) {
		let marr;
		if (!sysroot.match(/^\x2f/)) {
			err("sysroot is not a fullpath! ignoring:" + sysroot);
		} else if (marr = sysroot.match(/^\/site(\/.+)$/)) return (marr[1] + "/" + path).regpath();
		else if (sysroot.match(/^\/loc\x2f/)) {
			let url = loc_url((sysroot + "/" + path).regpath());
			if (url) return url + "&range=0-end";
			else {
				err("Local url not returned! ignoring:" + sysroot);
			}
		} else {
			err("Unsupported sysroot path(want /site or /loc):" + sysroot);
		}
	}
//	if (dev_env && dev_mode) return "/dev" + path;
	return "/root/code" + path;
};
this.sys_url = sys_url;
//»

this.mime_of_path=function(str){let marr;if(!(marr=str.match(/\.([a-z][a-z0-9]*)$/)))return "application/octet-stream";return ext_to_mime(marr[1]);}
this.text_mime=function(str){if(str.match(/^text\x2f/)|| str.match(/\/javascript$/))return true;return false;}

const load_mod = async(modname, cb, opts = {})=>{//«
	let use_type = opts.TYPE;
	let force = opts.FORCE;
	let call = opts.CALL;
	let which = "mods";
	let trypath;
//	let str;
	let have_cache = false;
//	let hash_ret = true;
	if (use_type) which = use_type;
	if (!force && NS[which][modname]) return cb(true);
	let path = modname.replace(/\./g, "/");
	let modpath;
	if (which=="coms") modpath = `/root/${path}.js`;
	else modpath = `/root/code/${which}/${path}.js`;
	if (!modpath.match(/\/root\/code\/mods\/sys/))modpath+=`?v=${VERNUM++}`;
	let scr = make('script');
	scr.type = "module";
	scr.onload = async() => {
		if (which=="mods") {
			const { mod } = await import(modpath);
			NS[which][modname] = mod;
		}
		else if (which=="libs") {
			const { lib } = await import(modpath);
			NS[which][modname] = lib;
		}
		else if (which=="coms") {
			const { com } = await import(modpath);
			NS[which][modname] = com;
		}
		if (opts.noWrap) return cb(true);
		NS[which][modname]._script = scr;
		if (call) NS[which][modname]();
		cb(true);
	};
	scr.onerror = e => {
		cerr(e);
		cb();
	};
	scr.src = modpath;
	document.head.add(scr);
};
this.load_mod = load_mod;
//»
const loadModule=(name,opts)=>{return new Promise((res,rej)=>{load_mod(name,rv=>{res(rv);},opts);});};
api.loadMod=loadModule;
this.loadModule=loadModule;
this.loadModules=(mod_arr,opts_arr)=>{if(!opts_arr)opts_arr=[];let proms=[];for(let i=0;i<mod_arr.length;i++)proms.push(loadModule(mod_arr[i],opts_arr[i]));return Promise.all(proms);};

api.loadLib=(name,opts={})=>{opts.TYPE="libs";return loadModule(name,opts);};
api.loadCom=(name,opts={})=>{opts.TYPE="coms";return loadModule(name,opts);};

this.load_lib = (name, cb)=>{load_mod(name,cb,{TYPE:"libs"});}

const make_script = (path, load, err, ifrand, win) => {
	let scr = make('script');
	document.head.appendChild(scr);
	if (win) win.scr = scr;
	if (load) {
		scr.onload = _ => {
			load(scr);
		};
	}
	if (err) {
		scr.onerror = e => {
			err(e, scr);
		};
		scr._onerror = e => {
			err(e, scr);
		};
	}
	scr.src = path;
	return scr;
};
this.make_script = make_script;
const makeScript=path=>{return new Promise((Y,N)=>{make_script(path,Y,N);});};
api.makeScript=makeScript;
api.makeScripts=arr=>{let proms=[];for(let p of arr)proms.push(makeScript(p));return Promise.all(proms);};

const mod_url=(arg,is_sys)=>{var use="mods/";if(is_sys)use="";return fs_url("code/"+use+arg.replace(/\./g,"/")+".js");}
this.mod_url=mod_url;
const fs_url = (path) => {
	if (path) path = path.replace(/^\/+/, "");
	else path = "";
	return "filesystem:" + window.location.origin + "/" + (use_fs_type || fs_type) + "/" + FSBRANCH + "/" + path;
}
this.fs_url=fs_url;
const loc_url = (port, path) => {
    let url = null;
    let base = `${window.location.protocol}//localhost:${port}`;
    if (!path) return base;
    return base + "/?path=/" + encodeURIComponent(path);
};
/*
const loc_url = (path, opts={}) => {
	let url = null;
	let base = window.location.protocol + "//" + globals.local_host + ":" + globals.local_port;
	if (globals.local_port) {
		if (!path) url = base;
		else url = base + "/?path=" + encodeURIComponent(path.replace(/^\/loc/, ""));
	} else return null;
	if (opts.REMOTE) url = url + "&is_remote=1";
	return url;
};
*/
this.loc_url = loc_url;

//»
//Terminal«

/*
//Jobs//«
const JobApp=function(jobid){//«

let servobj;
let servid=null;
let JobService=function(){
this.is_job = true;
let stdin_cb=null;
let stdout_cb=null;
let stderr_cb=null;
let exports={name:"job","job-id":""+jobid,stdin:arg=>{if(stdin_cb)stdin_cb(arg);else cwarn("NO STDIN_CB!");},stdout:arg=>{if(stdout_cb)stdout_cb(arg);else{if(arg instanceof Function)stdout_cb=arg;else{if(arg && arg.EOF && Object.keys(arg).length==1)return;console.log("[JOB "+jobid+" STDOUT]",arg);}} },stderr:arg=>{if(stderr_cb)stderr_cb(arg);else{if(arg instanceof Function)stderr_cb=arg;else{if(arg && arg.EOF && Object.keys(arg).length==1)return;console.log("[JOB "+jobid+" STDERR]",arg);}} }};
this.exports = exports;
this.setid=idarg=>{servid=idarg;}
this.set_stdin_cb=cbarg=>{stdin_cb=cbarg;}
this.set_stdout_cb=cbarg=>{stdout_cb=cbarg;return()=>{stdout_cb=null;}}
this.set_stderr_cb=cbarg=>{stderr_cb=cbarg;return()=>{stderr_cb=null;}}
}

this.file_objects = {};
this.dirty = {};
this.kill=()=>{
cwarn("Stopping JobService: " + servid);
if (servid !== null) fs.stop_service(servid+"");
if (this.dirty) {
let keys = Object.keys(this.dirty);
let arr = [];
for (let i=0; i < keys.length; i++) if (this.dirty[keys[i]]) arr.push(keys[i]);
let iter = -1;
let sync=()=>{
iter++;
let key = arr[iter];
let obj = this.dirty[key];
if (obj) {
obj.write.sync(ret=>{
if (!ret){
cerr("Job: "+jobid+" NO RET FROM SYNC!!!!!!");
}
sync();
});
}
else {
this.file_objects={};
this.dirty={};
}
}
sync();
}
}
servobj = new JobService();
this.service = servobj;

fs.start_service(servobj);

//fs.start_service(servobj).then(rv=>{
//log(rv);
//});
//let rv = await fs.start_service(servobj);


}//»

this.register_job=comarg=>{jobs[last_job_id]={str:comarg,cbs:[],_:new JobApp(last_job_id)};return last_job_id++;}
this.check_job_id=idarg=>{return jobs[idarg];}
this.set_job_cb=(idarg,cb)=>{let obj=jobs[idarg];if(!obj){cerr("register_job_cb():GOT NO JOB???? "+idarg);return;}obj.cbs.push(cb);}
this.unregister_job=idarg=>{cwarn("unregister_job:"+idarg);let job=jobs[idarg];if(job)job._.kill();jobs[idarg]=undefined;}
this.get_job_list=()=>{var ret=[];for(let i=0;i<jobs.length;i++){let job=jobs[i];if(job)ret.push(i+"  "+job.str);}return ret;}
this.kill_job = idarg => {
	let job = jobs[idarg];
	if (!job) return false;
	job._.kill();
	for (let cb of job.cbs) cb();
	jobs[idarg] = undefined;
	return true;
}

//»
*/

this.save_hook=path=>{let arr=path.split("/");if(!arr[arr.length-1])arr.pop();let fname=arr.pop();fs.add_new_kid(arr.join("/"),fname,_=>{});}

const get_history = (which, cb, if_getonly) => {
	let gothist;
	let _historys = historys;
	gothist = _historys[which];
	if (gothist) return cb(gothist.slice(0));
	let hist_fname = "/var/history/" + which + ".txt";
	fs.getfile(hist_fname, ret => {
		if (ret) {
			let arr = ret.split("\n");
			if (!arr.length - 1) arr.pop();
			if (if_getonly) return cb(arr);
			_historys[which] = arr;
		} else {
			if (if_getonly) return cb(null);
			_historys[which] = [];
		}
		let iter_str = which + "_ITER";
		let iter = lst[iter_str];
		let hist = _historys[which];
		if (iter) {
			let sh_iter = parseInt(iter);
			for (let i = 0; i <= sh_iter; i++) {
				let k = which + ":" + i;
				hist.push(lst[k]);
				delete lst[k];
			}
			hist = hist.uniq();
			fs.save_fs_by_path(hist_fname, hist.join("\n"), (ret2, err) => {
				lst[iter_str] = "-1";
				cb(hist.slice(0));
			},{});
		} else cb(hist.slice(0));
	},{});
}
this.get_history = get_history;
this.api.getHistory=(which,getonly)=>{return new Promise((y,n)=>{get_history(which,y,getonly);});};
const set_local_storage=(k,v)=>{
	k=`${FSPREF}-${k}`;
	localStorage[k]=v;
};
this.set_local_storage=set_local_storage;
const get_local_storage=(k)=>{
	k=`${FSPREF}-${k}`;
	return localStorage[k];
};
this.get_local_storage=get_local_storage;
const del_local_storage=(k)=>{
	k=`${FSPREF}-${k}`;
	delete localStorage[k];
};
this.del_local_storage=del_local_storage;

this.save_shell_com = (comarg, which) => {
	let _historys = historys;
	if (!_historys[which]) _historys[which]=[];
	let MAX_COM_LEN = 1000;
	if (!comarg) return;
	else if (comarg.match(/^\x20+$/)) return;
	comarg = comarg.trim();
	if (comarg.length > MAX_COM_LEN) {
		cerr("Refusing to save command string>MAX_COM_LEN(" + MAX_COM_LEN + ")");
		log("MAYBE USE A SCRIPT(JUSTATHOUGHT)");
		return;
	}
	let iter_str = which + "_ITER";
	if (!comarg || (last_history_com === comarg)) return;
	let lst = localStorage;
	let str = lst[iter_str];
	if (!str) str = "-1";
	let iter = parseInt(str);
	iter++;
	lst[which + ":" + iter] = comarg;
	lst[iter_str] = iter + "";
	_historys[which].push(comarg);
	last_history_com = comarg;

}

//»
//Network/XHR«

const xgettext=(url,cb)=>{xget(url,ret=>{if(ret && typeof ret==="string")cb(ret);else cb();},true);}
this.xgettext=xgettext;
api.xgetText=path=>{return new Promise((Y,N)=>{xgettext(path,Y);});}

const xgetobj = (url, cb, blob_arg, upload_prog_cb) => {//«
	let tryparse = str => {
		try {
			return JSON.parse(str);
		} catch (e) {
			log(str);
			cerr(e.message);
		}
	};
	xget(url, (ret, err) => {
		if (err) {
			let stat = err.STAT ? ("(" + err.STAT + ")") : "";
			if (err.MESS) cb(null, err.MESS.split("\n").join(" ") + stat);
			else if (err.ERR) cb(null, "There was an unspecified network error");
			else cb(null, err);
		} else {
			let obj = tryparse(ret);
			if (obj) cb(obj);
			else {
				cwarn(ret);
				cb(null, "JSON.parse error in xgetobj from url:" + url);
			}
		}
	}, true, blob_arg, null, upload_prog_cb);
};
this.xgetobj=xgetobj;
api.xgetObj=(path,blob)=>{return new Promise((Y,N)=>{xgetobj(path,Y,blob);});}
//»
this.xpostblob = function(url, blob, cb, if_text){xget(url, cb, if_text, blob);}
api.xpost=(url,blob,opts={})=>{//«
	return new Promise((y,n)=>{
		xgetobj(url,((succ,err)=>{
			if (succ) return y(succ);
			if (err) y({ERR: err});
			else y({ERR: "Unknown network error"});
		}), blob, opts.onUpProgress);
	});
};//»
this.xgetfile = (url, cb, stream_cb, if_text) => {//«
	let type, nBytes, gotBytes;
	const chunkSize = 1024 * 1024;
	let err = (stat, resp) => {
		if (resp instanceof Blob) blob_as_text(resp, blobret => {
			cb(null, {
				'STAT': stat,
				'MESS': blobret
			})
		});
		else cb(null, {
			'STAT': stat,
			'MESS': resp
		})
	};
	const getchunk = () => {
		var xhr = new XMLHttpRequest();
		var getlen;
		if (if_text) xhr.responseType = 'text';
		else xhr.responseType = 'blob';
		if (!stream_cb) xhr.open("GET", url + "&range=0-end");
		else {
			let endByte = gotBytes + chunkSize;
			if (endByte >= nBytes) endByte = nBytes;
			if (gotBytes >= endByte) return;
			getlen = endByte - gotBytes;
			xhr.open("GET", url + "&range=" + gotBytes + "-" + endByte);
		}
		xhr.onload = function() {
			if (this.status == 200) {
				let blob = this.response;
				if (typeof blob === "string") return cb(blob);
				if (!(blob instanceof Blob)) return cwarn("No blob received!");
				let size = blob.size;
				if (!size) return cwarn("No size returned");
				if (!stream_cb) {
					cb(blob);
				} else {
					if (size != getlen) {
						cerr("GOTSIZE:", size, "  != GETLEN:", getlen);
						return;
					} else {}
					gotBytes += size;
					stream_cb(blob);
					if (gotBytes == nBytes) cb();
				}
			} else err(this.status, this.response)
		};
		xhr.send();
	};
	if (stream_cb) stream_cb(null, getchunk);
	else return getchunk();
	let xhr = new XMLHttpRequest();
	xhr.open("GET", url + "&getsize=1");
	xhr.onload = function() {
		if (this.status == 200) {
			let lentxt = this.responseText;
			if (!(lentxt && lentxt.match(/^[0-9]+$/))) return cb();
			nBytes = parseInt(lentxt);
			stream_cb(null, null, nBytes);
			gotBytes = 0;
			type = xhr.getResponseHeader("Content-Type");
			getchunk();
		} else err(this.status, this.response);
	};
	xhr.send()
}//»
const xget = (url, cb, if_text, blob_to_post, prog_cb, upload_prog_cb) => {//«
	let xhr = new XMLHttpRequest();
	let upload;
	if (upload_prog_cb){
		let upload = xhr.upload;
		upload.onprogress = upload_prog_cb;
	}
	let method = 'GET';
	if (blob_to_post) method = "POST";
	xhr.open(method, url, true);
	if (if_text) xhr.responseType = 'text';
	else xhr.responseType = 'blob';
	xhr.onreadystatechange = function() {
		if (this.readyState == xhr.HEADERS_RECEIVED) {}
	};
	xhr.onprogress = prog_cb;
	xhr.onload = function() {
		if (this.status == 200) {
			let blob = this.response;
			let blobtype = blob.type;
			if (typeof blob === "string") cb(blob);
			else if (blobtype && blobtype.match && (blobtype.match(/^text/) || blobtype == "application/json" || blob.type == "application/javascript")) {
				let reader = new FileReader();
				reader.onloadend = function() {
					cb(reader.result);
				};
				reader.onerror = function(e) {
					cb();
				};
				reader.readAsText(blob);
			} else if (blob instanceof Blob) {
				let reader = new FileReader();
				reader.onloadend = function() {
					cb(reader.result);
				};
				reader.readAsArrayBuffer(blob);
			} else {
				cerr("Unknown response in Core.xget");
				log(blob);
			}
		} else {
			let gotstat = this.status;
			if (this.response instanceof Blob) {
				blob_as_text(this.response, function(blobret) {
					cb(null, {
						'STAT': gotstat,
						'MESS': blobret
					})
				});
			} else cb(null, {
				'STAT': gotstat,
				'MESS': this.response
			});
		}
	};
	xhr.onerror = function() {
		cb(null, {
			'ERR': true
		});
	};
	try {
		if (blob_to_post) xhr.send(blob_to_post);
		else xhr.send()
	} catch (e) {
		cerr(e)
	}
};
this.xget = xget;
api.xget=(url,opts={})=>{return new Promise((Y,N)=>{xget(url,Y,opts.text,opts.blob,opts.onProgress);});}
//»
//»
//Util«
/*
api.initSW = if_unreg => {//«
	return new Promise(async (Y, N) => {
		if (!navigator.serviceWorker) {
			cerr("There is no service worker support!");
			Y(false);
			return;
		}
		try {
			let reg = await navigator.serviceWorker.register('/_generateServiceWorker?path=' + encodeURIComponent("." + window.location.pathname + window.location.search), {
				scope: window.location.pathname
			});
			log("SWRegistration", reg);
			if (if_unreg) {
				cwarn("Unregistering...");
				if (await reg.unregister()) Y(true);
				else Y(false);
			} else Y(true);
		} catch (e) {
			cerr(e);
			Y(false);
		}
	});
}//»
*/
api.configPath=path=>{return new Promise(async(Y,N)=>{let trypath=home_path+"/.config/"+path;if(await fsapi.pathToNode(trypath))return Y(trypath);Y("/etc/config/"+path);});};
api.getInitStr = (path, opts = {}) => {
	return new Promise(async (Y, N) => {
		let initpath, trypath;
		if (!opts.noGet) {
			await fsapi.cacheFileIfNeeded("/etc/" + path, {
				def: opts.def,
				FSROOT: opts.FSROOT
			});
		}
		trypath = home_path + "/." + path;
		if (await fsapi.pathToNode(trypath)) initpath = trypath;
		if (!initpath) initpath = "/etc/" + path;
		let step = await NS.initstep("Using file:\xa0'" + initpath + "'");
		Y(await fsapi.readHtml5File(initpath));
		step.ok();
	});
};
const blob_as_text=(blob,cb)=>{let reader=new FileReader();reader.onloadend=()=>{cb(reader.result);};reader.onerror=function(){cb();};reader.readAsText(blob);};
const simulate=(element,eventName,locarg)=>{let oEvent,eventType=null;const eventMatchers={'HTMLEvents':/^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,'MouseEvents':/^(?:contextmenu|dragstart|click|dblclick|mouse(?:enter|leave|down|up|over|move|out))$/};const options={pointerX:0,pointerY:0,button:0,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,bubbles:true,cancelable:true};if(locarg){options.pointerX=locarg.x;options.pointerY=locarg.y;}for(let name in eventMatchers){if(eventMatchers[name].test(eventName)){eventType=name;break;}}if(!eventType)throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');oEvent=document.createEvent(eventType);if(eventType=='HTMLEvents')oEvent.initEvent(eventName,options.bubbles,options.cancelable);else oEvent.initMouseEvent(eventName,options.bubbles,options.cancelable,document.defaultView,options.button,options.pointerX,options.pointerY,options.pointerX,options.pointerY,options.ctrlKey,options.altKey,options.shiftKey,options.metaKey,options.button,element);element.dispatchEvent(oEvent);return element;}
this.simulate = simulate;

const doParseNumber = (thisarg, opts, if_float) => {//«
	if (thisarg.match(/^0+$/)) thisarg="0";
	const dec = /^([-+])?[0-9]+(e[-+]?([0-9]+))?$/i,
		dec_dot = /^([-+])?([0-9]+)?\.[0-9]*(e[-+]?([0-9]+))?$/i,
		hex = /^([-+])?0x[0-9a-f]+$/i,
		oct = /^([-+])?0o[0-7]+$/,
		bin = /^([-+])?0b[01]+$/;
	let MIN = -Infinity;
	let MAX = Infinity;
	let KEYS = ["POS", "NEG", "NOTNEG", "NOTPOS", "NOTZERO", "MIN", "MAX", "DOTOK"];
	let val;
	let str;
	if (!opts) opts = {};
	for (let k of Object.keys(opts)) {
		if (!KEYS.includes(k)) throw new Error("Invalid option:" + k);
	}
	if (Number.isInteger(opts.MIN)) MIN = opts.MIN;
	else if (opts.MIN) throw new Error("Invalid value to MIN:" + opts.MIN);
	if (Number.isInteger(opts.MAX)) MAX = opts.MAX;
	else if (opts.MAX) throw new Error("Invalid value to MAX:" + opts.MAX);

	if (thisarg.match(dec) || thisarg.match(dec_dot)) {
		if (thisarg == "0") str = thisarg;
		else str = thisarg.replace(/^0+/, "");
	} else str = thisarg;
	if (str.match(dec) || str.match(hex) || str.match(oct) || str.match(bin)) val = eval(str);
	else {
		if ((if_float || opts.DOTOK) && (str.match(dec_dot))) {
			if (if_float) val = eval(str);
			else val = Math.floor(eval(str));
		} else return NaN;
	}
	if (opts.POS && val <= 0) return NaN;
	if (opts.NEG && val >= 0) return NaN;
	if (opts.NOTNEG && val < 0) return NaN;
	if (opts.NOTPOS && val > 0) return NaN;
	if (opts.NOTZERO && val == 0) return NaN;
	if (val < MIN) return NaN;
	if (val > MAX) return NaN;
	return val;
};//»
this.set_global_drop=(obj,cb)=>{global_drops[drop_iter]={obj:obj,cb:cb};return drop_iter++;}
this.get_global_drop=(str,update_cb)=>{let marr;if(!(str && str.match &&(marr=str.match(/^global-drop:(\d+)$/))))return;let num=parseInt(marr[1]);let obj=global_drops[num];if(obj.cb)obj.cb(update_cb);global_drops[num]=null;return obj.obj;}
const get_username=()=>{if(current_user)return current_user;current_user=get_local_storage("current_user");return current_user;};
this.get_username=get_username;
const set_username=val=>{if(!val){current_user=null;return;}current_user=val;set_local_storage("current_user",val);}
this.set_username=set_username;
const get_users=()=>{if(users)return users;let str=get_local_storage("users")||"{}";users=JSON.parse(str);return users;};
this.get_users=get_users;
const set_users=(arg)=>{users=arg;set_local_storage("users",JSON.stringify(arg));};
this.set_users=set_users;
const get_term_prompt=num=>{let str=SYSNAME+"\x20(tty#"+num+")";if(qobj.nosyslock)str=str+"\nYou are in 'no system lock' mode... please be cautious!";return str;}
const dodev=()=>{if(is_offline)return false;return dev_mode;}
const set_appvar = (win, key, val) => {
	globals.AppVars[win.app + "-" + key] = val;
}
this.set_appvar = set_appvar;
const get_appvar = (win, key) => {
	return globals.AppVars[win.app + "-" + key];
}
this.get_appvar = get_appvar;

const getkeys=(obj)=>{let arr=Object.keys(obj);let ret=[];for(let i=0;i<arr.length;i++){if(obj.hasOwnProperty(arr[i]))ret.push(arr[i]);}return ret;}

const pi=(str)=>{return parseInt(str, 10);}

const trace = (args,num) => {//«
	let stack = (new Error()).stack;
	let s = stack.split("\n")[3];
	let arr = s.split(":");
//	let col = arr.pop().replace(/\)/,"");
	arr.pop();
	let line = arr.pop();
	let fname = arr.pop().split("/").pop().split("?")[0];
//	let str = `${fname}:${line}:${col}`;
	let str = `${fname}:${line}`;
	if (num===0) console.log(...args,str);
	else if (num===1) console.warn(...args,str);
	else console.error(...args,str);
};//»

const log=(...args)=>{trace(args,0);}
//const log=(...args)=>{console.log(...args);}
this.log = log;
const cwarn = (...args) => {trace(args, 1);}
//const cwarn = (...args) => {console.warn(...args);}
this.cwarn=cwarn;
const cerr=(...args)=>{trace(args,2);}
//const cerr=(...args)=>{console.error(...args);}
this.cerr=cerr;

//»
//Prototypes«
function set_protos() {
let _;
const set_style_props=(which,arr)=>{for(var i=0;i<arr.length;i+=2){(function(k,v){Object.defineProperty(which.prototype,k,{get:function(){var val=this.style[v];if(k.length==1){return parseInt(val);}return val;},set:function(arg){this.style[v]=arg;}});})(arr[i],arr[i+1]);}}
set_style_props(HTMLElement,//«
[
"fs","fontSize",
"fw","fontWeight",
"tcol","color",
"bgcol","backgroundColor",
"bgimg","backgroundImage",
"pad", "padding",
"padt", "paddingTop",
"padb", "paddingBottom",
"padl", "paddingLeft",
"padr", "paddingRight",
"mar", "margin",
"mart", "marginTop",
"marb", "marginBottom",
"marl", "marginLeft",
"marr", "marginRight",
"bor", "border",
"bort", "borderTop",
"borb", "borderBottom",
"borl", "borderLeft",
"borr", "borderRight",
"borrad","borderRadius",
"pos","position",
"dis","display",
"vis","visibility",
"op", "opacity",
"ta", "textAlign",
"td", "textDecoration",
"ff", "fontFamily",
"lh", "lineHeight",
"over", "overflow",
"overx", "overflowX",
"overy", "overflowY",
"mxh", "maxHeight",
"maxh", "maxHeight",
"mxw", "maxWidth",
"maxw", "maxWidth",
"mh", "minHeight",
"minw", "minWidth",
"minh", "minHeight",
"mw", "minWidth",
"scl","scale",
"fld","flexDirection",
"flb","flexBasis",
"fls","flexShrink",
"flg","flexGrow",
"flx","flex",
"jsc","justifyContent",
"ali","alignItems",
"als","alignSelf",
"x","left", //Start parsing ints at 'x'
"y","top",
"r","right",
"b","bottom",
"z", "zIndex",
"w","width",
"h", "height"
]);//»
set_style_props(SVGElement,//«
[
"op","opacity",
"dis","display"
]);//»
Object.defineProperty(Object.prototype,'_keys',{get:function(){return Object.keys(this);},set:function(){}});
Object.defineProperty(Object.prototype,'_vals',{get:function(){let arr=[];let keys=Object.keys(this);for(let k of keys){arr.push(this[k]);}return arr;},set:function(){}});

Blob.prototype.toString = function() {return '[Blob ('+this.size+', "'+this.type+'")]';}
Blob.prototype.render=function(parelem,pardoc){let usedoc=pardoc||document;let type=this.type;let size=this.size;const blob_str=()=>{return '[Blob('+size+',"'+type+'")]';};const corrupt_str=()=>{return "Corrupt:"+blob_str();};const add_str=(str)=>{parelem.insertAdjacentHTML('beforeend',str)};let hash={"image":"img","audio":"audio","video":"video"};let marr=type.match(/^(image|video|audio)\x2f/);if(marr&&marr[1]){let elem=usedoc.createElement(hash[marr[1]]);let url=URL.createObjectURL(this);let playfunc=function(){URL.revokeObjectURL(url);};elem.onerror=function(){add_str('<span style="padding:7;background-color:#800;color:#fff;">'+corrupt_str()+'</span>');URL.revokeObjectURL(url);};elem.src=url;parelem.appendChild(elem);if(elem.play){elem.oncanplay=playfunc;elem.controls=true;elem.play();}else elem.onload=playfunc;}else add_str("<div>"+blob_str()+"</div>");}
Blob.prototype.isText=function(){var t = this.type;return (t.match(/^text\x2f/)||t.match(/\/(javascript|json)$/));}

_ = Array.prototype;
_.eq=function(arg){
	if (!(arg instanceof Array)) return false;
	let ln = this.length;
	if (ln!==arg.length) return false;
	for (let i=0; i < ln; i++) {
		if (this[i]!==arg[i]) return false;
	}
	return true;
};
_.uniq =  [].uniq || function(a){return function() {return this.filter(a)}}(function(a,b,c) {return c.indexOf(a,b + 1) < 0})
_.splicein=function(arr,pos,lenarg){let uselen=arr.length;if(lenarg || lenarg==0)uselen=lenarg;let args=[pos,uselen].concat(arr);Array.prototype.splice.apply(this,args);}
_.clone=function(){var arr=[];for(var i=0;i<this.length;i++){if(this[i].clone){arr[i]=this[i]['clone']();break;}arr[i]=this[i];}return arr;}
_.maxlen=function(){var str=this.reduce(function(a,b){return a.length>b.length ? a:b;});return str.length}
_.rm=function(arg){if(!arg)return;var num=this.indexOf(arg);if(num>-1)this.splice(num,1);}

_ = HTMLElement.prototype;
_.loc = function(x, y) {
	if (x != 0 && !x) return {
		'X': this.style.left,
		'Y': this.style.top
	};
	else {
		this.style.left = x;
		this.style.top = y;
	}
}
_.dims = function(w, h) {
	if (w != 0 && !w) return {
		W: this.style.width,
		H: this.style.height
	};
	else {
		this.style.width = w;
		this.style.height = h;
	}
}
_.del = function(){if (this.parentNode) {this.parentNode.removeChild(this);}}
_.ael = function(which, fun){this.addEventListener(which, fun, false);}
_.attset = function(key, val) {this.setAttribute(key,val);}
_.attget = function(key) {return this.getAttribute(key);}
_.html = function(str) {this.innerHTML = str;}
//_.add=function(kid){this.appendChild(kid);}
_.add = function(...args) {
	for (let kid of args) this.appendChild(kid);
}
_.vcenter=function(amount){if(!amount)amount="50%";this.pos="relative";this.y=amount;this.style.transform="translateY(-"+amount+")";}
_.flexcol=function(if_off){if(if_off){this.style.display="";this.style.alignItems="";this.style.justifyContent="";this.style.flexDirection="";}else{this.style.display="flex";this.style.alignItems="center";this.style.justifyContent="center";this.style.flexDirection="column";}}

_ = String.prototype;
_.appname=function(){return this.split(".").pop();}
_.regpath=function(if_full){var str=this;if(if_full)str="/"+str;str=str.replace(/\/+/g,"/");if(str=="/")return "/";return str.replace(/\/$/,"");}
_.regstr=function(useend){var endsp="";if(useend)endsp=" ";return this.replace(/^[\x20\t]+/g,"").replace(/[\x20\t]+$/g,endsp).replace(/[\x20\t]+/g," ");}
_.rep = function (num) {var ret = "";for (var i=0; i < num; i++) {ret = ret + this;}return ret;}
_.lc = function (){return this.toLowerCase();}
_.uc = function (){return this.toUpperCase();}
_.tonbsp = function(){return this.split(/\x20/).join("&nbsp;")}
_.urienc = function() {return encodeURIComponent(this)};
_.htmlesc = function() {return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');}
_.chomp = function () {return this.replace(/\x20+$/g, "");}
_.firstup = function() {return this.charAt(0).toUpperCase() + this.slice(1);}
_.lpad=function(num,fill){var tmp;if(this.length<num)return fill.repeat(num-this.length)+this;return this;}
_.pi = function(opts) {return doParseNumber(this, opts);}
_.pir=function(lo,hi){if(!(Number.isFinite(lo)&&Number.isFinite(hi)&&hi>lo))throw new Error("Invalid arguments to String.pir");return doParseNumber(this,{MIN:lo,MAX:hi});}
_.ppi=function(opts){if(!opts)opts={};opts.POS=true;return doParseNumber(this,opts);}
_.pnni=function(opts){if(!opts)opts={};opts.NOTNEG=true;return doParseNumber(this,opts);}
_.pf=function(opts){return doParseNumber(this,opts,true);}

_=SVGElement.prototype;
_.sim = function(which) {simulate(this, which);}
_.down = function() {simulate(this, 'mousedown');}
_.ael = function(which, fun){this.addEventListener(which, fun, false);}
_.add = function(...args) {
	for (let kid of args) this.appendChild(kid);
}
_.del = function() {if (this.parentNode) this.parentNode.removeChild(this);}
_.attset = function(key, val) {this.setAttribute(key,val);}
_.attget = function(key) {return this.getAttribute(key);}

}//»

this.init = async()=>{//«

//Var«

let is_app;
let app_path;
let is_desk;
let app_win;
let is_shell;
let winpath = window.location.pathname;
let rv;
let marr;
//	if (is_app){}
if (winpath=="/shell") is_shell = true;
else if (winpath == "/desk") is_desk = true;
else if (marr = winpath.match(/^\/(.+)\.app$/)) {
//	is_app=marr[1].replace(/\x2f/g,".");
	app_path = marr[1]+".js";
	is_app = app_path.replace(/\x2f/,".");
//	is_app=marr[1];
//	is_app = true;
//	app_path = `${marr[1].replace(/\./g,"/")}.js`;
//	is_app = `${marr[1].replace(/\//g,"/")}.js`;
}
else {
console.error("Path no good: " + winpath);
	return;
}
globals.stats={};
let ua = navigator.userAgent;
if (ua.match(/Chrome/)){
	globals.is_chrome=true;
	if (ua.match(/Macintosh/)) globals.is_mac=true;
}
else if (ua.match(/Firefox/))globals.is_ff=true;

let initlog = NS.initlog;
let initstep = NS.initstep;
let step;

let SYSTEM_IS_LOCKED = false;
let use_init_func;


Core.sysfstype=()=>{
	return (use_fs_type ||fs_type);
};
Core.sysfsbranch=()=>{
	return FSBRANCH;
};

/*
setTimeout(()=>{//«
//	if (SYSTEM_IS_LOCKED){
	if (globals.read_only){
		if (Desk) Desk.lock_system();
//		else if (current_term) current_term.obj.lock_term();
	}
},500);//»
*/
set_protos();
//Developer stuff«
if (winorig.match(/localhost/)||winorig.match(/127\.0\.0\.1/)||winorig.match(/192\.168\./)) {
	dev_env = true;
	globals.dev_env = true;
	globals.is_local = true;
}
if (qobj.dev) {
	dev_mode = true;
	globals.dev_mode = true;
}
//»
globals.qobj = qobj;
//if (qobj.dev) {dev_mode = true;globals.dev_mode = true;}

//»
//Dom«
body.style.margin = 0;
body.style.overflow = "hidden";
body.ff="sans-serif";
body.fs="14px";
if (1){
	let d = mk('div');
	d.pos="absolute";
	d.loc(-100,-100);
	d.op=0;
	d.w=0;
	d.h=0;
	body.add(d);
	d.add(copyarea);
}
//»

//Event listeners«

window.onbeforeunload = () => {//«
	let ifapi = NS.api.iface;
	if (ifapi) ifapi.closeAllConnections();
	if (Desk){
		let wins = Desk.get_windows(true);
		for (let w of wins){
			if (w.obj) {
				if (w.obj.is_dirty) return "There is an unsaved application!";
				if (w.obj.onkill) w.obj.onkill();
			}
		}
	}
	else if (terminals){
		let keys = getkeys(terminals);
		for (let k of keys) {
			if (terminals[k].obj.is_dirty) return "There is an unsaved application!";
		}
	}
	else if (app_win&&app_win.obj&&app_win.obj.onkill){
		app_win.obj.onkill();
	}
};//»
window.addEventListener("dragover",function(e){e =e||event;e.preventDefault();},false);
window.addEventListener("drop",function(e){e =e||event;e.preventDefault();},false);
//»

//Init«

const get_current_user=(fsarg)=>{//«
	return new Promise(async(y,n)=>{
		get_username();
		get_users();
		if (!current_user){
			set_username("me");
			users[current_user] = await api.sha1(current_user);
			users["_"] = await api.sha1("root");
			set_users(users);
		}
		home_path = '/home/'+current_user;
		desk_path = get_local_storage("desk_path")||home_path+"/Desktop";
		globals.desk_path = desk_path;
		globals.home_path = home_path;
		try{
			step=await initstep("Creating all the system directories");
			let fs = fsapi || fsarg;
			await fs.touchHtml5Dirs([home_path],{reject:true});
			await fs.touchHtml5Dirs([desk_path],{reject:true});
//			await fsapi.touchHtml5File(desk_path+"/.",{reject:true});
			await fs.popHtml5Dirs(['/home']);
			step.ok();
		} catch (e) {
console.error(e);
			step.fail();
			NS.initlog("Desktop initialization failed: " + (e.message || e), true);
			return;
		}
		y(true);
	});
}
api.getCurrentUser = get_current_user;
//»
const make_app = (num_or_name, arg) => {//«
	const noop = () => {};
	let id;
	let win = make('div');
	Object.defineProperty(win,"title",{get:noop,set:noop});
	win.style.userSelect = "none";
	win.ondrop = e => {
		e.stopPropagation();
		e.preventDefault();
	};
	let name;
	let isterm = false;
	if (num_or_name.match(/^\d+$/)) {
		win.app = "sys.Terminal";
		name = win.app;
		isterm = true;

		win.ondrop = e=> {
			let i;
			let items = e.dataTransfer.items;
			let names=[];
			let files=[];
			let bodies=[];
			for (let item of items) {
				let ent = item.webkitGetAsEntry();
				if (!(ent&&ent.isFile)) continue;
				names.push(ent.name);
				files.push(item.getAsFile());
			}
			i = -1;
			const doitem=()=>{
				i++;
				if (i>=names.length) {
					let all = []; 
					for (let i=0; i < names.length; i++) all.push({name: names[i], blob: bodies[i]});
					win.obj.set_blob_drops(all);
					return;
				}
				let f = files[i];
				let rdr = new FileReader();
				rdr.onloadend = () => {
					bodies.push(new Blob([rdr.result],{type:"application/octet-stream"}));
					doitem();
				};
				rdr.onerror = (e)=>{
console.error(e);
					doitem();
				};
				rdr.readAsArrayBuffer(f);
			};
			doitem();
		};
		id = name;
	}
	else if (is_app) {
		name = num_or_name;
		id = num_or_name.split(".").pop();
		app_win = win;
	}
	else {
		name = num_or_name;
		id = name;
	}
//	arg.TOPWIN = win;
//	arg.topwin = win;
	let statdiv = make('div');
	statdiv.tcol="#ddd";
	statdiv.fs=14;
	statdiv.padl=3;
	statdiv.padt=1;
	statdiv.over="hidden";
	statdiv.pos="relative";
	statdiv.w="100%";
	statdiv.x=0;
	statdiv.b=2;
	statdiv.h=14;
	win.status_bar=statdiv;
	
	win.loc(0, 0);
	win.style.zIndex = 1;
	win.pos = "fixed";
	win.id = id;
	let main = make('div');
	win.main = main;
//	arg.MAIN = main;
//	arg.main = main;
	main.pos = "relative";
	main.loc(0, 0);
	main.w = winw();
	main.h = winh()-16;
	main.top=win;
	win.appendChild(main);
	win.appendChild(statdiv);
	body.appendChild(win);
	win.set_winname = noop;
	name = name.replace(/\x2f/g, ".");
//	let o = arg.APPOBJ;
	arg.Main = main;
	arg.Core = Core,
	arg.NS = NS;
//	arg.APPOBJ.
	win.obj = new NS.apps[name](arg);
//	win.obj = new NS.apps[name](arg.APPOBJ);
//	win.obj = new NS.apps[name](arg.APPOBJ,NS,globals,Core,Core.Desk,main);
	if (isterm) terminals[num_or_name] = win;
	return win;
}//»
const init_end = ()=>{//«
	delete NS.sys;
//	if (dev_env && dev_mode) NS.Core = Core;
	NS.Core = Core;
	Object.freeze(window[__OS_NS__]);

}//»

const init_term = async () => {//«
	document.title = SYSACRONYM+" shell";
	terminals = {};
	document.onkeyup = null;
	initlog("Initializing console mode...");
	let shell_str;
	const start = () => {
		initlog("Getting shell history...");
		get_history("shell", histret => {
			if (!histret) histret = [];
			const doit = () => {
				const keydown = (e) => {//«
					let prevdef = {
						"s_CA": 1,
						"e_C": 1,
						"=_C": 1,
						"-_C": 1,
						"l_C": 1,
						"f_C": 1,
						"s_C": 1,
						"c_CS": 1,
						"k_C": 1,
						"a_C": 1,
//						"w_C": 1,
						"d_A": 1,
						"p_C": 1,
						"j_C": 1
					};
					let code = e.keyCode;
/*
					let macro_cb = Core.get_macro_update_cb();
					if (code >= 16 && code <= 18) {
						if (!macro_cb) {
							return current_term.obj.onkeydown(e,"","");
						}
					}
*/
					let mod = "";
					if (e.ctrlKey) mod = "C";
					if (e.altKey) mod += "A";
					if (e.shiftKey) mod += "S";
					let sym = KC[code] + "_" + mod;
					if (prevdef[sym]) e.preventDefault();
/*
					if (macro_cb) {
						if (sym=="ESC_") return current_term.obj.onescape();
						let str = Core.macro_key_down(code);
						if (str === null) return;
						macro_cb(str);
						return;
					}
*/
					let marr;
					if (marr = sym.match(/^([1-9])_CA$/)) {
						let num = marr[1];
						if (current_term.id == num) return;
						current_term.style.zIndex = -1;
						current_term = terminals[num];
						if (!current_term) {
							let prompt_str = get_term_prompt(num);
							if (globals.read_only) prompt_str+="\nThe system is in read only mode!";
							current_term = make_app(num, {
								HISTORY: histret.slice(),
								PROMPT: prompt_str
//								PROMPT: get_term_prompt(num)
							});
							current_term.obj.onresize(true);
						} else {
							current_term.style.zIndex = 1;
							current_term.obj.onfocus();
						}
						return;
					}
					if (sym==="ESC_") return current_term.obj.onescape();
					current_term.obj.onkeydown(e, sym, mod);
				};//»
				const keyup=e=>{//«
/*
					let code = e.keyCode;
					let macro_cb = Core.get_macro_update_cb();
					if (macro_cb) { //Macronator
						Core.macro_key_up(
							code, 
							str => { //out_cb
								macro_cb(str);
							}, 
							macroobj => { //accept_cb
								Core.call_macro_succ_cb(macroobj);
								Core.set_macro_update_cb(null);
								Core.set_macros(null);
							},
							() => { //reject_cb
								Core.call_macro_rej_cb();
								Core.set_macro_update_cb(null);
								Core.set_macros(null);
							},
							false
						);
						return;
					}
*/
				};//»
				initlog("The shell environment is now active!");
				document.body.innerHTML = "";
				let prompt_str = get_term_prompt(1) + '\nPress Ctrl+Alt+[1-9] to switch between virtual consoles'
				if (globals.read_only) prompt_str+="\nThe system is in read only mode!";
				current_term = make_app("1", {
					INIT: init_str,
					PROMPT: prompt_str
//					PROMPT: get_term_prompt(1) + '\nPress Ctrl+Alt+[1-9] to switch between virtual consoles'
				});
				if (!globals.noevents) {
					document.onkeyup = keyup;
					document.onkeydown = keydown;
					Core.keydown = keydown;
					document.onkeypress = e => {
						let code = e.charCode;
						if (code >= 32 && code <= 126) current_term.obj.onkeypress(e);
					};
				}
				window.onresize = () => {
					let keys = getkeys(terminals);
					for (let k of keys) {
						let win = terminals[k];
						win.main.w = winw();
						win.main.h = winh();
						win.obj.onresize(null, null, true);
					}
				};
				init_end();
			};
			doit();
		});
	};

	let scr = make('script');
	const term_app_path = '/root/code/apps/sys/Terminal.js';
	scr.onload=async()=>{
		const { app } = await import(term_app_path);
		NS.apps["sys.Terminal"] = app;
		start();
	};
	scr.onerror = e => {
		initlog("The Terminal could not be loaded!", true);
		throw new Error(e);
	};
	scr.type="module";
	scr.src = term_app_path;
	document.head.add(scr);


};//»
const init_desk = async () => {//«
	document.title = SYSACRONYM+" desktop";
	document.onkeyup = null;
	step=await initstep("Loading the 'widgets' module");
	rv = await loadModule('sys.widgets');
	step.ok();
	step=await initstep("Running the 'widgets' module");
	globals.widgets = new NS.mods["sys.widgets"](Core);
	step.ok();
	step=await initstep("Loading the 'desktop' module");
	rv = await loadModule('sys.desk');
	step.ok();
	step=await initstep("Running the 'desktop' module");
	Desk = new NS.mods["sys.desk"](Core,{body:document.body});
	winw = Desk.winw;
	winh = Desk.winh;
	winy = Desk.winy;
	winx = Desk.winx;
	step.ok();
	Core.Desk = Desk;

	globals.widgets.set_desk(Desk);

	window.onresize = null;
	window.onunload = null;

	Desk.init(init_str, () => {
		fs.set_desk(Desk);
		init_end();
	});
}//»
const init_app = async() => {//«
		const noop=()=>{};
		const Desk={
			check_open_files:noop,
			is_app:true,
			CG:{
				off:noop,
				on:noop
			}
		};
		Core.Desk=Desk;

//		step=await initstep("Loading the 'widgets' module");
//		await loadModule('sys.widgets');
//		step.ok();
//		step=await initstep("Running the 'widgets' module");
//		globals.widgets = new NS.mods["sys.widgets"](Core);
//		step.ok();
//		globals.widgets.set_desk(Desk);

		let path = qobj.path;
		let root = qobj.root;
		let argobj;
		if (path) {
			cwarn("Path:" + path)
		}
		if (root) {
			cwarn("Root:" + root)
		}
		if (qobj.args) {
			try {
				argobj = JSON.parse(atob(qobj.args));
			} catch (e) {
				initlog("Invalid base64 JSON in args", true);
				return
			}
			cwarn("Args", argobj);
		}
//		let app_path = is_app.replace(/\./g, "\/") + ".js";
		globals.app_mode = true;
		document.onkeyup = null;
		initlog("Initializing app mode...");
		const start = () => {//«
			const noop = ()=>{};
			NS.initlogelem.del();
			let win = make_app(is_app, {
				APPOBJ:{is_app:true}
			});
			Core.Window = win;
			let obj = win.obj;
			let keydown = obj.onkeydown||noop;
			let keypress = obj.onkeypress||noop;
			let keyup = obj.onkeyup||noop;
			let rs_handler = obj.onresize;
			document.onkeydown = e => {//«
				let code = e.keyCode;
				if (code == KC.ALT || code == KC.CTRL || code == KC.SHIFT) {}
				let mod_str = "";
				if (e.ctrlKey) mod_str = "C";
				if (e.altKey) mod_str += "A";
				if (e.shiftKey) mod_str += "S";
				let chr = KC[code];
				let kstr = chr + "_" + mod_str;
				let cpr = win.CPR||Desk.CPR;
				if (cpr) {
					if (cpr.key_handler) {
						if (kstr == "ENTER_A") kstr = "ENTER_";
						else return cpr.key_handler(kstr, e, false, code, mod_str);
					}
					let okbut = cpr.ok_button;
					let clickok = () => {
						okbut.click();
					};
					if (cpr.is_macro) {
						console.warn("Not handling current_prompt.is_macro!");
					} else if (okbut) {
						let keys = cpr._keys;
						if (keys) {
							if (kstr != "ESC_" && (keys === true || keys.includes(kstr))) cpr.keyok = true;
							clickok();
						} else if (kstr == 'ENTER_' || (kstr == "ESC_" && cpr.inactive)) {
							e.preventDefault();
							clickok();
						}
					}
					return;
				}
				if (kstr==="ESC_") return obj.onescape();
				keydown(e, kstr);
			};//»
			document.onkeyup = keyup;
			document.onkeypress = keypress;
			if (rs_handler) {
				window.onresize = () => {
					win.main.w = winw();
					win.main.h = winh();
					rs_handler(null, null, true);
				};
			}
			obj.onappinit && obj.onappinit(true);
			init_end();
		};//»
		const end = () => {
			initlog("Could not load:" + is_app, true);
		};

		let scr = make('script');
		const fullpath = `/root/code/apps/${app_path}`;
	
//cwarn(fullpath);
		scr.onload=async()=>{
			const { app } = await import(fullpath);
			NS.apps[is_app] = app;
			start();
		};
		scr.onerror = e => {
			initlog("The app could not be loaded!", true);
			throw new Error(e);
		};
		scr.type="module";
		scr.src = fullpath;
		document.head.add(scr);
/*
		let rv = await fetch(sys_url("/apps/"+app_path));
		if (!(rv&&rv.status==200)) return;
		const app_str = `window[__OS_NS__].apps["${is_app}"] = function (arg,NS,globals,Core,Desk,Main){(async()=>{"use strict";${await rv.text()}\n})()}`;
		make_script(URL.createObjectURL(new Blob([app_str],{type:"application/javascript"})), start, end);
*/
	}
//»

//Initialize FS«

	if (!is_app) {

		if (!await loadFs(initstep)) return initlog("Could not load the 'fs' module",true);
//		await initFs();
		fsapi = NS.api.fs;
		await get_current_user();
//		if (!localStorage._didinit){
//			await fsapi.writeHtml5File(globals.desk_path+'/HelloWorld.app','{"app":"demo.HelloWorld"}');
//		}
		step=await initstep("Finding 'globals.json'");
		let globals_str = await api.getInitStr("config/globals.json",{noGet:true});
		if (globals_str) step.ok();
		else step.fail(true);
		try{
			step=await initstep("Parsing 'globals.json'");
			globals.usr = JSON.parse(globals_str);
			step.ok();
		}   
		catch(e){
			step.fail(true);
			globals.usr = {};
			initlog("Parse fail!");
			console.log(globals_str);
		} 

		step=await initstep(`Finding the system init script at '${INIT_SCRIPT}'`);
		try {
			init_str = await fsapi.readHtml5File(INIT_SCRIPT,{reject:true});
//			initlog("OK. See console.");
			initlog(`*****   Contents of '${INIT_SCRIPT}'   *****`);
			initlog(init_str);
			step.ok();
		}
		catch(e){
			step.fail(true);
//			cerr(e);
//			console.error(e);
		}
	}//»


//if (is_shell && qobj.nosyslock){}
//else if (!is_app) {

if (!is_app) {

if ('BroadcastChannel' in window) {

	step=await initstep("Initializing the BroadcastChannel (for system integrity)");
//	if (!('BroadcastChannel' in window)) {
//		step.fail();
//		return;
//	}
	step.ok();
	system_channel = new BroadcastChannel("system");
	system_channel.postMessage("init:"+FSPREF);
	system_channel.onmessage = e=>{//«
		let mess = e.data;
		if (mess=="init:"+FSPREF) {
//			if (SYSTEM_IS_LOCKED) return;
			if (globals.read_only) return;
			system_channel.postMessage("ack:"+FSPREF);
		}
		else if (mess=="ack:"+FSPREF) {
//			globals.noevents = true;
//			SYSTEM_IS_LOCKED = true;
cwarn("READONLY");
			globals.read_only = true;
/*
			document.onkeydown=e=>{
				if (Desk) Desk.lock_system();
				else if (current_term) current_term.obj.lock_term();
			};
			document.onkeyup=null;
			document.onkeypress=null;
*/

		}
		else if (mess.match && mess.match(/^(init|ack):/)){
console.warn("Dropping: " + mess);
		}
		else {
			system_messages.push(mess);
console.warn("Message received on the broadcast channel...");
console.log(mess);
		}
	}//»

}

}


	if (is_desk) init_desk();
	else if (is_shell) init_term();
	else if (is_app) init_app();
	else return initlog("What is happening here?", true);

	api.winw = winw;
	api.winh = winh;
	api.winx = winx;
	api.winy = winy;
	util.winw = winw;
	util.winh = winh;
	util.winx = winx;
	util.winy = winy;

//»

}//»

};

//Boot Setup«

(async()=>{

//Var«

const mk=str=>document.createElement(str);
const log=(...args)=>{console.log(...args)};
const _initlog = document.getElementById("initlog");
const inittab = _initlog.parentNode;
NS.initlogelem = inittab;
const initstep=(str, if_error)=>{//«
	let obj = {
		val:()=>{
			outtd.innerHTML=str;
		},
		ok:()=>{
			outtd.innerHTML='<span style="color:#0f0;">&#10003;</span>';
		},
		fail:(not_fatal)=>{
			if (!not_fatal) {
console.error("FATAL");
				_initlog.style.display="";
			}
			outtd.style.opacity=1;
			outtd.innerHTML='<span style="color:#f00;">&#10007;</span>';
		}
	}
	if (if_error) {
		_initlog.style.display="";
		str = "<br>Error: " + str;
	}
	let tr = mk('tr');
	let numtd = mk('td');
	tr.appendChild(numtd);
	
	let n = _initlog.childNodes.length;
	let nstr;
	if (n<10) nstr = "&nbsp;"+n;
	else nstr = n;
	numtd.innerHTML= nstr+")";
	let intd = mk('td');
	intd.style.width=(window.innerWidth-60)+"px";
	intd.innerHTML=str;
	tr.appendChild(intd);
	let outtd = mk('td');
	outtd.style.fontSize="15px";
	tr.appendChild(outtd);
	_initlog.appendChild(tr);
	let dy = inittab.scrollHeight-window.innerHeight;
	if (dy > 0) inittab.y = -dy;
	if (verbose) console.log(n+") "+str);
	if (!stmode) return obj;
	return new Promise((y,n)=>{
		step_cb = ()=>{y(obj)};
	});
}
NS.initstep = initstep;
//»
const initlog=(str, if_fatal)=>{//«
	let tr = mk('tr');
	let numtd = mk('td');
	tr.appendChild(numtd);
	let n = _initlog.childNodes.length;
	let nstr;
	if (n<10) nstr = "&nbsp;"+n;
	else nstr = n;
	numtd.innerHTML= nstr+")";
	let intd = mk('td');
	intd.style.width=(0.8*window.innerWidth)+"px";
	intd.innerHTML=str;
	tr.appendChild(intd);
	let outtd = mk('td');
	outtd.innerHTML="&nbsp;";
	tr.appendChild(outtd);
	_initlog.appendChild(tr);
	let dy = inittab.scrollHeight-window.innerHeight;
	if (dy > 0) inittab.y = -dy;
	if (verbose) console.log(n+") "+str);
	if (if_fatal) _initlog.style.display="";
}
NS.initlog = initlog;
//»

document.body.style.backgroundColor="#000";
document.body.style.color="#ccc";
inittab.style.height=window.clientHeight;

let verbose;
let silent;
let srch = window.location.search;
let qobj = {};
//let qstr = srch;
let step_cb;
let step;
let stmode = false;

//»

if (srch) {//URL Params are "boot flags"«

let rep_qarr = [];
let nogo = ["set_branch"];
let didrep = false;
if (srch.match(/[&?]verbose=/)) verbose = true;
else verbose = false;
if (srch.match(/[&?]bootstepper=/)){
	stmode=true;
	verbose=true;
	document.onkeydown=e=>{
		if (e.key=="Enter") step_cb();
	};
}
let qarr = srch.slice(1).split("&");
for (let i=0; i < qarr.length; i++) {
	let qelm = qarr[i].split("=");
	let key = qelm.shift();
	key = key.replace(/-/g,"_")
	let val = qelm.join("=");
	qobj[key] = val;
	if (nogo.indexOf(key) > -1) {didrep = true}
	else rep_qarr.push(qarr[i]);
}

if (didrep) {//«
	let userep = "";
	let q = "?";
	if (rep_qarr.length) userep = rep_qarr.join("&");
	if (!userep) q = "";
	window.history.pushState({newstate: 1}, "LOTW", window.location.origin + window.location.pathname + q + userep);
}//»

}//»

NS.stepmode = stmode;

if (!verbose) _initlog.style.display="none";
if (stmode) {
	initlog("Entering boot sequence stepping mode");
	step=await initstep("Please press 'Enter' to execute every step (like this one!)");
	step.ok();
}
step = await initstep("Running the 'core' module");
try{
	let core = new Core(qobj);
	core.init();
	step.ok();
}
catch(e){
	step.fail();
}

})();

//»










/*Old: Network/Login/Status«
const refresh_stats = () => {
	return new Promise(async (y, n) => {
		let rv=await fetch(`/_status`);
		if (!(rv&&rv.ok)) return y();
		let arr = (await rv.text()).split("\n");
		globals.stats.USERNAME = arr[0];
		globals.stats.EMAIL = arr[1];
		return y(arr[0]);
//		Desk.update_status(arr[0]);
//
//  	let rv = await fetch("/_status");
//  	if (rv && rv.ok === true) globals.stats = await rv.json();
//  	else globals.stats = {}
//  	y(globals.stats);

	});
};
api.refreshStats=refresh_stats;

const loginout =(which,cb) => {//«
	return new Promise((Y, N) => {
		let win = window.open("/" + which.toLowerCase(), which, "width=700,height=500");
		const end = async () => {
			clearInterval(interval);
			await refresh_stats();
			Y(true);
			cb&&cb();
		};
		let interval = setInterval(() => {
			try {
				if (win && win.top) {} else {
					clearInterval(interval);
					end();
				}
			} catch (e) {
				clearInterval(interval);
				end();
			}
		}, 200);
	});
}//»
api.login=(cb)=>{return loginout("Login",cb);};
api.logout=(cb)=>{return loginout("Logout",cb);};

//this.get_email=()=>{
//throw new Error("Get yer *own* damn email, what're you buggin me about that fer?");
//};

//const start_local_ws=()=>{let cb=null;if(!globals.local_port)return cerr("Not starting local websockets,need a local_port!");let ws=new WebSocket("ws://localhost:"+globals.local_port);ws.binaryType="arraybuffer";ws.onmessage=e=>{let str=api.bytesToStr(e.data);if(cb)cb(str);};ws.onopen=_=>{cwarn("WSOPEN")};};

//this.get_channel_message=()=>{return system_messages.shift();}
//this.send_channel_message=(dat)=>{system_channel.postMessage(dat);}
»*/
//OLD/Unused: Macros«
/*
Never used/Unneeded complexity
//Macros«

let cur_macros = null;
this.set_macros=obj=>{cur_macros=obj;};
let macro_update_cb=null;
let cur_macro_arr, macro_iter, dn_macro_keys,up_macro_keys;
let cur_macro_succ_cb, cur_macro_rej_cb;
this.set_macro_succ_cb=f=>{cur_macro_succ_cb=f;};
this.set_macro_rej_cb=f=>{cur_macro_rej_cb=f;};
this.call_macro_succ_cb=arg=>{if(cur_macro_succ_cb)cur_macro_succ_cb(arg);};
this.call_macro_rej_cb=_=>{if(cur_macro_rej_cb)cur_macro_rej_cb();};
this.get_macro_update_cb=_=>{return macro_update_cb;};
this.set_macro_update_cb=f=>{macro_update_cb=f;};
this.reset_macro_vars =_=>{//«
	cur_macro_arr = [];
	macro_iter = 0; 
	dn_macro_keys = {};
	up_macro_keys = {};
}//»
this.macro_key_down=code=>{//«
if (!cur_macros) return;
let ch;
if (code == KC.ALT) ch = "A";
else if (code == KC.CTRL) ch = "C"
else if (code == KC.SHIFT) ch = "S";
else ch = String.fromCharCode(code).toLowerCase();
if (!ch.match(/[a-zA-Z0-9]/)) return null;
dn_macro_keys[ch]=1;
let str = "";
if (cur_macro_arr.length) str = cur_macro_arr.join("+") + "+";
let mstr = getkeys(dn_macro_keys).sort().join("");
let marr = mstr.match(/^([ACS]+)/);
if (marr && marr[1]) mstr = mstr.replace(/^[ACS]+/, "").replace(/$/, "_"+marr[1]);
str += mstr;
return str;
}//»
this.macro_key_up=(code, out_cb, accept_cb, reject_cb, if_desk)=>{//«
if (!cur_macros) return;
let ch;
if (code == KC.ALT) ch = "A";
else if (code == KC.CTRL) ch = "C"
else if (code == C.SHIFT) ch = "S";
else ch = String.fromCharCode(code).toLowerCase();
if (!ch.match(/[a-zA-Z0-9]/)) return;
if (!dn_macro_keys[ch]) return;
delete dn_macro_keys[ch];
up_macro_keys[ch] = 1;
if (getkeys(dn_macro_keys).length===0) {//«
	let str = getkeys(up_macro_keys).sort().join("");
	let marr = str.match(/^([ACS]+)/);
	if (marr && marr[1]) str = str.replace(/^[ACS]+/, "").replace(/$/, "_"+marr[1]);
	up_macro_keys = {};
	cur_macro_arr[macro_iter] = str;
	macro_iter++;
	str = cur_macro_arr.join("+")
	out_cb(str);
	let obj = cur_macros[str];
	if (obj) {
		if (obj.n) str = obj.n;
		if (if_desk) out_cb(str+"<br><span style='color:green;'>&#10003;</span>");
		else out_cb(str + " \u2713");//10003 == \u2713
		accept_cb(obj);
	}
	else {
		let keys = getkeys(cur_macros);
		if (!keys.length || str.length > keys.maxlen()) {
			if (if_desk) out_cb(str+"<br><span style='color:red;'>&#10007;</span>");
			else out_cb(str + " \u2717");
			reject_cb();
		}
	}
}//»
}//»

//»
*/

/*

window.onunhandledrejection=function(e){
	setTimeout(()=>{
		dostack(e.reason.stack);
	},0);
};
window.onerror = function (msg, url, lineNo, columnNo, error) {
setTimeout(()=>{
    if (url && url.match(/^blob:/)){
        let which = blobs[url];
        let sty="background-color:#900;color:#aaa;font-size:1.25em;";
        if (which){
            which = which.replace(/\./g,"/");
            console.log(`%c In '${which}.js', line:${lineNo} col:${columnNo}`,sty);
            console.log("%c "+msg,sty);
        }   
    }   
},0);
console.error(error);
window.errorstack=()=>{dostack(error.stack);}
}
*/

//»


