/*«
<!--
Copyright 2018 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<!DOCTYPE html>
<h1>Simple webm wasm demo</h1>
<button id="go">Go</button>
<script>

  document.all.go.onclick = ev => {
    ev.target.remove();
    init();
  };
</script>
»*/

export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;


//»

//Var«

let killed;
let worker;
Main.over="auto";

const width = 512;
const height = 512;
const framerate = 30;
const bitrate = 200;
const canvas = make("canvas");
[canvas.width, canvas.height] = [width, height];
const ctx = canvas.getContext("2d");
let video;
let recording = false;
let did_init=false;

//»

//Funcs«


  // Returns the next <name> event of `target`.
const next=()=>{//«
	return new Promise(resolve => {
		worker.addEventListener("message", resolve, { once: true });
	});
}//»

const start=async()=>{//«
	if (recording){
cerr("RECORDING!!!");
return;
	}
	recording = true;
	killed = false;
	if (video) {
		video.del();
		video = null;
	}
	video = make("video");
	video.muted = true;
	video.autoplay = true;
	video.loop = true;
	video.controls = true;
	Main.add(video);
	worker.postMessage({ params: true, timebaseDen: framerate, width, height, bitrate });
	const gradient=ctx.createLinearGradient((1 / 4)* width,0,(3 / 4)* width,0);
	gradient.addColorStop(0, "#000");
	gradient.addColorStop(1, "#fff");
	const maxFrames = 0.5 * framerate;
	for (let i = 0; i < maxFrames; i++) {
if (killed){
cwarn("ISKILLED!");
return;
}
	  ctx.fillStyle = `hsl(${(i * 360) / maxFrames}, 100%, 50%)`;
	  ctx.fillRect(0, 0, width, height);
	  ctx.fillStyle = gradient;
	  ctx.fillRect((1 / 4) * width, (1 / 4) * height, width / 2, height / 2);
	  const imageData = ctx.getImageData(0, 0, width, height);
	  worker.postMessage(imageData.data.buffer, [imageData.data.buffer]);
	}
	worker.postMessage(null);
	const webm = (await next()).data;
	const blob = new Blob([webm], { type: "video/webm" });
	const url = URL.createObjectURL(blob);

	video.src = url;
	video.play();
	recording = false;

};//»

const init=async()=>{//«
	worker = new Worker("/root/code/mods/av/webm/webm-worker.js",{type:'module'});
	let rv = await next();
	if (rv.data==="OK!") {
		did_init = true;
cwarn("DIDINIT");
	}
}//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = (e,s)=>{//«
if (!did_init) return cwarn("DID NOT INIT");
	if (s=="s_"){
		start();
	}
	else if (s=="k_"){
log("KILL");
		killed = true;
		worker.postMessage("kill");
//		if(video){video.del();video=null;}
	}
}//»
this.onkeypress=e=>{//«
};//»
this.onkill = function() {//«
worker.terminate();
}//»
this.onresize = function() {//«
}//»
this.onfocus=()=>{//«
}//»
this.onblur=()=>{//«
}//»

//»

}

