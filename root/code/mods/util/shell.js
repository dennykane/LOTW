/*Change: July 13, 2022 9am @TSPOIKRBH
Escaping spaces in arguments (like in filenames) with backslashes was not working. The escapes were
being stripped out and multiple arguments were sent to the command. Hopefully, the fix @TSPOIKRBH fixes
it!
*/
//«
//«
/*

!!!!! NEW PARAM TO CALL COM !!!!!

const call_com=(comarg, PIPES, cb, inback, pipenum, PIPE_INIT)=>{

Every function in the pipeline chain must call PIPE_INIT before the first command will be called.

So, in the pipeline:

echoint 11 22 33 | log

The echoint command will not be called unless 'log' looks like this:

'log': args => {
	INIT();
	read_stdin(val=>{console.log(val)});
}




UWNSJPLFB
Here, we are undefine'ing the "real value" of the secret String when its valueOf is called.
The only problem is that this is implicitly called inside of any string equality test,
like:
if (somestr == "whatever")...

If our secret variable is


HDKEUND
Now, we are calling toString, which returns the sha1sum of "secret" Strings. But if we are
piping into another command that needs the real value in order to do something like
encrypting it...

*/
/*Need an "explicit newline" kind of array, for, eg. Heredocs.

For now, all arrays that are filled with strings are meant to represent 1 line per element.
That is, there are not typically supposed to be newline characters inside of these arrays.
But given that there are now special "secret" String objects (eg. $ read -s SECRETVAR) that
have different valueOf() and toString() results, then we need to wait to the last moment
to commit to the specific output format. That is, doing string concatentations just turns it
into a flat string.


*/
/*Passing an 's' flag to the read command like this:

$ read -s SOMEVAR
...will just display asterisks on the terminal.
Also, printing SOMEVAR on the terminal, like:
$ echo $SOMEVAR

...will just output the sha1sum, because the SOMEVAR environment variable is constructed like this:

// 'realvalue' is whatever is returned to the read function by the terminal's readline function

let o = new String(realvalue)
let sha1 = await capi.sha1sum(realvalue);
o.toString = function(){return sha1;}
set_var_str("SOMEVAR", o);

*/
/*Want to do:

$ cat path/to/SomeFile.ext | dl

... and have the file automatically saved as SomeFile.ext in Downloads
I guess we want to pass a flag to 'cat' to set some variable in the temporary environment that
the dl command can check on, such as CUR_FNAME

But of course the simplest case is:

$ dl path/to/somefile.ext

...which should download it as somefile.ext

*/
//»

/*RUNJSSCRIPT: This is the heart of the matter«

All of our system "bins" (eg. /bin, /usr/bin, /sbin) are going to be server mounts. We will 
test for the existence of the given file, in the order of $PATH. There must be a "main" file
at (<comname>.js) which has the help text, does command line option parsing, and all of the initialization 
routines. 

There may be an optional worker file at <comname>-worker.js.  Any algorithm that includes iteration 
or recursion (including Array functions like forEach, map, reduce, filter, etc) on application data 
MUST go into into the worker. 

The standard workflow is to load application datas as TypedArrays, which have a backing SharedArrayBuffer 
(SAB).

From 'main', the data SAB's are sent to the worker. 

IO is also done (stdin, stdout, stderr) via SAB's. This can be in the form of file redirection,
terminal keyboard/display, network resources, or the IO of other commands.

»*/

/*«

In read_stdin (and perhaps elsewhere), we need to ensure that the opts.BINARY
flag is properly heeded. Starting looking into this issue when we just ran:
$ cat -b
or
$ bcat
...that is, without arguments, it reads from the terminal's stdin.

»*/
//»

//5 minutes before "secret" strings get undefined in memory
const MAX_MS_FOR_SECRET_VAR=5*60*1000;
//const MAX_MS_FOR_SECRET_VAR=5*1000;
const FS_COMS=[ 'ln','zip','unzip','vim','less','gzip','gunzip','grep','tar','tee','touch' ];

export const mod = function(Core, termobj) {

const ALL_LIBS = [//«

"admin",
"av",
"crypto",
"gui",
"local",
"synth",
"vox",
"auto",
"fs",
"iface",
"net",
"util",
"wasm",
"net.yt",
"net.hn",
"math.stats"

//"cool",
//"test",
//"testing",

];//»
/*read_stdin: Why would a caller to read_stdin not want an EOF to be sent? That is a very fundamental//«
concept to the mechanics of pipelines.
So now: if_send_eof == true
»*/
//Imports«
const NUM=Number.isFinite;
//const termobj=arg;

const{refresh}=termobj;
//let refresh = termobj.refresh;
const{NS,Desk,globals,mime_of_path,text_mime,xget,xgetobj,log,cwarn,cerr,check_job_id}=Core;


const capi = Core.api;
const{isEOF:iseof,getKeys:getkeys}=capi;
const{dev_mode,dev_env,util,fs,FOLDER_APP}=globals;
let{math:mathmod}=globals;
const{find_it,make,mkdv,isstr,strnum,isid,isarr,isobj,isnum,isnull,isbool,isint}=util;

const fsapi = NS.api.fs;

const shell_lib = {};
const libs = [];

const jlog=obj=>{log(JSON.stringify(obj, null, "  "));};
const ENODESK = "The Desktop environment is not active";

const normpath = path=>{return fs.normalize_path(path, cur_dir);}
const get_path_of_object = fs.get_path_of_object;
const objpath = get_path_of_object;
const get_distinct_file_key = arg=>{return fs.get_distinct_file_key(arg);}
const filekey = get_distinct_file_key;
const get_fullpath=(path,if_no_resolve,no_deref_link)=>{return fs.get_fullpath(path,if_no_resolve,cur_dir,no_deref_link);}
const atbc = (arg, cb)=>{arg2con(arg, cb, true);} //"Arg To Bin Contents"
const gettextfile=(path,cb)=>{let fullpath=get_fullpath(path);if(!fullpath)return cb();fs.get_fs_by_path(fullpath,cb,{ROOT:is_root});}
const path_to_obj = (str, cb, if_getlink) => {
	if (!str.match(/^\x2f/)) str = (cur_dir + "/" + str).regpath();
	fs.path_to_obj(str, cb, is_root, if_getlink);
}
const pathToNode = (str, if_getlink) => {
	return new Promise((Y, N) => {
		if (!str.match(/^\x2f/)) str = (cur_dir + "/" + str).regpath();
		fs.path_to_obj(str, rv => {
			if (!rv) return Y(false);
			Y(rv);
		}, is_root, if_getlink);
	});
};
const ptw = path_to_obj;
const readFile=(path,opts={})=>{
	if (!path.match(/^\x2f/)) path = (cur_dir + "/" + path).regpath();
	return fsapi.readFile(path,opts);
};
//»
//Var«
const SYSNAME = globals.name.NAME;
const SYSACRONYM = globals.name.ACRONYM;
const help_str = `
The ${SYSNAME} (${SYSACRONYM}) shell is a subset of the published POSIX standard (IEEE 1003.1, Ch. 2), "The Shell Command Language". It is meant to quickly enable fairly complex interactive tasks related to the in-browser, sandboxed file system. Programmatic control-flow idioms are not supported, since it is very easy for programmers to extend ${SYSACRONYM} via its native language, JavaScript/ECMAScript.\n
Many commands exist inside of command libraries which can be accessed via the 'import' command. For example:\n
~$ import fs\n~$ vim\n
`;
/*
To see a listing of available libraries, run the 'libs' command.\n
To see the commands that exist within a given library, run the command: 'lib <name>'\n
So, to see a listing of commands in the 'fs' library, run the command 'lib fs' and to actually import those commands into the current shell environment, run the command, 'import fs'.\n
The 'help' command exists for help with individual commands, and can be invoked like this:\n
*/
const nlobj = {t: "c_op", c_op: "nl", nl: true};
const EOF = {EOF: true};
termobj.EOF = EOF;
const is_eof = val=>{return (val === EOF);}
const isEOF = is_eof;

let builtins = null;
let sys_builtins;
let parser = null;

let response = termobj.response;
const chomp_eof=arr=>{//«
	if (!isarr(arr)) return arr;
	let ret = [];
	for (let ln of arr) {
		if (!(isobj(ln)&&ln.EOF)) ret.push(ln);
	}
	return ret;
}//»

let FILES = termobj.FILES;
let ENV = termobj.ENV;

let shell_obj = this;
shell_obj.stdin = null;

let global_parser_name = "sh";
let global_timeouts = [];
let file_done;
let cur_dir;
let is_root = null;
let cancelled = null;

let var_env = ENV;

let exe_cb = null;

const constant_vars = {'USER': true, 'EMAIL': true, 'WINID': true};

//»
//Gen/Util Funcs«

const toks_to_string = (arr, if_nospace) => {//«
	let str = "";
	for (let i = 0; i < arr.length; i++) {
		let tok = arr[i];
		let is_nl = false;
		if (tok === undefined) continue;
		let t = tok.t;
		if (tok.toString() == "") continue;
		if (typeof(tok) == "string" || typeof(tok) == "number") str += tok;
		else if (tok.EOF) return str;
		else if (t == "sub") {
			let subt = tok.sub_t;
			let beg = "$";
			let end = "";
			if (subt == "com") {
				beg = "$(";
				end = ")";
			} else if (subt == "math") {
				beg += "$((";
				end = "))";
			}
			str += beg + toks_to_string(tok.sub, if_nospace) + end;
		}
		else if (t == "quote") {
			let quote = tok.quote;
			let qt = tok.quote_t;
			if (quote.t == "quote_string") str = str + tok.quote.quote_string;
			else if (quote.length != undefined && (qt == "'" || qt == '"' || qt == '\x60')) {
				let qarr = tok.quote;
				for (let j = 0; j < qarr.length; j++) {
					let ch = qarr[j];
					if (typeof ch == "string") {} else if (typeof ch == "object" && ch.t == "esc") qarr[j] = "\\" + ch.esc;
				}
				let qstr = qt + qarr.join("") + qt;
				if (tok['$']) qstr = "$" + qstr;
				str = str + qstr;
			} else {
				log("\n\nWhat kinda quote HAR NULLLLLLL???\n\n");
				return null;
			}
		}
		else if (t == "group_ret") {
			let group = tok['group_ret'];
			if (group && group.length != undefined) str += group.join(" ");
			else {}
		}
		else if (typeof(tok[t]) == "string") {
			if (t == "c_op" && tok[t] == "nl") {
				is_nl = true;
				str += "\n";
			} else str += tok[t];
		}
		else return tok;
		if (!if_nospace && !is_nl && i + 1 < arr.length) str = str + " ";
	}
	return str;
}//»
const tok_to_string=t=>{return toks_to_string([t]);}
const wrap_line = str=>{//«
	str = str.replace(/\t/g,"\x20".rep(termobj.tabsize));
	let out = '';
	let w = termobj.w;
	while (str.length > w){
		if (!out) out = str.slice(0,w);
		else out = out+"\n"+str.slice(0,w);
		str = str.slice(w);
	}
	if (str.length>0){
		if (!out) out = str;
		else out = out+"\n"+str;
	}
	return out;
};//»
const fmt = (str, opts={})=>{//«
	str = str.replace(/\t/g,"\x20".rep(termobj.tabsize));
	let{
		maxlen,
		nopad
	}=opts;
	let ret = [];
	let w = termobj.w;
	let dopad = 0;
	if (maxlen&&maxlen < w) {
		if (!nopad) dopad = Math.floor((w - maxlen)/2);
		w = maxlen;
	}
	let wordarr = str.split(/\x20+/);
	let curln = "";
	for (let i=0; i < wordarr.length; i++){
		let w1 = wordarr[i];
		if (((curln + " " + w1).length) >= w){
			if (dopad) ret.push((" ".repeat(dopad))+curln);
			else ret.push(curln);
			curln = w1;
		}
		else {
			if (!curln) curln = w1;
			else curln += " " + w1;
		}
		if (i+1==wordarr.length) {
			if (dopad) ret.push((" ".repeat(dopad))+curln);
			else ret.push(curln);
		}
	}
	return ret.join("\n");
}//»
const fmt_lines=str=>{let out=[];let arr=str.split("\n");for(let ln of arr)out=out.concat(fmt(ln));return out.join("\n");};
const clear_timeouts=()=>{//«
	for (let t of global_timeouts) clearTimeout(t);
	global_timeouts = [];
}//»
const path_to_par_and_name=(path, if_no_resolve)=>{//«
	let fullpath = get_fullpath(path, if_no_resolve);
	let arr = fullpath.split("/");
	if (!arr[arr.length-1]) arr.pop();
	let name = arr.pop();
	if (arr.length==1 && arr[0]=="") return ["/", name];
	return [arr.join("/"), name];
}//»
const path_from_arg=(arg, if_no_resolve, no_deref_link)=>{//«
	let path;
	if (!arg) path = cur_dir;
	else path = arg;
	return get_fullpath(path, if_no_resolve, no_deref_link);
}//»
const initialize_term=()=>{//«
	if (!builtins) return;
	termobj.initialized = true;
	termobj.builtins = (getkeys(builtins).concat(getkeys(shell_lib))).sort();
	termobj.sys_builtins = (getkeys(sys_builtins)).sort()
	
}//»
const sync_files=cb=>{let arr=[];let err_arr=[];let succ_arr=[];let keys=getkeys(termobj.dirty);for(let i=0;i<keys.length;i++)if(termobj.dirty[keys[i]])arr.push(keys[i]);let iter=-1;let sync=()=>{iter++;let key=arr[iter];let obj=termobj.dirty[key];if(obj){obj.write.sync(ret=>{if(ret){if(ret==true){}else if(ret['ERR']){err_arr.push(sh_name()+":"+ret['ERR']);delete termobj.dirty[key];}else if(ret['SUCC']){succ_arr.push(ret['SUCC']);delete termobj.dirty[key];}else{}}sync();});}else{if(err_arr.length)cb(err_arr);else cb(null,succ_arr);}};sync();}
const obj_path=(obj)=>{//«
	return get_path_of_object(obj);
}//»
const arg2con=(arg, cb, if_bin)=>{//«
	if (!arg) return cb();
	let fullpath = get_fullpath(arg);
	if (!fullpath) return cb();
	pathtocontents(fullpath, ret=>{
		cb(ret, fullpath);
	}, if_bin);
}//»
const pathtocontents = (arg, cb, if_dat, nbytes) => {
	path_to_obj(arg, ret => {
		if (!ret) return cb();
		if (ret.root.TYPE == "fs") fs.get_fs_by_path(arg, cb, {
			BLOB: if_dat,
			NBYTES: nbytes,
			ROOT: is_root
		});
		else {
			cwarn("pathtocontents():Not handling root type:" + ret.root.TYPE);
			cb();
		}
	});
}
const path_to_key=(path, num, sep_char)=>{//«
	arr = path.split("/");
	if (!arr[0]) arr.shift();
	if (num > 0 && num < arr.length) arr.splice(0, num);
	if (sep_char) return arr.join(sep_char);
	else return arr.join("/");
}//»
const sh_name=()=>{//«
	let name = ENV["SHELL_NAME"];
	if (!name) return global_parser_name;
	return name;
}//»
const blob_to_string=blob=>{//«
	if (blob instanceof Blob) {
		return "[Blob " + blob.type + " ("+blob.size + ")]";
	}
	return "";
}//»

//»

const Parser=function(_sh_error) {//«

const find_it=(arr,start,find_arr,ret_arr)=>{if(!find_arr)return null;for(let i=start;arr[i];i++){let tok=arr[i];for(let j=0;j<find_arr.length;j++){if(tok[tok.t]==find_arr[j])return{'pos':i,'t':tok.t,'tok':tok,'which':find_arr[j],'ret_arr':ret_arr};}if(ret_arr)ret_arr.push(tok);}return null;};

//Var«
const sh_error=str=>{_sh_error(str);return null;};
const sherr=(str)=>{sh_error(str);return null;};
let global_com_name;
let main_com_str;
let metas = [" ", "\t", "|", "&", ";", "(", ")", "<", ">"];
let c_op = [";;&", "||", "&&", ";;", ";&", "|&", "((", "&", ";", "|", "(", ")"];
let r_op = ["<<<", "&>>", "<>", ">>", "<<", "<&", "&>", ">&", ">", "<"];
let semi = {"t": "c_op", "c_op": ";"};
//»
//Util«
const find_not_blank=(arr,start,if_nl,if_rev)=>{for(let i=start;arr[i];){if(arr[i]===" "||arr[i].t=="blank" ||(if_nl && arr[i].c_op=="nl")){}else return{'pos':i,'t':arr[i].t,'tok':arr[i]};if(if_rev){if(i==0)return null;i--;}else i++;}return null;}
const find_not_blank_rev=(arr,start,if_nl)=>{return find_not_blank(arr,start,if_nl,true);}
const unexp_tok=(tok_or_str,tok_arg)=>{let str;if(isstr(tok_or_str))str=tok_or_str;else if(isobj(tok_or_str)){let tok=tok_or_str.tok || tok_or_str;if(tok.nl===true)str="newline";else str=tok[tok.t];if(!isstr(str)){str="type="+tok.t;}}else{log(tok);throw new Error("How you calling unexp_tok,dummy asshole?");}let line_str="";if(global_com_name){let ln="?";if(tok_arg){if(!isnum(tok_arg.ln)){cerr("tok_arg has no 'ln' field(line number)");}else ln=tok_arg.ln;}else{cerr("Calling unexp_tok without tok_arg!");}line_str="line "+ln+":";}let out_str=line_str+"syntax error near unexpected token \x60"+str+"'";_sh_error(out_str,null,null,null,global_com_name);return null;}
let IMPL_ERR=str=>{sh_error("Implementation Error: "+str);}
let COMP_IMPL_ERR=str=>{sh_error("Implementation Error: Embedding 'naked' compound statements (without braces) is currently unsupported!\n  \n  As a structurally equivalent workaround, please do something like:\n  \n  $ if foo; then { while bar; do baz; done; } fi\n  ");}
//»
//Main parsing algos«

const escapes=line_arr=>{for(let i=0;i<line_arr.length;i++){let arr=line_arr[i].split("");for(let j=0;j<arr.length;j++){if(arr[j]=="\\"){if(arr[j+1]){let obj={"t":"esc","esc":arr[j+1]};arr[j]=obj;arr.splice(j+1,1);j--;}} }line_arr[i]=arr;}return line_arr;};
const quote_strings=(line_arr,from_double,global_com_name,main_com_str_arg)=>{let qtype=null;let hereword="";let qarr=[];let orig_line_num;let orig_pos;let in_heredoc=false;let quote_metas=metas.concat(['"',"\x60","'"]);let ds=null;OUTERLOOP:for(let i=0;i<line_arr.length;i++){let arr=line_arr[i];if(in_heredoc){if(arr.length==hereword.length){for(let i=0;i<arr.length;i++){let tok=arr[i];if(((isstr(tok)&& tok==hereword[i])||(tok.esc && tok.esc==hereword[i])))continue;in_heredoc=false;}}continue;}for(let j=0;j<arr.length;j++){let chneg1=arr[j-1];let ch=arr[j];let ch2=arr[j+1];let ch3=arr[j+2];if(!qtype &&((from_double && ch=="\x60")||(!from_double &&((ch=='"' || ch=="'" || ch=="\x60")||(ch=="<" && ch2=="<" && ch3 && ch3 !="<" &&(j==0 ||(j>0 && chneg1 !="<"))))))){if(ch=="<"){in_heredoc=true;let k=j+2;while(arr[k] && arr[k]==" "){k++;}hereword="";while(arr[k] && !quote_metas.includes(arr[k])){let tok=arr[k];if(isstr(tok)){if(quote_metas.includes(tok))break;hereword+=tok;}else if(tok.esc)hereword+=tok.esc;k++;}if(!hereword.length){sh_error("No valid 'Heredoc' word found");return null;}continue OUTERLOOP;}else qtype=ch;orig_line_num=i;if(arr[j-1]=="$"){if(ch=="'"){arr.splice(j-1,1);ds=true;j--;}else if(ch=='"'){arr.splice(j-1,1);j--;}}orig_pos=j;}else if(qtype){if(ch==qtype ||(!ds && qtype=="'" && ch.esc=="'")){if(ch.esc=="'")qarr.push("\\");else if(ch.esc==="\x60")qtype="\x60";line_arr[orig_line_num].splice(orig_pos,2,{'t':'quote','$':ds,'quote_t':qtype,'quote':qarr});qtype=null;ds=null;qarr=[];if(i>orig_line_num){let rem=arr.splice(j);for(let k=1;k<rem.length;k++)line_arr[orig_line_num].push(rem[k]);line_arr.splice(i,1);i=orig_line_num;arr=line_arr[i];j=orig_pos+j+1;}else j-=1;}else{if(!ds && qtype=="'" && ch.esc){qarr.push("\\");qarr.push(ch.esc);}else if(ch.esc &&(qtype=="\x60" || qtype=='"')){/*There are no escapes in double quotes except $,\x60,and \*/ if(ch.esc=="$" || ch.esc=="\x60" || ch.esc=="\\")qarr.push(ch);else{if(qtype=='"' && ch.esc !='"'){qarr.push("\\");}else if(qtype=="\x60" && ch.esc !="\x60"){qarr.push("\\");}qarr.push(ch.esc);}}else qarr.push(ch);arr.splice(j,1);j--;}}}if(qtype){qarr.push("\n");if(i>orig_line_num){line_arr.splice(i,1);i--;}}}if(qtype){if(!global_com_name){let usestr=main_com_str_arg || main_com_str;return({'CONT':usestr});}else return null;}else{if(!global_com_name){let line=line_arr[line_arr.length-1];let lasttok=line[line.length-1];if(lasttok==="\\")return{CONT:main_com_str_arg || main_com_str};}}return line_arr;};
this.quote_strings = quote_strings;
const tokify=(line_arr,no_metas,from_back,from_double,from_heredoc)=>{let lnnum=1;let wordnum=0;let mkword=(str)=>{return{t:"word",word:str,ln:lnnum,wn:(wordnum++)}};let mkcop=(str)=>{return{t:"c_op",c_op:str,ln:lnnum}};let mkrop=(str)=>{return{t:"r_op",r_op:str,ln:lnnum}};let mkds=(str)=>{return{t:"ds",ds:"$",ln:lnnum}};let mknl=()=>{return{"t":"c_op","c_op":"nl","nl":true,ln:lnnum};};if(line_arr==null)return null;let ret=[];let word=null;for(let i=0;i<line_arr.length;i++){let arr=line_arr[i];for(let j=0;j<arr.length;j++){let ch=arr[j];let ch1=arr[j+1];if(!no_metas && metas.includes(ch)){if(word)ret.push(mkword(word.join("")));if(ch=="\t" || ch==" "){if(from_double)ret.push(ch);else{let usej=null;for(let k=j+1;(arr[k]==" " || arr[k]=="\t");k++)usej=k;if(usej)j=usej;ret.push(" ");}}else{let next=arr[j+1];if(next && metas.includes(next)){let comb=ch+next;if(c_op.includes(comb)){if(comb==";;" && arr[j+2]=="&"){ret.push(mkcop(";;&"));arr.splice(j+1,2);}else{ret.push(mkcop(comb));arr.splice(j+1,1);}}else if(r_op.includes(comb)){if(comb=="<<" && arr[j+2]=="<"){ret.push(mkrop("<<<"));arr.splice(j+1,2);}else if(comb=="&>" && arr[j+2]==">"){ret.push(mkrop("&>>"));arr.splice(j+1,2);}else{ret.push(mkrop(comb));arr.splice(j+1,1);}}else{if(c_op.includes(ch))ret.push(mkcop(ch));else if(r_op.includes(ch))ret.push(mkrop(ch));}}else{if(c_op.includes(ch))ret.push(mkcop(ch));else if(r_op.includes(ch))ret.push(mkrop(ch));}}word=null;}else{/*We don't have a meta here*/ if(from_heredoc &&(ch=="(" || ch==")" || ch==" ")){if(word)ret.push(mkword(word.join("")));if(ch=="(" || ch==")")ret.push(mkcop(ch));else if(ret.length>0 &&(typeof ret[ret.length-1]=="string")&&(ret[ret.length-1].match(/^\x20+$/)))ret[ret.length-1]+=" ";else ret.push(ch);word=null;}else if(!word){/*A word array isn't in effect*/ if(ch=="{" || ch=="}" || ch==",")ret.push(mkword(ch));else if(ch=="\n" ||(from_double && ch=="\x60"))ret.push(ch);else if(ch=="$")ret.push(mkds());else if(typeof(ch)=="string")word=[ch];else if(typeof(ch)=="object")ret.push(ch);}else if(ch=="$"){ret.push(mkword(word.join("")));word=null;ret.push(mkds());}else{if(ch=="{" || ch=="}" || ch==","){ret.push(mkword(word.join("")));ret.push(mkword(ch));word=null;}else if(ch=="\n" ||(from_double && ch=="\x60")){ret.push(mkword(word.join("")));ret.push(ch);word=null;}else if(ch.t=="esc"){if(ch.esc=="{" || ch.esc=="}" || ch.esc==","){ret.push(mkword(word.join("")));ret.push(ch);word=null;}else{ret.push(mkword(word.join("")));ret.push(ch);word=null;}}else if(typeof(ch)=="string" &&(!from_heredoc ||(ch !=" " && ch !="(" && ch !=")"))){if(from_double && ch=="\\" && ch1=="\n"){arr.splice(j,2);j--;}else word.push(ch);}else{ret.push(mkword(word.join("")));ret.push(ch);word=null;}}}}if(word){let useword=word.join("");let pushnl=true;if(useword.match(/\\$/)){useword=useword.replace(/\\$/,"");pushnl=null;}if(useword)ret.push(mkword(useword));if(pushnl)ret.push(mknl());}else{ret.push(mknl());lnnum++;}word=null;}return ret;};this.tokify = tokify;
const groupify = (toks, opts) => {
	let is_quote;
	let from_math;
	let global_com_name;
	let main_com_str_arg;
	if (opts) {
		is_quote = opts.QUOTE;
		from_math = opts.MATH;
		global_com_name = opts.NAME;
		main_com_str_arg = opts.COM;
	}
	let db = (str) => {
		if (is_quote) log(str);
	};
	let cur_line = 0;
	let make_math_group = (grp, if_ds, pos1, pos2, which) => {
		if (if_ds) toks[pos1] = {
			't': 'sub',
			'sub_t': "math",
			'sub': grp,
			ln: cur_line
		};
		else toks[pos1] = {
			't': 'group',
			'group_t': "math",
			'math': true,
			'group': grp,
			ln: cur_line
		};
		toks.splice(pos1 + 1, pos2 - pos1 + 1);
	};
	let cur_error_message = null;
	if (toks == null) return null;
	let quote_str = null;
	let quote_start = null;
	let quote_num = 0;
	let have_comment = null;
	let have_prev_c_op;
//	let heredoc_word = null;
	for (let i = 0; i < toks.length; i++) {
		let tok = toks[i];
		let ch = tok.c_op;
		let tok1 = toks[i + 1];
		let ds = null;
		if (i > 0 && toks[i - 1].t == "ds") {
			ds = true;
		}
		let tok2 = toks[i + 2];

/*
		if (heredoc_word && tok.word == heredoc_word) {
			heredoc_word = null;
			continue;
		}
		else if (!heredoc_word && tok.r_op == "<<") {
			let next = find_not_blank(toks, i + 1);
			if (next && next.t == "word") {
				i = next.pos;
				heredoc_word = next.tok.word;
				continue;
			}
		}
		else if (heredoc_word) {
if (ds){
log("DS", tok);
}
			continue;
		}
*/
		if (tok.ln && tok.ln > cur_line) {
			have_comment = null;
			cur_line = tok.ln;
		}
		if (!ds && tok.t == "word" && tok.word.match(/#/) && !is_quote) have_comment = true;
		if (have_comment) continue;
		let ch1 = null;
		if (tok1) ch1 = tok1.c_op;
		if (!ch) {
			let prev = toks[i - 1];
			let next = tok1;
			if (tok.word == "{") {
				if (ds) ch = "{";
				else {
					if ((prev && prev.word) || (next && next.word)) continue;
					else ch = "{"
				}
			} else if (tok.word === "}") {
				if ((prev && prev.word) || (next && next.word)) continue;
			}
		}
		if (ch == "{" || ch == "(") {
			have_prev_c_op = false;
			if (!ds && i > 0) {
				let prev = find_not_blank_rev(toks, i - 1);
				if (!prev || prev.t === "c_op") have_prev_c_op = true;
				if (!have_prev_c_op && prev && prev.t === "word") {
					prev = find_not_blank_rev(toks, prev.pos - 1);
					if (!prev || prev.t == "c_op") have_prev_c_op = true;
				}
				if (!have_prev_c_op && prev && ch == "{") {
					if (prev && (prev.t === "word" || prev.t === "quote")) {} else have_prev_c_op = !!prev.c_op;
				}
			} else {
				if (ds && tok1 && tok1.word && tok1.word.match(/^[a-zA-Z]/) && tok2 && tok2.word == "}") {
					toks[i] = {
						't': 'sub',
						'sub_t': 'var',
						'sub': tok1.word,
						ln: tok.ln
					};
					toks.splice(i - 1, 1);
					toks.splice(i, 2);
				} else have_prev_c_op = true;
			}
		}
		if (ds && !ch) {
			if (tok.word) {
				let word = tok.word;
				let marr;
				if ((marr = word.match(/^([*@#?0-9])(.*)$/)) || (marr = word.match(/^([_a-zA-Z][_a-zA-Z0-9]*)(.*)$/))) {
					toks[i] = {
						't': 'sub',
						'sub_t': 'var',
						'sub': marr[1],
						ln: tok.ln
					};
					if (marr[2]) toks.splice(i + 1, 0, {
						't': "word",
						"word": marr[2],
						ln: cur_line
					});
					toks.splice(i - 1, 1);
				}
			}
			else if (toks[i].quote_t == "'") {
				tok['ds'] = true;
				toks.splice(i - 1, 1);
			}
		} else if (((ch == "(" && (have_prev_c_op)) || (ch == "{" && have_prev_c_op) || ch == "((")) {
			if (is_quote) {
				if (!ds) continue;
			}
			if (ds) {
				toks.splice(i - 1, 1);
				i--;
			}
			let group = [];
			let type = "cmd";
			let stack = [];
			let depth = 0;
			if (ch == "((") {
				type = "math";
				depth = 1;
				if (from_math && !ds) {
					ch = "(";
					type = "cmd";
					toks.splice(i + 1, 0, {
						"t": 'c_op',
						'c_op': "(",
						ln: cur_line
					});
				}
			}
			for (let j = i + 1; toks[j]; j++) {
				let tokj = toks[j];
				let tokj1 = toks[j + 1];
				if (tokj.ln && tokj.ln > cur_line) {
					have_comment = null;
					cur_line = tokj.ln;
				}
				if (tokj.t == "word" && tokj.word.match(/#/)) {
					if (j > 0 && toks[j - 1].t == "ds") {} else if (j > 0 && ds && tokj.word.match(/^#/) && toks[j - 1].word == "{") {} else have_comment = true;
				}
				if (have_comment) continue;
				if (depth == 0) {
					if (ch == "{" && tokj.word == "}" && !(toks[j - 1].word || (toks[j + 1] && toks[j + 1].word))) {
						if (ds) {
							toks[i] = {
								't': 'sub',
								'sub_t': "param",
								'sub': group,
								ln: cur_line
							};
							toks.splice(i + 1, j - i);
							i = i + 1;
							break;
						} else {
							let isgood = null;
							for (let k = j - 1; k > 0; k--) {
								let tokk = toks[k];
								if (tokk == " ") {
									continue;
								}
								let op = tokk[tokk.t];
								if (op == ";" || op == "&" || op == "nl") {
									/*Need to make sure this is NOT empty braces*/
									let grpstr = toks_to_string(group, true);
									if (grpstr.match(/^[ \n]*$/)) return unexp_tok("}", tokj);
									let nexttok = find_not_blank(toks, j + 1, false);
									if (nexttok && nexttok.tok.c_op) {} else if (tokj1 === " ") toks[j + 1] = {
										't': 'c_op',
										'c_op': ";",
										ln: cur_line
									};
									toks[i] = {
										't': 'group',
										'group_t': 'shell',
										'shell': true,
										'group': grpstr,
										ln: cur_line
									};
									toks.splice(i + 1, j - i);
									i = i + 1;
									isgood = true;
									break;
								} else {
									if (tokk.word && k === j - 1) continue;
									sh_error("Could not find a valid statement terminator(';','&',or newline)for the shell group!");
									return;
								}
							}
							if (isgood) break;
							else return unexp_tok("}", tokj);
						}
					} else if (ch == "(" && tokj.c_op == ")") {
						if (type == "cmd") {
							if (ds) toks[i] = {
								't': 'sub',
								'sub_t': "com",
								'sub': group,
								ln: cur_line
							};
							else {
								if (from_math) {
									group.unshift("(");
									group.push(")");
									toks[i] = {
										't': 'word',
										'word': group,
										ln: cur_line
									};
								} else {
									let grpstr = toks_to_string(group, true);
									if (grpstr.match(/^[ \n]*$/)) {
										return unexp_tok(")", tokj);
									}
									let nexttok = find_not_blank(toks, j + 1, false);
									if (nexttok && nexttok.tok.c_op) {} else if (tokj1 === " ") toks[j + 1] = {
										't': 'c_op',
										'c_op': ";",
										ln: cur_line
									};
									toks[i] = {
										't': 'group',
										'group_t': "subshell",
										'subshell': true,
										'group': grpstr,
										ln: cur_line
									};
								}
							}
							toks.splice(i + 1, j - i);
							i = i + 1;
							break;
						} else if (type == "math" && tokj1 && tokj1.c_op == ")") {
							make_math_group(group, ds, i, j, 2);
							break;
						}
					}
				}
				if (tokj.c_op == "(") {
					depth++;
					stack.push("(");
				} else if (tokj.word == "{") {
					depth++;
					stack.push("{");
				} else if (tokj.word == "}" && !(toks[j - 1].word || (toks[j + 1] && toks[j + 1].word))) {
					depth--;
					if (stack.pop() !== "{") {
						return unexp_tok("}", tokj);
					}
				} else if (tokj.c_op == ")") {
					depth--;
					if (depth == 0 && type == "math" && tokj1 && tokj1.c_op == ")") {
						make_math_group(group, ds, i, j, 1);
						break;
					} else if (stack.pop() !== "(") return unexp_tok(")", tokj);
				} else if (tokj.c_op == "((") {
					depth = depth + 2;
					stack.push("(", "(");
				}
				if (tokj.t == "eof") {
					if (!global_com_name) {
						return ({
							'CONT': (main_com_str_arg || main_com_str)
						});
					}
					sh_error("end of file reached");
					return null;
				}
				group.push(tokj);
			}
		} else if (ch === "(" && !have_prev_c_op) return unexp_tok("(", tok);
		else if (ch === ")") {
			if (is_quote) continue;
			return unexp_tok(")", tok);
		}
	}
	return toks;
};
this.groupify = groupify;

const strip_comments=toks=>{if(toks==null)return null;let ret=[];for(let i=0;i<toks.length;i++){let tok=toks[i];if(tok.word && tok.word.match(/^#/)){let j=i+1;while(toks[j].c_op !="nl")j++;i=j-1;}else{if(tok==" ")ret.push({'t':"blank",'blank':" "});else ret.push(tok);}}return ret;}
const redirectify = toks => {//«
//jlog(toks);
	if (!toks) return null;
	let ret = [];
	let ok_reds = ["word", "sub", "quote"];
	for (let i = 0; i < toks.length; i++) {
		let is_heredoc = false;
		let esc_ch = "";
		let tok0 = toks[i];
		let tok1 = toks[i + 1];
		let tok2 = toks[i + 2];
		if (tok0.t == "r_op") {
			if (tok1 && tok1.t == "blank") {
				toks.splice(i + 1, 1);
				tok1 = toks[i + 1];
				tok2 = toks[i + 2];
			}
			if (tok0.r_op == "<<") {
				if (tok1.t == "esc") {
					esc_ch = tok1.esc;
					toks.splice(i + 1, 1);
					tok1 = toks[i + 1];
					tok2 = toks[i + 2];
				}
				if (tok1.t != "word") {
					sh_error("Need a simple word\x20(optionally escaped)\x20as a 'heredoc' delimiter");
					return null;
				}
				let word = esc_ch + tok1.word;
				toks.splice(i + 1, 1);
				let j = i + 1;
				let tokj = toks[j];
				while (tokj && !tokj.nl && !tokj.eof) {
					j++;
					tokj = toks[j];
				}
				let got_delimiter = false;
				let here_doc = [];
				let on_nl = true;
				for (let k = j + 1; k < toks.length; k++) {
					let tok = toks[k];
					if (on_nl && tok.t == "word" && tok.word == word && (toks[k + 1].nl || toks[k + 1].eof)) {
						toks.splice(k, 1);
						got_delimiter = true;
						break;
					} else {
						toks.splice(k, 1);
						k--;
						if (tok.nl === true) {
							here_doc.push("\n");
						}
						else here_doc.push(tok);
					}
					if (tok.nl) on_nl = true;
					else on_nl = false;
				}
				if (!got_delimiter) {
					/* * We can put a "heredoc" type of continuation here,so * the next quote strings('"\x60)are not treated special. They are * word tokens like any other */
					return {
						'CONT': main_com_str,
						'TYPE': "heredoc"
					};
				}
				if (esc_ch) {
					let arr = toks_to_string(here_doc,true).split("\n");
					if (!arr[0]) arr.shift();
					if (!arr[arr.length - 1]) arr.pop();
					for (let i = 0; i < arr.length; i += 2) {
						if (i == 1000000) {
							throw new Error("If you really wanted 1000000 iterations here,\x20then please by all means remove this infinite loop protector!");
						}
						arr[i] = arr[i].replace(/\x20$/, "");
						arr.splice(i + 1, 0, nlobj);
					}
					here_doc = arr;
				}
				if (here_doc.length&&here_doc[here_doc.length-1]==="\n") here_doc.pop();
				tok0.here_doc = here_doc;
				ret.push(tok0);
			} else if (tok1 && ok_reds.includes(tok1.t)) {
				let gottok;
				let redir = [];
				let j = i + 2;
				for (j = i + 1; j < toks.length; j++) {
					let typ = toks[j].t;
					if (typ == "word" || typ == "sub" || typ == "quote") redir.push(toks[j]);
					else break;
				}
				tok0.redir_arg = redir;
				toks.splice(i + 1, j - i - 1);
				ret.push(tok0);
			} else {
				if (tok1.c_op) return unexp_tok(tok1, tok1);
				sh_error("Could not find a good redirection argument");
				return null;
			}
		} else ret.push(tok0);
	}
	return ret;
}//»

const simples=(toks,from_other)=>{if(!toks)return null;let command=null;let ret=[];let tok_num=0;let assigns=[];let redirects=[];let cap;let redirect_fd;for(let i=0;i<toks.length;i++){let tok=toks[i];let tp=tok.t;redirect_fd=null;if(tp=="word" && tok.word.match(/^[0-9]+$/)&& toks[i+1] && toks[i+1].r_op){redirect_fd=tok.word;toks.splice(i,1);tok=toks[i];tp=tok.t;}if(tp=="r_op"){if(redirect_fd)tok.fd=redirect_fd;redirects.push(tok);}else if(!command){if(tp=="blank")continue;else if(tp=="esc" || tp=="quote" || tp=="sub" || tp=="group" || tp=="word"){if(tp=="word" &&(cap=tok.word.match(/^([_a-zA-Z][_a-zA-Z0-9]*(\[[_a-zA-Z0-9]+\])?)=/))){let all_toks=[];for(let j=i+1;;){if(toks[j].t=="word" || toks[j].t=="sub" || toks[j].t=="quote"){all_toks.push(toks[j]);toks.splice(j,1);}else break;}tok["all_toks"]=all_toks;assigns.push(tok);}else if(tok.word || tok.esc){let comstr=tok.word || tok.esc;for(let j=i+1;j<toks.length;j++){if(toks[j].word || toks[j].esc){comstr=comstr+(toks[j].word || toks[j].esc);toks.splice(j,1);j--;}else break;}delete tok.esc;tok.t="word";tok.word=comstr;command=[tok];}tok["tok_num"]=tok_num;tok_num++;}/*No command,but a c_op. If we have assigns,this means that they will take affect*/ else if(tp=="c_op"){if(assigns.length || redirects.length)ret.push({'t':"com",'com':[],'assigns':assigns,'redirects':redirects});assigns=[];redirects=[];ret.push(tok);}else if(tp!="eof"){console.error("SHOULD NOT BE HERE!",tp);}}else{/*We have command*/ if(tok.t=="c_op" || tok.eof){/*Here,the command can be a shell group... does this mean that it needs its redirects to be given to it internally?  Or keep it on the com?*/ if(command.length || assigns.length || redirects.length){if(command[0].t=="group"){if(command[0].subshell || command[0].shell){command[0].redirects=redirects;command[0].assigns=assigns;assigns=[];redirects=[];}}ret.push({'t':"com",'com':command,'assigns':assigns,'redirects':redirects});}ret.push(tok);command=null;assigns=[];redirects=[];}else{tok['tok_num']=tok_num;tok_num++;let prev=command[command.length-1];let cop;/*If prev is a group,we are looking for a r_op or ||,&&,|,or |&*/ if(prev.group){/*If this is a shell/subshell,we need to put all redirects onto it*/ cop=tok.c_op;if(tok.r_op || cop=="||" || cop=="&&" || cop=="|&" || cop=="|")command.push(tok);else if(tok.t=="blank"){}else return unexp_tok(tok,tok);}else if(tok.group){cop=prev.c_op;if(cop=="||" || cop=="&&" || cop=="|&" || cop=="|")command.push(tok);else return unexp_tok(tok,tok);}else{command.push(tok);}}}}return ret;}

const pipelines=toks=>{if(!toks)return null;let got=toks.pop();if(!got.eof)toks.push(got);let pipeline=null;let ret=[];let have_pipe=null;let have_not=null;let prev=null;for(let i=0;i<toks.length;i++){let tok=toks[i];if(!pipeline){if(tok.t=="com"){let com=tok.com;if(com[0]&&com[0].word=="!"){com.shift();if(com[0] && com[0].blank)com.shift();have_not=true;}pipeline=[tok];}else ret.push(tok);}else{if(!have_pipe){if(tok.t=="c_op"){if(tok.c_op=="|" || tok.c_op=="|&"){pipeline.push(tok);have_pipe=true;}else{if(pipeline){ret.push({'t':'pipeline','pipeline':pipeline,'not':have_not});have_not=null;}pipeline=null;have_pipe=null;ret.push(tok);}}else if(pipeline){ret.push({'t':'pipeline','pipeline':pipeline});pipeline=null;have_pipe=null;have_not=null;}else{sh_error("WUTTT PIPELINEZZZ?????");return null;}}else{/*We do have_pipe*/ if(tok.t=="com"){let com=tok.com;if(com[0] && com[0].word=="!")return unexp_tok("!",com[0]);let pipetok=pipeline.pop();let plen=pipeline.length;pipeline[plen-1]['pipe_out']=true;if(pipetok.c_op=="|&")pipeline[plen-1]['pipe_err']=true;tok['pipe_in']=true;pipeline.push(tok);have_pipe=null;}else{if(tok.blank){}else if(tok.c_op=="nl"){pipeline.push(tok)}else{return unexp_tok(tok[tok.t],tok);}}}}}if(pipeline){ret.push({'t':'pipeline','pipeline':pipeline,'not':have_not});}return ret;}

const list_seq=(toks,type1,type2,op1,op2)=>{if(!toks)return null;let list=null;let ret=[];let have_op=null;let last;for(let i=0;i<toks.length;i++){let tok=toks[i];if(!list){have_op=null;if(tok.t==type1)list=[tok];else{if(tok.c_op==op1 || tok.c_op==op2){/*Here we can have a \x60;' with a keyword before it:if echo ass;then if echo shar;then echo slum;fi;fi;The keyword means that a list is not started*/ return unexp_tok(tok.c_op,tok);}ret.push(tok);}}else{if(!have_op){/*There is a list is effect but no previous list operator*/ if(tok.t=="c_op"){if(tok.c_op==op1 || tok.c_op==op2){list[list.length-1]['list_op']=tok;have_op=true;}else if(type2=="list" && tok.nl){tok['end']=";";have_op=true;}else{let obj={'t':type2};obj[type2]=list;ret.push(obj);list=null;have_op=null;ret.push(tok);}}else if(list){/*We have a list with a curtok other than a c_op,which can be(or should/must be?)a Reserved word like then/fi.  We weren't pushing this curtok into the ret???!!!*/ let obj={'t':type2};obj[type2]=list;ret.push(obj);ret.push(tok);list=null;have_op=null;}else{sh_error("error in list_seq()");return null;}}else{/*We do have_op and there is a list*/ if(tok.t==type1){list.push(tok);have_op=null;}else{if(type2=="list" && tok.t=="word" && tok.word=="}"){if(list){let obj={'t':type2};obj[type2]=list;ret.push(obj);list=null;}ret.push(tok);have_op=null;}else if(tok.t=="blank" || tok.c_op=="nl"){}else{return unexp_tok(tok[tok.t],tok);}}}}}if(list){let obj={'t':type2};obj[type2]=list;ret.push(obj);}return ret;}

const str_to_compound = (str) => {
	let arr = str.split("\n");
	arr = escapes(arr);
	arr = quote_strings(arr);
	if (!arr) return;
	else if (arr.length == undefined) return arr;
//jlog(arr);
	arr = tokify(arr);
	if (arr) {
		let line = 1;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].nl) line++;
		}
	}
	if (arr) arr.push({
		't': 'eof',
		'eof': true
	});
	if (!arr) return;
	else if (arr.length == undefined) return arr;
	arr = groupify(arr);
	if (arr) {
		if (arr.length == undefined) return arr;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].ds) {
				arr[i].t = "word";
				arr[i].ds = null;
				arr[i].word = "$";
			}
		}
	}
	arr = strip_comments(arr);
	arr = redirectify(arr);
	if (arr && arr.CONT) return arr;
	arr = simples(arr);
	if (!arr) return;
	else if (arr.length == undefined) return arr;
	arr = pipelines(arr);
	if (arr) {
		let ln_num = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].blank) {
				arr.splice(i, 1);
				i--;
			} else if (arr[i].nl) {
				if (arr[i + 1] && arr[i + 1].nl) {
					arr.splice(i, 1);
					i--;
				}
			}
		}
	}
	arr = list_seq(arr, "pipeline", "loglist", "||", "&&");
	arr = list_seq(arr, "loglist", "list", "&", ";");
	if (arr) {
		for (let i = 1; i < arr.length; i++) {
			if (arr[i].nl) {
				arr.splice(i, 1);
				i--;
			}
		}
	}
	return arr;
}

//»

this.parse = (str, com_name_arg) => {
	global_com_name = com_name_arg;
	main_com_str = str;
	return str_to_compound(str);
}

}//»

const run_script=async(main_com_str, final_cb, opts={})=>{//«

let tmp_env={};
let par_env;

//«

const {halt_on_fail} = opts;
let if_com_sub = opts.COMSUB;//2
let par_obj_arg = opts.PAROBJ;//3
let is_parent_bash = opts.PARSHELL;//4
let which = opts.WHICH;//5
let in_background_script = opts.INBACK;
//»

let kill_register = termobj.kill_register;//«

if (in_background_script) {
	kill_register = cb=>{Core.set_job_cb(in_background_script, cb);}
}//»

//Var/Init«
file_done = null;

let in_group = opts.INGROUP;
let global_com_name;
let global_redir = null;
let global_pipes = null;
let global_pipe_arr = null;
let global_args = null;
let global_set_stdin_cb = null;
let global_term_writer = null;
let global_term_reader = null;
let sys_abort = null;
let use_return_val = null;
let stdout_capture = null;
par_env = null;
if (par_obj_arg) {
	global_term_writer = par_obj_arg.TERM_WRITER;
	global_redir = par_obj_arg.REDIR;
	global_args = par_obj_arg.ARGS;
	global_com_name = par_obj_arg.GLOBAL_NAME;
	global_term_reader = par_obj_arg.TERM_READER;
	par_env = par_obj_arg.TMP_ENV;
	stdout_capture = par_obj_arg.STDOUTCAPTURE;
	global_set_stdin_cb = par_obj_arg.SET_STDIN_CB;
	if (par_obj_arg.PIPES) {
		if (par_obj_arg.PIPES[0]) global_pipes = par_obj_arg.PIPES[0];
		if (par_obj_arg.PIPES[1]) global_pipe_arr = par_obj_arg.PIPES[1];
//«
/*
global_pipe_arr is a sparse array that allows us to key into global_pipes.
If there is a defined value at the 1 position, this value should be the 
key in global_pipes.
*/
//»
	}
}
else if (if_com_sub) stdout_capture = [];

//»

//System/Read/Write«

let PipeObj=function(){//«
	var _buffer = [];
	var _pipewrite_cb = null;
	let cb_is_natural=true;
	var pipeobj = this;
	function Reader() {//«
		this.pipe = pipeobj;
		this.readline=(cb,incr,max_iters)=>{if(_buffer.length){cb(_buffer.pop());return;}if(!incr)incr=10;if(!max_iters)max_iters=50;let iter=-1;let interval=setInterval(()=>{iter++;if(iter==max_iters){clearInterval(interval);cb();}if(_buffer.length){cb(_buffer.pop());clearInterval(interval);}},incr);}
		this.line=cb=>{if(pipeobj.done)_pipewrite_cb(EOF);if(!_buffer.length)cb(null);else{let val=_buffer.shift();cb(val);if(val===EOF)pipeobj.done=true;}}
		this.tryline=()=>{if(!_pipewrite_cb)return;if(pipeobj.done)_pipewrite_cb(EOF);if(_buffer.length){let is_eof=(_buffer[0]===EOF);if(cb_is_natural){_pipewrite_cb(_buffer.shift());if(is_eof)pipeobj.done=true;}else{if(is_eof)return;_pipewrite_cb(_buffer.shift());}} }
		this.peek=cb=>{if(_buffer.length||pipeobj.done)cb(true);else cb();}
		this.is_pipe = true;
		this._buffer = _buffer;
	}//»
	function Writer() {//«
		this.pipe = pipeobj;
		this.line = (str, a2, cb) => {
			if (pipeobj.done) {
				if (_pipewrite_cb) _pipewrite_cb(EOF);
				return;
			}
			if (!cb_is_natural && str === EOF) return;
			_buffer.push(str);
			if (_pipewrite_cb) {
				let val = _buffer.shift();
				_pipewrite_cb(val);
				if (val === EOF) {
					pipeobj.done = true;
					_pipewrite_cb = null;
				}
			}
		}
		this.lines=(arr,a2,a3,a4,cb,wcb)=>{if(_pipewrite_cb){if(_buffer.length){_pipewrite_cb(_buffer);_buffer=[];}_pipewrite_cb(arr);}else _buffer=arr;if(cb)cb();if(wcb)wcb(1);}
		this.object = (obj) => {
			if (_pipewrite_cb) _pipewrite_cb(obj);
			else _buffer.unshift(obj);
		}
		this.blob=(blob)=>{
			if(_pipewrite_cb)_pipewrite_cb(blob);
			else _buffer.unshift(blob);
		}
		this.is_pipe = true;
	}//»
	this.set_unnatural_state=()=>{cb_is_natural=false;}
	this.set_natural_state=()=>{cb_is_natural=true;}
	this.set_pipewrite_cb = (arg, if_native)=>{
	if (_pipewrite_cb) return;
		_pipewrite_cb = arg;
		if (pipeobj.done) _pipewrite_cb(EOF);
	}
	this.unset_pipewrite_cb=()=>{_pipewrite_cb=null;}
	this.read = new Reader();
	this.write = new Writer();
	return this;
}//»

const softbr=if_cur=>{var nocur=true;if(if_cur)nocur=false;respbr(nocur,true);}
const respbr = (if_nocur, if_soft_break) => {
	if (in_background_script) return;
	if (file_done) return;
	response({
		"SUCC": ["\x00"]
	}, {
		BREAK: true,
		NOEND: true,
		NOCUR: if_nocur,
		SOFTBREAK: if_soft_break
	});
	refresh();
}
const get_redir=(arr,which,pipenum)=>{let redir=arr[which];let type=typeof(redir);if(global_redir && global_redir[which]){if(which===0 && isnum(pipenum)&& pipenum>0){}else return global_redir[which];}if(isobj(redir)){let objtype=redir.t;let rop=redir.r_op;if(rop=="<<"||rop=="<<<"){return redir;}else{cerr("get_redir():WHAT KIND OF REDIR IS THIS???? "+objtype);}}else if(type=="boolean" || type=="string" || type=="number")return redir;return null;}
const ret_true=()=>{return make_ret(0);}
const ret_false=(valarg)=>{return{'SUCC':false,'VAL':valarg||1};}
const make_ret=(num,mess)=>{if(num==0)return{'SUCC':true,'VAL':0};return{'ERR':true,'VAL':num,'MESS':mess}}
const bq_abort=(cb,which)=>{sh_error("backquote not implemented yet,abort("+which+")",true);cb(ret_false());}
const sys_error=(str,if_abort,redir_arg)=>{if(if_abort)sys_abort=true;sys_write({ARG0:str,ARG1:2,ARG3:redir_arg});return make_ret(1,"System error");}
const sh_error=(str,if_abort,redir_arg,use_retval,namearg)=>{if(if_abort)sys_abort=true;sys_write({ARG0:(namearg ? namearg:sh_name())+":\x20"+str,ARG1:2,ARG3:redir_arg});refresh();return make_ret(use_retval || 1,"System error");}
const sys_read = (arg, if_get_val, if_force_term) => {
	let which = arg.ARG0,
		pipe_arr = arg.ARG1,
		redir = arg.ARG2,
		PIPES = arg.ARG3,
		cb = arg.ARG4,
		num_lines_arg = arg.ARG5,
		if_get_only = arg.ARG6,
		if_no_br = arg.ARG7,
		in_back = arg.ARG8 || in_background_script,
		pipenum = arg.PIPENUM;
	if (!cb) cb = ()=>{};
	let reader;
	let which_pipe;
	let is_stdin = null;
//log(redir, which);
	if (pipe_arr) which_pipe = pipe_arr[which];
	if (if_force_term) reader = FILES[0];
	else if (redir == undefined || redir.length == 0) {
		if (typeof(which_pipe) == "number") reader = PIPES[which_pipe];
		else reader = FILES[which];
	} else if (typeof(redir) == "number") {
		if (typeof(which_pipe) == "number") reader = PIPES[which_pipe];
		else reader = FILES[redir];
	} else if (typeof(redir) == "string") reader = termobj.file_objects[redir];
	else if (typeof(redir) == "object") {
		if (redir.r_op == "<<" || redir.r_op == "<<<") {
			let arr = redir.here_doc || redir.redir_arg;
//			if (arr.length == 1 && isstr(arr[0])) arr = (arr[0].split("\n")).reverse();
			let lines = [];
if (arr._explicit_newlines===true){
let s = "";
for (let val of arr){
if (val==="\n"){
if (s) lines.push(s);
s="";
continue;
}
//HDKEUND
if (if_get_val)s=val.valueOf()+s;
else s=val.toString()+s;
}
if (s) lines.push(s);
}
else{
			for (let i = 0; i < arr.length; i++) {
				if (isstr(arr[i])) {
					if (if_get_val) lines[i] = arr[i].valueOf();
					else lines[i] = arr[i].toString();
				}
				else if (isarr(arr[i])) lines[i] = arr[i].join("");
			}
}
			if (if_get_only) {
				let HereReader = function(lines_arg) {
					this.readline = cb => {
						if (!lines_arg.length) cb(EOF);
						else cb(lines_arg.pop());
					};
					this.lines = cb => {
						cb(lines_arg);
					};
				};
				return new HereReader(lines.reverse());
			}
			cb({
				't': "lines",
				'lines': lines
			});
			return;
		} else cwarn("HOHOHO REDIRRRR????????");
	}

	if (reader && reader.read) {
		if (reader.read.is_terminal && global_term_reader) {
			reader = global_term_reader;
			reader.update_pipewrite_cb = true;
		}
		if (in_back && reader.stdin_reader) {
			let job = check_job_id(in_back);
			if (!job) return make_ret(1, "Read error:no job #" + in_back);
			let JobReader = function() {
				this.is_job = true;
				this.readline = cb => {
					job._.service.set_stdin_cb(cb);
				};
				this.job = job;
			};
			return new JobReader();
		}
		if (if_get_only) {
			let _reader = reader.read;
			return _reader;
		}
		if (reader.set_parser) {
			reader.set_parser(shell_obj);
			is_stdin = true;
		}
		let arr = [];

		const done=()=>{
			cb({
				't': "lines",
				'lines': arr.reverse()
			});
		};
		let do_lines = null;
		if (num_lines_arg) do_lines = num_lines_arg;
		let line_iter = -1;

		const do_read_line=()=>{
			if (is_stdin) {
				if (!if_no_br) respbr(true);
			}
			line_iter++;
			if (do_lines && line_iter == do_lines) {
				if (shell_obj.stdin) shell_obj.stdin = null;
				done();
				return;
			}
			reader.read.line(str => {
				if (str == null) {
					done();
					return;
				}
				if (typeof(str) == "string") {
					arr.unshift(str);
				} else if (typeof(str) == "object") {
					if (str.length != undefined) {
						for (let i = 0; i < str.length; i++) arr.push(str[i]);
					} else {
						if (str['t'] || is_eof(str)) {
							cb(str);
							return;
						} else if (str instanceof Blob) {
							cb(str);
							return;
						} else cwarn("What is this?", str);
					}
				}
				if (reader.read.peek) {
					reader.read.peek(ret => {
						if (ret) do_read_line();
						else done();
					});
				} else if (is_stdin) do_read_line();
				else done();
			}, is_stdin);
		};
		do_read_line();
	} else return reader;
}
const sys_write = arg => {
	let str = arg.ARG0,
		which = arg.ARG1,
		pipe_arr = arg.ARG2,
		redir = arg.ARG3,
		PIPES = arg.ARG4,
		if_get_only = arg.ARG5,
		if_ch_only = arg.ARG6,
		sync_cb = arg.SYNCCB || arg.ARG7,
		write_cb = arg.ARG8,
		if_clear = arg.ARG9,
		in_back = arg.ARG10 || in_background_script,
		force_nl = arg.FORCELINE,
		if_nonl = arg.NONL,
		pipenum = arg.PIPENUM,
		comname = arg.COMNAME;
	if (in_back) {
		if (isnum(in_back) && !check_job_id(in_back)) return;
	} else if (file_done) return;
	let _writer;
	let writer;
	let which_pipe;

	const clog=(str)=>{
		if (str.EOF) return;
		log(str);
	};

	const handle_write=(strarg, if_char, colobj)=>{
		if (strarg.toString() == "") {
			strarg = "\x00";
		}
		if (if_com_sub && writer.stdout_writer) {
			stdout_capture.push(strarg);
			write_cb();
		} else {
			if (if_char) {
				writer.write.ch(strarg, if_clear, colobj);
				write_cb();
			} else {
				writer.write.line(strarg, true, write_cb, {
					CLEAR: if_clear,
					NONL: if_nonl,
					FORCELINE: force_nl
				});
				if (sync_cb) writer.write.sync(sync_cb);
			}
		}
	};

	const handle_write_lines=(arrarg, colors, row_args, timeout, cb)=>{
		if (if_com_sub && writer.stdout_writer) {
			let tmp = stdout_capture.concat(arrarg);
			stdout_capture = tmp;
			write_cb();
		} else {
			if (writer.write.is_pipe) {
				if (isarr(arrarg)) writer.write.lines(arrarg);
				else writer.write.line(arrarg);
			}
			else {
				writer.write.lines(arrarg, colors, row_args, timeout, cb, write_cb, if_clear);
			}
			if (sync_cb) writer.write.sync(sync_cb);
		}
	};

	const handle_write_blob=(blob)=>{
		if (!writer.write.blob) {
			cerr("sys_write():handle_write_blob():writer.write does not have an blob method!");
			log(blob);
			return;
		}
		if (if_com_sub && writer.stdout_writer) stdout_capture.push(blob);
		else writer.write.blob(blob, true, write_cb, if_clear, if_nonl);
		
		write_cb();
	};

	const handle_write_object=(obj)=>{
		if (!writer.write.object) {
			cerr("sys_write():handle_write_object():writer.write does not have an object method!");
			return;
		}
		if (if_com_sub && writer.stdout_writer) stdout_capture.push(obj);
		else writer.write.object(obj, true, write_cb, if_clear, if_nonl);
		
		write_cb();
	};
	if (cancelled) return make_ret(1);
	if (!write_cb) {
		write_cb = () => {}
	}
	if (pipe_arr) {
		which_pipe = pipe_arr[which];
	}
	if (redir == true) return make_ret(0);
	if (redir == undefined) {
		if (typeof(which_pipe) == "number") {
			_writer = PIPES[which_pipe];
		} else _writer = FILES[which];
	} else if (typeof(redir) == "number") {
		if (typeof(which_pipe) == "number") _writer = PIPES[which_pipe];
		else _writer = FILES[redir];
	} else if (typeof(redir) == "string") _writer = termobj.file_objects[redir];
	else {
		cwarn("sys_write():WHAT TYPPA REDIR?");
		log(redir);
	}
	if (!_writer) {
		cerr("Write error 1");
		return make_ret(1, "Write error 1");
	}
	if (_writer.write && _writer.write.is_terminal && global_term_writer) {
		_writer = global_term_writer;
		_writer.set_unnatural_state();
	}
	if (in_back && _writer.stdout_writer) {
		let job = check_job_id(in_back);
		if (!job) return make_ret(1, "Write error:no job #" + in_back);
		let job_exports = job._.service.exports;
		writer = {
			stdout_writer: true
		};
		writer.write = {
			blob: clog,
			ch: clog,
			line: arg => {
				job_exports.stdout(arg);
			},
			lines: arg => {
				job_exports.stdout(arg);
			},
			object: arg => {
				job_exports.stdout(arg);
			}
		}
	} else writer = _writer;
	if (if_get_only) return writer.write;
	if (writer) {
		if (writer.write) {
			if (force_nl && str === "\n") str = "";
//			if (!if_com_sub && typeof(str) == "string" && str.match(/\n/)) {
			if (!if_com_sub && isstr(str) && str.match(/\n/)) {
				let arr = str.split("\n");
				if (arr[arr.length - 1] == "") arr.pop();
				str = {
					't': "lines",
					'lines': arr
				};
			}
			if (str == null) {
				if (writer.write.clear) writer.write.clear();
			} else if (isobj(str)) {
				let _typ = str.t;
				if (_typ == "lines") {
					let arr = str.lines;
					if (str.rev) handle_write_lines(arr.reverse());
					else handle_write_lines(arr, str.colors, str.rowargs, str.timer, str.cb);
				} else if (_typ == "blob") handle_write_blob(str.blob);
				else if (_typ == "char") handle_write(str.char, true);
				else if (_typ == "line") handle_write(str.line, null, str.colors);
				else if (_typ == "object") {
					if (writer.write.object) handle_write_object(str.object);
					else handle_write(str.object.toString());
				} else handle_write(str);
			} else handle_write(str);
			return make_ret(0);
		} else if (writer instanceof Function) {
			writer(str);
			return make_ret(0);
		}
		cwarn("sys_write():WHAT KINDA WRITER???");
		log(writer);
	}
	return make_ret(1, "Write error 2");
}

const do_red = async (com, redir_arr, cbarg, background_id) => {
	function check_fd_num(str) {
		var num = parseInt(str);
		if (num >= 0 && num <= 2047) return num;
		return null;
	}
	if (!com.redir) {
		if (com.length) cbarg(com[0]);
		return;
	}
	let optok = com.redir.shift();
	if (optok) {
		let have_and = null;
		let rop = optok.r_op;
		if (rop == "<<" || rop == "<<<") {
			redir_arr[0] = optok;
			do_red(com, redir_arr, cbarg);
			return;
		}
		let ftok = optok.redir_arg;
		let edit_lines = optok.edit_lines;
		if (rop[rop.length - 1] == "&") {
			rop = rop.slice(0, rop.length - 1);
			have_and = true;
		}
		let fdstr = optok.fd;
		let fdnum;
		let rederr = str => {
			com.error_message = str;
			do_red(com, redir_arr, cbarg);
		};
		if (fdstr) {
			fdnum = check_fd_num(fdstr);
			if (fdnum == null) return rederr(fdnum + ":Bad file descriptor");
		}
		let fname = "";
		let doit = () => {//«
			if (rop == "<" || rop == ">" || rop == ">>" || rop == "<>") {
				let rflag, aflag, wflag, usefd;
				if (rop == "<") {
					rflag = true;
					if (!fdstr) fdnum = 0
				} else if (rop.match(/>/)) {
					wflag = true;
					if (rop == ">>") aflag = true;
					if (!fdstr) fdnum = 1;
				}
//				if (wflag && fname.match(/\.__LINK__$/)){
				if (wflag && globals.LINK_RE.test(fname)){
					com.error_message = `${fname}:\x20Cannot write to '${globals.LINK_EXT}' extension`;
					do_red(com, redir_arr, cbarg);
					return;
				}
				if (have_and) {
					let fdnum2;
					if (fname.match(/^[0-9]+$/)) {
						let fdnum2 = parseInt(fname);
						if (fdnum2 >= 0 && FILES[fdnum2]) {
							if (redir_arr[fdnum2] != undefined) redir_arr[fdnum] = redir_arr[fdnum2];
							else redir_arr[fdnum] = fdnum2;
							do_red(com, redir_arr, cbarg);
							return;
						}
						else {
							com.error_message = fname + ":Bad file descriptor";
							do_red(com, redir_arr, cbarg);
							return;
						}
					}
				} else {
					let getfobj = () => {
						let use_termobj = termobj;
						if (background_id) {
							let job = check_job_id(background_id);
							if (!job) {
								let mess = "No job:" + background_id;
								com.error_message = mess;
								cbarg(null, mess);
								return;
							}
							use_termobj = job._;
						}
						fs.get_term_fobj(use_termobj, cur_dir, fname, {
							read: rflag,
							write: wflag,
							append: aflag
						}, ret => {
							if (ret) {
								if (typeof(ret) == "string") {
									com.error_message = ret;
									cbarg(null, ret);
									return;
								} else {
									if (ret == true) redir_arr[fdnum] = true;
									else {
										termobj.file_objects[ret.UKEY] = ret.FOBJ;
										redir_arr[fdnum] = ret.UKEY;
									}
									do_red(com, redir_arr, cbarg);
								}
								return;
							} else {
								com.error_message = fname + ":\x20No such file or directory";
								cbarg();
							}
						}, is_root, {
							getvar: get_var_str
						});
					};
					ptw(fname, ret => {
						if (!ret) {
							getfobj();
							return;
						}
						let ukey = filekey(ret);
						if (termobj.file_objects[ukey]) {
							let fobj = termobj.file_objects[ukey];
							if (rop == ">") {
								if (fobj.set_buffer) fobj.set_buffer([], edit_lines);
								if (fobj.seek) fobj.seek.start();
							}
							redir_arr[fdnum] = ukey;
							do_red(com, redir_arr, cbarg);
							return;
						}
						else getfobj();
						
					});
				}
			} else cwarn("What redir?", rop);
		};//»
//		all_expansions(ftok, ret => {
		let ret = await all_expansions(ftok);
		if (!ret) {
			com.error_message = "Could not expand the redirection argument";
			do_red(com, redir_arr, cbarg);
			return;
		}
		let bad = false;
		for (let tok of ret) {
			if (isstr(tok)) fname += tok;
			else if (isobj(tok)) {
				if (tok.t == "word") fname += tok.word;
				else bad = true;
			}
			else bad = true;
		}
		if (!bad) return doit();
		com.error_message = "There was a problem with expanding the redirection argument";
		do_red(com, redir_arr, cbarg);
//		});
	} else {
		com.redir = redir_arr;
		cbarg();
		return;
	}
}

//»

//Execute Helpers: Expansions/Subs/Vars«

const fileglob = (arr, cb) => {
	const get_file_and_dir_from_str = str => {
		let arr, fname;
		arr = str.split("\/");
		fname = arr.pop();
		let realdir = "";
		if (arr.length) realdir = arr.join("/") + "/";
		if (str.match(/^\x2f/)) {
			return [arr.join("\/"), fname, realdir];
		} else {
			let dirstr = cur_dir + "/" + arr.join("\/");
			return [dirstr.replace(/^\/+/, "/"), fname, realdir];
		}
	};
	let noglob = get_var_str("NOGLOB");
	let dircache = {};
	let ret = [];
	let i = -1;
	const doglob = () => {
		let gotdir = null;
		let realdir;
		let fstr, dirstr;
		const dodir = () => {
			if (gotdir && gotdir.length) {
				let fpat;
				let marr;
				if (fstr.match(/[*?]/)) fpat = fstr.replace(/\*/g, ".*").replace(/\?/g, ".");
				else if (fstr.match(/\[[a-zA-Z0-9]+\]/)) fpat = fstr;
				if (fpat) {
					let re = new RegExp("^" + fpat + "$");
					let gothit = null;
					for (let j = 0; j < gotdir.length; j++) {
						let name = gotdir[j];
						if (name.match(/^\.+$/)) continue;
						if (re.exec(name)) {
							if (!ret.length) ret.push({
								t: "word",
								word: realdir + name
							}, " ");
							else ret.push(realdir + name, " ");
							gothit = true;
						}
					}
					if (!gothit) ret.push(arr[i]);
					doglob();
				} else {
					ret.push(arr[i]);
					doglob();
				}
			} else doglob();
		};
		i++;
		if (i == arr.length) {
			cb(ret);
			return;
		}
		let tryword = arr[i];
		if (!tryword){
			cb(ret);
			return;
		}
		if (arr[i].word) tryword = arr[i].word;
		if (typeof tryword == "string" && tryword.match(/[*?\[]/)) {
			if (noglob) {
				ret.push(tryword);
				doglob();
				return;
			}
			let farr = get_file_and_dir_from_str(tryword);
			dirstr = farr[0];
			fstr = farr[1];
			realdir = farr[2];
			if (dircache[dirstr]) {
				gotdir = dircache[dirstr];
				dodir();
			} else {
				path_to_obj(dirstr, ret => {
					if (ret && ret.KIDS) {
						if (!ret.done) {
							fs.popdir(ret, kids => {
								if (kids) {
									gotdir = getkeys(kids).sort();
									dircache[dirstr] = gotdir;
									dodir();
								} else dodir();
							});
						} else {
							gotdir = getkeys(ret.KIDS).sort();
							dircache[dirstr] = gotdir;
							dodir();
						}
					} else dodir();
				});
			}
		} else if (typeof arr[i] == "string" || arr[i].quote_string) {
			ret.push(arr[i]);
			doglob();
		} else {
			ret.push(arr[i]);
			doglob();
		}
	};
	doglob();
}
const obj_to_string=obj=>{let type=typeof(obj);if(isnum(obj)|| isstr(obj))return(obj+"");else if(isobj(obj)&& obj['t']){let newobj=obj[obj['t']];let objtype=typeof(newobj);if(objtype=="number" || objtype=="string")return(obj[obj['t']]+"");else if(objtype=="object"){if(newobj['t']=="quote_string"){return newobj['quote_string'];}else if(newobj.length !=undefined){return({'t':"lines",'lines':newobj});}else{log("WHAT KIND IN OBJ_TO_STRING");return "";}} }else{cwarn("Unknown kind in IN OBJ_TO_STRING:",obj);jlog(obj);return;}}
//const assign_all_vars = (ass, _cb, if_tmp) => {
const assign_all_vars = (ass, if_tmp) => {
return new Promise((_cb, N)=>{
	let i = -1;
	const doass = async() => {
		i++;
		if (i == ass.length) {
			_cb();
			return;
		}
		let ass_str = ass[i].word;
		let all_toks = ass[i].all_toks;
		let match_arr = ass_str.match(/^(.*?)=(.*)$/);
		let ass_tok = match_arr[1];
		let ass_val = tilde_replace(match_arr[2]);
		let marr;
		if (all_toks && all_toks[0]) {
//			all_expansions(all_toks, ret => {
			let ret = await all_expansions(all_toks);
			let setval;
			if (isarr(ret)) setval = ret.join("\n");
			else {
				throw new Error("assign_all_vars():\x20No array from all expansions!");
			}
			set_var_str(ass_tok, setval, null, if_tmp);
			doass();
//			});
		} else {
			let marr = ass_tok.match(/^([_a-zA-Z][_a-zA-Z0-9]*)(\[([_a-zA-Z0-9]+)\])?$/);
			let sub = marr[3];
			if (sub) {
				if (sub.match(/^[0-9]/)) {
					if (sub.match(/[^0-9]/)) {
						sh_error(sub + ":\x20invalid array subscript");
						_cb();
						return;
					}
					set_arr_val(marr[1], parseInt(sub), ass_val, if_tmp);
				} else set_obj_val(marr[1], marr[3], ass_val, if_tmp);
			} else set_var_str(ass_tok, ass_val, null, if_tmp);
			doass();
		}
	};
	doass();
});
}
const set_arr_val=(name,sub,val,if_tmp)=>{var use_env=var_env;if(if_tmp)use_env=tmp_env;use_env[name]=[];use_env[name][sub]=val;}
const set_obj_val=(name,sub,val,if_tmp)=>{let use_env=var_env;if(if_tmp)use_env=tmp_env;let obj=use_env[name];if(typeof obj=="object" && obj.length==undefined){}else use_env[name]={};use_env[name][sub]=val;}
const set_var_str = (str, val, if_sys, if_tmp) => {
	let use_env = var_env;
	if (if_tmp) use_env = tmp_env;
	if (!if_sys && constant_vars[str]) {
		sys_abort = true;
		sh_error("attempted to assign to the constant:" + str);
		return "";
	}
	use_env[str] = val;
}
const get_arr_val=(name,sub)=>{if(typeof(tmp_env[name])=="object" && tmp_env[name].length !=undefined){var gotval=tmp_env[name][sub];if(!gotval)return "";return gotval;}else if(typeof(var_env[name])=="object" && var_env[name].length !=undefined){var gotval=var_env[name][sub];if(!gotval)return "";return gotval;}return "";}
const get_obj_val=(name,sub)=>{if(typeof(tmp_env[name])=="object" && tmp_env[name].length==undefined){let gotval=tmp_env[name][sub];if(!gotval)return "";return gotval;}else if(typeof(var_env[name])=="object" && var_env[name].length==undefined){let gotval=var_env[name][sub];if(!gotval)return "";return gotval;}return "";}
const get_var_str = val => {
	if (typeof(tmp_env[val]) == "string") {
		return tmp_env[val];
	} else if (typeof(var_env[val]) == "string") {
		return var_env[val];
	}
	return "";
}
const check_fd_num=str=>{let num=parseInt(str);if(num>=0 && num<=2047)return num;return null;}
const math_calc = (math_arr, math_resolve_cb) => {
	const domath = () => {
		let use_env = var_env;
		if (par_env) use_env = par_env;
		mathmod.parse_shell_math(use_env, get_var_str, math_arr, math_resolve_cb);
	};
	if (!mathmod) {
		Core.load_mod("util.math", ret => {
			if (!ret) {
				math_resolve_cb(null, "Could not load the math module");
				return
			}
			mathmod = new NS.mods["util.math"](Core);
			globals.math = mathmod;
			domath();
			if (typeof ret === "string") Core.do_update(`mods.util.math`, ret);
		});
	} else domath();
}

const tilde_replace=str=>{if(str=="~")return "/home/"+termobj.ENV.USER;else if(str.match(/^~\x2f/))return str.replace(/^~/,"/home/"+termobj.ENV.USER);return str;}
const tilde_expansion=tok=>{if(!tok.t=="word")return;tok.word=tilde_replace(tok.word);}

//const all_expansions = (main_arr_arg, exp_cb, opts) => {
const all_expansions = (main_arr_arg, opts) => {
return new Promise((exp_cb,N)=>{

	if (!opts) opts = {};
	let if_no_brace_exp = opts.NOBRACE;
	let if_array_sub = opts.ARRAYSUB;
	let if_heredoc = opts.HEREDOC;
	let if_herestr = opts.HERESTR;
	let ret = [];
	let last_num = null;
	let this_num = null;
	let curnum = 0;
	let arr_arg;
	if (if_no_brace_exp) arr_arg = main_arr_arg;
	else arr_arg = brace_expansion_init(main_arr_arg);
	const next = if_no_set => {
		if (!if_no_set) last_num = this_num;
		if (arr_arg.length) handle_expansion(arr_arg.shift());
		else {
			for (let i = 0; i < ret.length; i++) {
				if (ret[i] === "") {
					ret.splice(i, 1);
					i--;
				}
			}
			let yoom = 0;
			for (let i = 0; i < ret.length; i++) {
				yoom++;
				if (yoom == 10000) {
					cerr("Infinite loop!");
					break;
				}
/*
				if (isstr(ret[i]) && isstr(ret[i + 1])) {
					ret[i] += ret[i + 1];
					ret.splice(i + 1, 1);
					i--;
				}
*/
			}
			if (if_heredoc || if_herestr) {
				return (exp_cb(ret));
			}
			fileglob(ret, globs => {
				if (!globs[0]) exp_cb(globs);
				else {
					let gotret = [];
					for (let i = 0; i < globs.length; i++) {
//						if (globs[i].t == "blank" || globs[i] == " ") {} else {
						if (globs[i].t == "blank" || globs[i].toString() == " ") {} else {
							let tok = globs[i];
							let str = "";
							let tokj;
							if (typeof tok == "string") str = tok;
							else if (typeof tok == "object" && tok.t == "quote_string") {
								str = new String(tok.quote_string);
								str.is_quote = true;
							}
							let nexttok = globs[i + 1];
							if (str && (typeof nexttok == "string" || (typeof nexttok == "object" && nexttok.t == "quote_string"))) {
								let j = i + 1;
								for (; tokj = globs[j]; j++) {
									if (tokj && (tokj == " " || tokj.t == "blank")) {
										if (str) gotret.push(str);
										str = "";
										i = j;
										break;
									} else {
										if (typeof tokj == "string") str += tokj;
										else if (typeof tokj == "object" && tokj.t == "quote_string") {
											str += tokj.quote_string;
											str = new String(str);
											str.is_quote = true;
										} else {
											if (str) gotret.push(str);
											str = "";
											gotret.push(tokj);
											i = j + 1;
											break;
										}
									}
								}
								if (str) {
									gotret.push(str);
									i = j + 1;
								}
							} else {
								if (str) gotret.push(str);
								else gotret.push(tok);
							}
						}
					}
					exp_cb(gotret);
				}
			});
		}
	};
	const handle_expansion = tok => {
		if (isstr(tok)) tok = {
			t: "word",
			word: tok
		};
		let type = tok.t;
		this_num = tok.tok_num;
		tok.tok_num = curnum;
		curnum++;
		if (type == "sub") {
			let subt = tok.sub_t;
			if (subt == "math") {
				get_math_val(tok.sub, math_ret => {
					let last_ret = ret[ret.length - 1];
					if (this_num && last_num && ((last_num + 1) == this_num) && (ret.length > 1) && typeof last_ret == "string") ret.push(ret.pop() + math_ret);
					else ret.push(math_ret + "");
					next();
				});
			} else if (subt == "com") {
				handle_com_tok(tok, com_ret => {
					if (isarr(com_ret)) {
						com_ret = chomp_eof(com_ret);
						if (if_heredoc) ret.push(...com_ret);
						else {
							if (com_ret.length) {
								for (let rt of com_ret) ret.push(rt, " ");
								ret.pop();
							}
						}
					} else if (isnum(com_ret)) cwarn("com_ret returned:" + com_ret);
					else if (is_eof(com_ret)) ret.push(EOF);
					else sh_error("all_expansions:got com_ret of type:" + (typeof com_ret));
					next();
				});
			} else if (subt == "var") {
				let gotval = var_subs(tok.sub, if_array_sub, tok.ln);
				if (gotval != null) {
					if (if_array_sub || (typeof gotval == "object" && gotval.length != undefined && (!(gotval instanceof String)))) {
//						if (gotval instanceof String) ret.push(gotval);
//						else ret.push({'t': "group_ret",'group_ret': gotval});
						ret.push({'t': "group_ret",'group_ret': gotval});
					}
					else {
						if (typeof gotval === 'string') gotval = gotval.split("\n").join(" ");
						else if (gotval instanceof String) {
//log(gotval.valueOf());

						}
//						if (isstr(gotval)) gotval = gotval.split("\n").join(" ");
						else {
							cerr("gotval from var_subs !==string");
							log(gotval);
						}
//log("GOT",gotval);
//						if (if_heredoc) ret.push({t:"word",word:gotval});
//						else ret.push(gotval);
//log("HI",gotval);
						ret.push(gotval);
					}
				}
				next();
			} else if (subt == "param") {
				param_subs(tok.sub, param_ret => {
					if (param_ret != null) ret.push(param_ret);
					next();
				});
			}
		} else if (if_heredoc) {
			ret.push(tok);
			next();
			return;
		}
		if (type == "blank") {
			ret.push(tok);
			next();
		} else if (type == "esc") {
//TSPOIKRBH
if (tok.esc === "\x20"){
if (ret.length && isstr(ret[ret.length-1]))
ret[ret.length-1]+=" ";
}
			else ret.push(tok.esc);
			next();
		} else if (type == "word") {
			tilde_expansion(tok);
			if (!ret.length) ret.push(tok);
			else ret.push(tok['word']);
			next();
		} else if (type == "string" || type == "r_op") {
			ret.push(tok);
			next();
		} else if (type == "quote") {
			resolve_quote(tok, (func_ret, bq_ret) => {
				if (bq_ret) {
					if (isarr(bq_ret)) {
						bq_ret = chomp_eof(bq_ret);
						if (bq_ret.length) {
							for (let rt of bq_ret) ret.push(rt, " ");
							ret.pop();
						}
					} else if (isnum(bq_ret)) cwarn("bq_ret returned:" + bq_ret);
					else {
						cwarn("All_expansions():GOT bq_ret of type:" + (typeof bq_ret));
						log(bq_ret);
					}
				} else {
					if (!iseof(func_ret)) ret.push(func_ret);
				}
				next();
			});
		} else if (tok.nl) next();
		else if (type == "group") {
			let groupt = tok.group_t;
			if (groupt == "math") {
				get_math_val(tok.group, math_ret => {
					ret.push({
						't': "group_ret",
						'group_ret': math_ret
					});
					next();
				});
			} else if (groupt == "subshell") {
				ret.push({
					't': 'subshell_group',
					'subshell_group': tok.group,
					'redirects': tok.redirects,
					'assigns': tok.assigns
				});
				next();
			} else if (groupt == "shell") {
				ret.push({
					't': 'shell_group',
					'shell_group': tok.group,
					'redirects': tok.redirects,
					'assigns': tok.assigns
				});
				next();
			}
		} else if (type != "sub") {
			cerr("All_expansions():WHAT TOK TYPE");
			log(tok);
		}
	};
	next();
});
}

const reescape=arr=>{for(let i=0;i<arr.length;i++){let tok=arr[i];if(tok.esc)arr[i]=tok.esc;}for(let i=0;i<arr.length;i++){if(arr[i]=="\\"){if(arr[i+1]){let obj={"t":"esc","esc":arr[i+1]};arr[i]=obj;arr.splice(i+1,1);i--;}} }for(let i=0;i<arr.length;i++){let tok=arr[i];if(tok.esc)arr[i]=tok.esc;}return arr;};
const flatten_chars=arrarg=>{for(let i=0;i<arrarg.length;i++){let arri=arrarg[i];let word="";let newarr=[];for(let j=0;j<arri.length;j++){if(typeof(arri[j])=="string" && arri[j]!=" ")word+=arri[j];else{if(word){newarr.push(word);word="";}newarr.push(arri[j]);}if(j+1==arri.length && word){if(word)newarr.push(word);arrarg[i]=newarr;}} }return arrarg;};
const renumber=(arr,leave_spaces,start_num)=>{let num=0;if(start_num)num=start_num;let ret=[];let obj;for(let i=0;i<arr.length;i++){let tok=arr[i];if(tok==" "){if(leave_spaces)ret.push(" ");}else{if(typeof(tok)=="string")tok={'t':"word","word":tok};else if(typeof(tok)=="object")tok=JSON.parse(JSON.stringify(tok));tok['tok_num']=num;ret.push(tok);}num++;}return ret;}
const resolve_quote = (tok, cb) => {
	const ascii_escapes_ = arr => {
		const next_chars = (pos, limit, type) => {
			let str = "";
			let j;
			for (let i = pos, j = 0; j < limit; i++, j++) {
				let ch = arr[i];
				if (!ch || !ch.match) return [j, str];
				if (type == "oct") {
					if (ch.match(/[0-7]/)) str = str + ch;
					else return [j, str];
				} else if (type == "hex")
					if (ch.match(/[0-9a-fA-F]/)) str = str + ch;
					else return [j, str];
			}
			return [j, str];
		};
		const codes = {
			'a': 7,
			'b': 8,
			'e': 27,
			'E': 27,
			'f': 12,
			'n': 10,
			'r': 13,
			't': 9,
			'v': 11,
			'"': 34,
			"'": 39,
			"\\": 92
		};
		let ret = [];
		for (let i = 0; i < arr.length; i++) {
			let ch = arr[i];
			let esc = ch.esc;
			if (esc) {
				let arr1 = arr[i + 1];
				let arr2 = arr[i + 2];
				if ((esc == "x" || esc == "u" || esc == "U") && arr1.match && arr1.match(/[0-9a-fA-F]/)) {
					let donum;
					if (esc == "x") donum = 2;
					else if (esc == "u") donum = 4;
					else donum = 8;
					let chars = next_chars(i + 1, donum, "hex");
					let str = chars.pop();
					i += (chars.pop());
					let gotint = parseInt(str, 16);
					if (gotint != 0) ret.push(String.fromCharCode(gotint));
					else return ret.join("");
				} else if (esc == "c" && arr1.match && arr1.match(/[a-zA-Z\[\\\]^_]/)) {
					let donum;
					if (arr1.match(/[a-z]/)) donum = (arr1.charCodeAt()) - 96;
					else donum = arr1.charCodeAt() - 64;
					i += 1;
					ret.push(String.fromCharCode(donum));
				} else if (esc.match(/[0-7]/)) {
					let num = esc;
					let chars = next_chars(i + 1, 2, "oct");
					let str = num + chars.pop();
					i += (chars.pop());
					let gotint = parseInt(str, 8);
					if (gotint != 0) ret.push(String.fromCharCode(gotint));
					else return ret.join("");
				} else {
					let num = codes[esc];
					if (num) ret.push(String.fromCharCode(num));
					else {
						ret.push("\\");
						ret.push(esc);
					}
				}
			} else ret.push(ch);
		}
		return ret.join("");
	};
	let type = tok.quote_t;
	let quote = tok.quote;
	if (type == "'") {
		if (tok['$']) cb({
			't': "quote_string",
			'quote_string': ascii_escapes_(quote)
		});
		else cb({
			't': "quote_string",
			'quote_string': quote.join("")
		});
	} else if (type == '"') {
		resolve_double_quote(quote, ret => {
			cb(ret);
		});
	} else if (type == "\x60") {
		let did_return = false;
		run_script(toks_to_string(tok['quote'], true), retarr => {
			if (did_return) return;
			did_return = true;
			if (retarr) {
				if (retarr.length) {
					if (retarr.length == 1) {
						if (is_eof(retarr[0])) cb(EOF);
						else cb(null, retarr[0].split(/\x20+/));
					} else cb(null, retarr);
				} else cb(null, retarr);
			} else {
				cwarn("WHAT IN THE BQ RET:");
				jlog(retarr);
			}
		}, {
			COMSUB: true
		});
		return;
	} else cerr("WHAT KINDA QUOTE HERE:" + tok);
}
const coalesce=arr=>{for(let i=0;arr[i];i++){let tok=arr[i];if(tok==" "){arr.splice(i,1);i--;continue;}let t=tok.t;if(t=="word"){let word=tok.word;let last_num=tok.tok_num;while(arr[i+1] && arr[i+1].word &&(arr[i+1].tok_num==last_num+1)){last_num=arr[i+1].tok_num;word=word+arr[i+1].word;arr.splice(i+1,1);}arr[i].word=word;}}return arr;}
const brace_expansion=(toks,if_check_arg)=>{const expand=(preamble,postscript,arr,is_inner)=>{let elems=[[]];let elem_num=0;let word_arr;let cur_word="";let new_elems=[];let new_arr;for(let i=0;i<arr.length;i++){if(arr[i].t=="word"){if(arr[i].word.length>1){word_arr=arr[i].word.split("");for(let j=0;j<word_arr.length;j++)elems[elem_num].push(word_arr[j]);}else{if(arr[i].word==","){elem_num++;elems.push([]);}else elems[elem_num].push(arr[i].word);}}else elems[elem_num].push(arr[i]);}for(let i=0;i<elems.length;i++){let elem=elems[i];let cur_word="";new_elems[i]=[];for(let j=0;j<elem.length;j++){if(typeof(elem[j])=="string")cur_word=cur_word+elem[j];else{if(cur_word)new_elems[i].push({'t':"word",'word':cur_word});cur_word="";new_elems[i].push(elem[j]);}if((j+1==elem.length)&& cur_word)new_elems[i].push({'t':"word",'word':cur_word});}}if(is_inner)new_arr=[];else new_arr=[{'t':"blank",'blank':" "}];for(let i=0;i<new_elems.length;i++){for(let j=0;j<preamble.length;j++)new_arr.push(preamble[j]);for(let j=0;j<new_elems[i].length;j++)new_arr.push(new_elems[i][j]);for(let j=0;j<postscript.length;j++)new_arr.push(postscript[j]);if(is_inner)new_arr.push({'t':"word",'word':','});else new_arr.push({'t':"blank",'blank':" "});}if(is_inner)new_arr.pop();return new_arr;};const good_type=tok=>{if(tok.t=="word" || tok.t=="quote" || tok.t=="sub")return true;return false;};let have_open=null,prev_open=null,have_comma=null,depth,last_num,exp_arr,ret=[],start,start_num,check_arg_hold=null,marr;for(let i=0;i<toks.length;i++){let tok=toks[i];let type=tok.t;if(if_check_arg){if(!tok.start_here)continue;else{check_arg_hold=true;if_check_arg=null;}}if(tok.word=="{"){if(have_open)prev_open=have_open;have_open=tok;have_comma=null;exp_arr=[tok];depth=0;start=i;start_num=tok.tok_num;}else if(have_open){if(tok.word=="}"){let good_prev=null;let check_start_tok=null;if(tok.tok_num !=(last_num+1)){for(let j=0;j<exp_arr.length;j++)ret.push(exp_arr[j]);have_open=null;continue;}last_num=tok.tok_num;if(have_comma){if(prev_open){for(let j=i+1;toks[j];j++){if(toks[j].tok_num !=(last_num+1))break;let word=toks[j].word;if(word=="}"){good_prev=true;break;}else if(good_type(toks[j])){}else{if(toks[j+1])toks[j+1].start_here=true;check_start_tok=true;break;}last_num=toks[j].tok_num;}}exp_arr.shift();last_num=start_num;let preamble=[];let preamble_start=start;for(let j=start-1;toks[j];j--){if(good_type(toks[j])&&(toks[j].tok_num==last_num-1)){if(good_prev &&(toks[j].word=="," || toks[j].word=="{"))break;preamble.unshift(toks[j]);last_num=toks[j].tok_num;preamble_start=j;}else break;}let first_tok_num=last_num;last_num=tok.tok_num;let postscript=[];let postscript_end=i;for(let j=i+1;toks[j];j++){if(good_type(toks[j])&&(toks[j].tok_num==last_num+1)){if(good_prev &&(toks[j].word=="," || toks[j].word=="}"))break;postscript.push(toks[j]);last_num=toks[j].tok_num;postscript_end=j;}else break;}let diff=postscript_end-preamble_start;let new_arr=expand(preamble,postscript,exp_arr,good_prev);toks.splicein(new_arr,preamble_start,diff+1);toks=renumber(toks);if(check_arg_hold)check_start_tok=true;return{'ARR':toks,'IF_EXPAND':true,'CHECK_START':check_start_tok};}else{for(let j=0;j<exp_arr.length;j++)ret.push(exp_arr[j]);have_open=null;exp_arr=null;}}else if(good_type(tok)){if(tok.tok_num==last_num+1){if(type=="word" && tok.word.match(/,/)){have_comma=true;exp_arr.push(tok);}else if(type=="word" &&(marr=tok.word.match(/^(-?[0-9]+)\.\.(-?[0-9]+)(\.\.([0-9]+))?$/))){have_comma=true;let fromnum=parseInt(marr[1]);let tonum=parseInt(marr[2]);let incr=1;if(marr[4])incr=parseInt(marr[4]);if(tonum>=fromnum){for(let j=fromnum;j<=tonum;j+=incr){exp_arr.push(j+"");exp_arr.push({'t':"word",'word':","});}}else {for(let j=fromnum;j>=tonum;j-=incr){exp_arr.push(j+"");exp_arr.push({'t':"word",'word':","});}}exp_arr.pop();}else exp_arr.push(tok);}else{for(let j=0;j<exp_arr.length;j++)ret.push(exp_arr[j]);have_open=null;exp_arr=null;}} }else ret.push(tok);last_num=tok.tok_num;}return{'ARR':toks};}

const brace_expansion_init=arr=>{let ret;let did_expand=null;let check_start=false;while(true){ret=brace_expansion(arr,check_start);if(!ret['IF_EXPAND'])break;did_expand=true;arr=ret['ARR'];check_start=ret['CHECK_START'];}if(did_expand)arr=coalesce(arr);return arr;}

const all_sub_subs = async(tok, cb) => {
	let type = tok.sub_t;
	let sub = tok.sub;
	if (type == "param") {
		param_subs(sub, ret => {
			cb({
				'RET': true,
				'VAL': ret
			});
		});
	} else if (type == "math") {
		math_subs(sub, ret => {
			cb({
				'RET': true,
				'VAL': ret
			});
		});
	} else if (type == "com") {
//		all_expansions([tok], ret => {
		let ret = await all_expansions([tok]);
		if (isarr(ret) && ret.length == 1 && iseof(ret[0])) cb({});
		else cb({
			'RET': true,
			'VAL': ret
		});
//		});
	} else if (type == "var") {
		let gotval = var_subs(sub, null, tok.ln);
		if (gotval != null) cb({
			'RET': true,
			'VAL': gotval
		});
		else cb({
			'RET': false
		});
	} else cerr("ALL SUBS TYPE????" + type);
}

const resolve_double_quote = (arr, cb, if_from_bq) => {
	const next = () => {
		if (is_done) return;
		if (toks.length) handle_tok(toks.shift());
		else {
			is_done = true;
			cb({
				't': "quote_string",
				'quote_string': ret.join(""),
				'quote_arr': ret
			});
		}
	};
	let ret = [];
	let is_done = null;
	let got = parser.quote_strings([arr], true, global_com_name, main_com_str);
	let toks = parser.tokify(got, null, null, true);
	toks.pop();
	toks = parser.groupify(toks, {
		NAME: global_com_name,
		COM: main_com_str,
		QUOTE: true
	});
	if (!toks) return cb();
	const handle_tok = tok => {
		let type = tok.t || typeof(tok);
		if (type == "word") {
			let str = tok.word;
			ret.push(str);
			next();
		} else if (type == "ds" || type == "c_op" || type == "r_op") {
			ret.push(tok[type]);
			next();
		} else if (type == "string") {
			ret.push(tok);
			next();
		} else if (type == "quote") {
			if (tok.quote_t == "\x60") {
				if (if_from_bq) {
					bq_abort(cb, 2);
					return;
				} else {
					resolve_double_quote(tok['quote'], funcret => {
						if (funcret && funcret['t'] == "quote_string") {
							run_script(funcret['quote_string'], com_ret => {
								com_ret = chomp_eof(com_ret);
								if (com_ret.length) {
									for (let obj of com_ret) ret.push(obj, "\n");
									ret.pop();
								}
								next();
							}, {
								COMSUB: true
							});
						}
					}, true, null, null, 3);
				}
				return;
			} else cerr("OKAY,WE HAVE A QUOTE(NOT \x60...\x60)IN DOUBLE QUOTES.....");
		} else if (type == "sub") {
			let subt = tok.sub_t;
			if (subt == "param") {
				let gotstr = toks_to_string(tok.sub);
				let retstr = "";
				if (typeof gotstr == "string") retstr = var_subs(gotstr, null, tok.ln);
				ret.push(retstr);
				next();
			} else if (subt == "var") {
				ret.push(var_subs(tok.sub, null, tok.ln));
				next();
			} else if (subt == "math") {
				math_subs(tok.sub, funcret => {
					if (funcret) {
						if (funcret.t == "number") ret.push(funcret.number + "");
					}
					next();
				});
			} else if (subt == "com") {
				handle_com_tok(tok, com_ret => {
					if (isarr(com_ret)) {
						com_ret = chomp_eof(com_ret);
						if (com_ret.length) {
							for (let obj of com_ret) ret.push(obj, "\n");
							ret.pop();
						}
					} else if (is_eof(com_ret)) ret.push(EOF);
					else {
						log(com_ret);
						throw new Error("resolve_double_quote():WHAT THE HELL IN COM_RET???");
					}
					next();
				});
			}
		} else if (type == "group" && tok.subshell) {
			ret.push("(" + toks_to_string(tok.group, 1) + ")");
			next();
		} else {
			if (tok.t && tok[tok.t] && isstr(tok[tok.t])) {
				ret.push(tok[tok.t]);
				next();
			} else {
				cwarn('\nIn resolve_double_quote(),handle_tok(),we have unhandled:' + type + "\n");
				log(tok);
			}
		}
	};
	next();
}
const math_subs = (math_arr_arg, math_cb) => {
	const handle_math_expansion = async math_tok => {
		/*SHELLNOTES:6*/
		let mtype = math_tok.t || typeof(math_tok);
		if (mtype == "word") {
			math_ret.push(math_tok.word);
			math_next();
		} else if (mtype == "string") {
			math_ret.push(math_tok);
			math_next();
		} else if (mtype == "sub") {
			let msubt = math_tok.sub_t;
			if (msubt == "param") {
				cerr("Need a math sub param!");
			} else if (msubt == "math") {
				math_subs(math_tok.sub, funcret => {
					math_ret.push(funcret);
					math_next();
				});
			} else if (msubt == "com") {
//				all_expansions(math_tok.sub, funcret => {
				let funcret = await all_expansions(math_tok.sub);
				math_ret.push(funcret);
				math_next();
//				});
			} else if (msubt == "var") {
				math_ret.push(get_var_str(math_tok.sub));
				math_next();
			} else cwarn("Handle math sub type:" + msubt);
		} else if (mtype == "paren") {
			/*We need to get the number value of the given expression,which may include any number of sub groups*/
			cwarn("Got mtype=='paren'");
			jlog(math_tok);
		} else if (mtype == "quote") {
			if (math_tok.quote_t == "\x60") {
				cwarn("Got backquote in math_subs!");
				bq_abort(math_cb, 4);
				return;
			} else {
				cerr("Handle the quote in math_subs");
				jlog(math_tok);
			}
		} else if (mtype == "mparen") {
			cwarn("Got mtype=='mparen'");
			jlog(math_tok);
		} else if (mtype == "r_op") {
			math_ret.push(math_tok.r_op);
			math_next();
		} else if (mtype == "c_op") {
			math_ret.push(math_tok.c_op);
			math_next();
		} else math_cb(null, "Unexpected token in the math expression,type=" + mtype, true);
	};
	const math_next = () => {
		if (math_arr_arg.length) handle_math_expansion(math_arr_arg.shift());
		else math_calc(math_ret, math_cb);
	};
	let math_ret = [];
	let arr = parser.groupify(math_arr_arg, {
		NAME: global_com_name,
		COM: main_com_str,
		MATH: true
	});
	if (!arr) return math_cb();
	let grouparr = renumber(arr, 3);
	math_next();
};
const param_subs=(arr,cb)=>{if(arr.length==1){let obj=arr[0];if(obj['t']=="word"){let word=obj['word'];let marr;if(marr=word.match(/^#?([_a-zA-Z][_a-zA-Z0-9]*)(\[([_a-zA-Z0-9]+)\])?$/)){let say_length=false;if(word.match(/^#/))say_length=true;let main=marr[1];let sub=marr[3];if(!sub){let val=var_subs(main,null,word.ln);if(say_length)val=val.length+"";cb(val);}else{if(sub.match(/^[0-9]/)){if(!sub.match(/^[0-9]+$/)){sys_abort=true;sh_error("invalid subscript:"+sub);cb("");return;}else cb(get_arr_val(marr[1],parseInt(sub)));}else cb(get_obj_val(main,sub));}}else{sys_abort=true;sh_error("Not currently handling substitution pattern:\x20'"+word+"'");cb();}}else if(obj.nl===true){sys_abort=true;sh_error("${\n}"+":\x20bad substitution");cb();}else{sys_abort=true;sh_error("There was an error. Please check the console!");cerr("param_subs:What kind of obj is this?(not word or newline)");jlog(obj);cb();}}else{sys_abort=true;let str="${";for(let obj of arr){if(obj.nl)str+="\n";else if(obj[obj.t])str+=obj[obj.t];}str+="}";sh_error(str+":bad substitution");cb();}}

const var_subs = (str, if_array_sub, linenum) => {
	if (str.match(/^[0-9]+$/)) {
		let num = parseInt(str);
		if (global_args) {
			if (num == 0) {
				if (global_com_name) return global_com_name;
				else {
					cerr("\n\n\nNO GLOBAL COM NAME?!?!?!?!?\n\n\n");
					return;
				}
			} else if (global_args[num - 1]) return global_args[num - 1];
			else return "";
		} else {
			if (num == 0) return sh_name();
			else return "";
		}
	} else if (str == "#") {
		if (global_args) return global_args.length + "";
		else return 0 + "";
	} else if (str == "@" || str == "*") {
		if (global_args) return global_args.join(" ");
		else return "";
	}
	let use_env;
	if (!isnull(tmp_env[str])) use_env = tmp_env;
	else use_env = var_env;
	let marr;
	if (marr = str.match(/^([a-z_]+[a-z_0-9]*)\[(([0-9]+)([^0-9]+)?)\]/i)) {
		if (marr[4]) return sh_error(marr[2] + ":\x20invalid array subscript", true);
		let got = use_env[marr[1]];
		if (isarr(got)) {
			let val = got[parseInt(marr[3])];
			if (!val) return "";
			return val;
		}
		return "";
	} else if (marr = str.match(/^([a-z_]+)\[([a-z0-9_]+)\]/i)) {
		let got = use_env[marr[1]];
		if (isobj(got)) {
			let val = got[marr[2]];
			if (!val) return "";
			return val;
		}
		return "";
	}
	let gotval = use_env[str];
	if (isstr(gotval)) return gotval;
	else if (isnum(gotval)) return (gotval + "");
	else if (if_array_sub && isobj(gotval)) {
		if (gotval.length != undefined) return gotval;
		else return getkeys(gotval);
	} else if (isnull(gotval)) {
		if (str == "LINENO") {
			if (global_com_name) {
				if (!linenum) cwarn("var_subs:No linenum was passed in!");
				else return linenum + "";
			} else if (termobj.num_prompts) return (termobj.num_prompts) + "";
		}
	}
	return "";
}
const get_env_path=()=>{let path_str=get_var_str("PATH");if(!path_str)return [];return path_str.split(":");};
const get_math_val=(arr,cb)=>{let str=toks_to_string(arr,true);if(str===""||str===" ")return cb("0");math_subs(arr,(math_ret,errmess)=>{if(math_ret && math_ret['t']=="number")cb(math_ret['number']+"");else{sys_abort=true;if(errmess)sh_error(str+":\x20"+errmess,true);else sh_error(str+':\x20syntax error in expression',true);cb();}});};
const expand_tok = async(tok, cb, if_no_brace) => {
	let ret = await all_expansions([tok], {NOBRACE: if_no_brace});
	if (ret && ret[0]) cb(ret[0]);
	else cb();

/*
	all_expansions([tok], ret => {
		if (ret && ret[0]) cb(ret[0]);
		else cb();
	}, {
		NOBRACE: if_no_brace
	});
*/
};
const handle_com_tok = (tok, cb, if_quoted) => {
	let com_str = toks_to_string(tok.sub, true);
	let ret = [];
	let did_return = false;
	run_script(com_str, retarr => {
		if (did_return) return;
		did_return = true;
		if (retarr) {
			if (retarr.length) {
				if (retarr.length == 1) {
					if (is_eof(retarr[0])) cb(EOF);
					else cb(retarr[0].split(/\x20+/));
				} else cb(retarr);
			} else cb(retarr);
		} else if (isnum(retarr)) {
			cwarn("handle_com_tok():returned number:" + retarr);
		} else {
			cerr("handle_com_tok():got no ret");
			jlog(retarr);
		}
	}, {
		COMSUB: true
	});
};

//»

const execute=(arr)=>{//«

return new Promise((execute_cb, N)=>{

const execute_end = (retval, if_sys_abort, which, bg_id) => {//«
	if (if_sys_abort) sys_abort = true;
	if (!termobj.initialized) initialize_term();
	let sync_err = null;
	const done = fobjs => {
		if (if_com_sub) {
			if (!stdout_capture.length && retval) stdout_capture = [""];
			execute_cb([stdout_capture, sys_abort, bg_id]);
		} else {
			if (!retval && sync_err) retval = 4;
			execute_cb([retval, sys_abort, bg_id]);
		}
	};
	sync_files((err_arr, succ_arr) => {
		if (err_arr) {
			sync_err = true;
			for (let i = 0; i < err_arr.length; i++) sys_error(err_arr[i]);
		} else if (succ_arr) {
			for (let i = 0; i < succ_arr.length; i++) sys_error(succ_arr[i]);
		}
		done();
	}, bg_id);
}//»

const handle_op=async(obj, arg_vals_arg, next_arg_cb, in_background, if_need_or)=>{//«

//jlog(obj);
let opcode = obj.t;
let do_exe_end = null;
if (obj.is_shell_func) do_exe_end = true;
let args = obj[opcode];
let arg_vals = [];

//const resolve_arg = (arg, cb, in_background, if_need_or) => {
const resolve_arg = (arg, in_background, if_need_or, prom_cb) => {//«
	if (cancelled || sys_abort) {
		if (use_return_val != null) execute_end(use_return_val, true, 1, in_background);
		else execute_end(1, true, 2, in_background);
		return;
	}
	return new Promise((Y,N)=>{
		let cb = prom_cb || Y;
		const next_arg = async(if_end, if_need_or) => {
			if (if_end) args = [];
			if (in_background && opcode == "loglist") {
				if (!check_job_id(in_background)) return;
			}
			await resolve_arg(args.shift(), in_background, if_need_or, cb);
		};
		if (!arg) {
			cb(arg_vals);
//			Y(arg_vals);
			return;
		}
		handle_op(arg, arg_vals, next_arg, in_background, if_need_or);
	});
};//»

if (opcode == "file") {//«
	let fileret= await resolve_arg(args.shift());
	let retval = fileret.pop();
	execute_end(retval, null, 3, in_background);
	return;
}//»
else if (opcode == "c_op") {//«
	if (obj.c_op == "nl" || obj.c_op == ";") {
		arg_vals_arg.push(args);
		if (next_arg_cb) next_arg_cb();
	} else {
		log(obj);
		cwarn("UNEXPECTED C_OP IN HANDLE_OP!!!!");
		sh_error("syntax error near unexpected token:" + tok_to_string(obj), true);
		if (next_arg_cb) next_arg_cb();
	}
	return;
}//»
else if (opcode == "com") { //«
//jlog(obj);
	let heredoc = null;
	let herestring = null;
	let com0 = obj.com[0];
	let use_redir;
	if (obj.com.length == 1 && com0.t == "group" && com0.redirects) use_redir = com0.redirects;
	else use_redir = obj.redirects;
	for (let i = 0; i < use_redir.length; i++) {
		let redir = use_redir[i];
		if (redir.here_doc && !redir.quoted) {
			heredoc = redir.here_doc;
			break;
		} else if (redir.r_op == "<<<") herestring = redir.redir_arg;
	}
	const docom = async() => {//«
		if (!par_env) tmp_env = {};
		else tmp_env = JSON.parse(JSON.stringify(par_env));
//		all_expansions(args, ret => {
		let ret = await all_expansions(args);
		if (sys_abort) {
			if (next_arg_cb) next_arg_cb(true);
			else cerr("no next_arg_cb");
			return;
		} /*SHELLNOTES:2*/
		arg_vals_arg.push({
			't': "com",
			'com': ret,
			'redir': use_redir,
			'pin': obj.pipe_in,
			'pout': obj.pipe_out,
			'perr': obj.pipe_err
		});
		if (ret) {
			let is_tmp;
			if (ret.length) {
				if (ret.length == 1 && isnull(ret[0])) is_tmp = false;
				else is_tmp = true;
			} else is_tmp = false;
//			assign_all_vars(obj.assigns, () => {
			await assign_all_vars(obj.assigns, is_tmp);
			if (next_arg_cb) next_arg_cb();
//			}, is_tmp);
		} else if (next_arg_cb) next_arg_cb();
//		});
		return;
	}; //»
/* HEREDOCS DO NOT HAVE INTERNAL QUOTING,BECAUSE THE DELIMITER __IS__ THE QUOTE. WE CAN HAVE A MIXTURE OF WORDS,NL's,AND STRINGS RETURNED FROM SHELL COMMAND CAPTURE.  [{nl:true},{t:"word","word":"Snoot"},"Food","Yord","Munk",{"EOF":true}{nl:true},{t:"word","word":"111"},{t:"word","word":"222"},] */
	const here_exp_to_arr = (arr, if_doc) => {//«
		const err = str => {
			throw new Error("here_exp_to_arr():" + str);
		};
		let out = [];
		let str = "";
		for (let tok of arr) {
			if (isstr(tok)) {
				if (if_doc) {
					if (str) {
						out.unshift(str.replace(/\n$/,""));
						str = "";
					}
					out.unshift(tok);
				} else str += tok + " ";
			} else if (isobj(tok)) {
				if (tok.nl === true || tok.word==="\n") {
					if (str) {
						out.unshift(str.replace(/\n$/,""));
						str = "";
					}
					if (if_doc)	out.unshift("\n");

				}
				else if (tok.word) {
					str += tok.word;
				}
				else if (tok.blank) str += " ";
				else if (!isnull(tok.quote_string)) {
					if (!tok.quote_arr) {
						let arr = tok.quote_string.split("\n");
						for (let ln of arr) out.unshift(ln);
					} else {
						for (let t of tok.quote_arr) {
//							if (isstr(t)) str += t;
							if (isstr(t)) str += t.toString();
							else if (t === nlobj) {
								if (str) {
//									out.unshift(str);
									out.unshift(str.replace(/\n$/,""));
									str = "";
								}
							} else {
								err("In quote_arr,have a non string and non nlobj");
								log(t);
							}
						}
					}
				}
				else if (tok.quote){
					let str = tok.quote.join("");
					if (tok.quote_t=="'") str = `"${str}"`;
					else if (tok.quote_t=='"') str = `'${str}'`;
					else{
						err("What kind of quote is this?");
					}
					out.unshift(str);
				}
				else if (tok === EOF) {} else {
					let typ = tok.t;
					if (typ && isstr(tok[typ])) str += tok[typ];
					else err("What kind of obj is this token thing???");
				}
			} else {
				log(tok);
				err("What kind of tok(not str || obj)");
			}
		}
		if (str) {
			out.unshift(str.replace(/\n$/,""));
		}
		return out;
	};//»
	if (heredoc) {
		let ret = await all_expansions(heredoc,{NOBRACE: true,HEREDOC: true});
		let out = here_exp_to_arr(ret, true);
		out._explicit_newlines = true;
		for (let i = 0; i < use_redir.length; i++) {
			let redir = use_redir[i];
			if (redir.r_op == "<<") {
				redir.here_doc = out;
				break;
			}
		}
		docom();
	} else if (herestring) {
		let ret = await all_expansions(herestring,{NOBRACE: true,HERESTR: true})
		for (let i = 0; i < ret.length; i++) {
			if (ret[i] === " ") {
				ret.splice(i, 1);
				i--;
			}
		}
		let out = here_exp_to_arr(ret, true);
		for (let i = 0; i < use_redir.length; i++) {
			let redir = use_redir[i];
			if (redir.r_op == "<<<") {
				redir.redir_arg = out;
				break;
			}
		}
		docom();
	} else docom();
	return;
}//»
else if (opcode == "pipeline") {//«
//	if (in_script_loop === false) {
//	if (next_arg_cb) next_arg_cb();
//	return;
//	}
	let log_arg = null;
	let log_tok = obj.list_op;
	let have_not = obj.not;
	if (log_tok) log_arg = log_tok.c_op;
	if (if_need_or){
		if (log_arg=="&&") {
			if (next_arg_cb) next_arg_cb(null,true);
		}
		else if (log_arg=="||") {
			if (next_arg_cb) next_arg_cb();
		}
		else if (next_arg_cb) next_arg_cb();
		return;
	}

	let coms = await resolve_arg(args.shift(), in_background);
//	resolve_arg(args.shift(), coms => {
	let PIPES = [];
	let iter = 0;
	let com_iter = 0;
	const do_not = obj => {//«
		if (obj['SUCC'] && obj['VAL'] == 0) return {
			'SUCC': null,
			'VAL': 1
		};
		return {
			'SUCC': true,
			'VAL': 0
		};
	};//»
	const execute_pipeline_command = (com, cb, pipenum, initcb) => { //«
		//On the first call to this(which is the end of the pipeline chain,there is only a cb. 
		//All other calls only have a callback that "pipes in" to the previous call
		//(which is later in the pipeline chain). call_com does not wait to start things up. 
		//It should return a function that actually calls the command and itself returns the 
		//pipein_cb. This function then goes into the com object,which opcode=="com" calls.
		if (in_background) {
			if (isnum(in_background) && !check_job_id(in_background)) return;
		} else if (file_done) return;
		let did_cb = false;
//		return call_com(com, PIPES, ret => {
		call_com(com, PIPES, initcb, ret => {
			if (cb) {
				if (did_cb) return;
				if (halt_on_fail && ret.SUCC !== true) return;
				cb(ret);
				did_cb = true;
			}
		}, in_background, pipenum);
	};//»
	const connect_pipes = async() => { //«
		for (let i = 1; i < coms.length; i++) {
			let pnum = i - 1; //pnum==Pipe number
			let prevcom = coms[i - 1];
			let thiscom = coms[i];
			PIPES[pnum] = new PipeObj();
			if (i == 1) prevcom.pipes = [];
			prevcom.pipes[1] = pnum; //Previous command's stdout
			if (prevcom.perr) prevcom.pipes[2] = pnum; //Previous command's stderr
			thiscom.pipes = [pnum]; //This command's stdin @ pos 0
		}
		if (typeof(coms[0]) == "number") {
			cwarn("we have a number in coms[0],what does it really mean???", coms[0]);
			arg_vals_arg[0] = coms[0];
			if (next_arg_cb) next_arg_cb();
			return;
		} 

		let com = coms.pop();
		let INITCB;
		let cur_pipein_cb;
		let PROM;
		if (coms.length) {
			PROM = new Promise((Y,N)=>{
				INITCB = (rv)=>{
					cur_pipein_cb = rv;
					Y()
				}
			});
		}
//		let cur_pipein_cb = execute_pipeline_command(com, ret => {
		execute_pipeline_command(com, ret => {
			let if_done = null;
			let if_need_or = null;
			if (have_not) ret = do_not(ret);
			if (log_arg != null) {
				if (log_arg == "||" && ret.VAL != 0 && ret.VAL !== EOF){}
				else if(log_arg == "&&" && (ret.VAL == 0 || ret.VAL === EOF)){
				} 
				else {
					if (log_arg=="&&") if_need_or = true;
					else if_done = true;
				}
			}
			if (ret) arg_vals_arg[0] = ret.VAL;
			if (next_arg_cb) next_arg_cb(if_done, if_need_or);
		}, coms.length, INITCB);
		if (!PROM) return;
		await PROM;
		while (coms.length) {
			PIPES[coms.length - 1].set_pipewrite_cb(cur_pipein_cb, true);
			com = coms.pop();
			PROM = new Promise((Y,N)=>{
				INITCB = (rv)=>{
					cur_pipein_cb = rv;
					Y()
				}
			});
			execute_pipeline_command(com, null, coms.length, INITCB);
			await PROM;
		}
	};//»
	const com_reds = err => {//«
		const com_name_from_com = com => {
			if (com['t'] == "com") {
				let arr = com['com'];
				if (typeof(arr) == "object" && arr.length != undefined) {
					if (arr.length == 0) return {
						'NAME': "none",
						'ARGC': 1
					};
					else {
						if (!arr[0]) return {
							'NAME': "",
							'ARGC': arr.length
						};
						let str = toks_to_string(arr);
						if (!str) return {
							'NAME': "",
							'ARGC': arr.length
						};
						else return {
							'NAME': str,
							'ARGC': arr.length
						};
					}
				}
				if (arr[0] && arr[0]['t'] == "word") return {
					'NAME': arr[0]['word'],
					'ARGC': arr.length
				};
			} else if (com.length && typeof(com[0] == "number")) return com[0];
			return null;
		};
		if (err) sh_error(err, 1);
		let redir_arr = [];
		let com = coms[com_iter];
		com_iter++;
		if (com) { /*Filter out all non normal coms*/
			let retobj = com_name_from_com(com);
			if (typeof(retobj) == "number") {
				com_reds();
				return;
			} else if (retobj && retobj['NAME'].toString() == "exec") {
				if (retobj['ARGC'] != 1) {
					com_reds("Not handling exec with ARGC !=1");
					return;
				} else {
					com_reds();
					return;
				}
			}
		}
		if (com) do_red(com, redir_arr, com_reds, in_background);
		else connect_pipes();
	};//»
	com_reds();
//	}, in_background);

	return;
}//»
else if (opcode == "loglist") {//«
	if (obj.list_op && obj.list_op.c_op == "&") {
		let str = "";
		for (let pipeobj of obj.loglist) {
			for (let comobj of pipeobj.pipeline) str += toks_to_string(comobj.com, 1);
			if (pipeobj.list_op) str += " " + pipeobj.list_op.c_op + " ";
		}
		str = str + " &";
/*
		let jobid = Core.register_job(str.regstr());
		sys_write({
			ARG0: "[" + jobid + "]",
			ARG1: 2
		});
*/
//		resolve_arg(args.shift(), funcret => {
//			Core.unregister_job(jobid);
//		}, jobid);
//		});
		let funcret = await resolve_arg(args.shift());
		arg_vals_arg.push(0);
		if (next_arg_cb) next_arg_cb();
	} else {
		let funcret = await resolve_arg(args.shift());
//		resolve_arg(args.shift(), funcret => {
		arg_vals_arg.push(funcret.pop());
		if (next_arg_cb) next_arg_cb();
//		});
	}
	return;
}//»
else if (opcode == "list") {//«

	let funcret = await resolve_arg(args.shift());
//	resolve_arg(args.shift(), funcret => {
	let retval = funcret.pop();
	arg_vals_arg.push(retval);
	if (do_exe_end) execute_end(retval, null, 4, in_background);
	else if (next_arg_cb) next_arg_cb();
//	});
	return;
}//»

//else if(opcode=="word"){arg_vals_arg.push(args);if(next_arg_cb)next_arg_cb();return;}

if (!args) {
	if (typeof(obj) == "string") {
		arg_vals_arg.push(obj);
		if (next_arg_cb) next_arg_cb();
	} else {
		jlog(obj);
		sh_error("parse error:abort");
		ENV['?'] = 3;
		if (next_arg_cb) next_arg_cb();
		return;
	}
}

const use_cb = funcret => {
	if (funcret != undefined) arg_vals_arg.push(funcret);
	if (next_arg_cb) next_arg_cb();
};
if (args) {
	if (args.shift) await resolve_arg(args.shift(), use_cb);
	else if (use_cb) use_cb();
}
cerr("handle_op: got tok",opcode);
if (opcode=="c_op") return;
cerr("handle_op(): unknown opcode: " + opcode);

}//»

handle_op(arr.shift(), []);


});
}//»

const call_com=(comarg, PIPES, PIPE_INIT, cb, inback, pipenum)=>{//«

let shell_exports;

if (inback && !in_background_script) kill_register = cb=>{Core.set_job_cb(inback, cb);}

let arr = comarg.com;
let redir = comarg.redir;
let pipe_arr = comarg.pipes;
let cur_com_name = null;
let comword;
let getopts;

/*If we are expecting piped input, we MUST set this*/
//let pipein_cb = null;


//Util«

const istty=()=>{return global_com_name == null;}
const isscript=()=>{return global_com_name != null;}
const failnoopts=(args)=>{let ret=get_options(args);if(ret[1].length){cberr(cur_com_name+":\x20there are no options in this version");return;}return ret;}

const _get_options = (args, com, opts) => {
	const getlong = opt => {
		let re = new RegExp("^" + opt);
		let numhits = 0;
		let okkey;
		for (let k of lkeys) {
			if (re.exec(k)) {
				numhits++;
				okkey = k;
			}
		}
		if (!numhits) {
			err.push(com + ":\x20unexpected option:\x20'" + opt + "'");
			return null;
		} else if (numhits == 1) return okkey;
		else {
			err.push(com + ":\x20option:\x20'" + opt + "' has multiple hits");
			return null;
		}
	};
	if (!opts) opts = {};
	let err = [];
	let sopts = opts.SHORT || opts.s;
	let lopts = opts.LONG || opts.l;
	let getall = opts.ALL;
	let obj = {};
	let arg_start = null;
	let arg_end = null;
	let arg1, arg2;
	let marr;
	let ch;
	let ret;
	if (!sopts) sopts = {};
	if (!lopts) lopts = {};
	let lkeys = getkeys(lopts);
	let iter = 0;
	for (let i = 0; i < args.length;) {
		iter++;
		if (iter == 1000) {
			throw new Error("Infinite loop in Util.get_options!!!!!!!!!!!!");
		}
		if (isobj(args[i])) {
			i++;
			continue;
		}
		if (args[i].toString() == "--") {
			args.splice(i, 1);
			return [obj, err];
		}
		else if (marr = args[i].match(/^-([a-zA-Z][a-zA-Z]+)$/)) {
			let arr = marr[1].split("");
			for (let j = 0; j < arr.length; j++) {
				ch = arr[j];
//				if (sopts[ch] === 2 || sopts[ch] === 3) {
				if (!getall && (sopts[ch] === 2 || sopts[ch] === 3)) {
					if (i === 0) obj[ch] = arr.slice(1).join("");
					else err.push(com + ":\x20option:\x20'" + ch + "' requires args");
				}
				else if (getall || sopts[ch] === 1) obj[ch] = true;
				else if (!sopts[ch]) err.push(com + ":\x20unexpected option:\x20'" + ch + "'");
				else err.push(com + ":\x20option:\x20'" + ch + "' has an unexpected option definition:\x20" + sopts[ch]);
			}
			args.splice(i, 1);
		}
		else if (marr = args[i].match(/^-([a-zA-Z])$/)) {
			ch = marr[1];
			if (getall){
				if (!args[i + 1]) err.push(com + ":\x20option:\x20'" + ch + "' requires an arg");
				obj[ch] = args[i + 1];
				args.splice(i, 2);
			}
			else if (!sopts[ch]) {
				err.push(com + ":\x20unexpected option:\x20'" + ch + "'");
				args.splice(i, 1);
			} else if (sopts[ch] === 1) {
				obj[ch] = true;
				args.splice(i, 1);
			} else if (sopts[ch] === 2) {
				err.push(com + ":\x20option:\x20'" + ch + "' is an optional arg");
				args.splice(i, 1);
			} else if (sopts[ch] === 3) {
				if (!args[i + 1]) err.push(com + ":\x20option:\x20'" + ch + "' requires an arg");
				obj[ch] = args[i + 1];
				args.splice(i, 2);
			} else {
				err.push(com + ":\x20option:\x20'" + ch + "' has an unexpected option definition:\x20" + sopts[ch]);
				args.splice(i, 1);
			}
		} else if (marr = args[i].match(/^--([a-zA-Z][-a-zA-Z]+)=(.+)$/)) {
			if (getall || (ret = getlong(marr[1]))) {
				if (getall) ret = marr[1];
				obj[ret] = marr[2];
			}
			args.splice(i, 1);
		} else if (marr = args[i].match(/^--([a-zA-Z][-a-zA-Z]+)=$/)) {
			if (getall || (ret = getlong(marr[1]))) {
				if (getall) ret = marr[1];
				obj[ret] = args[i + 1];
				if (args[i + 1]) args.splice(i + 1, 2);
				else args.splice(i, 1);
			} else args.splice(i, 1);
		} else if (marr = args[i].match(/^--([a-zA-Z][-a-zA-Z]+)$/)) {
			if (getall || (ret = getlong(marr[1]))) {
				if (getall) ret = marr[1];
				if (getall || (lopts[marr[1]] === 1 || lopts[marr[1]] === 2)) obj[ret] = true;
				else if (lopts[marr[1]] === 3) err.push(com + ":\x20long option:\x20'" + marr[1] + "' requires an arg");
				else if (lopts[marr[1]]) err.push(com + ":\x20long option:\x20'" + marr[1] + "' has an unexpected option definition:" + lopts[marr[1]]);
				else if (!lopts[marr[1]]) err.push(com + ":\x20unexpected long option:\x20'" + marr[1]);
				args.splice(i, 1);
			} else args.splice(i, 1);
		} else i++;
	}
	return [obj, err];
}

const get_options=(args, opts)=>{return _get_options(args, comword, opts);}
getopts = get_options;
const failopts=(args,obj)=>{let ret=getopts(args,obj);if(ret[1].length){werrarr(ret[1]);refresh();cberr();return false;}return ret[0];}

const getwinargopts=(args)=>{//«
	let sws = failopts(args, {
		LONG: {
			force: 1,
			fullscreen :1,
			source: 1
		},
		SHORT: {
			s: 1,
			f: 1,
			x: 3,
			y: 3,
			w: 3,
			h: 3
		}
	});
	if (!sws) return;
	let wid = sws.w;
	let hgt = sws.h;
	let xarg = sws.x;
	let yarg = sws.y;
	let fullscreen = sws.fullscreen;
	let usex, usey, usew, useh;
	if (fullscreen) {
		if (xarg || yarg || wid || hgt) return cberr("Fullscreen defined with geometry params");
	}
	else {
		if (xarg) {
			usex = xarg.pi();
			if (!NUM(usex)) return cberr("Bad x");
		}
		if (yarg) {
			usey = yarg.pi();
			if (!NUM(usey)) return cberr("Bad y");
		}
		if (wid) {
			usew = wid.ppi();
			if (!NUM(usew)) return cberr("Bad w");
		}
		if (hgt) {
			useh = hgt.ppi();
			if (!NUM(useh)) return cberr("Bad h");
		}
	}
	 return {
		SOURCE:(sws.source||sws.s),
		FORCE:(sws.force||sws.f),
		WINARGS: {
			FULLSCREEN: fullscreen,
			X: usex,
			Y: usey,
			WID: usew,
			HGT: useh
		}
	}
};//»

const check_pipe_writer=()=>{let ret=get_writer();return(ret && ret.is_pipe);}
const get_writer=()=>{return sys_write({ARG1:1,ARG2:pipe_arr,ARG3:get_redir(redir,1),ARG4:PIPES,ARG5:true,ARG10:inback,PIPENUM:pipenum});}
const get_reader = (if_get_val) => {
	return sys_read({
		ARG0: 0,
		ARG1: pipe_arr,
		ARG2: get_redir(redir, 0, pipenum),
		ARG3: PIPES,
		ARG4: cb,
		ARG6: true,
		ARG8: inback,
		PIPENUM: pipenum
	}, if_get_val);
}

//»
//Output«

const werrarr=arr=>{return wout(arr, {ARG1: "lines", ARG2: true});}
const wappout=(obj, type)=>{return wout(obj, {ARG1: type, ARG5: false});}
const wclerr=(obj, type, usecol)=>{return wout(obj, {ARG1: type, ARG2: true, ARG3: usecol, ARG5: true});}
const wclout=(obj, type, usecol)=>{return wout(obj, {ARG1: type, ARG3: usecol, ARG5: true});}
const woutarr=arr=>{return wout(arr, {ARG1: "lines"});}
const woutobj=obj=>{let which="object";if(obj instanceof Blob)which="blob";return wout(obj,{ARG1:which});}
const suse=(str,cbarg)=>{let usecb=cb;if(cbarg)usecb=cbarg;usecb(sys_error("Usage:"+cur_com_name+" "+str,null,get_redir(redir,2)));}
const serr=(str,cbarg,if_sys)=>{let usecb=cb;if(cbarg)usecb=cbarg;let usename=cur_com_name;if(if_sys)usename=sh_name();usecb(sys_error(fmt(usename+":\x20"+str),null,get_redir(redir,2)));}
const ssucc=(str,cbarg)=>{let usecb=cb;if(cbarg)usecb=cbarg;usecb(wout(cur_com_name+":"+str));}
const cbok=str=>{if(str)werr(str);wout(EOF);cb(ret_true());}
const cberr=str=>{if(str)werr(str);wout(EOF);cb(ret_false());}
const werr=(obj,type)=>{return wout(obj,{ARG1:type,ARG2:true});}
const wout = (obj, arg, if_no_refresh) => {
	if (!arg) arg = {};
	let type = arg.type||arg.ARG1,
		if_err = arg.error || arg.ARG2 || arg.ERR,
		col_obj = arg.color||arg.ARG3,
		row_args = arg.ARG4,
		if_clear = arg.ARG5,
		if_nonl = arg.NONL;
	let useobj = obj;
	let fd = 1;
	if (if_err) fd = 2;
	if (type) {
		let retobj = {
			t: type
		};
		if (col_obj) retobj.colors = col_obj;
		retobj[type] = obj;
		useobj = retobj;
	}
	else if (isstr(obj)&&col_obj){
		col_obj.unshift(obj.length);
		useobj = {t:"lines",lines:[obj], colors:[{"0":col_obj}]}
	}
	let ret = sys_write({
		ARG0: useobj,
		ARG1: fd,
		ARG2: pipe_arr,
		ARG3: get_redir(redir, fd),
		ARG4: PIPES,
		ARG9: if_clear,
		ARG10: inback,
		FORCELINE: arg.FORCELINE,
		NONL: if_nonl,
		PIPENUM: pipenum
	});
	if (!if_no_refresh) refresh();
	return ret;
}
const cbeof=_=>{cbok(EOF);};
const sherr=str=>{sys_abort = true;cb(sh_error(str,null,get_redir(redir, 2)));};

//»
//Reading«

const term_prompt = (promptarg, if_is_pass, cbarg) => {
	if (promptarg) {
		termobj.set_prompt(promptarg, {
			NOPUSH: 1,
			NOSCROLL: 1
		});
		refresh();
	}
	if (if_is_pass) termobj.set_password_mode();
//	sys_read({},null,true);
///*
	sys_read({
		ARG0: 0,
		ARG1: pipe_arr,
		ARG2: redir[0],
		ARG3: PIPES,
		ARG4: cbarg,
		ARG5: 1,
		ARG7: true,
		PIPENUM: pipenum
	},null, true);
//*/
}
const getLineInput=(promptarg, if_is_pass)=>{
	return new Promise((y,n)=>{
		term_prompt(promptarg, if_is_pass, rv =>{
//log(rv);
			if (rv &&rv.t=="lines"&&rv.lines.length==1) return y(rv.lines[0]);
			n("Unknown return value from term_prompt");
		});
	});
};
const read_stdin = (cb, opts={}) => {
//	let if_send_eof = opts.SENDEOF;
	let pipecb = null;
	let if_send_eof = true;
	let if_once = opts.ONCE;
	let use_prompt = opts.PROMPT||"";
	let use_fd = opts.FD;
	if (!isnum(use_fd)) use_fd = 0;
	let reader = get_reader(opts.GETVALUEOF);
	let is_done = false;
	let promptlen = 0;
	let kill_cb = null;
	if (opts.PROMPTLEN) promptlen = opts.PROMPTLEN;
	if (reader) {
		kill_register(_killcb => {
//			if (if_send_eof) cb(EOF);
			cb(EOF,true);
			if (kill_cb) kill_cb();
			if (_killcb) _killcb();
		});
		if (reader.is_terminal) {
			if (opts.NOTERMINAL){
				cb();
				return;
			}
			if (if_once) {
				respbr(true, true);
				termobj.set_prompt(use_prompt, {
					NOPUSH: 1,
					NOSCROLL: 1
				});
				refresh();
				sys_read({
					ARG0: use_fd,
					ARG1: pipe_arr,
					ARG2: redir[0],
					ARG3: PIPES,
					ARG4: (arr)=>{
						if (!(arr&&arr.lines)) return cb(EOF);
						cb(arr.lines[0]);
					},
					ARG5: 1,
					ARG7: true,
					PIPENUM: pipenum
				});
			} else {
				werr("(^D to send, ^C to quit)");
				termobj.init_app_mode("stdin", (ret) => {
					if (opts.BINARY) {
						let str = '';
						for (let i of ret) {
							str = str + i.charCodeAt().toString(16).padStart(2, "0") + " ";
						}
						cb(str);
					}
//Ignore the eof from the
//					else if (is_eof(ret)){}
					else cb(ret);
					termobj.response_end();
				}, (ret, last_str) => {
					if (last_str) cb(last_str);
					cb(EOF, true);
				}, use_prompt);
			}
		} else if (reader.is_job) {
			kill_cb = reader.job._.kill;
			reader.readline(ret => {
				if (!isstr(ret)) {
					if (ret && ret.lines && ret.lines.EOF) {} else cwarn("read_stdin(job):dropping", ret);
					return;
				}
				cb(ret);
			});
		} else if (reader.is_device) {
			reader.eventloop(ret => {
				let str;
				if (is_done) return;
				if (is_eof(ret)) {
					is_done = true;
					if (if_send_eof) cb(EOF);
					else cbok(EOF);
					return;
				}
				if (!ret) {
					cerr("read_stdin():got nothing value in reader.eventloop!");
					return;
				}
				if (opts.OBJOK) str = ret;
				else {
					if (!ret.toString) str = "[event(" + reader.self.name + ")]";
					else str = ret.toString();
				}
				cb(str);
				refresh();
			});
		} else if (reader.is_fifo) {
			reader.readline(ret => {
				if (is_eof(ret)) {
					is_done = true;
					if (if_send_eof) cb(EOF);
					else cbok(EOF);
					return;
				}
				cb(ret);
				refresh();
			});
		} else if (reader.lines) {
			reader.lines(ret => {
				cb(ret);
				if (if_send_eof) cb(EOF);
			});
		} else if (reader.is_pipe) {
//			pipein_cb = ret => {
			let pipecb = ret => {
				if (is_done) return;
				if (isarr(ret)) {
					if (ret.length == 1) cb(ret[0]);
					else cb(ret);
				} 
				else if (isstr(ret)) {
					if (ret === "\x00") return;
					cb(ret);
				}
				else if (isnum(ret)) {
					cb(ret);
				}
				else if (is_eof(ret)) {
					reader.pipe.done = true;
					is_done = true;
					if (if_send_eof) cb(EOF);
					return;
				}
				else if (isobj(ret)) cb(ret);
				else {
					cwarn("read_stdin():what in pipereader?");
					log(ret);
				}
				refresh();
			};
			if (reader.pipe.update_pipewrite_cb) {
				reader.pipe.unset_pipewrite_cb();
//				reader.pipe.set_pipewrite_cb(pipein_cb);
				reader.pipe.set_pipewrite_cb(pipecb);
				reader.tryline();
			}
			PIPE_INIT(pipecb);
		} else if (reader instanceof Function) {
			kill_cb = reader(ret => {
				if (isobj(ret) && ret.EOF) return;
				cb(ret);
			});
		} else {
			cberr("What kinda reader?");
		}
	} else cberr("read_stdin:No reader");
}

const read_file_args_or_stdin = (args, cb, opts={}) => { /*SHELLNOTES:8*/
	if (!(args && args.length)) return read_stdin(cb, opts);
	let allow_obj = opts.OBJOK;
	let iter = -1;
	let linebuf = [];
	let read_file_cb = null;
	kill_register(killcb => {
		cb(EOF, true);
		if (killcb) killcb();
	});
	const dofile = () => {
		iter++;
		if (iter >= args.length) {
			cb(EOF);
			return;
		}
		let fname = args[iter];
		const read_cb = (ret, fileargs, errargs) => {
			if (!ret && fileargs) return cb(null, fileargs);
			if (!ret && errargs) {
				cb(null, null, errargs);
				dofile();
				return
			} else if (!ret) return cb(ret);
			if (isobj(ret) && ret.EOF) {
				dofile();
				return;
			}
			if (isstr(ret)) ret = [ret];
			else if (isobj(ret)) {
//				if (allow_obj) ret = [ret];
//				else ret = [ret.toString()];
				ret = [ret];
			}
			if (isarr(ret)) cb(ret);
			else {
				if (ret instanceof Function) {
					cwarn("ret is a Function!");
					cb();
				} else {
					log(ret);
					throw new Error("read_file_args_or_stdin():WHAT IZ THISS?!?!?");
				}
			}
		};
		opts.exports = shell_exports;
		fs.read_file(fname, read_cb, opts);
	};
	dofile();
}
const com_cat = (args, opts) => {
	if (!opts) opts = {};
	opts.SENDEOF = true;
	let objok = opts.OBJOK;
	let doparse = opts.PARSE;
	let dostringify = opts.STRINGIFY;
	let iserr = opts.ISERR;
	let isbin = opts.BINARY;
	let wraplines = opts.WRAPLINES;
	let iter = 0;
	let error_flag = false;
	read_file_args_or_stdin(args, (ret, fname, errmess) => {
		if (isobj(ret) && ret.EOF) {
			if (error_flag) {
				wout(EOF);
				cberr();
			} else cbok(EOF);
			return;
		}
		if (errmess) {
			werr(errmess);
			refresh();
			return;
		}
		if (fname && opts.SETFNAME) set_var_str("CUR_FNAME", fname.split("/").pop());
		if (opts.ECHOTYPE) ret = util.typeof(ret);
		else if (opts.ECHOCTOR) {
			try {
				ret = ret.__proto__.constructor.name;
			} catch (e) {
				return;
			}
		}
		if (doparse) {
			if (!isstr(ret)) return;
			try {
				ret = JSON.parse(ret);
				if (isnum(ret)) ret = new Number(ret);
				else if (isbool(ret)) ret = new Boolean(ret);
			} catch (e) {
				ret = e.message;
			}
		}
		else if (dostringify){
			if (isobj(ret)) ret = JSON.stringify(ret, null,"  ");
			else if (isnum(ret)) ret = ret+"";
		}
		if (isstr(ret)) {
			if (opts.NUMBERLINES) ret = (++iter) + " " + ret;
			wout(ret, {
				FORCELINE: 1,
				ERR: iserr
			});
		}
		else if (isarr(ret)) {
			if (ret.length == 1 && isobj(ret[0]) && objok) {
				woutobj(ret[0]);
			} else {
				if (isbin) {
					if (ret.length > 0xffff) {
						werr("Refusing to perform binary conversion on length>" + 0xffff);
						error_flag = true;
						return;
					}
					let str = '0000  ';
					let i;
					let arr = [];
					for (i = 0; i < ret.length; i++) {
						if (i && (!(i % 20))) {
							arr.push(str);
							str = i.toString(16).padStart(4, "0") + "  ";
						}
						str = str + ret[i].toString(16).padStart(2, "0") + " ";
					}
					if (str) arr.push(str);
					wout(arr.join("\n"));
				} else {
					if (opts.NUMBERLINES) ret = Core.api.numberLines(ret);
					if (wraplines){
						let out = [];
						for (let ln of ret) out.push(...(wrap_line(ln).split("\n")));
						if (opts.COPY) capi.clipCopy(out.join("\n"));
						else woutarr(out);
					}
					else {
						if (opts.COPY) capi.clipCopy(ret.join("\n"));
						else woutarr(ret);
					}
				}
			}
		} else if (isobj(ret) && objok) woutobj(ret);
		else {
			if (!isnull(ret)) {
				cerr('cat:What have we got?');
				log(ret);
			}
			return;
		}
		refresh();
	}, opts);
}

//»
//Run scripts«

//RUNJSSCRIPT
const run_js_script=(str, name, argsarg, path)=>{
	let pref = `window[__OS_NS__].coms["${name}"]=function(Core,shell_exports,args){"use strict";const{cbok,cberr,wout,werr,wrap_line}=shell_exports;const{log,cwarn,cerr}=Core;const window=null;const document = null;const navigator=null;const capi=Core.api;`;
	let url = URL.createObjectURL(new Blob([pref + str + "}"], {
		type: "application/javascript"
	}));
	globals.blobs[url] = "." + name;
	let holderr = window.onerror;
window.onerror = e=>{
cberr(e);
window.onerror = holderr;
};
	Core.make_script(url, scr => {
		window.onerror = holderr;
		URL.revokeObjectURL(url);
		if (!NS.coms[name]) return;
		NS.coms[name].script = scr;
		try{
			NS.coms[name](Core, shell_exports, argsarg);
		}
		catch(e){
			cberr(e.message);
		}
	}, emess => {
		sherr("Could not load the script:" + path + (emess ? ":" + emess : ""));
	});
};
const run_something = (namearg, strarg, argsarg, tmp_env_arg, opts, path) => {
	let parobj = {
		GLOBAL_NAME: namearg,
		ARGS: argsarg,
		REDIR: redir,
		TMP_ENV: tmp_env_arg
	};
	let reader = get_reader();
	if (reader.is_pipe) parobj.TERM_READER = reader.pipe;
	let writer = get_writer();
	if (writer.is_pipe) parobj.TERM_WRITER = writer.pipe;
	if (path && strarg.match(/^#!js/)) {
		let usename = path.replace(/^\x2f/, "").replace(/\x2f/g, ".");
		if (NS.coms[usename]) {
			let nocache_str = get_var_str("NOCACHE_COMS");
			let nocache = false;
			if (nocache_str) {
				let arr = nocache_str.split(":");
				if (arr.includes(path)) nocache = true;
			}
			if (nocache) NS.coms[usename].script.del();
			else return NS.coms[usename](Core, shell_exports, argsarg);
		}
		let arr = strarg.split("\n");
		arr.shift();
		run_js_script(arr.join("\n"), argsarg, usename, path);
		return;
	}
	run_script(strarg, retval => {
		if (writer.is_pipe) writer.pipe.set_natural_state();
		wout(EOF);
		cb(make_ret(retval));
	}, {
		COMSUB: if_com_sub,
		PAROBJ: parobj,
		INBACK: inback || in_background_script,
		INGROUP: opts.INGROUP,
		INFUNC: opts.INFUNC
	});
};

const run_bin = async(obj)=>{
	let compath = obj.fullpath.replace(/\x2f/g,".").slice(1);
	let com = NS.coms[compath];
	if (!com){
		await capi.loadCom(compath);
		com = NS.coms[compath];
	}
	else werr("Using cache...");
	com(arr, Core, shell_exports);
};

const run_command = path => {
	const notfound = () => {
		sh_error(comword + ":\x20command not found", null, get_redir(redir, 2), 127);
		wout(EOF);
		cb(ret_false(127));
	};
	if (!path) return notfound();
	let strarg;
	const dobash = () => {
		run_something(comword, strarg, arr, JSON.parse(JSON.stringify(tmp_env)), {}, path);
	};
	const detect_type = () => {
		let com;
		let err;
		let line1 = strarg.split(/\n/)[0];
		if (line1.match(/^#!/)) {
			let marr = line1.match(/^#!([a-z]+)/);
			if (marr && marr[1]) com = marr[1];
		} else com = "sh";
		if (com === "sh" || com === "js") dobash();
		else {
			if (com) err = com + ":\x20Invalid interpreter";
			else err = "No interpreter given";
			cb(sh_error(err, null, get_redir(redir, 2)));
		}
	};
	ptw(normpath(path), obj => {
		if (!obj) return notfound();
		let type = obj.root.TYPE;
		if (type == "fs") {
			gettextfile(path, ret => {
				if (isstr(ret)) {
					strarg = ret;
					detect_type();
				} else notfound();
			});
		}
		else if (type=="bin") run_bin(obj);
		else notfound();
	});
};
shell_obj.run_command=run_command;

const lookup_file = async () => {
	const notfound = () => {
if (FS_COMS.includes(comword)){
wout(fmt_lines(`\nThe '${comword}' command is not a shell builtin! It exists in the 'fs' command library. You can import it into the shell's execution context like this:\n\n$ import fs\n\nAlternatively, run the following command to automate the import process:\n\n$ echo 'import fs' >> ~/.bashrc\n\xa0`));
cberr();
return;
}
		sh_error(comword + ":\x20command not found", null, get_redir(redir, 2), 127);
		wout(EOF);
		cb(ret_false(127));
	};
	const runit = async (path, obj) => {
		if (obj.APP === FOLDER_APP) throw new Error();
		let typ = obj.root.TYPE;
		if (typ=="bin") run_bin(obj);
		else if (typ == "fs") {
			let rv = await fsapi.readHtml5File(path);
			run_something(comword, rv, arr, JSON.parse(JSON.stringify(tmp_env)), {}, path);
		} else {
			cberr(path + ":\x20not\x20(yet)\x20running type: "+typ);
		}
	};
	let path_arr = get_env_path();
	let found = false;
	for (let p of path_arr) {
		let fullpath = normpath(p + "/" + comword);
		try {
			await fsapi.pathToNode(fullpath).then(o => runit(fullpath, o));
			return;
		} catch (e) {}
	}
	notfound();
};

//»

const com_ls=(args, cbarg)=>{//«
	let outarr=null;
	if (cbarg) outarr=[];
//	const _wout = wout;
	const _wout = (arg, obj)=>{
		if (!arg) return;
		if (!outarr)  return wout(arg, obj);
		if (typeof arg==='string') outarr.push(arg);
		else if (typeof arg==='object' && arg.length) outarr=outarr.concat(...arg);
	};
	let usecbok = cbarg||cbok;
	let usew = termobj.w - 1;
	if (if_com_sub) usew = null;
	let dir_str;
	let sws = failopts(args, {
		SHORT: {
			d: 1,
			h: 1,
			f: 1,
			a: 1,
			l: 1,
			p: 1,
			R: 1,
			s: 1
		},
		LONG: {
			silent: 1,
			dbview: 1,
			hash: 1,
			"force-get": 1,
			all: 1,
			long: 1,
			"add-slash-to-dir": 1,
			json: 1
		}
	});
	if (!sws) return;
	let silent = sws.silent || sws.s;
	let islong = null;
	let addslashes = false;
	let get_all = null;
	let forceget;
	let recurse = sws.R;
	let if_hash = !!(sws.hash || sws.h);
	let dbview = !!(sws.dbview || sws.d);
	if (sws.f) forceget = true;
	if (sws.all || sws.a) get_all = true;
	if (sws.long || sws.l) islong = true;
	if (sws["add-slash-to_dir"] || sws.p) addslashes = true;
	let have_slash = false;
	if (args[0] && args[0].match(/\/$/)) have_slash = true;
	let no_deref = false;
	if (islong && !have_slash) no_deref = true;
	let getonly = null;
	let newlinemode = check_pipe_writer();
	let nextdirs;
	let isjson = sws.json;
	let json_ret;
	if (isjson) json_ret = [];
	const dodirs = dirargs => {
		let getlink;
		let is_multiple = false;
		let iter = -1;
		let len = dirargs.length;
		if (len > 1) is_multiple = true;
		let errout = [];
		let filekids = {};
		let dirlinesout = [];
		let dirnamesout = [];
		let dircolsout = [];
		nextdirs = null;
		if (islong) getlink = true;
		if (len == 0) getlink = false;
		const doend = () => {
			if (silent) return usecbok();
			if (isjson) {
				if (nextdirs) return dodirs(nextdirs);
				_wout(JSON.stringify(json_ret, null, " "));
				usecbok();
				return;
			}
			let useret = 0;
			if (errout.length) {
				werrarr(errout);
				useret = 2;
			}
			let allcols = [];
			let alllines = [];
			let cur_line = 0;
			for (let i = 0; i < dirlinesout.length; i++) {
				let colarr = dircolsout[i];
				if (!colarr) colarr = [];
				let linearr = dirlinesout[i];
				let name = dirnamesout[i];
				if (name) {
					alllines.push(name);
					cur_line++;
				}
				for (let i = 0; i < linearr.length; i++) {
					let num = i + cur_line;
					allcols[num] = colarr[i];
					alllines[num] = linearr[i];
				}
				if (i + 1 < dirlinesout.length) {
					alllines.push("  ");
					cur_line++;
				}
				cur_line += linearr.length;
			}
			if (if_com_sub || newlinemode) woutarr(alllines);
			else _wout(alllines, {
				ARG1: "lines",
				ARG3: allcols
			});
			if (nextdirs) {
				_wout(" ");
				return dodirs(nextdirs);
			}
			if (outarr) return usecbok(outarr);
			usecbok();
		};
		const getlist = (kidsarg, patharg, cb) => {
			if (recurse) {
				for (let k of getkeys(kidsarg)) {
					if (k == "." || k == "..") continue;
					let kid = kidsarg[k];
					if (kid.APP == FOLDER_APP) {
						if (!nextdirs) nextdirs = [];
						nextdirs.push(objpath(kid));
					}
				}
			}
			fs.get_obj_listing(kidsarg, usew, (ret, err, colret) => {
				if (isjson) {
					json_ret.push([patharg, ret]);
					cb();
					return;
				}
				if (err) errout.push(err);
				else {
					if (patharg) {
						patharg += ":";
						dirnamesout.push(patharg);
						dirlinesout.push(ret);
						dircolsout.push(colret);
					} else {
						dirnamesout.unshift(patharg);
						dirlinesout.unshift(ret);
						dircolsout.unshift(colret);
					}
				}
				cb();
			}, {
				ifhash: if_hash,
				isjson: isjson,
				isroot: is_root,
				islong: islong,
				getonly: getonly,
				addslashes: addslashes,
				getall: get_all,
				forceget: forceget,
				newlinemode: newlinemode
			});
		};
		const dopath = () => {
			iter++;
			let path = dirargs[iter];
			if (!path && iter > 0) {
				if (getkeys(filekids).length) getlist(filekids, null, doend);
				else doend();
				return;
			}
			let saypath;
			if (!path) {
				path = cur_dir;
				saypath = "";
			} else if (len == 1) saypath = "";
			else saypath = path;
			if (recurse) saypath = path;
			path_to_obj(path, ret => {
				if (!ret) {
					errout.push("ls:\x20cannot access " + path + ":\x20No such file or directory");
					dopath();
					return;
				}
				if (forceget) delete ret.done;
				let app;
				const fileout = () => {
					filekids[path] = ret;
					dopath();
				};
				app = ret.APP || "File";
				let type = ret.root.TYPE;
				if (app == FOLDER_APP) {
					const kidsout = kids => {
						let keys = getkeys(kids).sort();
						let newkids = {};
						for (let k of keys) {
							if (!get_all && k.match(/^\./)) continue;
							if (kids[k].rootonly && !is_root) {} else newkids[k] = kids[k];
						}
						getlist(newkids, saypath, dopath);
					};
					if (!ret.done) {
						fs.populate_dirobj(ret, (kidret, errret) => {
							let never_done = ["service", "iface"];
							if (errret) {
								errout.push("ls:\x20" + errret);
								dopath();
								return;
							}
							if (!never_done.includes(type)) {
								ret.done = true;
								ret.longdone = true;
							}
							if (!kidret) kidret = {};
							kidsout(kidret);
						}, {
							LONG: true,
							HASH: if_hash,
							DBVIEW: dbview
						});
					} else kidsout(ret.KIDS);
				} else {
					if (islong) {
						let dir = ret.par;
						if (forceget || !dir.longdone) {
							fs.populate_dirobj(dir, (kidret, errret) => {
								if (errret) {
									errout.push("ls:" + errret);
									dopath();
									return;
								}
								if (!kidret) {
									kidret = {};
									cwarn("ls:\x20populate_fs_dirobj_by_path():\x20no kidret from:\x20" + cur_dir);
								}
								let tmp = kidret[ret.NAME];
								ret = tmp;
								if (type != "service") {
									ret.done = true;
									ret.longdone = true;
								}
								fileout();
							}, {
								LONG: true,
								HASH: if_hash
							});
						} else fileout();
					} else fileout();
				}
			}, getlink);
		};
		dopath();
	};
	dodirs(args);
};//»

const do_ls = (args)=>{
	return new Promise((y,n)=>{
		com_ls(args,y);
	});
};

//XXXXXXXXXXXX

builtins = {//«

//Synth stuff«

//Midi file«
/*How to convert from ticks to seconds:«

Question:
I want to know how to convert MIDI ticks to actual playback seconds.

For example, if the MIDI PPQ (Pulses per quarter note) is 1120, how would I
convert it into real world playback seconds?

Answer:
The formula is 60000 / (BPM * PPQ) (milliseconds).

Where BPM is the tempo of the track (Beats Per Minute).

(i.e. a 120 BPM track would have a MIDI time of (60000 / (120 * 192)) or 2.604 ms for 1 tick.

If you don't know the BPM then you'll have to determine that first. MIDI times
are entirely dependent on the track tempo.

»*/
/*JSON Object«



{
  // the transport and timing data
  header: {
    name: String,                     // the name of the first empty track, 
                                      // which is usually the song name
    tempos: TempoEvent[],             // the tempo, e.g. 120
    timeSignatures: TimeSignatureEvent[],  // the time signature, e.g. [4, 4],

    PPQ: Number                       // the Pulses Per Quarter of the midi file
                                      // this is read only
  },

  duration: Number,                   // the time until the last note finishes

  // an array of midi tracks
  tracks: [
    {
      name: String,                   // the track name if one was given

      channel: Number,                // channel
                                      // the ID for this channel; 9 and 10 are
                                      // reserved for percussion
      notes: [
        {
          midi: Number,               // midi number, e.g. 60
          time: Number,               // time in seconds
          ticks: Number,              // time in ticks
          name: String,               // note name, e.g. "C4",
          pitch: String,              // the pitch class, e.g. "C",
          octave : Number,            // the octave, e.g. 4
          velocity: Number,           // normalized 0-1 velocity
          duration: Number,           // duration in seconds between noteOn and noteOff
        }
      ],

      // midi control changes
      controlChanges: {
        // if there are control changes in the midi file
        '91': [
          {
            number: Number,           // the cc number
            ticks: Number,            // time in ticks
            time: Number,             // time in seconds
            value: Number,            // normalized 0-1
          }
        ],
      },

      instrument: {                   // and object representing the program change events
        number : Number,              // the instrument number 0-127
        family: String,               // the family of instruments, read only.
        name : String,                // the name of the instrument
        percussion: Boolean,          // if the instrument is a percussion instrument
      },          
    }
  ]
}
//»*/
/*
'midi':async(args)=>{//«

//Midi note to freq
//Midi note 50 is the frequency at freqs[50]
let freqs = [];
for (let i=0; i <= 127; i++) freqs[i]= 13.75*(2**((i-9)/12));

if (!await capi.loadMod("av.miditojson")) return cberr("Midi could not be loaded!");

let mod = NS.mods["av.miditojson"].Midi;
let path = args.shift();
if (!path) return cberr("No path given!");
let node = await pathToNode(path);
if (!node) return cberr(`${path}: not found`);
let t = node.root.TYPE;

let rv = await readFile(node.fullpath);
if (!(rv instanceof Blob)) return cberr("Did not get a blob!");
let midi = new mod(await capi.toBuf(rv));
let head = midi.header;
let tracks = midi.tracks;
let ppq = head.ppq;
wout(`PPQ: ${ppq}`);
wout(`Tracks: ${tracks.length}`);
let temps = head.tempos;
wout("Tempos (ms per tick):");
for (let i=0; i < temps.length; i++){
//The formula is 60000 / (BPM * PPQ) (milliseconds).
let tmp = temps[i];
//log(tmp);
let ms_per_tick = 60000/(tmp.bpm*ppq);
wout(`${i}) ${ms_per_tick}`);

}
log(head);
log(tracks);

//}
//else return cberr(`'${t}: not yet implemented'`);

cbok();

},//»
*/
//»

/*
'midiup':async()=>{
	if (await capi.initMidi()) return cbok();
	return cberr("Midi could not be enabled!");
},
'synth':()=>{
//	termobj.ENV['?']=0;
	termobj.init_app_mode("synth", 
		ret=>{//«
//			if (servobj.killed) {
//				termobj.app_line_out("Killed");
//				return termobj.end_app_mode();
//			}
			let gotcom = ret.trim();
			if (gotcom) wout(`OK: ${gotcom}`);
			termobj.response_end();
		},//» 
		cbok
	)
},

»*/
///*

/*//«
'pink':async(args)=>{

if (!await capi.loadMod("av.voice.pinktrombone")) return cberr("PinkTrombone could not be loaded!");

let mod = NS.mods["av.voice.pinktrombone"];
let pt = make('pink-trombone');
try{
let got = await pt.setAudioContext();
}catch(e){
log(e);
cberr(e);
return;
}
pt.enableUI();
log(pt.UI);
////for (let p in pt){
//if (pt.hasOwnProperty(p)) log(p);
//}

//pt.connect();
//pt.newConstriction();
//pt.start();
//log(pt.constrictions);
//log(await pt.getProcessor());
//log(pt.parameters);
//log(pt.pinkTrombone);
//log(pt.setupAudioGraph);
//log(pt.prototype);
//log(mod);

cbok();

},
//»*/

'get':async(args)=>{//«

	let opts = failopts(args, {
		LONG: {
			port: 3
		},
		SHORT: {
			p: 3
		}
	});

	let port = opts.port||opts.p;
	if (!port) return cberr("No port was given");
	let portnum = port.pi({MIN:1024, MAX: 65535});
	if (!Number.isFinite(portnum)) return cberr("Invalid port");
	let which = args.shift();
	if (!which) return cberr("No url given");
	let loc = window.location;
	let rv = await fetch(`${loc.protocol}//${loc.hostname}:${portnum}/get?url=${encodeURIComponent(which)}`)
	if (!rv.ok) {
		werr("Not 'ok' response");
		cberr();
		return;
	}
	let str = await rv.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
log(doc);
	wout(str);
	cbok();

},//»
/*//«'hncomments':async()=>{
const kid = (elem, ...arr)=>{
let cur = elem;
for (let num of arr){
cur = cur.children[num];
}
return cur;

};
let str = await fsapi.readFile("/home/me/Desktop/snayderr.html");
if (!str) return cberr("Got nada");

let parser = new DOMParser();
let doc = parser.parseFromString(str, "text/html");
let coms = doc.getElementsByClassName("comment-tree")[0].children[0].childNodes;
for (let com of coms){
let got = kid(com,0,0,0,0,2);
//log(got);
//let got = com.children[0].children[0].children[0].children[0].children[2];
let user = kid(got, 0, 0, 0);
log(user.innerText);
//log(got);
}
//log(coms);
cbok();
},
»*/
'midiup':async()=>{
	if (await capi.initMidi()) return cbok();
	return cberr("Midi could not be enabled!");
},
'ip':async(args)=>{
	let rv = await fetch("https://ifconfig.me/ip")
	if (!(rv && rv.ok)) return cberr("Could not get ip address");
	cbok(await rv.text());
},
//*/
'id':()=>{
	wout(termobj.winid);
	cbok();
},
'mount':async(args)=>{//«
	let mntkids = fs.root.KIDS.mnt.KIDS
	let name = args.shift();
	if (!name) return cberr("Mount name not given!");
	if (!name.match(/^[a-z][a-z0-9]*$/i)) return cberr("Invalid mount name!");
	if (mntkids[name]) return cberr(`Already mounted at: /mnt/${name}`);
	let port = args.shift();
	if (!port) return cberr("Port not given!");
	let num = port.ppi({MAX:65535});
	if (!NUM(num)) return cberr("Invalid port number");
	try{
		await fs.make_local_tree(name, num);
	}
	catch(e){
		cberr(e);
		return;
	}
	cbok();
},//»

'foreach':(args)=>{//«

/*

Complicated command:

# Generate the argument (SPACE separated fields in NL separated records)
jseval 'for (let x=0;x < 10;x++){for(let y=0;y<10;y++){wout(`${x} ${y}`)}};cbok();' | \ 

	# Read The stdin, mapping the first field to "X" and the second to "Y" 
	# (as variables in the shell's temporary environment)
	# Also need to give options for alternative field separators (like tabs and commas).
	# Not sure what alternative record separators would mean (possibly tabs).

	foreach X Y 'echo "{" \"x\": $X, \"y\": $Y "}"' | \


	# Parse the input into JS objects, and view them on the console
	# (Or, obviously pass them along to a command that can use them)

	parse > /dev/console



# Here we are putting the parse and redirect inside the foreach command string.
# This way we can imitate input records that pop in occassionally (every second) from
# somewhere (like the net)

jseval 'for (let x=0;x < 10;x++){for(let y=0;y<10;y++){wout(`${x} ${y}`)}};cbok();' | 

	foreach X Y 'echo "{" \"x\": $X, \"y\": $Y "}" | parse > /dev/console && sleep 1'


*/

let comstr = args.pop();
if (!comstr) return cberr("No command given");

let comargs = [];
let is_running = false;
let have_end = false;
let killed = false;
let interval;
kill_register(cb=>{
	killed = true;
	clearInterval(interval);
	cb&&cb();
});
const runit=argstr=>{//«
	if (killed) return;
	return new Promise((y,n)=>{
		let arr = argstr.split(" ");
		let env={};
		for (let i=0; i < args.length; i++) env[args[i]] = arr[i];
		let stdout = [];
//log(`RUN: ${comstr}`);
		run_script(comstr, (rv1,rv2,rv3)=>{
			for (let ln of stdout){
				if (ln.EOF===true) break;
//log(`<${ln}>`);
				wout(ln)
			}
//			respbr(true,true);
			y();
		},{
			COMSUB:true,
			PAROBJ:{
				STDOUTCAPTURE:stdout,
				TMP_ENV:env
			}
		});
	});
};//»
const dequeue=async()=>{//«
	is_running = true;
	let rv = await runit(comargs.shift());
	is_running = false;
};//»
interval = setInterval(()=>{//«
	if (!is_running)
		if (comargs.length) dequeue();
		else if (have_end){
			clearInterval(interval);
			cbok();
		}
},0);//»
read_stdin(async ret => {//«
	if (isobj(ret) && ret.EOF===true) {
		have_end = true;
		return;
	}
	if (isarr(ret)) {
		for (let ln of ret){
			if(!isstr(ln)) {
cerr("Dropping", ln);
				return werr("Dropping non-string array input");
			}
			comargs.push(ln);
		}
//log(comargs);
	}
	else if (isstr(ret)) {
		comargs.push(ret);
	}
	else{
cerr("Dropping", ret);
		werr("Dropping non-string input");
	}
}, {
	SENDEOF: true
});//»

},//»
'audio':(args)=>{
	if (globals.audio) return cberr("Audio is already up!");
	capi.mkAudio();
	cbok();
},
'exists':async(args)=>{let opts=failopts(args,{SHORT:{a:1,o:1},LONG:{all:1,one:1}});if(!opts)return;let if_one=opts.one || opts.o;let if_all=opts.all || opts.a;if(if_one && if_all)return cberr("Cannot simultaneously specify both 'one' and 'all' options");if(!if_one)if_all=true;if(!args.length){if(if_one)return cberr();else return cbok();}let gotone=false;for(let path of args){if(!await pathToNode(path)){if(if_all)return cberr(normpath(path)+":\x20not found");}else gotone=true;}if(if_one && !gotone)return cberr("option 'one' specified,\x20but none found");cbok();},
'mkappicon': args => {//«
	let appargs = getopts(args,{ALL:true})[0];
	if (appargs.app) return cberr("App argument given (that is the main arg!)");
	let which = args.shift();
	if (!which) return cberr("No app arg!");
	if (!which.match(/^[a-z]+(\.[a-zA-Z][a-zA-Z0-9]*)+$/)) return cberr("Bad arg!");
	let out = {app:which};
	out.args = appargs;
	wout(JSON.stringify(out,null,"\t"));
	cbok();
},//»
'lib': args => {
	let which = args.shift();
	if (!which) return cberr("No lib given!");
	let doit = () => {
		let keys = NS.libs[which]();
		cbok(fmt(keys.sort().join(" ")));
	};
	if (NS.libs[which]) doit();
	else Core.load_lib(which, ret => {
		if (!ret) return cberr("No such module:\x20" + which);
		doit();
	});
},
'setdeskpath':async args=>{let opts=failopts(args,{SHORT:{d:1},LONG:{default:1}});if(!opts)return;let def=opts.default || opts.d;let path=args.shift();if(path && def)return cberr("path given,but 'default' arg specified");if(def)path='/home/'+Core.get_username()+"/Desktop";if(!path)return cberr("No path given(use '--default' to set it to ~/Desktop)");let obj=await pathToNode(path);if(!obj)return cberr(path+":\x20not found");if(obj.APP !==FOLDER_APP)return cberr(path+":\x20not a directory");path=objpath(obj);if(!await Desk.set_desk_path(path))return cberr("Could not set desktop path");cbok("OK");},
'mkdir': args => {
	let opts = failopts(args, {
		LONG: {
			kind: 3,
			forceremote: 1
		},
		SHORT: {
			r: 1
		}
	});
	if (!opts) return;
	if (!args.length) {
		serr("no directory name given");
		return;
	}
	let iter = -1;
	let have_error = false;
	const domake = () => {
		iter++;
		if (iter == args.length) {
			if (have_error) cberr();
			else {
				cbok();
				if (Desk) Desk.update_folder_statuses();
			}
			return;
		}
		let fullpath = normpath(args[iter]);
		let fparts = path_to_par_and_name(fullpath, true);
		let parpath = fparts[0];
		let fname = fparts[1];
		fs.mk_fs_dir(parpath, fname, null, (ret, err) => {
			if (err) {
				werr(err);
				refresh();
				have_error = true;
			}
			domake();
		}, null, is_root, opts);
	};
	domake();
},
'cp': args=>{fs.com_mv(shell_exports, args, true);},
'mv': args=>{fs.com_mv(shell_exports, args);},
'rm': args => {
	let do_full_dirs = false;
	let opts = failopts(args, {
		SHORT: {
			r: 1
		}
	});
	if (!opts) return;
	if (opts.r) do_full_dirs = true;
	if (!args.length) {
		serr("missing operand");
		return;
	}
	fs.do_fs_rm(args, errmess => {
		werr("rm:\x20" + errmess);
		refresh();
	}, ret => {
		if (ret) {
			if (Desk) Desk.update_folder_statuses();
			cbok();
		} else cberr();
	}, {
		CWD: cur_dir,
		ROOT: is_root,
		FULLDIRS: do_full_dirs
	});
},
'kill': args => {
	if (args.length != 1) return cberr("Expected exactly one arg");
	let num = strnum(args[0]);
	if (!(isint(num) && num > 0)) return cberr("Need a positive integer!");
	Core.kill_job(num);
	cbok();
},
//'jobs':args=>{if(args.length)return cberr("Expected 0 arguments");woutarr(Core.get_job_list());cbok();},
'ls': com_ls,
'eof':()=>{wout(EOF);cbok();},
'cd': args => {
	let res;
	let got_dir, dir_str, dirobj;
	const cd_end = () => {
		if (!got_dir.match(/^\x2f/)) got_dir = "/" + got_dir;
		cur_dir = got_dir;
		response({
			CD: got_dir,
		}, {
			NOEND: true
		});
		cbok();
		fs.populate_dirobj_by_path(got_dir, (rv, err) => {
			if (err) return cerr(err);
		});
	};
	if (!args.length) {
		got_dir = termobj.get_homedir();
		cd_end();
		return;
	}
	let saypath = args[0];
	let regpath = normpath(saypath);
	path_to_obj(regpath, ret => {
		if (!ret) return cberr(saypath + ":\x20No such file or directory");
		if (ret.APP != FOLDER_APP) return cberr(saypath + ":\x20Not a directory");
		got_dir = regpath;
		cd_end();
	});
},
'cat': args => {
	let sws = failopts(args, {
		SHORT: {
			w: 1,
			b: 1,
			e: 1,
			n: 1,
			o: 1,
			t: 1,
			f: 1,
			c: 1
		},
		LONG: {
			binary: 1,
			objok: 1,
			"force-text": 1,
			number: 1,
			wrap: 1,
			copy: 1
		}
	});
	if (!sws) return;
	let opts = {};
	let objok = sws.objok || sws.o;
	opts.OBJOK = objok;
	opts.FORCETEXT = sws["force-text"] || sws.t;
	opts.NUMBERLINES = sws.number || sws.n;
	opts.BINARY = sws.binary || sws.b;
	opts.ISERR = sws.e;
	opts.SETFNAME = sws.f;
	opts.WRAPLINES = sws.wrap||sws.w;
	opts.COPY = sws.copy||sws.c;
	if (opts.BINARY && opts.NUMBERLINES) return cberr("Incompatible arguments:\x20line numbering and binary output!");
	com_cat(args, opts);
},
'wrap': args=>{
	if (!failnoopts(args)) return cberr();
	com_cat(args, {WRAPLINES: true});
},
'copy': args=>{
	if (!failnoopts(args)) return cberr();
	com_cat(args, {COPY: true});
},
'bcat': args=>{
	if (!failnoopts(args)) return cberr();
	com_cat(args, {BINARY: true});
},
'su': async args => {
	let who = args.shift();
	let rv;
	if (who) {
		who = who.regstr();
		let curuser = Core.get_username();
		if (who === curuser) return cbok(`Already logged in as '${who}'`);
		let users = Core.get_users();
		let val = users[who];
		if (!val) return cberr(`Not a registered user:'${who}'`);
		rv = await getLineInput("Password:\x20", true);
		if (await Core.api.sha1(rv) !== val) return cberr("Authentication failure");
		termobj.set_root_state(false);
		Core.set_username(who);
		let homedir = `/home/${who}`;
		cur_dir = homedir;
		await fsapi.popHtml5Dir(homedir);
		ENV.USER = who;
		response({
			CD: homedir
		}, {
			NOEND: true
		});
		cbok();
		if (Desk) Desk.set_desktop_stats();
	} else {
		if (is_root) return cbok("Already root");
		rv = await getLineInput("Password:\x20", true);
		if (await capi.sha1(rv) === Core.get_users()["_"]) {
			termobj.set_root_state(true);
			cur_dir = "/";
			response({
				CD: "/"
			}, {
				NOEND: true
			});
			cbok();
		} else cberr("Password mismatch");
	}
},
'pwd':()=>{cbok(cur_dir);},
'exit':args=>{let num=args.shift();if(!num)num="1";if(num.match(/^[0-9]+$/)){sys_abort=true;use_return_val=parseInt(num);cb(make_ret(use_return_val));if(istty()&& termobj && termobj.close)termobj.close();}else{sys_abort=true;cb(sh_error("invalid exit value:"+num,null,get_redir(redir,2)));}},
'false': cberr,
':':cbok,
'shift':args=>{if(args.length>1)return cberr("too many arguments");let num;if(!args.length)num=1;else{let numstr=args.shift();num=strnum(numstr);if(!isnum(num))return cberr(numstr+":\x20numeric argument required");if(num<0)return cberr(numstr+":\x20shift count out of range");}if(!global_args){if(num===0)return cbok();else return cberr();}for(let i=0;i<num;i++){if(global_args.shift()===undefined)return cberr();}return cbok();},
'true': cbok,
'close':args=>{if(!Desk)return cberr(ENODESK);let id=args.shift();if(!id)return cberr("No app given!");if(!id.match(/^win_\d+$/))return cberr("Invalid window id");let win=document.getElementById(id);if(!win)return cberr("Nothing found");win.force_kill();cbok();},
'open': async args => {
//	let opts = getwinargopts(args);
//	if (!opts) return;
	let opts = {};
	if (!Desk) return cberr(ENODESK);
	let path = args.shift();
	if (!path) return cberr("No path!");
	let fent = await pathToNode(path);
	if (!fent) return cberr(path + ":\x20file not found");
	if (!fent.fullpath){
log(fent);
		cberr("No path of the file entry!");
		return;
	}
	Desk.open_file_by_path(fent.fullpath, null, opts);
	cbok();
},
'app': async args => {
	let usearg;
	const openit=async()=>{
		if (!await Desk.openApp(which, (opts.force||opts.f), null, usearg)) return cberr();
		cbok();
	};
//	let opts = getwinargopts(args);
//	if (!opts) return;
	
	let opts = failopts(args, {
		s: {
			s: 1,
			a: 3,
			f: 1
		},
		l: {
			source: 1,
			args: 3,
			force: 1
		}
	});
	if (!opts) return;
	if (!Desk) return cberr(ENODESK);
	let which = args.shift();
	if (!which) return cberr("No app given!");
	if (opts.source || opts.s){
		let path = which.replace(/\./g, "/");
		let rv = await fetch(`/root/code/apps/${path}.js`);
		if (!rv.ok) return cberr(`${which}: not found`);
		wout(await rv.text());
		cbok();
		return;
	}
	let gotarg = opts.args || opts.a;
	if (gotarg){
		try{
			usearg = JSON.parse(gotarg);
		}
		catch(e){
			cberr("Bad JSON in 'args' arg");
			return;
		}
	}
	let rdr = get_reader();
	if (rdr.is_terminal) return openit();
	read_stdin(rv=>{
		if (rv.EOF===true) return;
		if (!(isarr(rv)&&isstr(rv[0]))) return cberr("Unknown input received (check console)");
		openit({TEXT: rv.join("\n")});
	})
},
'alias':args=>{for(let i=0;i<args.length;i++){let got=args[i];let com,rep;if(got.match(/=$/)&& args[i+1]){com=got.replace(/=$/,"");i++;rep=args[i];}else if(got.match(/=/)){let arr=got.split("=");com=arr[0];rep=arr[1];}if(com.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/))termobj['ALIASES'][com]=rep;else werr("Bad command name:\x20"+com);}cbok();},
'env': () => {
	let keys = Object.keys(var_env).concat(Object.keys(tmp_env));
	let arr = [];
	let val;
	let done = {};
	for (let i = 0; i < keys.length; i++) {
		let key = keys[i];
		if (done[key]) continue;
		done[key] = true;
		if (tmp_env[key]) val = tmp_env[key];
		else val = var_env[key];
		let str = "";
		if (isstr(val)) str = val.toString();
		else if (typeof val == "object") {
			if (val.length == undefined) {
				let vkeys = getkeys(val);
				str = "[";
				for (let j = 0; j < vkeys.length; j++) {
					let vkey = vkeys[j];
					str += " " + vkey + "\x20=>\x20" + val[vkey] + ",";
				}
				str = str.replace(/,$/, "") + "\x20]";
			} else {
				str = "(";
				for (let j = 0; j < val.length; j++) str += " " + (val[j] || "") + ",";
				str = str.replace(/,$/, "") + "\x20)";
			}
		} 
		else str = val+"";
		if (NUM(str)) str = str + "";
		arr.push(keys[i] + "=" + (str || ""));
	}
	woutarr(arr);
	cbok();
//	cbok(arr, "lines");
},

'argshift':()=>{if(global_args)global_args.shift();cb(ret_true());},
'len':args=>{let name=args.shift();if(!name){suse("name");return;}let obj=var_env[name];if(obj){let len=obj.length;if(len !=undefined)cbok(len+"");else serr(name+":\x20not an array");}else serr(name+":\x20undefined");},
'echoint':args=>{let doit=()=>{let tok=args.shift();if(!tok)return cbok(EOF);wout(tok);setTimeout(doit,500);};setTimeout(doit,250);},
'import': async args => {
//	if (!failnoopts(args)) return;
	let opts = failopts(args,{s:{v:1}});
	if (!opts) return;
	let which = args.shift();
	if (!which) return cberr("Expected a command library to import,eg. 'fs' or 'gui'!");
	if (libs.includes(which)) return cbok("'" + which + "' is already loaded");
	let asstr = args.shift();
	let pref = "";
	if (asstr) {
		if (asstr != "as") return cberr("Unexpected token,\x20'" + asstr + "'");
		let gotimpas = args.shift();
		if (!gotimpas) return cberr("Expected an identifier");
		if (!isid(gotimpas)) return cberr("Invalid identifier:\x20" + gotimpas);
		pref = gotimpas + ".";
	}
	const add_imports = async () => {
		let lib = NS.libs[which];
		let keys = lib();
		if (!(keys && keys.length)) return cberr("Got no valid keys in:\x20" + which);
		let num = 0;
		for (let k of keys) {
			let key = pref + k;
			if (builtins[key]) werr("A builtin named:\x20'" + (key) + "' already exists");
			else if (shell_lib[key]) werr("An imported function named:\x20'" + (key) + "' already exists!");
			else {
				shell_lib[key] = {
					_call:(args, exp)=>{lib(k, args, Core, exp)}
				};
				num++;
			}
		}
		termobj.builtins = (getkeys(builtins).concat(getkeys(shell_lib))).sort();
		wout("Successfully imported:\x20" + num + " functions from '" + which + "'");
		if (opts.v) wout(keys.join(" "));
		cbok();
		libs.push(which);
	};
	if (NS.libs[which]) {
		add_imports();
		return;
	}
	let rv = await capi.loadLib(which);
	if (!rv) return cberr("No such module:\x20" + which);
	if (typeof rv === "string") Core.do_update(`libs.${which}`, rv);
	add_imports();
},


'hist':args=>{let sws=failopts(args,{SHORT:{n:3,r:1,a:1}});if(!sws)return;let num=null;let do_rep=sws.r;let do_add=sws.a;let is_mod=do_rep||do_add;if(do_rep&&do_add)return cberr("Conflicting flags given:\x20-r(replace)and-a(append)");if(sws.n){num=strnum(sws.n);if(!(isint(num)&&num>=0))return cberr("Expected a non-negative integer number");}if(is_mod){let file=args.shift();if(!file)return cberr("No file given");gettextfile(file,ret=>{if(!ret)return cberr(file+":\x20No contents");let arr=ret.split("\n");let outarr=[];for(let ln of arr){let str=ln.trim();if(!str)continue;outarr.push(str);}if(!outarr.length)return cberr(file+":\x20No usable contents");if(do_rep)termobj.replace_command_history(outarr);else termobj.append_command_history(outarr);cbok();});}else{let which="shell";if(args.length)which=args.shift();if(!isid(which))return cberr("Bad history arg:\x20"+which);Core.get_history(which,ret=>{if(!ret)return cberr(which+":\x20No history found");if(num===null)woutarr(ret);else{let str=ret[num];if(!str)return cberr("No value at line:\x20"+num);wout(str);}cbok(EOF);},true);}},
'getch':args=>{let opts=failopts(args,{SHORT:{p:3}});if(!opts)return;let reader=get_reader();if(!reader.is_terminal)return cberr("Read from terminal only");if(opts.p){termobj.set_prompt(opts.p,{NOPUSH:1,NOSCROLL:1});refresh();}termobj.getch(cbok);},
'wc': args => {
	let _ = shell_exports;
	let curfile = null;
	let words = null,
		chars;
	let numlines;
	_.read_file_args_or_stdin(args, (ret, filearg, errarg) => {
//log(ret);
		if (filearg) {
			curfile = filearg;
			return;
		} else if (errarg) {
			_.werr(errarg);
			return;
		}
		if (isobj(ret) && ret.EOF) {
			if (words) _.wout(numlines + "  " + words + "  " + chars);
			return _.cbok();
		}
		if (isarr(ret)) {
			words = 0, chars = 0;
			for (let i = 0; i < ret.length; i++) {
				let warr = ret[i].split(/\x20+/);
				words += warr.length;
				for (let j = 0; j < warr.length; j++) chars += warr[j].length;
			}
			let strout = ret.length + "  " + words + "  " + chars;
			if (curfile) strout += "  " + curfile;
			words = null;
			_.wout(strout);
		} else if (isstr(ret)) {
			if (words === null) {
				words = 0;
				chars = 0;
				numlines = 0;
			}
			numlines++;
			let warr = ret.split(/\x20+/);
			words += warr.length;
			for (let i = 0; i < warr.length; i++) chars += warr[i].length;
		} else if (!ret) _.cberr("no input");
		else {
			cwarn("wc:what input?");
			log(ret);
		}
	}, {
		SENDEOF: true
	});
},
'pipe': args => {
	let opts = failopts(args, {
		LONG: {
			append: 3
		}
	});
	if (!opts) return;
	let app_txt = opts.append;
	read_stdin(ret => {
		if (isobj(ret) && ret.EOF) return cbok(ret);
		if (isobj(ret)) woutobj(ret);
		else if (isarr(ret)) {
			if (app_txt && isstr(ret[0])) {
				for (let i = 0; i < ret.length; i++) {
					if (isstr(ret[i])) ret[i] = app_txt + ret[i];
				}
			}
			woutarr(ret);
		} else {
			if (app_txt && isstr(ret)) ret = app_txt + ret;
			wout(ret);
		}
		refresh();
	}, {
		OBJOK: true,
		SENDEOF: true
	});
},
'log': async args => {
/*
	const dowait=()=>{
		return new Promise((Y,N)=>{
			setTimeout(Y,10000);
		});
	};
	await dowait();
*/
	read_stdin(ret => {
		if (isobj(ret) && ret.EOF) return cbok();
		log(ret);
	});
},
'dl': async args => {
	if (!failnoopts(args)) return cberr();
	if (args.length){
		if (args.length > 1) return cberr("Too many args!");
		let fname = args[0];
		let rv = await readFile(fname);
		if (!rv) return cberr(`${fname}: the file could not be found`);
		let name = fname.split("/").pop();
		if (rv instanceof Blob) capi.download(rv, name);
		else if (isarr(rv)&&rv.length&&isstr(rv[0])) capi.download(rv.join("\n"), name);
		else return cberr("An unrecognized object was return (see console)");
		cbok();
		return;
	}
	let arr = [];
	let done = false;
	read_stdin(async ret => {
		if (done) return;
		if (isobj(ret) && ret.EOF) {
			done = true;
			if (arr.length) {
				let name = args.shift();
				if (!name) name = get_var_str("CUR_FNAME");
				capi.download(arr.join("\n"), name);
				cbok();
			}
			else cberr("Received no usable input");
			return;
		}
		if (isstr(ret)) arr.push(ret);
		else if (isarr(ret)&&isstr(ret[0])) arr = arr.concat(ret);
		else {
			werr("Dropping input... (see console)");
			log(ret);
		}
	});
},
'buf': args => {
	let sws = failopts(args, {
		SHORT: {
			r: 1,
			n: 1
		},
		LONG: {
			reverse: 1
		}
	});
	if (!sws) return;
	let buf = termobj.get_buffer();
	buf.pop();
	buf.pop();
	if (sws.reverse || sws.r) buf = buf.reverse();
	if (sws.n) buf = Core.api.numberLines(buf);
	wout(buf.join("\n"));
	cbok(EOF);
},
'parse': args=>{com_cat(args, {OBJOK: true, PARSE: true});},
'stringify': args=>{com_cat(args, {OBJOK: true, STRINGIFY: true});},
'typeof': args=>{com_cat(args, {OBJOK:true, ECHOTYPE: true});},
'instanceof': args=>{com_cat(args, {OBJOK:true, ECHOCTOR: true});},
'read': (args, next_cb) => {//«
	const lineout = async line => {
		for (let i = 0; i < line.length; i++) {
			let key = args.shift();
			if (!key) break;
			let val;
			let s;
			if (!args.length && line.length > 1) s = line.splice(i).join(" ");
			else s = line[i];
			if (secret) {
				let sum = await capi.sha1(s);
				val = new String();
				val.valueOf=()=>{
					return s;
				}
/*
					if (s) cwarn(`valueOf() called for '${key}'!`);
					let tmp = s;
					s=undefined;
					return tmp;
*/
				setTimeout(()=>{
					cwarn(`timeout elapsed for '${key}'!`);
					s=undefined;
				}, MAX_MS_FOR_SECRET_VAR);
				val.toString=()=>{return sum}
			}
			else val = s;
			set_var_str(key, val);
/*«
			if (args.length == 1 && line.length > 1) {
				val = line.splice(i).join(" ");
				if (secret) {
					let sum = await capi.sha1(val);
					s = new String();
					s.valueOf=()=>{return val};
					s.toString=()=>{return sum;}
				}
				else s = val;
				set_var_str(args[0], s);
				break;
			}
			val = line[i];
			if (secret) {
				let sum = await capi.sha1(val);
				s = new String();
				s.valueOf=()=>{return val};
				s.toString=()=>{return sum;}
			}
			else s=val;
			set_var_str(args[0], s);
			args.shift();

»*/
		}
		if (next_cb) next_cb(true);
		else cbok();
	};
	if (sys_abort) {
		cberr();
		return;
	}
	let sws = failopts(args, {
		SHORT: {
			u: 3,
			p: 3,
			s: 1
		},
		LONG: {}
	});
	if (!sws) return;
	if (!args.length) {
		if (next_cb) next_cb();
		else cbok();
		return;
	}
	let usenum = 0;
	let gotnum = util.strnum(sws['u']);
	let useprompt = "";
	let secret = sws.s;
	if (secret) termobj.set_password_mode();
	if (sws['p']) useprompt = sws['p'];
	if (sws['u'] && gotnum == null) {
		if (usecb) usecb();
		else serr("invalid fd:" + sws['u']);
		return;
	} else if (typeof gotnum == "number") usenum = gotnum;
	if (!FILES[usenum]) {
		if (next_cb) next_cb();
		else serr("not a file:\x20" + usenum);
		return;
	}
	let reader = get_reader();
	read_stdin(ret => {
		if (reader.pipe && reader.pipe.update_pipewrite_cb) reader.pipe.unset_pipewrite_cb();
		if (isobj(ret) && ret.t === "lines" && ret.lines.length == 1) ret = ret.lines[0];
		if (iseof(ret)) {
			wout(ret);
			return cberr();
		}
		if (isstr(ret)) lineout(ret.trim().split(/\x20+/));
		else if (isarr(ret)) {
			let iter = 0;
			if (iter >= ret.length) return cberr();
			let str = ret[iter];
			if (isstr(str)) lineout(str.trim().split(/\x20+/));
			else if (iseof(str)) {
				return;
			} else {
				cwarn("Not a string in read array");
				log(ret);
				cberr();
			}
		}
	}, {
		ONCE: true,
		PROMPT: useprompt,
		FD: usenum,
		SENDEOF: true
	});
},//»
'sleep':args=>{let arg1=args.shift();if(!arg1){suse("seconds");return;}let time_str=toks_to_string([arg1]);let time_arr;if(time_str && time_str.match(/^[0-9]+(\.[0-9]+)?$/)){let time=parseFloat(time_str);let msecs=parseInt((Math.floor(time*10000))/10);if(typeof(msecs)=="number"){const end_sleep=()=>{if(!sleep_timer)return;sleep_timer=null;cbok();};let sleep_timer=setTimeout(end_sleep,msecs);kill_register(killcb=>{end_sleep();killcb&&killcb();});global_timeouts.push(sleep_timer);return;}}cberr("could not parse args");},
'msleep':args=>{let arg1=args.shift();if(!arg1){cb(sys_error("msleep:\x20missing operand"));return;}let time_str=toks_to_string([arg1]);if(time_str && time_str.match(/^[0-9]+$/)){let num=parseInt(time_str);if(num==0)num=1;respbr();let timer=setTimeout(()=>{cb(ret_true());},num);global_timeouts.push(timer);return;}else{cb(sys_error("msleep:\x20invalid time interval:"+time_str));}},
'echo': args => {
	let sws = failopts(args, {
		SHORT: {
			r: 1,
			n: 1,
			o: 1
		}
	});
	if (!sws) return;
	if (sws.o) {
		if (args.length == 1) wout(args[0]);
		else woutarr(args);
		wout(EOF);
		cbok();
	} else {
		let str;
		if (!args.length) str = "";
		else if (args.length==1) str = args[0];
		else str = args.join(" ");
		if (sws.r) str = str.split("").reverse().join("");
		wout(str, {
			NONL: sws.n
		});
		wout(EOF);
		cbok();
	}
},
'clear':()=>{termobj.clear();},
'builtins':()=>{let arr=Object.keys(builtins);if(is_root)arr.push(...Object.keys(sys_builtins));cbok(fmt(arr.sort().join(" ")));},
'passwd': async args => {//«
	let rv1,rv2;
	let users = Core.get_users();
	let username = is_root?"_":Core.get_username();
	rv1 = await getLineInput("New password:\x20", true);
	rv2 = await getLineInput("Confirm new password:\x20", true);
	if (rv1!==rv2) return cberr("Password mismatch");
	users[username] = await capi.sha1(rv1);
	Core.set_users(users);
	cbok();
/*//«
	term_prompt("New Password:\x20", true, ret => {
		if (ret && ret['lines'] && (typeof ret['lines'][0] == "string")) {
			var first = ret['lines'][0];
			term_prompt("Confirm Password:\x20", true, ret2 => {
				if (ret2 && ret2['lines']) {
					if (ret2['lines'][0] == first) {
						let users = Core.get_users();
						users._=first;
						Core.set_users(users);
					} else serr("password mismatch");
				} else(serr("input error"))
			});
		} else(serr("input error"))
	});
»*/
}//»
}//»

sys_builtins = {//«

'deluser': args=>{
	let user = args.shift();
	if (!user) return cberr("No username given");
	if (args.length) return cberr("Expected one argument");
	let users=Core.get_users();
	if (!users[user]) return cberr(`${user}:\x20not found`);
	delete users[user];
	let cur_user = Core.get_username();
	if (cur_user==user) {
		Core.del_local_storage('current_user');
		delete ENV.USER;
		Core.set_username();
	}
	Core.set_users(users);
	cbok();
},
'adduser':async args=>{
	if (args.length) return cberr("Unexpected argument[s]");
	let name, rv1, rv2;
	name = await getLineInput("Username: ");
	name = name.regstr();
	if (!name.match(/^[a-z][a-z0-9_]*$/i)) return cberr("Username regex pattern: '/^[a-z][a-z0-9_]*$/i'");

	let users = Core.get_users();
	if (users[name]) return cberr(`The user '${name}' already exists!`);
	rv1 = await getLineInput("Password:\x20", true);
	rv2 = await getLineInput("Retype password:\x20", true);
	if (rv1!==rv2) return cberr("Password mismatch!");
	users[name]=await Core.api.sha1(rv1);
	await fsapi.touchHtml5Dir(`/home/${name}`);
	await fsapi.popHtml5Dir(`/home/${name}`);
	Core.set_users(users);
	cbok();
}

}//»

if (comarg == null) {
	initialize_term();
	if (exe_cb) exe_cb("INITOK");
	return;
}
if (comarg.error_message) {
	cb(sh_error(comarg.error_message,null,get_redir(redir, 2)));
	return;
}
if (arr[0] == null) arr=[];
if (!arr && comarg.length) return cb(comarg[0]);
else if (arr.length) {//«

	let comtok = arr.shift();
	let isquote = null;
	let marr;
	if (typeof(comtok) == "string") {
		let obj = {'t': 'group_ret', 'group_ret': comtok.split(/ +/)};
		comtok = obj;
	}
	else if (comtok instanceof String && comtok.is_quote){
		isquote = true;
		comword = comtok.valueOf();
	}
	else if (comtok.t == "quote" && comtok.quote.quote_string) {
		isquote = true;
		comword = comtok.quote.quote_string;
	}
	else comword = comtok.word;

	if (comword) {//«
		cur_com_name = comword;
		shell_exports = {
			getLineInput:getLineInput,
			readFile:readFile,
			pathToNode:pathToNode,
			wrap_line: wrap_line,
			fmt: fmt,
			cbeof: cbeof,
			sherr: sherr,
			get_path_of_object: get_path_of_object,
			get_options: get_options,
			termobj: termobj,
			cur_com_name: cur_com_name,
			read_file_args_or_stdin: read_file_args_or_stdin,
			read_stdin: read_stdin,
			cur_dir: cur_dir,
			constant_vars: constant_vars,
			path_to_par_and_name: path_to_par_and_name,
			path_to_obj: path_to_obj,
			if_com_sub: if_com_sub,
			check_pipe_writer: check_pipe_writer,
			tmp_env: tmp_env,
			kill_register: kill_register,
			arg2con: arg2con,
			atbc: atbc,
			get_reader: get_reader,
			sys_write: sys_write,
			cb: cb,
			normpath: normpath,
			cbok: cbok,
			cberr: cberr,
			serr: serr,
			failopts: failopts,
			failnoopts: failnoopts,
			werr: werr,
			werrarr: werrarr,
			wout: wout,
			woutarr: woutarr,
			woutobj: woutobj,
			wclout: wclout,
			wappout: wappout,
			refresh: refresh,
			respbr: respbr,
			wclerr: wclerr,
			suse: suse,
			get_var_str: get_var_str,
			set_var_str: set_var_str,
			set_obj_val: set_obj_val,
			ptw: ptw,
			term_prompt: term_prompt,
			do_red: do_red,
			Desk: Desk,
			is_root: is_root,
			ENODESK: ENODESK,
			EOF: EOF,
			ENV: ENV,
			PIPES: PIPES,
			pipe_arr: pipe_arr
		}
		shell_obj.exports = shell_exports;
		shell_obj._ = shell_exports;
		for (let i=0; i < arr.length; i++) {
			if (typeof(arr[i]) == "object" && arr[i]['t'] == "group_ret") arr[i] = arr[i]['group_ret'].join(" ")
			else if (typeof(arr[i]) == "object" && arr[i]['t'] == "quote_string") arr[i] = arr[i]['quote_string'];
		}
		if (termobj['ALIASES'][comword]) {//«
			let aliasarr = termobj['ALIASES'][comword].split(/ +/);
			comword = aliasarr.shift();
			cur_com_name = comword;
			for (let i=aliasarr.length-1; i >=0; i--) arr.unshift(aliasarr[i]);
		}//»
		if (!isquote && termobj.FUNCS[comword]) run_something(comword, termobj.FUNCS[comword], arr, null, {INFUNC: true});
		else if (!isquote && builtins[comword]) builtins[comword](arr);
		else if (!isquote && shell_lib[comword]) shell_lib[comword]._call(arr, shell_exports);
		else if (!isquote && is_root && sys_builtins[comword]) sys_builtins[comword](arr);
		else {//«
			if (comword.match(/\x2f/)) run_command(comword);
			else lookup_file();
		}//»
	}//»
	else if (comtok.t == "subshell_group" || comtok.t == "shell_group") run_something(global_com_name, (comtok.subshell_group||comtok.shell_group), null, null, {INGROUP: true});
	else if (comtok.t == "group_ret") {//«
		if (typeof(comtok.group_ret) == "object") {
			let gotobj = comtok.group_ret;
			if (gotobj.length != undefined) {
				if (typeof(gotobj[0]) == "number") {
					cb(gotobj[0]);
					return;
				}
				else run_script(comtok.group_ret.join(" "), cb);
			}
			else cb(comtok.group_ret);
		}
		else if (comtok.group_ret == "") cb(make_ret(0));
		else cb(make_ret(1));
	}//»
	else {
log("call_com: comtok is not a word or group_ret...");
log(comtok);
	}
}//»
else cb(make_ret(0));

//return pipein_cb;

}//»

//Shell Entry//«

if (!parser) parser = new Parser(sh_error);
let arr = parser.parse(main_com_str, global_com_name);
if (!arr) return final_cb(2);
if (arr.length != undefined) {
	for (let obj of arr) {
		if (obj.t === "c_op") {
			if (obj.c_op === "nl") continue;
			sh_error("syntax error near unexpected token \x60" + obj.c_op + "'.");
			final_cb(1);
			return;
		}
	}
	let rv = await execute([{'t': "file",'file': arr}]);
	if (rv[1]) sys_abort = true;
	let bg_id = rv[2];
	if (is_parent_bash) {
//			if (bg_id) Core.unregister_job(bg_id);
		file_done = true;
	}
	final_cb(rv[0]);

/*
	execute([{
		't': "file",
		'file': arr
	}], (ret, if_abort, bg_id) => {
		if (if_abort) sys_abort = true;
		if (is_parent_bash) {
//			if (bg_id) Core.unregister_job(bg_id);
			file_done = true;
		}
		final_cb(ret);
	});
*/
} else if (typeof arr === "object") {
	if (arr.CONT) {
//log("ARR",arr);
		if (global_com_name) {
			sh_error("Unexpected end of file");
			final_cb(2);
		} else final_cb(arr);
	} else if (arr.ERR === true) final_cb(2);
	else {
		cerr("What kind of object returned from parser.parse?");
		log(arr);
		final_cb(2);
	}
}

//»

}//»

this.cancel=if_noresp=>{cancelled=true;clear_timeouts();}
//this.execute = (runcom, dir_arg, exe_cb_arg, if_init, if_root) => {

this.execute = (runcom, dir_arg, opts={}) => {//«

//let if_init = opts.init;
//let if_root = opts.root;
opts.PARSHELL=true;
return new Promise((Y,N)=>{

exe_cb=Y;
cur_dir = dir_arg;
cancelled = null;
is_root = opts.root;
run_script(runcom, retval => {
	let respdone = () => {
		response({
			"SUCC": [""]
		}, {
			NOEND: true,
			NEXTCB: () => {
				if (cancelled) return;
				response({CD:cur_dir});
			}
		});
	};
	if (opts.init) {
		respdone();
		exe_cb(retval);
	} else {
		if (retval && retval['CONT']) response(retval);
		else {
			ENV["?"] = retval;
			respdone();
			exe_cb(retval);
		}
	}
}, opts);

});

}//»


}

/*Old«

'swon': async () => {
	if (await capi.initSW()) return cbok("The service worker has been registered");
	cberr("There was a problem registering the service worker");
},
'swoff':async()=>{if(await capi.initSW(true))return cbok("The service worker has been unregistered");cberr("There was a problem unregistering the service worker");},

'comstr':(args)=>{//«
	let opts = failopts(args,{LONG:{nowrap:1},SHORT:{}});
	if (!opts) return;
	let com = args.shift();
	if (!com) return cberr("No arg given!");
	let func = builtins[com];
	if (!func) {
		let got = shell_lib[com];
		if (got) func = got._func();
		if (!func) return cberr(`${com}:\x20function not found`);
	}
	let arr = func.toString().split("\n");
	for (let ln of arr){
		if (opts.nowrap) wout(ln);
		else wout(wrap_line(ln));
	}
	cbok();
},//»
//Help«

const builtins_help={
ls:`List out the contents of one or more directories`,
cd:`Change into a new directory`,
swon: 'Enable service workers for the current url for offline usage',
swoff: 'Disable the active service worker',
swurl:'Print out the url for which the active service worker is registered',
help:'Show a short message about system usage (no args) or an individual command',
libs:'List out the available command libraries',
lib:'List out the commands in a given command library',
mkdir:'Make a directory',
login:`Login to the system via the standard google app engine login procedure. No permissions are asked for.`,
logout:`Logout of the system`,
import:`Import a command library into the current shell execution context`,
pwd:`Print out the current working directory`,
setname:`Set your public facing username to something other than the username used for your gmail address`,
lockname:`Lock your username so that setname -u doesn't work`,
unlockname:`Allows you to change your username via setname -u`,
cp:`Copy files`,
mv:`Move or rename files or folders`,
cat:`Print out the contents of files`,
echo:`Print out the command arguments`,
open:`Open an application window in the Desktop environment`,
close:`Close an application window given its id`,
hist:`Print out the command line history`
};


//»

'help': async args => {

	let which = args.shift();

	let str = null;
	if (!which) {
		str = help_str;
		which = "overview";
	}
	else if (builtins[which]) str = builtins_help[which];
	else if (shell_lib[which]) str = shell_lib[which]._help();
	else return cberr(`help:\x20${which}:\x20command not found`);
	if (!str) {
		werr(`help:\x20${which}:\x20nothing was returned`);
		cbok();
		return;
	}
	let mod = NS.mods["util.pager"];
	if (!mod){
		wout(fmt_lines(str));
		cbok();
		return;
	}
	let pager = new mod(Core, shell_exports);
	pager.init(fmt_lines(str).split("\n"),`help(${which})`,cbok);
},
'libs': async() => {
	let arr=[];
	let rv;
	let hashes = "#".rep(Math.ceil((termobj.w-11)/2));
	arr=arr.concat(fmt("Here are the directory listings of the locally cached and server-side command libaries that are available for importing into the shell's runtime environment. To refer to a library, remove its file path up to '/libs/', replace subdirectories with a '.', and remove the '.js' extension, for example:"));
	arr.push("$ import fs");
	arr.push("$ import math.stats");
	arr.push(" ");
	arr.push(`${hashes}\xa0\xa0Cached\xa0\xa0${hashes}`);
	arr.push(" ");
	arr=arr.concat(...(await do_ls(["-pfR", "/code/libs"])));
	arr.push(" ");
	arr.push(`${hashes}\xa0\xa0Server\xa0\xa0${hashes}`);
	arr.push(" ");
	arr=arr.concat(...(await do_ls(["-pfR", "/site/root/code/libs"])));
	let str = arr.join("\n");
	let mod = NS.mods["util.pager"];
	if (!mod){
		wout(str);
		cbok();
		return;
	}
	let pager = new mod(Core, shell_exports);
	pager.init(str.split("\n"),`libs`,cbok);
},
'swon':async()=>{if(await capi.initSW())return cbok("The service worker has been registered");cberr("There was a problem registering the service worker");},
'swoff':async()=>{if(await capi.initSW(true))return cbok("The service worker has been unregistered");cberr("There was a problem unregistering the service worker");},
'swurl':()=>{try{cbok(window.location.origin+(decodeURIComponent(navigator.serviceWorker.controller.scriptURL.split("?")[1]).replace(/^path=\./,"")));}catch(e){cberr("ServiceWorker not activated!");}},

jseval:(args)=>{//«
const runit = s=>{
	if (!s.length){
		cbok();
		return;
	}
//log(s);
	run_js_script(s, "eval", [], "eval");
};
let didrun=false;
if (!args.length||args[0]=="-"){
	let s = '';
	read_stdin(ret => {
		if (isobj(ret) && ret.EOF) {
			if (didrun) return;
			runit(s);
			return;
		}
		if (isarr(ret)) {
			if (!isstr(ret[0])) return cberr("Bad input");
			didrun=true;
			runit(ret.join("\n"));
		}
		else if (isstr(ret)){
			s+=ret+"\n";
		}
		else{
cwarn(ret);
		}
	}, {
		SENDEOF: true
	});
}
else{
	let s = '';
	for (let arg of args) s+= " " + arg;
	runit(s);
}
},//»

»*/

