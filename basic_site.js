
//Imports«

const spawn = require('child_process').spawn;
const http = require('http');
const fs = require('fs');

//»

//Var«

let http_server;

//Default page«
const BASE_PAGE=`
<html><head>
<title>
LOTW - Main
</title>
<link rel="icon" href="/www/img/favicon.ico">
<style>
.background{
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: url('/www/img/lotw256.png') center center no-repeat;
	opacity: 0.33;
	z-index: -1;
}
</style>
</head>
<body>
<div class="background"></div>
<h2>Linux on the Web (LOTW)</h2>
<ul>
<li><h3><a href="/desk">The desktop environment</a></h3>
<li><h3><a href="/shell">The shell environment</a></h3>
<li><h3><a href="/www/about.html">About page</a></h3>
</ul>
</body>
</html>
`;

//»

//OS_HTML«
const OS_HTML=`
<html>
<head>
<title>
</title>
<meta name="description" content="This is an operating system that runs inside of most modern web browsers">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link href="/www/css/os.css" rel="stylesheet">
<link rel="icon" href="/www/img/favicon.ico">
</head>
<body style="overscroll-behavior-x: none;">
<div style="z-index:100000000;position:absolute;left:0;top:0;overflow:hidden;">
<table style="font-family:monospace;font-size:18;" id="initlog"></table>
</div>
<script src="/root/code/mods/sys/core.js" type="module"></script>
<a name="_"></a>
</body>
</html>
`;
//»

const OKAY_DIRS=["root","www"];
const log = (...args)=>{console.log(...args)}

const BASEPATH = process.env.LOTW_PWD || process.env.PWD;
let stats;

const BINPATH = `${BASEPATH}/root/bin`;
if (!(fs.statSync(`${BINPATH}/dummy.js`))) {
log(`Cannot stat: ${BINPATH}/dummy.js`);
	return;
}

const WWWPATH = `${BASEPATH}/www`;
const APPPATH = `${BASEPATH}/root/code/apps`;
const LIBPATH = `${BASEPATH}/root/code/libs`;

const DEFMIME = "application/octet-stream";
const ext_to_mime = {
	"js": "application/javascript",
	"json": "application/javascript",
	"html": "text/html",
	"txt": "text/plain",
	"synth": "text/plain",
	"sh": "text/plain",
	"gz": "application/gzip",
	"wav": "audio/wav",
	png:"image/png",
	wasm:"application/wasm"
};

let hostname = "0.0.0.0";
let use_port = process.env.LOTW_PORT;
let port = use_port||8080;

//»

//Util«

/*
const hard_spawn=(name, args, cb, send_json)=>{//«

//	spawn('sh', ['-c', 'unoconv -f pdf --stdout sample.doc | pdftotext -layout -enc UTF-8 - out.txt']);
//let arg_str = args
	let do_unescape = true;

	let com_args = args.join(" ");
	if (do_unescape) com_args = com_args.replace(/\\x27/g,"'").replace(/\\x22/g,'"');
	let com = spawn('sh', ['-c', name+" "+com_args]);
    var str = '';
    com.on('error', function() {
        cb(null);
    }); 
    com.stdout.on('data', function(dat) {
        str += dat.toString();
    });
    com.on('close', function() {
		if (send_json) {
			let arr = str.split("\n");
			if (!arr.length) arr=[" "];
			if (arr.length && arr[arr.length-1]==="")  arr.pop();
			cb(JSON.stringify(arr));
		}
		else cb(str);
    }); 
}//»
*/

const mime_from_path=(path, force_bin)=>{//«
	if (path.match(/\.jpg$/i)) return "image/jpeg"
	else if (path.match(/\.gif$/i)) return "image/gif"
	else if (path.match(/\.png$/i)) return "image/png"
	else if (path.match(/\.webp$/i)) return "image/webp"
	else if (force_bin) return "application/octet-stream";
	else return "text/plain"
}//»
const okay=(res, usemime)=>{//«
	header(res, 200, usemime);
}//»
const okaybin=(res)=>{//«
	header(res, 200, "application/octet-stream");
}//»
const nogo=(res, mess)=>{//«
	header(res, 404);
	if (!mess) mess = "NO";
	res.end(mess+"\n");
}//»
const header=(res, code, mimearg)=>{//«
	let usemime = "text/plain";
	if (mimearg) usemime = mimearg;
//	let o = {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"};
	let o = {'Content-Type': usemime};
	if (code == 200) res.writeHead(200, o);
	else res.writeHead(code, o);
}//»
const readdir=(path, opts={}, pattern)=>{//«

return new Promise(async(Y,N)=>{
let pathext="";
let regexp = null;

if (pattern){
if (pattern.match("\.")){
let arr = pattern.split(".");
let fname = arr.pop();
if (fname) regexp = new RegExp("^" + fname.replace(/\./g,"\\."));
path = `${path}/`+arr.join("/");
}
else regexp = new RegExp("^" + pattern.replace(/\./g,"\\."));
}
    let dir = fs.opendirSync(path);
    let ent = await dir.read();
	let arr = [];
    while(ent){
        let name = ent.name;
        if (opts.getDir || opts.getRaw || ent.name.match(/\.js$/)) {
            if (ent.isSymbolicLink()){
                try{
                    ent = fs.statSync(`${path}/${name}`);
                }catch(e){}
            }
            if (ent) {
				if (regexp && !regexp.test(name)) {
        			ent = await dir.read();
					continue;
				}
				if (ent.isFile()) {
					if (!name.match(/^\./)) {
						if (opts.getRaw) arr.push(name);
						else arr.push(name.replace(/\.js$/,""));
					}
				}
				else if (ent.isDirectory()){
					if (opts.getDir) arr.push(name);
				}
			}
        }   
        ent = await dir.read();
    }               
	Y(arr);
    dir.close();
});

};//»

//»

const handle_request=async(req, res, url, args)=>{//«
	let meth = req.method;
	let body, path, enc, pos;
	let marr;
	if (meth == "GET") {//«
		if (url=="/") {
			if (args.path){//«
				let decpath = decodeURIComponent(args.path);
				let usemime=null;
				marr = decpath.match(/\.([a-z0-9]+)$/);
				if (marr&&marr[1]) usemime = ext_to_mime[marr[1]];
				if (!usemime) usemime = "application/octet-stream";
				let localpath = WWWPATH+decpath;
				let str;
				let esc_path = "'"+localpath.replace(/\x27/g, "\\$&")+"'";
log("Getting: "+localpath);
				let stats = null;
				try {
					stats = fs.statSync(localpath)
				}	
				catch(e){
log(e);
				}
				if (!stats) return nogo(res, decpath+": not found");
				if (!stats.isFile()) {
					if (stats.isDirectory()) return nogo(res, decpath+": is a directory");
					return nogo(res, decpath+": is not a regular file");
				}
				let nBytes = stats.size
				if (arg_hash.getsize) {
					okay(res);
					res.end(nBytes+"");
				}
				return;
			}//»
			okay(res, "text/html");
			return res.end(BASE_PAGE);
		}
		if (url.match(/^\/(desk|shell|.+\.app)$/)) {
			okay(res, "text/html");
			return res.end(OS_HTML);
		}
		if (url.match(/^\/_/)){//«
			if (url == "/_getbin") {
				okay(res);
				res.end(JSON.stringify(await readdir(BINPATH)));
			}
			else if (url == "/_getapp") res.end(JSON.stringify(await readdir(APPPATH, {getDir:true, getRaw:true}, args.path)));
			else if (url == "/_getlib") res.end(JSON.stringify(await readdir(LIBPATH, {getDir:true, getRaw:true}, args.path)));
			else if (url=="/_getdir"){//«
				let path = decodeURIComponent(args.path);
				let comarg = "-Lp";
				if (args.all) comarg += "R";
				comarg += "gG";
				if (path && !path.match(/\.\./)) {
					if (path == "/") path = WWWPATH;
					else path = WWWPATH + "/" + path;
					hard_spawn("ls", [comarg, '--time-style=+%s' ,path], function(ret) {
						if (ret == null) nogo(res);
						else {
							okay(res);
							res.end(ret);
						}   
					}, true); 
					return;
				}   
				else nogo(res);
			}//»
			else if (url == "/_ip") {
				let rv = await fetch("https://ifconfig.me/ip");
				if (!(rv && rv.ok)) return nogo(res, "Could not get ip address");
				res.end(await rv.text());
			}
			else nogo(res, "Bad command");
			return;
		}//»
		let parts = url.split("/");
		parts.shift();
		let dir = parts.shift();
		if (!(dir&&OKAY_DIRS.includes(dir)))return nogo(res,"Not found");
		let dots = ".";
		let usemime;
		let useenc;
		let str;
		if (marr = url.match(/\.(js|html|json|txt|sh|mf|synth)$/)) {
			if (marr && marr[1]) usemime = ext_to_mime[marr[1]];
			try {
				str = fs.readFileSync(dots+decodeURIComponent(url), 'utf8');
			}
			catch(e) {
				str=null
			}
		}
		else {
			if (marr = url.match(/\.(wav|gz|png|wasm)$/)) usemime = ext_to_mime[marr[1]];
			try {
				str = fs.readFileSync(dots+decodeURIComponent(url));
			}
			catch(e) {
				str = null
			}
		}
		if (!str) {
			nogo(res, "404: File not found: " + url);
			return;
		}
		if (!usemime) usemime = DEFMIME;
		okay(res, usemime, useenc);
		res.end(str);
	}//»
	else if (meth == "POST") nogo(res);
	else nogo(res);
}//»

const app =(req,res)=>{//«
	let url_arr = req.url.split("?");
	let len = url_arr.length;
	if (len == 1 || len == 2) {
		let base = url_arr[0];
		let args = url_arr[1];
		let arg_hash = {};
		if (args) {
			let args_arr = args.split("&");
			let args_len = args_arr.lengtj;
			for (let arg of args_arr){
				let argi = arg.split("=");
				let key = argi[0];
				let val = argi[1];
				if (!val) val = false;
				arg_hash[key] = val;
			}
		}
		handle_request(req, res, base, arg_hash);
	}
	else nogo(res);
};//»

http_server = http.createServer(app).listen(port, hostname);
log(`Site server listening at http://${hostname}:${port}`);

