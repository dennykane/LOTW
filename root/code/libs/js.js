export const lib = (comarg, args, Core, Shell)=>{

const COMS = {//«

'escodegen':async function(){//«
/*//«let opts= {
	format: {
		indent: {
			style: '    ',
			base: 0,
			adjustMultilineComment: false
		},
		newline: '\n',
		space: ' ',
		json: false,
		renumber: false,
		hexadecimal: false,
		quotes: 'single',
		escapeless: false,
//		compact: false,
		compact: true,
		parentheses: true,
		semicolons: true,
		safeConcatenation: false
	},
	moz: {
		starlessGenerator: false,
		parenthesizedComprehensionBlock: false,
		comprehensionExpressionStartsWithAssignment: false
	},
	parse: null,
	comment: false,
	sourceMap: undefined,
	sourceMapRoot: null,
	sourceMapWithCode: false,
	file: undefined,
//	sourceContent: originalSource,
	directive: false,
	verbatim: undefined
};
//»*/
	let opts = failopts(args,{l:{'no-comments':1}});
	if (!opts) return;
	let opt={
		format: {
			indent: {
				style: ''
			},
			quotes: 'auto',
			compact: true
		},
		comment:true
	};
	if (args['no-comments']) opt.comment=false;
	let got=0;
	read_stdin(async(rv)=>{
		if (got) return;
		if (!rv) return;
		if (rv.type!=="Program") return;
		got=1;
		if (!await capi.loadMod("util.escodegen")) return cberr("No escodegen module!");
		let esc = new NS.mods["util.escodegen"]().escodegen;

		let ret;
		try{
			ret = esc.generate(rv, opt);
//			ret = esc.generate(rv, {format:{indent: {style: ''},compact:true}});
//			ret = esc.generate(rv, {format:{compact:false}});
		}
		catch(e){
console.error(e);
			werr(e.message);
			cberr();
		return;
		}
		wout(ret);
		cbok();
	});
},//»
'esprima':async function(){//«

let opts=failopts(args,{s:{c:1}});

if (!await capi.loadMod("util.esprima")) return cberr("No esprima module!");
let esp = new NS.mods["util.esprima"](Core,{}).esprima;

let rv;
if (opts.c){
	if(!args.length) return cberr('No args given!');
	try{rv = esp.parse(args.join(" "));}
	catch(e){
		log(e);
		cberr(`${e.description}:${e.lineNumber}:${e.column}`);
		return;
	}
	wout(JSON.stringify(rv," ",2));
	cbok();
	return;
}

let path = args.shift();
if(!path) return cberr('No file given!');

let file = await fsapi.readFile(normpath(path));
if (!(file && file instanceof Array)) return cberr("File is missing or invalid");

try{
rv = esp.parse(file.join("\n"),{raw:true,loc:true, comment:true});
}catch(e){
log(e);
cberr(`${e.description}:${e.lineNumber}:${e.column}`);
return;
}
woutobj(rv);
//console.log(rv);
//wout(JSON.stringify(rv," ",2));
cbok();
}//»

}//»
if (!comarg) return Object.keys(COMS);

//Imports«
const NS = window[__OS_NS__];
const NUM = Number.isFinite;

let _;
const {mods}=NS;
const{log,cwarn,cerr,sys_url}= Core;
const capi=Core.api;
let getkeys = capi.getKeys;

let globals = Core.globals;
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


COMS[comarg](args);

}
