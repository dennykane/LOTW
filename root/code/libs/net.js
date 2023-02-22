
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

logout:async()=>{//«
	document.cookie="id=0;max-age=0";
	if (globals.socket) globals.socket.kill();
	cbok();
},//»
login:async(args)=>{//«

	let interval;
	const clint = ()=>{
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	};
	let opts = failopts(args,{s:{f:1}});
	if (!opts) return;
	let url = '/_login';
	if (opts.f) url=`${url}?force=1`;
	let rv = await fetch(url);
	if (!rv.ok) return cberr("Fail");
	let w = window.open(await rv.text(), "Login", "height=600,width=500");
	w.onbeforeunload=()=>{
		cbok();
		clint();
	};
	let iter=0;
	interval = setInterval(()=>{
		if (w && w.close) {
			let txt;
			try{txt = w.document.body.innerText;}catch(e){return;}
			if (!txt) return;
			if (txt.match(/^You/)) {
				w.close();
				cbok();
				clint();
			}
		}
		iter++;
		if (iter > 1000) clint();
	},100);
},//»
whoami:async()=>{//«
	let rv = await fetch("/_getname");
	werr(await rv.text());
	if (!rv.ok) cberr();
	else cbok();
},//»
sockup:async()=>{//«

if (!window.io){
	try{
		if (!await capi.initIO()) return cberr("Could not load socket.io!");
	}catch(e){
		return cberr("Could not load socket.io!");
	}
	if (!window.io) return cberr("Loaded socket.io but found no 'io' object!?!?!");
}

if (!document.cookie.match(/id=/)) return cberr("You are not logged in!");
if (globals.socket) return cbok("The socket is already up");
new LOTWSocket();

},//»
sockdown:()=>{//«

if (!globals.socket) return cbok("There is no active socket");
globals.socket.kill();
cbok();

},//»
ping:async(args)=>{//«

	let to = args.shift();
	if (!to) return cberr("No 'to' arg!");
	let sock = globals.socket;
	if (!sock) return cbok("No socket!");
	let start = performance.now();
	let rv = await sock.ping(to.toLowerCase());
	if (!rv) return cberr("PINGWUT?!?!?!?");
	if (rv.error) {
		werr(rv.msg);
		cberr();
	}
	else {
		let diff = Math.round(performance.now() - start);
		werr(`${rv.msg} (${diff} ms)`);
		cbok();
	}

},//»
setname:async(args)=>{//«
	let name = args.shift();
	if (!name) return cberr("No name given!");
	let rv = await fetch(`/_setname?name=${name}`);
	werr(await rv.text());
	if (!rv.ok) return cberr();
	cbok();
},//»
delname:async()=>{//«
	let rv = await fetch("/_delname");
	werr(await rv.text());
	if (!rv.ok) cberr();
	else cbok();
},//»

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fsapi=NS.api.fs;
const capi = Core.api;

const{
	failopts,
	wout,
	werr,
	cbok,
	cberr
} = Shell;

//»

const LOTWSocket = function (){//«

let wait_id = 1;
let waiters = {};
let sock = new window.io();
sock.on('error',msg=>{
	console.error("Socket error> ", msg);
});
sock.on('ping_error',arg=>{
let gotcb = waiters[arg.id];
if (!gotcb) {
cwarn("No callback for", arg.id);
return;
}
arg.error = true;
gotcb(arg);

waiters[arg.id] = undefined;
delete waiters[arg.id];

});
sock.on('connect',()=>{
	log("CONNECTED");
	globals.socket = this;
	cbok();
});
sock.on('disconnect',()=>{
log("DISCONNECTED");
	globals.socket = null;
	delete globals.socket;
});
sock.on("ping_ask",arg=>{
//	cwarn("PING ASK", from);
	sock.emit("ping_rep", arg);
});
sock.on("ping_rep",arg=>{
//	cwarn("PING ASK", from);
//	sock.emit("ping_rep", from);
let gotcb = waiters[arg.id];
if (!gotcb) {
cwarn("No callback for", arg.id);
return;
}
	gotcb({msg: `OK: ${arg.to}`});

	waiters[arg.id] = undefined;
	delete waiters[arg.id];

});

this.ping = to=>{
return new Promise((Y,N)=>{
	let s = ""+wait_id;
	waiters[s] = Y;
	sock.emit("ping", {to: to, id: s});
	wait_id++;
});
};
this.kill=()=>{
cwarn("Socket killed");
	sock.disconnect();
	globals.socket = undefined;
};

};//»

COMS[comarg](args);

}
