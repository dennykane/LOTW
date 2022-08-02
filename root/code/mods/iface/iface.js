
export const mod = function(Core) {

//const authObj = {};

const authObj = {
	apiKey: "AIzaSyCHIu1dr-a5FCeOogjQyMPxrzSq3kK9Hek",
	authDomain: "linuxontheweb.firebaseapp.com",
	databaseURL: "https://linuxontheweb.firebaseio.com",
	projectId: "linuxontheweb",
	storageBucket: "linuxontheweb.appspot.com"
//	messagingSenderId: "XXXXXXXXXXXX"
};


//Imports«
const NS = window[__OS_NS__];
const{log,cwarn,cerr,xgetobj,globals}=Core;
const{fs,util,dev_mode,dev_env}=globals;
const{strnum}=util;
const fsapi=NS.api.fs;
const capi = Core.api;
//»

//Var«

let did_init=false;
const stats = globals.stats;
const IP = stats.IP;

let def_channel_name;
const channels={};

//»

//«
let is_connected = false;

const fbase_connection_change=snap=>{
//cwarn("fbase_connection",snap);
	if (snap.val() === true){
cwarn("Connected to firebase");
		is_connected = true;
	}
	else{
cwarn("firebase is disconnected");
		is_connected = false;
	}
}; 

//»

const Channel=function(username,channame){//«

let dbref = firebase.database().ref("channel/"+channame);

this.ref = dbref;
let messages = [];
let waiters={};
let connections = {};
const send=(to,msg,type)=>{//«
	let m = dbref.push({from:username, msg: msg, to: to, type:type});
	m.remove();
};
this.send=send;
//»
const Peer=function(to,is_conn,cb){//«
const port_arr=[//«
"cam",
"file",
"gamepad",
"mic",
"midi",
"ping",
"sms",
"ssh",
"stderr",
"stdout",
"respdone"
]//»
	let channel;
	let sms_in = [];
	let cancelled = false;
	let closed = false;
	const ports={};
	let pc = new RTCPeerConnection({'iceServers':[{'urls':'stun:stun.l.google.com:19302'},{'urls':'stun:stun.services.mozilla.com'}]});
	const handle_message=e=>{
cwarn("Peer event received",to);
		let arr=new Uint8Array(e.data);
		let port=port_arr[arr[0]];
		if (!port) return cerr("Dropping unknown port",arr[0]);
		let dat = arr.slice(1);
/*
There need to be listeners for the "real time" low level signal /dev/-like ports, or they
will be dropped.
We can have iface rules (or listeners) for file/sms
*/
		let cb = ports[port];
		if (cb) cb(dat);
		else{
			if (port==="sms"){
				let msg = Core.api.bufToStr(dat.buffer);
log("SMS",msg);
			//		messages.push(`[${to}] ${msg}`);
				sms_in.push(msg);
			}
			else {
cerr("Dropping message to port",port);
				return;
			}
		}
	};

	const pc_send=async(port,data)=>{
		if (closed) return;
		let num = port_arr.indexOf(port);
		if (num<0) return cerr("NOPORT",port);
		let blob = new Blob([new Uint8Array([num]),data],{type:"blob"});
		let ret=await Core.api.toBuf(blob);
		if (!(ret instanceof ArrayBuffer)) return cerr("Not ArrayBuffer",data);
		channel.send(ret);
	};
	const init_channel = chan => {//«
		channel=chan;
		this.channel = channel;
		chan.binaryType="arraybuffer";
		chan.onmessage=handle_message;
		chan.onopen=e=>{
cwarn("Channel OPEN", to);
			if (cancelled) {
				setTimeout(()=>{
					chan.close();
				},25);
				return;
			}
			if (cb) cb(true);
			if (waiters[to]) {
				waiters[to]();
				delete waiters[to];
			}
		};
		chan.onclose=async e=>{
			pc.close();
			closed = true;
cwarn("Channel CLOSED",to);
			delete connections[to];
let dirobj = await fsapi.pathToNode('/iface/'+channame);
if (!(dirobj&&dirobj.KIDS)) return cerr("No dirobj for /iface/"+channame);
delete dirobj.KIDS[to];
		};
	};//»
	pc.onicecandidate=e=>{if(!e.candidate)return;send(to,JSON.stringify(e.candidate),"ice");};
	pc.oniceconnectionstatechange=e=>{//«
		let which = pc.iceConnectionState;
		if (which==="connected") return;
		if (which==="closed"||which=="failed"||which=="disconnected") {
//if (which==="closed"){
//}
cerr("pc.DataChannel",which);
		}
		else{
//cwarn("State",which);
		}
	}//»
	if (is_conn){//«
		init_channel(pc.createDataChannel('datachannel', {ordered: false}));
		let offer;
		pc.createOffer()
		.then(off=>{
			offer = off;
			pc.setLocalDescription(offer)
		})
		.then(()=>send(to,JSON.stringify(offer),"offer"))
		.catch(e=>{
cerr('Failed to create session description: ', e);
			if (cb) cb(false);
		})
	}
	else pc.ondatachannel=e=>{init_channel(e.channel);};//»	
	this.cancel=()=>{
cwarn("CONNECTION IS CANCELLED!!!",to);
		cancelled=true;
		delete connections[to];
	};
	this.set_port=(name,cb)=>{
		ports[name]=cb;
	};
	this.unset_port=name=>{
		ports[name]=undefined;
		delete ports[name];
	};
	this.get_sms=()=>{
		return sms_in.shift();
	};
	this.send=pc_send;
	this.pc=pc;
	this.name=to;
	connections[to]=this;
};//»

dbref.on('child_added', async data=>{//«

let val = data.val();
dbref.child(data.key).remove();
if (val.to!==username) return;
let typ = val.type;
let from = val.from;
let msg = val.msg;
let pc;
if (typ==="sms") messages.push(`[${from}] ${msg}`);
else if(typ=="ice"){//«
	if (!connections[from]) pc = new Peer(from).pc;
	else pc = connections[from].pc;
	pc.addIceCandidate(new RTCIceCandidate(JSON.parse(msg)));
}//»
else if(typ=="offer"){//«
	if (!connections[from]) pc = new Peer(from).pc;
	else pc = connections[from].pc;
	let answer;
	let obj = JSON.parse(msg);
	pc.setRemoteDescription(new RTCSessionDescription(obj))
	.then(() => pc.createAnswer())
	.then(ans => {
		answer=ans;
		pc.setLocalDescription(answer)
	})
	.then(()=>{send(from,JSON.stringify(answer),"answer");})
	.catch(e=>{
cwarn("Caught from offer");
cerr(e);
	})
}//»
else if(typ=="answer"){//«
	if (!connections[from]){
cerr("NO CONNECTION FOUND FROM: ", from,"!!!!!!!!!!!!!!!");
		return;
	}
	connections[from].pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg)));
}//»
else{
cwarn("Unknown message type", typ);
}

});//»
this.getConnections=()=>{return Object.keys(connections);};
this.getConnection=name=>{return connections[name];};
this.getMessage=()=>{return messages.shift();};
this.connect=to=>{//«
	return new Promise((Y,N)=>{
		new Peer(to,true,Y);
	});
};//»
this.cancel=to=>{
};
this.waitOnConnection=(username,cb)=>{
	if (connections[username]) cb();
	else waiters[username]=cb;
};

};//»

const api={//«
	closeAllConnections:()=>{
		for (let ch in channels){
			let chan = channels[ch];
			if(!chan) continue;
			let conns = chan.getConnections();
			for (let cx of conns){
				let conn = chan.getConnection(cx);
				if (conn&&conn.channel) conn.channel.close();
			}
		}
	},
	getChannels:()=>{return Object.keys(channels);},
	getChannel:(chan_name)=>{return channels[chan_name];},
	mkChannel:(user_name,chan_name,is_default)=>{//«
		if (!did_init) return false;
		if (!(user_name && user_name!=="user"))return false
		if (channels[chan_name]) return true;
		let chan = new Channel(user_name,chan_name);
		channels[chan_name]=chan;
		if (is_default) def_channel_name=chan_name;
		return chan;
	},//»	
	getDefaultChannel:()=>{return def_channel_name;},
	didInit:()=>{return did_init;},
	isConnected:()=>{return is_connected},
	init:(opts={})=>{//«
		return new Promise(async(Y,N)=>{
			if (did_init) return Y(true);
//			if (!await capi.makeScripts([
//				"https://cdnjs.cloudflare.com/ajax/libs/firebase/9.1.1/firebase-app-compat.min.js",
//				"https://cdnjs.cloudflare.com/ajax/libs/firebase/9.1.1/firebase-database-compat.min.js"
//			]))
			if (!(await capi.makeScript("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.1.1/firebase-app-compat.min.js")&&await capi.makeScript("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.1.1/firebase-database-compat.min.js")))
			{
				if (opts.reject) return N("Could not load firebase scripts!");
				else return Y(false);
			}
			if (!(window.firebase && firebase.database)){
				if (opts.reject) return N("No window.firebase or firebase.database!?!?!");
				else return Y(false);
			}
//return ();
/*
			let rv1 = await capi.loadMod("iface.fbase_app",{noWrap:true});
			if (!window.firebase) {
				if (opts.reject) return N("Could not load fbase_app!");
				else return Y(false);
			}
			let rv2 = await capi.loadMod("iface.fbase_db",{noWrap:true});
			if (!firebase.database) {
				if (opts.reject) return N("Could not load fbase_db!");
				else return Y(false);
			}
*/
			firebase.initializeApp(authObj);
			firebase.database().ref(".info/connected").on("value", fbase_connection_change);
			did_init=true;
			Y(true);
//			if (typeof rv1 === "string") Core.do_update(`mods.iface.fbase_app`, rv1);
//			if (typeof rv2 === "string") Core.do_update(`mods.iface.fbase_db`, rv2);
		});
	},//»
	close:()=>{
		return new Promise((Y,N)=>{
			if (!did_init) return Y();;
			firebase.app().delete().then(()=>{
				cwarn("Closed");
				did_init=false;
				Y();
			});
		});
	}
};

NS.api.iface=api;

//»

}

