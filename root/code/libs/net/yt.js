
export const lib = (comarg, args, Core, Shell)=>{

const COMS={//«

yt:async()=>{

	if (!key) return cberr("No 'YTKEY' in the env!");
	let id = args.shift();
	if (!id) return cberr("No id given!");
	if (!id.match(/^[a-z0-9_-]{11}$/i)) return cberr("The id is invalid");
	let url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&id=${id}`;
	url+='&part=snippet,contentDetails&fields=items(snippet(title),contentDetails(duration))';
	let rv = await capi.xget(url,{text:true});
	cbok(rv);
}

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

let key;
if (com) key = get_var_str("YTKEY");

//»


COMS[comarg](args);


}





