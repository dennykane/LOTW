/*

Been working on the shell's `adduser` AND `su <username>` commands, in order to change from the
sytem's default username ("me"), which allows us to use the get_username function to do network
related stuff with a unique identity.

*/

export const lib = (comarg, args, Core, Shell)=>{

const COMS = {//«

connect:async()=>{//«
	let o = iface_prep();
	if (!o) return;
	werr("Attempting to connect to: "+o.to);
	let rv = await o.chan.connect(o.to);
	if (rv) cbok();
	else cberr("Could not connect");
},//»
wait:async()=>{

	let o = iface_prep();
	if (!o) return;
	werr(`Waiting on: ${o.to}...`);
	o.chan.waitOnConnection(o.to ,()=>{
		let conn = o.chan.getConnection(o.to);
log(conn);
cbok();
	});

},


mkchannel:async()=>{//«
	let opts = failopts(args,{LONG:{default:1},SHORT:{d:1}});
	if (!opts) return;
	let api=getapi(cberr);
	if (!api) return;
	if (!api.didInit()) return cberr("Did not initialize the firebase api with 'ifup'!");
	let name = args.shift();
	if (!name) return cberr("No channel name given!");
	if (!capi.isId(name)) return cberr("Invalid channel name: "+name);
	let chan = api.mkChannel(Core.get_username(),name,(!!(opts.default||opts.d)));
	if (!chan) return cberr("Could not make the channel!");
	if (chan===true) werr("The channel already exists!");
	cbok();
},//»
ifup:async()=>{//«
	if (!await doload(cberr)) return;
	let api=NS.api.iface;
	if (!(await api.init())) return cberr("Could not initialize firebase!");
	cbok();
},//»

}//»

if (!comarg) return Object.keys(COMS);

//Imports«
let _;
_=Core;
const{
log,
cwarn,
cerr,
xgetobj,
globals,
Desk,
}=Core;
_=globals;
const{
fs,
util,
}=globals;

const{strnum,isarr,isobj,make,mkdv}=util;

const {
	cur_dir,
	respbr,
	get_var_str,
	refresh,
	failopts,
	cbok,
	cberr,
	wout,
	werr,
	termobj,
	wrap_line,
	kill_register,
	getLineInput,
} = Shell;


const NS = window[__OS_NS__];
const fsapi=NS.api.fs;
const capi = Core.api;
const _Desk = Desk;

//»

//Var«

const stats = globals.stats;
const IP = stats.IP;

//»

//Funcs«

const doload=(err)=>{//«
	return new Promise(async(Y,N)=>{
		if (!(await fsapi.loadMod("iface.iface",{STATIC:true}))) {
			err("No iface.mod!");
			Y(false);
			return 
		}
		Y(true);
	});

};//»
const getapi=()=>{//«
	let api=NS.api.iface;
	if (!api) {
		cberr("Did not load iface.mod!");
		return 
	}
	return api;
};//»
const iface_prep=()=>{//«
	let api=getapi();
	if (!(api&&api.didInit())) return;
	let ch = args.shift();
	if (!ch) {
		cberr("No channel given!");
		return 
	}
	let chan = api.getChannel(ch);
	if (!chan) {
		cberr("No channel: "+ch);
		return;
	}
	let to = args.shift();
	if (!(to&&capi.isId(to))) {
		cberr("To name missing or invalid");
		return; 
	}
	if (Core.get_username()===to) return cberr("Cannot connect to yourself!");
	return {to:to,chan:chan};
};//»

//»


COMS[comarg](args);

}




/*Old«

send:()=>{//«
//This is not a WebRTC P2P DataChannel function! It just uses the firebase channel.
//They are stored in /iface/<channel>/inbox
//To send a text over WebRTC, write to /iface/<channel>/<user>/sms, for example, 
//$ echo "Hi there" > /iface/public/fred/sms
	let o = iface_prep();
	if (!o) return;
	let mess = args.join(" ").trim();
	if (!mess) return cberr("Nothing to send");
	werr("Sending: "+mess.length+" chars");
	o.chan.send(o.to,mess,"sms");
	cbok();
},//»


const do_call_or_ans=async(args, if_call)=>{//«
	const get_time=()=>{
		let arr = new Date().toString().split(" ");
		let mon = arr[1];
		let d = arr[2].replace(/^0/,"");
		let tmarr = arr[4].split(":");
		let ampm="a";
		let hr = parseInt(tmarr[0]);
		if (hr >= 12){
			ampm = "p";
			if (hr >= 13) hr-=12;
		}
		return `${mon} ${d} @${hr}:${tmarr[1]}${ampm}`;
	};
	let chan;
	let win;
	let killed = false;
	kill_register(cb=>{
		killed=true;
		if (chan) chan.close();
		cb();
	});
	let name = args.shift();
	if (!name) return cberr("No name given!");
	let mod = await fsapi.getMod("iface.net",{STATIC:true});
	if (!mod) return cberr("No iface.net mod!");
	let api = mod.api;
	let myname = await api.getMyName();
	if (!myname) return cberr("You are not logged in!");

	if (if_call) {
		wout(`Calling as: ${myname}...`);
		chan = api.makeCall(myname, name);
	}
	else {
		wout(`Answering as: ${myname}...`);
		chan = api.answerCall(myname, name);
	}

	await chan.init();
	wout("Connected");
	chan.set_close(()=>{
		if (win){
			let d = mkdv();
			d.mar=5;
			d.pad=5;
			d.bgcol="#500";
			d.tcol="#fff";
			d.innerText=`Peer connection ended @${get_time()}`;
			win.main.insertBefore(d, win.main.childNodes[0]);
		}
		killed=true;
		wout("Closed");
		cbok();
	});
	chan.set_recv(obj=>{
		if (!(obj&&obj.text)) return;
		let s = `${name} (${get_time()}): ${obj.text}`;
		if (win){
			let d = mkdv();
			d.innerText = s;
			d.mar = 5;
			d.pad = 5;
			d.bor = "1px solid black";
			win.main.insertBefore(d, win.main.childNodes[0]);
		}
		else {
console.log(s);
		}
	});
	if (_Desk) {
		win = await _Desk.openApp("None",true,{LETS:"CC"});
		win.main.add(make('br'));
		win.main.over="auto";
		win.main.style.userSelect="text";
		win.title="Call\xa0Center";
	}
	while (!killed) {
		let rv = await getLineInput(">\x20")
		rv = rv.regstr();
		if (rv) chan.send(JSON.stringify({text:rv}));
	}
};
//»

//These interface with the "old" iface.net module that uses the App Engine logic 
'call':async(args)=>{do_call_or_ans(args, true);},
'answer':async(args)=>{do_call_or_ans(args);},


const coms_help={
send:`Usage: send <channel> <username> <Text message to send here...>

The send command does not require a P2P connection to the user you are sending to.
The message is insecurely sent over the firebase channel named <channel>.
These messages can be retrieved from  /iface/<channel>/inbox.
`
}

'sendsysmsg':function(){//«
if (!args.length) return;
Core.send_channel_message(args.join(" "));
cbok();
},//»
'getsysmsg':function(){//«
wout(Core.get_channel_message());
cbok();
},//»

sendmic:async args=>{//«

let ifapi = NS.api.iface;
if (!ifapi) return cberr("No iface loaded!");

let topath = args.shift();
if (!topath) return cberr("No topath");

let rv = await fsapi.pathToNode(topath);
if (!rv) return cberr("Not found: "+topath);
if (rv.root.TYPE!=="iface") return cberr("Not an iface path");
if (rv.NAME!=="mic") return cberr("Not sending to the mic port!");
let fullpath=rv.fullpath;
let parr = fullpath.split("/");
parr.shift();parr.shift();
if (parr.length!==3) return cberr("Not a p2p port");
let chan = ifapi.getChannel(parr.shift());
if (!chan) return cberr("Channel not found");
let conn = chan.getConnection(parr.shift());
if (!conn) return cberr("Connection not found");

fs.read_file("/dev/mic", (rv,arg)=>{
	if (!rv) return;
	if (rv.EOF===true){
cwarn("DONE");
		return;
	}
	conn.send("mic",rv);
}, {exports:Shell});

},//»
ssh:async()=>{//«
	const b2s = Core.api.bufToStr;
	let api=getapi();
	if (!(api && api.didInit())) {
		cberr("Could not get the iface api! Did you call 'ifup'?");
		return;
	}
	let opts=failopts(args,{LONG:{channel:3,accept:3},SHORT:{c:3,a:3}});
	if (!opts) return;
	let accept_from = opts.accept||opts.a;
	let chname = opts.channel||opts.c;
	if (!chname) chname = get_var_str("CHANNEL");
	if (!chname) return cberr("Channel not given!");
	let chan = api.getChannel(chname);
	if (!chan) {
		cberr("Channel not found: "+chname);
		return;
	}
	if (accept_from){//«
		if (args.length) return cberr("Too many args!");
		termobj.set_prompt(`Warning: this allows ${accept_from} to make changes to your system do you wish to continue?[y/N] `, {NOPUSH:1,NOSCROLL:1,FROMCOM:1});
		refresh();
		termobj.getch(async ch=>{
			if (ch==="y"||ch==="Y"){
				wout(`Trying to connect to ${accept_from}...`);
				let conn = chan.getConnection(accept_from);
				if (!conn){
					if (!(await chan.connect(accept_from))) return cberr("Could not connect to: "+accept_from);
					conn = chan.getConnection(accept_from);
					if (!conn) return cberr("Error: connection object not found!");
				}
				wout("Connected. (Ctrl-D ends the session)");
				termobj.init_ssh_mode(rv=>{//«
					if (isobj(rv)&&rv.EOF===true) return;
					else if (isarr(rv)){
						if (isobj(rv[0])&&rv[0].EOF===true)return;
						conn.send("stdout",rv.join("\n"));
					}
				},
				rv=>{
					if (isarr(rv)) conn.send("stderr",rv.join("\n"));
				},
				()=>{
					conn.send("respdone",termobj.get_cwd());
				},
				()=>{
					conn.send("respdone","DONE");
					conn.unset_port("ssh");
				});//»
				conn.set_port("ssh",dat=>{//«
					let str = b2s(dat.buffer);
					if (!str){
						respbr();
						termobj.handle_insert("Terminated!");
						termobj.end_ssh_mode();
						conn.unset_port("ssh");
						return;
					}
					termobj.handle_insert(str);
					termobj.enter();
				});//»
				cbok();
			}
			else cberr("Aborted!");
		});
	}//»
	else {//«
		let toname = args.shift();
		if (!toname) return cberr("No user!");
		if (args.length) return cberr("Too many args!");
		wout("Waiting on "+toname+"...");
		chan.waitOnConnection(toname,()=>{
			let conn = chan.getConnection(toname);
			if (!conn) return cberr("Error: connection object not found!");
			conn.set_port("respdone",dat=>{
				let str = b2s(dat.buffer);
				if (str=="DONE"){
//					wout("Terminated!");
					termobj.end_app_mode();
				}
				else {
//cwarn("CWD", str);
					termobj.set_ssh_dir(str);
					termobj.response_end();
				}
			});
			conn.set_port("stdout",dat=>{
				let str = b2s(dat.buffer);
				wout(str);
			});
			conn.set_port("stderr",dat=>{
				let str = b2s(dat.buffer);
				werr(str);
			});
			wout("Connected!");
			termobj.init_app_mode("ssh",
				ret=>{
					conn.send("ssh",ret);
				},
				()=>{
					conn.send("ssh","");
					cbok("Terminated");
				}
			);
		});
	}//»
},//»
'wstest':function(){//«

var _ = this._;
var com = args.shift();
if (!com) return _.cberr("No command!");
if (com==="open"){//«

if (ws_state) return _.cberr("Already opened!");

ws = new WebSocket(ws_url);
ws.binaryType="arraybuffer";

//CBs«
ws.onmessage=function(e){//«
	var buf = e.data;
log(buf);
//	if (buf instanceof ArrayBuffer) {
//	let str = util.bytes_to_str(buf, true);
////var len = buf.byteLength
//console.log("Received: " + str);
//	}
//	else cwarn("Not an ArrayBuffer!", buf);
}//»
ws.onerror=(e)=>{
cerr(e);
}
ws.onclose=function(){
	ws_state = false;
	ws = null;
console.warn("WSCLOSED")
}
ws.onopen=function(){
	ws_state = true;
cwarn("WSOPEN")
}
//»

_.cbok();

}//»
else if (com==="send"){//«
	if (!ws_state) return _.cberr("Not opened!");
	let str = args.shift();
	if (!str) return _.cberr("No arg!");
	if (!str instanceof String) return _.cberr("Arg not a string!");
	ws.send(str);
	_.cbok();
}//»
else if (com==="close"){//«
	if (!ws_state) return _.cberr("Not opened!");
	ws.close();
	_.cbok();
}//»
else if (com=="seturl"){//«
	let url = args.shift();
	if (!url) return _.cberr("No url given!");
	ws_url = url;
	_.cbok();

}//»
else {
	_.cberr("Unknown command");
}

},//»
'call':function(){//«
	let err = cberr;
	let ok = cbok;
	let out = wout;

	if (!did_init_fbase) return err("Firebase is not initialized!");

	let name = Core.get_username();
	if (name==="user") return err("Not logged in or username not set!");
	let touser = args.shift();
	if (!touser) return err("No to user!");
	if (name===touser) return err("Cannot call yourself!");

	let call = new RTCCall(touser);
	let pc;
	out("Initializing stream...");
	call.init_stream((ret, errarg)=>{
		if (!ret) return err(errarg);
		out("OK!");
		if (!(pc = call.init_pc())) return err("Could not init pc");
		out("Calling " + touser+"...");
		let killed = false;
		let dokill=()=>{killed=true;pc.close();call.kill();}
		termobj.kill_register(killcb=>{
log("Call killed!");
			if (killed) return;
			ok("Killed!");
			killcb&&killcb();
			dokill();
		});
		call.make_call((ret2,errarg2,did_connect)=>{
			if (did_connect) return out("Connected!");
			if (!ret2) return err(errarg2);
			if (killed) return;
			ok("Done!");
			dokill();
		});
	});

},//»
'wait':function(args){//«
	let err = cberr;
	let ok = cbok;
	let out = wout;
	if (!did_init_fbase) return err("Firebase is not initialized!");

	let name = Core.get_username();
	if (name==="user") return err("Not logged in or username not set!");
	let touser = args.shift();
	if (!touser) return err("No to user!");
	if (name===touser) return err("Cannot wait on yourself!");

	let call = new RTCCall(touser);
	let pc;
	out("Initializing stream...");
	call.init_stream((ret, errarg)=>{
		if (!ret) return err(errarg);
		out("OK!");
		if (!(pc = call.init_pc())) return err("Could not init pc");
		out("Waiting on " + touser+"...");
		let killed = false;
		let dokill=()=>{if (killed) return;killed=true;pc.close();call.kill();}
		termobj.kill_register(killcb=>{
log("Wait killed!");
			if (killed) return;
			ok("Killed!");
			killcb&&killcb();
			dokill();
		});
		call.make_call((ret2,errarg2,did_connect)=>{
			if (did_connect) return out("Connected!");
			if (!ret2) return err(errarg2);
			if (killed) return;
			ok("Done!");
			dokill();
		}, true);
	});
},//»
'fbase':function(){//«

function urlB64ToUint8Array(base64String) {//«
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}//»

let err = cberr;
let ok = cbok;

let com = args.shift();
if (!com) return err("No command");
if (com==="init"){//«
	if (did_init_fbase) return ok("Firebase did already init!");
	Core.make_script(fbase_app_script_url, 
	e=>{
		Core.make_script(fbase_db_script_url,e=>{
			did_init_fbase = true;
			firebase.initializeApp(fbase_config);
			ok("Firebase did init okay!");
		}, 
		e=>{
			err("Problem loading: " + fbase_db_script_url);
			cerr(e);
		});
	},e=>{
		err("Problem loading: " + fbase_app_script_url);
		cerr(e);
	});
}//»
else if (com==="msginit"){//«
	let fail=str=>{err("Messaging initialization failed: "+str);}
	if (!did_init_fbase) return err("Must init firebase first");
	if (did_init_msg) return ok("Did already init messaging");
	Core.make_script(fbase_msg_script_url, e=>{//«
		messaging = firebase.messaging();
		messaging.usePublicVapidKey(VAPID);
		messaging.onTokenRefresh(check_token);
		messaging.onMessage(on_message);
	
		navigator.serviceWorker.register('/firebase-messaging-sw.js')
		.then(registration=>{
log('Service worker successfully registered.');

//Is this line is needed???
			messaging.useServiceWorker(registration);

			registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlB64ToUint8Array(VAPID)
			})
			.then(pushSubscription=>{
log(JSON.stringify(pushSubscription,null, "  "));
				ok("Messaging did init okay!");
				did_init_msg = true;
			})
			.catch(e=>{
err("Could not init messaging");
log(e);
			})
			
			//      return registration;
		})
		.catch(e=>{
			fail("could not register the serviceWorker");
//err('Unable to register service worker.');
log(e);
		});
	}, 
	e=>{
		fail("Problem loading: " + fbase_msg_script_url);
cerr(e);
	})//»
}//»
else if (com==="msgon"){//«
log('Requesting permission...');
	if (!did_init_msg) return err("Must init messaging first");
	if (cur_token) return ok("Already granted permission!");
	messaging.requestPermission().then(()=>{
		check_token(()=>{
			if (cur_token) ok("Permission granted");
			else err("Permission denied");
		});
	}).catch(e=>{
		err("There was an error getting permission");
//log('Unable to get permission to notify.');
log(e);
	});
}//»
else if (com==="msgoff"){//«
	if (!did_init_msg) return err("Did not init messaging!");
	if (!cur_token) return ok("No token exists!");
    navigator.serviceWorker.getRegistrations()
    .then(registrations=>{
		messaging.deleteToken(cur_token).then(()=>{
//			check_token(()=>{
//			if (!cur_token) {
			for(let registration of registrations) {
//log(registration.active.scriptURL);
				if(registration.active.scriptURL == window.location.origin+'/firebase-messaging-sw.js'){ 
cwarn("Unregister: "+registration.active.scriptURL);
					registration.unregister(); 
				}
			}
			ok('Token deleted');
//			}
//			else err("Could not delete the token");
//			});
		}).catch(e=>{
log('Unable to delete token. ');
log(e);
			err("Could not delete the token");
		});
//		ok("Done!");
    });
}//»
else err("Unknown command: "+com);

},//»

»*/


