
//Imports«
//var Desk = Core.Desk;
const{api:capi,NS,log,cwarn,cerr,xgetobj,globals}=Core;
const{mods}=NS;
const{util}=globals;
const {mixer, ctx}=globals.audio;

const fs = NS.api.fs;
const {//«
	failopts,
	normpath,
	cberr,
	cbok,
	werr,
	wout
} = shell_exports;//»

//const NUM = Number.isFinite;
//const INT=n=>{return((NUM(n)&&(n+"").match(/^-?[0-9]+$/)));};
//const POSINT=n=>{return((NUM(n)&&n>0&&(n+"").match(/^[0-9]+$/)));};
//const NONNEGINT=n=>{return((NUM(n)&&n>=0&&(n+"").match(/^[0-9]+$/)));};
const NONNEGINT=n=>{return((n+"").match(/^[0-9]+$/));};

//log(fs);

//»

const coms = {

tone:async()=>{
if (!mods["av.tone"]) {
if (!await capi.loadMod("av.tone")) return cberr("No Tone.js!");
}
let tone = globals.tone;
if (!tone) {
	tone = (new mods["av.tone"]()).Tone;
	globals.tone = tone;
}
wout(`Tone.js v${tone.version}`);
cbok();
},

synth:async function(){//«

let opts = failopts(args,{SHORT:{k:3, n:3},LONG:{name:3}});
if (!opts) return;

if (opts.k){
	let useid = opts.k;
	if (NONNEGINT(useid)) useid = `synth${useid}`;
//	let rv = globals.fs.stop_service(`synth${opts.k}`, true);
	let rv = globals.fs.stop_service(useid, true);
	if (rv===true) return cbok();
	cberr(rv);	
	return;
}

let path = args.shift();
if (!path) return cberr("Need a path arg!");

let fullpath = normpath(path);
let file = await fs.readFile(fullpath);
if (!file) return cberr(`File not found: ${fullpath}`);

if (!(file instanceof Array && file.length && typeof(file[0])=='string')) return cberr(`Invalid file: ${fullpath}`);

let serv;
try{
	serv = await globals.fs.start_service('synth',opts.name||opts.n);
}
catch(e){
	return cberr(e);
}

serv._top = serv;
serv.errout = werr;
wout(`Starting: ${serv.id}`);
wout(`Parsing: ${fullpath}`);
let rv = await serv.parse(file.join("\n"));
if (!rv) {
	globals.fs.stop_service(serv.id);
	return cberr(`Parse failed (stopped ${serv.id})`);
}
cbok();

},//»

audec: async function(){//«

let path = args.shift();
if (!path) return cberr("Need a filename!");

let bytes = await fs.readFile(normpath(path),{BLOB:true});
if (!bytes) return cberr("File not found: "+path);
let buf = await ctx.decodeAudioData(await Core.api.toBuf(bytes));
if (!buf) return cberr("Invalid file");
wout(`Channels: ${buf.numberOfChannels}`);
wout(`Duration: ${buf.duration} seconds`);
wout(`Rate: ${buf.sampleRate}`);
wout(`Length: ${buf.length}`);

let nchans = buf.numberOfChannels;

for (let chan = 0; chan < nchans; chan++) {
// Float32Array  
let dat = buf.getChannelData(chan);
cwarn("Channel: ", chan);
log(dat);

/*
  let nowBuffering = myArrayBuffer.getChannelData(channel);
  for (let i = 0; i < myArrayBuffer.length; i++) {
    // Math.random() is in [0; 1.0]
    // audio needs to be in [-1.0; 1.0]
    nowBuffering[i] = Math.random() * 2 - 1;
  }
*/


}

//log(ret);

cbok();
}//»

}

const coms_help={
	synth:`Command line interface into the synth service`,
}

if (!com) return Object.keys(coms);
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in synth!");
if (args===true) return coms[com];
coms[com](args);



/*
//«
let _;
let getkeys = Core.api.getKeys;
_=Core;
let log = _.log;
let cwarn = _.cwarn;
let cerr = _.cerr;
let xget = _.xget;

let globals = _.globals;
let audio_ctx = globals.audio.ctx;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let isint = _.isint;
let isstr = _.isstr;
let isnull = _.isnull;
//let iseof = _.iseof;
let make = _.make;
let iseof=Core.api.isEOF;
let fs = globals.fs;

let fs_url = Core.fs_url;

//»

const {//«
	wclerr,
	normpath,
	arg2con,
	get_reader,
	refresh,
	respbr,
	woutobj,
	read_stdin,
	cberr,
	failopts,
	cbok,
	termobj,
	werr,
	wout,
	ptw,
	read_file_args_or_stdin
} = shell_exports;//»


'synth':function() {//«

//	var pause_on_init = false;
	var sws = failopts(args,{SHORT:{p:1,d:1,a:1,n:3},LONG:{detach:1,attach:1,pause:1}});
	if (!sws) return;
	let usename = sws.n;
	var detach = sws.detach||sws.d;
	var attach = sws.attach||sws.a;

	var pause_on_init = sws.pause||sws.p;
	if (attach&&detach) return cberr("Cannot attach and detach");
	var isowner = false;
	var fname = args.shift();

	function doloop(servobj) {//«
		termobj.ENV['?']=0;
		termobj.init_app_mode("synth", 
			ret=>{//«
				if (servobj.killed) {
					termobj.app_line_out("Killed");
					return termobj.end_app_mode();
				}
				var gotcom = ret.trim();
				if (!gotcom) return termobj.response_end();
				servobj.exports.parse(gotcom, (ret2, err)=>{

					if (err) {
						termobj.ENV['?']=1;
						termobj.app_line_out(null, err);
					}
					else {
						termobj.ENV['?']=0;
						termobj.app_line_out(ret2);
					}
					termobj.response_end();
				});
			},//» 
			_=>{//«
				if (isowner) {
cwarn("Stopping: " + servobj.id);
					fs.stop_service(servobj.id, (ret,err)=>{
						if (ret) return cbok();
						else cberr(err);
					});
				}
				else cbok();
			}//»
		)
	}//»

	function dostart(cb) {//«
		fs.start_service("synth", function(obj) {
			if (!obj) return cberr("Could not get synth service!");
			isowner = true;
			obj.init();
			cb(obj);
 			if (!pause_on_init) setTimeout(function(){obj.toggle_paused()},100);
		}, usename);
	}//»

	if (!fname) return dostart(_=>{doloop(_)});

	ptw(fname, function(ret) {//«
		if (!ret) return cberr("Not a file or directory: " + fname);
		var path = fs.objpath(ret);

		if (ret.root.TYPE=="service") {//«
			if (ret._&&ret._.exports&&ret._.exports.parse) {
				if (attach) {
					if (!ret._.detached) return cberr("Attach requested, but the service object is not detached");
					else isowner = true;
				}
				doloop(ret._);
			}
			else cberr("Invalid service path: " + fname);
		}//»
		else {//«
			arg2con(path, function(textret) {
				if (isstr(textret)) {
					dostart(obj=>{
						obj.exports.parse(textret, function(ret2, err) {
							if (err) {
								fs.stop_service(obj.id);
								return _.cberr(err);
							}
							if (detach) {
								obj.detached = true;
								cbok();
								return;
							}
							doloop(obj);
						}, true);
					});
				}
				else {
					cberr("no file contents: " + fname);
				}
			});
		}//»

	});//»

},//»

*/


