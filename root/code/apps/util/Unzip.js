
export const app = function(arg){

//Imports«
const {Core, Main, NS}=arg;
const{log,cwarn,cerr,globals, Desk}=Core;

const main = Main;
const topwin = main.top;
const {mk,mkdv,mksp}=Core.api;
const {fs,FSPREF,FSLET,FSBRANCH}=globals;
const fsapi = NS.api.fs;
let cur_dir;
//»
//Var«
let zip;
let but;
let no_prompt = false;
//»
//DOM«
let contdiv=mkdv();
contdiv.overy="scroll";
contdiv.bgcol="#000";
contdiv.tcol="#ccc";
contdiv.pad=10;
main.bgcol="#333";
main.add(contdiv);
main.tcol="#ccc";
main.fs="1.25em";
main.dis="flex";
main.style.cssText+=`
justify-content:center;
`;
//main.padt=15;

//»

//Funcs«

const bytes_to_str=(size)=>{//«
	const KB = 1024;
	const MB = KB*1024;
	const GB = MB*1024;
	if (size >= GB) return (size/GB).toFixed(2)+"\xa0GB";
	if (size >= MB) return (size/MB).toFixed(2)+"\xa0MB";
	if (size >= KB) return (size/KB).toFixed(2)+"\xa0KB";
	return size+"\xa0B";
};//»
const logit=(str,if_error)=>{//«
let d = mkdv();
if (if_error) {
	d.tcol="red";
	str=`Error: ${str}<br>Aborting!`;
}
d.innerHTML=str;
contdiv.add(d);
};//»


const doents=(ents, base_path,opts={})=>{//«
let logger=opts.logger;
if (!logger) logger=()=>{}
let cb=opts.cb;
let is_root = opts.isRoot;
logger("Extracting into: "+base_path);
let iter = -1;
async function doent(){//«
	iter++;
	if (iter==ents.length) {
		logger("Done");
		contdiv.scrollTop = contdiv.scrollHeight;
		cb&&cb();
		return;
	}
	let ent = ents[iter];
	let parr = ent.filename.replace(/\/$/,"").split("/");
	if (!parr[0]) parr.shift();
	let fname = parr.pop();
	let path = parr.join("/");
	let fullpath
	if (path) fullpath = base_path+"/"+path;
	else fullpath = base_path;
	let savepath=fullpath+"/"+fname;
	if (ent.directory) {
		if (await fsapi.pathToNode(savepath)) return logger("Folder path exists: "+savepath,true);
		fs.mk_fs_dir(fullpath, fname, null, (ret, err)=>{
			if (!ret) return logger(err,true)
			logger(ent.filename)
			contdiv.scrollTop = contdiv.scrollHeight;
			doent();
		},null,is_root);
	}
	else {
		if (await fsapi.pathToNode(savepath)) return logger("File path exists: "+savepath,true);
		ent.getData(new zip.BlobWriter(), blob=>{
			fs.savefile(savepath, blob, ret=>{
				if (!ret) return logger("Could not save: " + ent.filename,true);
//				if (no_prompt) logger(`${ent.filename} (${blob.size} bytes) `)
				if (no_prompt) logger(`${ent.filename}\xa0\xa0(${bytes_to_str(blob.size)}) `)
				else logger(ent.filename)
				contdiv.scrollTop = contdiv.scrollHeight;
				doent();
			},{MKDIR:true, ROOT:is_root});
		})
	}
}//»
doent();
};//»

let dounzip=async(buf)=>{//«
await Core.api.loadMod("util.zip.ZipJS");
await Core.api.loadMod("util.zip.ZipJSInflate");
if (!globals.zip)new NS.mods["util.zip.ZipJS"](Core);
zip = globals.zip;
if (!zip.Inflater)new NS.mods["util.zip.ZipJSInflate"](Core);
zip.createReader(new zip.BlobReader(new Blob([buf.buffer], {type:"zip"})), zipReader=>{
	zipReader.getEntries(ents=>{
		if (no_prompt) {
			doents(ents, cur_dir, {logger:logit});
			return;
		}
		logit(`Extract ${ents.length} entr${(ents.length===1?"y":"ies")} into:\xa0'${cur_dir}'?<br>`);
		but=mk('button');
		but.innerHTML="Extract";
		contdiv.add(but);
		let str='';
		for (let ent of ents){
			str+=ent.filename;
//			if (!ent.directory)str+=`\xa0\xa0\xa0(${ent.uncompressedSize}\xa0bytes)`;
			if (!ent.directory)str+=`\xa0\xa0(${bytes_to_str(ent.uncompressedSize)})`;
			str+="<br>";
		}
		logit(str);
		but.onclick=()=>{
			but=null;
			contdiv.innerHTML="";
			doents(ents, cur_dir, {logger:logit});
		}

	});
}, 
err=>{
logit("Error: "+err);
cerr(err);
});
}//»
//»

this.onloadfile=(buf, noarg1, noarg2, patharg, nopromptarg)=>{//«
	if (topwin.path) cur_dir = topwin.path;
	else if (patharg) cur_dir = patharg;
	no_prompt = nopromptarg;
	if (!cur_dir){
cerr("No cur_dir given!");
		return;
	}
	dounzip(buf);
}//»
this.onkeydown=(e,sym)=>{
if (sym==="ENTER_"){
if (but) but.click();
}
};
if (!cur_dir) topwin.title="Unzip";
}

