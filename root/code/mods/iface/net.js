

// XXX    !!!   OLD: USES THE APP ENGINE BACKEND WITH MEMCACHE    !!!   XXX 



//Imports«

const NS = window[__OS_NS__];
const{globals}=Core;
const{fs,util,dev_mode,dev_env}=globals;
const{strnum}=util;
//const fsapi=NS.api.fs;
const capi = Core.api;

//»

//Funcs«
const log=(...args)=>{console.log(...args)}
const cwarn=(...args)=>{console.warn(...args)}
const cerr=(...args)=>{console.error(...args)}
//»

const PeerChannel=function(is_caller, caller, receiver) {//«
	let got_all_ices = false;
	const ices=[]
	let pc;
	let sdp;
	let call_start_time;
	let MAX_CALL_MS = 5 * 60 * 1000;//5 minutes==300000ms
	let cancelled = false;
	let channel;
	let conn_cb;
	let recv_cb;
	const took_too_long=()=>{//«
		if (cancelled) return true;
		if (Date.now()-call_start_time > MAX_CALL_MS) return true;
		return false;
	};//»
	const set_memcache=(k,v)=>{//«
		return new Promise(async (y,n)=>{
			let rv = await fetch(`/_memcacheset?k=${encodeURIComponent(k)}&v=${encodeURIComponent(v)}`);
			if (rv&&rv.ok===true)y(true);
			else y();
		});
	};//»
	const get_memcache=(k)=>{//«
		return new Promise((y,n)=>{
			let interval = setInterval(async()=>{
				let rv = await fetch(`/_memcacheget?k=${encodeURIComponent(k)}&del=1`);
				if (rv&&rv.ok===true) {
					let val = await rv.text();
					clearInterval(interval);
					y(val);
				}
				else if(took_too_long()){
					clearInterval(interval);
					y();
				}
			},1000);
		});
	};//»
	const set_ices_and_remdesc=rv=>{//«
		if (!rv) return;
		let obj = JSON.parse(rv);		
		if (!obj&&obj.ices&&obj.sdp) return;
		return new Promise(async(y,n)=>{
			await pc.setRemoteDescription(new RTCSessionDescription(obj.sdp));
			for (let ice of obj.ices) pc.addIceCandidate(new RTCIceCandidate(ice));
			y();
		});
	};//»

	pc = new RTCPeerConnection({'iceServers':[{'urls':'stun:stun.l.google.com:19302'},{'urls':'stun:stun.services.mozilla.com'}]});

	pc.onicecandidate=e=>{//«
		if (!e.candidate){
			got_all_ices = true;
			return;
		}
		ices.push(e.candidate);
	};//»
	pc.oniceconnectionstatechange=e=>{//«
//		pc.iceConnectionState==="connected"||"closed"||"failed"||"disconnected"
	};//»

	const init_channel=(chan)=>{//«
//console.log("CHAN",chan);
		chan.binaryType="arraybuffer"
		chan.onmessage=async e=>{
			if (!recv_cb) return cwarn("NO RECEIVE CB!!!");
			let arr = new Uint8Array(e.data);
			if (arr[0] == 123 && arr[1] == 34 && arr[arr.length - 1] == 125) recv_cb(JSON.parse(await capi.toStr(arr)));
			else recv_cb(arr);
		}
		chan.onopen=e=>{
cwarn("Channel open");
			conn_cb();
		};
		chan.onclose=e=>{
cwarn("Channel closed");
		}
		channel = chan;
		if (cancelled) channel.close();
	};//»
	this.init=()=>{//«
		return new Promise(async (y,n)=>{
			conn_cb = y;
			let last_ices_len;
			let iters=0;
			let interval = setInterval(async()=>{
				if (ices.length===last_ices_len && iters>=3) got_all_ices=true;
				if (sdp && got_all_ices){
					clearInterval(interval);
					if (is_caller)await set_memcache(`${caller}-${receiver}-ofr`, JSON.stringify({ices:ices, sdp: sdp}));
					else await set_memcache(`${caller}-${receiver}-ans`, JSON.stringify({ices:ices, sdp: sdp}));
				}
				last_ices_len = ices.length;
				iters++;
			},500);
			if (is_caller) {
				init_channel(pc.createDataChannel('datachannel', {ordered: false}))
				let offer = await pc.createOffer();
				await pc.setLocalDescription(offer);
				call_start_time = Date.now();
				sdp = offer;
				await set_ices_and_remdesc(await get_memcache(`${caller}-${receiver}-ans`));
			}
			else {
				pc.ondatachannel = e=>{init_channel(e.channel)}

				call_start_time = Date.now();
				await set_ices_and_remdesc(await get_memcache(`${caller}-${receiver}-ofr`));

				let answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				sdp = answer;
			}
		});
	};//»
	this.close=()=>{//«
		cancelled=true;
		if (channel) channel.close();
		else{
cwarn("Channel cancelled");
		}
	};//»
	this.send=async(val)=>{//«
		if (!channel) return console.warn("Dropping message (channel not active)", val);
		if (val instanceof ArrayBuffer) return channel.send(val);
		channel.send(await capi.toBuf(val));
	};//»
this.set_recv=cb=>{
	recv_cb = cb;
};
this.set_close=cb=>{
	channel.onclose = cb;
};
}//»
const get_my_name=()=>{//«
	return new Promise(async(y,n)=>{
		let rv;
		try {
			rv = await fetch('/_status?nameonly=1&nocache=' + Date.now());
		} catch (e) {
			cerr("Network error");
			y();
			return;
		}   
		if (!(rv && rv.ok === true)) {
cerr("Invalid response");
y();
			return;
		}
//		let txt = await rv.text();
//		y((await rv.json())["NAME"]);
		y(await rv.text());
	});
};//»

const make_call=(myname, toname)=>{//«
	if (myname&&toname&&myname!==toname) return new PeerChannel(true, myname, toname);
};//»
const answer_call=(myname, fromname)=>{//«
	if (myname&&fromname&&myname!==fromname) return new PeerChannel(false, fromname, myname);
};//»

//api«

const api = {
	getMyName:get_my_name,
	makeCall:make_call,
	answerCall:answer_call
};

this.api=api;
NS.api.net=api;


//»


