
/* 
Noisecraft is courtesy of https://github.com/maximecb/noisecraft
Everything in this file is my handiwork
Everything under /root/code/mods/av/noisecraft/ is mostly the same 
as the files in: https://github.com/maximecb/noisecraft/tree/main/public/
*/

import { anyInputActive } from '/root/code/mods/av/noisecraft/utils.js';
import { Dialog, errorDialog } from '/root/code/mods/av/noisecraft/dialog.js';
import { Model, Paste, Play, Stop , MoveNodes} from '/root/code/mods/av/noisecraft/model.js';
import { Editor } from '/root/code/mods/av/noisecraft/editor.js';
import { AudioView } from '/root/code/mods/av/noisecraft/audioview.js';

const FILE_EXT = "ncft";

export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;
const WDG = NS.api.widgets;
const FS = NS.api.fs;

//»

//DOM«

let model, editor, audioView;

const CUR = mkdv();
CUR.pos="absolute";
//CUR.loc(0,0);
CUR.fs=75;
//╋
CUR.innerHTML = "╋";
//CUR.z=10000000;
CUR.z=-1;
CUR.pad=0;
CUR.tcol="#c00";
//CUR.op=1;
CUR.op=0;
Main.add(CUR);
Main.addEventListener('mouseleave',()=>{
	if (editor.edge) remove_edge();
},false);
const cur_half_w = CUR.clientWidth/2;
const cur_half_h = CUR.clientHeight/2;
const cur_min_x = -cur_half_w;
const cur_min_y = -cur_half_h;

Main.bgcol="";
Main.tcol="#fff";
Main.fs=16;

const layout_div = mkdv();
layout_div.dis="flex";
layout_div.style.flexFlow="column";
layout_div.h="100%";
layout_div.w="100%";

Main.add(layout_div);
const editor_div = mkdv();
editor_div.style.flexGrow=1;
editor_div.over="scroll";
editor_div.pos="relative";

layout_div.add(editor_div);

const graph_div = mkdv();
graph_div.pos="absolute";
graph_div.loc(0,0);

const docopy=(e)=>{//«
	if (!focused) return;
	if (!editor.selected.length) return;
	let data = JSON.stringify(model.copy(editor.selected));
	e.clipboardData.setData('text/plain', data);
	e.preventDefault();
};
//»
const docut=(e)=>{//«
	if (!focused) return;
	if (!editor.selected.length) return;
	let data = JSON.stringify(model.copy(editor.selected));
	e.clipboardData.setData('text/plain', data);
	e.preventDefault();
	editor.deleteSelected();
};
//»
const dopaste=(e)=>{//«
	if (!focused) return;
    if (anyInputActive()) return;
	let clipData = e.clipboardData.getData('text/plain');
	try{
		let nodeData = JSON.parse(clipData)
		model.update(new Paste(nodeData, editor_div.scrollLeft, editor_div.scrollTop));
		e.preventDefault();
	}

	catch (err){
		console.log(err);
	}
};
//»

editor_div.add(graph_div);

const graph_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
graph_svg.setAttribute("version","1.1");
graph_svg.style.zIndex=-2;
graph_svg.style.position="absolute";
graph_svg.style.top=0;
graph_svg.style.left=0;
graph_svg.style.backgroundColor="#222";

editor_div.add(graph_svg);

//»

//Var«

const ARROWS=[//«
	"RIGHT_",
	"LEFT_",
	"UP_",
	"DOWN_",
	"RIGHT_C",
	"LEFT_C",
	"UP_C",
	"DOWN_C",
	"RIGHT_CA",
	"LEFT_CA",
	"HOME_",
	"END_"
];//»
const NUMS=["0_","1_","2_","3_","4_","5_","6_","7_","8_","9_" ];

let last_selected;
let focused = false;

//»

//Funcs«

const remove_edge=()=>{
	editor.svg.removeChild(editor.edge.line);
	editor.edge = null;
};
const deselect=()=>{last_selected=editor.selected;editor.deselect();};
const curcen=()=>{return{x:CUR.x+cur_half_w+editor_div.scrollLeft,y:CUR.y+cur_half_h+editor_div.scrollTop};};
const remove_select_div=()=>{//«
	editor.startMousePos=null;
	if (editor.selectDiv){
		editor_div.removeChild(editor.selectDiv);
		editor.selectDiv = null;
	}
};//»
const toggle_cursor=()=>{//«
	if (CUR.op==1) {
		remove_select_div();
		CUR.op=0;
		CUR.z=-1;
	}
	else {
		CUR.op=1;
		CUR.z=3;
	}
}//»
const dosave = async(force_popup)=>{//«
	let path = (Win.fullpath());
	let str = model.serialize();
	if (path&&!force_popup){
		await FS.saveFsByPath(path, str);
		await WDG.popok(`Saved: ${str.length} bytes!`);
	}
	else{
		let icn = await Desk.make_new_file(str, FILE_EXT);
		Win.title = icn.name; 
		icn.win = Win;
		Win.icon = icn;
		Win.name = Win.title;
		Win.path = globals.desk_path;
		Win.ext = FILE_EXT;
	}

};//»
const init=async()=>{//«

	model = new Model();
	model.__poperr=WDG.poperr;

	editor = new Editor(model, editor_div, graph_div, graph_svg, Main);
	audioView = new AudioView(model);

	document.addEventListener('copy',docopy,false);
	document.addEventListener('cut',docut,false);
	document.addEventListener('paste',dopaste,false);

	CUR.loc(editor_div.clientWidth/2 - cur_half_w, editor_div.clientHeight/2 - cur_half_h);

};//»

//»

//OBJ/CB«

this.onappinit=()=>{//«

	Win.title = "Noisecraft";
	init();
	model.new();

};//»
this.onloadfile=bytes=>{//«
	init();
    try{
//		setTimeout(()=>{
		model.deserialize(Core.api.bytesToStr(bytes));
//		},0);
    }
    catch (e){
        console.log(e.stack);
        model.new();
		WDG.poperr("The file could not be loaded. See the console for error stack!");
    }
};//»
this.onkeydown = async function(e,s) {//«

if (Main.dialog) return;
if (s=="ENTER_"){//«
	if (editor.startMousePos){
		remove_select_div();
		return true;
	}
	if (CUR.op!=1) return;
	let r = CUR.gbcr();
	let arr = document.elementsFromPoint(r.left+r.width/2, r.top+r.height/2);

	let node = arr[1].__node;
	if (!node) {
		editor.startMousePos = curcen();
		deselect();
		return;
	}
	if (editor.selected.length==1 && editor.selected[0] === node.nodeId){
		node.ondblclick();
	}
	else editor.selectNodes([node.nodeId]);
}//»
else if (s=="ENTER_C"){//«
	if (CUR.op!=1) return;
	let r = CUR.gbcr();
	let arr = document.elementsFromPoint(r.left+r.width/2, r.top+r.height/2);

	let node = arr[1].__node;
	if (!node) return;
	let a = editor.selected.slice();
	if (a.includes(node.nodeId)) a.splice(a.indexOf(node.nodeId),1);
	else a.push(node.nodeId);
	a = a.sort().uniq();
	editor.selectNodes(a);
}//»
else if (s==="SPACE_"){//«
	e.preventDefault();
	if (model.playing){
		model.update(new Stop());
	}
	else{
		model.update(new Play());
	}
}//»
else if (s=="x_")toggle_cursor();
else if (s=="s_C")dosave();
else if (s=="c_CAS") dosave(true);
else if(s=="a_C"){deselect();editor.selectAll();}
else if (s=="BACK_"){//«
	if (editor.selected.length) {
		if (await WDG.popyesno(`Delete ${editor.selected.length} nodes?`)) editor.deleteSelected();
	}
}//»
else if (ARROWS.includes(s)){//«
	e.preventDefault();
	let dx=0, dy=0;
	let base, small, tiny;
	if (CUR.op==1)base = 25;
	else if (editor.selected.length) base = 50;
	else base = 100;
	small = base/5;
	tiny = base/25;
	if (s=="RIGHT_") dx = base;
	else if (s=="LEFT_") dx = -base;
	else if (s=="UP_") dy = -base;
	else if (s=="DOWN_") dy = base;
	else if (s=="RIGHT_C") dx = small;
	else if (s=="LEFT_C") dx = -small;
	else if (s=="UP_C") dy = -small;
	else if (s=="DOWN_C") dy = small;
	else if (s=="RIGHT_CA") dx = tiny;
	else if (s=="LEFT_CA") dx = -tiny;
	else if (s=="HOME_") dy = -tiny;
	else if (s=="END_") dy = tiny;
	if (CUR.op==1){
//	else if (CUR.op==1){
		CUR.x+=dx;
		CUR.y+=dy;
//		let r = CUR.gbcr();
		let maxx = editor_div.clientWidth - cur_half_w - 2;
		let maxy = editor_div.clientHeight - cur_half_h - 5;
		if (CUR.x < cur_min_x) CUR.x=cur_min_x;
		else if (CUR.x > maxx) CUR.x = maxx;
		if (CUR.y < cur_min_y) CUR.y=cur_min_y;
		else if (CUR.y > maxy)CUR.y = maxy;
		if (editor.startMousePos){
			editor.updateSelect(editor.startMousePos, curcen());
		}
	}
	else if (editor.selected.length){
		for (let nodeId of editor.selected){
			let node = (editor.nodes.get(nodeId));
			node.move(dx,dy);
		}
		editor.resize();	
		model.update(new MoveNodes(
			editor.selected,
			dx,
			dy
		));
	}
	else{
		editor_div.scrollTop+=dy;
		editor_div.scrollLeft+=dx;

	}
}//»
else if (NUMS.includes(s)){//«

	if (CUR.op!=1) return;

	if (s=="0_") s="5_";
	let x,y;	
	if (s=="1_"||s=="4_"||s=="7_") x=-cur_half_w;
	else if (s=="2_"||s=="5_"||s=="8_") x=editor_div.clientWidth/2 - cur_half_w;
	else if (s=="3_"||s=="6_"||s=="9_") x=editor_div.clientWidth-cur_half_w-2;
	if (s=="1_"||s=="2_"||s=="3_") y=-cur_half_h;
	else if (s=="4_"||s=="5_"||s=="6_") y=editor_div.clientHeight/2 - cur_half_h;
	else if (s=="7_"||s=="8_"||s=="9_") y=editor_div.clientHeight - cur_half_h-5;
	CUR.loc(x,y);
	if (editor.startMousePos){
		editor.updateSelect(editor.startMousePos, curcen());
	}
}//»

}//»
this.onkeypress=e=>{//«

let k = e.key;
if (Main.dialog) {//«
	if (Main.dialog.__type=="CREATE"){
		let num = e.charCode;
		if (num >= 65 && num <= 90) num-=39;
		else if (num>=97 && num <= 122) num-=97;
		else return;
		let which = Main.dialog.__arr[num];
		if(which&&which.onclick){
			if (editor.selected.length > 0) editor.deselect();
			Main.dialog.__arr[num].click();
			editor.selectNodes([graph_div.lastChild.nodeId]);
		}
	}
}//»
else if (k=="c"){//«
	deselect();
	editor.createNodeDialog({x:editor_div.scrollLeft, y:editor_div.scrollTop});
}//»
else if (k=="`"){//«
	if (!editor.selected.length){
		if (last_selected){
			editor.selectNodes(last_selected);
		}
	}
	else deselect();
	
}//»

};//»
this.onkill = function() {//«

focused = false;
document.removeEventListener('copy',docopy,false);
document.removeEventListener('cut',docut,false);
document.removeEventListener('paste',dopaste,false);

if (model.playing) model.update(new Stop());

}//»
this.onescape = ()=>{//«

if (Main.dialog){
	Main.dialog.close();
	Main.dialog = null;
	return true;
}
if(editor.edge){
	remove_edge();
	return true;
}
if (editor.startMousePos){
	remove_select_div();
	return true;
}
if (CUR.op==1){
	toggle_cursor();
	return true;
}
if (editor.selected.length > 0){
	deselect();
	return true;
}
return false;

};//»
this.onresize = function() {//«

editor.resize();

}//»
this.onfocus=()=>{//«

focused = true;

}//»
this.onblur=()=>{//«

focused = false;

}//»
this.get_context=()=>{//«
	return [
		`About Noisecraft`, async()=>{
			WDG.popok('Courtesy of: <a href="https://github.com/maximecb/noisecraft">This Github repo</a>');
		}
	]
}//»

//»


}

