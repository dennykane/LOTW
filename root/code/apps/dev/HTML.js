
export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//Var«

const BADTAGS = ["SCRIPT","IFRAME"];

//»

//DOM«

Main.over="auto";
Main.bgcol="#fff";
Main.style.userSelect="text";

//»

//Funcs«

const init=()=>{//«
}//»

//»

//OBJ/CB«

this.onappinit=()=>{};

this.onloadfile=bytes=>{//«
	let text = Core.api.bytesToStr(bytes);
	let parser = new DOMParser();
	let doc = parser.parseFromString(text, "text/html");
	let tot=0;
	for (let tag of BADTAGS){
		let arr = Array.from(doc.body.getElementsByTagName(tag));
		let iter=0;
		while (arr.length) {
			tot++;
			let node = arr.shift();
//log(node);
			node.parentNode.removeChild(node);
		}
	}
	Main.innerHTML = doc.body.innerHTML;
	Win.status_bar.innerHTML = `${tot} nodes deleted`;
};//»

this.onkeydown = function(e,s) {//«
}//»
this.onkeyup=(e)=>{//«
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

