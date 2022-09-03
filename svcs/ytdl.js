
//Imports«

const http = require('http');
const spawn = require('child_process').spawn;
const WebSocketServer = require('ws').WebSocketServer;
const fs = require('fs');
const path = require('path');
const os = require('os');

//»

//Var«

const SERVICE_NAME = "ytdl";
const hostname = "localhost";

let portnum = 20003;

//»

//Args«

try{
	let arg2 = process.argv[2];
	if (arg2){
		portnum = parseInt(arg2);
		if (isNaN(portnum)||portnum>65535) throw "Invalid port argument: " + arg2;
		else if (portnum < 1025) throw "Unsafe port argument: " + arg2;
	}
	if (process.argv[3]) throw "Too many arguments";
}
catch(e){
	console.log(e);
	return;
}

//»

//Funcs«

const log = (...args)=>{console.log(...args);}

const header=(res, code, mimearg)=>{//«
    let usemime = "text/plain";
    if (mimearg) usemime = mimearg;
    if (code == 200) {
        res.writeHead(200, {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"});
    }
    else res.writeHead(code, {'Content-Type': usemime, 'Access-Control-Allow-Origin': "*"});
}//»
const nogo=(res, mess)=>{//«
	header(res, 404);
	if (!mess) mess = "NO";
	res.end(mess+"\n");
}//»
const okay=(res, usemime)=>{//«
    header(res, 200, usemime);
}//»

//»

const handle_request=(req,res)=>{//«

let meth = req.method;
let body, path, enc, pos;
let marr;
let url_arr = req.url.split("?");
let len = url_arr.length;
//if (len==0||len>2) return nogo(res);
let url = url_arr[0];
let args = url_arr[1];
let arg_hash={};
if (args) {//«
	let args_arr = args.split("&");
	for (let i=0; i < args_arr.length; i++) {
		let argi = args_arr[i].split("=");
		let key = argi[0];
		let val = argi[1];
		if (!val) val = false;
		arg_hash[key] = val;
	}
}//»
if (meth=="GET"){
	if (url=="/") {//«
		okay(res);
		res.end(SERVICE_NAME);
	}//»
	else nogo(res);
}
else if (meth=="POST") nogo(res);
else nogo(res);

}//»

const init=()=>{

const server = http.createServer(handle_request).listen(portnum, hostname);

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {

let tmpdir;
let ac;

ws.on('message', function message(data) {

let mess = data.toString();
//console.log('received: %s', data);
//log(mess);
let marr;
if (marr = mess.match(/^VID:([-_a-zA-Z0-9]+)$/)){
let vidid = marr[1];
log(`Get vid: '${marr[1]}'`);

fs.mkdtemp(path.join(os.tmpdir(), 'ytdl-'), (err, directory) => {

if (err) {
	log("Could not create temporary directory... aborting!");
	process.exit();
	return;
}
tmpdir = directory;
//log(`Created directory: ${directory}`);
let template = `${directory}/%(title)s.%(ext)s`;
//log(template);
/*
youtube-dl -f 140 -i --restrict-filenames -o "%(playlist_index)s-%(title)s.%(ext)s" $1;
*/

{//«

ac = new AbortController();
let { signal } = ac;
//let com = spawn('youtube-dl', ["-f","140","--restrict--filenames", "-o", `'${template}'`, {signal}]);

//let com = spawn('youtube-dl', ["-f","249-0","--restrict--filenames", "-o", `'${template}'`, vidid], {signal});

//let com = spawn('youtube-dl', ["-f","249-0","--restrict--filenames"], {signal});
//let com = spawn('youtube-dl', ["-f","249-0","--restrict--filenames"], {signal});
//let com = spawn('youtube-dl', ["-f","249-0","--restrict--filenames", "-o", `'${template}'`], {signal});

let com = spawn('youtube-dl', ["-f", "140", "--restrict-filenames" , "--newline", "-o", template ,vidid], {signal});
let path;
let part_path;
let cur_off = 0;
let fd;
const read=path=>{
	let stats = fs.statSync(path);
	if (!fd) fd = fs.openSync(path);
	let sz = stats.size - cur_off;
	if (sz < 1) return;
//log("SZ", sz);
	let buf = Buffer.alloc(sz);
	fs.readSync(fd, buf, 0, sz, cur_off)
	cur_off = stats.size;
log(`Read: ${path} ${sz}`);
	ws.send(buf);
};
com.stdout.on('data',dat=>{

let str = dat.toString();
let marr;
if (str.match(/^\[download\]/)) {

ws.send(JSON.stringify({out: str}));
if (marr = str.match(/Destination: (\/tmp\/.+)\n?$/)) {
	path = marr[1];
	part_path = `${path}.part`;
	ws.send(JSON.stringify({name: path.split("/").pop()}));
}
else{
	try {
		read(part_path);
		return;
	}
	catch(e){
		log("Caught", e);
	}
	try{
		read(path);
		return;
	}
	catch(e){
		log("Caught", e);
	}
}


}
ws.send(JSON.stringify({out: str}));
});
com.stderr.on('data', (dat) => {
	ws.send(JSON.stringify({err: dat.toString()}));
});
com.on('error',(e)=>{
//	log("Not found... aborting!");
//	process.exit();
	log("SPAWN ERROR!?!?!");
	log(e);
});
com.on('close',(code)=>{
	log(`Closed with code: ${code}`);
	try{
		read(path);
	}
	catch(e){
		log("Caught", e);
	}
});
com.on('exit',(code)=>{
	log(`Exited`);
	ws.send(JSON.stringify({done: true}));
});

}//»

});

}

else if (mess==="Abort"){
log(mess);
	if (ac) ac.abort();
}
else{
	log("???",mess);
}

});
//ws.send('something');

});

log(`${SERVICE_NAME} service listening at wss://${hostname}:${portnum}`);

}

if (process.env.LOTW_TEST) init();
else {
	let com = spawn('youtube-dl', ["--version"]);
	log("Checking for 'youtube-dl --version'...");
	com.stdout.on('data',dat=>{
		log("OK: "+dat.toString().replace(/\n$/,""));
		init();
	});
	com.stdout.on('error',e=>{
		log("Error",e);
	});
	com.on('error',(e)=>{
		log("Not found... aborting!");
		process.exit();
	});
}

