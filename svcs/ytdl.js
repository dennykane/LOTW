
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

const COMMANDS = ["yt-dlp", "youtube-dl"];
let COMMAND;

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

const init=()=>{//«

const server = http.createServer(handle_request).listen(portnum, hostname);

const wss = new WebSocketServer({ server });
wss.on('connection', function connection(ws) {
let tmpdir;
let ac;
let file_path;
ws.on('message', function message(data) {//«

let mess = data.toString();
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
let template = `${directory}/%(title)s.%(ext)s`;
{//«

ac = new AbortController();
let { signal } = ac;

/*//«

https://gist.github.com/AgentOak/34d47c65b1d28829bb17c24c04a0096f

GEPOUBD 

Different combinations of specifying the preference order of the 6 major audio formats//«

Order by quality, then container

highest to lowest, MP4 first
youtube-dl -f 141/251/140/250/139/249

highest to lowest, WebM first
youtube-dl -f 251/141/250/140/249/139

lowest to highest, MP4 first
youtube-dl -f 139/249/140/250/141/251

lowest to highest, WebM first
youtube-dl -f  249/139/250/140/251/141


Order by container, then quality

MP4 then WebM, highest to lowest
141/140/139/251/250/249

WebM then MP4, highest to lowest
251/250/249/141/140/139

MP4 then WebM, lowest to highest
139/140/141/249/250/251

WebM then MP4, lowest to highest
249/250/251/139/140/141
//»

DASH Audio Formats//«
Code	Container	Audio Codec		Audio Bitrate		Channels			Still offered?

139		MP4			AAC (HE v1)		48 Kbps				Stereo (2)			Rarely, YT Music
140		MP4			AAC (LC)		128 Kbps			Stereo (2)			Yes, YT Music
(141)	MP4			AAC (LC)		256 Kbps			Stereo (2)			No, YT Music*

249		WebM		Opus			(VBR) ~50 Kbps		Stereo (2)			Yes
250		WebM		Opus			(VBR) ~70 Kbps		Stereo (2)			Yes
251		WebM		Opus			(VBR) <=160 Kbps	Stereo (2)			Yes

256		MP4			AAC (HE v1)		192 Kbps			Surround (5.1)		Rarely
258		MP4			AAC (LC)		384 Kbps			Surround (5.1)		Rarely
327		MP4			AAC (LC)		256 Kbps			Surround (5.1)		?*
338		WebM		Opus			(VBR) ~480 Kbps (?)	Quadraphonic (4)	?*
//»

DASH Video formats//«
Resolution	AV1 HFR High	AV1 HFR		AV1		VP9.2 HDR HFR	VP9 HFR		VP9		H.264 HFR	H.264
			MP4				MP4			MP4		WebM			WebM		WebM	MP4			MP4
4320p						402/571								272								138
2160p		701				401					337				315			(313)	(305)		(266)
1440p		700				400					336				308			(271)	(304)		(264)
1080p		699				399					335				303			(248)	299			(137)
720p		698				398					334				302			247		298			136
480p		697							397		333							244					135
360p		696							396		332							243					134
240p		695							395		331							242					133
144p		694							394		330							278					160
//»

//»*/

//Highest to lowest, MP4 first: 141/251/140/250/139/249
//Highest to lowest, WebM first: 251/141/250/140/249/139

let com = spawn(COMMAND, ["-f", "141/251/140/250/139/249", "--restrict-filenames" , "--newline", "-o", template ,vidid], {signal});
let path;
let part_path;
let cur_off = 0;
let fd;
const read=path=>{//«
	let stats = fs.statSync(path);
	if (!fd) fd = fs.openSync(path);
	let sz = stats.size - cur_off;
	if (sz < 1) return;
	let buf = Buffer.alloc(sz);
	fs.readSync(fd, buf, 0, sz, cur_off)
	cur_off = stats.size;
	ws.send(buf);
};//»
com.stdout.on('data',dat=>{

let str = dat.toString();
let marr;
if (str.match(/^\[download\]/)) {

if (marr = str.match(/(Destination: (\/tmp\/.+))\n?$/)) {
	path = marr[2];
	file_path = path;
	part_path = `${path}.part`;
	ws.send(JSON.stringify({name: path.split("/").pop()}));
log(marr[1]);
}
else{
ws.send(JSON.stringify({out: str}));
	try {
		read(part_path);
		return;
	}
	catch(e){
//		log("Caught", e);
	}
	try{
		read(path);
		return;
	}
	catch(e){
//		log("Caught", e);
	}
}


}
ws.send(JSON.stringify({out: str}));
});
com.stderr.on('data', (dat) => {
	ws.send(JSON.stringify({err: dat.toString()}));
});
com.on('error',(e)=>{
	log("SPAWN ERROR!?!?!");
	log(e);
	ws.send(JSON.stringify({err: e.message}));
});
com.on('close',(code)=>{
//log(`Closed with code: ${code}`);
	try{
		read(path);
	}
	catch(e){
//		log("Caught", e);
	}
});
com.on('exit',(code)=>{
//log(`Exited`);
	ws.send(JSON.stringify({done: true}));
});

}//»
});
}
else if (mess==="Abort"){
	if (ac) ac.abort();
}
else if (mess==="Cleanup"){
log("Received 'Cleanup' message");

	fs.unlinkSync(file_path);
	fs.rmdirSync(tmpdir);

}
else{
	log("???",mess);
}
});//»
});
log(`${SERVICE_NAME} service listening at wss://${hostname}:${portnum}`);
}//»

//Startup«

if (process.env.LOTW_TEST) {
	COMMAND = COMMANDS[0];
	init();
}
else {
const start = async()=>{
	const trycom = ()=>{
		return new Promise((Y,N)=>{
			let com = spawn(COMMAND, ["--version"]);
			log(`Checking for '${COMMAND} --version'...`);
			com.stdout.on('data',dat=>{
log("OK: "+dat.toString().replace(/\n$/,""));
				Y(true);
			});
			com.stdout.on('error',e=>{
				log("Error",e);
			});
			com.on('error',(e)=>{
				Y();
			});
		});
	};
	for (let i=0; i < COMMANDS.length; i++){
		COMMAND = COMMANDS[i];
		if (await trycom()) return init();
	}
	log("Not found... aborting!");
	process.exit();
};
start();
}
//»

