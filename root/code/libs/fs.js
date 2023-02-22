

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
const makeit=async()=>{//«
	let kids = par.KIDS;
//	let ln_ext = globals.LINK_EXT;
//	if (kids[`${lnname}.${ln_ext}`]) return exists(par.fullpath+"/"+lnname);
	if (kids[`${lnname}`]) return exists(par.fullpath+"/"+lnname);
//    let rv = await fsapi.saveFsByPath(`${lnpath}.${ln_ext}`, target, {ROOT: is_root, OK_LNK: true});
    let rv = await fsapi.saveFsByPath(`${lnpath}`, target, {ROOT: is_root, isLink: true});
	if (!rv) return cberr("The link could not be created");
	rv.ref = target_node;
//	fs.mk_desk_icon(lnpath, {LINK:target, node: rv});
	cbok(lnpath + " -> " + target);
};//»
let opts = failopts(args,{LONG:{force:1}});
if (!opts) return;

//let ret = get_options(args);
//if (ret[1].length) return cberr("There are no options in this version");

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
	par = await pathToNode(cur_dir);
	return;
}

let namearg = args.shift();
arr = namearg.split("/");
if (!arr[arr.length-1]) arr.pop();
lnname = arr.pop(); 
if (globals.LINK_RE.test(lnname)){
	cberr(`'${lnname}': invalid extension`);
	return;
}
let parpath = arr.join("/").regpath();
if (!parpath) parpath = cur_dir;
let parret = await pathToNode(parpath);
if (!(parret && parret.KIDS)) {
	return cberr(`failed to create symbolic link "${lnname}": ${parpath}: no such directory`);
}
lnpath = normpath(parpath + "/" + lnname);
par = parret;
makeit();

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

const doit=async(rv)=>{//«
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
};//»

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
	return;
}
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

},//»
/*
'tempfscat':function(){//«
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
	if (globals.fs_let!="p") return cberr("Why you using this if you are already in tempfs? Just curious!");
	let fname = args.shift();
	if (!fname) return cberr("No file arg!");
	get_temp_fent(normpath(fname),(fent,err)=>{
		if (!fent) return cberr(err);
		fs.get_fs_file_from_fent(fent,bytes_ret=>{ // THIS IS IN A BLOCK COMMENT!!!
			if (!bytes_ret) return cberr("Could not get the data");
			let str = Core.api.bytesToStr(bytes_ret);
			wout(str);
			cbok();
		},true);
	});
},//»
*/
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
		addFiles : function addFiles(files, onprogress, onend) {
			var addIndex = 0;

			function nextFile() {
				var file = files[addIndex];
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
if (await pathToNode(savepath)) return cberr("Output file exists: "+savepath);

let files = [];
let doit=()=>{//«
	let writer = new zip.BlobWriter();
	let zipWriter;
	zip.createWriter(writer, ret2=>{
		zipWriter = ret2;
		let iter = -1;
		let dofile=()=>{
			iter++;
			if (iter==files.length) {
				zipWriter.close(async blob=>{
					let ret3 = await fsapi.saveFsByPath(savepath, blob, {ROOT: is_root});
					if (!ret3) return cberr("Could not save the file: "+savepath);
					else cbok();
					if (Desk) Desk.make_icon_if_new(savepath);
				})
				return;
			}
			let arr = files[iter];
			if (arr[1]===null) zipWriter.add(arr[0], null, dofile, ()=>{},{directory:true});
			else zipWriter.add(arr[0], new zip.BlobReader(arr[1]), dofile, _=>{});
		}
		dofile();
	});
};//»

let ret = await pathToNode(path);
if (!ret) return cberr(`${path}: not found`);
if (ret.KIDS) return get_dir_files(ret, files, doit, wout, true, ret.path);
let fullpath = ret.fullpath;
let rv = await fsapi.readFile(fullpath, {BINARY: true});
if (!rv) return cberr("Got no contents: "+fullpath);
fullpath = fullpath.substring(ret.path.length+1);
files.push([fullpath, new Blob([rv], {type:"blob"})]);
wout(fullpath);
doit();

},//»
'unzip':async function(){//«

let sws = failopts(args, {
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
				let dirpath = `${fullpath}/${fname}`;
				if (await pathToNode(dirpath)) return cberr("Folder path exists: "+fullpath+"/"+fname);
//SBGJTKILV
if (!await pathToNode(fullpath)){
	if (!await fsapi.checkDirPerm(cur_dir,{root: is_root})) return cberr(`${cur_dir}: permission denied`);
	if (!await fsapi.touchDir(fullpath)) return cberr(`${fullpath}: could not make the directory`);
}
				let ret = await fsapi.mkFsDir(fullpath, fname, is_root);
				if (!ret) return cberr(`${fullpath}/${fname}: could not make the directory`)
				wout(ent.filename)
				refresh();
				doent();
			}
			else {
				if (await pathToNode(fullpath+"/"+fname)){
cberr("File path exists: "+fullpath+"/"+fname);
return;
				}
				ent.getData(new zip.BlobWriter(), async blob=>{
					let ret = await fsapi.saveFsByPath(fullpath+"/"+fname, blob, {ROOT: is_root, MKDIR: true});
					if (!ret) return cberr("Could not save: " + ent.filename);
					wout(ent.filename)
					refresh();
					doent();
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
'vim':async function(){//«


const checkok=()=>{//«
	if (rtype=="local"){
		if (!sws.b) return cberr("Cannot edit local files in place. Use the 'b' flag to use the buffer of the file.");
		else return true;
	}
	else if (rtype!="fs") return cberr("Cannot edit file type: " + rootobj.TYPE);
	if (!fs.check_fs_dir_perm(parobj,is_root)) return cberr("Permission denied: "+arg);
	return true;
};//»
let start=async str=>{//«
	gotdev = sws['use-dev-module'];
	if (gotdev){
		let path = normpath(gotdev);
		let node = await pathToNode(path);
		if (!node) return cberr(`${path}: File not found`);
		if (!node.root.TYPE=="fs") return cberr(`${path}: Not in the local file system`);
		usemod = Core.fs_url(node.fullpath);
	}
	else usemod = "sys.vim";
	Core.load_mod(usemod,async rv=>{
		if (!rv) return cberr("No sys.vim module!");
		if (gotdev) usemod = "local.vim";
		let vim = new NS.mods[usemod](Core, Shell);
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
		}, {
			VIMSTORE: vimstore,
			FOBJ: fileobj,
			SYSPATH: sysfullpath,
			CONVMARKS: sws['convert-markers'],
			USEEXT: useext,
			TYPE: rtype,
			STDINFUNC: stdin_func,
			FOLDMETH: foldmeth
		});
		vim.command_history = await capi.getHistory("vc");
		vim.search_history = await capi.getHistory("vs");
	});
};//»

let sws = failopts(args,//«
	{
		SHORT: {
			c:1,
			f:3,
			t:1,
			b:1//Read the given file to suck it into the buffer and save it as something else
		},
		LONG: {
			'use-dev-module': 3,
			create:1,
			foldmethod:3,
			'convert-markers':1
		}
	});//»
if (!sws) return;
let fullpath = null;
let sysfullpath = null;
let rtype = null;
let stdin_func=null;
let fileobj;
let use_state;
let vimstore = await capi.getStore("vim");
if (!vimstore) console.warn("Could not get vimstore!");
let gotdev;
let usemod;
let foldmeth = sws.foldmeth || sws.f;
let if_create = sws.create||sws.c;
let arg = args.shift();
if (args.length) return cberr("Extra arguments detected");
if (!arg) return start("");

fullpath = normpath(arg);
let parts = fullpath.split("/");
let fname = parts.pop();
let parpath = parts.join("/");
let rootobj, parobj;
if (!fname) return cberr("Filename not given");
let fobj = await pathToNode(fullpath);
if (!fobj) {
	let parobj = await pathToNode(parpath);
	if (!parobj) return cberr("No such directory: " + parpath);
	rootobj = parobj.root;
	rtype = rootobj.TYPE;
	start("");
	return;
}
if (fobj.write_locked){
cberr('the file is "write locked"');
return;
}
fileobj=fobj;

if (fobj.fullpath) fullpath = fobj.fullpath;
rootobj = fobj.root;
rtype = rootobj.TYPE;
parobj = fobj.par;
if (!checkok())  return;
let modtime = null;
if (fobj.file) modtime = fobj.file.lastModified;
sysfullpath = `${FSLET}/${FSBRANCH}${fullpath}`;
let rv = await fsapi.readFile(fullpath, {ROOT:is_root, FORCETEXT: !!sws.t});
if (isarr(rv)&&isstr(rv[0])) return start(rv.join("\n"));
else if (!(rv instanceof Blob)) return cberr(`${fullpath}: no blob returned!`);
let bytes = await capi.toBytes(rv);
let iter=0;
for (let b of bytes){
	if (iter>=100) break;
	if ((b>=32&&b<=126)||b==10||b==9||b==13||b==171||b==187){} 
	else return cberr(fmt("This file has an unrecognized extension and uses non-ascii characters. To force text, use the 't' flag"));
	iter++;
}
start(await capi.toStr(rv));

},//»

'less':async()=>{//«

tmp_env.WRITE_PIPE_ARRAY = 1;
let name;
let didless = false;
let addlines_cb = null;
let Less, Pager;
if (!(await capi.loadMod("sys.pager"))) return cberr("Could not load the system pager!");
Pager = NS.mods["sys.pager"];
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

	'tar':async function() {//«
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
			let parret = await pathToNode(parpath);
			if (!parret) return nofile();
			let fullpath = normpath(args[1]);
			let ret = await pathToNode(fullpath);
			if (!ret||(ret.root.rootonly&&!is_root)) return cberr(args[1]+": no such file or directory");
			if (ret.APP!=globals.FOLDER_APP&&ret.root.TYPE!="fs") return usetar();
			let dirobj = ret;
			let tar = await fsapi.getMod("util.tar.Tar");
			if (!tar) return cberr("Tar module not found");
			tar.init();
			let files = [];
			get_dir_files(dirobj, files, x=>{
				for (let arr of files) {
					if (!arr[1]) continue;
					tar.add(arr[0], arr[1]);
				}
				tar.get(async ret=>{
					let ret2 = await fsapi.saveFsByPath(savepath, ret.buffer, {ROOT: is_root});
					if (!ret2) return cberr("Could not save the file");
					cbok();
				});
			}, wout, false, ret.path);
			return;
		}//»
		if (args.length!=1) return useuntar("");
		let path = normpath(args[0]);
		let parret = await pathToNode(cur_dir);
		if (!parret) return cberr("WUT NO CWD WUT WUT???");
		if (parret.sys) return cberr("Cannot save in the system directory");
		let ret = await pathToNode(path);
		if (!ret) return nofile();
		if (ret.root.TYPE != "fs") return cberr("Only currently allowing local archives");
		let ret2 = await fsapi.readFile(path,{BINARY: true});
		if (!ret2) return cberr("Could not get the data");
		let untar = await fsapi.getMod("util.tar.Untar");
		if (!untar) return cberr("Untar module not found");

		let files = await untar.untar(ret2.buffer).progress(file=>{});
		let iter = -1;
		let num_weird_files = 0;
		let num_good_files = 0;
		let MAX_WEIRD_FILES = 3;
		const saveit=async()=>{//«
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
				let ret3 = await fsapi.saveFsByPath(fullpath, file.blob, {ROOT: is_root});
				if (!ret3) werr("Could not save: " + fullpath + " (" +size+")");
				else werr("Saved as: " + fullpath + " (" +size+")");
				saveit();
				refresh();
			}
		}//»
		saveit();

	},//»

'tee':function() {//«

//«
//Every file is going to be appended to during the read_stdin process.
//If the a flag is not set, the first write call is not append.
//Otherwise, all write calls are append.
//Let's have a buffer that stores all incoming lines, and then dequeus in 
//order to write.
//»

//let cur_dir = cur_dir;
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
			else wout(ret);
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
const done=()=>{//«
	for (let obj of fobjs) delete obj.wroteString;
	cbok();
};//»
const dowrite=(val, if_append, cb, which)=>{//«
//«
//For every one in fobjs, call 
//1) dev: its particular FileObj write.line or write.lines function
//2) fs: Save_fs_by_path(path, val, cb, if_append)
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
	const doit=async()=>{//«
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
			await fsapi._writeFsFileByEntry(obj, new Blob(valarr, {type:"blob"}), {append: if_append});
		}//»
		else if (obj instanceof Function){
			obj(val);
			doit();
		}
		else {//«
log("tee.doit(): GOT SOME OTHER FOBJ TYPE! " + obj.root.TYPE);
log(obj);
//log(val);
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
const getfobj=async()=>{//«
	iter++;
	if (iter==args.length) {
//		doread();
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

	let ret = await pathToNode(parpath);
	if (!ret){
		err(path+": cannot create the file");
		getfobj();
		return;
	}
	if (ret.APP!=globals.FOLDER_APP){
		err(path+": PARPATH NOTAFOLDER?!?!?");
		getfobj();
		return;
	}
	let type = ret.root.TYPE;
	if (type!=="fs"){
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
	if (!kid){
		let ret2 = await fsapi.touchFsFile(path, is_root);
		if (ret2) fobjs.push(ret2.entry);
		else err(path+": could not create the file");
		getfobj();
		return;
	}
	if (kid.root.TYPE!=="fs") {
		fobjs.push(kid);
		getfobj();
		return;
	}
	if (kid.FENT) {
		fobjs.push(kid.FENT);
		getfobj();
		return;
	}
	let ret2 = await fsapi.getFsEntryByPath(path, {isRoot: is_root});
	if (!ret2) err(path+": could not get the HTML5 file entry");
	else {
		kid.FENT = ret2;
		fobjs.push(ret2);
	}
	getfobj();

}//»
getfobj();


},//»

'touch':function() {//«

let ret = get_options(args);
if (ret[1].length) return cberr("There are no options in this version");
if (!args.length) {
	cberr("missing file operand");
	return;
}
const err=(str)=>{
	werr("touch: "+str);
};
const dotouch=async()=>{//«
	if (!args.length) {
		cbok();
		Desk&&Desk.update_folder_statuses();
		return;
	}
	let fullpath = normpath(args.shift());
	let arr = fs.path_to_par_and_name(fullpath);
	let parpath = arr[0];
	let fname = arr[1];
	let parobj = await pathToNode(parpath);
	if (!parobj) {
		werr(`${parpath}: no such file or directory`);
		dotouch();
		return;
	}
	if (parobj.root.TYPE != "fs") {
		werr(`${fullpath}: cannot touch the file`);
		return dotouch();
	}
	if (!fs.check_fs_dir_perm(parobj,is_root)) {
		werr(`${fullpath}: permission denied`);
		dotouch();
		return;
	}
	let ret = await fsapi.touchFsFile(fullpath, is_root);
	if (!ret) return cberr("Could not create or update the file");
	if (Core.Desk) Core.Desk.make_icon_if_new(ret);
	dotouch();
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

const {fs,FSPREF,FSLET,FSBRANCH}=globals;
const fsapi = NS.api.fs;

const APPOCT="application/octet-stream";

const{//«
cbeof,
sherr,
get_options,
termobj,
cur_com_name,
readFile,
read_file_args_or_stdin,
read_stdin,
cur_dir,
constant_vars,
is_writable,
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
pathToNode,
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

const get_dir_files=async(dir, filesret, cbarg, wout, if_blob, basepath)=>{//«
	const getkids=(_cb)=>{//«
		let kids = dir.KIDS;
		let keys = getkeys(kids);
		let iter = -1;
		const dokid=async()=>{//«
			iter++;
			if (iter==keys.length) return _cb();
			let k = keys[iter];
			if (k=="."||k=="..") return dokid();
			let kid = kids[k];
			let app = kid.APP||"File";
			let path = kid.fullpath;
			if (app==globals.FOLDER_APP) {
				path = path.substring(basepath.length+1);
				filesret.push([path,null]);
				if (wout) wout(path+"/");
				get_dir_files(kid, filesret, dokid, wout, if_blob, basepath);
			}
			else if (app=="Link") dokid();
			else {
				let ret = await fsapi.readFile(path, {BINARY: true});
				if (!ret) {
cwarn("tar/zip: got nothing: " + path + " (skipping)");
				}
				else {
					path = path.substring(basepath.length+1);
					if (if_blob) filesret.push([path, new Blob([ret], {type:"blob"})]);
					else filesret.push([path, ret]);
					if (wout) wout(path);
				}
				dokid();
			}
		};//»
		dokid();
	};//»
	if (!dir.done) {
		await fsapi.popDir(dir);
		dir.done=true;
	}
	getkids(cbarg);
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
	let fname = args.shift();
	if (!fname) return cberr("No arg!");
	atbc(fname, async(ret, fullpath)=>{
		if (!ret) return cberr("Not a file: " + fname);
		let ret2;
		if (if_gunzip) ret2 = await capi.decompress(new Blob([ret.buffer]),{toBlob:true});
		else ret2 = await capi.compress(ret);
		if (!ret2) return cberr("Could not "+verb+": " + fname);
		if (sws.stdout) {
			woutobj(ret2);
			cbok();
			return;
		}
		let arr = path_parts(fullpath);
		let parpath = arr[0];
		let name = arr[1];
		let parret = await pathToNode(parpath);
		if (!parret) return cberr("?????!!!!");
		let kids = parret.KIDS;
		let newname = name;
		if (if_gunzip) {
			if (fname.match(/\.gz$/i)) newname = newname.replace(/\.gz$/i,"");
			if (ext) newname+="."+ext;
		}
		else newname = name+".gz";
		if (kids[newname]) return cberr("Cannot save the file as: " + newname);
		let newpath = parpath + "/" + newname;
		let ret3 = await fsapi.saveFsByPath(newpath, ret2, {ROOT: is_root});
		if (!ret3) return cberr("Could not save the file");
//		if (Desk) Desk.save_hook(newpath);
		cbok();
	});
};//»

const make_bytes=(byt,num)=>{let arr=new Uint8Array(num);arr.fill(byt);return new Blob([arr],{type:APPOCT});};

//»


COMS[comarg](args);

}


