export const lib = (comarg, args, Core, Shell)=>{

const COMS={//«

linreg:async()=>{//«

let opts = failopts(args,{SHORT:{t:1}});
if (!opts) return;
if (!mods[MSTATS]){
	if (!await capi.loadMod(MSTATS)) return cberr("Could not load math.stats!");
}

stats = mods[MSTATS]();

let path = args.shift();
if (!path) return cberr("Need a filename!");

let dat = await fsapi.readFile(normpath(path), {FORCETEXT: (!!opts.t)});
if (!dat) return cberr("File not found: "+path);

if (dat instanceof Blob) return cberr("Use '-t' to force text (got a Blob instead)!");

if (!(dat instanceof Array && typeof dat[0]==='string')){
console.log(dat);
return cberr("Unknown object returned (expected array of strings)");
}
//log(rv);
let arr = [];
let num = 1;
for (let ln of dat){
	let dat = ln.regstr().split(" ");
	if (dat.length!=2) return cberr("Invalid line: "+num);
	num++;
	let x = parseFloat(dat[0]);
	let y = parseFloat(dat[1]);
	if (!Number.isFinite(x)) return cberr(`Invalid 'x' in line: ${num}`);
	if (!Number.isFinite(y)) return cberr(`Invalid 'y' in line: ${num}`);
	arr.push([x,y]);
}
let rv = stats.linearRegression(arr);
if (!isobj(rv)&&Number.isFinite(rv.m)&&Number.isFinite(rv.b)){
	console.log(rv);
	cberr("An invalid object returned from stats.linearRegression (check console)");
	return
}

wout(`slope: ${rv.m.toFixed(3)}`);
wout(`y-intercept: ${rv.b.toFixed(3)}`);
cbok();

}//»

}//»
if (!comarg) return Object.keys(COMS);

//Imports«

const{NS,xgetobj,globals,log,cwarn,cerr}=Core;
const{fs,util,widgets,dev_env,dev_mode}=globals;
const{strnum,isarr,isobj,isstr,mkdv}=util;
const {
	readFile,
	get_reader,
	fmt,
	read_stdin,
	woutobj,
	woutarr,
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
} = Shell;
const fsapi=NS.api.fs;
const capi = Core.api;
const fileorin = read_file_args_or_stdin;
const stdin = read_stdin;
const NUM = Number.isFinite;
const MSTATS = "math.stats";
let stats;
let mods=NS.mods;;

//»

COMS[comarg](args);


}





