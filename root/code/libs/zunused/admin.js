//Imports«
let _;
const{NS,log,cwarn,cerr,xgetobj,globals}=Core;
const{fs,util}=globals;
const{strnum,isarr,isobj,isstr}=util;
const {
	readFile,
	get_path_of_object,
	pathToNode,
	read_file_args_or_stdin,
	serr,
	normpath,
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
	EOF,
	ENV
} = shell_exports;
const fsapi=NS.api.fs;
const capi = Core.api;
//»

//Funcs«

const rem_ch_op=(args,which,val)=>{//«
	let name = args.shift();
	if (!name) return cberr("No file or name");
	let is_file = !(name.match(/\/$/));
	if (args.length) return cberr("Too many args");
	let fullpath = normpath(name);
	let ret = parse_site_path(fullpath, is_file);
	if (isstr(ret)) return cberr(ret);
	let path = ret.path;
	let url;
	if (which=="grp") url='/_chgrp?grp='+val+'&dir='+path;
	else url='/_chmod?mod='+val+'&dir='+path;
	if (ret.user) url+="&user="+ret.user;
	if (ret.file) url+="&file="+ret.file;
	xgetobj(url,(ret,err)=>{
		if (!ret) return cberr(err);
		if (ret.ERR) return cberr(ret.ERR);
		cbok(ret.SUCC);
	});
}//»
const parse_site_path=(patharg,is_file)=>{//«

	if (!(patharg=="/site"||patharg.match(/^\/site\//))) return "Not a remote folder";
	let arr = patharg.split("/");
	arr.shift();
	arr.shift();
	let path;
	let user=null;
	if (arr.length > 1 && arr[0]=="users") {
		arr.shift();
		user = arr.shift();
	}
	path = arr.join("/");
	if (!path) path="/";
	if (!is_file) return {user:user,path:path}

	let fname;
	arr = path.split("/");
	fname = arr.pop();
	path = arr.join("/")
	if (!path) path="/";

	return {user:user,path:path,file:fname}
};//»

const gloginout =(which,cb) => {//«
	return new Promise((Y, N) => {
		let win = window.open("/" + which.toLowerCase(), which, "width=700,height=500");
		const end = async () => {
			clearInterval(interval);
			Y(true);
			cb&&cb();
		};
		let interval = setInterval(() => {
			try {
				if (win && win.top) {} else {
					clearInterval(interval);
					end();
				}
			} catch (e) {
				clearInterval(interval);
				end();
			}
		}, 200);
	});
}//»

//»
//NEW ADMIN!!!
const coms={

updateemail:async()=>{let email=args.shift();if(!email)return cberr("No email given!");if(!/^\S+@\S+[\.][0-9a-z]+$/.test(email))return cberr("The value appears invalid");let rv=await fetch(`/_updateemail?val=${email}`);if(!rv)return cberr("???");let txt=await rv.text();if(rv.ok!==true)return cberr(txt);cbok(txt);},
getuserlist:async()=>{
	let rv = await fetch('/_getuserlist');
	if (!rv) return cberr("???");
	let s = await rv.text();
	if (rv.ok!==true) return cberr(s);
	let arr = JSON.parse(s);
	for (let u of arr){
		if (u===null) {
			werr("done");
			break;
		}
		wout(`${u.nm} ${u.ct}`);
	}
	cbok();
},
mkchatroom:async()=>{
	let which = args.shift();
	if (!which) return cberr("Chatroom name not given");
	let rv = await fetch(`/_createchatroom?name=${encodeURIComponent(which.regstr())}`)
	if (!rv) return cberr("???")
	let txt = await rv.text();
	if (rv.ok!==true) return cberr(txt);
	cbok(txt);
},
mkforum:async()=>{
	let which = args.shift();
	if (!which) return cberr("Forum name not given");
	let rv = await fetch(`/_createforum?name=${encodeURIComponent(which.regstr())}`)
	if (!rv) return cberr("???")
	let txt = await rv.text();
	if (rv.ok!==true) return cberr(txt);
	cbok(txt);
},
'glogin':async()=>{await gloginout("GLogin");cbok();},
'glogout':async()=>{await gloginout("GLogout");cbok();},
'gstatus': async () => {//«
	let rv;
	try {
		rv = await fetch('/_gstatus?nocache=' + Date.now());
	} catch (e) {
		return cberr("Network error");
	}
	if (!rv) return cberr("Network error");
	if (rv.ok !== true) return cberr(await rv.text());
	cbok(await rv.text());
},//»
setsitebgimg:async(args)=>{let path=args.shift();if(!path)return cberr("No path");let ret=await readFile(path);if(!ret)return cberr(`${path}:\x20not found`);let rv=await fetch('/_admin?op=setsitebgimg',{method:"POST",body:ret});if(rv&&rv.ok===true){wout(await rv.text());return cbok();}cberr("There was an error");},
syncallfiles:async(args)=>{//«

let locpath = args.shift();
if (!locpath) return cberr("Need a base local path");
let locpardir = await pathToNode(locpath);
if (!locpardir) return cberr("Local path not found: "+locpath);
if (!locpardir.KIDS) return cberr("Local path not a folder: "+locpath);
let loctype = locpardir.root.TYPE;
if (!(loctype=="local"||loctype=="fs")) return cberr(`Local path should be type 'local' or 'fs' (got '${loctype}')`);
let locrootpath = get_path_of_object(locpardir);

let rempath = args.shift();
if (!rempath) return cberr("Need a base remote path");
let rempardir = await pathToNode(rempath);
if (!rempardir) return cberr("Remote path not found: "+rempath);
if (!rempardir.KIDS) return cberr("Remote path not a folder: "+rempath);
if (rempardir.root.TYPE!=="remote") return cberr(`Remote path should be type 'remote' (got '${rempardir.root.TYPE}')`);
let parts = get_path_of_object(rempardir).split("/");
parts.shift();
parts.shift();
let remrootpath="/"+parts.join("/");

wout(`Syncing ${locrootpath} to ${remrootpath}`);
let num_updated = 0;
let num_total = 0;
let num_failed = 0;
let killed=false;
kill_register((cb)=>{
	wout("Killed!");
	killed = true;
	cbok();
	cb&&cb();
});
const syncdir = (dir) => {
	return new Promise(async (y, n) => {
		await fsapi.popDir(dir);
		let kids = dir.KIDS;
		let keys = capi.getKeys(kids);
		let update_path;
//		let path;
		for (let key of keys) {
			if (killed) return y();
			if (key == "." || key == "..") continue;
			let kid = kids[key];
			if (kid.APP == "Folder") await syncdir(kid);
			else {
				let kidpath = ("/"+remrootpath + "/" + kid.fullpath.slice(locrootpath.length + 1)).regpath();
				let arr = kidpath.split("/");
				let name = arr.pop();
				arr.shift();
				let path = arr.join("/");
				let rv = await fetch(kidpath+"?hashonly=1");
				if (!(rv&&rv.ok===true)) {
					wout("Not found on server: "+kidpath);
					continue;
				}
				num_total++;
				let theresum = await rv.text();
				let heresum = kid.hashsum;
				if (heresum === theresum) continue;
				let bytes=await fsapi.readFile(kid.fullpath,{BLOB:true})
				let buf;
				if (bytes instanceof Blob){}
				else if (bytes.length && isstr(bytes[0])) bytes = bytes.join("\n");
				heresum = await capi.sha1(await capi.toBuf(bytes));
				if (heresum === theresum) continue;
				wout("Updating: " + kidpath);
				rv = await capi.xgetObj(`/_addsitefile?dir=${path}&file=${name}`, new Blob([bytes],{type:"application/octet-stream"}));
				if (!rv) {
					wout("???");
					num_failed++;
				}
				else {
					if (rv.SUCC) {
						num_updated++;
						update_path = path;
					}
					else num_failed++;
					wout(rv.SUCC || rv.ERR);
				}
			}
		}
		if (update_path){
			wout(`Caching the directory ${update_path} on the server...`);
			if (!await capi.xgetObj(`/_getdirlist?dir=${update_path}&cache=1`)){
				werr("Unknown network error detected!");
			}
//			if (!rv) werr("Unknown network error detected!");
		}
		y();
	});
};
await syncdir(locpardir);

cbok(`${num_updated} out of ${num_total} files were updated (${num_failed} failures)`);

},//»
remhash:async(args)=>{//«
	for (let p of args){
		let ret =await pathToNode(p);
		if (!ret) {
			werr(p+": not found");
			continue;
		}
		if (ret.root.TYPE!="remote"){
			werr(p+": not a remote file");
			continue;
		}
		let realpath = ret.fullpath;
		let patharr = realpath.split("/");
		patharr.shift();
		patharr.shift();
		let path = "/"+patharr.join("/");
		let rv = await fetch(path+"?hashonly=1");
		if (!(rv&&rv.ok===true)) return cberr("Not found");
		cbok(await rv.text());
/*
		xgetobj(path+"?hashonly=1", (ret,err)=>{
			if (ret&&ret.SUCC) {
				cbok(realpath+" "+ret.SUCC);
				return;
			}
			else cberr((ret&&ret.ERR)||err||"???");
		});
*/
	}
},//»
drops:args=>{//«
    let blobs = ENV.BLOB_DROPS;
    if (!blobs) return cberr("No blobs");
    let it = 0;
    for (let blob of blobs) {
        let name = blob.name;
        blob = blob.blob;
        let sz = blob.size;
        wout(it+") "+name+" "+sz);
        it++;
    }
    cbok();
},//» 
initfs:async()=>{//«
	let ret = await fetch('/_initfs');
	let val = await ret.text();
	if (ret.ok!==true) return cberr(val);
	cbok(val);
},//»
syncroot: async args => {//«
	let dirname = args.shift();
	if (!dirname) return cberr("Need a dir to sync to!");
	let path = normpath(dirname);
	let obj = await fsapi.pathToNode(path);
	if (!obj) return cberr(path + ":\x20Not found");
	if (obj.APP != "Folder") return cberr(path + ":\x20Not a directory!");
	let rootpath = obj.fullpath;
	let killed=false;
	kill_register((cb)=>{
		wout("Killed!");
		killed = true;
		cbok();
		cb&&cb();
	});
	const syncdir = (dir) => {
		return new Promise(async (y, n) => {
//			await fsapi.popHtml5Dir(dir.fullpath);
			await fsapi.popDir(dir);
			let kids = dir.KIDS;
			let keys = capi.getKeys(kids);
			for (let key of keys) {
				if (killed) return y();
				if (key == "." || key == "..") continue;
				let kid = kids[key];
				if (kid.APP == "Folder") await syncdir(kid);
				else {
					let kidpath = "root/" + kid.fullpath.slice(rootpath.length + 1);
					let arr = kidpath.split("/");
					let name = arr.pop();
					let path = arr.join("/");
//					let blob = new Blob([await fsapi.readHtml5File(kid.fullpath, {
					let blob = new Blob([await fsapi.readFile(kid.fullpath, {
						BLOB: true
					})], {
						type: "application/octet-stream"
					});
					wout(`Syncing file:\x20${kidpath}\x20(${blob.size})`);
					let rv = await capi.xgetObj(`/_addsitefile?dir=${path}&file=${name}`, blob);
					if (!rv) wout("???");
					else wout(rv.SUCC || rv.ERR);
				}
			}
			let relpath = dir.fullpath.slice(rootpath.length + 1);
			if (relpath) {
				let usepath = "root/" + relpath;
				wout("Caching:\x20" + usepath);
				let rv = await capi.xgetObj(`/_getdirlist?dir=${usepath}&cache=1`);
				if (!rv) werr("Unknown network error detected!");
				else {
					let succ = rv.SUCC;
					if (succ) wout(JSON.stringify(succ));
					else werr(rv.ERR);
				}
			}
			y();
		});
	};
	await syncdir(obj);
	await capi.xgetObj(`/_getdirlist?dir=/&cache=1`);
	cbok("Done!");
},//»
loclist:async args=>{//«
    let path=args.shift();
    if (!path) return cberr("NOARG");
    let fobj = await fsapi.pathToNode(normpath(path));
    if (!fobj) return cberr("Not found: "+path);
    if (!fobj.root.TYPE==="local") return cberr("No local");
    let fullpath = fobj.fullpath;
	if (!fullpath) return cberr("Got no fullpath, must be /loc, eh?");
    let arr = fullpath.split("/");
    arr.shift();arr.shift();
    path = arr.join("/");
    if (!path) path = "/";
    let rv = await capi.xgetText(Core.loc_url()+"/_getdirobj?path="+path);
    if (!rv) return cberr("Got nothing!");
    wout(rv);
    cbok();
},//»
groups:function(args){//«
	xgetobj('_user?op=getgroups',(ret,err)=>{
		if (!ret) return cberr(err);
		if (ret.ERR) return cberr(ret.ERR);
		cbok(ret.SUCC);
	})
},//»

'addgrp':function(args){//«
	let name = args.shift();
	if (!name) return cberr("No name given");
	if (args.length) return cberr("Too many args");
	xgetobj('/_user?op=addgrp&grp='+name,(ret,err)=>{
		if (!ret) return cberr(err);
		if (ret.ERR) return cberr(ret.ERR);
		cbok(ret.SUCC);
	});

},//»
'grpmod':function(args){//«
	let name = args.shift();
	if (!name) return cberr("No group name given");
	let modop = args.shift();
	if (!modop) return cberr("No mod op given");
	let val_str="";
	if (args.length) val_str = "&values="+args.join(",");
	xgetobj('/_user?op=grpmod&grp='+name+'&type='+modop+val_str,(ret,err)=>{
		if (!ret) return cberr(err);
		if (ret.ERR) return cberr(ret.ERR);
		cbok(ret.SUCC);
	});
},//»
'chgrp':function(args){//«
	let grp = args.shift();
	if (!grp) return cberr("No group name");
	rem_ch_op(args,"grp",grp);
},//»
'chmod':function(args){//«
	let mod = args.shift();
	if (!mod) return cberr("No mode given");
	if (!mod.match(/^[-+r][-+w][-+r][-+w][-+r][-+w]$/)) return cberr("Invalid mode");
	rem_ch_op(args,"mod",mod);
},//»
'setdirlist':function(args){//«

/*
Send up some json that can be used as the directory listing, maybe in an admin.lib
*/
/*«
let blob = new Blob(["this is a blob that is going to be in there??????????????????/"],{type:"text/plain"});
xgetobj('/_setsitedir?dir=docs',(ret,err)=>{
if (err) return cberr(err);
log(ret);
cbok();
},blob);
»*/
	const dopost=arr=>{
		for (let f of arr){
			if (!isobj(f)) return cberr("Invalid array format (array members must be objects)");
			if (!isstr(f.n) && f.n.match(/^[-~._a-z0-9]+\/?$/i)) return cberr("Invalid file.n (name) property: " + f.n);
		}
		let parr = path.split("/");
		parr.shift();
		parr.shift();
		let dir;
		let user=null;
		if (parr.length > 1 && parr[0]=="users") {
			parr.shift();
			user = parr.shift();
		}
		dir = parr.join("/");
		if (!dir) dir="/";
		let url = '/_setdirlist?dir='+dir;
		if (user) url+="&user="+user;
		xgetobj(url,(ret,err)=>{
			if (!ret) {
				if (err) return cberr(err)
				return cberr("Nothing found");
			}
			if (ret.ERR) return cberr(ret.ERR);
			wout(ret.SUCC);
			cbok();
		},(new Blob([JSON.stringify(arr)],{type:"text/plain"})));
	};

	let opts = failopts(args,{LONG:{"json":1}});
	if (!opts) return;
	let dirname = args.shift();
	if (!dirname) return cberr("No dirname");
	if (args.length>1) return cberr("Too many args");
	let path = normpath(dirname);
	if (!(path=="/site"||path.match(/^\/site\//))) return cberr("Not a remote folder");
	let retarr = [];
	let done=false;

	if (opts.json){
		let arr;
		try{
			arr = JSON.parse(opts.json);
		}
		catch(e){
			cberr("Bad JSON");
		}
		if (!isarr(arr)) return cberr("JSON not an array");
		dopost(arr);
		return;
	}
	
	read_file_args_or_stdin(args, (ret, fname, errmess)=>{
		if (done) return;
		if (fname) return;
		if (errmess) {
			done=true;
			return cberr(errmess);
		}
		if (isobj(ret)&&ret.EOF){
			dopost(retarr);
			return;
		}
		if (isstr(ret)) retarr.push(ret);
		else if (isarr(ret)&&isstr(ret[0])) retarr = retarr.concat(ret);
		else cwarn("Dropping object or something",ret);
	},{SENDEOF:true});
},//»
'getdirlist':function(args){//«
	let opts = failopts(args,{LONG:{cache:1}});
	if (!opts) return;
	let dirname = args.shift();
	if (!dirname) return cberr("No dirname");
	if (args.length) return cberr("Too many args");
	let path = normpath(dirname);
	if (!(path=="/site"||path.match(/^\/site\//))) return cberr("Not a remote folder");
	let arr = path.split("/");
	arr.shift();
	arr.shift();
	let dir;
	let user=null;
	if (arr.length > 1 && arr[0]=="users") {
		arr.shift();
		user = arr.shift();
	}
	dir = arr.join("/");
	if (!dir) dir="/";
	let url = '/_getdirlist?dir='+dir;
	if (user) url+="&user="+user;
	if (opts.cache) {
		url+="&cache=1";
		werr("Caching the directory...");
	}
	xgetobj(url,(ret,err)=>{
		if (!ret) {
			if (err) return cberr(err)
			return cberr("Nothing found");
		}
		if (ret.ERR) return cberr(ret.ERR);
		wout(JSON.stringify(ret.SUCC));
		wout(EOF);
		cbok();
	});
},//»


}

const coms_help={
}

if (!com) return Object.keys(coms);
if (!args) return coms_help[com];
if (!coms[com]) return cberr("No com: " + com + " in admin!");
if (args===true) return coms[com];
coms[com](args);


/*Old
update:async args=>{//«

let opts = failopts(args, {SHORT: {m:3,l:3,a:3,e:3},LONG: {mods:3,libs:3,apps:3,expires:3,all:1}});
if (!opts) return;
let doit = capi.updateFile;
let exp = opts.expires||opts.e;
let secs=null;
let obj = {out:wout,err:werr};
if (exp){
	secs = exp.pnni();
	if (isNaN(secs)) return cberr("Invalid expires option: "+exp);
	obj.expires=secs;
	werr("Using expiration seconds:\x20"+secs);
}

if (opts.all){
await capi.updateSystem(
{
out:wout,
err:werr,
expires:secs
});
}
else {
let mods=opts.mods||opts.m;if(mods){let arr=mods.split(",");for(let mod of arr){try{await doit("mods",mod.trim(),obj);}catch(e){return cberr("Failed");}} }
let apps=opts.apps||opts.a;if(apps){let arr=apps.split(",");for(let app of arr){try{await doit("apps",app.trim(),obj);}catch(e){return cberr("Failed");}} }
let libs=opts.libs||opts.l;if(libs){let arr=libs.split(",");for(let lib of arr){try{await doit("libs",lib.trim(),obj);}catch(e){return cberr("Failed");}} }
}
cbok();

},//»
sysupdate:async args=>{//«
let opts = failopts(args,{LONG:{expires:3},SHORT:{e:3}});
if(!opts) return;
let exp = opts.expires||opts.e;
let secs;
let obj = {out:wout,err:werr};
if (exp){
	secs = exp.pnni();
	if (isNaN(secs)) return cberr("Invalid expires option: "+exp);
	obj.expires=secs;
	werr("Using expiration seconds:\x20"+secs);
}
werr("Starting...");
await capi.updateSystem(obj);
werr("Done!");
cbok();
},//»
sendtouser:function(args){//«
	let fname = args.shift();
	if (!fname) return cberr("No file given");
	if (args.length>1) return cberr("Too many args");
	arg2con(fname, file_ret=>{
		if (!file_ret) return cberr(fname+": No contents");
		let dirname = args.shift();
		if (!dirname) return cberr("No dirname");
		let fullpath = normpath(dirname);
		let ret = parse_site_path(fullpath, false);
		if (isstr(ret)) return cberr(ret);
		if (!ret.user) return cberr("Not a user path");
		let path = ret.path;
		xgetobj("/_sendtouser?dir="+ret.path+"&user="+ret.user,(ret,err)=>{
			if (!ret) return cberr(err);
			if (ret.ERR) return cberr(ret.ERR);
			cbok(ret.SUCC);
		},new Blob([file_ret],{type:"text/plain"}));
	});
},//»
*/



