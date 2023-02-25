/*@SKUYTGKLW: A lesson in the tribulations involved when NOT having a central
factory method for creating file node objects. The .entry property was not
there previously, meaning that the Desktop's logic of folder creation yielded
a folder node that did not work inside the new pathToObj, which depends on the
.entry property!!!*/

/*@HYTEKLFHSN: To stop clobbering folders and easily creating an inconsistentsystem:«

BUT THIS PROBABLY ISN'T CORRECT BECAUSE WE (USUALLY) JUST OVERWRITE FILES W/
FILES...//
    
~$ mkdir blotz ~$ mkdir blotz/harp ~$ touch harp ~$ mv harp blotz/ mv: cannot
overwrite directory 'blotz/harp' with non-directory ~$ touch blotz/frinj ~$
mkdir frinj ~$ mv frinj/ blotz/ mv: cannot overwrite non-directory
'blotz/frinj' with directory 'frinj/' »*/ 

/* XXX UHOH: obj.fullpath XXX«

On trying: 

$ rm *.webm

@HSDKKRUYGHNDK: There was an Error here because obj.fullpath was undefined.
How about a Node object that that a fullpath getter that calls path_from_node???


»*/

export const mod = function(Core, root) {//«

//Imports«

//const root = arg;
const fsobj = this;
const{api:capi,fs_url,mod_url,loc_url,xget,xgetobj,sys_url,log,cwarn,cerr,NS,globals}=Core;
const{FSLET, FSBRANCH, FSPREF,fs_root,lst,util,FOLDER_APP, LINK_RE, LINK_EXT, TEXT_EXTENSIONS}=globals;
const{strnum,isid,isarr,isobj,isfunc,isnum,isnull,isint,isstr}=util;
const{isEOF,isArr,isStr,xgetText}=capi;
const ispos = arg=>{return isnum(arg,true);}
const isneg = arg=>{return isnum(arg,false);}
const isnotnegint = arg=>{return isint(arg, true);}
const READONLY=()=>{
	cerr("The system is read only")
//throw new Error("READONLY");
};
const ALL_EXTENSIONS_RE = new RegExp("^(.+)\\.(" + globals.all_extensions.join("|") + ")$");
//»

//Var«

const api={};

const MB = 1024*1024;

let FILE_SAVER_SLICE_SZ = 1 * MB;
let MAX_REMOTE_SIZE = 1 * MB;
let MAX_FILE_SIZE = 256*MB;

let Desk, desk, desk_path;

const root_dirs = ["tmp", "usr", "home", "etc", "var"];
this.root = root;

const MAX_DAYS = 90;//Used to determine how to format the date string for file listings
const MAX_LINK_ITERS = 8;
const rem_cache = {};

//»

//Util/Generic«

const NOOP=()=>{};
const FATAL=s=>{throw new Error(s);};

this.set_desk=function(arg){Desk=arg;desk_path=Desk.desk_path();desk=Desk.get_desk();}

const allow_sys_perms = () => {return true;};

const add_lock_funcs=kid=>{//«
	let lock = {};
	kid.unlock_file=()=>{
		delete kid.write_locked;
		let par = kid.par;
		while (par){
			if (par.is_root) break;
			par.rm_move_lock(lock);
			par = par.par;
		}
	};
	kid.lock_file=()=>{
		kid.write_locked = true;
		let par = kid.par;
		while (par){
			if (par.is_root) break;
			par.MOVE_LOCKS.push(lock);
			par = par.par;
		}
	};
};//»
const set_rm_move_lock=obj=>{//«
	let locks = obj.MOVE_LOCKS;
	obj.rm_move_lock=lockarg=>{
		for (let i=0; i < locks.length; i++){
			if (locks[i]===lockarg){
				locks.splice(i, 1);
				break;
			}
		}
	}
};//»
const get_time_str_from_file=file=>{//«
	let now = Date.now();
	let use_year_before_time = now - (1000 * 86400 * MAX_DAYS);
	let tm = file.lastModified;
	let timearr = file.lastModifiedDate.toString().split(" ");
	timearr.shift();
	timearr.pop();
	timearr.pop();
	let timestr = timearr[0] + " " + timearr[1].replace(/^0/, " ") + " ";
	if (file.lastModified < use_year_before_time) timestr += " " + timearr[2];
	else {
		let arr = timearr[3].split(":");
		arr.pop();
		timestr += arr.join(":");
	}
	return timestr;
};//»
const getkeys=(obj)=>{var arr=Object.keys(obj);var ret=[];for(var i=0;i<arr.length;i++){if(obj.hasOwnProperty(arr[i]))ret.push(arr[i]);}return ret;}
const path_to_data=(fullpath)=>{return new Promise((res,rej)=>{path_to_contents(fullpath,ret=>{if(ret)return res(ret);rej("Not found:\x20"+fullpath);},true);})}
const path_to_contents = async(fullpath, cb, if_dat, stream_cb) => {//«
	if (if_dat || stream_cb) {} else cwarn("path_to_contents():" + fullpath);
	let ret = await pathToNode(fullpath);
	if (!ret) return cb();
	let type = ret.root.TYPE;
	if (type == "fs") get_fs_by_path(fullpath, cb, {BLOB: if_dat});
	else if (type == "local") get_local_file(fullpath, cb, {ASBYTES: if_dat}, stream_cb);
	else {
		cerr("path_to_contents:WHAT TYPE? " + ret.root.TYPE);
		cb()
	}
}//»
const getBin = (fullpath)=>{//«
	return new Promise((Y,N)=>{
		path_to_contents(fullpath, Y, true);
	});
};
//»

/*
const path_to_obj = (str, allcb, if_get_link, alliter) => {//«

	str = str.replace(`.${LINK_EXT}`,"");

	if (!allcb) allcb = () => {};
	if (!(str && str.match(/^\x2f/))) {
		return allcb();
	}
	let isrem = false;
	let iter = -1;
	let rootarg;
	let fsarg;
	const deref_link=(link, cb, if_dir_only)=>{
		path_to_obj(link, (ret, lastdir, usepath) => {
			if (!ret) cb(null, lastdir, usepath);
			else if (ret.APP == FOLDER_APP) cb(ret);
			else if (ret.APP == "Link") deref_link(ret.LINK, cb);
			else {
				if (if_dir_only) cb(null, lastdir, usepath);
				else cb(ret);
			}
		}, if_get_link, ++alliter);
	};
	let lastdir;
	let normpath = normalize_path(str);
	const get_dir_obj = (cb) => {//«
		const trydir = () => {//«
			if (gotdir.KIDS) {
				curdir = gotdir;
				lastdir = curdir;
				get_dir_obj(cb);
			} else if (gotdir.APP == "Link") {
				deref_link(gotdir.LINK, ret => {
					if (!ret) return cb();
					curdir = ret;
					lastdir = curdir;
					get_dir_obj(cb);
				}, true);
			} else cb();
		};//»
		iter++;
		if (iter == tonum) return cb(curdir);
		let kids = curdir.KIDS;
		let name = arr[iter];
		let gotdir = kids[name];
		if (!gotdir) {
			if (!curdir.done) {
				populate_dirobj(curdir, kidret => {
					gotdir = kidret[name];
					if (gotdir) lastdir = gotdir;
					if (gotdir) trydir();
					else allcb(null, lastdir, normpath);
				}, {
					DIRNAME: name
				});
			} else cb();
		}
		else {
			lastdir = gotdir;
			trydir();
		}
	};//»
	let tonum;
	let curdir;
	if (!alliter) alliter = 0;
	if (alliter == MAX_LINK_ITERS) {
		return allcb();
	}
	let arr = str.regpath().split("/");
	arr.shift();
	if (!arr[arr.length - 1]) arr.pop();
	if (!arr.length) return allcb(rootarg||root, lastdir, normpath);
	curdir = rootarg||root;
	let fname = arr.pop();
	tonum = arr.length;
	get_dir_obj(ret => {
		if (ret && ret.KIDS) {
//log(alliter,str,ret);

			if (ret.KIDS[fname]) {
				let kid = ret.KIDS[fname];
				if (kid.APP == "Link" && !if_get_link) deref_link(kid.LINK, allcb);
				else allcb(kid, lastdir, normpath);
				
			} else {
				if (!ret.done) {
					populate_dirobj(ret, kidret => {
						ret.done = true;
						if (kidret) allcb(kidret[fname], lastdir, normpath);
						else allcb(null, lastdir, normpath);
					}, {
						PATH: str
					});
				} 
				else {
					allcb(null, lastdir, normpath);
				}
			}
		} else {
			allcb(null, lastdir, normpath);
		}
	});
}
//»
*/

const pathToObj = (patharg, if_get_link, iter) =>{//«

	if (!iter) iter=0;
//log(patharg, iter);
	const _getDirEnt=(dir, name)=>{//«
		return new Promise((Y,N)=>{
			dir.getDirectory(name, {}, Y, e=>{Y();});
		});
	}//»
	const _getFileEnt=(dir,name)=>{//«
		return new Promise((Y,N)=>{
			dir.getFile(name, {}, Y, e=>{Y()});
		});
	}//»
	const stop=()=>{return new Promise(()=>{});}
//log("IN",patharg, if_get_link);

//		if (!if_get_link && LINK_RE.test(path)) path = path.replace(`.${LINK_EXT}`,"");

	return new Promise(async(Y,N)=>{//«

		let path = normalize_path(patharg);

		if (path==="/") return Y([root,null,path]);
		path = path.replace(`.${LINK_EXT}`,"");

		let parts = path.split("/");
		parts.shift();
		let topname = parts.shift();
		if (!parts.length) return Y([root.KIDS[topname],root, path]);
		let curpar = root.KIDS[topname];

		let curkids = curpar.KIDS;
		let curpath = curpar.fullpath;
		let fname = parts.pop();

		while(parts.length){//«
			let nm = parts.shift();
			let gotkid = curkids[nm];
			if (gotkid) curpar = gotkid;
			else {
				if (!curpar.done) {
					if (curpar.root.TYPE!=="fs"){
						await popDir(curpar);
						gotkid = curkids[nm];
						if (!gotkid) return Y([null, curpar, path]);
						curpar = gotkid;
					}
					else {
						let gotdir = await _getDirEnt(curpar.entry, nm);
						if (gotdir){
							let dirkid = mkdirkid(curpar, nm, {
								isDir: true,
								size: 0,
								modTime: 0,
								path: curpath
							});
							curkids[nm] = dirkid;
							curpar = dirkid;
							curpar.entry = gotdir;
						}
						else{
							return Y([null, curpar, path]);
						}
					}
				}
				let newpar = curkids[nm];
				if (!(newpar&&newpar.APP===FOLDER_APP)) return Y([null, curpar, path]);
				curpar = newpar;
			}
			if (curpar.APP==="Link"){
				if (iter > MAX_LINK_ITERS) return Y([null, curpar, path]);
				let rv = await getDataFromFsFile(curpar.file,"text");
				let [gotdir, lastdir, gotpath] = await pathToObj(rv, if_get_link, ++iter);
				if (!(gotdir&&gotdir.APP===FOLDER_APP)) return Y([null, curpar, gotpath]);
				curpar = gotdir;
			}
			curpath = curpar.fullpath;
			curkids = curpar.KIDS;
		}//»

		if (!curkids&&!if_get_link&&curpar.ref&&curpar.ref.KIDS){
			curpar = curpar.ref;
			curpath = curpar.fullpath;
			curkids = curpar.KIDS;
		}

		let node = curkids[`${fname}`];
		const done=async()=>{
			if (!node||node.APP!=="Link"||if_get_link) return Y([node, curpar, path]);
			if (iter > MAX_LINK_ITERS) return Y([null, curpar, path]);
			let rv = await getDataFromFsFile(node.file,"text");
			Y(await pathToObj(rv, if_get_link, ++iter));
		};
		if (node||curpar.done) {
			if (node && !node.root) node.root = curpar.root;
			return done();
		}
		if (curpar.root.TYPE!=="fs"){
//Since there are no links in non-fs type folders, there is no risk of an
//infinite loop in invoking populate_dirobj. The problem is that links need
//to call us.
			await popDir(curpar);
			let gotnode = curkids[fname];
			if (!gotnode) return Y([null, curpar, path]);
			node = gotnode;
			if (!node.root) node.root = curpar.root;
			return done();
		}
		let gotdir = await _getDirEnt(curpar.entry, fname);
		if (gotdir){
			let dirkid = mkdirkid(curpar, fname, {
				isDir: true,
				size: 0,
				modTime: 0,
				path: curpath
			});
			node = dirkid;
			if (!node.root) node.root = curpar.root;
			curkids[fname] = dirkid;
			curpar = dirkid;
			curpar.entry = gotdir;
			return done();
		}
		let gotfile = await _getFileEnt(curpar.entry, fname);
		if (gotfile){
			let file = await getFsFileFromEntry(gotfile);
			let timestr = get_time_str_from_file(file);
			let filekid = mkdirkid(curpar, fname, {
				size: file.size,
				modTime: timestr,
				path: curpath,
				file: file,
				entry: gotfile,
			});
			curkids[fname] = filekid;
			filekid.entry = gotfile;
			node = filekid;
			if (!node.root) node.root = curpar.root;
			return done();
		}
		let gotlink = await _getFileEnt(curpar.entry, `${fname}._lnk`);
		if (gotlink) {//«
			if (if_get_link){//«
				let file = await getFsFileFromEntry(gotlink);
				let timestr = get_time_str_from_file(file);
				let linkkid = mkdirkid(curpar, fname, {
					isLink: true,
					size: file.size,
					modTime: timestr,
					path: curpath,
					file: file,
					entry: gotfile,
				});
				curkids[fname] = linkkid;
				linkkid.entry = gotlink;
				node = linkkid;
				if (!node.root) node.root = curpar.root;
				let val = await getDataFromFsFile(file, "text");
				node.LINK = val;
				let [rv] = await pathToObj(val);
				node.ref = rv;
//				node.ref = await pathToObj(val);
				return done();
//				return Y([node, curpar, path]);
			}//»
			if (iter > MAX_LINK_ITERS) return Y([null, curpar, path]);
			let file = await getFsFileFromEntry(gotlink);
			let rv = await getDataFromFsFile(file,"text");
			return Y(await pathToObj(rv, if_get_link, ++iter));
		}//»
		else done();
	});//»
};//»
const path_to_obj = async(str, allcb, if_get_link, alliter) => {//«
//cwarn("PTO", str);
let [node, lastdir, usepath] = await pathToObj(str, if_get_link, 0);
allcb(node, lastdir, usepath);

}
//»

const normalize_path = (path, cwd) => {//«
	if (!(path.match(/^\x2f/) || (cwd && cwd.match(/^\x2f/)))) {
		cerr("normalize_path():INCORRECT ARGS:", path, cwd);
		return null;
	}
	if (!path.match(/^\x2f/) && cwd) path = cwd + "/" + path;
	let str = path.regpath();
	while (str.match(/\/\.\x2f/)) str = str.replace(/\/\.\x2f/, "/");
	str = str.replace(/\/\.$/, "");
	str = str.regpath();
	let arr = str.split("/");
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == "..") {
			arr.splice(i - 1, 2);
			i -= 2;
		}
	}
	let newpath = arr.join("/").regpath();
	if (!newpath) newpath = "/";
	return newpath;
}
this.normalize_path = normalize_path;
//»
const make=(which)=>{return document.createElement(which);}

const get_fullpath = (path, cur_dir) => {//«
	if (!path) return;
	if (path.match(/^\x2f/)) return path;
	if (!cur_dir) {
cwarn("get_fullpath():No cur_dir given with relative path:" + path);
		return;
	}
	let usedir;
	if (cur_dir == "/") usedir = "/";
	else usedir = cur_dir + "/";
	return normalize_path(usedir + path);
}
this.get_fullpath=get_fullpath;
//»
const path_to_par_and_name=(path)=>{//«
	let fullpath = get_fullpath(path);
	let arr = fullpath.split("/");
	if (!arr[arr.length-1]) arr.pop();
	let name = arr.pop();
	if (arr.length==1 && arr[0]=="") return ["/", name];
	return [arr.join("/"), name];
}
this.path_to_par_and_name=path_to_par_and_name;
/*
const path_to_par_and_name = (path) => {
	let fullpath = get_fullpath(path);
	let arr = fullpath.split("/");
	if (!arr[arr.length - 1]) arr.pop();
	let name = arr.pop();
	return [arr.join("/"), name];
}
*/
//»

const path_from_node = (obj, if_arr) => {//«
	if (!obj) return null;
	let str = obj.NAME;
	if (!str) return null;
	let curobj = obj;
	let use_sep = "/";
	let i = 0;
	while (true) {
		if (i > 10000) {
cerr("\nINFINITE LOOP:GET_PATH_OF_OBJECT\n");
			break;
		}
		if (curobj && curobj.par) str = curobj.par.NAME + use_sep + str;
		else break;
		curobj = curobj.par;
		i++;
	}
	let arr = str.split("/");
	while (!arr[0] && arr.length) {
		arr.shift();
		i++;
	}
	if (if_arr) return arr;
	str = arr.join("/");
	return ("/" + str).regpath();
}
this.path_from_node = path_from_node;
//»

//»
//Remote/User«

const get_local_file = async (patharg, cb, opts={}, stream_cb) => {//«
	if ((typeof stream_cb === 'boolean') || (stream_cb && !(stream_cb instanceof Function))){
		return FATAL("arg3 must be a stream_cb (function)");
	}
	if (!opts.NOCACHE && rem_cache[patharg]) return cb(rem_cache[patharg]);
	let fobj = await pathToNode(patharg);
	let parts = fobj.fullpath.split("/");
	parts.shift();
	parts.shift();
	parts.shift();
	Core.xgetfile(loc_url(fobj.root.port, parts.join("/")), cb, stream_cb, opts.TEXT);
}//»

//»
//***New HTML5 FS***«

const getFsEntry=(path,opts={})=>{//«
	return new Promise((Y,N)=>{
		webkitResolveLocalFileSystemURL(fs_url(path),Y,(e)=>{
			if (opts.reject) return N(e);
			NS.error.message=e;
			Y();
		});
	});
};//»
const getFsFileFromEntry=(ent)=>{//«
	return new Promise((Y,N)=>{
		ent.file(Y);
	});
};//»
const getDataFromFsFile=(file,format,start,end)=>{//«
	return new Promise(async(Y,N)=>{
		const OK_FORMATS=["blob","bytes","text","binarystring","dataurl","arraybuffer"];
		const def_format="arraybuffer";
		if (!format) {
			cwarn("Format not given, defaulting to 'arraybuffer'");
			format=def_format;
		}
		if (!OK_FORMATS.includes(format)) return N(`Unrecognized format: ${format}`);
		let reader = new FileReader();
		reader.onloadend = function(e) {
			let val = this.result;
			if (format==="blob") return Y(new Blob([val],{type: "blob"}));
			if (format==="bytes") return Y(new Uint8Array(val));
			return Y(val);
		};
		if (Number.isFinite(start)) {
			if (Number.isFinite(end)) {
				file = file.slice(start, end);
			}
			else file = file.slice(start);
		}
		if (format==="text") reader.readAsText(file);
		else if (format=="binarystring") reader.readAsBinaryString(file);
		else if (format=="dataurl") reader.readAsDataURL(file);
		else reader.readAsArrayBuffer(file);
	});
};//»

const getFsDirKids=(path, parobj, opts={})=>{//«
return new Promise(async(Y,N)=>{
	let kids = parobj.KIDS;
	let cb = opts.streamCb;
	let dent = await getFsEntry(path, opts);
	if (!dent) return Y();
	if (!dent.isDirectory){
		let mess = `The entry is not a Directory! (isFile==${dent.isFile})`;
		if (opts.reject) return N(mess);
		else{
			NS.error.message=mess;
			Y();
			return;
		}
	}
	let rdr = dent.createReader();
	let entries=[];
	const do_read_entries=()=>{
		return new Promise((Y,N)=>{
			rdr.readEntries(async arr=>{
//				if (cb) cb(arr);
//				if (!arr.length) return Y();

let ents=[];
for (let ent of arr){//«

let name = ent.name;
let gotkid = kids[name];
if (ent.isDirectory) {
	let kid = mkdirkid(parobj, name, {
		isDir: true,
		size: 0,
		modTime: 0,
		path: path,
		useKid: gotkid
	});
	if (!gotkid) kids[name] = kid;
	kids[name].entry = ent;
	ents.push(kids[name]);
	continue;
}

let file = await getFsFileFromEntry(ent);
let timestr = get_time_str_from_file(file);
let is_link = false;
if (LINK_RE.test(name)) {
	name = name.replace(`.${LINK_EXT}`,"");
	is_link = true;
}
let kid = mkdirkid(parobj, name, {
	isLink: is_link,
	size: file.size,
	modTime: timestr,
	path: path,
	file: file,
	entry: ent,
	useKid: gotkid
});
if (!gotkid) kids[name] = kid;

let narr = capi.getNameExt(name);
kid.name = narr[0];
kid.ext = narr[1];
if (!kid.ext) kid.fullname = kid.name;
else kid.fullname = name;
if (is_link){
	let val = await getDataFromFsFile(file, "text");
	kid.LINK = val;
	kid.ref = await pathToNode(val);
//	links.push(kid);
//	for (let kid of links) 
}
else if (name.match(/\.app$/)){
	kid.appicon = await getDataFromFsFile(file, "text");
}
else{
	kid.app = capi.extToApp(name);
	kid.APP=kid.app;
}
ents.push(kid);
}//»

				if (cb) cb(ents);
				if (!arr.length) return Y();

//				entries = entries.concat(arr);
				return Y(true);
			});
		});
	};
	while(await do_read_entries()){}
//	Y(entries);
	Y();
});
};//»

/*
const getFsDirKids=(path, opts={})=>{//«
return new Promise(async(Y,N)=>{

	let cb = opts.streamCb;
	let dent = await getFsEntry(path, opts);
	if (!dent) return Y();
	if (!dent.isDirectory){
		let mess = `The entry is not a Directory! (isFile==${dent.isFile})`;
		if (opts.reject) return N(mess);
		else{
			NS.error.message=mess;
			Y();
			return;
		}
	}
	let rdr = dent.createReader();
	let entries=[];
	const do_read_entries=()=>{
		return new Promise((Y,N)=>{
			rdr.readEntries(arr=>{
				if (cb) cb(arr);
				if (!arr.length) return Y();
				entries = entries.concat(arr);
				return Y(true);
			});
		});
	};
	while(await do_read_entries()){}
	Y(entries);

});
};//»
*/

//»
//HTML5 FS«

const _read_file = async(fname, cb, opts = {}, killcb_cb) => {//«
	let _;
	if (!opts) opts = {};
	const noop = () => {
		return "";
	};
	const exports = opts.exports || {};
	_ = exports;
	const is_root = _.is_root || opts.ROOT || opts.isRoot || opts.root || false;
	const get_var_str = _.get_var_str || noop;
	const tmp_env = _.tmp_env || {};
	const cur_dir = _.cur_dir || "/";
	const werr = _.werr || Core.cerr;
	const EOF = opts.EOF || {
		EOF: true
	};
	const mime_of_path = Core.mime_of_path;
	const text_mime = Core.text_mime;
	if (!fname.match(/^\x2f/)) fname = (cur_dir + "/" + fname).regpath();
	let ret = await pathToNode(fname);
	if (!(ret&&ret.fullpath)) return cb(null, null, "No such file:\x20" + fname);
	if (ret.APP == FOLDER_APP) return cb(null, null, fname + ":\x20is a directory");
	if (!get_var_str("DEV_DL_FNAME")) tmp_env.DEV_DL_FNAME = ret.NAME;
	let path = ret.fullpath;
	cb(null, path);
	let ext = path.split(".").pop();
	let is_blob = !TEXT_EXTENSIONS.includes(ext);
	let isbin = opts.binary||opts.BINARY;
	if (opts.text || opts.FORCETEXT || (get_var_str("FORCE_TEXT").match(/^t(rue)?$/i))) is_blob = false;
	let type = ret.root.TYPE;

	if (type !== "fs") {//«
		if (type == "local") {
			let fullpath = get_fullpath(path);
			if (!fullpath) return cb();
			get_local_file(fullpath, ret=>{
				if (isstr(ret)) cb(ret.split("\n"));
				else cb(ret);
				cb(EOF);
			}, {
				ASBYTES: isbin,
				TEXT: !is_blob,
				NOCACHE: true
			});
			return;
		} 
		if (type == "bin"){
			let rv = await fetch(`/root/bin/${ret.NAME}.js`);
			cb((await rv.text()).split("\n"));
			cb(EOF);
			return;
		}
		if (type == "www"){
			let rv = await fetch(path);
			if (!rv.ok) cb();
			else{
				let ext = path.split(".").pop();
				if (ext && TEXT_EXTENSIONS.includes(ext)) cb((await rv.text()).split("\n"));
				else cb(await rv.blob());
			}
			cb(EOF);
			return;
		}
		cb(EOF);
cwarn("read_file():Skipping type:" + type);
		return
	}//»

	if (!check_fs_dir_perm(ret.par, is_root, null, opts.user)) {
		return cb(null, null, `${fname}: permission denied`);
	}
	let [ret2,err]=await getFsByPath(path,{start:opts.start, end:opts.end, BLOB:true, ROOT:is_root});
	if (ret2) {
		if (isbin) {
			cb(ret2);
			cb(EOF);
			return;
		}
		if (is_blob) {}
		else ret2 = Core.api.bytesToStr(ret2);
		if (is_blob) cb(new Blob([ret2.buffer], {
			type: "blob"
		}));
		else cb(ret2.split("\n"));
	}
	else if (util.isstr(err)) cb(null, null, err);
	cb(EOF);
};
this._read_file=_read_file;
//»
const _write_fs_file = async(fent, blob, cb, opts={}) => {//«
//const Write_fs_file = async(fent, blob, cb, if_append, if_trunc, opts={}) => {
	const err = (e) => {
		cb();
	};
	let{
		append,
		spliceStart,
		spliceEnd
	} = opts;
	let realsize;
	if (Number.isFinite(spliceStart) && spliceEnd){
		let startblob = await getFsFileFromFent(fent, true, null, 0, spliceStart);
		let endblob = await getFsFileFromFent(fent, true, null, spliceEnd-1);
		realsize = blob.size;
		blob = new Blob([startblob, blob, endblob]);
	}
	fent.createWriter(function(writer) {
		if (append) writer.seek(writer.length);
		let truncated = false;
		writer.onwriteend = async function(e) {//«
			if (!truncated) {
				truncated = true;
				this.truncate(this.position);
				return;
			} 
			let arr = fent.fullPath.split("/");
			arr.shift();
			arr.shift();
			let fname = arr.pop();
			let parpath = "/"+arr.join("/");
			let parobj = await pathToNode(parpath);
			if (!parobj) throw new Error("parobj not found!");
			if (!parobj.KIDS) throw new Error("parobj does not have KIDS!");
			let is_link = false;
			if (LINK_RE.test(fname)){
				fname = fname.replace(`.${LINK_EXT}`,"");
				is_link = true;
			}
			let obj = parobj.KIDS[fname];
			if (!(obj&&obj.fullpath)) {
//DJTERNFGH
				obj = {
					NAME: fname,
					par: parobj,
					root: parobj.root,
					entry: fent,
					fullpath: `${parpath}/${fname}`
				};
				parobj.KIDS[fname] = obj;
				add_lock_funcs(obj);
			}

			let file = await getFsFileFromEntry(fent);
			obj.file = file;
			obj.MT = get_time_str_from_file(file);
			obj.SZ = file.size;
			fent._fileObj = obj;
			if (is_link) {
				let ln = blob.__value;
				obj.APP="Link";
				obj.LINK = ln;
				if (typeof ln !== "string"){
cwarn("The link value is NOT a string");
log(ln);
					obj.badlink=true;
				}
				else if (!await pathToNode(ln)) obj.badlink=true;
				else obj.badlink=false;
			}
			if (fname.match(/\.app$/)) obj.appicon = blob.__value;
			let bytes = this.position;
			fent._currentSize = bytes;

			cb([obj, this, realsize]);
		};//»
		writer.onerror = function(e) {
			cerr('WRITE ERR:' + fname + " " + val.length);
			cb();
		};
		writer.write(blob);
	}, err);
}
const _writeFsFileByEntry=(fent,blob, opts={})=>{
	return new Promise((Y,N)=>{
		_write_fs_file(fent, blob, Y, opts);
	});
}
//»
const check_fs_dir_perm = (obj, is_root, is_sys, userarg) => {//«
	if (is_sys) return true;
	let iter = 0;
	while (obj.treeroot !== true) {
		iter++;
		if (iter >= 10000) throw new Error("UMWUT");
		if (obj.readonly){
			if (is_sys) return true;
			return false;
		}
		if ("perm" in obj) {
			let perm = obj.perm;
			if (perm === true) return true;
			else if (perm === false) {
				if (is_root) return true;
				return false;
			}
			else if (isstr(perm)) {
				if (is_root) return true;
				let checkname = userarg || Core.get_username();
				return (checkname === perm);
//				return (Core.get_username() === perm);
			}
			else {
cerr("Unknown obj.perm field:", obj);
			}
		}
		obj = obj.par;
	}

	if (is_root) return true;
	return false;
};
this.check_fs_dir_perm=check_fs_dir_perm;
//»
const checkDirPerm=(path_or_obj,opts={})=>{//«
	return new Promise(async(Y,N)=>{
		let obj;
		if (isstr(path_or_obj)){
			obj = await pathToNode(path_or_obj);
			if (!obj) return Y(false);
		}
		Y(check_fs_dir_perm(obj, opts.root, opts.sys, opts.user));
	});
};//»
const delete_fobj = (obj, is_root)=>{//«
return new Promise(async(Y,N)=>{


	let is_folder = (obj.APP == FOLDER_APP);
	let root = obj.root;
	if (root == obj && obj.par != obj) root = obj.par.root;
	let name = obj['NAME'];
//log(obj);
	let par = obj.par;
//HSDKKRUYGHNDK
	let path = obj.fullpath;
cwarn(`Removing path: '${path}'`);
//	let path = path_from_node(obj);
	let parpath = par.fullpath;
	let app = obj.APP;
	if (root.TYPE !== "fs") {
cerr("delete_fobjs:DELETE TYPE:" + root.TYPE + "!?!?!?!?!?");
		return Y();
	}

	let delpath;
	if (obj.LINK) delpath = `${path}.${LINK_EXT}`;
	else delpath = path;
//log(Core.fs_url(delpath));
	let [delret, errmess] = await rmFsFile(delpath, is_folder, is_root);
//	let [delret, errmess] = await rmFsFile(path, is_folder, is_root);
	if (!delret){
cerr(`Could not remove: ${delpath} (${errmess})`);
		return Y();
	}

	delete par['KIDS'][name];

	if (!Desk) return Y(true);
	let namearr = Core.api.getNameExt(path);
	let usepath = parpath + "/" + namearr[0];
	let useext = namearr[1];
	let win = Desk.get_win_by_path(usepath, useext);
	if (win && win.force_kill) win.force_kill();
	let icons = Desk.get_icons_by_path(usepath, useext);
	for (let icn of icons) {
		if (icn.overdiv && icn.overdiv.cancel_func) icn.overdiv.cancel_func();
		Desk.rm_icon(icn);
	}
	Y(true);


});
};//»
const check_ok_rm = (path, errcb, is_root, do_full_dirs)=>{//«
return new Promise(async(Y,N)=>{

		let obj = await pathToNode(path, true);
		if (!obj){
			errcb(`could not stat: ${path}`);
			Y();
			return;
		}
		let rtype = null;
		rtype = obj.root.TYPE;
		if (obj.treeroot === true) {
			errcb("ignoring the request to remove root");
			Y();
			return;
		}
		if (obj.APP !== FOLDER_APP) {//«
			if (rtype!=="fs"){
				errcb(`${path}: not (currently) handling fs type: '${rtype}'`);
				Y();
				return;
			}
			if (!check_fs_dir_perm(obj.par, is_root)) errcb(`${path}: permission denied`);
			else if (obj.write_locked) errcb(`${path} is "write locked"`);
			else return Y(obj);
			Y();
			return;
		}//»
		if (rtype != "fs") {
			errcb(`not removing directory type: '${rtype}': ${path}`);
			Y();
			return;
		}
		if (Desk && (path == globals.desk_path)) {
			errcb(`not removing the working desktop path: ${path}`);
			Y();
			return;
		} 
		if (obj.par.treeroot) {
			errcb(`not removing toplevel directory: ${path}`);
			Y();
			return;
		} 
		if (obj.MOVE_LOCKS.length){
			errcb(`${path}: is "move locked"`);
			Y();
			return;
		}
		if (!obj.done) obj.KIDS = await populateFsDirObjByPath(obj.fullpath);
		let numkids = getkeys(obj.KIDS).length;
		if (!do_full_dirs && numkids > 2) {
			errcb(`${path}: not an empty folder`);
			Y();
			return;
		}
		if (!check_fs_dir_perm(obj, is_root)) {
			errcb(`${path}: permission denied`);
			Y();
			return;
		}
		Y(obj);
});
};//»
const do_fs_rm = async(args, errcb, cb, opts={}) => {//«

	let cwd = opts.CWD;
	let is_root = opts.ROOT;
	let do_full_dirs = opts.FULLDIRS;
	let arr = [];
	let no_error = true;
	for (let path of args){
		let rv = await check_ok_rm(
			normalize_path(path, cwd), 
			errcb, 
			is_root, 
			do_full_dirs
		);
		if (!rv) {
			no_error = false;
			continue;
		}
		arr.push(rv);
	}
	for (let obj of arr) {
		if (!await delete_fobj(obj, is_root)) no_error = false;
	}
	cb(no_error);

}
//»
const doFsRm=(args, errcb, opts={})=>{//«
	return new Promise((Y,N)=>{
		do_fs_rm(args, errcb, Y, opts);
	});
};//»
const check_unique_path = (path, is_root) => {//«
	return new Promise(async(res, rej) => {
		path = path.replace(/\/+$/,"");
		let arr = path.split("/");
		let name = arr.pop();
		let parpath = arr.join("/");
		let fobj = await pathToNode(parpath);
		if (!fobj) return rej("No parent path:\x20" + parpath);
		if (fobj.APP != FOLDER_APP) return rej("Parent is not a Folder,(got" + fobj.APP + ")");
		if (fobj.KIDS[name]) return res("The name already exists:\x20" + name);
		res([fobj.fullpath + "/" + name, fobj.fullpath, name]);
	});
};//»
const get_unique_path = (path, opts, is_root) => {//«
	if (!opts) opts = {};
	let from_num = opts.NUM;
	path = path.replace(/\/+$/,"");
	return new Promise(async (res, rej) => {
		try {
			let ret = await check_unique_path(path, is_root);
			if (isArr(ret)) return res(ret);
		} catch (e) {
			return rej(e);
		}
		if (!from_num) from_num = 1;
		else if (!isint(from_num)) return rej("NaN:\x20" + from_num);
		let parr = path.split("/");
		let fname = parr.pop();
		let parpath = parr.join("/");
		let max_iters = 100;
		let to_num = from_num + max_iters;
		for (let i = from_num; i < to_num; i++) {
			let trypath = parpath + "/" + i + "~" + fname;
			try {
				let ret = await check_unique_path(trypath, is_root);
				if (isArr(ret)) return res(ret);
			} catch (e) {
				return rej(e);
			}
		}
		rej("Giving up after:\x20" + max_iters + " tries");
	});
};//»
const mk_fs_dir = async(parpatharg, fname, cb, is_root, if_no_make_icon) => {//«
	const cberr = (str) => {
		cb(null, str);
	};
	const cbok = (val) => {
		if (!val) val = true;
		cb(val);
	};
	let parpath = parpatharg.regpath();
	let obj = await pathToNode(parpath);
	if (!obj) {
		cberr(`${parpath}: no such directory`);
		return;
	}
	const mkfobj = () => {
		let newobj = {
			NAME: fname,
			APP: FOLDER_APP,
			root: obj.root,
			par: obj,
			fullpath: parpath+"/"+fname,
			KIDS: {},
			MOVE_LOCKS:[]
		};
		set_rm_move_lock(newobj);
		newobj.KIDS['.'] = newobj;
		newobj.KIDS['..'] = obj;
		obj.KIDS[fname] = newobj;
	};

	let type = obj.root.TYPE;
	let kids = obj.KIDS;
	if (!kids) return cberr(`${parpath}: not a directory`);
	if (kids[fname]) return cberr(`${parpath}/${fname}: already exists`);
	if (type == "fs") {
		if (obj.NAME == "home" && obj.par.treeroot && fname === Core.get_username()) {}
		else if (!check_fs_dir_perm(obj, is_root)) return cberr("permission denied");

        let [ret] = await _getOrMakeDir(parpath, fname);
		if (ret) {
log("RET",ret);
			if (!Desk) return cbok();
			if (!if_no_make_icon) Desk.make_icon_if_new(ret);
			cbok();
		} else cberr();
/*
		_get_or_make_dir(parpath, fname, async ret => {
			if (ret) {
				if (!Desk) return cbok();
				if (!if_no_make_icon) Desk.make_icon_if_new(ret);
				cbok();

			} else cberr();
		});
*/
	}
	else {
		cberr(`not supporting type: ${type}`);
		return;
	}
}//»
const mkFsDir = (parpatharg, fname, is_root, if_no_make_icon)=>{//«
	return new Promise((Y,N)=>{
		mk_fs_dir(parpatharg, fname, Y, is_root, if_no_make_icon);
	});
};//»
/*
const _get_or_make_dir = (rootname, path, cb, getonly, if_mkdir) => {//«
if (globals.read_only&&if_mkdir){
//log(getonly, if_mkdir);
READONLY();
cb();
return;
}
	const check_or_make_dir = (obj, dir, name, _cb) => {//«
		if (obj.KIDS) {
			let kidobj = obj.KIDS[name];
			if (kidobj) {
				dir.getDirectory(name, {
					create: true
				}, dirret => {
					if (kidobj.APP == FOLDER_APP) _cb(kidobj, dirret);
					else _cb();
				}, log);
			} else if (getonly) {
				dir.getDirectory(name, {}, dirret => {
					let haveobj = {
						NAME: name,
						APP: FOLDER_APP,
						root: rootobj,
						par: obj,
						KIDS: {},
						MOVE_LOCKS:[]
					};
					set_rm_move_lock(haveobj);
					haveobj.KIDS['.'] = haveobj;
					haveobj.KIDS['..'] = obj;
					obj.KIDS[name] = haveobj;
					_cb(haveobj, dirret);
				}, _ => {
					_cb();
				});
			} else {
				dir.getDirectory(name, {
					create: true
				}, dirret => {
					let newobj = {
						NAME: name,
						APP: FOLDER_APP,
						root: rootobj,
						par: obj,
						fullpath: obj.fullpath+"/"+name,
						KIDS: {},
						MOVE_LOCKS:[]
					};
					set_rm_move_lock(newobj);
					newobj.KIDS['.'] = newobj;
					newobj.KIDS['..'] = obj;
					obj.KIDS[name] = newobj;
					_cb(newobj, dirret);
					if (if_mkdir && Desk) Desk.make_desk_folder(obj.fullpath, name);
				}, log);
			}
		} else _cb();
	};//»
	if (rootname.match(/\x2f/)) {
		let arr = rootname.split("\/");
		if (!arr[0]) arr.shift();
		rootname = arr.shift();
		path = arr.join("/") + "/" + path;
	}
	let usefs = fs_root;
	let useroot = root;
	let rootobj = useroot.KIDS[rootname];
	let rootdir;
	let argobj;
	if (getonly) argobj = {};
	else {
		argobj = {create: true};
	}
	usefs.getDirectory(rootname, argobj, dirret => {
		if (!path) {
			cb(rootobj, dirret);
			return;
		}
		rootdir = dirret;
		let arr = path.split("/");
		if (!arr[0]) arr.shift();
		if (!arr[arr.length - 1]) arr.pop();
		if (!arr.length) {
			cb(rootobj, dirret);
			return;
		}
		if (rootobj && rootobj.par.treeroot) {
			let rtype = rootobj.TYPE;
			if (rtype == "fs") {
				let curobj = rootobj;
				let curdir = rootdir;
				let iter = -1;
				let dodir = () => {
					iter++;
					if (iter == arr.length) {
						cb(curobj, curdir);
						return;
					}
					check_or_make_dir(curobj, curdir, arr[iter], (objret, dirret) => {
						curobj = objret;
						curdir = dirret;
						if (!curobj) {
							cb();
							return;
						}
						dodir();
					});
				};
				dodir();
			}
		} else {
			cb();
			log("_get_or_make_dir():NO rootobj && rootobj.par.treeroot:<" + rootname + "><" + path + ">");
			log(rootobj);
		}
	}, _ => {
cerr(`can't get /${rootname}`);
		cb();
	});
}
const _getOrMakeDir=(rootname, path, getonly, if_mkdir)=>{
	return new Promise((Y,N)=>{
		_get_or_make_dir(rootname, path, (rv1, rv2)=>{
			Y([rv1, rv2]);
		}, getonly, if_mkdir);
	});
};
const getOrMakeDir=(rootname, path, opts={})=>{
	return new Promise((Y,N)=>{
		_get_or_make_dir(rootname, path, Y, opts.getOnly, opts.mkDir);
	});
};
//»
*/

const _get_or_make_dir = async(rootname, path, cb, getonly, if_mkdir) => {//«
if (globals.read_only&&if_mkdir){
//log(getonly, if_mkdir);
READONLY();
cb();
return;
}

	const _getrootdir = (rname, arg)=>{//«
		return new Promise((Y,N)=>{
			usefs.getDirectory(rname, arg, Y, (e)=>{
cerr();
				Y();
			});
		});
	};//»
	const _getdir = (dir, name, arg)=>{//«
		return new Promise((Y,N)=>{
			dir.getDirectory(name, arg, Y, (e)=>{
cerr();
				Y();
			});
		});
	};//»
	const check_or_make_dir = (obj, dir, name) => {//«
	return new Promise(async(Y,N)=>{

		if (!obj.KIDS) return Y([]);
//		if (obj.KIDS) {
		let kidobj = obj.KIDS[name];
		if (kidobj) {
			let dirret = await _getdir(dir, name,{create: true});
			if (!dirret) return Y([]);
			if (kidobj.APP == FOLDER_APP) Y([kidobj, dirret]);
			else Y([]);
/*//«
			dir.getDirectory(name, {
				create: true
			}, dirret => {
				if (kidobj.APP == FOLDER_APP) Y([kidobj, dirret]);
				else Y([]);
			}, e=>{
cerr(e);
				Y([]);
			});
//»*/
			return;
		} 
		if (getonly) {
			let dirret = await _getdir(dir, name,{});
			if (!dirret) return Y([]);
			let kid = {
				NAME: name,
				APP: FOLDER_APP,
				root: rootobj,
				par: obj,
				KIDS: {},
				MOVE_LOCKS:[]
			};
			set_rm_move_lock(kid);
			kid.KIDS['.'] = kid;
			kid.KIDS['..'] = obj;
			obj.KIDS[name] = kid;
			Y([kid, dirret]);
/*«
			dir.getDirectory(name, {}, dirret => {
				let haveobj = {
					NAME: name,
					APP: FOLDER_APP,
					root: rootobj,
					par: obj,
					KIDS: {},
					MOVE_LOCKS:[]
				};
				set_rm_move_lock(haveobj);
				haveobj.KIDS['.'] = haveobj;
				haveobj.KIDS['..'] = obj;
				obj.KIDS[name] = haveobj;
				Y([haveobj, dirret]);
			}, e => {
cerr(e);
				Y([]);
			});
»*/
			return;
		} 
//		else {
		let dirret = await _getdir(dir, name,{create: true});
		if (!dirret) return Y([]);
		let kid = {
			NAME: name,
			APP: FOLDER_APP,
			root: rootobj,
			par: obj,
//SKUYTGKLW
			entry: dirret,
			fullpath: obj.fullpath+"/"+name,
			KIDS: {},
			MOVE_LOCKS:[]
		};
		set_rm_move_lock(kid);
		kid.KIDS['.'] = kid;
		kid.KIDS['..'] = obj;
		obj.KIDS[name] = kid;
		Y([kid, dirret]);
		if (if_mkdir && Desk) Desk.make_desk_folder(obj.fullpath, name);
/*//«
			dir.getDirectory(name, {
				create: true
			}, dirret => {
				let newobj = {
					NAME: name,
					APP: FOLDER_APP,
					root: rootobj,
					par: obj,
					fullpath: obj.fullpath+"/"+name,
					KIDS: {},
					MOVE_LOCKS:[]
				};
				set_rm_move_lock(newobj);
				newobj.KIDS['.'] = newobj;
				newobj.KIDS['..'] = obj;
				obj.KIDS[name] = newobj;
				Y([newobj, dirret]);
				if (if_mkdir && Desk) Desk.make_desk_folder(obj.fullpath, name);
			}, e=>{
cerr(e);
				Y([]);
			});
//»*/
//		}
//		} 
	});
	};//»
	if (rootname.match(/\x2f/)) {
		let arr = rootname.split("\/");
		if (!arr[0]) arr.shift();
		rootname = arr.shift();
		path = arr.join("/") + "/" + path;
	}
	let usefs = fs_root;
	let useroot = root;
	let rootobj = useroot.KIDS[rootname];
	let rootdir;
	let argobj;
	if (getonly) argobj = {};
	else {
		argobj = {create: true};
	}
//	usefs.getDirectory(rootname, argobj, dirret => {
	let dirret = await _getrootdir(rootname, argobj);
	if (!dirret){
		cerr(`can't get /${rootname}`);
		cb();
		return;
	}
	if (!path) {
		cb(rootobj, dirret);
		return;
	}
	rootdir = dirret;
	let arr = path.split("/");
	if (!arr[0]) arr.shift();
	if (!arr[arr.length - 1]) arr.pop();
	if (!arr.length) {
		cb(rootobj, dirret);
		return;
	}
	if (!(rootobj && rootobj.par.treeroot)){
		cb();
		cerr("_get_or_make_dir():NO rootobj && rootobj.par.treeroot:<" + rootname + "><" + path + ">");
		log(rootobj);
		return;
	}
//	if (rootobj && rootobj.par.treeroot) {
	let rtype = rootobj.TYPE;
	if (rtype == "fs") {
		let curobj = rootobj;
		let curdir = rootdir;
/*//«
		let iter = -1;
		let dodir = async() => {
			iter++;
			if (iter == arr.length) {
				cb(curobj, curdir);
				return;
			}
			let [objret, dirret] = await check_or_make_dir(curobj, curdir, arr[iter]);
//					check_or_make_dir(curobj, curdir, arr[iter], (objret, dirret) => {
			curobj = objret;
			curdir = dirret;
			if (!curobj) {
				cb();
				return;
			}
			dodir();
//					});
		};
//»*/
		for (let dir of arr){
			let [objret, dirret] = await check_or_make_dir(curobj, curdir, dir);
			curobj = objret;
			curdir = dirret;
			if (!curobj) {
				cb();
				break;
			}
		}
		cb(curobj, curdir);
	}
//	} 
//	else {
//	}
}
const _getOrMakeDir=(rootname, path, getonly, if_mkdir)=>{
	return new Promise((Y,N)=>{
		_get_or_make_dir(rootname, path, (rv1, rv2)=>{
			Y([rv1, rv2]);
		}, getonly, if_mkdir);
	});
};
//»

const move_kids = async(srcpath, destpath, cb, if_copy, if_root) => {//«
	const doupdate=(kids)=>{
		for (let nm in kids){
			if (nm=="."||nm=="..") continue;
			let kid = kids[nm];
			kid.fullpath = path_from_node(kid);
			if (kid.KIDS) doupdate(kid.KIDS);
		}
	};
	let srcarr = srcpath.split("/");
	let srcname = srcarr.pop();
	let srcparpath = srcarr.join("/");
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	let srcparobj = await pathToNode(srcparpath);
	if (!srcparobj){
cwarn("THERE WAS NO SRCPAROBJ returned with path:" + srcparpath);
		cb();
		return
	}
	let srckids = srcparobj.KIDS;
	let kidobj = srckids[srcname];
	if (!kidobj){
cwarn("THERE WAS NO KIDS FILE NAMED:" + srcname + " IN SOURCE DIR:" + srcparpath);
		cb();
		return;
	}
	let newkid;
	let app = kidobj.APP;
	if (!if_copy) {
		delete srckids[srcname];
		newkid = kidobj;
	} 
	else {
//WKMFPOILV
		newkid = {};
		for (let k of getkeys(kidobj)) {
			if (k === "BUFFER") newkid.BUFFER = [];
			else newkid[k] = kidobj[k]
		}
	}
	let destparobj = await pathToNode(destparpath);
	if (!destparobj) {
cwarn("THERE WAS NO DESTPAROBJ returned with path:" + destparpath);
		cb();
		return;
	}
//	Added on 2/4/20 @8:30 am EST 
//	vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
//	destparobj.fullpath = path_from_node(destparobj);
//	newkid.path = destparobj.fullpath;
//	newkid.fullpath = destparobj.fullpath +"/"+newname;
//	newkid.fullpath = destparobj.fullpath +"/"+newname;

//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	newkid.par = destparobj;
	newkid.root = destparobj.root;
	if (newkid.KIDS) {
		newkid.KIDS['..'] = destparobj;
	}
	newkid.NAME = newname;
	destparobj.KIDS[newname] = newkid;
	newkid.path = destparobj.fullpath;
	newkid.fullpath = path_from_node(newkid);
	if (if_copy) {
		if (!newkid.KIDS) {
			add_lock_funcs(newkid);
		}
	}
	else {
//WNHGDDJKUYH
		if (newkid.KIDS) doupdate(newkid.KIDS);
	}
	cb(destparobj, newkid);
}
//»
const mv_by_path = async(srcpath, destpath, apparg, cb, if_copy, if_root) => {//«
if (globals.read_only){
READONLY();
cb();
return;
}
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	let realsrcpath, realnewname;
	if (apparg==="Link") {
		realsrcpath = `${srcpath}.${LINK_EXT}`;
		realnewname = `${newname}.${LINK_EXT}`;
	}
	else {
		realsrcpath = srcpath;
		realnewname = newname;
	}
	let [fent,errmess] = await _getFsEntByPath(realsrcpath, apparg === FOLDER_APP, false, true);
	if (!fent){
cwarn("No fent returned from srcpath:" + srcpath);
cerr(errmess);
		cb();
		return;
	}
	let [dirent] = await _getFsEntByPath(destparpath, true, false, true);
	try {
		if (if_copy) {
			fent.copyTo(dirent, realnewname, ()=>{
				move_kids(srcpath, destpath, cb, true, if_root)
			}, e=>{
cerr(e);
				cb();
			});
		} 
		else {
			fent.moveTo(dirent, realnewname, ()=>{
				move_kids(srcpath, destpath, cb, false, if_root)
			}, e=>{
cerr(e);
				cb();
			});
		}
	} catch (e) {
		cerr(e);
		cb();
	}
}
//»
const rm_fs_file = async(path, cb, ifdir, if_root) => {//«
	if(globals.read_only){READONLY();cb();return;}
	if (ifdir) {
		let [dirent, errmess] = await _getFsEntByPath(path, true, false, if_root);
		if (!dirent) return cb(null, errmess);
		dirent.removeRecursively(() => {
			cb(true);
		}, e => {
			cb();
cerr(e);
		});
		return;
	} 
	let [fent,err]=await getFsByPath(path,{GETLINK:true, ENT:true, ROOT:if_root});
	if (!fent) return cb(null, err);
	fent.remove(() => {
		cb(true);
	}, e => {
		cb();
cerr(e);
	});
}
//»
const rmFsFile=(path, if_dir, if_root)=>{//«
	return new Promise((Y,N)=>{
		rm_fs_file(path, (ret, err)=>{
			Y([ret,err])
		}, if_dir, if_root);
	});
};//»
const touch_fs_file = async(patharg, cb, if_root) => {//«
};
//»
const get_fs_ent_by_path = (patharg, cb, if_dir, if_make, if_root) => {//«
	if (typeof if_dir == "string") {
		if (if_dir != FOLDER_APP) if_dir = false;
		else if_dir = true;
	}
	get_fs_by_path(patharg, cb, {
		GETLINK: LINK_RE.test(patharg),//WONTYDJPO
		ENT: true,
		DIR: if_dir,
		MAKE: if_make,
		ROOT: if_root
	});
}
const _getFsEntByPath=(path, if_dir, if_make, if_root)=>{
	return new Promise((Y,N)=>{
		get_fs_ent_by_path(path,(rv1,rv2)=>{
			Y([rv1, rv2]);
		}, if_dir, if_make, if_root);
	});
};
//»
const getFsFileFromFent = (fent, if_blob, mimearg, start, end) =>{//«
	return new Promise((Y,N)=>{
		get_fs_file_from_fent(fent, Y, if_blob, mimearg, start, end)
	});
};//»
const get_fs_file_from_fent = (fent, cb, if_blob, mimearg, start, end) => {//«
	fent.file(file => {

let getlen;
let sz = file.size;
if (Number.isFinite(start)){
	if (start < 0){
		cb(null, "A negative start value was given: "+start);
		return;
	}
	if (Number.isFinite(end)){
		if (end <= start){
			cb(null,`The end value (${end}) is <= start (${start})`);
			return;
		}
		sz = end - start;
	}
	else sz = file.size - start;
	
}
else if (Number.isFinite(end)){
cb(null, "No legal 'start' value was provided! (got a legal end value)");
log(file);
return;
}

		if (sz > MAX_FILE_SIZE) {
			let s = "The file's size is\x20>\x20MAX_FILE_SIZE=" + MAX_FILE_SIZE + ". Please use start and end options!";
			cwarn(s);
			cb(null,s);
			return;
		}
		let reader = new FileReader();
		reader.onloadend = function(e) {
			let val = this.result;
			if (if_blob) {
				if (mimearg) val = new Blob([val], {
					type: "blob"
				});
				else {
					cb(new Uint8Array(val), fent, true);
					return;
				}
			}
			cb(val, fent, true);
		};
//		if (pos_arr) file = file.slice(pos_arr[0], pos_arr[1]);
		if (Number.isFinite(start)) {
			if (Number.isFinite(end)) {
				file = file.slice(start, end);
			}
			else file = file.slice(start);
		}
		if (if_blob) reader.readAsArrayBuffer(file);
		else reader.readAsText(file);
	}, () => {
		cb();
		cerr("FAIL:get_fs_file_from_fent");
	});
}
//»
const get_fs_file = (dir, fname, cb, if_blob, mimearg, if_ent, if_dir, if_make, start, end) => {//«
//const get_fs_file = (dir, fname, cb, if_blob, mimearg, if_ent, if_dir, if_make, nbytes) => {
	const err = (e) => {
		cb(null,"dir.getFile error handler");
	};
	var arg = {};
	if (if_make) {
		arg.create = true;
if (globals.read_only){
READONLY();
cb();
return;
}
	}
	if (if_dir) {
		dir.getDirectory(fname, arg, cb, e => {
			cb(null);
		});
	} else {
		dir.getFile(fname, arg, fent => {
			if (if_ent) {
				cb(fent);
				return;
			}
			get_fs_file_from_fent(fent, cb, if_blob, mimearg, start, end);
		}, err);
	}
}//»
const get_fs_by_path = async(patharg, cb, opts = {}) => {//«
	let if_blob = opts.BLOB;
	let if_ent = opts.ENT;
//cwarn(patharg, opts);
	let if_dir = opts.DIR;
	let if_make = opts.MAKE;
	let if_json = opts.JSON;
//	let nbytes = opts.NBYTES;
	let start = opts.start;
	let end = opts.end;
	let if_root = opts.ROOT;
	let arr = patharg.split("/");
	arr.shift();
	let rootname = arr.shift();
	let fsarg;
//log(fname, if_dir);
//log(patharg);
//log(arr);
	if (!arr.length) {
		get_fs_file((fsarg || fs_root), rootname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
		return;
	}
	let [ret,lastdir,normpath]=await pathToNode(patharg, opts.GETLINK, true);
	let lastdirpath = null;
	let realpath;
	let fname;
	if (!ret) {
		if (!if_make) return cb(null, `${patharg}: could not stat the file`);
//log("SLATT",lastdir, normpath);
		if (!(lastdir && normpath)) return cb(null);
//		lastdirpath = objpath(lastdir);
		lastdirpath = lastdir.fullpath;
		arr = normpath.split("/");
		fname = arr.pop();
		if ((lastdirpath + "/" + fname) !== normpath) return cb(null, lastdirpath + ":\x20no such directory");
	} else {
//		let realpath = objpath(ret);
		let realpath = ret.fullpath;
		arr = realpath.split("/");
		fname = arr.pop();
		if (ret.LINK) fname = `${fname}.${LINK_EXT}`;
	}

	if (LINK_RE.test(patharg)) fname = `${fname}.${LINK_EXT}`;

	arr.shift();
	rootname = arr.shift();
	let path = null;
	if (arr.length) path = arr.join("/");
    let [objret, dirret] = await _getOrMakeDir(rootname, path, true);
    if (!dirret) {
        cb(null, `${rootname}/${path}/${fname}: could not stat the file`);
        return;
    }

    get_fs_file(dirret, fname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
/*
	_get_or_make_dir(rootname, path, (objret, dirret) => {
		if (!dirret) {
			cb(null, `${rootname}/${path}/${fname}: could not stat the file`);
			return;
		}
		get_fs_file(dirret, fname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
	}, true);
*/
}
const getFsByPath=(patharg, opts)=>{
	return new Promise((Y,N)=>{
		get_fs_by_path(patharg, (rv1, rv2, rv3)=>{
			Y([rv1, rv2, rv3]);
		}, opts);
	});
};
//»
const save_fs_by_path = async(patharg, val, cb, opts={}) => {//«
	patharg = patharg.replace(/\/+/g, "/");
	let apparg = opts.APPARG;
	let if_append = opts.APPEND||opts.append;
	let mimearg = opts.MIMEARG;
	let if_root = opts.ROOT;
	let if_mkdir = opts.MKDIR;
	let err = null;
	let arr = patharg.split("/");
	arr.shift();
	let arrlen = arr.length;
	let rootname = arr.shift();
	let fname = arr.pop();
	let path = null;
	if (arr.length) path = arr.join("/");
	else path = "/";
	let [objret, dirret] = await _getOrMakeDir(rootname, path, false, if_mkdir);
	if (!dirret) {
		cb(null, "Could not stat the file");
		return;
	}
	save_fs_file(dirret, objret, fname, val, cb, {
		spliceStart: opts.spliceStart,
		spliceEnd: opts.spliceEnd,
		append: if_append,

		MIMEARG: mimearg,
		ROOT: if_root,
		ISLINK: opts.isLink
	});
}
this.save_fs_by_path = save_fs_by_path;
//»
const save_fs_file = (dir, obj, fname, val, cb, opts = {}) => {//«
	const err = (e) => {
console.error("dir.getFile",e);
		cb();
	};
	if (globals.read_only){
		//cerr("Read Only");
		READONLY();
		cb();
		return;
	}
	let mimearg = opts.MIMEARG;
	let if_append = opts.APPEND||opts.append;
	let if_root = opts.ROOT;
	let blob;
	if (val instanceof Blob) blob = val;
	else if (val instanceof ArrayBuffer) blob = new Blob([val], {
		type: "blob"
	});
	else {
		blob = new Blob([val], {
			type: "blob"
		});
		blob.__value = val;
	}
	if (LINK_RE.test(fname)){
cerr(`${fname}: not writing to 'link' extension (${LINK_EXT})`);
		cb();
		return;
	}
	let save_name;
	if (opts.ISLINK) save_name = `${fname}.${LINK_EXT}`;
	else save_name = fname;

	dir.getFile(save_name, {
		create: true
	}, async fent => {
	let [ret, thisobj, reallenret] = await _writeFsFileByEntry(fent, blob, {append:if_append, spliceStart: opts.spliceStart, spliceEnd: opts.spliceEnd});
	if (!ret) return cb();
	cb(ret, thisobj.position, reallenret);
/*«
	_write_fs_file(fent, blob, async(ret, thisobj, reallenret) => {
		if (!ret) return cb();
		cb(ret, thisobj.position, reallenret);
	}, if_append, (val && val.length == 1 && val.charCodeAt() == 0), opts);
»*/
	}, err);
}
//»


//»
//Init/Populate Dirs«

const get_tree=(which,type)=>{//«
	let dir={NAME:which,TYPE:type,KIDS:{},APP:FOLDER_APP,sys:true,fullpath:`/${which}`};
	dir.root=dir;
	dir.KIDS['.']=dir;
	return dir;
}//»
const mount_dir=(name,obj,rootarg, use_pref)=>{//«
	let _root=rootarg||root;
	if(_root.KIDS[name])return;
	if (use_pref) obj.fullpath=`${use_pref}/${name}`;
	else obj.fullpath=`/${name}`;
	obj.NAME=name;
	obj.par=_root;
	obj.KIDS['..']=_root;
	obj.KIDS['.']=obj;
	_root.KIDS[name]=obj;
	return obj;
}//»
this.make_local_tree = (name, port) => {//«
	return new Promise(async(Y,N)=>{
		let rv;
		let err;
		try {
			rv = await fetch(loc_url(port)+"/");
		}
		catch(e){
			err = e;
		}
		if (!(rv&&rv.ok&&await rv.text()==="HI")) {
			let mess = "Invalid response from server";
			if (err){
				if (err.message) mess = err.message;
				else mess = err;
			}
			return N(mess);
		}
		let tree = get_tree(name, "local");
		tree.port = port;
		tree.origin = loc_url(port);
		mount_dir(name, tree, root.KIDS.mnt, "/mnt");
		Y(true);
	});
};//»
const make_bin_tree = ()=>{//«
	return new Promise(async (Y,N)=>{
		let par = mount_dir("bin", get_tree("bin", "bin"));
		let kids = par.KIDS;
		let rv = await fetch("/_getbin");
		let arr = await rv.json();
		for (let name of arr){
			let kid = {
				NAME: name,
				APP: "Com"
			};
			kid.fullpath = "/bin/"+name;
			kid.par = par;
			kid.root = par;
			kids[name]=kid;
		}
		par.done=true;
		par.longdone=true;
		Y();
	});
};//»
const make_dir_tree = name => {//«
return new Promise((Y,N)=>{

	const new_root_tree = (name, type) => {//«
		let obj = {
			APP: FOLDER_APP,
			NAME: name,
			KIDS: {},
			TYPE: "fs",
			is_root: true,
			fullpath: `/${name}`
		};
		return obj;
	};//»
	let dirstr = null;
	let tree = new_root_tree(name);
	let kids = tree.KIDS;
	tree.root = tree;
	tree.par = root;
	kids['.'] = tree;
	kids['..'] = root;
	root.KIDS[name] = tree;
	fs_root.getDirectory(name, {
		create: true
	}, dirret => {
		tree.entry = dirret;
		Y(tree);
	}, () => {});

});
};//»
this.make_all_trees = async(allcb) => {//«
	mount_dir("mnt", get_tree("mnt", "mount"));
	mount_dir("www", get_tree("www", "www"));
	await make_bin_tree();
	for (let name of root_dirs){
		let ret = await make_dir_tree(name);
		if (name == "tmp") ret.perm = true;
		else ret.perm = false;
		ret.KIDS['.'] = ret;
		ret.KIDS['..'] = root;
		root.KIDS[name] = ret;
	}
	allcb(true);
}
//»

/*
const mkdirkid = (par, name, opts) => {//«
//const mkdirkid = (par, name, is_dir, sz, mod_time, path, hashsum, file, ent) => 

	let is_dir = opts.isDir;
	let is_link = opts.isLink;
	let sz = opts.size;
	let mod_time = opts.modTime;
	let path = opts.path;
	let file = opts.file;
	let ent = opts.entry;

	let kid;
	if (opts.useKid) kid = opts.useKid;
	else {
//YEIMNJHFP
		kid={NAME:name,par:par,root:par.root};
	}

	if (is_dir) {
		kid.APP = FOLDER_APP;
		if (par.par.treeroot == true) {
			if (par.NAME == "home") kid.perm = name;
			else if (par.NAME == "var" && name == "cache") kid.readonly = true;
		}
		let kidsobj = {
			'..': par
		};
		kidsobj['.'] = kid;
		kid.KIDS = kidsobj;
		kid.MOVE_LOCKS=[];
		set_rm_move_lock(kid);
	}
	else if (is_link) kid.APP="Link";
	else {
		kid.APP = capi.extToApp(name);
		add_lock_funcs(kid);
	}	
	if (mod_time) {
		kid.MT = mod_time;
		kid.SZ = sz;
	}
	kid.path = path;
	kid.fullpath = path + "/" + name;
	kid.file = file;
	kid.entry = ent;
	return kid;
}//»
*/

const mkdirkid = (par, name, opts) => {//«
//const mkdirkid = (par, name, is_dir, sz, mod_time, path, hashsum, file, ent) => 

	let is_dir = opts.isDir;
	let is_link = opts.isLink;
	let sz = opts.size;
	let mod_time = opts.modTime;
	let path = opts.path;
	let file = opts.file;
	let ent = opts.entry;

	let kid;
	if (opts.useKid) kid = opts.useKid;
	else {
//YEIMNJHFP
		kid={NAME:name,par:par,root:par.root};
	}

	if (is_dir) {
		kid.APP = FOLDER_APP;
		if (par.par.treeroot == true) {
			if (par.NAME == "home") kid.perm = name;
			else if (par.NAME == "var" && name == "cache") kid.readonly = true;
		}
		let kidsobj = kid.KIDS || {'..': par};
//		let kidsobj = {
//			'..': par
//		};
		kidsobj['.'] = kid;
		kid.KIDS = kidsobj;
		kid.MOVE_LOCKS=[];
		set_rm_move_lock(kid);
	}
	else if (is_link) kid.APP="Link";
	else {
		kid.APP = capi.extToApp(name);
		add_lock_funcs(kid);
	}	
	if (mod_time) {
		kid.MT = mod_time;
		kid.SZ = sz;
	}
	kid.path = path;
	kid.fullpath = path + "/" + name;
	kid.file = file;
	kid.entry = ent;
	return kid;
}//»

const populate_dirobj_by_path = async(patharg, cb, opts={}) => {//«
	let obj = await pathToNode(patharg);
	if (!obj) return cb(null, `${patharg}: not found`);
	if (obj.APP !== FOLDER_APP) return cb(null, `${patharg}: not a directory`);
	if (obj.done){
		if (opts.long && obj.longdone) return cb(obj.KIDS);
		else return cb(obj.KIDS);
	}
	populate_dirobj(obj, cb, opts);
};
//»
const populate_dirobj = (dirobj, cb = NOOP, opts = {}) => {//«
	let type = dirobj.root.TYPE;
	let path = dirobj.fullpath;
	if (type == "fs") return populate_fs_dirobj_by_path(path, cb, {par:dirobj, long:opts.LONG, streamCb: opts.streamCb});
	if (type == "www"||type=="local") return populate_rem_dirobj(path, cb, dirobj, opts);
	if (type == "mount") return cb(root.KIDS.mnt.KIDS);
	if (type == "bin") return cb(root.KIDS.bin.KIDS);
}
//»

const populate_fs_dirobj_by_path = async(patharg, cb=NOOP, opts={}) => {//«
//cwarn("popdir",patharg);
	let parobj = opts.par;
	let if_long = opts.long;

	let rootarg;
	let fsarg;

	patharg = patharg.regpath();

	if (!parobj) {
		let arr = patharg.split("/");
		if (!arr[0]) arr.shift();
		if (!arr[arr.length - 1]) arr.pop();
		let gotpar = await pathToNode(("/" + arr.join("/")).regpath());
		if (!gotpar) {
			cb();
			return;
		}
		parobj = gotpar;
	}

	if (parobj.done) return cb(parobj.KIDS);	

	let rootobj = parobj.root;
//	let kids = parobj.KIDS;
	if (patharg == "/") return cb(parobj.KIDS);
//	let ents = await getFsDirKids(patharg, kids, opts);
	await getFsDirKids(patharg, parobj, opts);
//	let links=[];
/*
	for (let ent of ents){//«

		let name = ent.name;
		if (ent.isDirectory) {

			kids[name] = mkdirkid(parobj, name, {
				isDir: true,
				size: 0,
				modTime: 0,
				path: patharg
			});
			kids[name].entry = ent;
			continue;
		}

		let file = await getFsFileFromEntry(ent);
		let timestr = get_time_str_from_file(file);
		let is_link = false;
		if (LINK_RE.test(name)) {
			name = name.replace(`.${LINK_EXT}`,"");
			is_link = true;
		}
		let gotkid = kids[name];
		let kid = mkdirkid(parobj, name, {
			isLink: is_link,
			size: file.size,
			modTime: timestr,
			path: patharg,
			file: file,
			entry: ent,
			useKid: gotkid
		});
		if (!gotkid) kids[name] = kid;

		let narr = capi.getNameExt(name);
		kid.name = narr[0];
		kid.ext = narr[1];
		if (!kid.ext) kid.fullname = kid.name;
		else kid.fullname = name;;
		if (is_link){
			let val = await getDataFromFsFile(file, "text");
			kid.LINK = val;
			links.push(kid);
		}
		else if (name.match(/\.app$/)){
			kid.appicon = await getDataFromFsFile(file, "text");
		}
		else{
			kid.app = capi.extToApp(name);
			kid.APP=kid.app;
		}
	}//»
*/
	parobj.longdone = true;
	parobj.done = true;

//	for (let kid of links) kid.ref = await pathToNode(kid.LINK);

	cb(parobj.KIDS);

}
//»

/*
const populate_fs_dirobj_by_path = async(patharg, cb=NOOP, opts={}) => {//«

	let parobj = opts.par;
	let if_long = opts.long;

	let rootarg;
	let fsarg;

	patharg = patharg.regpath();

	if (!parobj) {
		let arr = patharg.split("/");
		if (!arr[0]) arr.shift();
		if (!arr[arr.length - 1]) arr.pop();
		let gotpar = await pathToNode(("/" + arr.join("/")).regpath());
		if (!gotpar) {
			cb();
			return;
		}
		parobj = gotpar;
	}

	if (parobj.done) return cb(parobj.KIDS);	

	let rootobj = parobj.root;
	let kids = parobj.KIDS;
	if (patharg == "/") return cb(kids);
	let ents = await getFsDirKids(patharg, opts);
	let links=[];

	for (let ent of ents){//«
		let name = ent.name;
		if (ent.isDirectory) {

			kids[name] = mkdirkid(parobj, name, {
				isDir: true,
				size: 0,
				modTime: 0,
				path: patharg
			});
			kids[name].entry = ent;
			continue;
		}

		let file = await getFsFileFromEntry(ent);
		let timestr = get_time_str_from_file(file);
		let is_link = false;
		if (LINK_RE.test(name)) {
			name = name.replace(`.${LINK_EXT}`,"");
			is_link = true;
		}
		let gotkid = kids[name];
		let kid = mkdirkid(parobj, name, {
			isLink: is_link,
			size: file.size,
			modTime: timestr,
			path: patharg,
			file: file,
			entry: ent,
			useKid: gotkid
		});
		if (!gotkid) kids[name] = kid;

		let narr = capi.getNameExt(name);
		kid.name = narr[0];
		kid.ext = narr[1];
		if (!kid.ext) kid.fullname = kid.name;
		else kid.fullname = name;;
		if (is_link){
			let val = await getDataFromFsFile(file, "text");
			kid.LINK = val;
			links.push(kid);
		}
		else if (name.match(/\.app$/)){
			kid.appicon = await getDataFromFsFile(file, "text");
		}
		else{
			kid.app = capi.extToApp(name);
			kid.APP=kid.app;
		}
	}//»

	parobj.longdone = true;
	parobj.done = true;

	for (let kid of links) kid.ref = await pathToNode(kid.LINK);

	cb(kids);

}
//»
*/

const populate_rem_dirobj = async(patharg, cb, dirobj, opts = {}) => {//«
	let holdpath = patharg;
	let parts = patharg.split("/");
	parts.shift();
	parts.shift();
	let baseurl;
	if (patharg.match(/^\/www\/?/)){
		baseurl = "";
	}
	else if (patharg.match(/^\/mnt\/?/)) {
		parts.shift();
		baseurl = dirobj.root.origin;
	}
	else return cerr(`patharg must begin with '/mnt' or '/www' (got '${patharg}')`);

	let path = parts.join("/");
	if (!path) path="/";
	let rv;
	let url = `${baseurl}/_getdir?path=${path}`;
	try {
		rv = await fetch(url);
	}
	catch(e){
		cb(null, `could not fetch: ${url}`);
		return;
	}
	if (!rv.ok) return cb(null, `response not "ok": ${url}`);
	
	let ret;
	let text = await rv.text();
	try{
		ret = JSON.parse(text);
	}
	catch(e){
		cb(null, `JSON parse error in response from: ${url} (see console)`);
log(text);
		return;
	}
	let kids = dirobj.KIDS;
	let par = dirobj;
	dirobj.checked = true;
	dirobj.done = true;
	for (let k of ret) {
		if (k.match(/^total\x20+\d+/)) continue;
		let arr = k.split(" ");
		arr.shift(); /*permissions like drwxrwxrwx or-rw-rw-r--*/
		if (!arr[0]) arr.shift();
		arr.shift(); /*Some random number*/
		while (arr.length && !arr[0]) arr.shift();

		let sz_str = arr.shift();
		let sz = strnum(sz_str);
		let ctime;
		let mtime = arr.shift();
		let tm;
		if (mtime=="None"&&ctime) {
			mtime = ctime;
			tm = parseInt(mtime);
		}
		else tm  = parseInt(mtime);
		if (isNaN(tm)) {
cwarn(`populate_rem_dirobj(): skipping entry: ${k} (bad "mtime"=${mtime})`);
			continue;
		}
		let use_year_before_time = Date.now() / 1000 - (86400 * MAX_DAYS);
		let timearr = (new Date(tm * 1000) + "").split(" ");
		timearr.shift();
		timearr.pop();
		timearr.pop();
		let tmstr = timearr[0] + " " + timearr[1].replace(/^0/, " ") + " ";
		if (tm < use_year_before_time) tmstr += " " + timearr[2];
		else {
			let arr = timearr[3].split(":");
			arr.pop();
			tmstr += arr.join(":");
		}
		let fname = arr.join(" ");
		let isdir = false;
		if (fname.match(/\/$/)) {
			isdir = true;
			fname = fname.replace(/\/$/, "");
		}
		let kidobj = mkdirkid(dirobj, fname,{
			isDir: isdir,
			size: sz,
			modTime: tmstr,
			path: holdpath
		});
		kidobj.modified = tm;
		kidobj.created = ctime;
		kids[fname] = kidobj;
	}
	cb(kids);
}
//»

//»
//Install/Load«

const getmod = (which, cb, opts = {}) => {//«
	let if_static = opts.STATIC;
	let if_global = opts.global;
//	let mods = Core.globals.mods;
	let mods = NS.mods;
	let mod;
	const noop=()=>{};
	if (mods[which]) {
		if (if_static || if_global) cb(mods[which]);
		else cb(new mods[which](Core, noop));
	} else {
		Core.load_mod(which, ret => {
			if (ret) {
				if (if_global) {
					mods[which] = which;
					NS.mods[which](Core, noop);
					cb(mods[which]);
				} else if (if_static) {
					mods[which] = new NS.mods[which](Core, noop);
					cb(mods[which]);
				} else {
					mods[which] = NS.mods[which];
					cb(new mods[which](Core, noop));
				}
			} else cb();
		}, opts);
	}
}
this.getmod = getmod;
//»

//»
//Shell/System«

this.com_mv = async(shell_exports, args, if_cp, dom_objects, recur_opts) => {//«

//Init«

let verb = "move";
let com = "mv";
if (if_cp) {
	verb = "copy";
	com = "cp";
}

//Imports from the calling environment (either the shell or desktop)«

let {
	wclerr,
	werr,
	wout,
	cbok,
	cberr,
	serr,
	cur_dir,
	failopts,
	is_root,
	get_var_str,
	termobj,
	kill_register,
	pathToNode,
	no_move_cb
} = shell_exports;

if (!wclerr) wclerr=NOOP;
if (!pathToNode) pathToNode = api.pathToNode;

if (recur_opts){
	cbok = recur_opts.cbok;
	cberr = recur_opts.cberr;
}

let icon_obj = {};
let towin = null;

if (dom_objects) {
	icon_obj = dom_objects.ICONS;
	towin = dom_objects.WIN;
}

//»

let killed = false;//«
if (kill_register){
	kill_register(cb=>{
		killed = true;
		cb&&cb();
	});
}
//»

let sws;
if(failopts) sws=failopts(args,{SHORT:{f:1}});
else sws = {};
if (!sws) return;
let gotfail = false;
let force = sws.f;
if (!args.length) return serr("missing file operand");
else if (args.length == 1) return serr(`missing destination file operand after ${args[0]}`);
if (args.length < 2) {
	serr("Too few args given");
	return;
}
let topatharg = get_fullpath(args.pop(), cur_dir);

//»

let destret = await pathToNode(topatharg);
//Failure conditions...«
if ((args.length > 1) && (!destret || (destret.APP != FOLDER_APP))) {
	serr(`invalid destination path: ${topatharg}`);
	return;
}
else if (args.length===1){
//This allows a destination to be clobbered if the name is in the folder.
//Only if the file is explicitly named, does this error happen.
	if (!force && destret && destret.APP != FOLDER_APP) {
		serr(`${topatharg}: the destination exists`);
		return;
	}
	if (!destret && LINK_RE.test(topatharg)) {
		serr(`invalid extension: '${LINK_EXT}'`);
		return;
	}
}
if (destret && destret.root.TYPE == "fs") {
	if (!check_fs_dir_perm(destret, is_root)) {
		return serr(`${topatharg}: permission denied`);
	}
}
//»

let errarr = [];
let mvarr = [];

for (let arg of args){//«

	let fname = get_fullpath(arg, cur_dir);
	if (!fname) {
		mvarr.push({ERR: `get_fullpath: returned null for: ${arg}!!!`});
		continue;
	}

	let srcret = await pathToNode(fname, true);
	if (!srcret) {
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com} : no such entry: ${fname}`});
		continue;
	}
	let srctype = srcret.root.TYPE;
	if (srcret.treeroot || (srcret.root == srcret)) {
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com}: skipping top level directory: ${fname}`});
	}
	else if ((srctype == "www" || srctype == "local") && !if_cp) {
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com}: ${fname}: cannot move from the remote directory`});
	}
	else if (!(srctype == "fs" || srctype == "local" || srctype == "www")) {
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com}: ${fname}: cannot ${verb} from directory type: ${srctype}`});
	}
//No moving of files that are actively being edited
	else if (com==="mv"&&srcret.write_locked) {
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com}: ${fname} is "write locked"`});
	}
//No moving of folders that contain files that are actively being edited
	else if (com==="mv"&&srcret.APP==FOLDER_APP&&srcret.MOVE_LOCKS.length){
		if (no_move_cb) no_move_cb(icon_obj[fname]);
		mvarr.push({ERR: `${com}: ${fname} is "move locked"`});
	}
	else mvarr.push([fname, srcret]);

}//»

//HYTEKLFHSN
if (destret && destret.APP == FOLDER_APP && destret.root.TYPE === "fs"){//«
	if (!destret.done) await popDir(destret);
	let kids = destret.KIDS;
	let okarr=[];
	for (let elm of mvarr){
		if (elm.ERR) {
			okarr.push(elm);
			continue;
		}
		let name = elm[1].NAME;
		let gotkid = kids[name];
		if (gotkid&&gotkid.APP==FOLDER_APP){
			okarr.push({ERR: `${destret.fullpath}: There is already a folder named '${name}'`});
		}
		else okarr.push(elm);
	}
	mvarr = okarr;
}//»

for (let arr of mvarr) {//«
	if (arr.ERR){
		werr(arr.ERR);
		continue;
	}
	let frompath = arr[0];
	let fromicon = icon_obj[frompath];
	let topath;
	let todir;
	let fent = arr[1];
	let type = fent.root.TYPE;
	let app = fent.APP;
	let gotfrom, gotto;
	let savedirpath;
	let savename;
	if (killed) {
		werr("Killed!");
		break;
	}
	if (arr.ERR) {
		gotfail = true;
		werr(arr.ERR);
		continue;
	}

	if (destret) {//«
		if (destret.APP == FOLDER_APP) {
			topath = topatharg.replace(/\/+$/, "") + "/" + fent.NAME;
			savedirpath = destret.fullpath;
			gotto = savedirpath + "/" + fent.NAME;
			savename = fent.NAME;
		} else {
			gotto = topath = topatharg;
			savedirpath = destret.par.fullpath;
			savename = destret.NAME;
		}
	}
	else {
		topath = topatharg;
		gotto = get_fullpath(topath, cur_dir);
		let arr = gotto.split("/");
		savename = arr.pop();
		savedirpath = arr.join("/")
	}//»

	gotfrom = get_fullpath(frompath, cur_dir);

	if (!(gotfrom && gotto)) {
		if (!gotfrom) {
			gotfail=true;
			werr(`could not resolve: ${frompath}`);
		}
		if (!gotto) {
			gotfail=true;
			werr(`could not resolve: ${topath}`);
		}
		continue;
	}

	let savedir = await pathToNode(savedirpath);
	if (!savedir) {
		werr(`${savedirpath}: no such directory`);
		continue;
	}
	let savetype = savedir.root.TYPE;

//Only saving to type=='fs'
	if (savetype != "fs") {
		werr(`Not (yet) supporting ${verb} to ${savetype}`);
		continue;
	}

//"Manual recursion" needed for non HTML5FileSystem folders...
	if (type !== "fs" && app === FOLDER_APP){//«
		let nm = savename;
		if (savedir.KIDS[nm]){
			gotfail=true;
			werr(`refusing to clobber: ${nm}`);
			continue;
		}
		if (dom_objects){
			gotfail=true;
			werr(`${nm}: please copy from the terminal`);
			continue;
		}
		let newpath = `${savedir.fullpath}/${nm}`;
		if (!await touchDirProm(newpath)){
			gotfail=true;
			werr(`${newpath}: there was a problem creating the folder`);
			continue;
		}
		if (Desk) Desk.make_icon_if_new(await pathToNode(newpath));
		werr(`Created: ${newpath}`);
		if (!fent.done) await popDir(fent);
		let arr = [];	
		let KIDS=fent.KIDS;
		for (let k in KIDS){
			if (k=="."||k=="..") continue;
			arr.push(KIDS[k].fullpath);
		}
		arr.push(newpath);
		let obj = {
			cbok: () => {
			},
			cberr: () => {
				gotfail = true;
			}
		};
		await this.com_mv(shell_exports, arr, true, null, obj);
		continue;
	}//»

	if (type == "www") {//«
		let rv = await fetch(frompath);
		if (!rv.ok){
			werr(`${frompath}: could not fetch the file`);
			continue;
		}
		await writeFsFileByPath(`${savedirpath}/${savename}`, await rv.blob());
		if (!dom_objects) await mv_desk_icon(gotfrom, gotto, app);
	}//»
	else if (type==="local"){//«
		await save_from_local(savedirpath, savename, app, force, termobj, cbok, werr, wclerr, gotfrom, fromicon, towin);
	}//»
	else {
		let [parobj, kidobj] = await mvByPath(gotfrom, gotto, {app: app, copy: if_cp, root: is_root, ifArr: true});
		if (!(parobj&&kidobj)) {
			werr(`Could not ${verb} from ${frompath} to ${topath}!`);
			continue;
		}
		if (if_cp) gotfrom = null;
		await mv_desk_icon(gotfrom, gotto, app, {
			node: kidobj,
			ICON: fromicon,
			WIN: towin
		});
	}
}//»

if (Desk && !dom_objects) Desk.update_folder_statuses();
if (gotfail) return cberr();
cbok();


}//»
const format_ls = (w, arr, lens, cb, types, col_arg, ret, col_ret) => {//«
	const min_col_wid = (col_num, use_cols) => {
		let max_len = 0;
		let got_len;
		let use_pad = pad;
		for (let i = col_num; i < num; i += use_cols) {
			if (i + 1 == use_cols) use_pad = 0;
			got_len = lens[i] + use_pad;
			if (got_len > max_len) max_len = got_len;
		}
		return max_len;
	};
	const do_colors=()=>{
		let single=false;
		if (!num){
			num=arr.length;
			num_cols=1;
			single=true;
		}
		for (let i = 0; i < num; i++) {
			type = types[i];
			if (type == FOLDER_APP) colarg = "#909fff";
			else if (type == "Link") colarg = "#0cc";
			else if (type == "BadLink") colarg = "#f00";
			else colarg = null;
			col_num = Math.floor(i % num_cols);
			row_num = Math.floor(i / num_cols);
			if (row_num != cur_row) {
				matrix.push([]);
				xpos = 0;
			}
			let str = arr[i] + "\xa0".rep(col_wids[col_num] - arr[i].length);
			matrix[row_num][col_num] = str;
			if (!col_ret[row_num]) col_ret[row_num] = {};
			let uselen = arr[i].length;
			if (arr[i].match(/\/$/)) uselen--;
			if (colarg) col_ret[row_num][xpos] = [uselen, colarg];
			xpos += str.length;
			cur_row = row_num;
		}
		if (single) return;
		for (let i = 0; i < matrix.length; i++) ret.push(matrix[i].join(""));

	};
	let pad = 2;
	let col_wids = [];
	let col_pos = [0];
	let max_cols = col_arg;
	let num, num_rows, num_cols, rem, tot_wid, min_wid;
	let row_num, col_num;
	let cur_row = -1;
	let matrix = [];
	let type, colarg;
	let xpos;
	if (col_arg == 1) {
		ret = arr.slice();
		do_colors();
		cb(ret, col_ret);
		return;
	}
	num = arr.length;
	if (!max_cols) {
		min_wid = 1 + pad;
		max_cols = Math.floor(w / min_wid);
		if (arr.length < max_cols) max_cols = arr.length;
	}
	num_rows = Math.floor(num / max_cols);
	num_cols = max_cols;
	rem = num % num_cols;
	tot_wid = 0;
	for (let i = 0; i < max_cols; i++) {
		min_wid = min_col_wid(i, num_cols);
		tot_wid += min_wid;
		if (tot_wid > w && max_cols > 1) {
			format_ls(w, arr, lens, cb, types, (num_cols - 1), ret, col_ret);
			return;
		}
		col_wids.push(min_wid);
		col_pos.push(tot_wid);
	}
	col_pos.pop();

	do_colors();
	cb(ret, col_ret);
}//»
this.get_listing = (kids, w, opts = {}) => {//«

return new Promise((Y,N)=>{

const lsout = () => {//«
	if (isjson) {
		Y([ret]);
		return;
	}
	if (!opts.islong){
		if (!w) return Y([ret]);
		if (opts.newlinemode) return Y([ret]);
		let name_lens = [];
		for (let nm of ret) name_lens.push(nm.length);
		format_ls(w, ret, name_lens, (ls_ret, col_ret) => {
			Y([ls_ret, null, col_ret]);
		}, types, null, [], []);
		return;
	}
	let hi_szlen = 0;
	for (let i = 0; i < ret.length; i++) {
		let ent = ret[i];
		let sz = ent[1];
		if (sz) {} else if (!util.isnum(sz)) {
			continue;
		}
		let szlen = sz.toString().length;
		if (szlen > hi_szlen) hi_szlen = szlen;
	}
	let lines = [];
	for (let i = 0; i < ret.length; i++) {
		let ent = ret[i];
		let sz = ent[1];
		if (sz) {} else if (!util.isnum(sz)) {
			lines.push(ent);
			continue;
		}
		let nmlen;
		let str = " ".rep(hi_szlen - (sz + "").length) + sz + " ";
		if (ent[3]) str += ent[2] + " " + ent[3] + " " + ent[0];
		else str += ent[2] + " " + ent[0];
		lines.push(str);
	}
	Y([lines]);
};//»

const dokids = () => {//«

const doret = () => {//«
	let name = key;
	if (kid.KIDS) {
		if (opts.islong) {
			name = name + "/";
			if (kid.MT && isint(kid.SZ)) ret.push([name, kid.SZ, kid.MT]);
			else ret.push([name, "-", FAKE_TIME]);
		}
		else {
			if (add_slashes) name += "/";
			ret.push(name);
		}
		dokids();
		return;
	} 
	if (!opts.islong){
		ret.push(name);
		dokids();
		return;
	}
	let arr;
	if (kid.LINK) {
		if (isjson) arr = [
			[name, kid.LINK], kid.LINK.length, FAKE_TIME
		];
		else arr = [name + "\x20->\x20" + kid.LINK, kid.LINK.length, FAKE_TIME];
	}
	else if (kid.BUFFER) arr = [name, 0, FAKE_TIME];
	else if (util.isnum(kid.SZ)) arr = [name, kid.SZ, kid.MT];
	else arr = [name, 0, FAKE_TIME];
	ret.push(arr);
	dokids();
};//»
iter++;
if (iter == keys.length) return lsout();
let key = keys[iter];
let kid = kids[key];
if (kid.APP !== "Link"){
	types.push(kid.APP || "File");
	doret();
	return;
}
if (kid.badlink===true){
	types.push("BadLink");
	doret();
	return;
}
if (kid.badlink===false){
	types.push("Link");
	doret();
	return;
}
path_to_obj(kid.LINK, ret => {
	if (ret) types.push("Link");
	else types.push("BadLink");
	doret();
});

};//»

let FAKE_TIME = "-------:--";
let ret = [];
let types = [];
let name_lens;
let isjson = opts.isjson;
let add_slashes = opts.addslashes;
let keys = getkeys(kids);
let iter = -1;
dokids();

});

}//»
this.get_term_fobj = function(termobj, cur_dir, fname, flags, cb, is_root) {//«

let EOF = termobj.EOF;
const chomp_eof = (arr) => {
	const isarr = (arg) => {
		return (arg && typeof arg === "object" && typeof arg.length !== "undefined");
	};
	if (!isarr(arr)) return arr;
	let pos = arr.indexOf(EOF);
	if (pos > -1) arr = arr.slice(0, pos);
	return arr;
};

const FileObj=function(fname, flags, cb){

let	_parser,_ukey,_fent,_read,_write,_buffer,_iter=0,_blob=null,_type;//«
let winid;
let thisobj=this;
this.getfobj = ()=>{return winid;}
this.reset=()=>{thisobj.read=_read;thisobj.write=_write;}
this.set_reader=arg=>{thisobj.read=arg;}
this.get_reader=()=>{return thisobj.read;}
this.set_writer=arg=>{thisobj.write=arg;}
this.get_writer=()=>{return thisobj.write;}
this.set_buffer=(newbuf,if_edit_mode)=>{_buffer=newbuf;}
this.get_buffer=()=>{return _buffer;}
//»
const Reader=function(){//«

const rmfobj=()=>{
	if (_write) {
cwarn(`rmfobj: not deleting fobj: ${_ukey} (writable)`);
		return 
	}
	delete termobj.file_objects[_ukey];
};
this.readline = cb => {
	if (_iter == _buffer.length) {
		cb(EOF);
		rmfobj();
	} else {
		cb(_buffer[_iter]);
		_iter++;
	}
};
this.lines = cb => {
	cb(_buffer);
};
this.peek = cb => {
	if (_buffer.length) cb(true);
	else cb();
};

}//»
const Writer=function(){//«

delete termobj.dirty[_ukey];

this.clear = () => {//«
	_buffer = [];
	_iter = 0;
	termobj.dirty[_ukey] = thisobj;
};//»
this.blob = blobarg => {//«
	_buffer = blobarg;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};//»
this.object = obj => {//«
	_buffer = obj;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};//»
this.line = (str, arg2, cb, opts) => {//«
	if (!opts) opts = {};
	if (str === "\x00") {
		if (!opts.FORCELINE) {
cwarn("Writer.line:\x20NULL byte discarded\x20(no opts.FORCELINE)");
			return;
		}
	}
	if (str === EOF) return;
	_buffer[_iter] = str;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
	if (cb) cb(true);
};//»
this.lines = (arr, arg2, arg3, arg4, cb, write_cb) => {//«
	if (arr === EOF) return;
	let tmp = _buffer.concat(arr);
	_buffer = tmp;
	_iter += arr.length;
	termobj.dirty[_ukey] = thisobj;
	if (cb) cb();
	if (write_cb) write_cb(1);
};//»
this.sync = async cb=>{//«

delete termobj.file_objects[_ukey];

let path;
if (_fent.fullpath) path = _fent.fullpath;
else path = path_from_node(_fent);

if (_type !== "fs") {
	cb({ERR: `${path}: permission denied`});
	return;
}

if (_fent.write_locked){
	cb({ERR: `${path} is "write locked"`});
	return;
}

{
	let parts = path_to_par_and_name(path);
	if (!(parts && parts.length==2)) return cb({ERR: `getting file parts for: ${path}`});
	let parobj = await pathToNode(parts[0]);
	if (!parobj) return cb({ERR: `getting parent directory for: ${path}`});
	if (!check_fs_dir_perm(parobj, is_root)) {
		cb({ERR: `${parts[0]}: permission denied`});
		return;
	}
}

let str;
if (_buffer instanceof Blob) str = _buffer;
else {
	_buffer = chomp_eof(_buffer);
	str = _buffer.join("\n");
	if (flags.append) str = "\n" + str;
}
cb(await saveFsByPath(path, str, {APPEND: flags.append, ROOT: is_root}));

}//»

};//»

const make_fobj = async(type, fent, ukey) => {//«
	if (ukey) {
		if (typeof(termobj.file_objects[ukey]) == "object") {
			if (!flags.read && flags.write && !flags.append) thisobj.write.clear();
			else {
				_buffer = termobj.file_objects[ukey].get_buffer();
				if (flags.append) thisobj.seek.end();
				else thisobj.clear();
			}
			cb({
				'FOBJ': thisobj,
				'UKEY': ukey
			});
			return;
		}
	}
	_type = type;
	_ukey = ukey;
	if (!fent) {
		cb(true);
		return;
	}
	_fent = fent;
	let buffer = null;
	if (flags.read) _read = new Reader();
	if (flags.write) _write = new Writer();
	if (ukey && !flags.read && flags.write && !flags.append) {
		_buffer = [];
		thisobj.reset();
		cb({
			'WINID': winid,
			'FOBJ': thisobj,
			'UKEY': ukey
		});
		return
	} 
	let path;
	if (fent.fullpath) path = fent.fullpath;
	else path = path_from_node(fent);

	if (!ukey) _ukey = "fs-" + path;
	else _ukey = ukey;
	let obj = {
		'WINID': path,
		'FOBJ': thisobj,
		'UKEY': _ukey
	};
	termobj.file_objects[_ukey] = thisobj;
	thisobj.reset();
	_iter = 0;
	if (!flags.read){
		_buffer = [];
		cb(obj);
		return;
	}
	if (fent.BUFFER) return cb(obj);
	let parts = path_to_par_and_name(path);
	if (!parts) return cb("Error: #198.0");
	let parobj = await pathToNode(parts[0]);
	if (!parobj) return cb("Error: #245.9");

	if (type==="fs" && !check_fs_dir_perm(parobj, is_root)) return cb(`${path}: permission denied`);
	let ret = await readFile(path);
	if (ret) {
		if (ret instanceof Array) _buffer = ret;
		else _buffer = ret.split("\n");
		cb(obj);
	} 
	else {
		cb(`${path}: could not get file contents`);
		delete termobj.file_objects[_ukey];
	}
}//»

(async()=>{//«

let fobj = await pathToNode(get_fullpath(fname, cur_dir));
if (fobj){
	if (fobj.APP == FOLDER_APP) return cb(`${fname}: is a directory`);
	let ukey;
	if (fobj.fullpath) ukey = fobj.fullpath;
	else ukey = path_from_node(fobj);
	let root = fobj.root;
	let type = root.TYPE;
	let types = ["fs"];
	make_fobj(type, fobj, ukey);
	return;
}

if (!flags.write) {
	cb();
	return;
}

if (globals.read_only){
return cb(`The system is in "read only" mode!`);
}

let usefname, dirobj;

if (fname.match(/\x2f/)) {
	let arr = fname.split(/\x2f/);
	usefname = arr.pop();
	if (!usefname) {
		cb("no filename given");
		return;
	} 
	let usedir = get_fullpath(arr.join("/"), cur_dir);
	if (!usedir) usedir = "/";
	dirobj = await pathToNode(usedir);
} else {
	dirobj = await pathToNode(cur_dir);
	usefname = fname;
}

if (!(dirobj && usefname)) return cb("Error id: 1856");
if (dirobj.treeroot) return cb(`cannot save to the root directory`);
let root = dirobj.root;
let type = root.TYPE;
if (type == "fs") {
	if (!check_fs_dir_perm(dirobj, is_root)) return cb(`${dirobj.fullpath}: permission denied`);
} 
else return cb(`cannot write to directory type: '${type}'`);

let obj = {
	'NAME': usefname,
	'par': dirobj
};
obj.root = root;
dirobj.KIDS[usefname] = obj;
make_fobj(root.TYPE.toLowerCase(), obj);


})();//»

}//End FileObj


new FileObj(fname, flags, cb);

}//»End get_term_fobj

//»
//Saving Blobs/Files«
const FileSaver=function(){//«

let cwd;
let fname;
let basename;
let fullpath;
let ext;
let file;
let fSize;
let fEnt; /*This is always what is being written to,and depends on the FileSystem API*/ 
let fObj;

let bytesWritten = 0;
let curpos = 0;
let update_cb, done_cb, error_cb;
let stream_started = false, stream_ended = false;
let saving_from_file = false;
let cancelled = false;
const cerr=str=>{if(error_cb)error_cb(str);else Core.cerr(str);};
const get_new_fname = (cb, if_force) => {//«
	const check_fs_by_path = async(fullpath, cb) => {
		if (!fullpath.match(/^\x2f/)) {
cerr("NEED FULLPATH IN CHECK_FS_BY_PATH");
			cb();
			return;
		}
		if (await pathToNode(fullpath)) return cb(true);
		cb(false);
	}
	if (!basename) return cerr("basename is not set!");
	let iter = 0;
	const check_and_save = (namearg) => {
		if (iter > 10) return cerr("FileSaver:\x20Giving up after:\x20" + iter + " attempts");
		let patharg = (cwd + "/" + namearg).regpath();
		check_fs_by_path(patharg, name_is_taken => {
			if (name_is_taken && !if_force) return check_and_save((++iter) + "~" + basename);
			cb(namearg);
		});
	};
	check_and_save(basename);
};//»
const save_file_chunk = async(blobarg, cbarg) => {//«

	if (cancelled) return cwarn("Cancelled!");
	let slice;
	if (blobarg) slice = blobarg;
	else if (file) slice = file.slice(curpos, curpos + FILE_SAVER_SLICE_SZ);
	else {
cerr("save_file_chunk():No blobarg or file!");
		return;
	}
	let [ret, thisobj] = await _writeFsFileByEntry(fEnt, slice, {append: true});
	if (blobarg) {
		bytesWritten += blobarg.size;
		if (update_cb) {
			if (fSize) update_cb(Math.floor(100 * bytesWritten / fSize));
			else update_cb(bytesWritten);
		}
		if (cbarg) cbarg();
		return;
	} 
	curpos += FILE_SAVER_SLICE_SZ;
	if (thisobj.position < fSize) {
		if (update_cb) update_cb(Math.floor(100 * thisobj.position / fSize));
		save_file_chunk();
	} 
	else {
		if (done_cb) done_cb();
	}
};//»

this.set_cb=(which,cb)=>{if(which=="update")update_cb=cb;else if(which=="done")done_cb=cb;else if(which=="error")error_cb=cb;else cerr("Unknown cb type in set_cb:"+which);};
this.set_cwd = (arg, cb) => {//«
return new Promise((Y,N)=>{
	if (arg && arg.match(/^\x2f/)) {
		path_to_obj(arg, ret => {
			if (!(ret && ret.APP == FOLDER_APP)) {
				Y();
cerr(`Invalid directory path: ${arg}`);
				return;
			}
			cwd = arg;
			Y(ret);
		});
	}
	else {
cerr(`Invalid cwd: ${arg} (must be a fullpath)"`);
	}
});
};//»
this.set_fsize=(arg)=>{if(!(isint(arg)&& ispos(arg)))return cerr("Need positive integer for fSize");fSize=arg;};
this.set_ext=(arg)=>{if(!(arg&&arg.match(/^[a-z0-9]+$/)))return cerr("Invalid extension given:need /^[a-z0-9]+$/");ext=arg;};
this.set_filename = (arg, if_force) => {//«
//this.set_filename = (arg, cb, if_force) => {
return new Promise((Y,N)=>{
	if (!cwd) {
		Y();
cerr("Missing cwd");
		return
	}
	if (!arg) arg = "New_File";
	arg = arg.replace(/[^-._~%+:a-zA-Z0-9 ]/g, "");
	arg = arg.replace(/\x20+/g, "_");
	if (!arg) arg = "New_File";
	basename = arg;
	get_new_fname(ret => {
		if (!ret) return Y();
		fname = ret;
		fullpath = (cwd + "/" + fname).regpath();
		Y(fname);
	}, if_force)
});
};//»
this.set_fent = async(cb) => {//«
	let [ret,errmess] = await _getFsEntByPath(fullpath, false, true);
	if (!ret) return cb(null, errmess);
	fEnt = ret;
	let [rv, arg2, arg3] = await _writeFsFileByEntry(fEnt, new Blob([""]), {append: true});
	fObj = rv;
	fObj.lock_file();
	cb(fObj);
};//»
this.save_from_file = (arg) => {//«
	if (saving_from_file) return cerr("Already saving from a File object");
	if (stream_started) return cerr("Already saving from a stream");
//	if (!writer) return cerr("No writer is set!");
	saving_from_file = true;
	fSize = arg.size;
	file = arg;
	if (!update_cb) cwarn("update_cb is NOT set!");
	if (!done_cb) cwarn("done_cb is NOT set!");
//	save_file_chunk();
	setTimeout(()=>{
		save_file_chunk();
	},0);
};//»
this.start_blob_stream=()=>{//«
	if(stream_started)return cerr("blob stream is already started!");
	if(saving_from_file)return cerr("Already saving from a File object");
//	if(!writer)return cerr("No writer is set!");
	if(!fEnt)return cerr("No file entry is set!");
//	if(!fSize)cwarn("fSize not set,so can't call update_cb with percent update,but with bytes written");
//	if(!update_cb)cwarn("update_cb is NOT set!");
//	if(!done_cb)cwarn("done_cb is NOT set!");
	stream_started=true;
};//»
this.append_blob = (arg, cb) => {//«
	/* If no fSize is set,we can call update_cb with the number of bytes written */
	if (stream_ended) return cerr("The stream is ended!");
	if (!stream_started) return cerr("Must call start_blob_stream first!");
	if (!(arg instanceof Blob)) return cerr("The first arg MUST be a Blob!");
	setTimeout(()=>{
		save_file_chunk(arg, cb);
	},0);
};//»
this.end_blob_stream = () => {//«
	stream_ended = true;
	if (fObj) fObj.unlock_file();
	if (done_cb) done_cb();
};//»
this.cancel = (cb) => {//«
//	cwarn("Cancelling... cleaning up!");
	cancelled = true;
	fEnt.remove(() => {
//		cwarn("fEnt.remove OK");
		cb();
	}, () => {
		cerr("fEnt.remove ERR");
		cb();
	});
};//»
/*
this.set_writer = (cb) => {//«
	if (!check_cb(cb, 1)) return;
	get_fs_ent_by_path(fullpath, (ret, errmess) => {
		if (!ret) return cb(null, errmess);
		fEnt = ret;
fEnt.createWriter(ret2 => {//***INCOMMENTS***
			if (!ret2) return cb();
			writer = ret2;
			cb(true);
		});
	}, false, true)
};//»
*/

}
this.FileSaver=FileSaver;
//»
const save_from_local = (savedirpath, savename, app, force, termobj, cbok, werr, wclerr, gotfrom, fromicon, towin)=>{//«
return new Promise(async(Y,N)=>{

const writer_func = async (kidobj, err)=>{//«

if (!kidobj) {
	werr(`Error: ${err}`);
	Y();
	return;
}

let killcb = cb => {//«
	if (cancelled) {
		cb && cb();
		return;
	}
	cancelled = true;
	kidobj.filesaver_cb = undefined;
	delete kidobj.filesaver_cb;
	saver.end_blob_stream();
	if (icons) {
		for (let icn of icons) icn.activate()
	};
	cb&&cb();
};//»
saver.set_cb("update", per => {//«
	if (done) return;
	let str = `${per}%`;
	wclerr(`${str} ${newname}`);
	if (icons) {
		for (let icn of icons) icn.overdiv.innerHTML = str;
	}
});//»
saver.set_cb("done", () => {//«
	done = true;
	termobj.kill_unregister(killcb);
	wclerr(`100% ${newname}`);
	if (icons) {
		for (let icn of icons) icn.activate()
	};
	Y();
});//»
kidobj.filesaver_cb=(icn)=>{//«
	if (!icons) return;
	icn.disabled = true;
	Desk.add_drop_icon_overdiv(icn);
	icn.overdiv.cancel_func = killcb;
	icons.push(icn);
};//»
termobj.kill_register(killcb);

let cancelled = false;
let done = false;
let icons = null; 
let nBytes = null;
let next_cb = null;

werr(" ");
saver.start_blob_stream();

if (Desk) {
	icons  = await mv_desk_icon(null, `${savedirpath}/${newname}`, app, {
		ICON: fromicon,
		WIN: towin
	});
	if (icons) {
		for (let icn of icons) {
			icn.disabled = true;
			Desk.add_drop_icon_overdiv(icn);
			icn.overdiv.cancel_func = killcb;
		}
	}
}
readFileStream(gotfrom, (ret, next_cb_ret, nBytesRet) => {//«
	if (cancelled) return;
	if (!ret) {
		if (next_cb_ret) {
			next_cb = next_cb_ret;
			return;
		}
		if (nBytesRet) {
			if (nBytes) {
cerr("Got nBytesRet while nBytes is already set!!!");
				return;
			}
			nBytes = nBytesRet;
			saver.set_fsize(nBytes);
			return;
		}
cerr("NOTHING FOUND");
		return;
	}
	if (ret === true) {
		kidobj.filesaver_cb = undefined;
		delete kidobj.filesaver_cb;
		saver.end_blob_stream();
		return;
	}
	if (ret instanceof Uint8Array) {
		nBytes = ret.length;
		ret=new Blob([ret],{type:"binary"});
	}
	saver.append_blob(ret, next_cb);
});//»

};//»

let saver = new FileSaver();
saver.set_cb("error", mess => {
	werr(mess);
	Y();
});
let parobj = await saver.set_cwd(savedirpath);
if (!parobj){
	werr(`Filesaver error: set_cwd("${savedirpath}")`);
	Y();
	return;
}
let newname = await saver.set_filename(savename, force);
if (!newname){
	werr(`Filesaver error: set_filename("${savename}")`);
	Y();
	return;
}

saver.set_fent(writer_func);

});
}//»
const event_to_files = (e) => {//«
	var dt = e.dataTransfer;
	var files = [];
	if (dt.items) {
		for (var i = 0; i < dt.items.length; i++) {
			if (dt.items[i].kind == "file") files.push(dt.items[i].getAsFile());
		}
	} else files = dt.files;
	return files;
}
this.event_to_files = event_to_files;
//»
this.drop_event_to_bytes = (e, cb) => {//«
	let file = event_to_files(e)[0];
	if (!file) return cb();
	let reader = new FileReader();
	reader.onerror = e => {
		cerr("There was a read error");
		log(e);
	};
	reader.onloadend = function(ret) {
		let buf = this.result;
		if (!(buf && buf.byteLength)) return cb();
		cb(new Uint8Array(buf), file.name);
	};
	reader.readAsArrayBuffer(file);
}//»

//»
//Desktop/Icons/Children«

const mk_desk_icon=(path,opts)=>{mv_desk_icon(null,path,null,opts);}
const mv_desk_icon = (frompath, topath, app, opts = {}) => {//«
return new Promise(async(Y,N)=>{

let ret = [];
const doend=()=>{//«
	if (frompath && topath) _Desk.update_all_paths(frompath, topath);
	Y(ret);
};//»

let _Desk = Desk;
if (!_Desk) return;
let use_link;
if (app == FOLDER_APP) opts.FOLDER = true;
let is_folder = opts.FOLDER;
let no_del_icon = opts.ICON;
if (no_del_icon){
	delete no_del_icon.disabled;
	no_del_icon.op=1;
}
let no_add_win = opts.WIN;
let is_regular_file = false;
if (!is_folder && !opts.FIFO && !opts.LINK) is_regular_file = true;
let fromparts, frombase;
let icons = [];
if (frompath) {
	icons = _Desk.get_fullpath_icons_by_path(frompath, is_regular_file);
	fromparts = path_to_par_and_name(frompath);
	frombase = fromparts[0];
}
let toparts = path_to_par_and_name(topath);
let tobase = toparts[0].replace(/\/$/, "");
let toname = toparts[1];
let ext;
if (is_regular_file) {
	let marr = ALL_EXTENSIONS_RE.exec(toname);
	if (marr && marr[1] && marr[2]) {
		toname = marr[1];
		ext = marr[2];
	}
}

if (frombase && (frombase == tobase)) {
	for (let icn of icons) {
		let usename = toname;
		if (ext) usename += "." + ext;
		_Desk.set_icon_name(icn, usename);
	}
	doend();
	return 
} 

for (let icn of icons) {
	if (icn === no_del_icon) {
		delete icn.disabled;
		icn.op=1;
		continue;
	}
	_Desk.rm_icon(icn);
}
let wins = _Desk.get_wins_by_path(tobase);
if (is_folder) opts.FOLDER = true;
for (let w of wins) {
	if (w === no_add_win) {
		if (no_del_icon) ret.push(no_del_icon);
		continue;
	}
	let newicon = await _Desk.automake_icon(ext, toname, w, opts);
	if (newicon) ret.push(newicon);
}
doend();

});
}//»

//»

//API«

const mvByPath=(src, dest, opts={})=>{//«
	return new Promise((Y,N)=>{
		let cb;
		if (opts.ifArr) cb=(rv1, rv2)=>{Y([rv1, rv2]);}
		else cb=Y;
		mv_by_path(src, dest, opts.app,cb, opts.copy, opts.root);
	});
};//»
const mvFileByPath=(src, dest, opts={})=>{//«
	if (opts.app) {
console.error(`opts.app == '${opts.app}'!?!?!`);
		return;
	}
	return mvByPath(src, dest, opts);
};//»
const mvDirByPath=(src, dest, opts={})=>{//«
	opts.app = FOLDER_APP;
	return mvByPath(src, dest, opts);
};//»
const populateDirObjByPath=(patharg, opts={})=>{//«
	return new Promise((Y,N)=>{
		let cb=(rv, e)=>{
			if (!rv){
				if (opts.reject) return N(e);
				NS.error.message=e;
				Y();
				return;
			}
			Y(rv);
		};
		populate_dirobj_by_path(patharg, cb, opts);
	});
};//»
const populateFsDirObjByPath=(patharg, opts={})=>{//«
	return new Promise((Y,N)=>{
		populate_fs_dirobj_by_path(patharg, (rv,e)=>{
			if (!rv){
				if (opts.reject) return N(e);
				NS.error.message=e;
				Y();
				return;
			}
			Y(rv);
		}, opts);
	});
};//»
const popDir = (dirobj, opts = {}) => {//«
	return new Promise((y, n) => {
		populate_dirobj(dirobj, y, opts);
	});
};//»
const popFsDir = (path, opts = {}) => {//«
	return new Promise((res, rej) => {
		path = path.regpath();
		if (path != "/") path = path.replace(/\/$/, "");
		populate_fs_dirobj_by_path(path, rv => {
			if (rv) return res(rv);
			if (opts.reject) rej(path + ":\x20could not populate the directory");
			else res(false);
		})
	})
};//»
const popDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(popFsDir(path,opts));return Promise.all(proms);};
const touchDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(touchDirProm(path,opts));return Promise.all(proms);};
const getFsEntryByPath = (path, opts = {}) => {//«
	return new Promise(async(res, rej) => {
		get_fs_ent_by_path(path, rv => {
			if (!rv) {
				if (opts.reject) rej("Could not get the file entry:\x20" + path);
				else res(false);
				return
			}
			res(rv);
		}, opts.isDir, opts.create, opts.isRoot);
	});
};//»
const loadMod = (which, opts = {}) => {//«
	return new Promise((Y, N) => {
		getmod(which, rv => {
			if (!rv) {
				if (opts.reject) return N("Could load load:\x20" + which);
				else return Y(false);
			}
			Y(true);
		}, opts);
	});
};//»
const pathToNode = (path, if_link, if_retall) => {//«
	return new Promise((Y, N) => {
		path_to_obj(path, (ret,lastdir,usepath) => {
			if (ret) {
				if (if_retall) return Y([ret,lastdir,usepath]);
				return Y(ret);
			}
			if (if_retall) return Y([false,lastdir,usepath]);
			Y(false);
		}, if_link);
	})
};//»
const touchDirProm = (path, opts = {}) => {//«
	return new Promise(async(res, rej) => {
		path = path.regpath();
		if (path=="/") return res(true);
		let arr = path.split("/");
		if (!arr[0]) arr.shift();
		let rootname = arr.shift();
		let [rv] = await _getOrMakeDir(rootname, arr.join("/"));
		if (rv) return res(true);
		if (opts.reject) rej(path + ":\x20could not create the directory");
		else res(false);
/*
		_get_or_make_dir(rootname, arr.join("/"), rv=>{
			if (rv) return res(true);
			if (opts.reject) rej(path + ":\x20could not create the directory");
			else res(false);
		});
*/
	})
};//»
const writeFsFileByPath = (path, val, opts = {}) => {//«
	return new Promise(async (res, _rej) => {
		const rej = (str) => {
			if (opts.reject) _rej(str);
			else res(false);
		};
		let arr = path.split("/");
		arr.pop();
		let parpath = arr.join("/");
		let parobj = await pathToNode(parpath);
		if (!parobj) {
			rej(parpath + ":\x20not found");
			return;
		}
		if (!check_fs_dir_perm(parobj, opts.ROOT || opts.root || opts.isRoot, opts.SYS || opts.sys || opts.isSys)) {
			rej(parpath + ":\x20permission denied");
			return;
		}
		save_fs_by_path(path, val, ret => {
			if (ret) return res(ret);
			rej(path + ":\x20not found");
		}, opts);
	})
};//»
const touchFsFile = (path, if_root) => {//«
	return new Promise(async(y, n) => {
		y(await saveFsByPath(path, "", {root: if_root, append: true}));
	});
};//»
const readFile = (path, opts = {}) => {//«
	return new Promise((Y, N) => {
		let buf = [];
		_read_file(path, (rv, pathret, err) => {
			if (err) {
				if (opts.reject) N(err);
				else Y(false);
				return;
			}
			if (!rv) return;
			if (isEOF(rv)) {
				if (buf.length === 1 && !isstr(buf[0])) Y(buf[0]);
				else Y(buf);
				return;
			}
			if (isArr(rv)) buf = buf.concat(rv);
			else buf.push(rv);
		}, opts);
	});
};//»
const readFileStream=(fullpath,cb)=>{path_to_contents(fullpath,ret=>{if(ret)cb(ret);cb(true);},true,cb);}
const writeFile=(path, val, opts = {}) => {//«
	return new Promise(async (Y, N) => {
		let err = (s) => {
			if (opts.reject) N(e);
			else Y(false);
		};
		let invalid = () => {
			err("Invalid path:\x20" + path);
		};
		let handle = which => {
			err("Implement handling root dir:\x20" + which);
		};
		if (!(path && path.match(/^\x2f/))) return invalid();
		let arr = path.split("/");
		arr.shift();
		let rootdir = arr.shift();
		if (!rootdir) return invalid();
		let if_exists = await pathToNode(path);
		if (root_dirs.includes(rootdir)) {
			let fent;
			fent = await writeFsFileByPath(path, val, opts);
			if (opts.NOMAKEICON) {} else if (!if_exists) mk_desk_icon(path);
			Y(fent);
		} 
		else {
			err("Invalid or unsupported root dir:\x20" + rootdir);
		}
	});
}//»
const readFsFile = (path, opts = {}) => {//«
	return new Promise(async(res, rej) => {
		let [ret, err_or_obj, isgood] = await getFsByPath(path, opts);
		if (isgood) return res(ret);
		if (opts.reject) rej(path + ":not found");
		else res(false);
	})
};//»
const getUniquePath = (path, opts = {}) => {//«
	return new Promise(async (Y, N) => {
		try {
			let rv = await get_unique_path(path, opts, opts.ROOT);
			Y(rv);
		} catch (e) {
			cerr(e);
			if (opts.reject) N(e);
			else Y(false);
		}
	});
};//»
const pathExists=(path,opts={})=>{opts.isRoot=true;opts.create=false;opts.isDir=true;return new Promise(async(Y,N)=>{if(await getFsEntryByPath(path,opts))return Y(true);opts.isDir=false;if(await getFsEntryByPath(path,opts))return Y(true);Y(false);});};
const loadModules=(arr,opts_arr=[])=>{let proms=[];for(let i=0;i<arr.length;i++)proms.push(loadMod(arr[i],opts_arr[i]));return Promise.all(proms);};
const getMod=(which,opts={})=>{return new Promise((Y,N)=>{getmod(which,Y,opts);});};
const saveFsByPath=(path,val,opts)=>{return new Promise((Y,N)=>{save_fs_by_path(path,val,Y,opts);});};

const api_funcs = [//«
	"doFsRm", doFsRm,
	"mkFsDir", mkFsDir,
	"_mkFsDirs", touchDirsProm,
	"_mkFsDir", touchDirProm,
	"mkDir", touchDirProm,
	"touchDir", touchDirProm,


	"writeFile", writeFile,
	"touchFsFile",touchFsFile,
	"_writeFsFileByEntry", _writeFsFileByEntry,
	"writeFsFileByPath", writeFsFileByPath,

	"readFile", readFile,
	"readFsFile", readFsFile,
	"getFsEntryByPath", getFsEntryByPath,
	"saveFsByPath", saveFsByPath,
	"getDataFromFsFile", getDataFromFsFile,
	"getBin", getBin,

	"mvByPath", mvByPath,
	"mvFileByPath", mvFileByPath,
	"mvDirByPath", mvDirByPath,

	"checkDirPerm", checkDirPerm,
	"popFsDirs", popDirsProm,
	"popFsDir", popFsDir,
	"popDir", popDir,
	"populateDirObjByPath", populateDirObjByPath,

	"getUniquePath", getUniquePath,
	"pathToNode", pathToNode,
	"pathExists", pathExists,

	"loadModules", loadModules,
	"loadMod", loadMod,
	"loadModule", loadMod,
	"getMod", getMod


]//»

for (let i=0; i < api_funcs.length; i+=2){
	let name = api_funcs[i];
	if (api[name]) throw new Error(`The fs api function (${name}) already exists!`);
	api[name] = api_funcs[i+1];
}

this.api=api;

NS.api.fs=api;

//»

}//»


