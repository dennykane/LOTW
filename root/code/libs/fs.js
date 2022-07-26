

export const lib = (comarg, args, Core, Shell)=>{

const COMS = {//«

	'ln':async function(){//«
/*«
Save symbolic links in lst as:
LN_/path/to/link:"some string of text"

One arg = use the filename as the link name, and put it in cur_dir
The "string of text"

SYNOPSIS
   ln [OPTION]... [-T] TARGET LINK_NAME   (1st form)
   ln [OPTION]... TARGET                  (2nd form)
   ln [OPTION]... TARGET... DIRECTORY     (3rd form)
   ln [OPTION]... -t DIRECTORY TARGET...  (4th form)

DESCRIPTION
   In  the 1st form, create a link to TARGET with the name LINK_NAME.  In the
   2nd form, create a link to TARGET in the current directory.   In  the  3rd
   and  4th  forms,  create  links  to each TARGET in DIRECTORY.  Create hard
   links by default, symbolic links with --symbolic.  By default, each desti-
   nation  (name  of  new link) should not already exist.  When creating hard
   links, each TARGET must exist.  Symbolic links can hold arbitrary text; if
   later  resolved,  a relative link is interpreted in relation to its parent
   directory.

»*/
		const exists=(name)=>{
			cberr("failed to create symbolic link '"+name+"': File exists");
		};
		let par;
		let lnname;
		let lnpath;
		let target_node;
		const makeit=()=>{//«
			let kids = par.KIDS;
			let ln_ext = globals.LINK_EXT;
			if (kids[lnname+ln_ext]) return exists(fs.get_path_of_obj(par)+"/"+lnname);
			fs.save_fs_by_path(`${lnpath}.${ln_ext}`, target, (rv)=>{
				if (!rv) return cberr("The link could not be created");
				rv.ref = target_node;
				fs.mk_desk_icon(lnpath, {LINK:target, node: rv});
				cbok(lnpath + " -> " + target);
			}, {OK_LNK: true});
		};//»
		let opts = failopts(args,{LONG:{force:1}});
		if (!opts) return;

//		let ret = get_options(args);
//		if (ret[1].length) return cberr("There are no options in this version");

		if (!args.length) return cberr("missing file operand");
		if (args.length > 2) return cberr("only supporting 1 or 2 args");

		let target = args.shift();
		if (!target.match(/^\x2f/)) return cberr("currently only supporting absolute path names as targets");

if (!opts.force){
target_node = await pathToNode(target);
if (!target_node) return cberr(`The target '${target}' does not exist`);
}
		
		let arr = target.split("/");
		while (arr.length && !arr[arr.length-1]) arr.pop();
		if (!arr.length) return exists("./");

		if (!args.length) {
			lnname = arr.pop();
			lnpath = (cur_dir + "/" + lnname).regpath();
			ptw(cur_dir, ret=>{
				par = ret;
				makeit();
			});
			return;
		}

		let namearg = args.shift();
		arr = namearg.split("/");
		if (!arr[arr.length-1]) arr.pop();
		lnname = arr.pop(); 
//		if (lnname.match(/\.__LINK__$/)){
		if (globals.LINK_RE.test(lnname)){
			cberr("Invalid extension!");
			return;
		}
		let parpath = arr.join("/").regpath();
		if (!parpath) parpath = cur_dir;
		ptw(parpath, parret=>{
			if (!(parret && parret.KIDS)) return cberr("failed to create symbolic link '"+namearg+"': No such file or directory");
			lnpath = normpath(parpath + "/" + lnname);
			par = parret;
			makeit();
		});
	},//»
'bytes':()=>{//«
	let opts = failopts(args,{l:{dangerous:1}});
	if (!opts) return;
	let byt = args.shift();
	if (!byt) return cberr("No 'byte' arg given!");
	let rpt = args.shift();
	if (!rpt) return cberr("No 'repeat' arg given!");
	byt = byt.pnni({MAX:255});
	if (!NUM(byt)) return cberr("Invalid 'byte' arg");
	rpt = rpt.pnni();
	if (!NUM(rpt)) return cberr("Invalid 'repeat' arg");
	if (!opts.dangerous && (rpt > MAX_BLOB_BYTES)) return cberr(`Requested bytes(${rpt}) > MAX_BLOB_BYTES(${MAX_BLOB_BYTES})`);
	woutobj(make_bytes(byt, rpt));
	cbok();
},//»
'zeros':()=>{//«
	let opts = failopts(args,{l:{dangerous:1}});
	if (!opts) return;
	let n = args.shift();
	if (!n) return cberr("No arg!");
	let num = n.pnni();
	if (!NUM(num)) return cberr("Invalid number value");
	if (!opts.dangerous && (num > MAX_BLOB_BYTES)) return cberr(`Requested bytes(${n}) > MAX_BLOB_BYTES(${MAX_BLOB_BYTES})`);
	woutobj(make_bytes(0, num));
	cbok();
},//»
'bytefill':async args=>{//«

const doit=async(rv)=>{
	const confargs=()=>{
		cberr("Conflicting args");
	};
	let ln = rv.length;
	if (NUM(byt)){
		if (bytarr||str) return confargs();
		if (off + rpt > ln) return cberr(`offset(${off}) + repeat(${rpt}) > file length(${ln})`);
		let arr = new Uint8Array(rpt);
		arr.fill(byt);
		rv.set(arr, off);
	}
	else if (bytarr){
		if (have_rpt||str) return confargs();
		if (off + bytarr.length > ln) return cberr(`offset(${off}) + byte array length(${bytarr.length}) > file length(${ln})`);
		rv.set(bytarr, off);
	}
	else if (str){
		if (have_rpt) return confargs();
		if (off + str.length > ln) return cberr(`offset(${off}) + string length(${str.length}) > file length(${ln})`);
		rv.set(await capi.toBytes(str), off);
	}
	else return cberr("Nothing to do!");
	woutobj(new Blob([rv],{type:APPOCT}));
	cbok();
};

	let opts = failopts(args, {
		LONG: {
			byte:3,
			repeat:3,
			offset:3,
			string:3,
			bytestring:3
		},
		SHORT: {
			b:3,
			r:3,
			o:3,
			s:3,
			y:3
		}
	});
	if (!opts) return;
	let off,byt,rpt,str,bytarr;
	let have_rpt=false;
	let _;
	_= opts.offset||opts.o;
	if (_){
		let n = _.pnni();
		if (!NUM(n)) return cberr("Invalid offset");
		off = n;
	}
	else off = 0;
	_ = opts.byte||opts.b;
	if (_){
		let n = _.pnni({MAX:255});
		if (!NUM(n)) return cberr("Invalid byte value");
		byt = n;
	}
	_ = opts.repeat||opts.r;
	if (_){
		let n = _.pnni();
		if (!NUM(n)) return cberr("Invalid repeat");
		rpt = n;
		have_rpt = true;
	}
	else rpt = 1;
	str=opts.string||opts.s;
	_ = opts.bytestring||opts.y;
	if (_){
		let arr = _.split(/ +/);
		bytarr=new Uint8Array(arr.length);
		for (let i=0; i < arr.length; i++){
			let n = arr[i].pnni({MAX:255});
			if (!NUM(n)) return cberr("Invalid byte string");
			bytarr[i]=n;
		}
	}
	let fname = args.shift();
	if (fname){
		let rv = await readFile(fname,{BINARY:true});
		if (!(rv instanceof Uint8Array)) return cberr(`${fname}:\x20 not found`);
		doit(rv);
	}
	else{
		let ret = [];
		read_stdin(async(rv)=>{
			if (iseof(rv)){
				if (isstr(ret[0])) doit(await capi.toBytes(ret.join("\n")));
				else if (ret.length == 0) doit(await capi.toBytes(ret[0]));
				else {
					cberr("Unknown value in stdin!!!");
cwarn("WUT IZZZ THISSSSS????");
log(ret);
				}
				return;
			}
			if (isstr(rv)) ret.push(rv);
			else if (isarr(rv)&&isstr(rv[0])) ret.push(...rv);
			else ret.push(rv);
		},{SENDEOF:true});
	}

},//»
'tempfscat':function(){//«
	if (globals.fs_let!="p") return cberr("Why you using this if you are already in tempfs? Just curious!");
	let fname = args.shift();
	if (!fname) return cberr("No file arg!");
	get_temp_fent(normpath(fname),(fent,err)=>{
		if (!fent) return cberr(err);
		fs.get_fs_file_from_fent(fent,bytes_ret=>{
			if (!bytes_ret) return cberr("Could not get the data");
			let str = Core.api.bytesToStr(bytes_ret);
			wout(str);
			cbok();
		},true);
	});
},//»
'fsreq':function(){//«
	const okint = val=>{//«
		if (typeof val == "number") return true;
		if (typeof val == "string") {
			return (val.match(/^0x[0-9a-fA-F]+$/)||val.match(/^0o[0-7]+$/)||val.match(/^[0-9]+$/));
		}
		return false;
	};//» 
	let num = args.shift();
	if (!num) return cberr("No request amount indicated");
	if (!okint(num)) return cberr("Invalid integer: " + num);
	navigator.webkitPersistentStorage.requestQuota(parseInt(num), 
		function(granted) {  
			cbok("Granted: " + granted);
		}, 
		function(e){ 
			cberr(e.message);
		}
	);
},//»
'fschk':function(){//«
	wout("Checking for persistent storage...");
	navigator.webkitPersistentStorage.queryUsageAndQuota( 
		function(used, granted) {  
			if (granted) return cbok('Persistent: using ' + used + ' of ' + granted + ' bytes');
			wout("None granted, checking for temporary storage...");
			navigator.webkitTemporaryStorage.queryUsageAndQuota( 
				function(used, granted) {  
					cbok('Temporary: using ' + used + ' of ' + granted + ' bytes');
				}, 
				function(e) { 
					cberr(e.message);
				}
			);
		}, 
		function(e) { 
			cberr(e.message);
		}
	);
},//»
'fsdef':function(){//«
	wout(check_fs());
	cbok();
},//»
'fslive':function(){//«
//	wout(globals.use_fs_type||globals.fs_type);
	wout(_FSPREF);
	cbok();
},//»
'fsusetmp':function(){//«
	if (check_fs()==="temporary") return cbok("Already using temporary storage");
	localStorage.FSTYPE = "temporary";
	cbok();
},//»
'fsuseper':function(){//«
	if (check_fs()==="persistent") return cbok("Already using persistent storage");
	navigator.webkitPersistentStorage.queryUsageAndQuota( 
		function(used, granted) {  
			if (!granted) return cberr("You must request quota with fsreq first!");
			localStorage.FSTYPE = "persistent";
			cbok();
		}, 
		function(e) { 
			cberr(e.message);
		}
	);
},//»
'zip':async function(){//«

/*
Need to strip away everything but the base dirname and then add the relative file paths to it.
Then, zip it up!!!
*/

let sws = failopts(args, {
	SHORT: {n:3},
	LONG: {name:3}
});

if (!sws) return;

let usename = args.name||args.n;

//if (args.length > 2) return cberr("Usage: zip: [filename.zip] folder_to_zip");
if (args.length!=1) return cberr("Currently only supporting zipping a single file or folder!");
var model = (function() {//«
	var zipFileEntry, zipWriter, writer, creationMethod;

	return {
		setCreationMethod : function(method) {
			creationMethod = method;
		},
//		addFiles : function addFiles(files, oninit, onadd, onprogress, onend) {
		addFiles : function addFiles(files, onprogress, onend) {
			var addIndex = 0;

			function nextFile() {
				var file = files[addIndex];
//				onadd(file);
				zipWriter.add(file.name, new zip.BlobReader(file), function() {
					addIndex++;
					if (addIndex < files.length)
						nextFile();
					else
						onend();
				}, onprogress);
			}

			function createZipWriter() {
				zip.createWriter(writer, function(writer) {
					zipWriter = writer;
//					oninit();
					nextFile();
				}, onerror);
			}

			if (zipWriter)
				nextFile();
			else if (creationMethod == "Blob") {
				writer = new zip.BlobWriter();
				createZipWriter();
			} else {
				createTempFile(function(fileEntry) {
					zipFileEntry = fileEntry;
					writer = new zip.FileWriter(zipFileEntry);
					createZipWriter();
				});
			}
		},
		getBlobURL : function(callback) {
			zipWriter.close(function(blob) {
				var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
				callback(blobURL);
				zipWriter = null;
			});
		},
		getBlob : function(callback) {
			zipWriter.close(callback);
		}
	};
})();//»
await Core.api.loadMod("util.zip.ZipJS");
await Core.api.loadMod("util.zip.ZipJSDeflate");
if (!globals.zip)new NS.mods["util.zip.ZipJS"](Core);
let zip = globals.zip;
if (!zip.Deflater)new NS.mods["util.zip.ZipJSDeflate"](Core);
let name = args.pop().replace(/\/$/,"");
let zipname = name+".zip";
let path = normpath(name);
let savepath = cur_dir+"/"+zipname;
werr("Using path: "+savepath);
if (await fsapi.pathToNode(savepath)) return cberr("Output file exists: "+savepath);
let files = [];
let doit=()=>{
	let writer = new zip.BlobWriter();
	let zipWriter;
	zip.createWriter(writer, ret2=>{
		zipWriter = ret2;
		let iter = -1;
		let dofile=()=>{
			iter++;
			if (iter==files.length) {
				zipWriter.close(blob=>{
					fs.savefile(savepath, blob, ret3=>{
						if (!ret3) return cberr("Could not save the file: "+savepath);
						else cbok();
						if (Desk) {
							Desk.make_icon_if_new(savepath);
						}
					}, {ROOT: is_root});
				})
				return;
			}
			let arr = files[iter];
			if (arr[1]===null) zipWriter.add(arr[0], null, dofile, ()=>{},{directory:true});
			else zipWriter.add(arr[0], new zip.BlobReader(arr[1]), dofile, _=>{});
		}
		dofile();
	});
};
ptw(path,ret=>{//«
	if (ret.KIDS) get_dir_files(ret, files, doit, wout, true, ret.path);
	else{
		let path = ret.fullpath;
		fs.get_fs_data(path, rv=>{
			if (!rv) {
cberr("Got no contents: "+path);
			}
			else {
				path = path.substring(ret.path.length+1);
				files.push([path, new Blob([rv], {type:"blob"})]);
				wout(path);
				doit();
			}
		});
	}
});//»
},//»
'unzip':async function(){//«

var sws = failopts(args, {
	SHORT: {b:3},
	LONG: {blob:3}
});
if (!sws) return;
let fname;
let blob;
let blobnum = sws.blob||sws.b;
if (blobnum){
if (args.length) return cberr("Arg given with 'blob' switch");
    let blobs = termobj.ENV.BLOB_DROPS;
    if (!blobs) return cberr("No blobs");
    let n = blobnum.pnni();
    if (!Number.isFinite(n)) return cberr("Bad num");
    blob = blobs[n];
    if (!(blob&&blob.blob)) return cberr("Nothing found");
    blob = blob.blob;
}
else { 
	fname = args.shift();
	if (!fname) return cberr("No zip file!");
}

const dounzip=(blob)=>{//«
	let model = (function() {//«
		return {
			getEntries : function(file, onend) {
				zip.createReader(new zip.BlobReader(file), function(zipReader) {
					zipReader.getEntries(onend);
				}, cberr);
			},  
			getEntryFile : function(entry, creationMethod, onend, onprogress) {
				var writer, zipFileEntry;
				function getData() {
					entry.getData(writer, function(blob) {
						var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.
						onend(blobURL);
					}, onprogress);
				} 
				if (creationMethod == "Blob") {
					writer = new zip.BlobWriter();
					getData();
				}
				else {
					createTempFile(function(fileEntry) {
						zipFileEntry = fileEntry;
						writer = new zip.FileWriter(zipFileEntry);
						getData();
					}); 
				}   
			}   
		};  
	})();//»
	model.getEntries(blob, ents=>{
		let iter = -1;
		async function doent(){//«
			iter++;
			if (iter==ents.length) return cbok();
			let ent = ents[iter];
			let parr = ent.filename.replace(/\/$/,"").split("/");
			if (!parr[0]) parr.shift();
			let fname = parr.pop();
			let path = parr.join("/");
			let fullpath
			if (path) fullpath = cur_dir+"/"+path;
			else fullpath = cur_dir;
			if (ent.directory) {
				if (await fsapi.pathToNode(fullpath+"/"+fname)){
cberr("Folder path exists: "+fullpath+"/"+fname);
return;
				}
				fs.mk_fs_dir(fullpath, fname, null, (ret, err)=>{
					if (!ret) return cberr(err)
					wout(ent.filename)
					refresh();
					doent();
				});
			}
			else {
				if (await fsapi.pathToNode(fullpath+"/"+fname)){
cberr("File path exists: "+fullpath+"/"+fname);
return;
				}
				ent.getData(new zip.BlobWriter(), blob=>{
					fs.savefile(fullpath+"/"+fname, blob, ret=>{
						if (!ret) return cberr("Could not save: " + ent.filename);
						wout(ent.filename)
						refresh();
						doent();
					}, {ROOT: is_root,MKDIR:true});
				})
			}
		}//»
		doent();
	});
};//»

await Core.api.loadMod("util.zip.ZipJS");
await Core.api.loadMod("util.zip.ZipJSInflate");
if (!globals.zip)new NS.mods["util.zip.ZipJS"](Core);
let zip = globals.zip;
if (!zip.Inflater)new NS.mods["util.zip.ZipJSInflate"](Core);
if (fname) {
	atbc(fname,ret=>{//«
		if (!(ret instanceof Uint8Array)) return cberr("File not found");
			dounzip(new Blob([ret.buffer]));

	});//»
}
else if (blob){
try{
dounzip(blob);
}
catch(e){
log(e);
cberr("Error");
}
}
else cberr("Nothing found");
},//»
	'cache':function() {//«
		var sws = failopts(args);
		if (!sws) return;

		var com = args.shift();
		if (!com) return cberr("Subcommand needed");

		if (com=="clear") {
			let which = args.shift();
			if (!which) return cberr("What do you need cleared?");
			if (which=="code") {
				fs.rm_fs_file("/code", ret=>{
					if (!ret) return cberr("Failed!");
					let syskids = fs.get_root().KIDS.code.KIDS;
					for (let k of getkeys(syskids)) {
						if (k=="."||k=="..") continue;
						delete syskids[k];
					}
					cbok();
				}, true, true);
			}
			else cberr(which+": Unknown argument to 'clear'");
		}
		else cberr(com+": Unknown subcommand");
	},//»
'vim':async function(){//«

let sws = failopts(args,//«
	{
		SHORT: {
			c:1,
			s:3,
			f:3,
			t:1,
			b:1//Read the given file to suck it into the buffer and save it as something else
		},
		LONG: {
			create:1,
			servhook:3,
			foldmethod:3,
			'convert-markers':1
		}
	});//»
if (!sws) return;
let fullpath = null;
let sysfullpath = null;
let rtype = null;
let temp_fent = null;
let stdin_func=null;
let fileobj;
let use_state;
let vimstore = await capi.getStore("vim");
if (!vimstore) console.warn("Could not get vimstore!");
let start=str=>{
	Core.load_mod("util.vim",async rv=>{
		if (!rv) return cberr("No util.vim module!");
		let vim = new NS.mods["util.vim"](Core, Shell);
		let useext;
		if (sws.b) {
			if (fullpath) useext = fullpath.split(".").pop();
			fullpath = null;
			rtype = null;
		}
		vim.init(str, fullpath, (errmess)=>{
			if (errmess) {
				werr(errmess);
				cberr();
			}
			else cbok();
		},{VIMSTORE:vimstore, FOBJ:fileobj, SYSPATH:sysfullpath, CONVMARKS: sws['convert-markers'],USEEXT: useext, TYPE:rtype,TEMPFENT:temp_fent,STDINFUNC: stdin_func, FOLDMETH: foldmeth});
		if (typeof rv === "string") Core.do_update('mods.util.vim', rv);
		vim.command_history = await capi.getHistory("vc");
		vim.search_history = await capi.getHistory("vs");
	});
};
let foldmeth = sws.foldmeth || sws.f;
let if_create = sws.create||sws.c;
let arg = args.shift();
if (args.length) return cberr("Extra arguments detected");
let begin=()=>{//«
	const dopath=()=>{//«
		fullpath = normpath(arg);
		let parts = fullpath.split("/");
		let fname = parts.pop();
		let parpath = parts.join("/");
		let rootobj, parobj;
		if (!fname) return cberr("Filename not given");
		ptw(fullpath, async fobj=>{
			const checkok=()=>{
				if (rtype=="local"){
					if (!sws.b) return cberr("Cannot edit local files in place. Use the 'b' flag to use the buffer of the file.");
					else return true;
				}
				else if (rtype!="fs") return cberr("Cannot edit file type: " + rootobj.TYPE);
				if (!fs.check_fs_dir_perm(parobj,is_root)) return cberr("Permission denied: "+arg);
				return true;
			};
			if (!fobj) {
				ptw(parpath, parret=>{
					parobj = parret;
					if (!parobj) return cberr("No such directory: " + parpath);
					rootobj = parret.root;
					rtype = rootobj.TYPE;
					start("");
				});
			}
			else {
				fileobj=fobj;
				if (fobj.fullpath) fullpath = fobj.fullpath;
				rootobj = fobj.root;
				rtype = rootobj.TYPE;
				parobj = fobj.par;
				if (!checkok())  return;
				let modtime = null;
				if (fobj.file) modtime = fobj.file.lastModified;
				sysfullpath = `${FSLET}/${FSBRANCH}${fullpath}`;
				fs.read_file(fullpath, async(rv)=>{
					if (isarr(rv)&&isstr(rv[0])) start(rv.join("\n"));
					else if (rv instanceof Blob){
						let bytes = await capi.toBytes(rv);
						let iter=0;
						for (let b of bytes){
							if (iter>=100) break;
							if ((b>=32&&b<=126)||b==10||b==9||b==13||b==171||b==187){} 
							else return cberr(fmt("This file has an unrecognized extension and uses non-ascii characters. To force text, use the 't' flag"));
							iter++;
						}
						start(await capi.toStr(rv));
					}
				}, {ROOT:is_root, FORCETEXT: !!sws.t});
			}
		});
	};//»
	let servhook = sws.servhook||sws.s;
	if (servhook) {
		ptw(`/serv/${servhook}`, fobj=>{
			if (!(fobj&&fobj.root.TYPE=="service"&&isobj(fobj._)&&isobj(fobj._.exports))) return cberr("Not a valid service: " + servhook);
			if (!(fobj._.exports.stdin instanceof Function)) return cberr("The service does not have a 'stdin' method!");
			stdin_func = fobj._.exports.stdin;
			if (!arg) start("");
			else dopath();
		});
	}
	else if (!arg) start("");
	else dopath();
}//»
begin();
/*
if (sws.tempsave||sws.t){//«
	if (globals.fs_let!="p") return cberr("You must be in a persistent filesystem to use the 'tempsave' feature");
	get_temp_fent(normpath(sws.tempsave||sws.t),(fent,err)=>{
		if (!fent) return cberr(err);
		temp_fent = fent;
		begin();
	});

}//»
else begin();
*/
},//»
	'less':async()=>{//«
		tmp_env.WRITE_PIPE_ARRAY = 1;
		let name;
		let didless = false;
		let addlines_cb = null;
		let Less, Pager;
        if (!(await capi.loadMod("util.pager"))) return cberr("Could not load the system pager!");
		Pager = NS.mods["util.pager"];
		let sws = failopts(args, {
			SHORT: {
				o: 1,
				t: 1,
				n: 1,
				b: 1
			},
			LONG: {
				objok: 1,
				"number-lines": 1,
				"force-text": 1,
				buffer: 1
			}
		});
		if (!sws) return;
		let num_files=0;
		let opts = {};
		let objok = sws.objok || sws.o;
		opts.OBJOK = objok;
		opts.FORCETEXT = sws["force-text"]||sws.t;
		if (objok) opts.SINGLINES = true;
		termobj.kill_register(killcb=>{
			cbok(EOF);
			killcb();
		});
		let isbuf = sws.buffer||sws.b;
		if (!args.length && get_reader().is_terminal && !isbuf) return cberr("Missing filename");
		if (isbuf) opts.NOTERMINAL = true;

		let totfiles = args.length;		
		let allfiles = 0;
		read_file_args_or_stdin(args, (ret, fname, errmess)=>{
			if (ret===EOF) return;
			if (errmess) {
				allfiles++;
				werr(errmess);
				refresh();
				if (allfiles==totfiles && !num_files) cberr();
				return;
			}
			else if (fname) {
				num_files++;
				allfiles++;
				if (num_files > 1) {
					if (addlines_cb) addlines_cb(null,"("+num_files+" files)");
				}
				return name = fname;
			}
			if (!name) name = "(stdin)";
			if (!ret && isbuf) ret = termobj.get_buffer();
			if (isobj(ret)) {
				if (!objok) return cwarn("less: DROPPING OBJECT");
				ret = [ret.toString()];
			}
			else if (isstr(ret)) ret = ret.split("\n");
			else if (isarr(ret)&&!isstr(ret[0])){
return cberr("Invalid input");
			}
			if (sws["number-lines"]||sws.n) ret = Core.api.numberLines(ret);
			if (Less) {
				if (addlines_cb) addlines_cb(ret);
				return;
			}
			Less = new Pager(Core, Shell);
			addlines_cb = Less.init(ret, name, ()=>{
				addlines_cb = null;
				cbok();
			});
		}, opts);
	},//»
	'gzip':function() {//«
		dogzip(args, null);
	},//»
	'gunzip':function() {//«
		dogzip(args, true);
	},//»
	'grep':function() {//«
		com_grep(args, null);
	},//»
	'match':function() {//«
		com_grep(args, true);
	},//»
	'tar':function() {//«
//		let cberr = cberr;
		function usetar(){cberr("Usage: tar (-c|-x) savepath directory_to_compress")}
		function useuntar(){cberr("This version only accepts a single archive, to be extracted into the current directory")}
		function nofile(){cberr(args[0]+": Cannot open: No such file or directory");}
		let opts = failopts(args,{SHORT:{'c':1,'x':1}});
		if (!opts) return;

		if (!(opts.c||opts.x)) return cberr("No operation given (want 'c' or 'x')");
		if (opts.c&&opts.x) return cberr("The operation must be either 'c' or 'x'");
		let is_create=opts.c;

		if (is_create) {//«
			if (!args.length) return cberr("Cowardly refusing to create an empty archive");
			if (args.length != 2) return usetar();
			let savepath = normpath(args[0]);
			let arr = savepath.split("/");
			let fname = arr.pop();
			let parpath = arr.join("/");
			if (!(fname&&parpath)) return nofile();
			ptw(parpath, parret=>{//«
				if (!parret) return nofile();
				let fullpath = normpath(args[1]);
				ptw(fullpath, ret=>{
					if (!ret||(ret.root.rootonly&&!is_root)) return cberr(args[1]+": no such file or directory");
					if (ret.APP!="Folder"&&ret.root.TYPE!="fs") return usetar();
					let dirobj = ret;
					fs.getmod("util.tar.Tar", tar=>{
						if (!tar) return cberr("Tar module not found");
						tar.init();
						let files = [];
						get_dir_files(dirobj, files, x=>{
							for (let arr of files) tar.add(arr[0], arr[1]);
							tar.get(ret=>{
								fs.savefile(savepath, ret.buffer, ret2=>{
									if (!ret2) return cberr("Could not save the file");
									fs.add_new_kid(parpath, fname);
									fs.mk_desk_icon(savepath);
									cbok();
								}, {ROOT: is_root});
							});
						}, wout, false, ret.path);
					});
				});
			});//»
		}//»
		else {//«
			if (args.length!=1) return useuntar("");
			let path = normpath(args[0]);
			ptw(cur_dir, parret=>{
				if (!parret) return cberr("WUT NO CWD WUT WUT???");
				if (parret.sys) return cberr("Cannot save in the system directory");
				ptw(path, ret=>{//«
					if (!ret) return nofile();
					if (ret.root.TYPE != "fs") return cberr("Only currently allowing local archives");
					fs.get_fs_data(path, ret2=>{
						if (!ret2) return cberr("Could not get the data");
						fs.getmod("util.tar.Untar", untar=>{
							if (!untar) return cberr("Untar module not found");
							var prom = untar.untar(ret2.buffer);
							prom.progress(file=>{})
							.then(files=>{
								function dosave() {//«
									let iter = -1;
									let num_weird_files = 0;
									let num_good_files = 0;
									let MAX_WEIRD_FILES = 3;
									function saveit() {//«
										iter++;
										if (iter == files.length) {
											cbok();
											return;
										}
										let file = files[iter];
										let name = file.name;
										let size = file.size;
										if (name.match(/\/$/)) saveit();
										else {
											if (file.uid.match(/^[0-9]+$/) && file.type==="0" && isnotnegint(size) && isnotnegint(file.modificationTime)) {
												num_good_files++;
											}
											else {
												if (!num_weird_files) {
													werr("Skipping abnormal looking file");
													refresh();
												}
												else if (!num_good_files) {
													if (num_weird_files > MAX_WEIRD_FILES) {
														cberr("Too many weird files, with no good ones. This is probably not a tar archive!");
														return;
													}
													werr("...and another!");
												}
												num_weird_files++;
												saveit();
												return;
											}
											let fullpath = normpath(cur_dir+"/"+name);
											refresh();
											fs.save_fs_by_path(fullpath, file.blob, (ret3, err)=>{
												if (!ret3) werr("Could not save: " + fullpath + " (" +size+")");
												else werr("Saved as: " + fullpath + " (" +size+")");
												saveit();
												refresh();
											}, {ROOT: is_root});
										}
									}//»
									saveit();
								}//»
								dosave();
							});
						});
					});
				});//»
			});
		}//»

	},//»
	'tee':function() {//«

//«
//Every file is going to be appended to during the read_stdin process.
//If the a flag is not set, the first write call is not append.
//Otherwise, all write calls are append.
//Let's have a buffer that stores all incoming lines, and then dequeus in 
//order to write.
//»

//		let cur_dir = cur_dir;
		let sws = failopts(args, {s:{"a": 1}});
		if (!sws) return;
		let iter = -1;
		let is_append = sws.a;
		let is_writing = false;
		let did_write = false;
		let do_append = true;
		let buffer=[];
		let fobjs = [];
		let got_all_fobjs = false;
		let got_eof = false;
		let killed = false;
		const handle_stdin = ret=>{//«
			if (iseof(ret)) {
				got_eof = true;
				if (got_all_fobjs) done();
				return;
			}
			else {
				if (isarr(ret)&&isstr(ret[0])) ret = ret.join("\n");
				if (isstr(ret)) {
					if (ret==="\n") wout(ret, {FORCELINE:1});
					else wout(ret+"\n");
				}
				else if (isarr(ret)) woutarr(ret);
				else if (isobj(ret)) woutobj(ret);
				else {
log("tee.doread(): WHAT KIND OF TYPE FROM read_stdin???");
log(ret);
					return;
				}
				if (!is_append && !did_write) do_append = false;
				if (!did_write && got_all_fobjs) {
					dowrite(ret, do_append, null, 2);
				}
				else {
					buffer.push(ret);
					dequeue();
				}
			}
			did_write = true;
		}//»
		read_stdin(handle_stdin,{SENDEOF:true});
		const done=()=>{
			for (let obj of fobjs) delete obj.wroteString;
			cbok();
		};
		const dowrite=(val, if_append, cb, which)=>{//«
//«
//For every one in fobjs, call 
//1) dev: its particular FileObj write.line or write.lines function
//2) fs: save_fs_by_path(path, val, cb, if_append)
//3) serv: _fent._.exports.stdin(_buffer.join("\n"), cb);
//
//When making a service, the "_" is the actual, new function
//object (like new SynthServer()), which has an exported 
//interface.
//
//_fent = {"NAME": name, "APP": "Service", "_": obj};
//»
			let iter = -1;
			let len = fobjs.length;
			const doit=()=>{//«
				iter++
				if (iter==len) {
					if (cb) cb();
					if (got_eof) return done();
					return;
				}
				let obj = fobjs[iter];
				let type;
				if (obj.isFile) {//«
					let valarr;
					if (isobj(val)) val = val.toString();
					if (isstr(val)) {
						if (obj.wroteString && val!=="\n") valarr = ["\n"+val];
						else valarr = [val];
						obj.wroteString = true;
					}
					else if (isarr(val)) valarr = val;
					else {
log("tee.doit(): WHAT KIND OF VAL IM YIM???");
log(val);
						doit();
						return;
					}
					fs.write_fs_file(obj, new Blob(valarr, {type:"blob"}), doit, if_append);
				}//»
				else if (obj instanceof Function){
					obj(val);
					doit();
				}
				else if (obj.root.TYPE=="device") fs.write_to_device(objpath(obj), val, doit, termobj, {getvar: get_var_str});
				else {//«
log("tee.doit(): GOT SOME OTHER TYPE! " + obj.root.TYPE);
log(val);
					doit();
				}//»
			};//»
			doit();
		};//»
		const dequeue=()=>{//«
			if (!got_all_fobjs) return;
			if (!buffer.length || is_writing) return;
			is_writing = true;
			dowrite(buffer.shift(), true, _=>{
				is_writing = false;
				dequeue();
			}, 1);
		};//»
		const err=(str)=>{//«
			werr("tee: "+str);
		};//»
		const getfobj=()=>{//«
			iter++;
			if (iter==args.length) {
//				doread();
				got_all_fobjs = true;
				dequeue();
				return;
			}
			let path = normpath(args[iter]);
			let arr = path.split("/");
			let fname = arr.pop();
			let parpath = arr.join("/");
			if (!(fname&&parpath)) {
				err(path+": invalid path");
				getfobj();
				return;
			}
			ptw(parpath, ret=>{//«
				if (!ret){
					err(path+": cannot create the file");
					getfobj();
					return;
				}
				if (ret.APP!="Folder"){
					err(path+": PARPATH NOTAFOLDER?!?!?");
					getfobj();
					return;
				}
				let type = ret.root.TYPE;
				if (type!=="fs"){
					if (type=="device"){
						let arr=path.split("/");
						arr.shift();
						arr.shift();
						let rel=arr.join("/");
						if (rel=="console"){
							fobjs.push(arg=>{
								console.log(arg);
							});
						}
						else if (rel=="stdout"){
							fobjs.push(arg=>{
								wout(arg);
							});
						}
						else if (rel=="stderr"){
							fobjs.push(arg=>{
								werr(arg);
							});
						}
						else{
							err(`: not (yet) supporting device path = ${rel}`);
						}
						getfobj();
						return;
					}
					err(path+": not (yet) supporting writing to file type !='fs' (got '"+type+"')");
					getfobj();
					return;
				}
				if (!fs.check_fs_dir_perm(ret,is_root)) {
					err(path+": permission denied");
					getfobj();
					return;
				}
				let kid = ret.KIDS[fname];
				if (kid) {//«
					if (kid.root.TYPE=="fs") {
						if (kid.FENT) {
							fobjs.push(kid.FENT);
							getfobj();
						}
						else {
							fs.get_fs_ent_by_path(path, ret2=>{
								if (!ret2) err(path+": could not get the HTML5 file entry");
								else {
									kid.FENT = ret2;
									fobjs.push(ret2);
								}
								getfobj();
							},null,null,is_root);
						}
					}
					else {
						fobjs.push(kid);
						getfobj();
					}
				}//»
				else {//«
					fs.touch_fs_file(path, ret2=>{
						if (ret2) fobjs.push(ret2);
						else err(path+": could not create the file");
						getfobj();
					},null, is_root);
				}//»
			});//»
		}//»
		getfobj();
	},//»
	'touch':function() {//«
		var ret = get_options(args);
		if (ret[1].length) return cberr("There are no options in this version");
		if (!args.length) {
			cberr("missing file operand");
			return;
		}
		const err=(str)=>{
			werr("touch: "+str);
		};
		const dotouch=()=>{//«
			if (!args.length) {
				cbok();
				Desk&&Desk.update_folder_statuses();
				return;
			}
			let fullpath = normpath(args.shift());
			let arr = path_to_par_and_name(fullpath);
			let parpath = arr[0];
			let fname = arr[1];
			ptw(fullpath, obj=>{//«
				if (obj) {
log("UPDATE TIMESTAMP OF:");
log(obj);
					dotouch();
				}
				else {//«
					ptw(parpath, parobj=>{
						if (!parobj) {
							err("cannot touch '"+fullpath+"': No such file or directory");
							dotouch();
							return;
						}
						if (parobj.root.TYPE != "fs") return dotouch();
						if (!fs.check_fs_dir_perm(parobj,is_root)) {
							err(fullpath+": permission denied");
							dotouch();
							return;
						}
						fs.touch_fs_file(fullpath, ret=>{
							if (!ret) return cberr("Could not create the file");
//log(ret);
//							if (Core.Desk) Core.Desk.make_icon_if_new(fullpath);
							if (Core.Desk) Core.Desk.make_icon_if_new(ret);
							dotouch();
						},null, is_root)
					});
				}//»
			});//»
		};//»
		dotouch();
	},//»

}//»

if (!comarg) return Object.keys(COMS);

//Imports«
const NS = window[__OS_NS__];
const NUM = Number.isFinite;
const MAX_BLOB_BYTES = 5*1024*1024;

let _;

const{log,cwarn,cerr,sys_url}= Core;
const capi=Core.api;
let getkeys = capi.getKeys;

let globals = Core.globals;
const SYSACRONYM = globals.name.ACRONYM;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let isstr = _.isstr;
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let make = _.make;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let iseof = function(arg) {return (isobj(arg)&&arg.EOF);}
let isnotnegint = function(arg){return _.isint(arg, true);}

//const FSLET = globals.fs_let;
//const FSBRANCH = globals.fs_branch;
const {fs,FSPREF,FSLET,FSBRANCH}=globals;
const fsapi = NS.api.fs;
const {pathToNode} = fsapi;
//let fs = globals.fs;
let objpath = fs.objpath;
let mv_desk_icon = fs.mv_desk_icon;
let get_fullpath = function(path, cur_dir, if_no_deref, if_getlink) {
	return fs.get_fullpath(path, if_no_deref, cur_dir, if_getlink);
}
let get_distinct_file_key = function(arg) {return fs.get_distinct_file_key(arg);}

const APPOCT="application/octet-stream";

const{//«
cbeof,
sherr,
get_path_of_object,
get_options,
termobj,
cur_com_name,
readFile,
read_file_args_or_stdin,
read_file,
read_stdin,
cur_dir,
constant_vars,
path_to_par_and_name,
is_writable,
path_to_obj,
if_com_sub,
check_pipe_writer,
tmp_env,
fmt,
kill_register,
arg2con,
atbc,
get_reader,
sys_write,
cb,
normpath,
cbok,
cberr,
serr,
failopts,
failnoopts,
werr,
werrarr,
wout,
woutarr,
woutobj,
wclout,
wappout,
refresh,
respbr,
wclerr,
suse,
get_var_str,
ptw,
term_prompt,
do_red,
Desk,
is_root,
ENODESK,
EOF,
ENV,
PIPES,
pipe_arr
}=Shell;//»

//»
//Var«
const _FSPREF = FSPREF;
//»

//Funcs«

const check_fs=()=>{//«
    let which = localStorage.FSTYPE;
    if (which == "temporary"||which=="persistent"){}
    else {
        which = "temporary";
        localStorage.FSTYPE = which;
    }
    return which;
};//»

const get_dir_files=(dir, filesret, cbarg, wout, if_blob, basepath)=>{//«
	const getkids=(_cb)=>{//«
		let kids = dir.KIDS;
		let keys = getkeys(kids);
		let iter = -1;
		const dokid=()=>{//«
			iter++;
			if (iter==keys.length) return _cb();
			let k = keys[iter];
			if (k=="."||k=="..") return dokid();
			let kid = kids[k];
			let app = kid.APP||"File";
			let path = objpath(kid);
			if (kid.APP=="Folder") {
				path = path.substring(basepath.length+1);
				filesret.push([path,null]);
				if (wout) wout(path+"/");
				get_dir_files(kid, filesret, dokid, wout, if_blob, basepath);
			}
			else if (app=="Link"||app=="FIFO") dokid();
			else {
				fs.get_fs_data(path, ret=>{
					if (!ret) {
cwarn("tar/zip: got nothing: " + path + " (skipping)");
					}
					else {
						path = path.substring(basepath.length+1);
//log("PATH",path);
						if (if_blob) filesret.push([path, new Blob([ret], {type:"blob"})]);
						else filesret.push([path, ret]);
						if (wout) wout(path);
					}
					dokid();
				});
			}
		};//»
		dokid();
	};//»
	if (!dir.done) {
		fs.populate_fs_dirobj(objpath(dir), ()=>{
			dir.done = true;
			getkids(cbarg);
		}, dir);
	}
	else getkids(cbarg);
};//»

const path_parts=(arg)=>{//«
    var arr = arg.split("/");
    if (!arr[arr.length-1]) arr.pop();
    var name = arr.pop();
    return [arr.join("/"),name];
};//»
const com_grep=(args, is_matching)=>{//«
	let is_done = false;
	let ret = failnoopts(args);
	if (!ret) return;
	let opts = ret[0];
	let patstr = args.shift();
	if (!patstr) {
		cberr("a pattern is required");
		return;
	}

	let re;
	try {
		re = new RegExp(patstr);
	}
	catch(e) {
		cberr("Invalid pattern: " + patstr);
		return;
	}
	let cur_fname = null;

//Need a kill cb from read_file_args_or_stdin, in case we have a set
//number of lines that we are supposed to spit out.

	let marr;
	let gotret = false;
	read_file_args_or_stdin(args, (ret, fname, errmess)=>{
		if (iseof(ret)) {
			if (!gotret) wout("");
			return cbok(EOF);
		}
		if (errmess) {
			werr(errmess);
			refresh();
		}
		else if (fname) cur_fname = fname;
		else if (isstr(ret)) {
			if (marr=re.exec(ret)) {
				gotret = true;
				if (is_matching) wout(marr[0]);
				else wout(ret);
				refresh();
			}
		}
		else if (isarr(ret)) {
			let outarr = [];
			for (let ln of ret) {
				if (marr=re.exec(ln)) {
					gotret = true;
					if (is_matching) outarr.push(marr[0]);
					else outarr.push(ln);
				}
			}

			woutarr(outarr);
			refresh();
		}
		else {
cerr('grep: WHAT THE HELL GOT NO SCHNURR WUUTTTTT');
		}
	}, {SENDEOF:true});
}//»
const get_temp_fent=(patharg,cb)=>{//«
	window.webkitRequestFileSystem(TEMPORARY, (5*1024*1024), fsret=>{
		let arr = patharg.split("/");
		let fname = arr.pop();
		let parpath = arr.join("/");
		fsret.root.getDirectory(parpath,{},dirret=>{
			dirret.getFile(fname,{},cb,_=>{
					cb(null,"temporary:"+patharg+": not found");
				});
			},_=>{
				cb(null,"temporary:"+parpath+": not found");
			}
		);
	}, _=>{
		cb(null,"Could not get the tempfs");
	});

};//»
const dogzip=(args, if_gunzip)=>{//«
	let sws = failopts(args, {SHORT: {x:3}, LONG: {ext: 3, stdout:1}});
	if (!sws) return;
	let ext = null;
	let func;
	let verb;
	if (if_gunzip) {
		ext = sws.ext || sws.x;
		verb = "inflate";
	}
	else {
		verb = "deflate";
	}
	if (ext&&!isid(ext)) return cberr("Bad extension: " + ext);
	var fname = args.shift();
	if (!fname) return cberr("No arg!");
	atbc(fname, async(ret, fullpath)=>{
		if (!ret) return cberr("Not a file: " + fname);
		let ret2;
		if (if_gunzip) ret2 = await capi.decompress(ret,{toBlob:true});
		else ret2 = await capi.compress(ret);
		if (!ret2) return cberr("Could not "+verb+": " + fname);
		if (sws.stdout) {
			woutobj(ret2);
			cbok();
			return;
		}
		var arr = path_parts(fullpath);
		var parpath = arr[0];
		var name = arr[1];
		fs.path_to_obj(parpath, parret=>{
			if (!parret) return cberr("?????!!!!");
			var kids = parret.KIDS;
			var newname = name;
			if (if_gunzip) {
				if (fname.match(/\.gz$/i)) newname = newname.replace(/\.gz$/i,"");
				if (ext) newname+="."+ext;
			}
			else newname = name+".gz";
			if (kids[newname]) return cberr("Cannot save the file as: " + newname);
			var newpath = parpath + "/" + newname;
			fs.savefile(newpath, ret2, ret3=>{
				if (!ret3) return cberr("Could not save the file");
				if (Desk) Desk.save_hook(newpath);
				cbok();
			}, {ROOT: is_root});
		});
	});
};//»

const make_bytes=(byt,num)=>{let arr=new Uint8Array(num);arr.fill(byt);return new Blob([arr],{type:APPOCT});};

//»


COMS[comarg](args);

}




/*
'midiup':async()=>{if(!await fs.init_midi())return cberr("Could not init midi");cbok("MIDI is up!");},
	'ioctl':function() {//«
		var sws = failopts(args);
		if (!sws) return;
		var name = args.shift();
		if (!name) return cberr("No device given");
		var path = normpath(name);
		var dev;
		var marr;
		if (path.match(/^\/dev\//)) dev = fs.get_device(path);
		else if (marr = path.match(/^\/serv\/(\d+)$/)) {
			let obj =  fs.get_root().KIDS.serv.KIDS[marr[1]];
			if (obj) dev = obj._;
		}
		if (!dev) return cberr(name+": Not a device or service");

		if (!dev.ioctl) return cberr(name+": No ioctl interface");

		var op = args.shift();
		if (!op) return cberr("No operation given");
		dev.ioctl(op, args.shift(), function(ret, err) {
			if (!ret) cberr(err);
			else if (isstr(ret)) cbok(ret);
			else cbok();
		});
	},//»
	'mkfifo':function() {//«
		var ret = get_options(args);
		if (ret[1].length) return cberr("There are no options in this version");
		if (!args.length) {
			serr("missing operand");
			return;
		}
		var iter = -1;
		function dofifo() {//«
			iter++;
			if (iter==args.length) return cbok();
			let fullpath = normpath(args[iter]);
			let arr = fullpath.split("/");
			let fname = arr.pop();
			let parpath = arr.join("/");
			ptw(parpath, ret=>{//«
				if (!(ret&&ret.KIDS)) {
					werr("cannot create fifo '"+args[iter]+"': No such file or directory");
					dofifo();
					return;
				}
				if (ret.root.TYPE!="fs") {
					werr("cannot create fifo '"+args[iter]+"' on a special filesystem");
					dofifo();
					return;
				}
				let kids = ret.KIDS;
				if (kids[fname]) {
					werr("cannot create fifo '"+args[iter]+"': File exists");
					dofifo();
					return;
				}
				fs.mk_desk_icon(fullpath, {FIFO: 1});
				kids[fname] = {NAME: fname, APP: "FIFO", par: ret, root: ret.root, BUFFER:[]};
//				localStorage[FSLET+"FI_"+fullpath] = "1";
				localStorage[_FSPREF+"FI_"+fullpath] = "1";
				dofifo();
			});//»
		}//»
		dofifo();
	},//»
	'ln':function(){//«
«
Save symbolic links in lst as:
LN_/path/to/link:"some string of text"

One arg = use the filename as the link name, and put it in cur_dir
The "string of text"

SYNOPSIS
   ln [OPTION]... [-T] TARGET LINK_NAME   (1st form)
   ln [OPTION]... TARGET                  (2nd form)
   ln [OPTION]... TARGET... DIRECTORY     (3rd form)
   ln [OPTION]... -t DIRECTORY TARGET...  (4th form)

DESCRIPTION
   In  the 1st form, create a link to TARGET with the name LINK_NAME.  In the
   2nd form, create a link to TARGET in the current directory.   In  the  3rd
   and  4th  forms,  create  links  to each TARGET in DIRECTORY.  Create hard
   links by default, symbolic links with --symbolic.  By default, each desti-
   nation  (name  of  new link) should not already exist.  When creating hard
   links, each TARGET must exist.  Symbolic links can hold arbitrary text; if
   later  resolved,  a relative link is interpreted in relation to its parent
   directory.

»
		const exists=(name)=>{
			cberr("failed to create symbolic link '"+name+"': File exists");
		};
		let par;
		let lnname;
		let lnpath;

		const makeit=()=>{//«
			let kids = par.KIDS;
			if (kids[lnname]) return exists(fs.get_path_of_obj(par)+"/"+lnname);
			fs.mk_desk_icon(lnpath, {LINK:target});
			kids[lnname] = {NAME: lnname, APP: "Link", LINK: target, par: par, root: par.root};
			localStorage[_FSPREF+"LN_"+lnpath] = target;
			cbok(lnpath + " -> " + target);
		};//»
		let ret = get_options(args);
		if (ret[1].length) return cberr("There are no options in this version");

		if (!args.length) return cberr("missing file operand");
		if (args.length > 2) return cberr("only supporting 1 or 2 args");

		let target = args.shift();
		if (!target.match(/^\//)) return cberr("currently only supporting absolute path names as targets");
		
		let arr = target.split("/");
		while (arr.length && !arr[arr.length-1]) arr.pop();
		if (!arr.length) return exists("./");

		if (!args.length) {
			lnname = arr.pop();
			lnpath = (cur_dir + "/" + lnname).regpath();
			ptw(cur_dir, ret=>{
				par = ret;
				makeit();
			});
			return;
		}

		let namearg = args.shift();
		arr = namearg.split("/");
		if (!arr[arr.length-1]) arr.pop();
		lnname = arr.pop(); 
		let parpath = arr.join("/").regpath();
		if (!parpath) parpath = cur_dir;
		ptw(parpath, parret=>{
			if (!(parret && parret.KIDS)) return cberr("failed to create symbolic link '"+namearg+"': No such file or directory");
			lnpath = normpath(parpath + "/" + lnname);
			par = parret;
			makeit();
		});
	},//»
	'man':function() {//«
		var sws = failopts(args,{SHORT:{d:1, w:3, p:3}, LONG: {dump:1, width:3, "text-path":3}});
		if (!sws) return;
		let widstr = sws.width || sws.w;
		let usew;

		if (widstr){
			let num = util.strnum(widstr);
			if (!(Number.isInteger(num)&&num>25&&num<128)) return cberr("Invalid width");
			usew = num;
		}
		let usepath = sws["text-path"] || sws.p;

		let opts = {
			DUMP: sws.d,
			USEW: usew
		};
		let which = args.shift();
		let path;
		let base;
		if (!which) {
			if (!usepath) return cberr("No arg!");
		}
		if (which !== "write") return cberr("Use dummy argument 'write' to see an example of man page formatting");
		if (usepath) path = usepath;
		else {
			if (!isid(which)) return cberr("Invalid name");
			base = "/man/"+which+".roff";
			path = '/usr/share'+base;
		}
		const doman=(arg)=>{//«
			const doit=(ret)=>{//«
				if (!ret) {
					cberr("Could not gunzip the page???");
					return;
				}
				Core.load_mod("util.pager",rv=>{
					if (!rv) return cberr("No sys.pager module!");
//					let man = new NS.mods["sys.pager"](Core, termobj);
					let man = new NS.mods["util.pager"](Core, Shell);
					man.init(ret.split("\n"), "Manual page " + which+"(X)", ret2=>{
						if (!opts.DUMP) cbok();
						else {
							if (!ret2) cberr("Nothing returned");
							else {
								let out = [];
								for (let ln of ret2) out.push(ln.join(""));
								cbok(out.join("\n"));
							}
						}
					}, "man", opts);
				});
			};//»
			if (arg instanceof Uint8Array) doit(Core.api.bytesToStr(arg));
			else {
const blob_as_text=(blob, cb)=>{
let reader = new FileReader();reader.onloadend = ()=>{cb(reader.result);};
reader.onerror = function(){cb();};reader.readAsText(blob);
};
				blob_as_text(arg, doit);
			}
		};//»
		arg2con(path, ret=>{//«
			if (!ret) {
				if (usepath) return cberr("Could not find the file");
				Core.xget('/root'+path, ret2=>{
					let blob;
					if (ret2 instanceof Blob) blob = ret2;
					else if (ret2 instanceof ArrayBuffer) blob = new Blob([ret2], {type:"text/plain"});
					else return cberr("What format was returned?");
					fs.save_fs_by_path(path, blob, ret3=>{
						if (!ret3) cerr("man: save_fs_by_path(): " + path + "???????");
						doman(blob);
					}, {ROOT: is_root});
				}, null, false);
			}
			else doman(ret);
		}, true);//»
	},//»
*/

