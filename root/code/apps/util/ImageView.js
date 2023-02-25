
export const app = function(arg) {

//Var«

const {Core, Main, NS}=arg;
const {fs}=NS.api;

const{log,cwarn,cerr,globals}=Core;
const{util}=globals;
const{make}=util;
const topwin = Main.top;
const statbar = topwin.status_bar;
const lines = [];

const winid = topwin.id;

let did_load = false;
let kids;
let iter;
let tot;
let path;

//»

//DOM«
Main.over="auto";
let textarea = make('textarea');
textarea._noinput = true;
textarea.width = 1;
textarea.height = 1;
textarea.style.opacity = 0;
textarea.onpaste=e=>{
	let file = e.clipboardData.files[ 0 ];
	if (!file) return;
	log(file);
	let reader = new FileReader();
	reader.onload = function (ev) {
		load_bytes(new Uint8Array(ev.target.result));
	}; 
	reader.readAsArrayBuffer(file);
}

let areadiv = make('div');
areadiv.pos="absolute";
areadiv.loc(0,0);
areadiv.z=-1;
areadiv.add(textarea);
//Main.tcol="black";
Main.bgcol="black";
Main.add(areadiv);

//»

//Funcs«

const setimg=()=>{
    Main.innerHTML="";
    let img = new Image;
    Main.add(img);
    let nm = kids[iter];
    let url = Core.fs_url(`${path}/${nm}`);
    topwin.title=nm;
    img.src=url;
};
const next=()=>{
    iter++;
    if (iter == tot) iter=0;
    setimg();
};
const prev=()=>{
    iter--;
    if (iter<0) iter = tot-1;
    setimg();
};
const getkids=async(patharg)=>{
    let arr = patharg.split("/");
    let name = arr.pop();
    path = arr.join("/");
    let dir = await fs.pathToNode(path);
    let exts=["jpg","gif","png","webp"];
    kids = dir.KIDS._keys.filter(val=>exts.includes(val.split(".").pop().toLowerCase())).sort();
    tot = kids.length;
    iter = kids.indexOf(name)
}
const load_file=path=>{
	let img = new Image;
	img.src = Core.fs_url(path);
	Main.add(img);
	getkids(path);
};
const load_bytes=bytes=>{
	if (did_load){
cwarn("Already loaded!");
		return;
	}
	did_load=true;
	let blob = new Blob([bytes]);
	let url = URL.createObjectURL(blob);
	let img = new Image;
	img.src = url;
	Main.add(img);
};

//»

//CBs«

this.onfocus=()=>{
	textarea.focus();
};
this.onblur=()=>{
	textarea.blur();
};

this.onresize=()=>{
}

this.onkill=()=>{
};

this.onappinit=(arg)=>{
    load_file(arg.file);
};
this.onloadfile=load_bytes;;

this.onkeydown=(e,k)=>{
    if (k=="LEFT_") prev();
    else if (k=="RIGHT_") next();
};
setTimeout(()=>{
	textarea.focus();
},0);

//»

}
