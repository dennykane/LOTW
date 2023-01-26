
export const app = function (arg) {

const {Core, Main, NS}=arg;

const{log,cerr,cwarn,globals}=Core;

//let testing_mode = true;
let testing_mode = false;
//Imports«
let ifapi;
const fsapi=NS.api.fs;
const widgets=NS.api.widgets;
const {popup,popok,poperr,popyesno}=widgets;
const {util,dev_mode,dev_env}=globals;
const {gbid,mk,mkdv,mksp,mkbut}=util;
const act=()=>document.activeElement;
const topwin = Main.top;
const winid = topwin.id;
const NUM=Number.isFinite;
const capi=Core.api;

if (!dev_env) testing_mode = false;

//»

//Var«
let ip_addr;
let ms_off;
let error_message;
let waiters={};
let connections={};
let toggle_ms_delay=100;
let toggle_sec_delay = (toggle_ms_delay/1000).toFixed(2)+"s";
//log(toggle_sec_delay);

let public_avatar_div;
const user_path = "/user";

const GET_NUM_CHATS = 30;
const ROOM_NAME=arg.room||"public";
const room_path = `room/${ROOM_NAME}`;
const room_sig_path = room_path+"/signal";
const room_message_path = room_path+"/message";
topwin.title=`Hello - ${ROOM_NAME}`;
let set_avatar, end_session;
let dbref, roomref, usersref, room_sig_ref, room_user_ref, room_message_ref;

let send_message;

let username;
let streaming=false;
let streaming_interval;
const STREAMING_MS_TIMEOUT=1000;
let is_away=false;
let countdown_interval, countdown_secs=0;
let video_stream,video_tracks;
const AVATAR_W = 200;
const AVATAR_H = 150;
const ADULT_UNICODE="\u{1f9d1}"
const ADULT_UNICODE_FS=75;

//let tabs;
//if (testing_mode) tabs=["About","Profile","Calls","Settings","Help","Advanced"];
//else tabs=["Profile","Settings","About","Calls", "Help","Advanced"];
//else tabs=["Profile","Settings","About","Calls", "Help","Advanced"];
//const tabs=["Profile","Settings","About","Calls", "Help","Advanced"];
const tabs=["Profile","Settings","Calls", "Help","Advanced"];
const USERHASH={};
const USERARR=[];

let curtab;
const TABDIVS=[];

let gl_program;
let vertexShader;
//Frag shaders«
const frag_arr = [//«
	'precision mediump float;',
	'varying highp vec2 vTexCoord;',
	'uniform sampler2D uSampler;',
	'void main(void) {',
	'  vec4 pixel = texture2D(uSampler, vTexCoord);',
	'',
	'  gl_FragColor = pixel;',
	'}'
];//»

function make_pix_str(num){//«
	var pix_arr = [
		'precision mediump float;',
		'varying highp vec2 vTexCoord;',
		'uniform sampler2D tex;',
		'void main()',
		'{',
		' float dx = 15.*(1./'+num+'.);',
		' float dy = 10.*(1./'+num+'.);',
		' vec2 coord = vec2(dx*floor(vTexCoord.x/dx),',
		' dy*floor(vTexCoord.y/dy));',
		' gl_FragColor = texture2D(tex, coord);',
		'}'
	];
	return pix_arr.join("\n");
}
//»
//»

//»

//Dom«
Main.tcol="#000";
const noprop=e=>{e.stopPropagation();};
const overdiv = mkdv();
overdiv.pos="absolute";
overdiv.dis="flex";
overdiv.ali="center";
overdiv.jsc="center";
overdiv.fs=50;
overdiv.loc(0,0);
overdiv.w="100%";
overdiv.h="100%";
overdiv.bgcol="rgba(0,0,255,0.175)";
overdiv.z=10000000;
overdiv.onclick=noprop;
overdiv.onmousedown=noprop;
overdiv.ondblclick=noprop;
overdiv.onmousemove=noprop;
overdiv.onmouseover=noprop;
overdiv.onmouseovut=noprop;
const initdiv=mkdv();
initdiv.bgcol="#000";
initdiv.tcol="#ddd";
initdiv.pad=10;
initdiv.fs=32;
initdiv.op=0;
initdiv.set=(s)=>{
	initdiv.op=1;
	initdiv.innerHTML="";
	if (s instanceof HTMLElement){
		initdiv.add(s);
	}
	else {
//console.log("[INIT] "+s);
		initdiv.innerText = s;
	}
};
overdiv.add(initdiv);

Main.add(overdiv);

const login_div=mkdv();//«
login_div.pos="absolute";
login_div.w="100%";
login_div.h="100%";
login_div.bgcol="#fff";
login_div.loc(0,0);
login_div.dis="none";
login_div.style.justifyContent="center";
login_div.style.alignItems="center";

const login_but = new Image();
login_but.src='data:image/png;base64,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';

//login_div.add(login_but);

const app_div=mkdv();
app_div.pos="absolute";
app_div.w="100%";
app_div.h="100%";
app_div.bgcol="#fff";
app_div.loc(0,0);
//app_div.dis="none";

//»

///*CSS«
const CSS_STR=`
.${winid}-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.${winid}-switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.${winid}-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: ${toggle_sec_delay};
  transition: ${toggle_sec_delay};
}

.${winid}-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: ${toggle_sec_delay};
  transition: ${toggle_sec_delay};
}

input:checked + .${winid}-slider {
  background-color: #2196F3;
}

input:focus + .${winid}-slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .${winid}-slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.${winid}-slider.${winid}-round {
  border-radius: 34px;
}

.${winid}-slider.${winid}-round:before {
  border-radius: 50%;
}
`;
//const css_url = URL.createObjectURL(new Blob([CSS_STR], {type:'text/css'}));
const style_elem=mk('style');
//style_elem.src=css_url;
style_elem.innerHTML=CSS_STR;
document.head.add(style_elem);

//»*/
//HTML«
app_div.innerHTML = `
<div style="width:100%;height:100%;display: flex; flex-direction: column;">
	<div style="overflow:hidden;">
		<div id="${winid}-avatar_top_row" style="height:160px;flex-basis: 160px; flex-shrink: 0; display: flex;"></div>
	</div>

	<div style="display: flex;">

		<div id="${winid}-app_area" style="display:flex;flex-direction:column;">
			<div id="${winid}-app_area_head" style="display:flex;flex-basis:35px;"></div>
			<div id="${winid}-app_area_body" style="overflow:hidden;flex-grow:1;"></div>
		</div>

		<div style="display:flex;">
			<div id="${winid}-chat_container" style="display: flex; flex-direction: column;">
				<div id="${winid}-chat_log" style="flex-grow:1;"></div>
				<div>
					<input id="${winid}-chat_input" type="text" style="height:35px;font-size:19;width:100%;"></input>
				</div>
			</div>
		</div>

	</div>

</div>
`;

//<!--	<div id="${winid}-controls" style="flex-basis: 200px;flex-shrink:0;"></div>-->
//<!--<div id="${winid}-avatar_bot_row" style="flex-basis: 150px; flex-shrink: 0; justify-content: space-between; display: flex;"></div>-->
//»

//Main.add(login_div);
Main.add(app_div);
const input = gbid(`${winid}-chat_input`);
//log(input);
const chat_container_div=gbid(`${winid}-chat_container`);
const apparea_div = gbid(`${winid}-app_area`);
const chatlog_div = gbid(`${winid}-chat_log`);
const avatar_container_div = gbid(`${winid}-avatar_top_row`);
const app_area_head_div=gbid(`${winid}-app_area_head`);
const app_area_body_div=gbid(`${winid}-app_area_body`);
app_area_head_div.mart=-1;
apparea_div.bor="1px solid gray";

chatlog_div.overy="scroll";
chatlog_div.padl=5;
chatlog_div.style.userSelect="text";

apparea_div.dis="flex";
apparea_div.fld="column";
apparea_div.ali="stretch";
apparea_div.jsc="center";

input.placeholder="Type stuff here!";
input.bgcol="rgba(255,229,180,0.17)";
input.padl=2;
input.marb=1;


avatar_container_div.bgcol="#000";

const user_avatar=mkdv();
//»

//Funcs«

//Util«

const timestamp=()=>{return Date.now()-ms_off;};

const init_gui=()=>{//«
	chatlog_div.fs=17;
	chatlog_div.scrollTop=chatlog_div.scrollHeight;
	for(let t of tabs) make_tab_div(t);
	curtab = TABDIVS[0];
	curtab.on();
	make_own_avatar();
};//»

const add_avatar_css=(d)=>{//«
	d.w=AVATAR_W;
	d.h=AVATAR_H;
	d.dis="flex";
	d.jsc="center";
	d.ali="center";
	d.fs="24";
	d.bgcol="#ccc";
	d.mart=5;
	d.marl=2.5;
}//»
const toggle_avatars=()=>{//«
	let d = avatar_container_div.parentNode;
	if (!NUM(d.h)) {
		d.h = d.clientHeight;
		d.hold_h = d.clientHeight;
		d.h=0;
		resize();
	}
	else{
		d.h=d.hold_h;
		resize();
		d.h="";
	}
};//»
const toggle_chat=()=>{//«
	let d = chat_container_div.parentNode;
	if (d.dis==="none") d.dis="flex";
	else d.dis="none";
	resize();
}//»
const avat_row_h=()=>{//«
	if (avatar_container_div.parentNode.h==0) return 0;
	return avatar_container_div.clientHeight;
}//»

const send=(to,msg,type)=>{//«
    let m = room_sig_ref.push({from:username, msg: msg, to: to, type:type});
    m.remove();
};//» 
const connect=(to,avat)=>{//«
    return new Promise((Y,N)=>{
        new Peer(to,true,Y, avat);
    });
};//»

//»
//RTC/Peer«

const Peer=function(to,is_conn,cb,avatar){//«
	let BPS = 8000;
	let recording_timeout_ms=250;
	let recording_interval;
	let srcbuf;
	let tracks;
	const start_recording=async()=>{//«
		let msrc = new MediaSource;
		let vid = mk('video');
		vid.src = URL.createObjectURL(msrc);
		vid.oncanplay=()=>{vid.play();};
		msrc.onsourceopen=()=>{
			srcbuf = msrc.addSourceBuffer('audio/webm; codecs="opus"')
		};
		let audio_stream = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
		tracks = audio_stream.getTracks();
		let medrec = new MediaRecorder(audio_stream, {audioBitsPerSecond: BPS});
		medrec.start();
		medrec.ondataavailable = async e=>{
			channel.send(await capi.toBuf(e.data));
		};
		recording_interval = setInterval(()=>{
			medrec.requestData();
		},recording_timeout_ms);
	};//»
	avatar.end_connection=()=>{//«
		channel.close();
	};//»
	avatar.connecting = true;
	let channel;
	let cancelled = false;
	let closed = false;
	const ports={};
	let pc = new RTCPeerConnection({'iceServers':[{'urls':'stun:stun.l.google.com:19302'},{'urls':'stun:stun.services.mozilla.com'}]});
	const handle_message=e=>{//«
		if (!srcbuf){
cwarn("Dropping message, srcbuf not ready???");
			return;
		}
		srcbuf.appendBuffer(e.data);;
	}//»
	const init_channel = chan => {//«
		channel=chan;
		this.channel = channel;
		chan.binaryType="arraybuffer";
		chan.onmessage=handle_message;
		chan.onopen=e=>{
			if (!(MediaRecorder.isTypeSupported("audio/webm;codecs=opus")&&MediaSource.isTypeSupported("audio/webm;codecs=opus"))){
				cb&&cb();
				setTimeout(()=>{
					poperr("Your browser does not support the necessary audio format (audio/webm;codecs=opus)");
					chan.close();
				},25);
				return;
			}
cwarn("Channel OPEN", to);
			delete avatar.connecting;
			avatar.connected = true;
			if (cancelled) {
				setTimeout(()=>{
					chan.close();
				},25);
				return;
			}
			cb&&cb(true);
			setTimeout(()=>{
				popok("Connected to: "+to+"!");
			},25);
			if (waiters[to]) {
				waiters[to]();
				delete waiters[to];
			}
			start_recording();
		};
		chan.onclose=async e=>{
			pc.close();
			closed = true;
cwarn("Channel CLOSED",to);
			clearInterval(recording_interval);
			if (tracks){
				for (let tr of tracks) tr.stop();
			}

			delete avatar.connecting;
			delete avatar.connected;
			delete connections[to];
//			let dirobj = await fsapi.pathToNode('/iface/'+channame);
//			if (!(dirobj&&dirobj.KIDS)) return cerr("No dirobj for /iface/"+channame);
//			delete dirobj.KIDS[to];
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
	this.cancel=()=>{//«
cwarn("CONNECTION IS CANCELLED!!!",to);
		cancelled=true;
		delete connections[to];
	};//»
//	this.send=pc_send;
	this.pc=pc;
	this.name=to;
	connections[to]=this;

};//»

//»
//DOM Makers«

const add_video_to_avatar=()=>{//«

const resize=(w,h)=>{//«
    let usew, useh;
    if (h*aspect > w) {
        usew = w;
        useh = w/aspect;
    }
    else {
        useh = h;
        usew = h*aspect;
    }
//log(usew,useh);
    gl_can.width = usew;
    gl_can.height = useh;
    gl.viewport(0, 0, usew, useh)
//    if (!ifmax) {
//        main.w = usew;
//        main.h = useh;
//    }
//    tdiv.fs=0.8*useh;
//    svg.attset('width', usew);
//    svg.attset('height', useh);
//    svg.attset('viewBox', "0 0 " + usew + " " + useh);
//    for (let sp of tspan_arr) sp.attset("x",usew/2+"");
//    w = usew;
//    h = useh;
};//»
const take_picture=(cb)=>{//«
//	if (countdown_interval) {
//cwarn("Counting down");
//		return;
//	}
const text_to_blob=(text, type, cb)=>{//«
const text_to_bytes=(text, if_no_b64)=>{//«
    let chars; 
    if (!if_no_b64) chars = atob(text);
    else chars = text;
    let bytes = new Array(chars.length);
    for (let i = 0; i < chars.length; i++) bytes[i] = chars.charCodeAt(i);
    return new Uint8Array(bytes);
}//»
    return new Blob([text_to_bytes(text)], {type: type});
}//»
	let doit=()=>{//«
		let img = new Image;
//		let imgurl = gl_can.toDataURL("image/jpeg");
		let imgurl = gl_can.toDataURL("image/jpeg");
		let usew = gl_can.width;
		let useh = gl_can.height;
		img.onload = ()=>{//«
			img.width = usew;
			img.height = useh;
			let can2 = mk('canvas');
			can2.dis="none";
			can2.width=usew;
			can2.height=useh;
			user_avatar.add(can2);
			let ctx2 = can2.getContext('2d');
			ctx2.drawImage(img, 0, 0, usew, useh);
			let svgimg = new Image();
			let svgblob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
			let svgurl = URL.createObjectURL(svgblob);
			svgimg.onload = ()=>{
				svgimg.width = usew;
				svgimg.height = useh;
				ctx2.drawImage(svgimg, 0, 0, usew, useh);
				let url = can2.toDataURL("image/jpeg");
				if (cb) cb(url)
				else if (set_avatar) set_avatar(url);
			}
			svgimg.src = svgurl;
			URL.revokeObjectURL(imgurl);
		}//»
		img.src = imgurl;
	}//»
	doit();
//«
//	if (countdown_secs <= 0) return doit();
//	let secs = countdown_secs;
////	tdiv.innerHTML = secs;
////	bgdiv.op=bg_div_op;
//	countdown_interval = setInterval(()=>{
//		secs--;
////		tdiv.innerHTML = secs;
//		if (secs <= 0) {
////			bgdiv.op=0;
////			tdiv.innerHTML = "";
//			clearInterval(countdown_interval);
//			countdown_interval = null;
//			doit();
//		}
//	}, 1000);
//»
}//»
//WebGLRenderer«

const compileShader = (type, source)=>{//«
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	  console.log('compileShader failed: ' + gl.getShaderInfoLog(shader));
	}
	return shader;
};//»
const init_renderer=()=>{//«
	let buffer = gl.createBuffer();
	let USENUM = 1024;
	let w = AVATAR_W / USENUM;
	let h = AVATAR_H / USENUM;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	-1, -1,  0, h,
	+1, -1,  w, h,
	-1, +1,  0, 0,
	+1, +1,  w, 0,
	]), gl.STATIC_DRAW);

	let texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
	  gl.TEXTURE_2D, 0, gl.RGBA, USENUM, USENUM, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	vertexShader = compileShader(gl.VERTEX_SHADER,//«
	'attribute vec2 aPos;' +
	'attribute vec2 aTexCoord;' +
	'varying highp vec2 vTexCoord;' +
	'void main(void) {' +
	'  gl_Position = vec4(aPos, 0.0, 1.0);' +
	'  vTexCoord = aTexCoord;' +
	'}'
	);//»
	let fragmentShader = compileShader(gl.FRAGMENT_SHADER, frag_arr.join("\n"));
	gl_program = gl.createProgram();
	gl.attachShader(gl_program, vertexShader);
	gl.attachShader(gl_program, fragmentShader);
	gl.linkProgram(gl_program);
	if (!gl.getProgramParameter(gl_program, gl.LINK_STATUS)) {
log('program link failed: ' + gl.getProgramInfoLog(gl_program));
	}
	gl.useProgram(gl_program);

	let aPos = gl.getAttribLocation(gl_program, 'aPos');
	let aTexCoord = gl.getAttribLocation(gl_program, 'aTexCoord');
	let uSampler = gl.getUniformLocation(gl_program, 'uSampler');

	gl.enableVertexAttribArray(aPos);
	gl.enableVertexAttribArray(aTexCoord);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, gl.FALSE, 16, 0);
	gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, gl.FALSE, 16, 8);
	gl.uniform1i(uSampler, 0);
}//»
const renderTexture = ()=>{//«
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};//»
const uploadTexture = (buffer)=>{//«
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, AVATAR_W, AVATAR_H, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
};//»

//»
//«

let aspect;
const SVGNS = "http://www.w3.org/2000/svg";
let mksvg = function(tag) {return document.createElementNS(SVGNS, tag);}
let svg = mksvg("svg");
svg.attset("xmlns", SVGNS);
svg.attset('version', "1.1");
svg.attset('baseProfile', "full");

user_avatar.take_picture = take_picture;

let vid = mk('video');
vid.dis="none";
let can = mk('canvas');
can.dis="none";
let ctx = can.getContext('2d');

let gl_can = mk('canvas');
let gl = gl_can.getContext('webgl',{preserveDrawingBuffer: true});
user_avatar.innerHTML="";
user_avatar.add(gl_can);
user_avatar.canvas = gl_can;

vid.srcObject = video_stream;
vid.muted=true;

return new Promise((y,n)=>{
	vid.oncanplay=(e)=>{//«
		const render=()=>{
			ctx.drawImage(vid,0,0,AVATAR_W,AVATAR_H);
			uploadTexture(new Uint8Array(ctx.getImageData(0,0,AVATAR_W,AVATAR_H).data.buffer));
			renderTexture();
			requestAnimationFrame(render);
		};
		let vw = e.target.videoWidth;
		let vh = e.target.videoHeight;
		gl_can.width = can.width = vw;
		gl_can.height = can.height = vh;
		aspect = vw/vh;

		resize(AVATAR_W,AVATAR_H);
		init_renderer();
		requestAnimationFrame(render);
		y(true);
	};//»
	vid.play();
});


//»

}//»
const make_user_avatar=(name)=>{//«
	let d = mkdv();
	d.pos="relative";
	add_avatar_css(d);
	let nm = mkdv();
	nm.pos="absolute";
	nm.ta="center";
	nm.tcol="#333";
	nm.z=100000;
	nm.loc(0,0);
	nm.w="100%";
	nm.onmouseover=e=>{
		nm.bgcol="#fff";
		nm.tcol="#000";
	};
	nm.onmouseout=e=>{
		nm.bgcol="";
		nm.tcol="#333";
	};
	nm.innerHTML=name;
	let cd=mkdv();//«
	cd.onmouseover=()=>{
		if (d.connected) {
			cd.title = "End the call";
			cd.bgcol="#f77";
		}
		else {
			cd.title = "Make a call";
			cd.bgcol="#7f7";
		}
		cd.op=1;
	};
	cd.onmouseout=()=>{
		cd.op=0.33;
		cd.bgcol="#fff";
	};
	cd.onclick=async()=>{
		if (testing_mode){
			poperr("No testing connect");
			return;
		}
		if (d.connected) {
			if (await popyesno("Really end the call?")){
				d.end_connection&&d.end_connection();
			}
			return;
		}
		if (d.connecting) return popup("Still connecting...");
		popup("Connecting to: "+name+"...");
		await connect(name, d);
		if (Desk.CPR && Desk.CPR.ok) Desk.CPR.ok();
	};
	cd.op=0.33;
	cd.pos="absolute";
	cd.r=0;
	cd.y=0;
	cd.z=100001;
//	cd.tcol
//	cd.z=1;
	cd.bgcol="#fff";
	cd.innerHTML="\u{1f4de}";

//»
	d.add(nm);
	d.add(cd);

	avatar_container_div.add(d);
	return d;
}//»
const make_switch_row=(text, sw, tab, if_on)=>{//«
	let tr;
	let td1,td2;
	td1=mk('td');
	td2=mk('td');
	tr=mk('tr');
	tr.add(td1);
	tr.add(td2);
	td1.innerHTML = text;
	td1.padr=10;
	td2.add(sw);
	sw.nm= td1;
	tab.add(tr);
	sw.off=()=>{
//		td1.tcol="#999";;
	}
	sw.on=()=>{
//		td1.tcol="";;
	}
	if (if_on) sw.on();
	else sw.off();
};//»
const mkswitch=()=>{//«
	let dv = mksp();
	dv.marb=10;
	let lab =mk('label');
	lab.className = winid+"-switch";
	let inp = mk('input');
	inp.type="checkbox";
	inp.w=0;
	inp.h=0;
	inp.op=0;
	let sp = mksp();
	sp.classList.add(winid+"-slider");
	sp.classList.add(winid+"-round");
	lab.add(inp);
	lab.add(sp);
	dv.add(lab);
	inp.tabIndex="-1";
	dv.input = inp;
	return dv;
};//»
const make_settings_page=(main)=>{//«
	let nmdv = mkdv();
	nmdv.fs=19;
	nmdv.fw="bold";
	nmdv.innerText = `Room: '${ROOM_NAME}'`;
	nmdv.ta="center";
	nmdv.marb=10;
	main.add(nmdv);

	let tab = mk('table');
	tab.tcol="#000";
	let chatsw = mkswitch();//«
	chatsw.input.onchange=function(){
		if (this.checked)chatsw.on();
		else chatsw.off();
		setTimeout(toggle_chat,toggle_ms_delay);
	};
	make_switch_row("Hide chat", chatsw, tab, false);
//»
	let avatsw = mkswitch();//«
	avatsw.input.onchange=function(){
			if (this.checked)avatsw.on();
			else avatsw.off();
			setTimeout(toggle_avatars,toggle_ms_delay);
	};
	make_switch_row("Hide avatars", avatsw, tab, false);
//»
	let streamsw = mkswitch();//«
	streamsw.input.onchange=function(){//«
			if (this.checked){
				streamsw.on();
				streaming_interval=setInterval(()=>{
					if (user_avatar && user_avatar.take_picture) {
						user_avatar.take_picture();
					}
				}, STREAMING_MS_TIMEOUT);
			}
			else {
				streamsw.off();
				clearInterval(streaming_interval);
				streaming_interval=null;
			}
	};//»
	make_switch_row("Stream your avatar<br>(at 1 frame/sec)", streamsw, tab, false);
//»
	main.add(tab);

};//»
const make_profile_page=main=>{//«

	main.dis="flex";
	main.fld="column";
	main.ali="center";

	let tit = mksp();
	tit.fs=21;
	tit.innerText="Current public snapshot";
	public_avatar_div=mkdv();
	add_avatar_css(public_avatar_div);
	public_avatar_div.innerHTML=ADULT_UNICODE;
	public_avatar_div.fs=ADULT_UNICODE_FS;
	main.add(tit);
	main.add(public_avatar_div);
	main.add(mk('br'));
	let but = mkbut();
	but.fs=16;
	but.h=35;
	but.innerText="Update";
	but.onclick=()=>{
		if(user_avatar && user_avatar.take_picture)user_avatar.take_picture();
		else{
			popup("Cannot take a picture (must join the chat room)");
		}
	};
	main.add(but);
//log(main);
};//»
const make_tab_div=(which)=>{//«
	const being_implemented=(d,s)=>{//«
		main.dis="flex";
		main.ali="center";
		main.jsc="center";
		main.fs=21;
		d.innerHTML=s+" is being implemented";
	}//»
	const on=()=>{//«
		if (app_area_body_div.curdiv) app_area_body_div.curdiv.del();
		app_area_body_div.add(main);
		app_area_body_div.curdiv = main;
		curtab.cssoff();
		d.csson();
		curtab = d;
		resize();
	}//»
	const resize=(num)=>{//«
		if (NUM(num)) main.h=num;
		else main.h=Main.h-avat_row_h()-app_area_head_div.clientHeight-10;
	};//»
	let main = mkdv();
	let d = mkdv();

if (which=="Settings") make_settings_page(main);
else if (which=="Profile") make_profile_page(main);
else if (which=="Calls"){
	being_implemented(main,"Making video calls");
}
else {
	being_implemented(main,which);
}
//else{
//	main.innerHTML=`Cool ${which} stuff ${("<br>".repeat(100))} Done.`;
//}

	main.pad=10;//«
	main.overy="scroll";
	d.cssoff=()=>{
		d.tcol="#666";
		d.bor="1px solid #999";
		d.bgcol="#f0f0f0";
	};
	d.csson=()=>{
		d.tcol="#000";
		d.bor="1px solid transparent";
		d.bgcol="#ffffff";
		for (let d of TABDIVS)d.style.borderRadius="";
		d.style.borderTopLeftRadius="5px 5px";
		d.style.borderTopRightRadius="5px 5px";
		d.style.borderBottomLeftRadius="10px 10px";
		d.style.borderBottomRightRadius="10px 10px";
		if (d.prev) d.prev.style.borderBottomRightRadius="10px 10px";
		if (d.next) d.next.style.borderBottomLeftRadius="10px 10px";
	};
	d.dis="flex";
	d.jsc="center";
	d.maxw=200;
//	log(d);
	let nm = mkdv();
	let nm2=mkdv();
	nm.pos="relative";
	nm2.pos="absolute"
	nm2.innerText=which;
	d.fs=18;
	d.padt=5.5;
	d.onclick=on;
	d.cssoff();
	d.flg=1;
	nm.add(nm2);
	d.add(nm);
	app_area_head_div.add(d);
	nm2.loc(-nm2.clientWidth/2,0);
	d.on=on;
	d.resize=resize;
//»
//	if (which=="Profile") {
//		curtab=d;
//		d.on();
//	}
	if (TABDIVS.length){
		d.prev = TABDIVS[TABDIVS.length-1];
		d.prev.next = d;
	}
	d.iter = TABDIVS.length;
	TABDIVS.push(d);
}//»
const make_chat_entry=(s)=>{//«
let d = mkdv();
d.innerText=s;
//log(d);
//d.style.wordBreak="break-all";
//d.style.wordWrap="break-word";
//log(d);
//d.width =
chatlog_div.add(d);
chatlog_div.scrollTop=chatlog_div.scrollHeight;
};//»
const make_own_avatar=()=>{//«
	user_avatar.innerHTML=ADULT_UNICODE;
	add_avatar_css(user_avatar);
	user_avatar.fs=ADULT_UNICODE_FS;
	avatar_container_div.add(user_avatar);
}//»

//»
//Init/Load/Login«

const do_login=()=>{//«

/*
const login=()=>{//«
	return new Promise(async(y,n)=>{
		login_but.onclick=async()=>{//«
			let rv = await capi.login();
			if (getemail()) y(true);
			else {
				y();
			}
		};//»
		initdiv.set(login_but);
	});
};//»
*/

return new Promise(async(y,n)=>{
	let rv;
	initdiv.set("Checking your logged in status...");
	rv = await fetch('/_status?nameonly=1');
	let txt = await rv.text();
	if (rv.ok!==true) {
		initdiv.set(txt);
		y();
		return;
	}
	username = txt;
	initdiv.set(`Logged in as: ${username}!`);
	y(true);
});

};//»


const init_room=()=>{//«

	dbref.ref("/.info/serverTimeOffset").on('value', offset=>{
		let offsetVal = offset.val() || 0;
log("MS_OFFSET", offsetVal);
//		let serverTime = Date.now() + offsetVal;
	});

	let rv;
	room_message_ref = dbref.ref(room_message_path);
	room_message_ref.limitToLast(GET_NUM_CHATS).on('child_added',dat=>{//«
		let val=dat.val();
		let frm=val.from;
		let msg=val.msg;
		let time=val.time;
		let arr = new Date(time).toString().split(" ");
		let mon = arr[1];
		let d = arr[2].replace(/^0/,"");
		let tmarr = arr[4].split(":");

		let ampm="a";
		let hr = parseInt(tmarr[0]);
		if (hr >= 12){
			ampm = "p";
			if (hr >= 13) hr-=12;
		}
		make_chat_entry(`${frm} (${mon} ${d} @${hr}:${tmarr[1]}${ampm}): ${msg}`);
	});//»
	send_message=(v)=>{
		room_message_ref.push({from:username, msg: v, time:timestamp()});
	};

	room_sig_ref = dbref.ref(room_sig_path);
	room_sig_ref.on('child_added',dat=>{//«
		let val=dat.val();
		let frm=val.from;
		let typ=val.type;
		let msg=val.msg;
		let is_self = frm===username;
		let pc;
		if(typ=="ice"){//«
			if (is_self) return;
			if (!connections[frm]) pc = new Peer(frm, false, null, USERHASH[frm].avatar).pc;
			else pc = connections[frm].pc;
			pc.addIceCandidate(new RTCIceCandidate(JSON.parse(msg)));
			return;
		}//»
		if(typ=="offer"){//«
			if (is_self) return;
			if (!connections[frm]) pc = new Peer(frm, false, null, USERHASH[frm].avatar).pc;
			else pc = connections[frm].pc;
			let answer;
			let obj = JSON.parse(msg);
			pc.setRemoteDescription(new RTCSessionDescription(obj))
			.then(() => pc.createAnswer())
			.then(ans => {
				answer=ans;
				pc.setLocalDescription(answer)
			})
			.then(()=>{send(frm,JSON.stringify(answer),"answer");})
			.catch(e=>{
cwarn("Caught from offer");
cerr(e);
			})
			return;
		}//»
		if(typ=="answer"){//«
			if (is_self) return;
			if (!connections[frm]){
cerr("NO CONNECTION FOUND FROM: ", frm,"!!!!!!!!!!!!!!!");
				return;
			}
			connections[frm].pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg)));
			return;
		}//»
		if (val.helo){//«
			frm = val.helo;
			if (frm!==username){
console.warn("New user in", username);
				make_user_obj(frm);
				rv=room_sig_ref.push({oleh: username});
				rv.remove();
			}
		}//»
		else if (val.oleh){//«
			frm = val.oleh;
			if (frm!==username){
console.warn(`Found current user ${frm}`);
				make_user_obj(frm);
			}
	//		else{
	//console.warn("How did we get an eloh from ourself???", val);
	//		}
		}//»
		else if (val.bye){//«
			frm = val.bye;
			if (frm===username) return;
			let obj = USERHASH[frm];
			if (obj) {
				obj.kill();
				delete USERHASH[frm];
			}
			USERARR.splice(USERARR.indexOf(frm),1);
		}//»
	});//»
cwarn("Send helo: "+username);
	make_user_obj(username);
	rv = room_sig_ref.push({helo: username});
	rv.remove();
}//»
const load_firebase=()=>{//«
	return new Promise(async(y,n)=>{
		ifapi = NS.api.iface;
		if (!ifapi) {
			if (!await load_iface()) return y("Could not load the interface module!");
			ifapi = NS.api.iface;
		}
		if (!ifapi.didInit()){
			if (!(await ifapi.init())) return y("Could not initialize the realtime database!");
		}
		dbref = firebase.database();
		y(true);
	});
};//»
const load_iface=()=>{//«
    return new Promise(async(Y,N)=>{
		let rv = await fsapi.loadMod("iface.iface",{STATIC:true});
		if (!rv) return Y();
        Y(true);
    });
}; //»
const init_video=()=>{//«

return new Promise(async(y,n)=>{

	initdiv.set("Awaiting camera authorization...");
	video_stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
	initdiv.op=0;
	if (!(video_stream && video_stream.getTracks)){
		initdiv.set("Camera access denied!");
		y();
		return;
	}
	video_tracks = video_stream.getTracks();
	y(true);
});

};//»

//»
//User«

const make_user_obj=name=>{//«

let avat;
if (name!==username) avat = make_user_avatar(name);
let obj={};
let avatar_ref = dbref.ref(user_path+"/"+name+"/avatar");
let rv;
if (name===username){//«
	set_avatar=val=>{
		rv=avatar_ref.set(val);
	};
	end_session=()=>{
		if (room_sig_ref){
			rv=room_sig_ref.push({bye: username});
			rv.remove();
		}
	}
}//»

avatar_ref.on('value', dat => {//«
	let val = dat.val();
	if (!val) return;
	let img = new Image();
	img.src=val;
	if (name==username){
		public_avatar_div.innerHTML="";
		public_avatar_div.add(img);
	}
	else{
//		avat.innerHTML="";
		if (avat.imdiv) avat.imdiv.del();
		let imdiv = mkdv();
		imdiv.pos="absolute";
		imdiv.loc(0,0);
		imdiv.z=0;
		imdiv.add(img);
		avat.add(imdiv);
		avat.imdiv = imdiv;
	}
})//»

/*
status_ref.on('child_added', dat => {//«
	let val = dat.val();
	make_chat_entry(`${name}: ${val}`);
})//»
*/

obj.avatar = avat;
obj.kill=()=>{//«
	avatar_ref.off();
	if (avat&&avat.end_connection) avat.end_connection();
	if (avat)avat.del();
}//»
USERHASH[name]=obj;
USERARR.push(name);

};//»
const get_public_avatar=()=>{//«

return new Promise(async(y,n)=>{
	let rv;
	let avatpath = user_path+"/"+username+"/avatar";
	rv = await dbref.ref(avatpath).once('value')
	let avat_val;
	if (rv && rv.val) avat_val = rv.val();
	if (avat_val&&avat_val.match&&avat_val.match(/^data:image/)){
		public_avatar_div.innerHTML="";
		let img = new Image();
		img.src=avat_val;
		public_avatar_div.add(img);
		y(true);
		return;
	}
	let dv = mkdv();
	dv.dis="flex";
	dv.fld="column";
	dv.jsc="center";
	dv.ali="center";
	let but = mkbut();
	but.mart=10;
	but.pad=5;
	but.fs=19;
	but.innerHTML="Set your public avatar";
	dv.add(user_avatar.canvas);
	user_avatar.innerHTML = ADULT_UNICODE;
	dv.add(but);
	but.onclick=()=>{
		user_avatar.take_picture(async(url)=>{//«
			await dbref.ref(avatpath).set(url, err=>{
				if (err){
cerr(err);
					initdiv.set("There was an error setting your public avatar!");
					y();
					return;
				}
				initdiv.op=0;
				user_avatar.innerHTML="";
				user_avatar.add(user_avatar.canvas);
				public_avatar_div.innerHTML="";
				let img = new Image();
				img.src=url;
				public_avatar_div.add(img);
				y(true);
			})
		});//»
	}
	initdiv.set(dv);
});

}//»

//»

const init= async()=>{//«

let rv;

rv = await fetch("https://ifconfig.me/ip")
if (!(rv && rv.ok)) {
	initdiv.set("Could not fetch external ip!");
	return;
}
ip_addr = await rv.text();
log(`IP: ${ip_addr}`);
//return cberr("Could not get ip address");
//cbok(await rv.text());
/*
rv = await fetch('/_timestamp');
if (!(rv&&rv.status==200)){
	initdiv.set("Could not fetch server timestamp!");
	return;
}
rv = await rv.text();
ms_off = Date.now()-parseInt(rv);
*/
ms_off = 0;

init_gui();
//setTimeout(resize,1000);
if (testing_mode) {
	overdiv.del();
setTimeout(()=>{
	make_chat_entry(`${username||"You"}:\xa0This is the thing in the place of the guy, in which there is a thing that is cool and such and such and such.`);
	make_chat_entry(`${username||"You"}:\xa0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx`);
	resize();	
},100);

//	TABDIVS[2].click();
	return;
}
rv = await load_firebase();
if (rv!==true) return poperr(rv);

//Get latest chats and insert them into the log

//Get current users and load their avatars

rv = await init_video();
if (rv!==true) return;
rv = await add_video_to_avatar();
if (rv!==true) {
	initdiv.set("There was a problem initializing the video");
	return;
}

username = "Whatever";
//rv = await do_login();
//if (rv!==true) return;

rv = await get_public_avatar();
if (rv!==true) return;
init_room();
overdiv.del();
resize();	

};//»

//»

//Obj/CB«
const resize = ()=>{

	if (chat_container_div.parentNode.dis=="none") {
		apparea_div.w = Main.clientWidth-2;
	}
	else {
		apparea_div.w = Main.clientWidth/2-2;
		chat_container_div.w = Main.clientWidth/2-2;
	}
	
	chat_container_div.flg=1;
	chatlog_div.h=Main.h-avat_row_h()-input.clientHeight-5;
	curtab.resize();
	chatlog_div.scrollTop=chatlog_div.scrollHeight;

};
this.onresize=resize;


this.onkill=()=>{//«
	style_elem.del();
	if (video_tracks){
		for (let tr of video_tracks) tr.stop();
	}
	if (streaming_interval) clearInterval(streaming_interval);
	end_session&&end_session();
	room_sig_ref&&room_sig_ref.off();
	room_message_ref&&room_message_ref.off();
	for (let nm of USERARR){
		let obj = USERHASH[nm];
		if (obj) {
cwarn("Killing: "+nm);
			obj.kill();
		}
		else cwarn("No user object for: "+nm+"???");
	}
};//»

this.onkeydown=(e,k)=>{//«

let marr;
//log(k);
	if (k=="ENTER_"){//«
		if (act()==input){
			if (testing_mode){}
			else if (!send_message) return;
			let v = input.value.regstr();
			input.value="";
			if (!v.length) return;
			if (testing_mode) make_chat_entry(`${username||"You"}: ${v}`);
			else send_message(v);
		}
	}//»
	else if(k=="SPACE_A"){if(user_avatar && user_avatar.take_picture)user_avatar.take_picture();}
	else if (k=="a_A")toggle_avatars();
	else if (k=="c_CAS")toggle_chat();
	else if (marr=k.match(/^([1-9])_CA$/)){//«
		let d = TABDIVS[marr[1].pi()-1];
		if (d) d.on();
	}//»


};//»

//»

//Init«


style_elem.onload=init;
style_elem.onerror=(e)=>{
cerr(e);
};



//»


}


/*
//About«
const MD="&mdash;";
const ABOUT_STR=`
<h3>Background</h3>
<p> The main point of this is not as a  standalone application, but rather as a
reasonable entrypoint into the wild, untamed landscape that currently goes by
the name, "Linux on the Web."

<p> As a developer, I am as interested in investigating focused ideas in
cutting edge, domain-specific research${MD}which Linux- (and Unix-) based tools
excel at${MD}as well as in implementing broad concepts of everyday accessibility${MD}which
the web platform excels at.

<p> All true innovation arises out of necessity${MD}particularly the necessity of
avoiding pain. In the world of software development, it can be quite painful for
the self-motivated developer to get constantly hung up in the logic of OPIs (Other 
People's Interfaces).

<p> There used to be a time when the mode of creation of a given piece of
software and the mode of its distribution inhabited vastly different realms.
That is not so much the case anymore, as the web platform has taken huge leaps
forward since HTML5 and ECMAScript 6 came onto the scene in the early-to-mid
2010's.

<p>Hardly a month goes by when our current browser versions are being replaced
by the next major version. Plugins are nearly extinct since the built-in APIs
are so numerous and so efficient with resources.

<h3>"Hello" World!</h3>

<p>The world is full of snake-oil salesmen${MD}especially in high tech
innovation centers like Silicon Valley. Many of them are able to do quite well
for themselves, materially speaking, but the question of the quality and
durability of their products is a different matter entirely.


`;
//»
const make_about_page=main=>{//«
main.fs=17;
main.innerHTML=ABOUT_STR;
};//»
//else if (which=="About") make_about_page(main);
*/



