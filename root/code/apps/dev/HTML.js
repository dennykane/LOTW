
export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//Var«

//»
Main.bgcol="#fff";
//let iframe = mk('iframe');
//iframe.w="100%";
//iframe.h="100%";
//iframe.bor="none";
//Main.add(iframe);

//Funcs«


const init=()=>{//«
}//»

//»

//OBJ/CB«

this.onappinit=()=>{};

this.onloadfile=bytes=>{
	let text = Core.api.bytesToStr(bytes);
	let parser = new DOMParser();
	let doc = parser.parseFromString(text, "text/html");
	let nodes = doc.body.children;
	for (let n of nodes){
		if(n.tagName.match(/^script$/i)) n.innerHTML="";
	}
	Main.innerHTML = doc.body.innerHTML;
};

this.onkeydown = function(e,s) {//«
	if (s==="SPACE_") vol(1);
}//»
this.onkeyup=(e)=>{//«
	if (e.code=="Space") vol(0);
};//»
this.onkeypress=e=>{//«
};//»
this.onkill = function() {//«
}//»
this.onresize = function() {//«
}//»
this.onfocus=()=>{//«
}//»

this.onblur=()=>{//«
}//»

//»

}

