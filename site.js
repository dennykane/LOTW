/*Jan. 10, 2023: Just created users/ directory to store files that are named by the username
and have the password as the contents.

*/
//If starting with pm2 on a public server (to listen on port 80), do something like this:
// $ sudo LOTW_LIVE=1 pm2 site.js

//Use an LOTW_PORT env var to use a different address scheme than localhost:8080 
//or publicsite.com:80;

const REMOTE_COMS_OK = false;

//Imports«

const { execSync } = require("child_process");
const spawn = require('child_process').spawn;
const http = require('http');
const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
const IOServer = require("socket.io").Server;
let io;
let http_server;

//»

//Var«

const FS_CACHE = {};
const GZIP_CACHE = {};

//SSL/HTTPS«

/*Instructions«

I am using Debian 11 in Linode.

Followed the instructions at https://certbot.eff.org/instructions:

Install packages: apache2, snapd

$ sudo apt-get install apache2 snapd

$ sudo snap install core; sudo snap refresh core

Start the default apache2 server (if not already running):
$ sudo systemctl start apache2.service

$ sudo snap install --classic certbot

$ sudo ln -s /snap/bin/certbot /usr/bin/certbot

$ sudo certbot --apache

The paths below were found in the file:

/etc/apache2/sites-available/000-default-le-ssl.conf



To renew the cert:

1) Stop this server.

2) Start apache2:

$ sudo systemctl start apache2.service

3) Renew it:

$ sudo certbot renew

4) Stop apache server: 

$ sudo systemctl stop apache2.service

5) Start this server.

»*/

const SITE_NAME = "lotw.site";
const KEY_PATH =`/etc/letsencrypt/live/${SITE_NAME}/privkey.pem`;
const CERT_PATH =`/etc/letsencrypt/live/${SITE_NAME}/fullchain.pem`;

//»

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
<li><h3><a href="https://github.com/linuxontheweb/LOTW">Source code and documentation on Github</a></h3>
<li><h3><a href="https://gitter.im/linuxontheweb/community">Chat forum on Gitter</a></h3>
</ul>
</body>
</html>
`;
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

//»

//Blog HTML«

const BLOG_TOP=`

<html>
<head>
<title>
LOTW Blog
</title>
<style>
body{
	padding-top:15px;
	padding-bottom:15px;
	color: #ccc;
	background-color: #000;
}
.header{
	text-align:center;
}
h2{
	text-align:center;
}
.content{
	max-width:85ch;
	font-family:Arial;
	margin-left:auto;
	margin-right:auto;
	padding-bottom:10px;
//	text-align:justify;
}
a{
	color: #99f;
}
a:visited{
	color: #c9f;
}
</style>
<link rel="icon" href="/www/img/favicon.ico">
</head>

<body>
<div class="header">
<a href="/desk">Desktop</a> || 
<a href="/shell">Shell</a> ||
<a href="https://github.com/linuxontheweb/LOTW">Github</a> ||
<a href="https://gitter.im/linuxontheweb/community">Contact</a>
</div>


<div class="content">
<h1>LOTW Blog</h1>
<hr>
`;

const BLOG_BOT=`
<hr>
</div>
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

const OKAY_DIRS=["root","www",'blog'];
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

let hostname;
let use_port = process.env.LOTW_PORT;
let port = use_port||8080;
let is_live = false;
if (process.env.LOTW_LIVE){
	is_live = true;
	hostname="0.0.0.0";
	port = 443;
}
else{
//	hostname="localhost";
	hostname="0.0.0.0";
	port = use_port||8080;
}

//»

//Util«


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

const mime_from_path=(path, force_bin)=>{//«
	if (path.match(/\.jpg$/i)) return "image/jpeg"
	else if (path.match(/\.gif$/i)) return "image/gif"
	else if (path.match(/\.png$/i)) return "image/png"
	else if (path.match(/\.webp$/i)) return "image/webp"
	else if (force_bin) return "application/octet-stream";
	else return "text/plain"
}//»
const okay=(res, usemime, useenc)=>{//«
	header(res, 200, usemime, useenc);
}//»
const okaybin=(res)=>{//«
	header(res, 200, "application/octet-stream");
}//»
const nogo=(res, mess)=>{//«
	header(res, 404);
	if (!mess) mess = "NO";
	res.end(mess+"\n");
}//»
const header=(res, code, mimearg, encodingarg)=>{//«
	let usemime = "text/plain";
	if (mimearg) usemime = mimearg;
	let o = {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"};
	if (encodingarg) o['Content-Encoding'] = encodingarg;
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
//log(regexp);

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

const handle_io_conn=socket=>{

//io.on();
//log("!!!!!!!!!!!     SOCKET IN     !!!!!!!!!!!!!!");
//log(socket);
//socket.emit("msg", "hello from the server.");


};

const handle_request=async(req, res, url, args)=>{//«
	const err = (arg)=>{
let s = "Error";
if (arg) s+=`: ${arg}`;
		nogo(res, s);
	};
	"use strict";
	let meth = req.method;
	let body, path, enc, pos;
	let marr;
	let isblog = false;
//log(req);
	if (meth == "GET") {//«
		if (url=="/") {
			if (args.path){//«
				let decpath = decodeURIComponent(args.path);
				let usemime=null;
				marr = decpath.match(/\.([a-z0-9]+)$/);
				if (marr&&marr[1]) usemime = ext_to_mime[marr[1]];
				if (!usemime) usemime = "application/octet-stream";
				let localpath = WWWPATH+decpath;
	//			let localpath = LOCAL_PATH+arg_hash.path;
				let str;
	//			let esc_path = localpath.replace(/[ \x22\x27\x5b\x60#~{<>$|&!;()]/g, "\\$&");
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
			okay(res, "text/html");return res.end(BASE_PAGE);
		}
		if (url.match(/^\/(desk|shell|.+\.app)$/)) return res.end(OS_HTML);
		if (url.match(/^\/_/)){
			if (url == "/_getbin") {
				okay(res);
				res.end(JSON.stringify(await readdir(BINPATH)));
			}
			else if (url == "/_getapp") res.end(JSON.stringify(await readdir(APPPATH, {getDir:true, getRaw:true}, args.path)));
			else if (url == "/_getlib") res.end(JSON.stringify(await readdir(LIBPATH, {getDir:true, getRaw:true}, args.path)));
			else if (url=="/_getdir"){//«
				let path = decodeURIComponent(args.path);
//				let recur = args.all;
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
			else if (REMOTE_COMS_OK && url == "/_aru"){//Command: addremuser
				try{
					let arr = atob(args.q).split(" ");
					let name = arr[0];
					let pass = arr[1];
					if (!(name && pass)) return err(1);
					if (!name.match(/^[a-zA-Z][a-zA-Z0-9]+$/)) return err(4);
					if (name.length > 16) return err(5);
					if (pass.length < 4) return err(6);
					let fname = `../users/${name}`;
					if (fs.existsSync(fname)) return err(2);
					fs.writeFileSync(fname, pass);
					fs.mkdirSync(`../uploads/${name}`);
				}
				catch(e){
					return err(3);
				}
				res.end(`OK`);
			}

			else nogo(res, "Bad command");
			return;
		}
		let parts = url.split("/");
		parts.shift();
		let dir = parts.shift();
		if (!(dir&&OKAY_DIRS.includes(dir))) {
//			if ((req.headers.host.match(/^ilp\./)) || url=="/ilp"){
			if (url=="/ilp"){
				res.writeHead(302, {Location: `https://ilovephilosophy.com/viewtopic.php?f=2&t=198108`});
				res.end();
				return;
			}
			return nogo(res,"Not found");
		}
		let dots = ".";
		if (dir==="blog") {
			isblog = true;
			dots="..";
		}
//		let usemime = "application/octet-stream";
		let usemime;
		let useenc;
		let str;
//		if (marr = url.match(/\.(js|html|json|txt|sh|mf|synth)$/)) {
		if ((marr = url.match(/\.(js|html|json|txt|sh|mf|synth)$/)) || isblog) {

			if (marr && marr[1]) usemime = ext_to_mime[marr[1]];

			if (is_live && FS_CACHE[url]) str = FS_CACHE[url];
			else {
				try {
					if (isblog && !usemime) str = BLOG_TOP + execSync(`markdown ${dots+decodeURIComponent(url)}`) + BLOG_BOT;
					else str = fs.readFileSync(dots+decodeURIComponent(url), 'utf8');
					FS_CACHE[url] = str;
				}
				catch(e) {
					str=null
				}
			}
			if (str && is_live && req.headers['accept-encoding'].match(/\bgzip\b/)){
				if (GZIP_CACHE[url]){
					str = GZIP_CACHE[url];
				}
				else {
					str = zlib.gzipSync(str);
					GZIP_CACHE[url] = str;
				}
				useenc = "gzip";
			}
		}
		else {
			if (marr = url.match(/\.(wav|gz|png|wasm)$/)) usemime = ext_to_mime[marr[1]];
			if (is_live && FS_CACHE[url]) str = FS_CACHE[url];
			else {
				try {
					str = fs.readFileSync(dots+decodeURIComponent(url));
					FS_CACHE[url] = str;
				}
				catch(e) {
					str = null
				}
			}
		}
		if (!str) {
			nogo(res, "404: File not found: " + url);
			return;
		}
		if (!usemime) {
			if (isblog) usemime = ext_to_mime.html;
			else usemime = DEFMIME;
		}
		okay(res, usemime, useenc);
		res.end(str);
	}//»
	else if (meth == "POST") {
		if (REMOTE_COMS_OK && url == "/_sra"){//Command: setremapp«

let name;
let fname;
try{
	let arr = atob(args.q).split(" ");
	name = arr[0];
	let pass = arr[1];
	fname = arr[2];
	if (!(name && pass && fname)) return err(1);
	if (!fname.match(/^[a-zA-Z][a-zA-Z0-9]*\.js$/)) return err(6);
	if (fname.length > 16) return err(7);

	let rv = fs.readFileSync(`../users/${name}`, 'utf8');
	if (rv !== pass) return err(2);
}
catch(e){
	return err(3);
}

let body = [];
let bytes = 0;
let MAX_BYTES = 100000;
let did_abort = false;
const getdat = function(chunk){
	if (did_abort) return;
	bytes += chunk.length;
	if (bytes > MAX_BYTES) {
		did_abort = true;
		req.off('data', getdat);
		return err(5);
	}
	body.push(chunk);
};
req.on('data', getdat);
req.on('end', () => {
	if (did_abort) return;
	try{
		fs.writeFileSync(`../uploads/${name}/${fname}`, Buffer.concat(body));
		res.end('OK');
	}
	catch(e){
		err(4);
	}
});

		}//»
		else nogo(res);
	}
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
			for (let i=0; i < args_arr.length; i++) {
				let argi = args_arr[i].split("=");
				let key = argi[0];
				let val = argi[1];
				if (!val) val = false;
				arg_hash[key] = val;
			}
		}
		handle_request(req, res, base, arg_hash);
	}
	else {
		nogo(res);
	}
};//»

if (process.env.LOTW_LIVE) {//«

	http_server = https.createServer({
		key: fs.readFileSync(KEY_PATH),
		cert: fs.readFileSync(CERT_PATH)
	}, app).listen(443, hostname)

	http.createServer(app).listen(80, hostname)
	log(`Site server listening at https://${hostname}:443`);
	log(`Site server listening at http://${hostname}:80`);

}
else {

	http_server = http.createServer(app).listen(port, hostname);
	log(`Site server listening at http://${hostname}:${port}`);

}//»

io = new IOServer(http_server);
io.on('connection', handle_io_conn);
//init_io();

//log(io_server);

/*
	if (url=="/") {//«
		else {
			okay(res);
			res.end("HI");
		}
	}//»
	else if (url=="/_getdirobj"){//«
		let path = decodeURIComponent(arg_hash.path);
		if (path && !path.match(/\.\./)) {
			if (path == "/") path = LOCAL_PATH;
			else path = LOCAL_PATH + "/" + path;
			let ret = allFilesSync(path);
			okay(res,"application/javascript");
			res.end(JSON.stringify(ret));
		}   
		else nogo(res);
	}//»
	else if (url=="/_getfilehash"){//«
		let path = decodeURIComponent(arg_hash.path);
		let ret;
		try {
			ret = fs.readFileSync(LOCAL_PATH+"/"+path);
		}
		catch(e){
			nogo(res, "Trying to read directory?");
			return;
		}
		let shasum = crypto.createHash('sha1');
		shasum.update(ret);
		let hexsum = shasum.digest('hex');
		okay(res);
		res.end(hexsum);
	}//»
*/


