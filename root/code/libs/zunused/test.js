//Imports«

let log = Core.log;
let cwarn = Core.cwarn;
let cerr = Core.cerr;
let _;
let globals = Core.globals;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let isstr = _.isstr;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let isnotnegint = function(arg){return _.isint(arg, true);}
let make = _.make;

let Desk = Core.Desk;

let fs = globals.fs;

let fsapi = Core.api.fs;

const{ENV,cbok,cberr,wout}=shell_exports;

//»

const coms = {//«

/*

const read_file = (fname, cb, opts)=>{


const exports = opts.exports||{};
_=exports;
const get_var_str = _.get_var_str||noop;
const kill_register = _.kill_register||noop;
const tmp_env = _.tmp_env||{};
const cur_dir = _.cwd||"/";
const werr = _.werr||Core.cerr;

const is_root = opts.is_root||false;
const EOF = opts.EOF || {EOF:true};

*/
drop:args=>{
    let blobs = ENV.BLOB_DROPS;
    if (!blobs) return cberr("No blobs");
    let s= args.shift();
    if (!s) return cberr("No arg given!");
    let n = s.pnni();
    if (!Number.isFinite(n)) return cberr("Bad num");
    let blob = blobs[n];
    if (!blob) return cberr("Nothing found");
    let name = blob.name;
    blob = blob.blob;
    let sz = blob.size;
    cbok(name+" "+sz);
},
drops:args=>{
    let blobs = ENV.BLOB_DROPS;
    if (!blobs) return cberr("No blobs");
    let it = 0;
    for (let blob of blobs) {
        let name = blob.name;
        blob = blob.blob;
        let sz = blob.size;
        wout(it+") "+name+" "+sz);
        it++;
    }
    cbok();
},
pretty:function(args){
let _ = this.exports;
let cbok=_.cbok;
let cberr=_.cberr;
if (!args.length) return cberr("No file");
let str='';
let doit=()=>{
if (!str.length) return cbok("");

fs.getmod("util.pretty",modret=>{
if (!modret) return cberr("No pretty");
let pretty = modret.getmod().js;
let rv = pretty(str);
_.wout(rv);
cbok();
},{STATIC:true});

};
fs.read_file(args[0],(rv, filearg, errarg)=>{
if (!rv){
if (filearg) return;
cwarn(errarg);
return;
}

if (isobj(rv)&&rv.EOF) return doit();;
if (isarr(rv)) str += rv.join("\n");
else {
cwarn("Unknown value returned from fs.read_file",rv);
}


}, {exports:_});

/*
*/
},

brumzz:function(args){//«

let _ = this.exports;
let cbok=_.cbok;
let cberr=_.cberr;
let path = args.shift();
if (!path) return cberr("No path arg!");

let fullpath = _.normpath(path);

let val;
if (!args.length) val="";
else val = args.join(" ");

(async ()=>{

let ret;
try {

ret = await fsapi.pathToNode(fullpath);
//ret = await fsapi.pathToNode(fullpath, {GETLINK: true});
if (ret.root.TYPE !== "fs") throw "Not an HTFS file!";
if (ret.APP) throw "Not a regular file (got '"+ret.APP+"')";
ret = await fsapi.writeHtml5File(fullpath, val, {APPEND: true});
//ret = await fsapi.readHTFSFile(fullpath);
}catch(e){return cberr(e);}


cbok("OK");

})();


},//»

/*
'doumath':function(args){//«
var _ = this.exports;
var cberr=_.cberr;
var cbok=_.cberr;
let wout = _.wout;
_.arg2con("/home/user/umath_linalg.c",ret=>{
//log(ret);
if (!ret) return cberr("!!!!!!!!!!");
let arr = ret.split("\n");
//log(arr);
let iter = 0;
let obj={};
//let dorep = false;
let marr;
let out = [];
//let started = false;
//let ended = false;
OUTERLOOP: for (let i=0; i < arr.length; i++){
	let ln = arr[i];
//	if (ln.match(/STARTREPEATS/)) {
//		started = true;
//cwarn("STARTED");
//	}
//	else if (ln.match(/ENDREPEATS/)) {
//		ended = true;
//cwarn("ENDED");
//	}

//	if (!started || ended) out.push(ln);
	if (ln.match(/^\/\*\*begin repeat/)) {
//		dorep = true;
		let donum;
		let k;
		for (let j = i+1;ln=arr[j];j++){
			if (ln.match(/\*\//)){
				for (let n = 0; n < donum; n++){
					for (k = j+1;;k++){
						ln = arr[k];
						if (ln.match(/\/\*\*end repeat/)) {
							break;
						}
						if (ln.match(/@(\w+)@/)){
							while (marr = ln.match(/@(\w+)@/)) {
								let which = marr[1];
								let rep = obj[which][n];
								ln = ln.replace(/@\w+@/, rep);
							}
							out.push(ln);
						}
						else out.push(ln);
					}
				}
				i=k+1;
				break;
			}
			marr = ln.match(/#(\w+)=(.+)#/);
			obj[marr[1]] = marr[2].split(",");
			donum = obj[marr[1]].length;
		}
	}
	else out.push(ln);
}
let outstr = out.join("\n");
//log(out);
wout(outstr);
cbok();
});


},//»
*/

'sysaddfile': function(args){//«
var _ = this.exports;
var cberr=_.cberr;
var cbok=_.cberr;

/*Other headers«
	mode: "cors", // no-cors, cors, *same-origin
	cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
	credentials: "same-origin", // include, same-origin, *omit
	headers: {
		"Content-Type": "application/json; charset=utf-8",
		// "Content-Type": "application/x-www-form-urlencoded",
	},
	redirect: "follow", // manual, *follow, error
	referrer: "no-referrer", // no-referrer, *client
»*/
let url = "_addsitefile?dir=ass&file=example.txt";

fetch(url, {
method: "POST", // *GET, POST, PUT, DELETE, etc.
body: "111222333", // body data type must match "Content-Type" header
})
.then(res => {
log(res);
return res.json()
})
.then(obj=>{
//log(obj);
if (obj.SUCC) cbok(obj.SUCC);
else if (obj.ERR) cberr(obj.ERR);
else cberr("No obj.SUCC or obj.ERR");
//cbok();
})
.catch(e=>{
log(e);
cberr("Unknown server error");
//if (e.ERR) cberr(e.ERR);
//else cberr("No e.ERR???");
});


},//»
'sysmkdir': function(args){//«
	var _ = this.exports;
	var cberr=_.cberr;
	var cbok=_.cberr;
	var dirname = args.shift();
	if (!dirname) return cberr("NODIR");
	let url = "_addsitedir?path="+dirname;
	fetch(url)
	.then(res => {
		return res.json()
	})
	.then(obj=>{
		if (obj.SUCC) cbok(obj.SUCC);
		else if (obj.ERR) cberr(obj.ERR);
		else cberr("No obj.SUCC or obj.ERR");
	})
	.catch(e=>{
log(e);
		cberr("Unknown server error");
	});
}//»

}//»

const coms_help={};

if (!com) return Object.keys(coms);
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in test!");
coms[com](args);
                 
