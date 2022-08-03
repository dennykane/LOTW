


export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

const fs = NS.api.fs;

//»
//Var«

let oversects, methsects;
let cursect;
const SECTS=[];

//»
//DOM«

Main.fs=24;
Main.tabIndex="-1";
Main.pad=5;
Main.overy="scroll";
Main.bgcol="#000";
Main.tcol="#CCC";

//»

//Var«

//»

//Funcs«


const stat = s =>{//«
	if (!s) s = "";
	Win.status_bar.innerHTML=`<b>${s}</b>`;
};//»

const get_sects=(kids, header)=>{//«
let sects=[];
let have_head=false;
let sect;
for (let k of kids){
	if (k.tagName===header) {
		if (sect) {
			sect.add(mk('hr'));
			sects.push(sect);
		}
		sect = mkdv();
		sect.dataset.type="section";
		let s = mksp();
		s.dataset.type="head";
		s.innerHTML = k.innerHTML;
		sect.add(s);
	}
	else if (sect) {
		let s = mkdv();
//		s.innerHTML = k.childNodes[1].innerHTML;
//log(k.childNodes[1]);

		let head = Array.from(k.childNodes[1].childNodes);
		let str='';
		for (let e of head) str+=(e.innerText||e.textContent)+"\xa0\xa0";
//log(head.childNodes);
//		s.innerText = head.childNodes[1].innerText;
		s.innerText = str;
		sect.add(s);
//sect.add(k.childNodes[1]);
		k.dis="none";
		k.tabIndex="-1";
		SECTS.push(k);
		k.is_section = true;
		sect.add(k);
		k.removeChild(k.childNodes[1]);
//		log(k.childNodes[1]);
	}
}
if (sect) {
	sect.add(mk('hr'));
	sects.push(sect);
//	SECTS.push(sect);
}
return sects;
};//»
const init = async(arg)=>{//«

	let rv = await fs.readHtml5File("/home/me/reddit.html");
	let parser = new DOMParser();
	let doc = parser.parseFromString(rv, "text/html");
	let contkids = doc.getElementsByClassName("contents")[0].childNodes;

//	oversects = get_sects(Array.from(contkids[1].childNodes), "H3");
	methsects = get_sects(Array.from(contkids[2].childNodes), "H2");

//log(methsects);
/*
section
span(header)
(.description
	.md)?

.endpoint
	.links
	h3
	(.uri-variants)?
	.info


*/
let h1 = mk('h1');
h1.innerHTML="Reddit API";
Main.add(h1);
/*
let h2 = mk('h2');
h2.innerHTML="Overview";
Main.add(h2);
for (let s of oversects) {
	Main.add(s);
}
*/

//let h2 = mk('h2');
//h2.innerHTML="Methods";
//Main.add(h2);
//Main.add(mk('hr'),mk('hr'));
for (let s of methsects) {
	Main.add(s);
}
//	log(oversects);
//	let meths = contkids[2];

//	Main.add(meths);
//	log(meths);




//log(over);
//log(over,meths);

//Main.add(contents);
//Main.innerHTML=contents;
//log(contents);

//log(doc);

/*
	let xpath="//grid-poker/div/*[1]/ion-grid/ion-row/ion-col";
	let evaluator = new XPathEvaluator();
	let result = evaluator.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

if (!result.snapshotLength) cwarn(`Nothing found for XPath:  ${xpath}`);

for (let i=0; i < result.snapshotLength; i++){
log(i, result.snapshotItem(i));
}
*/
//setTimeout(()=>{
//oversects[0].focus();
//log(oversects[0]);
//log(document.activeElement);
//},100);
//Main.focus();

}//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = async(e,s)=>{//«
let act=document.activeElement;

if (s=="TAB_"||s=="TAB_S"){//«
    e.preventDefault();
	let arr = SECTS.slice();
//log(arr);
	if (s=="TAB_S") arr = arr.reverse();
    if (!Main.contains(act)) {
//log(arr[0]);
		arr[0].dis="";
		arr[0].focus();
		arr[0].scrollIntoViewIfNeeded();
		cursect = arr[0];
        return;
    }
//log("HI");
	cursect.blur();
	cursect.dis="none";
	let ind = arr.indexOf(act);
	if (ind < 0){
cerr("ind < 0 after TAB WUTTTT???");
		return;
	}
	ind++;
//log(ind);
	if (ind >= arr.length) ind = 0;
//log(arr[ind]);
	arr[ind].dis="";
	arr[ind].focus();
	arr[ind].scrollIntoViewIfNeeded();
	cursect = arr[ind];
	return;
}//»
if (s=="ENTER_"){
if (!cursect) return;
log(cursect.childNodes);
/*
.endpoint
	.links
	h3
	(.uri-variants)?
	.info
*/
//if (!cursect)
/*
let kid1 = cursect.childNodes[1];
if (!kid1.is_section){
cerr("kid1.is_section???");
return;
}
if (kid1.dis=="none") kid1.dis="";
else kid1.dis="none";
//log(kid1);
*/

return;
}

}//»
this.onkeypress=e=>{//«

};//»
this.onkill = async()=>{//«
}//»
this.onresize = ()=>{//«
}//»
this.onfocus=()=>{//«
}//»
this.onblur=()=>{//«
}//»
this.onescape = ()=>{//«

};//»

//»

}









