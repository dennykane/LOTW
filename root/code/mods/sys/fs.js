/*Recursive copying of remote folders!!!«

@AIUTBNDHJEK

»*/

/*XXX FIXED ERROR @WONTYDJPO??? XXX«
Could not move links because mv_by_path calls get_fs_ent_by_path, which calls get_fs_by_path,
with ENT: true. But this calls path_to_obj, which will automatically deref a link UNLESS IT
IS INSTRUCTED NOT TO VIA THE 'GETLINK' flag passed in as an option..

»*/

/*If there is a desktop or shell already open, we can open in readonly mode, which means than the«
fs calls will fail:

SAVE_FS_FILE
	dir.getFile(fname, {create:true}
GET_FS_FILE (if if_make==true)
		dir.getDirectory(fname, arg
		dir.getFile(fname, arg

WRITE_FS_FILE
GET_OR_MAKE_DIR
	dir.getDirectory(name, {create:true}

RM_FS_FILE
MV_BY_PATH

»*/

export const mod = function(Core, root) {

//Imports«

//const root = arg;
const fsobj = this;
const{api:capi,fs_url,mod_url,loc_url,xget,xgetobj,sys_url,log,cwarn,cerr,NS,globals}=Core;
const{FSLET, FSBRANCH, FSPREF,fs_root,lst,util,FOLDER_APP, LINK_RE, LINK_EXT}=globals;
const{strnum,isid,isarr,isobj,isfunc,isnum,isnull,isint,isstr}=util;
const{isEOF,isArr,isStr,xgetText}=capi;
const ispos = arg=>{return isnum(arg,true);}
const isneg = arg=>{return isnum(arg,false);}
const isnotnegint = arg=>{return isint(arg, true);}
const READONLY=()=>{
	console.error("The system is read only")
//throw new Error("READONLY");
};
//»

//Var«

const api={};
const register_fs_api_func=(name,func)=>{if (api[name]) throw new Error(`The fs api function (${name}) already exists!`);api[name] = func;};

const TEXT_EXTENSIONS = [//«
"txt",
"sh",
"js",
"json",
"cfg",
"app",
"html",
"htm",
"css",
"bashrc",
"synth"
];//»

const MAX_REMOTE_SIZE = 1 * 1024 * 1024;
const MB = 1024*1024;
let output_window=null;
let output_doc=null;
let Desk, desk, desk_path;
let objpath;
let MAX_FILE_SIZE = 25*MB;

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

//const read_file = (fname, cb, opts = {}) => {
const read_file = (fname, cb, opts = {}, killcb_cb) => {//«
	let _;
	if (!opts) opts = {};
	const noop = () => {
		return "";
	};
	const exports = opts.exports || {};
	_ = exports;
	const is_root = _.is_root || opts.ROOT || opts.isRoot || opts.root || false;
	const get_var_str = _.get_var_str || noop;
	const kill_register = _.kill_register || noop;
	const tmp_env = _.tmp_env || {};
	const cur_dir = _.cur_dir || "/";
	const werr = _.werr || Core.cerr;
	const EOF = opts.EOF || {
		EOF: true
	};
	const mime_of_path = Core.mime_of_path;
	const text_mime = Core.text_mime;
	const ptw = (str, cb, if_getlink) => {
		if (!str.match(/^\x2f/)) str = (cur_dir + "/" + str).regpath();
		path_to_obj(str, cb, is_root, if_getlink);
	};
	const _get_fullpath = (path, if_no_resolve, no_deref_link) => {
		return get_fullpath(path, if_no_resolve, cur_dir, no_deref_link);
	};
	ptw(fname, async(ret, lastdir, usepath) => {
		if (!ret) return cb(null, null, "No such file:\x20" + fname);
		if (ret.APP == FOLDER_APP) return cb(null, null, fname + ":\x20is a directory");
		if (!get_var_str("DEV_DL_FNAME")) tmp_env.DEV_DL_FNAME = ret.NAME;
		let path = get_path_of_object(ret);
		cb(null, path);
		let ext = path.split(".").pop();
		let is_blob = !TEXT_EXTENSIONS.includes(ext);
		let isbin = opts.binary||opts.BINARY;
		if (opts.text || opts.FORCETEXT || (get_var_str("FORCE_TEXT").match(/^t(rue)?$/i))) is_blob = false;
		let type = ret.root.TYPE;
		if (type == "fs") {
			get_fs_by_path(path, (ret2, err) => {
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
				} else if (util.isstr(err)) cb(null, null, err);
				cb(EOF);
			}, {
				start: opts.start,
				end: opts.end,
				BLOB: true,
				ROOT: is_root
			});
		} else if (type == "local") {
			let fullpath = _get_fullpath(path);
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
		} 
		else if (type == "www"){
//log(ext);
			let rv = await fetch(path);
			if (!rv.ok) cb();
			else{
				let ext = path.split(".").pop();
//				cb(await rv.arrayBuffer());
				if (ext && TEXT_EXTENSIONS.includes(ext)) cb((await rv.text()).split("\n"));
				else cb(await rv.blob());
			}
			cb(EOF);
		}
		else if (type == "bin"){
			let rv = await fetch(`/root/bin/${ret.NAME}.js`);
			cb((await rv.text()).split("\n"));
			cb(EOF);
		}
		else {
			cb(EOF);
			cwarn("read_file():Skipping type:" + type);
		}
	});
};
this.read_file=read_file;
//»
const getkeys=(obj)=>{var arr=Object.keys(obj);var ret=[];for(var i=0;i<arr.length;i++){if(obj.hasOwnProperty(arr[i]))ret.push(arr[i]);}return ret;}
const path_to_data=(fullpath)=>{return new Promise((res,rej)=>{path_to_contents(fullpath,ret=>{if(ret)return res(ret);rej("Not found:\x20"+fullpath);},true);})}
this.paths_to_data=(path_arr,cb)=>{var proms=[];for(let path of path_arr)proms.push(path_to_data(path));Promise.all(proms).then(cb).catch(err=>{cb(null,err);});}
const path_to_contents = (fullpath, cb, if_dat, stream_cb) => {//«
	if (if_dat || stream_cb) {} else cwarn("path_to_contents():" + fullpath);
	path_to_obj(fullpath, ret => {
		if (!ret) return cb();
		let type = ret.root.TYPE;
		if (type == "fs") get_fs_by_path(fullpath, cb, {
			BLOB: if_dat
		});
		else if (type == "local") get_local_file(fullpath, cb, {
			ASBYTES: if_dat
		}, stream_cb);
		else {
			cerr("path_to_contents:WHAT TYPE? " + ret.root.TYPE);
			cb()
		}
	});
}

this.path_to_contents=path_to_contents;
this.getbin = (fullpath, cb) => {
	path_to_contents(fullpath, cb, true);
}
//»
const path_to_obj = (str, allcb, if_root, if_get_link, noarg, alliter) => {//«
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
		}, if_root, if_get_link, null, ++alliter);
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
			if (ret.KIDS[fname]) {
				let kid = ret.KIDS[fname];
				if (kid.APP == "Link" && !if_get_link) deref_link(kid.LINK, allcb);
				else {
					if (!if_root) {
						let cur = kid;
						while (cur.treeroot !== true) {
							if (cur.rootonly === true) {
								kid = null;
								break;
							}
							cur = cur.par;
						}
					}
					allcb(kid, lastdir, normpath);
				}
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
this.ptw = path_to_obj;
this.path_to_obj = path_to_obj;
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

const get_fullpath = (path, noarg, cur_dir) => {
	if (!path) return;
	if (path.match(/^\x2f/)) return path;
	if (!cur_dir) return cwarn("get_fullpath():No cur_dir given with relative path:" + path);
	let usedir;
	if (cur_dir == "/") usedir = "/";
	else usedir = cur_dir + "/";
	return normalize_path(usedir + path);
}
this.get_fullpath=get_fullpath;

const path_to_par_and_name=(path,if_no_resolve)=>{let fullpath=get_fullpath(path,if_no_resolve);let arr=fullpath.split("/");if(!arr[arr.length-1])arr.pop();let name=arr.pop();return [arr.join("/"),name];}
this.path_to_par_and_name=path_to_par_and_name;

const get_path_of_object = (obj, if_arr) => {//«
	if (!obj) return null;
	let str = obj.NAME;
	if (!str) return null;
	let curobj = obj;
	let use_sep = "/";
	let i = 0;
	while (true) {
		if (i == 1000) {
			log("\nINFINITE LOOP:GET_PATH_OF_OBJECT\n");
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
this.get_path_of_object = get_path_of_object;
this.objpath = get_path_of_object;
objpath = get_path_of_object;
//»
this.get_path_of_obj=function(obj,if_arr,join_char){if(!obj)return null;let str=obj.NAME;if(!str)return null;let curobj=obj;let use_sep="/";if(join_char)use_sep=join_char;while(true){if(curobj && curobj.par)str=curobj.par.NAME+use_sep+str;else break;curobj=curobj.par;}if(join_char)return str.replace(/^\/-/,"");if(if_arr){let arr=str.split("/");if(!arr[0])arr.shift();return arr;}return str.regpath();}

const get_distinct_file_key=(obj)=>{let type=obj.root.TYPE;if(type=="fs")return "fs-"+get_path_of_object(obj);else return get_path_of_object(obj);}
this.get_distinct_file_key=get_distinct_file_key;

const get_root=()=>{return root;}
this.get_root = get_root;

//»
//Remote/User«


const get_local_file = async (patharg, cb, opts={}, stream_cb) => {
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
}

//»

//***   New HTML5 FS   ***«

/*
return new Promise(async(Y,N)=>{

});

*/

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

const getFsFileData=(path, opts={})=>{//«
return new Promise(async(Y,N)=>{

	let fent = await getFsEntry(path, opts);
	if (!fent) return Y();
	if (!fent.isFile){
		let mess = `The entry is not a File! (isDirectory==${fent.isDirectory})`;
		if (opts.reject) return N(mess);
		else{
			NS.error.message=mess;
			Y();
			return;
		}
	}
	let file = await getFsFileFromEntry(fent);
	if (!file) throw new Error("Could not get filesystem File object from the Entry");
	Y(await getDataFromFsFile(file, opts.format, opts.start, opts.end));


});
};//»

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

//»

//HTML5 FS«
//WRITE_FS_FILE
const write_fs_file = (fent, blob, cb, if_append, if_trunc) => {//«
	const err = (e) => {
		cb();
	};
	fent.createWriter(function(writer) {
		if (if_append) writer.seek(writer.length);
		var truncated = false;
		writer.onwriteend = async function(e) {//«
			if (!truncated) {
				truncated = true;
				if (if_trunc) this.truncate(0);
				else this.truncate(this.position);
				return;
			} else {
				let arr = fent.fullPath.split("/");
				arr.shift();
				arr.shift();
				let fname = arr.pop();
				let parpath = "/"+arr.join("/");
				let parobj = await pathToNode(parpath);
				if (!parobj) throw new Error("parobj not found!");
				if (!parobj.KIDS) throw new Error("parobj does not have KIDS!");
				let obj={NAME: fname, par: parobj, root: parobj.root, fullpath:`${parpath}/${fname}`, entry:fent, file: await getFsFileFromEntry(fent)};
				if (LINK_RE.test(fname)){
					let ln = blob.__value;
					obj.APP="Link";
					obj.LINK = ln;
					if (typeof ln !== "string"){
						console.warn("The link value is NOT a string");
						console.log(ln);
						obj.badlink=true;
					}
					else if (!await pathToNode(ln)) obj.badlink=true;
					else obj.badlink=false;
				}
				parobj.KIDS[fname]=obj;
				fent._fileObj = obj;
				let bytes = this.position;
				fent._currentSize = bytes;
				cb(obj, this);
			}
		};//»
		writer.onerror = function(e) {
			cerr('WRITE ERR:' + fname + " " + val.length);
			cb();
		};
		writer.write(blob);
	}, err);
}
this.write_fs_file = write_fs_file;//»

const check_fs_dir_perm = (obj, is_root, is_sys) => {//«
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
				return (Core.get_username() === perm);
			}
			else {
console.error("Unknown obj.perm field:", obj);
			}
		}
		obj = obj.par;
	}
	return false;
};
this.check_fs_dir_perm=check_fs_dir_perm;
//»
const delete_fobjs = (arr, cb, is_root) => {//«
	let _Desk = Desk;
	let roots = {};
	let iter = -1;
	let keys;
	const dodel = () => {
		iter++;
		if (iter == arr.length) {
			cb(true);
			return;
		}
		let obj = arr[iter];
		let is_folder = (obj.APP == FOLDER_APP);
		let root = obj.root;
		if (root == obj && obj.par != obj) root = obj.par.root;
		let name = obj['NAME'];
		let par = obj.par;
		let path = get_path_of_object(obj);
		let parpath = get_path_of_object(par);
		let app = obj.APP;
		if (root.TYPE == "fs") {
			rm_fs_file(path, (delret, errmess) => {
				if (delret) {
					delete par['KIDS'][name];
					if (_Desk) {
						let namearr = Core.api.getNameExt(path);
						let usepath = parpath + "/" + namearr[0];
						let useext = namearr[1];
						let win = _Desk.get_win_by_path(usepath, useext);
						if (win && win.force_kill) win.force_kill();
						let icons = _Desk.get_icons_by_path(usepath, useext);
						for (let icn of icons) {
							if (icn.overdiv && icn.overdiv.cancel_func) icn.overdiv.cancel_func();
							_Desk.rm_icon(icn);
						}
					}
				}
				else {
console.error("Could not remove:" + path + ":" + errmess);
				}
				dodel();
			}, is_folder, is_root)
		}
		else {
			console.error("delete_fobjs:DELETE TYPE:" + root.TYPE + "!?!?!?!?!?");
			dodel();
		}
	};
	dodel();
}//»
const do_fs_rm = (args, errcb, cb, opts={}) => {//«
	let cwd = opts.CWD;
	let is_root = opts.ROOT;
	let do_full_dirs = opts.FULLDIRS;
	let iter = -1;
	let arr = [];
	const do_rm = () => {
		iter++;
		if (iter == args.length) {
			if (arr.length) delete_fobjs(arr, cb, is_root);
			else cb();
			return;
		}
		let path = args[iter];
		if (!path.match(/^\x2f/)) path = normalize_path(path, cwd);
		path_to_obj(path, obj => {
			if (obj) {
				let ukey = get_distinct_file_key(obj);
				let rtype = null;
				let issys = null;
				rtype = obj.root.TYPE;
				if (obj.treeroot === true) {
					errcb("WTF are you even trying to do,\x20genius? Kill everyone? I mean,\x20gimme a break!");
					do_rm();
					return;
				}
				if (obj.par.sys) issys = true;
				let app = obj.APP;
				if (ukey || app == FOLDER_APP) {
					if (obj.LINK) arr.push(obj);
					else if (app == FOLDER_APP) {
						if (rtype != "fs") {
							errcb("Cannot remove directory type:\x20" + rtype);
							do_rm();
						} else if (Desk && (path == globals.desk_path)) {
							errcb("Refusing to remove the working desktop path:\x20" + path);
							do_rm();
						} else if (obj.par.treeroot) {
							errcb("Refusing to remove a toplevel directory!");
							do_rm();
						} else if (!obj.done) {
							populate_fs_dirobj_by_path(objpath(obj), kidret => {
								if (kidret) {
									let numkids = getkeys(kidret).length;
									if (!do_full_dirs && numkids > 2) errcb("not an empty folder:\x20" + args[iter]);
									else {
										if (!check_fs_dir_perm(obj, is_root)) errcb(path + ":\x20permission denied");
										else arr.push(obj);
									}
								} else errcb("Could not populate the dir!");
								do_rm();
							});
						} else {
							let numkids = getkeys(obj.KIDS).length;
							if (!do_full_dirs && numkids > 2) errcb("not an empty folder:\x20" + args[iter]);
							else {
								if (!check_fs_dir_perm(obj, is_root)) errcb(path + ":\x20permission denied");
								else arr.push(obj);
							}
							do_rm();
						}
						return;
					} else if (rtype == "fs") {
						if (!check_fs_dir_perm(obj.par, is_root)) errcb(path + ":\x20permission denied");
						else arr.push(obj);
					} 
					else errcb(path + ":\x20not\x20(currently)\x20handling type:\x20" + rtype);
				} else {
					cerr("NO KEY");
					log(obj);
				}
			} else {
				if (path == "/") errcb("cannot remove root");
				else errcb("could not stat:\x20" + path);
			}
			do_rm();
		}, is_root, true);
	};
	do_rm();
}

this.do_fs_rm=do_fs_rm;
//»
const mkdir_by_path = (path, cb) => {//«
	path = path.regpath();
	if (path=="/") return cb(true);
	let arr = path.split("/");
	if (!arr[0]) arr.shift();
	let rootname = arr.shift();
	get_or_make_dir(rootname, arr.join("/"), cb);
}
//»
const check_unique_path=(path,is_root)=>{return new Promise((res,rej)=>{let arr=path.replace(/\/$/,"").split("/");let name=arr.pop();let parpath=arr.join("/");path_to_obj(parpath,fobj=>{if(!fobj)return rej("No parent path:\x20"+parpath);if(fobj.APP!=FOLDER_APP)return rej("Parent is not a Folder,(got"+fobj.APP+")");if(fobj.KIDS[name])return res("The name already exists:\x20"+name);res([fobj.fullpath+"/"+name,fobj.fullpath,name]);},is_root);});};
const get_unique_path=(path,opts,is_root)=>{if(!opts)opts={};let from_num=opts.NUM;return new Promise(async(res,rej)=>{try{let ret=await check_unique_path(path,is_root);if(isArr(ret))return res(ret);}catch(e){return rej(e);}if(!from_num)from_num=1;else if(!isint(from_num))return rej("NaN:\x20"+from_num);let parr=path.split("/");let fname=parr.pop();let parpath=parr.join("/");let max_iters=100;let to_num=from_num+max_iters;for(let i=from_num;i<to_num;i++){let trypath=parpath+"/"+i+"~"+fname;try{let ret=await check_unique_path(trypath,is_root);if(isArr(ret))return res(ret);}catch(e){return rej(e);}}rej("Giving up after:\x20"+max_iters+" tries");});};
this.mk_fs_dir = (parpatharg, fname, cur_dir, cb, winarg, is_root, opts={}) => {//«
	const cberr = (str) => {
		cb(null, str);
	};
	const cbok = (val) => {
		if (!val) val = true;
		cb(val);
	};
	let parpath;
	if (cur_dir) parpath = (cur_dir + "/" + parpatharg).regpath();
	else parpath = parpatharg.regpath();
	path_to_obj(parpath, obj => {
		if (!obj) {
			cberr(parpath + ":\x20no such directory");
			return;
		}
		const mkfobj = () => {
			let newobj = {
				NAME: fname,
				APP: FOLDER_APP,
				root: obj.root,
				par: obj,
				fullpath: parpath+"/"+fname,
				KIDS: {}
			};
			newobj.KIDS['.'] = newobj;
			newobj.KIDS['..'] = obj;
			obj.KIDS[fname] = newobj;
		};

		let type = obj.root.TYPE;
		let kids = obj.KIDS;
		if (!kids) return cberr(parpath + ":\x20not a directory");
		if (kids[fname]) return cberr(parpath + "/" + fname + ":\x20already exists");
		if (type == "fs") {
			if (obj.NAME == "home" && obj.par.treeroot && fname === Core.get_username()) {}
			else if (!check_fs_dir_perm(obj, is_root)) return cberr("Permission denied");
			get_or_make_dir(parpath, fname, ret => {
				if (ret) {
					if (!Desk) return cbok();
//					let retval = Desk.make_desk_folder(parpath, fname);
					let retval = Desk.make_icon_if_new(ret);
					if (retval) {
						if (retval === true) return cbok();
						else if (retval.close) retval.close();
						if (winarg) winarg.winon();
						cbok();
					} else cbok();
				} else cberr();
			});
		}
		else {
			cberr("not supporting type:\x20" + type);
			return;
		}
	}, is_root);
}//»
//GET_OR_MAKE_DIR
const get_or_make_dir = (rootname, path, cb, getonly, if_mkdir) => {//«
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
						'NAME': name,
						'APP': FOLDER_APP,
						'root': rootobj,
						'par': obj,
						'KIDS': {}
					};
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
						'NAME': name,
						'APP': FOLDER_APP,
						'root': rootobj,
						'par': obj,
						fullpath: obj.fullpath+"/"+name,
						'KIDS': {}
					};
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
			log("get_or_make_dir():NO rootobj && rootobj.par.treeroot:<" + rootname + "><" + path + ">");
			log(rootobj);
		}
	}, _ => {
		cb();
		log("HOOOO");
	});
}
this.get_or_make_dir = get_or_make_dir;
//»
const move_kids = (srcpath, destpath, cb, if_copy, if_root) => {//«
	let srcarr = srcpath.split("/");
	let srcname = srcarr.pop();
	let srcparpath = srcarr.join("/");
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	path_to_obj(srcparpath, srcparobj => {
		if (srcparobj) {
			let srckids = srcparobj.KIDS;
			let kidobj = srckids[srcname];
			let newkid;
			if (kidobj) {
				let app = kidobj.APP;
				if (!if_copy) {
					delete srckids[srcname];
					newkid = kidobj;
				} else {
					newkid = {};
					for (let k of getkeys(kidobj)) {
						if (k === "BUFFER") newkid.BUFFER = [];
						else newkid[k] = kidobj[k]
					}
				}
				path_to_obj(destparpath, destparobj => {
					if (destparobj) {

//Just added this on 2/4/20 @8:30 am EST 
//						vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
						newkid.path = destparobj.fullpath;
						newkid.fullpath = destparobj.fullpath +"/"+newname;
//                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

						newkid.par = destparobj;
						newkid.root = destparobj.root;
						if (newkid.KIDS) newkid.KIDS['..'] = destparobj;
						newkid.NAME = newname;
						destparobj.KIDS[newname] = newkid;
						cb(destparobj, newkid);
					} else {
						cwarn("THERE WAS NO DESTPAROBJ returned with path:" + destparpath);
						cb();
					}
				}, if_root);
			} else {
				cwarn("THERE WAS NO KIDS FILE NAMED:" + srcname + " IN SOURCE DIR:" + srcparpath);
				cb();
			}
		} else {
			cwarn("THERE WAS NO SRCPAROBJ returned with path:" + srcparpath);
			cb();
		}
	}, if_root);
//	}, if_root, true);
}
this.move_kids = move_kids;
//»
//MV_BY_PATH
const mv_by_path = (srcpath, destpath, apparg, cb, if_copy, if_root) => {//«
if (globals.read_only){
READONLY();
cb();
return;
}
	let if_dir = false;
	if (apparg == FOLDER_APP) if_dir = true;
	let destarr = destpath.split("/");
	let newname = destarr.pop();
	let destparpath = destarr.join("/");
	get_fs_ent_by_path(srcpath, (fent,errmess) => {
		if (fent) {
			get_fs_ent_by_path(destparpath, dirent => {
				try {
					if (if_copy) {
						fent.copyTo(dirent, newname, function() {
							move_kids(srcpath, destpath, cb, true, if_root)
						}, function(e) {
							cb();
						});
					} 
					else {
						fent.moveTo(dirent, newname, function() {
							move_kids(srcpath, destpath, cb, false, if_root)
						}, function(e) {
							cb();
						});
					}
				} catch (e) {
					cerr(e);
					cb();
				}
			}, true, false, true);
		} else {
			console.error("ERROR No fent returned from srcpath:" + srcpath);
			cb();
		}
	}, if_dir, false, true);
}
this.mv_by_path=mv_by_path;
//»
//RM_FS_FILE
const rm_fs_file = (path, cb, ifdir, if_root) => {//«
if (globals.read_only){
READONLY();
cb();
return;
}
	if (ifdir) {
		get_fs_ent_by_path(path, (dirent, errmess) => {
			if (dirent) {
				dirent.removeRecursively(() => {
					cb(true);
				}, () => {
					cb();
				});
			} else cb(null, errmess);
		}, true, false, if_root);
	} else {
		get_fs_by_path(path, fent => {
			if (fent) {
				fent.remove(() => {
					cb(true);
				}, () => {
					cb();
				});
			} else cb();
		}, {
			GETLINK:true,
			ENT: true,
			ROOT: if_root
		});
	}
}
this.rm_fs_file = rm_fs_file;
//»
const touch_fs_file = (patharg, cb, useval, if_root) => {//«
	if (!useval) useval = "";
	let arr = patharg.split("/");
	arr.shift();
	let rname = arr.shift();
	let fname = arr.pop();
	let path = null;
	if (arr.length) path = arr.join("/");
	get_fs_by_path(patharg, ret1 => {
		if (!ret1) {
			get_or_make_dir(rname, path, (objret, dirret) => {
				save_fs_file(dirret, objret, fname, useval, ret2 => {
					if (ret2) cb(ret2);
					else {
						console.error("ERR TOUCH_FS_FILE #1");
						cb();
					}
				} );
			}, true);
		}
		else cb(ret1);
	}, {
		ENT: true
	});
};
this.touch_fs_file=touch_fs_file;
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
this.get_fs_ent_by_path = get_fs_ent_by_path;
//»
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
this.get_fs_file_from_fent = get_fs_file_from_fent;
//»
//GET_FS_FILE
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
const check_fs_by_path = async(fullpath, cb) => {//«
	if (!fullpath.match(/^\x2f/)) {
		cerr("NEED FULLPATH IN CHECK_FS_BY_PATH");
		cb();
		return;
	}
	if (await pathToNode(fullpath)) return cb(true);
	cb(false);
}
this.check_fs_by_path=check_fs_by_path;
//»
const get_fs_data = (path, cb, noarg, if_root) => {//«
if (noarg){
console.error("nbytes was given??? (looks like 'noarg to me!')");
}
	get_fs_by_path(path, cb, {
		BLOB: true,
//		NBYTES: nbytes,
		ROOT: if_root,
	});
}
this.get_fs_data=get_fs_data;
//»
this.get_fs_bytes=(path,nbytes)=>{return new Promise((res,rej)=>{get_fs_data(path,(ret,err)=>{if(!ret){rej(err);return;}res(ret);},nbytes);});}
this.get_json_file=(path,cb)=>{get_fs_by_path(path,ret=>{if(!ret)return cb();var obj;try{obj=JSON.parse(ret);}catch(e){return cb(null,e);}cb(obj);},{});}
const get_fs_by_path = (patharg, cb, opts = {}) => {//«

	let if_blob = opts.BLOB;
	let if_ent = opts.ENT;
	let if_dir = opts.DIR;
	let if_make = opts.MAKE;
//	let nbytes = opts.NBYTES;
	let start = opts.start;
	let end = opts.end;
	let if_root = opts.ROOT;
	let arr = patharg.split("/");
	arr.shift();
	let rootname = arr.shift();
	let fsarg;
	if (!arr.length) {
		get_fs_file((fsarg || fs_root), rootname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
		return;
	}
	path_to_obj(patharg, (ret, lastdir, normpath) => {
		let lastdirpath = null;
		let realpath;
		let fname, arr;
		if (!ret) {
			if (!if_make) return cb(null, patharg + ":\x20could not stat the file");
			if (!(lastdir && normpath)) return cb(null);
			lastdirpath = objpath(lastdir);
			arr = normpath.split("/");
			fname = arr.pop();
			if ((lastdirpath + "/" + fname) !== normpath) return cb(null, lastdirpath + ":\x20no such directory");
		} else {
			let realpath = objpath(ret);
			arr = realpath.split("/");
			fname = arr.pop();
		}
		arr.shift();
		rootname = arr.shift();
		let path = null;
		if (arr.length) path = arr.join("/");
		get_or_make_dir(rootname, path, (objret, dirret) => {
			if (!dirret) {
				cb(null, "/" + rootname + "/" + path + "/" + fname + ":could not stat the file");
				return;
			}
			get_fs_file(dirret, fname, cb, if_blob, null, if_ent, if_dir, if_make, start, end);
		}, true);
	}, if_root, opts.GETLINK);
}
this.get_fs_by_path = get_fs_by_path;
this.getfile = get_fs_by_path;
//»
const save_fs_by_path = (patharg, val, cb, opts) => {//«
	patharg = patharg.replace(/\/+/g, "/");
	if (!opts) opts = {};
	let apparg = opts.APPARG;
	let if_append = opts.APPEND||opts.append;
	let mimearg = opts.MIMEARG;
	let winid = opts.WINID;
	let if_root = opts.ROOT;
	let if_mkdir = opts.MKDIR;
	let err = null;
	let arr = patharg.split("/");
	arr.shift();
	let arrlen = arr.length;
	let rootname;
	if (arrlen == 1) rootname = "/";
	else rootname = arr.shift();
	if (!patharg.match(/^\x2f/)) err = "NEED FULL PATH IN SAVE_FS_BY_PATH";
	else if (patharg.match(/\/$/)) err = "NO FILE NAME IN SAVE_FS_BY_PATH";
	else if (arrlen < 2 && !if_root) err = "FILE PATH TOO SHORT IN SAVE_FS_BY_PATH(not root)";
	else if (arrlen < 1) err = "FILE PATH TOO SHORT IN SAVE_FS_BY_PATH";
	else {
		if (root_dirs.includes(rootname)) {} else if (rootname === "runtime") {} else if (rootname == "/") {
			if (!if_root) err = "Cannot save in the root directory";
		} else err = "Cannot save in directory:\x20" + rootname;
	}
	if (err) {
		cb(null, err);
		return;
	}
	let fname = arr.pop();
	let path = null;
	if (arr.length) path = arr.join("/");
	else path = "/";
	let dosave = (dir, obj) => {
		save_fs_file(dir, obj, fname, val, cb, {
			MIMEARG: mimearg,
			APPARG: apparg,
			APPEND: if_append,
			WINID: winid,
			ROOT: if_root,
			OK_LNK: opts.OK_LNK
		});
	};
	if (rootname == "/") {
		return dosave(fs_root, root);
	}
	get_or_make_dir(rootname, path, (objret, dirret) => {
		if (!dirret) {
			cb(null, "Could not stat the file");
			return;
		}
		dosave(dirret, objret);
	}, false, if_mkdir);
}
this.save_fs_by_path = save_fs_by_path;
this.savefile = save_fs_by_path;
//»
//SAVE_FS_FILE
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
	if (!opts) opts = {};
	let mimearg = opts.MIMEARG;
	let apparg = opts.APPARG;
	let if_append = opts.APPEND||opts.append;
	let if_root = opts.ROOT;
	let winid = opts.WINID;
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
	if (LINK_RE.test(fname) && !opts.OK_LNK){
		cerr("opts.OK_LNK not specified!!");
		cb();
		return;
	}
	dir.getFile(fname, {
		create: true
	}, fent => {
		write_fs_file(fent, blob, (ret, thisobj) => {
			if (ret) {
				let arr = fent.fullPath.split("/");
				arr.shift();
				arr.shift();
				let fullpath = "/" + arr.join("/");
				path_to_obj(fullpath, async gotobj => {
					let lenret = thisobj.position;
					if (gotobj) {
						if (Core.Desk) {
							let sha1 = await Core.api.sha1(val);
							let byteret = await Core.api.blobAsBytes(blob);
							Core.Desk.check_open_files(fullpath, winid, lenret, sha1, byteret);
						}
					}
					cb(ret, lenret);
				}, if_root, LINK_RE.test(fname));
			} else cb();
		}, if_append, (val && val.length == 1 && val.charCodeAt() == 0));
	}, err);
}
this.save_fs_file = save_fs_file;
//»

this.get_file_len_and_hash_by_path = (path, cb) => {
	get_fs_by_path(path, async ret => {
		if (ret) cb(ret.length, (await Core.api.sha1(ret)), ret);
		else cb();
	}, {
		BLOB: true
	}, {});
}

//»

//File ops(mv,cp,unzip)«

let crc32_table;
const make_crc32_table=()=>{//«
    var c = 0, table = new Array(256);
    for(var n =0; n != 256; ++n){
        c = n;
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        table[n] = c;
    }
    return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
};//»
this.dogzip=(bufin,if_gunzip)=>{//«

let int_to_byte_arr=(num)=>{//«
    var arr = new Uint8Array(4);
    arr[0]=num&0xff;
    arr[1]=(num&0xff00)>>8;
    arr[2]=(num&0xff0000)>>16;
    arr[3]=(num&0xff000000)>>24;
    return arr;
};//»
let arrbuf_as_bytes=(buf, posarr)=>{//«
    var arr =  new Uint8Array(buf);
    if (posarr) return arr.slice(posarr[0], posarr[1]);
    return arr;
};//» 
let blob_as_bytes=(blob, cb, posarr)=>{//«
    var reader = new FileReader();
    reader.onloadend = function() {
        cb(arrbuf_as_bytes(reader.result, posarr));
    }
    reader.onerror = function() {
        cb();
    }
    reader.readAsArrayBuffer(blob);
};//»
let to_bytes=(arg, cb, if_b64)=>{//«
    if (typeof arg == "string") {
        let arr;
        arg = new Blob([arg], {type:"application/octet-stream"});
    }   
    if (arg instanceof Uint8Array) cb(arg);
    else if (arg instanceof ArrayBuffer) cb(arrbuf_as_bytes(arg));
    else if (arg instanceof Blob) blob_as_bytes(arg, cb);
    else {
cwarn("blob_or_arrbuf_as_bytes(): GOT NO ArrayBuffer OR Blob!!!!");
        if (cb) cb();
    }   
};//»
function crc32(str, cb, ret_meth) {//«
	if (!crc32_table) crc32_table = make_crc32_table();
	let table = crc32_table;
	function crc32_buf(buf) {//«
		if(buf.length > 10000) return crc32_buf_8(buf);
		for(var crc = -1, i = 0, L=buf.length-3; i < L;) {
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		}
		while(i < L+3) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		return crc ^ -1;
	}//»
	function crc32_buf_8(buf) {//«
		for(var crc = -1, i = 0, L=buf.length-7; i < L;) {
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
			crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		}
		while(i < L+7) crc = (crc >>> 8) ^ table[(crc^buf[i++])&0xFF];
		return crc ^ -1;
	}//»
	function crc32_str(str) {//«
		for(var crc = -1, i = 0, L=str.length, c, d; i < L;) {
			c = str.charCodeAt(i++);
			if(c < 0x80) {
				crc = (crc >>> 8) ^ table[(crc ^ c) & 0xFF];
			} else if(c < 0x800) {
				crc = (crc >>> 8) ^ table[(crc ^ (192|((c>>6)&31))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
			} else if(c >= 0xD800 && c < 0xE000) {
				c = (c&1023)+64; d = str.charCodeAt(i++) & 1023;
				crc = (crc >>> 8) ^ table[(crc ^ (240|((c>>8)&7))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>2)&63))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((d>>6)&15)|((c&3)<<4))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(d&63))) & 0xFF];
			} else {
				crc = (crc >>> 8) ^ table[(crc ^ (224|((c>>12)&15))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|((c>>6)&63))) & 0xFF];
				crc = (crc >>> 8) ^ table[(crc ^ (128|(c&63))) & 0xFF];
			}
		}
		return crc ^ -1;
	}//»
	to_bytes(str, ret=>{
		if (!ret) return cb();
		let num = new Uint32Array([crc32_buf(ret)])[0];
		if (ret_meth=="bytes") {
			let arr = new Uint8Array(4);
			arr[0]=num&0xff;
			arr[1]=(num&0xff00)>>8;
			arr[2]=(num&0xff0000)>>16;
			arr[3]=(num&0xff000000)>>24;
			num=arr;
		}
		else {
			num = num.toString(16);
			num = "0".repeat(8-num.length) + num;
		}
		cb(num);
	});
}
//»
let gzip=(str, cb, ret_meth)=>{//«
	let bufarr;
	if (typeof str == "string") bufarr = new TextEncoder("utf-8").encode(str);
	else bufarr = str;	
	crc32(str, crcarr=>{
//		let timearr = int_to_byte_arr(now(true));
		let timearr = int_to_byte_arr(Core.api.tmStamp());
		let sizearr = int_to_byte_arr(str.length);

		let headbytes = [
			0x1f, 0x8b, 
			0x08, //DEFLATE
			0x0, //FLAGS
			timearr[0], timearr[1], timearr[2], timearr[3],
		//	(num&0xff), (num&0xff00)>>8, (num&0xff0000)>>16, (num&0xff000000)>>24, //TIME
			0x0, //COMPRESSION FLAGS
			0x3 //OS==Unix
		];
		Core.load_mod("util.Deflate", ret=>{
			if (ret) {
				let deflate = new window[__OS_NS__].mods.Zlib.RawDeflate(bufarr);
				let bytes = deflate.compress();
				let outarr = new Uint8Array(headbytes.length+bytes.length+8);
				outarr.set(headbytes, 0);
				outarr.set(bytes, headbytes.length);
				outarr.set(crcarr, headbytes.length+bytes.length);
				outarr.set(sizearr, headbytes.length+bytes.length+crcarr.length);
				cb(outarr);
			}
			else cb()
		},{CALL:true});

	},"bytes");
}
//»
let gunzip = function(bytes, cb, if_bin) {//«
	let mods = window[__OS_NS__].mods;
	function dogunzip() {//«
		let gunzip = new mods.Zlib.Gunzip(bytes);
		let plain = gunzip.decompress();
		let dataView = new DataView(plain.buffer);
		if (if_bin){
			cb(plain.buffer);
		}
		else {
			try {
				let decoder = new TextDecoder('utf-8');
				cb(decoder.decode(dataView));
			}
			catch(e){
				cb(bytes2str(new Uint8Array(plain.buffer)));
			}
		}
	}//»
	let blob_as_bytes=(blob, cb, posarr)=>{//«
		var reader = new FileReader();
		reader.onloadend = ()=>{
			cb(arrbuf_as_bytes(reader.result, posarr));
		}
		reader.onerror = ()=>{
			cb();
		}
		reader.readAsArrayBuffer(blob);
	};//»
	Core.load_mod("util.Gunzip", function(ret) {//«
		if (!ret) return cb();
		if (bytes instanceof Blob) {
			blob_as_bytes(bytes, byteret=>{
				if (!byteret)  {
cerr("util.gunzip blob_as_bytes??????");
					cb();
					return;
				}
				bytes = byteret; 
				dogunzip();
			});
		}
		else dogunzip();
	}, {CALL:true});//»
}//»
return new Promise((y,n)=>{//«
	let ext = null;
	let func;
	let verb;
	if (if_gunzip) {
		func = gunzip;
		verb = "inflate";
	}
	else {
		func = gzip;
		verb = "deflate";
	}
	func(bufin, ret2=>{
		if (!ret2) return y();
		if (if_gunzip) y(Core.api.bufToStr(ret2));
		else y(new Blob([ret2],{type:"application/gzip"}));
	}, true);
});//»

};//»

this.com_mv = (shell_exports, args, if_cp, dom_objects, recur_opts) => {//«

//Init«
	let {
		respbr,
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
	} = shell_exports;

	let use_dest_path="";
	if (recur_opts){
		cbok = recur_opts.cbok;
		cberr = recur_opts.cberr;
//		use_dest_path = recur_opts.dest_path;
	}

	let wclerr = shell_exports.wclerr;
	if (!wclerr) wclerr=NOOP;
	let {
		path_to_obj
	} = shell_exports;
	if (!path_to_obj) {
		path_to_obj = fsobj.path_to_obj;
console.warn("NOT PASSING IN path_to_obj!!!");
	}
	let _get_fullpath = (path, cwd, if_no_deref, if_getlink) => {
		return get_fullpath(path, if_no_deref, cwd, if_getlink);
	};
	let dohash;
	let sws;
	if (failopts) sws = failopts(args, {
		LONG: {
			hash: 1
		},
		SHORT: {
			f: 1,
			r: 1,
			t: 3
		}
	});
	else sws = {};
	if (!sws) return;
	let gotfail = false;
	let force = sws.f;
	if (!args.length) return serr("missing file operand");
	else if (args.length == 1) return serr("missing destination file operand after '" + args[0] + "'");
	if (args.length < 2) {
		serr("Too few args given");
		return;
	}
	let verb = "move";
	let com = "mv";
	if (if_cp) {
		verb = "copy";
		com = "cp";
	}
	let topatharg = _get_fullpath(args.pop(), cur_dir, true).regpath();
	let iter;
	let icon_obj = {};
	let towin = null;
	if (dom_objects) {
		icon_obj = dom_objects.ICONS;
		towin = dom_objects.WIN;
	}
//»
	const start_moving = (destret) => {//«
		let errarr = [];
		let mvarr = [];
		iter = -1;
		const domv = async () => {//«
			iter++;
			if (iter == mvarr.length) {
				if (Desk && !dom_objects) Desk.update_folder_statuses();
				if (gotfail) return cberr();
				cbok();
				return;
			}
			let arr = mvarr[iter];
			if (arr.ERR) {
				gotfail = true;
				werr(arr.ERR);
				domv();
			} else {
				let frompath = arr[0];//«
				let fromicon = icon_obj[frompath];
				let topath;
				let todir;
				let fent = arr[1];
				let type = fent.root.TYPE;
				let app = fent.APP;
				let gotfrom, gotto;
				let savedirpath;
				let savename;

//»
				if (destret) {//«
					if (destret.APP == FOLDER_APP) {
						topath = topatharg.replace(/\/+$/, "") + "/" + fent.NAME;
						savedirpath = get_path_of_object(destret);
						gotto = savedirpath + "/" + fent.NAME;
						savename = fent.NAME;
					} else {
						gotto = topath = topatharg;
						savedirpath = get_path_of_object(destret.par);
						savename = destret.NAME;
					}
				}
				else {
					topath = topatharg;
					gotto = _get_fullpath(topath, cur_dir);
					let arr = gotto.split("/");
					savename = arr.pop();
					savedirpath = arr.join("/")
				}//»
				gotfrom = _get_fullpath(frompath, cur_dir, null, true);
				if (!(gotfrom && gotto)) {
					if (!gotfrom) {
						gotfail=true;
						werr("Could not resolve:\x20" + frompath);
					}
					if (!gotto) {
						gotfail=true;
						werr("Could not resolve:\x20" + topath);
					}
					domv();
					return;
				}

if (!dom_objects) {
if (LINK_RE.test(gotfrom)){
	gotfail=true;
	werr(`${gotfrom}: cannot ${verb} links`);
	domv();
	return;
}
if (LINK_RE.test(gotto)){
	gotfail=true;
	werr(`${gotto}: '${LINK_EXT}' is an invalid extension`);
	domv();
	return;
}
}

				path_to_obj(savedirpath, async savedir => {//«
					if (!savedir) {
						werr(savedirpath + ":no such directory");
						domv();
						return
					}
					let savetype = savedir.root.TYPE;
					if (savetype == "local" || savetype == "www") {
						werr(`Not\x20(yet)\x20implementing move to ${savetype}`);
						domv();
					} 
					else if (savetype != "fs") {
						werr("Not (yet) supporting " + verb + " to " + savetype);
						domv();
						return;
					} else {


if (type!=="fs" && app === FOLDER_APP){

let nm = fent.NAME;
if (savedir.KIDS[nm]){
	gotfail=true;
	werr(`refusing to clobber: ${nm}`);
	domv();
	return;
}
if (dom_objects){
	gotfail=true;
	werr(`${nm}: please copy from the terminal`);
	domv();
	return;
}

let newpath = `${savedir.fullpath}/${nm}`;
if (!await touchDirProm(newpath)){
	gotfail=true;
	werr(`${newpath}: there was a problem creating the folder`);
	domv();
	return;
}
if (!fent.done) await popDir(fent);
let arr = [];	
let KIDS=fent.KIDS;
for (let k in KIDS){
	if (k=="."||k=="..") continue;
	arr.push(KIDS[k].fullpath);
}
arr.push(newpath);
let obj = {
	cbok: domv,
	cberr: () => {
		gotfail = true;
		domv();
	}
};
this.com_mv(shell_exports, arr, true, null, obj);
return;

}

if (type == "www") {//«
	let rv = await fetch(frompath);
	if (!rv.ok){
		werr("Could not fetch the file");
		domv();
		return;
	}
	await writeHtml5File(`${savedirpath}/${savename}`, await rv.blob());
	if (!dom_objects) mv_desk_icon(gotfrom, gotto, app);
	domv();
	return;
}//»

						if (type == "local") {//«
							let saver = new FileSaver();
							saver.set_cb("error", mess => {
								werr(mess);
								domv();
							});
							saver.set_cwd(savedirpath, parobj => {
								saver.set_filename(savename, newname => {
									saver.set_writer(ret => {
										let icons = null; /* At this point,we want to create an icon like in make_drop_icon than can be cancelled by clicking on the imgdiv */
										if (!ret) {
											werr("There was a problem!");
											domv();
											return;
										}
										let cancelled = false;
										let killcb = cb => {
											if (cancelled) {
												cb && cb();
												return;
											}
											cancelled = true;
											saver.cancel(() => {
												cbok("Cancelled!");
												cb && cb();
											});
											if (icons) {
												for (let icn of icons) Desk.rm_icon(icn);
											}
										};
										termobj.kill_register(killcb);
										saver.set_cb("update", per => {
											let str = per + "%";
											wclerr(str);
											if (icons) {
												for (let icn of icons) icn.overdiv.innerHTML = str;
											}
										});
										saver.set_cb("done", () => {
											termobj.kill_unregister(killcb);
											wclerr("100%");
											if (icons) {
												for (let icn of icons) icn.activate()
											};
											domv();
										});
										saver.start_blob_stream();
										let nBytes = null;
										let next_cb = null;
										if (Desk) {
											icons = mv_desk_icon(null, gotto, app, {
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
										readFileStream(gotfrom, (ret, next_cb_ret, nBytesRet) => {
											if (cancelled) return;
											if (!ret) {
												if (next_cb_ret) {
													next_cb = next_cb_ret;
													return;
												} else if (nBytesRet) {
													if (nBytes) {
														return cerr("Got nBytesRet while nBytes is already set!!!");
													}
													nBytes = nBytesRet;
													werr("Filesize:\x20" + nBytes);
//														wclerr("0%");
													saver.set_fsize(nBytes);
													return;
												}
												cerr("NOTHING FOUND");
												return;
											}
											if (ret === true) {
												saver.end_blob_stream();
												return;
											}
											if (ret instanceof Uint8Array) {
												nBytes = ret.length;
												ret = new Blob([ret], {
													type: "binary"
												});
											}
											saver.append_blob(ret, next_cb);
										});
									});
								}, force);
							});
						}//»
						else {//«
							mv_by_path(gotfrom, gotto, app, (parobj, kidobj) => {
								if (!parobj) werr("Could not " + verb + " from " + frompath + " to " + topath+"!");
								else {
									if (if_cp) gotfrom = null;
									mv_desk_icon(gotfrom, gotto, app, {
										node: kidobj,
										ICON: fromicon,
										WIN: towin
									});
								}
								domv();
							}, if_cp, is_root);
						}//»
					}
				});//»

			}
		};//»
		const getobj = () => {//«
			iter++;
			if (iter == args.length) {
				iter = -1;
				domv();
				return;
			}
			let fname = _get_fullpath(args[iter], cur_dir, null, true);
			if (!fname) {
				mvarr.push({
					ERR: "get_fullpath():\x20returned null:\x20" + args[iter]
				});
				getobj();
				return;
			}
			path_to_obj(fname, srcret => {//«
				if (!srcret) mvarr.push({
					ERR: com + ":\x20no such entry:\x20" + fname
				});
				else {
					let srctype = srcret.root.TYPE;
					if (srcret.treeroot || (srcret.root == srcret)) mvarr.push({
						ERR: "Skipping 'root' folder:\x20" + fname
					});
					else if ((srctype == "www" || srctype == "local") && !if_cp) mvarr.push({
						ERR: com + ":\x20" + fname + ":\x20cannot move from the remote directory"
					});
					else if (!(srctype == "fs" || srctype == "local" || srctype == "www")) mvarr.push({
						ERR: com + ":\x20" + fname + ":\x20cannot " + verb + " from directory type:\x20" + srctype
					});
//AIUTBNDHJEK
//					else if (srctype !=="fs" && srcret.APP == FOLDER_APP) mvarr.push({
//						ERR: com + ":\x20" + fname + ":\x20cannot (yet) copy remote folders"
//					});
					else mvarr.push([fname, srcret]);
				}
				getobj();
			}, true);//»
		};//»
		getobj();
	};//»
	path_to_obj(topatharg, destret => {//«
		if ((args.length > 1) && (!destret || (destret.APP != FOLDER_APP))) {
			serr("Invalid destination path:\x20" + topatharg);
			return;
		} else if (!force && args.length == 1 && destret && destret.APP != FOLDER_APP) {
//This allows a destination to be clobbered if the name is in the folder.
//Only if the file is explicitly named, does this error happen.
			serr("The destination exists:\x20" + topatharg);
			return;
		}
		if (destret && destret.root.TYPE == "fs") {
			if (!check_fs_dir_perm(destret, is_root)) {
				return serr(topatharg + ":\x20permission denied");
			}
		}
		start_moving(destret);
	});//»

}//»


//»
//Init/Populate«

const get_tree=(which,type)=>{
	let dir={NAME:which,TYPE:type,KIDS:{},APP:FOLDER_APP,sys:true,fullpath:`/${which}`};
	dir.root=dir;
	dir.KIDS['.']=dir;
	return dir;
}
const mount_dir=(name,obj,rootarg)=>{
	let _root=rootarg||root;
	if(_root.KIDS[name])return;
	obj.fullpath="/"+name;
	obj.NAME=name;
	obj.par=_root;
	obj.KIDS['..']=_root;
	obj.KIDS['.']=obj;
	_root.KIDS[name]=obj;
	return obj;
}
this.make_local_tree = (name, port) => {
	return new Promise((Y,N)=>{
		Core.xgettext(loc_url(port)+"/",(ret,err)=>{
			if (ret !=="HI") {
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
			mount_dir(name, tree, root.KIDS.mnt);
			Y(true);
		});
	});
};
const make_bin = ()=>{
	return new Promise(async (Y,N)=>{
		let par = mount_dir("bin", get_tree("bin", "bin"));
		let kids = par.KIDS;
		let rv = await fetch("/_getbin");
		let arr = await rv.json();
//let arr = [];
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
};

this.make_all_trees = async(allcb, rootarg, fsarg) => {//«
	const useroot = rootarg||root;
	const make_dir_tree = (name, treecb, force) => {//«
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
		const domake = () => {//«
			let tree = new_root_tree(name);
			let kids = tree.KIDS;
			tree.root = tree;
			tree.par = useroot;
			kids['.'] = tree;
			kids['..'] = useroot;
			useroot.KIDS[name] = tree;
			(fsarg||fs_root).getDirectory(name, {
				create: true
			}, dirret => {
				let reader;
				let ents;
				const readents = (cbarg) => {
					const toArray = (list) => {
						return Array.prototype.slice.call(list || [], 0);
					};
					reader.readEntries(ret => {
						if (ret.length) {
							ents = ents.concat(toArray(ret));
							readents(cbarg);
						} else {
							for (let i = 0; i < ents.length; i++) {
								let ent = ents[i];
								let name = ent.name;
								let obj = {
									'NAME': name,
									par: tree,
									root: tree
								};
								if (ent.isDirectory) {
									obj.APP = FOLDER_APP;
									obj.KIDS = {
										'.': obj,
										'..': tree
									};
								}
								kids[name] = obj;
							}
							cbarg();
						}
					});
				};
				treecb(tree, dirret);
			}, () => {});
		};//»
		domake();
	};//»

	mount_dir("mnt", get_tree("mnt", "mount"));
	mount_dir("www", get_tree("www", "www"));
	await make_bin();

	let iter = -1;
	const make_tree = () => {
		iter++;
		if (iter >= root_dirs.length) {
			if (allcb) allcb(true);
			return;
		}
		let name = root_dirs[iter];
		if (name) {
			make_dir_tree(name, (ret, dent) => {
				if (ret) {
					if (name == "tmp") ret.perm = true;
					else {
						ret.perm = false;
						if (name=="runtime"){
							ret.readonly = true;
							ret.rootonly = true;
						}
					}
					ret.DENT = dent;
					ret.KIDS['.'] = ret;
					ret.KIDS['..'] = useroot;
					useroot.KIDS[name] = ret;
				}
				make_tree();
			});
		} else if (allcb) allcb(true);
	};
	make_tree();
}
//»
const mkdirkid = (par, name, is_dir, sz, mod_time, path, hashsum, file, ent) => {//«
	let kid = {
		NAME: name,
		par: par,
		root: par.root
	};
	if (is_dir) {
		kid.APP = FOLDER_APP;
		if (par.par.treeroot == true) {
			if (par.NAME == "home") {
				kid.perm = name;
			}
			else if (par.NAME == "var" && name == "cache") {
				kid.readonly = true;
			}
		}
		let kidsobj = {
			'..': par
		};
		kidsobj['.'] = kid;
		kid.KIDS = kidsobj;
	}
	else if (LINK_RE.test(name)){
		kid.APP="Link";
	}
	else {
		kid.APP = capi.extToApp(name);
	}
	if (mod_time) {
		kid.MT = mod_time;
		kid.SZ = sz;
	}
	kid.path = path;
	kid.fullpath = path + "/" + name;
	kid.file = file;
	kid.entry = ent;
	if (hashsum) kid.hashsum = hashsum;
	return kid;
}//»
const populate_dirobj_by_path = (patharg, cb, if_root, noarg, opts={}) => {//«
	if (!patharg.match(/^\x2f/)) throw new Error("need absolute path in populate_dirobj_by_path: ("+patharg+")");
	path_to_obj(patharg, obj => {
		if (!obj) return cb(null, "Not found:\x20" + patharg);
		if (obj.APP !== FOLDER_APP) return cb(null, "Not a directory:\x20" + patharg);
		populate_dirobj(obj, cb, opts);
	}, if_root,false);
};
this.populate_dirobj_by_path=populate_dirobj_by_path;//»

const populate_dirobj = (dirobj, cb, opts = {}) => {//«
if (dirobj.TYPE=="local"){
//log(dirobj.done);
//log(dirobj);
}
	if (!cb)cb=()=>{};
	let type = dirobj.root.TYPE;
	let path = objpath(dirobj);
	if (type == "fs") return populate_fs_dirobj_by_path(path, cb, {par:dirobj, long:opts.LONG, streamCb: opts.streamCb});
//	if (type == "local") return populate_rem_dirobj(path, cb, dirobj, opts);
	if (type == "local" || type == "www") return populate_rem_dirobj(path, cb, dirobj, opts);
	if (type == "mount") return cb(root.KIDS.mnt.KIDS);
	if (type == "bin") return cb(root.KIDS.bin.KIDS);

	FATAL(`Unknown directory type: ${type}`);

//	cb({})
}
this.populate_dirobj = populate_dirobj;
this.popdir = populate_dirobj;

//»

const populate_fs_dirobj_by_path = async(patharg, cb, opts={}) => {//«

let parobj = opts.par;
let if_long = opts.long;
//let stream_cb = opts.streamCb;
if (!cb) cb = () => {};//«
if (!patharg.match(/^\x2f/)) throw new Error("need absolute path in populate_fs_dirobj: ("+patharg+")");
let rootarg;
let fsarg;
patharg = patharg.regpath();

//»

if (!parobj) {//«
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

let now = Date.now();
let use_year_before_time = now - (1000 * 86400 * MAX_DAYS);

let rootobj = parobj.root;
let kids = parobj.KIDS;
if (patharg == "/") return cb(kids);
let ents = await getFsDirKids(patharg, opts);
let links=[];

for (let ent of ents){//«
	let name = ent.name;
	if (ent.isDirectory) {
		kids[name] = mkdirkid(parobj, name, true, 0, 0, patharg);
		kids[name].entry = ent;
		continue;
	}

	let file = await getFsFileFromEntry(ent);
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

	let kid = mkdirkid(parobj, name, false, file.size, timestr, patharg, null, file, ent);
	kids[name] = kid;
	let narr = capi.getNameExt(name);
//log(narr);
	kid.name = narr[0];
	kid.ext = narr[1];
	if (!kid.ext) kid.fullname = kid.name;
	else kid.fullname = name;;
	if (LINK_RE.test(name)){
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

for (let kid of links){
	kid.ref = await pathToNode(kid.LINK);
}

cb(kids);

//»

}

this.populate_fs_dirobj = (patharg, cb, parobj, if_long) => {
populate_fs_dirobj_by_path(patharg, cb, {par:parobj, long:if_long});
};
//»
const populate_rem_dirobj = (patharg, cb, dirobj, opts = {}) => {//«
	if (!patharg) patharg = get_path_of_object(dirobj);
//	if (!patharg.match(/^\/mnt\/?/)) return FATAL("patharg must begin with '/mnt'!");
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
	else return FATAL("patharg must begin with '/mnt' or '/www'!");
	let path = parts.join("/");
	if (!path) path="/";
	xgetobj(`${baseurl}/_getdir?path=${path}`, async (ret, err) => {
		if (isobj(ret)) {
			if (ret.ERR) return cb(null, ret.ERR);
			else {
				cerr("Populate_rem_dirobj():Unknown return value with url:" + url);
				return cb(null, "?????");
			}
		}
		if (err) return cb(null, err);
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
				cwarn("Populate_rem_dirobj():Skipping entry:" + k);
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
			let hash = null;
            let kidobj = mkdirkid(dirobj, fname, isdir, sz, tmstr, holdpath, hash);
			kidobj.modified = tm;
			kidobj.created = ctime;
			kids[fname] = kidobj;
		}
		cb(kids);
	});
}
this.populate_rem_dirobj = populate_rem_dirobj;
//»

//»
//Install/Load«

this.getwasmmod=(which,cb)=>{getmod("util.wasm",wasm=>{if(!wasm)return cb(null,"No wasm module!");Core.get_wasm(which,(wasmret)=>{if(!wasmret)return cb(null,"No "+which+".wasm!");wasm.WASM({wasmBinary:wasmret},which,cb);});});}
this.getstatmod=(which,cb,opts)=>{if(!opts)opts={};opts.STATIC=true;getmod(which,cb,opts);}
const getmod = (which, cb, opts = {}) => {
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
				if (typeof ret === "string") Core.do_update(`mods.${which}`, ret);
			} else cb();
		}, opts);
	}
}
this.getmod = getmod;

//»
//Shell/System«

const format_ls = (w, arr, lens, cb, types, col_arg, ret, col_ret) => {
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
}
this.get_obj_listing = (kids, w, lscb, opts = {}) => {//«
	let FAKE_TIME = "-------:--";
	let ret = [];
	let types = [];
	let name_lens;
	let isjson = opts.isjson;
	let add_slashes = opts.addslashes;
	let if_hash = opts.ifhash;
	const lsout = () => {
		if (isjson) {
			lscb(ret);
			return;
		}
		if (opts.islong) {
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
			lscb(lines);
		} else {
			if (!w) {
				lscb(ret);
			} else {
				if (opts.newlinemode) return lscb(ret);
				let name_lens = [];
				for (let nm of ret) name_lens.push(nm.length);
				format_ls(w, ret, name_lens, (ls_ret, col_ret) => {
					lscb(ls_ret, null, col_ret);
				}, types, null, [], []);
			}
		}
	};
	let keys = getkeys(kids);
	let iter = -1;
	const dokids = () => {
		const doret = () => {//«
//			let name = key.replace(/\._lnk$/,"");
			let name = key;
			if (kid.KIDS) {
				if (opts.islong) {
					name = name + "/";
					if (kid.MT && isint(kid.SZ)) ret.push([name, kid.SZ, kid.MT]);
					else ret.push([name, "-", FAKE_TIME]);
				} else {
					if (add_slashes) name += "/";
					ret.push(name);
				}
			} else {
				if (opts.islong) {
					let arr;
					if (kid.LINK) {
						if (isjson) arr = [
							[name, kid.LINK], kid.LINK.length, FAKE_TIME
						];
						else arr = [name + "\x20->\x20" + kid.LINK, kid.LINK.length, FAKE_TIME];
					} else if (kid.BUFFER) arr = [name, 0, FAKE_TIME];
					else if (util.isnum(kid.SZ)) arr = [name, kid.SZ, kid.MT];
					else arr = [name, 0, FAKE_TIME];
					if (if_hash) arr.push(kid.hashsum);
					ret.push(arr);
				} else ret.push(name);
			}
			dokids();
		};//»
		iter++;
		if (iter == keys.length) return lsout();
		let key = keys[iter];
		let kid = kids[key];
		if (kid.APP == "Link") {
			if (kid.badlink===true){
				types.push("BadLink");
				doret();
			}
			else if (kid.badlink===false){
				types.push("Link");
				doret();
			}
			else {
				path_to_obj(kid.LINK, ret => {
					if (ret) types.push("Link");
					else types.push("BadLink");
					doret();
				}, opts.isroot, false);
			}
		} else {
			types.push(kid.APP || "File");
			doret();
		}
	};
	dokids();
}//»

this.get_term_fobj = function(termobj, cur_dir, fname, flags, cb, is_root, funcs) {//«


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

let	_parser,_ukey,_fent,_read,_write,_buffer,_iter=0,_blob=null,_type,_port_cb;//«
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
	if (_write) return cwarn("rmfobj: Not deleting fobj: " + _ukey + " (writable)");
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

let thiswriter = this;
delete termobj.dirty[_ukey];
this.clear = () => {
	_buffer = [];
	_iter = 0;
	termobj.dirty[_ukey] = thisobj;
};
this.blob = blobarg => {
	_buffer = blobarg;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};
this.object = obj => {
	_buffer = obj;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
};
this.line = (str, arg2, cb, opts) => {
	if (!opts) opts = {};
	if (str === "\x00") {
		if (!opts.FORCELINE) {
			cwarn("Writer.line:NULL byte discarded(no opts.FORCELINE)");
			return;
		}
	}
	if (str === EOF) return;
	_buffer[_iter] = str;
	_iter++;
	termobj.dirty[_ukey] = thisobj;
	if (cb) cb(true);
};
this.lines = (arr, arg2, arg3, arg4, cb, write_cb) => {
	if (arr === EOF) return;
	let tmp = _buffer.concat(arr);
	_buffer = tmp;
	_iter += arr.length;
	termobj.dirty[_ukey] = thisobj;
	if (cb) cb();
	if (write_cb) write_cb(1);
};
this.sync = async cb=>{
if (_type == "fs") {
	delete termobj.file_objects[_ukey];
	let path = get_path_of_object(_fent);
	let str;
	if (_buffer instanceof Blob) str = _buffer;
	else {
		_buffer = chomp_eof(_buffer);
		str = _buffer.join("\n");
		if (flags.append) str = "\n" + str;
	}
	save_fs_by_path(path, str, (fent, err_or_size) => {
		if (fent) delete termobj.dirty[_ukey];
		else if (err_or_size) {
console.warn("Got no fent from save_fs_by_path! Is the following a proper error message?");
console.error(err_or_size);
			cb();
			return;
		}
		else{
console.warn("Got no fent or err_or_size from save_fs_by_path!!!");
			cb();
			return;
		}

		if (Core.Desk) Core.Desk.save_hook(path, fent);
		else Core.save_hook(path);
		cb(fent);
	}, {
		APPEND: flags.append,
		ROOT: is_root
	});
}
else {
cwarn("WHAT TYPE IN SYNC????? " + _type);
		cb();
	}
}
};//»
const make_fobj = (type, fent, ukey) => {//«
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
	} 
	else {
		if (type == "fs") {
			let path = get_path_of_object(fent);
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
			if (flags.read) {
				if (fent.BUFFER) cb(obj);
				else {
					get_fs_by_path(path, (ret, err) => {
						if (ret) {
							let lines = ret.split("\n");
							_buffer = lines;
							cb(obj);
						} else {
							cb("Could not get file contents:\x20" + path);
							delete termobj.file_objects[_ukey];
						}
					});
				}
			} else {
				_buffer = [];
				cb(obj);
			}
		} 
		else {
			cerr("FOBJ TYPE:" + type + "?");
			cb();
		}
	}
}//»
path_to_obj(get_fullpath(fname, true, cur_dir), winid => {//«
	if (!winid) {
		if (!flags.write) {
			cb();
			return;
		}
		let usefname, dirid;
		let domake = () => {
			if (dirid && usefname) {
				if (typeof(dirid) == "object") {
					if (dirid.treeroot) {
						if (!is_root) cb("Permission denied:\x20cannot save to the root directory");
						else {
							let obj = {
								NAME: usefname,
								par: dirid
							};
							obj.root = dirid;
							make_fobj("fs", obj);
						}
					} else {
						let root = dirid.root;
						let type = root.TYPE;
						if (type == "fs") {
							if (!check_fs_dir_perm(dirid, is_root)) return cb("Permission denied");
						} 
						else return cb("Not yet supporting new FileObj for type==" + type);
						let obj = {
							'NAME': usefname,
//							'APP': "File",
							'par': dirid
						};
						obj.root = root;
						dirid.KIDS[usefname] = obj;
						make_fobj(root.TYPE.toLowerCase(), obj);
					}
				} else cb();
			} else cb();
		};
		if (fname.match(/\x2f/)) {
			let arr = fname.split(/\x2f/);
			usefname = arr.pop();
			if (!usefname) {
				cb("no filename given");
				return;
			} else {
				let usedir = get_fullpath(arr.join("/"), null, cur_dir);
				if (!usedir) usedir = "/";
				path_to_obj(usedir, ret => {
					dirid = ret;
					domake();
				}, is_root);
			}
		} else {
			path_to_obj(cur_dir, ret => {
				dirid = ret;
				usefname = fname;
				domake();
			}, is_root);
		}
	} else {
		if (winid.APP == FOLDER_APP) return cb(fname + ":\x20is a directory");
		let ukey = get_distinct_file_key(winid);
		if (!ukey) {
			log("NO DISTINCT KEY:");
			cb();
			return;
		}
		let root = winid.root;
		let type = root.TYPE;
		let types = ["fs"];
		if (types.includes(type)) make_fobj(type, winid, ukey);
		else {
			cerr("WHAT ROOT TYPE:" + root.TYPE);
		}
	}
}, is_root);//»

}//End FileObj


new FileObj(fname, flags, cb);

}//»End get_term_fobj


//»
//Saving Blobs/Files«

const FileSaver=function(){//«
/*Howto notes in /var/FileSaver.txt*/
let SLICE_SZ = 1 * MB;
let cwd,fname,basename,fullpath,ext,file,fSize,fEnt,/*This is always what is being written to,and depends on the FileSystem API*/ writer;/*from fEnt.createWriter()*/

let bytesWritten=0;let curpos=0;let update_cb,done_cb,error_cb;let stream_started=false,stream_ended=false;let saving_from_file=false;let cancelled=false;let check_cb=(arg,num)=>{if(arg instanceof Function)return true;cerr("arg #"+num+" is not a valid cb");return false;};
const cerr=str=>{if(error_cb)error_cb(str);else Core.cerr(str);};

const make_kid_obj = () => {
	path_to_obj(cwd, parobj => {
		if (parobj) {
			let kid = {
				NAME: fname,
				APP: "File"
			};
			kid.par = parobj;
			kid.root = parobj.root;
			parobj.KIDS[fname] = kid;
		} else {
			cwarn("make_kid_obj:No parobj!");
		}
	});
};
const get_new_fname = (cb, if_force) => {
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
};
const save_file_chunk = (blobarg, cbarg) => {
	if (cancelled) return cwarn("Cancelled!");
	writer.seek(writer.length);
	let slice;
	if (blobarg) slice = blobarg;
	else if (file) slice = file.slice(curpos, curpos + SLICE_SZ);
	else {
		cerr("save_file_chunk():No blobarg or file!");
		return;
	}
	writer.onwriteend = () => {
		if (blobarg) {
			bytesWritten += blobarg.size;
			if (update_cb) {
				if (fSize) update_cb(Math.floor(100 * bytesWritten / fSize));
				else update_cb(bytesWritten);
			}
			if (cbarg) cbarg();
		} else {
			curpos += SLICE_SZ;
			if (writer.length < fSize) {
				if (update_cb) update_cb(Math.floor(100 * writer.length / fSize));
				save_file_chunk();
			} else {
				writer.onwriteend = e => {};
				writer.truncate(writer.position);
				make_kid_obj();
				if (done_cb) done_cb();
			}
		}
	};
	writer.onerror = e => {
		cerr("FileSaver:There was a write error");
		log(e);
	};
	writer.write(slice);
};

this.set_cb=(which,cb)=>{if(which=="update")update_cb=cb;else if(which=="done")done_cb=cb;else if(which=="error")error_cb=cb;else cerr("Unknown cb type in set_cb:"+which);};
this.set_cwd = (arg, cb) => {
	if (!check_cb(cb, 2)) {
console.error("check_cb: failed");
		return;
	}
	if (arg && arg.match(/^\x2f/)) {
		path_to_obj(arg, ret => {
			if (!(ret && ret.APP == FOLDER_APP)) {
				cb();
				return console.error("Invalid directory path:\x20" + arg);
			}
			cwd = arg;
			cb(ret);
		});
	}
	else {
		console.error("Invalid cwd:\x20" + arg + "\x20(must be a fullpath)");
	}
};
this.set_fsize=(arg)=>{if(!(isint(arg)&& ispos(arg)))return cerr("Need positive integer for fSize");fSize=arg;};
this.set_ext=(arg)=>{if(!(arg&&arg.match(/^[a-z0-9]+$/)))return cerr("Invalid extension given:need /^[a-z0-9]+$/");ext=arg;};
this.set_filename = (arg, cb, if_force) => {
	if (!check_cb(cb, 2)) return;
	if (!cwd) {
		cb();
		cerr("Missing cwd");
		return
	}
	if (!arg) arg = "New_File";
	arg = arg.replace(/[^-._~%+:a-zA-Z0-9 ]/g, "");
	arg = arg.replace(/\x20+/g, "_");
	if (!arg) arg = "New_File";
	basename = arg;
	get_new_fname(ret => {
		if (!ret) return cb();
		fname = ret;
		fullpath = (cwd + "/" + fname).regpath();
		cb(fname);
	}, if_force)
};
this.set_writer=(cb)=>{if(!check_cb(cb,1))return;get_fs_ent_by_path(fullpath,(ret,errmess)=>{if(!ret)return cb(null,errmess);fEnt=ret;fEnt.createWriter(ret2=>{if(!ret2)return cb();writer=ret2;cb(true);});},false,true)};
this.save_from_file = (arg) => {
	if (saving_from_file) return cerr("Already saving from a File object");
	if (stream_started) return cerr("Already saving from a stream");
	if (!writer) return cerr("No writer is set!");
	saving_from_file = true;
	fSize = arg.size;
	file = arg;
	if (!update_cb) cwarn("update_cb is NOT set!");
	if (!done_cb) cwarn("done_cb is NOT set!");
	save_file_chunk();
};

this.start_blob_stream=()=>{
	if(stream_started)return cerr("blob stream is already started!");
	if(saving_from_file)return cerr("Already saving from a File object");
	if(!writer)return cerr("No writer is set!");
//	if(!fSize)cwarn("fSize not set,so can't call update_cb with percent update,but with bytes written");
//	if(!update_cb)cwarn("update_cb is NOT set!");
//	if(!done_cb)cwarn("done_cb is NOT set!");
	stream_started=true;
};
this.append_blob=(arg,cb)=>{/* If no fSize is set,we can call update_cb with the number of bytes written */ if(stream_ended)return cerr("The stream is ended!");if(!stream_started)return cerr("Must call start_blob_stream first!");if(!check_cb(cb,2))return;if(!(arg instanceof Blob))return cerr("The first arg MUST be a Blob!");save_file_chunk(arg,cb);};
this.end_blob_stream=()=>{stream_ended=true;make_kid_obj();if(done_cb)done_cb();};
this.cancel = (cb) => {
	cwarn("Cancelling... cleaning up!");
	cancelled = true;
	fEnt.remove(() => {
		cwarn("fEnt.remove OK");
		cb();
	}, () => {
		cerr("fEnt.remove ERR");
		cb();
	});
};

}
this.FileSaver=FileSaver;
//»

const event_to_files = (e) => {
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

this.drop_event_to_bytes=(e,cb)=>{let file=event_to_files(e)[0];if(!file)return cb();let reader=new FileReader();reader.onerror=e=>{cerr("There was a read error");log(e);};reader.onloadend=function(ret){let buf=this.result;if(!(buf && buf.byteLength))return cb();cb(new Uint8Array(buf),file.name);};reader.readAsArrayBuffer(file);}

//»
//Desktop/Icons/Children«

this.add_new_kid = (parpath, name, cb, app) => {

	if (LINK_RE.test(name)) app="Link";
	const doadd = (par) => {
		if (!(par && par.KIDS)) {
			if (cb) cb();
			return;
		}
		if (par.KIDS[name]){
			if (cb) cb(par.KIDS[name]);
			return;
		}
		let obj = {
			NAME: name,
			par: par,
			root: par.root
		};
		if (app) {
			obj.APP = app;
			if (app == FOLDER_APP) {
				var kidobj = {
					'..': par
				};
				kidobj['.'] = kidobj;
			}
		}
		let gotobj=par.KIDS[name];
		if (!gotobj) {
			gotobj = obj;
			par.KIDS[name] = gotobj;
		}
		if (cb) cb(gotobj);
	};
	if (typeof parpath == "object") doadd(parpath);
	else {
		path_to_obj(parpath, parret => {
			doadd(parret);
		});
	}
}
const mk_desk_icon=(path,opts)=>{mv_desk_icon(null,path,null,opts);}
this.mk_desk_icon=mk_desk_icon;
const mv_desk_icon = (frompath, topath, app, opts = {}) => {
	let _Desk = Desk;
	if (!_Desk) return;
	let use_link;
	let ret = [];
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
	let wins = [];
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
		let re = new RegExp("^(.+)\\.(" + globals.all_extensions.join("|") + ")$");
		let marr = re.exec(toname);
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
	} else {
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
			let newicon = _Desk.automake_icon(ext, toname, w, opts);
			if (newicon) ret.push(newicon);
			
		}
	}
	if (frompath && topath) _Desk.update_all_paths(frompath, topath);
	return ret;
}
this.mv_desk_icon=mv_desk_icon;

//»

//API«

const mvByPath=(src, dest, opts={})=>{
	return new Promise((Y,N)=>{
//		mv_by_path(src, dest, opts.app,Y, opts.copy, opts.root);
		mv_by_path(src, dest, opts.app,Y, null, opts.root);
	});
};
const mvFileByPath=(src, dest, opts={})=>{
	if (opts.app) {
console.error(`opts.app == '${opts.app}'!?!?!`);
		return;
	}
	return mvByPath(src, dest, opts);
};
const mvDirByPath=(src, dest, opts={})=>{
	opts.app = FOLDER_APP;
	return mvByPath(src, dest, opts);
};
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
		populate_dirobj_by_path(patharg, cb, opts.root, null, opts);
	});
};//»
const populateFsDirObjByPath=(patharg, opts={})=>{//«
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
		populate_fs_dirobj_by_path(patharg, cb, opts);
	});
};//»
const popDir=(dirobj,opts={})=>{return new Promise((y,n)=>{populate_dirobj(dirobj,y,opts);});};
const popDirProm=(path,opts={})=>{return new Promise((res,rej)=>{path=path.regpath();if(path !="/")path=path.replace(/\/$/,"");populate_fs_dirobj_by_path(path,rv=>{if(rv)return res(rv);if(opts.reject)rej(path+":\x20could not populate the directory");else res(false);})})};
const tryPopDirsCB=async(path_arr,cb)=>{let ok_paths=[];for(let path of path_arr){try{await popDirProm(path);ok_paths.push(path);}catch(e){}}cb(ok_paths);};
const popDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(popDirProm(path,opts));return Promise.all(proms);};
const touchDirsProm=(path_arr,opts={})=>{let proms=[];for(let path of path_arr)proms.push(touchDirProm(path,opts));return Promise.all(proms);};
const getFsEntryByPath=(path,opts={})=>{return new Promise((res,rej)=>{get_fs_ent_by_path(path,rv=>{if(!rv){if(opts.reject)rej("Could not get the file entry:\x20"+path);else res(false);return}res(rv);},opts.isDir,opts.create,opts.isRoot);});};
const saveFsFileByDirEntry=(dirEnt,name,val,opts={})=>{let optsin={MIMEARG:opts.mime,APPEND:opts.append,ROOT:opts.isRoot};return new Promise((res,rej)=>{save_fs_file(dirEnt,null,name,val,rv=>{if(!rv){if(opts.reject)rej("Could not save the file:\x20"+name);else res(false);return}res(true);},optin);});};
const writeFsFile=(fent,blob,opts={})=>{return new Promise((res,rej)=>{write_fs_file(fent,blob,rv=>{if(!rv){if(opts.reject)rej("Could not write the file");else res(false);return;}res(true);},opts.append,opts.truncate);});};
const cacheFileIfNeeded=(path,opts={})=>{return new Promise((res,rej)=>{if(!path.match(/^\x2f/))return rej("Not a full path:\x20"+path);get_fs_ent_by_path(path,async rv=>{if(rv)return res(true);let ret,blob;try{ret=await fetch("/root"+path);if(!ret.ok){if(opts.reject)return rej("Response not OK:\x20"+"/root"+path+"("+ret.status+")");else if(opts.def)blob=new Blob([opts.def]);else return res(false);}if(!blob)blob=await ret.blob();}catch(e){rej(e);return}save_fs_by_path(path,blob,rv2=>{if(rv2)return res(true);if(opts.reject)rej(path+":could not save the file");else res(false);},{ROOT:true});},false,false,true);});};
const loadMod=(which,opts={})=>{return new Promise((Y,N)=>{getmod(which,rv=>{if(!rv){if(opts.reject)return N("Could load load:\x20"+which);else return Y(false);}Y(true);},opts);});};
const pathToNode = (path, opts = {}) => {//«
	let if_root = opts.ROOT || opts.root || opts.isRoot;
	let if_link = opts.GETLINK || opts.link;
	return new Promise((res, rej) => {
		path_to_obj(path, ret => {
			if (ret) return res(ret);
			if (opts.reject) rej(path + ":\x20not found");
			else res(false);
		}, if_root, if_link);
	})
};//»
const touchDirProm = (path, opts = {}) => {
	return new Promise((res, rej) => {
		mkdir_by_path(path, rv => {
			if (rv) return res(true);
			if (opts.reject) rej(path + ":\x20could not create the directory");
			else res(false);
		});
	})
};
const writeHtml5File = (path, val, opts = {}) => {
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
};
const touchHtml5File=(path)=>{return new Promise((y,n)=>{touch_fs_file(path,y);});};
const readFile = (path, opts = {}) => {//«
	return new Promise((Y, N) => {
		let buf = [];
		read_file(path, (rv, path, err) => {
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
this.readFileStream=readFileStream;
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
			fent = await writeHtml5File(path, val, opts);
			if (opts.NOMAKEICON) {} else if (!if_exists) mk_desk_icon(path);
			Y(fent);
		} 
		else {
			err("Invalid or unsupported root dir:\x20" + rootdir);
		}
	});
}//»
const readHtml5File=(path,opts={})=>{return new Promise((res,rej)=>{get_fs_by_path(path,(ret,err_or_obj,isgood)=>{if(isgood)return res(ret);if(opts.reject)rej(path+":not found");else res(false);},opts);})};
const getUniquePath=(path,opts={})=>{return new Promise(async(Y,N)=>{try{let rv=await get_unique_path(path,opts,opts.ROOT);Y(rv);}catch(e){cerr(e);if(opts.reject)N(e);else Y(false);}});};
const pathExists=(path,opts={})=>{opts.isRoot=true;opts.create=false;opts.isDir=true;return new Promise(async(Y,N)=>{if(await getFsEntryByPath(path,opts))return Y(true);opts.isDir=false;if(await getFsEntryByPath(path,opts))return Y(true);Y(false);});};
const loadModules=(arr,opts_arr=[])=>{let proms=[];for(let i=0;i<arr.length;i++)proms.push(loadMod(arr[i],opts_arr[i]));return Promise.all(proms);};
const getMod=(which,opts={})=>{return new Promise((Y,N)=>{getmod(which,Y,opts);});};
const saveFsByPath=(path,val,opts)=>{return new Promise((Y,N)=>{save_fs_by_path(path,val,Y,opts);});};
const getRoot=(opts={})=>{
return root;
};
//touchDirsProm, //Should always work
//touchDirProm, //Should always work
//popDirsProm, //Will reject if a dir doesn't exist
//popDirProm, //Will reject if it doesn't exist
//tryPopDirsCB, //Not externally async, so need a CB. It ignores failures and 

const api_funcs = [//«
	"mvFileByPath", mvFileByPath,
	"mvDirByPath", mvDirByPath,
	"getRoot", getRoot,	
	"populateFsDirObjByPath", populateFsDirObjByPath,
	"populateDirObjByPath", populateDirObjByPath,
	"getFsFileData", getFsFileData,
	"getFsDirKids", getFsDirKids,
	"getFsEntry", getFsEntry,

	"getUniquePath", getUniquePath,
	"touchHtml5Dirs", touchDirsProm,
	"mkDir", touchDirProm,
	"touchHtml5Dir", touchDirProm,
	"mkHtml5Dir",touchDirProm,
	"touchHtml5File",touchHtml5File,
	"popDir", popDir,
	"popHtml5Dirs", popDirsProm,
	"popHtml5Dir", popDirProm,
	"tryPopHtml5DirsCB", tryPopDirsCB,
	"writeHtml5File", writeHtml5File,
	"readHtml5File", readHtml5File,
	"pathToNode", pathToNode,
	"pathExists", pathExists,
	"loadModules", loadModules,
	"loadMod", loadMod,
	"loadModule", loadMod,
	"getFsEntryByPath", getFsEntryByPath,
	"saveFsFileByDirEntry", saveFsFileByDirEntry,
	"writeFsFile", writeFsFile,
	"cacheFileIfNeeded", cacheFileIfNeeded,
	"readFile", readFile,
	"getMod", getMod,
	"saveFsByPath", saveFsByPath,
	"writeFile", writeFile

]//»

for (let i=0; i < api_funcs.length; i+=2){
	register_fs_api_func(api_funcs[i], api_funcs[i+1]);
}

this.api=api;

NS.api.fs=api;

//»

}

