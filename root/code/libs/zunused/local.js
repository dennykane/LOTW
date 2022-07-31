
/*«

1) Initialize a job with:

arg = {
	id: sequence_id,
	assets: [num1, num2] //list of bytes sizes
}

2) Send assets, one at a time

»*/

//Imports«

var Desk = Core.Desk;
var log = Core.log;
var cwarn = Core.cwarn;
var cerr = Core.cerr;

var globals = Core.globals;
var util = globals.util;
var fs = globals.fs;
//»

//Var«

var MAX_BYTES_FOR_CONSOLE = 1048576;
var TOOBIG_MESS = "DevTools appears to be open MAX_BYTES_FOR_CONSOLE == " + MAX_BYTES_FOR_CONSOLE;

var ws;
var ws_url=Core.loc_url(null,true);
var opened=false;
var jobs=[];
var job_id=0;
//»

function Job(id, _){//«
//«
var cb_obj={}
var done = false;
var ok = (str)=>{
	if (done) return;
	done=true;
	_.cbok(str);
}
var err = (str)=>{
	if (done) return;
	done=true;
	_.cberr(str);
};
var wout = (str)=>{
	if (done) return;
	_.wout(str);
}
var werr = (str)=>{
	if (done) return;
	_.werr(str);
}
//»
function send_kill(){
	var view = new Response(8, 0x4b494c4c);//KILL
	ws.send(view.buffer);
}
function Response(size, value){//«
    let buf = new ArrayBuffer(size);
    let view = new DataView(buf);
    view.setUint32(0, id);
    view.setUint32(4, value);
    return view;
}//»
function stdin(ch){//«
	var view = new Response(9, 0x4348494e);//CHIN
	view.setUint8(8, ch.charCodeAt());
	ws.send(view.buffer);
}//»
this.init=(lenarr, namearr, cb)=>{//«
	var view;
	if (!lenarr){
		view = new Response(9, 0x494e4954);//INIT
		cb_obj["TINI:0"]=cb;
		ws.send(view.buffer);
		return;
	}
	var namelen = 0;
	for (let n of namearr) namelen+=2+n.length;
	var totlen;
	view = new Response(8+(4*lenarr.length)+namelen, 0x494e4954);//INIT
	view.setUint8(8, lenarr.length);
	var i = 9;

	for (let num of lenarr){
		view.setUint32(i, num);
		i+=4;
	}
	for (let name of namearr){
		for (let ch of name) {
			view.setUint8(i, ch.charCodeAt());
			i++;
		}
		view.setUint8(i, 0);
		i++;
	}
	cb_obj["TINI:"+lenarr.length]=cb;
	ws.send(view.buffer);
}//»
this.sendfile=(dat,num,cb)=>{//«
	var view = new Response(9+(dat.length), 0x46494c45);//FILE
	view.setUint8(8, num);
	(new Uint8Array(view.buffer)).set(dat, 9);
	cb_obj["ELIF:"+num+":"+dat.length]=cb;
	ws.send(view.buffer);
}//»
this.process=(com, comargs, outext, cb)=>{//«
	var arglen = 0;

	for (let arg of comargs){
		arglen += arg.length+1;
	}
	var totlen = 8+(2+com.length+arglen);
	if (outext) totlen += 1+outext.length;
//	var view = new Response(8+(3+com.length+arglen+outext.length), 0x80827967);//PROC
	var view = new Response(totlen, 0x80827967);//PROC
	var i=8;
	for (let ch of com){view.setUint8(i++, ch.charCodeAt());}
	view.setUint8(i++, 0);
//	i++;
	for (let arg of comargs){
		for (let ch of arg){view.setUint8(i++, ch.charCodeAt());}
		view.setUint8(i++, 0);
	}
	view.setUint8(i++, 0);
	if (outext) {
		for (let ch of outext){view.setUint8(i++, ch.charCodeAt());}
		view.setUint8(i, 0);
	}
	cb_obj["CORP"]=cb;
	_.term.getch_loop((ch, if_enter)=>{
		if (if_enter) ch="\n";
//		if (ch)
		if (ch) {
			_.wappout(ch);
			stdin(ch);
		}
	});
	ws.send(view.buffer);
}//»
this.reply=(resp,dat)=>{//«
	if (resp===0x54494e49){//INIT->TINI
		let num = dat.getUint32(0);
		let cb_str = "TINI:"+num;
		let cb = cb_obj[cb_str]
		if (!cb) return err("No cb: '"+cb_str+"'");
		cb();
		cb_obj[cb_str]=null;
	}
	else if (resp===0x454c4946){//FILE->ELIF
		let num = dat.getUint8(0);
		let len = dat.getUint32(1);
		let cb_str = "ELIF:"+num+":"+len;
		let cb = cb_obj[cb_str];
		if (!cb) return err("No cb: '" + cb_str+"'");
		cb();
		cb_obj[cb_str]=null;
	}
	else if (resp===0x67798280){//PROC->CORP
		let cb_str = "CORP";
		let cb = cb_obj[cb_str];
		if (!cb) return err("No cb: '" + cb_str+"'");
//		wout("Processing done!");
//		var arr = ;
		cb(new Uint8Array(dat.buffer.slice(8)));
		cb_obj[cb_str]=null;
	}
	else if (resp===0x45525220){//"ERR "
		let errstr = "";
		for (let i=0; i < dat.byteLength; i++){
			errstr+=String.fromCharCode(dat.getUint8(i));
		}
		err(errstr);
		send_kill();
	}
	else if (resp===0x53455252){//"SERR"
		let str = "";
		for (let i=0; i < dat.byteLength; i++) str+=String.fromCharCode(dat.getUint8(i));
		if (str.length > 1) str = str.replace(/^\n/,"");
		werr(str);
	}
	else if (resp===0x534f5554){//"SOUT"
		let str = "";
		for (let i=0; i < dat.byteLength; i++) str+=String.fromCharCode(dat.getUint8(i));
		if (str.length > 1) str = str.replace(/^\n/,"");
		wout(str);
	}
	else {
		err("Bad reply: 0x"+resp.toString(16));
	}
}//»
this.kill=(if_signal)=>{//«
	_.term.getch_loop(null);
	done = if_signal;
	send_kill();
}//»
this.done = ok;
this.out = wout;
}//»

//Funcs«
function toobig(bytes){
	if ((bytes > MAX_BYTES_FOR_CONSOLE) && ((window.outerHeight - window.innerHeight) > 0)) return true;
	return false;
}
//»

//WebSockets«

ws = new WebSocket(ws_url); 
ws.binaryType="arraybuffer";
//log("TYPE: "+ws.binaryType);

ws.onmessage=function(e){//«
	var buf = e.data;
	if (buf instanceof ArrayBuffer) {
//		util.blob_as_buf(dat,buf=>{
		var len = buf.byteLength
		if (len < 8) return cwarn("Response size: " + len);
		var view = new DataView(buf);
		var id = view.getUint32(0);
		var job = jobs[id];
		if (!job){
			cwarn("No job: " + id);
			return;
		}
		job.reply(view.getUint32(4), new DataView(buf, 8));
//		});
	}
	else cwarn("Not an ArrayBuffer!", buf);

}//»
ws.onerror=(e)=>{
	opened = false;
	cerr(e);
}
ws.onclose=function(){
	opened = false;
	cwarn("WSCLOSED")
} 
ws.onopen=function(){
	opened = true;
	cwarn("WSOPEN")
}

//»

this.exports = {//«

'localread': function(args) {//«
/*
Maybe: put getch_loop inside of the job during processing.
Then, nullify it during job.kill
*/
	var _ = this._;
	var id = job_id++;
	var job = new Job(id, _);
	jobs[id] = job;
	_.term.kill_register(()=>{
		job.kill(true);
		_.cbok("Killed!");
	});
	job.init(null,null,()=>{
		job.process("doreadit", [], null, ()=>{
			_.cbok();
			job.kill();
		});
	});
},//»
'ffmpeg': function(args) {//«
/*«

extensions:

ogg
webm
wav
m4a
mp4
mp3
aac
flv

»*/
/*«
	var in_ext = 
	[
		"mp4",
		"flv"
	]
	var out_ext = [
		"mp3",
		"aac",
		"ogg",
		"webm",
		"wav",
		"m4a"
	];
»*/
	var _ = this._;
	var cberr = _.cberr;
	var cbok = _.cbok;
	var wout = _.wout;
	if (!opened) return cberr("WebSocket not connected");
	args.unshift("-hide_banner");
	var infiles = [];
	var names = [];
	var id = job_id++;
	var iter = 0;
	for (let i=0; args[i]; i++){
		if (args[i]==="-i"){
			let path = 	_.normpath(args[i+1]);
			infiles.push(path);
			let usename = ""+(iter++);
			args[i+1] = usename;
			names.push(usename);
			i++;
		}
	}
	var topath = args.pop();
	if (!(infiles.length&&topath)) return cberr("Missing args: need input and output");
	var tofullpath = _.normpath(topath);
	var toparts = Core.api.pathParts(tofullpath);
	var toparpath = toparts[0];
	var toname = toparts[1];
	var toext = toparts[2];
	if (!toext) return cberr("Missing output extension");

	function doit(){//«
		wout("Fetching " + infiles.length + " files...");
		fs.paths_to_data(infiles, (ret,err)=>{
			if (!ret) return cberr(err);
			var lens=[];
			var totbytes = 0;
			for (let arr of ret){
				totbytes+=arr.length;
				lens.push(arr.length);
			}
//			if ((totbytes > MAX_BYTES_FOR_CONSOLE) && ((window.outerHeight - window.innerHeight) > 0)) {
			if (toobig(totbytes)) return cberr(TOOBIG_MESS);

			var job = new Job(id, _);
			jobs[id] = job;
			var start = performance.now();
			wout("Start init...");
			job.init(lens,names,()=>{
				let iter=-1;
				function process(){//«

//«
//					var com = "ffmpeg";
//					var comargs = "-i /dev/shm/.LOTW/"+names[0];
//					var comargs = "-i /dev/shm/.LOTW/"+names[0] + " -vn";
//					var comargs;
//					let num = names.length;
//					for (let n of names) {
//						if (!comargs) comargs = "-i /dev/shm/.LOTW/"+n;
//						else comargs += " -i /dev/shm/.LOTW/"+n;
//					}
//$ ffmpeg -i OHIn.wav -i OHOut.wav -filter_complex \
//  '[0:0] [1:0] concat=n=2:v=0:a=1 [a]' -map '[a]' output.wav

/*
For video files that we want to extract the audio from, we might have to represent it 
like [n:a:0], rather than [n:0]
*/
//					if (num>1){
//						comargs+=' -filter_complex "[0:a:0]';
//						comargs+=' -filter_complex "[0:0]';
//						for (let i=1; i < num; i++) comargs += ' ['+i+':a:0]';
//						for (let i=1; i < num; i++) comargs += ' ['+i+':0]';
//						comargs += ' concat=n='+num+':a=1 [a]" -map "[a]"'
//						comargs += ' concat=n='+num+':v=0:a=1 [a]" -map "[a]"'
//					}

//					comargs += " -vn";
//log(comargs);
//					var outfile = "/dev/shm/.LOTW/job_"+id+"_output.mp3";
//					var outfile = "/dev/shm/.LOTW/job_"+id+"_output."+toext;
//»

					_.term.kill_register(()=>{
						job.kill(true);
						cbok("Killed!");
					});
					job.process("ffmpeg", args, toext, retarr=>{
						fs.savefile(tofullpath, retarr,(ret,err)=>{
							if (!ret) return cberr(err);
							cbok();
						});
						job.kill();
					});
				}//»
				function send(){//«
					iter++;
					if (iter==ret.length) {
/*«

Saved files to /dev/shm as:
job_m_file_n.ext

Now just need to 
1) process with a command line, while getting stdout/stderr along the way

Construct the command line:
ffmpeg -i /dev/shm/audiofile.webm -i /dev/shm/videofile.webm -c:v copy /dev/shm/output.mp4

2) retrieve output file

3) kill

»*/
						let num_secs = (performance.now()-start)/1000;
						let Mbps = ((totbytes/num_secs)/(1024*1024)).toFixed(3);
						wout("File transfer(s) done in: " + num_secs.toFixed(1) + "s  ("+Mbps+"MB/s)");
						process();
						return 
					}
					let dat = ret[iter];
					wout("Sending File: " + iter + " ("+dat.byteLength+")");
					job.sendfile(dat, iter, send);
				}//»
				send();
			});
		});
	}//»
	fs.ptw(toparpath,parobj=>{
		if (!(parobj&&parobj.KIDS)) return cberr("Invalid path: "+topath);
		if (parobj.KIDS[toname]) return cberr("The file exists: " + topath);
		doit();
	});
},//»
'ffprobe': function(args) {//«
	var _ = this._;
	var cberr = _.cberr;
	var cbok = _.cbok;
	var wout = _.wout;
	var topath = args.pop();
	if (!topath) return cberr("Path needed!");
	args.unshift("-hide_banner");
	topath=_.normpath(topath);
	fs.getbin(topath,ret=>{
		if (!ret) return cberr("No contents: " + topath);
		var totbytes = ret.length;
		if (toobig(totbytes)) return cberr(TOOBIG_MESS);
		var id = job_id++;
		var job = new Job(id, _);
		jobs[id] = job;
		job.init([totbytes],["0"],()=>{
			var start = performance.now();
			wout("Sending File: 0 ("+ret.length+")");
			job.sendfile(ret, 0, ()=>{
				let num_secs = (performance.now()-start)/1000;
				let Mbps = ((totbytes/num_secs)/(1024*1024)).toFixed(3);
				wout("File transfer done in: " + num_secs.toFixed(1) + "s  ("+Mbps+"MB/s)");
				_.term.kill_register(()=>{
					job.kill(true);
					cbok("Killed!");
				});
				args.push("/dev/shm/.LOTW/"+id+"_input_0");
				job.process("ffprobe", args, null, retarr=>{
					cbok();
					job.kill();
				});
			});
		});
	});
}//»

}//»



