

export const lib = (comarg, args, Core, Shell)=>{

const NS = window[__OS_NS__];

const COMS = {//«

/*
	'argtest': function(args) {//«
var _ = this.exports;
return cberr("Please port me to lib/Util.js!");
		var sws = get_options(args);
		if (sws == null) {
//			cb(ret_false());
			cberr();
			return;
		}
		var keys = Core.api.getKeys(sws);
		var arr = [];
		arr.push("Switches: " + keys.length);
		for (var i=0; i < keys.length; i++) {
			var key = keys[i];
			if (sws[key] == true) arr.push(key);
			else arr.push("   " + (i+1) + ") " + key + "=> " + sws[key]);
		}
		arr.push("Args: " + args.length);

		for (var i=0; i < args.length; i++) arr.push("   " + (i+1) + ") " + tok_to_string(args[i]));
		cbok(arr);
	},//»
	'linein': function(args) {//«
var _ = this.exports;
return cberr("Please port me to lib/Util.js!");
		var usecb = _.cb;
//		if (next_cb) usecb = next_cb;
		var sws = get_options(args);
		if (sws == null) return;
		var useprompt = null;
		if (sws['p']) useprompt = sws['p'];
		var do_exe = null;
		if (sws['exe']) do_exe = true;
		var retfunc = function(ret_arg) {
			var retstr;
			retstr = ret_arg['lines'][0];
			if (do_exe) {
				parse_bash(retstr, function(retval) {
					usecb(retval);
				});
			}
			else usecb(retstr);
		};
		term_prompt(useprompt, null, retfunc);
	},//»
*/

'pretty':async function(){//«
	let str='';
	let doit=async()=>{
		if (!str.length) return cbok("");
		let modret = await fsapi.getMod("util.pretty");
		if (!modret) return cberr("No pretty");
		let pretty = modret.getmod().js;
		let rv = pretty(str);
		let lines = rv.split("\n");
		for (let ln of lines) wout(ln);
		cbok();
	};
	if (args.length){
		let rv = await NS.api.fs.readFile(args[0], {exports: Shell});
		if (!(isarr(rv)&&isstr(rv[0]))) return cberr("unknown input");
		str = rv.join("\n");
		doit();
		return;
	}
	let done = false;
	read_stdin(async(rv)=>{
		if (rv&&isobj(rv)&&rv.EOF===true){
			if (done) return;
			doit();
			return;
		}
		if (isstr(rv)) {
			if (!rv) str = rv;
			else str += "\n"+rv;
		}
		else if (isarr(rv)&&isstr(rv[0])) {
			if (!rv) str = rv.join("\n");
			else str += "\n"+rv.join("\n");
		}
		else {
			done = true;
			return cberr("Can only handle strings in stdin!");
		}
	},{SENDEOF:true});

},//»

'lstbytes':function(){//«
let nb = 0; 
for (let k in localStorage) nb += (((localStorage[k].length || 0) + (k.length || 0)) * 2);
cbok(""+nb);
},//»
	'fslice': async function() {//«
		var fname = args.shift();
		var str1 = args.shift();
		var str2 = args.shift();
		if (!(fname&&str1)) return cberr("BADARGS");
		var tmp;
		if (!str2) {
			str2 = str1;
			str1 = "0";
		}
		var p1, p2;
		p1 = parseInt(str1);
		p2 = parseInt(str2);
		if (!(Number.isFinite(p1)&&Number.isFinite(p2))) return cberr("Not nums!");
		if (p1 >= p2) return cberr("BADORDER");
		let fullpath = fs.get_fullpath(fname, cur_dir);
		let rv = await fsapi.pathToNode(fullpath);
		if (!rv) return cberr(`${fullpath}: does not exist`);
		let ret = await fsapi.readFile(fullpath, {BINARY: true});
		if (!ret) return cberr(`${fullpath}: could not get file contents`);
		let arr = ret.slice(p1, p2);
		let str = "";
		arr.forEach(function(v) {str += (v.toString(16).uc()).lpad(2, "0") + " ";});
		wout(str);
		cbok();

	},//»
	'declare': function() {//«
		var sws = failopts(args, {SHORT:{a:1, A:1, r:1, o:1}, LONG:{array:1, object:1}});
		if (!sws) {return;}
		var name = args.shift();
		if (!name) {suse('[-aAro] -- name'); return;}
		var rdonly = null;
		if (sws['r']) rdonly = true;
		if (sws['array'] || sws['a']) {
			if (name == true || name.match(/^[0-9]/)) {
				sherr(name+": invalid name");
			}
			if (ENV[name]) serr(name+": already exists");
			else{
				ENV[name] = [];
				if (rdonly) constant_vars[name] = true;
				cbok();
			}
		}
		else if (sws['object'] || sws['A'] || sws['o']) {
			if (name == true || name.match(/^[0-9]/)) {
				sherr(name+": invalid name");
			}
			if (!ENV[name]) {
				ENV[name] = {};
				if (rdonly) constant_vars[name] = true;
				cbok();
			}
			else serr(name+": already exists");
		}
		else if (rdonly) {
			constant_vars[name] = true;
			cbok();
		}
	},//»
	'pop': function() {//«
		var name = args.shift();
		if (!name){suse("name"); return}
		var setto = args.shift();
		var obj = var_env[name];
		if (obj) {
			if (obj.length != undefined) {
				var val = obj.pop();
				if (!val) val = "";
				if (setto) set_var_str(setto, val);
				cbok(val);
			}
			else serr(name+": not an array");
		}
		else serr(name+": undefined");
	},//»
	'push': function() {//«
		var name = args.shift();
		var val = args.shift();
		if (name && val){}
		else {suse("name value"); return}
		var obj = var_env[name];
		if (obj) {
			if (obj.length != undefined) {
				obj.push(val);
				cb(ret_true());
			}
			else serr(name+": not an array");
		}
		else serr(name+": undefined");
	},//»
	'unshift': function() {//«
		var name = args.shift();
		var val = args.shift();
		if (name && val){}
		else {suse("name value"); return}
		var obj = var_env[name];
		if (obj) {
			if (obj.length != undefined) {
				obj.unshift(val);
				cb(ret_true());
			}
			else serr(name+": not an array");
		}
		else serr(name+": undefined");
	},//»
	'setvar': function() {//«
		if (!topwinid) {
			cberr();
			return;
		}
		var name = args.shift();
		if (!name) {use();return;}
		file_or_stdin(null, function(ret) {
			if (!ret) {
				serr("no input");
				return;
			}
			try {
				var obj = JSON.parse(ret.join("\n"));
				var_env[name] = obj;
				cb(ret_true());
			}
			catch(e) {
				serr("input is not valid json");
			}
		});
	},//»
	'date': function() {//«
		//All atoms are like://«
		// % flag width char
		// flag:=
		//		-	nopad
		//		_	spaces
		//		0	zeros
		//		^   uppercase
		//		# opposite case
		//
		//	width:= decimal width
		//	char:=
		//		%	literal
		//		a	abbr weekday: 	Sun
		//		A	full weekday:	Monday
		//		b	abbr month:		Jan
		//		B	full month:		January
		//		c	date and time:	Mon 02 Jan 2010 05:01:14 AM PST 
		//		C	century:		The first 2 digits of the year (20)
		//		d	day of month:	01
		//		D	date: %m/%d/%y
		//		e 	day of month, space padded: %_d
		//		F	full date: %Y-%m-%d
		//		g	last 2 digits of year of ISO week number (14)
		//		G	year of ISO week number (2014)
		//		h	:= %b
		//		H	hour (00..23)
		//		I	hour (01..12)
		//		j	day of year (001..366)
		//		k	:= %_H
		//		l	:= %_I
		//		m	month (01..12)
		//		M	minute (00..59)
		//		n	newline
		//		N 	nanoseconds
		//		p 	AM/PM
		//		P 	:= %p (lower case)
		//		r 	12-hour clock time (05:12:34 PM)
		//		R	:= %H:%M 24-hour hour and minute
		//		s	unix timestamp
		//		S	second (00..60)
		//		t 	tab
		//		T	:= %H:%M:%S
		//		u	day of week (1..7, 1==Monday)
		//		U	week number of year (0..53, Sunday as first day of week)
		//		V	ISO week number (01..53, Monday is first day of week)
		//		w	day of week (0..6, 0==Sunday)
		//		W	week number of year (0..53, Monday is first day)
		//		x	:= %m/%d/%y
		//		X	%H:%M:%S
		//		y	last 2 digits of year
		//		Y	Year
		//		z	+hhmm numeric time zone (-0500)
//»
		var date = new Date();//«
		var types = {
			'%': "%",
			'd': date.getDate(),
			'u': (date.getDay() + 1),
			'w': date.getDay(),
			'Y': date.getFullYear(),
			'H': date.getHours(),
			'M': date.getMinutes(),			
			'm': (date.getMonth() + 1),
			'S': (date.getSeconds()),
			's': (Math.floor(date.getTime()/1000))
		}//»
		function mk_ent(flag, wid, ch) {//«
			if (!flag) flag = "";
			if (!wid) wid = "";
			var str;
			var gotval = types[ch];
			var pref = "";
			if (gotval) {
				str = gotval + "";
				var diff = wid - str.length;
				if (diff > 0) {
					if (flag == "0") pref = "0".rep(diff);
					else if (flag == "_") pref = " ".rep(diff);
					str = pref + str;
				}
				return str;
			}
			else return "%" + flag + wid + ch;
		}//»
		var strarg = args.shift();//«
		var marr;
		var pref, flag, wid, ch;
		if (strarg) {
			var rep = "";
			while (marr = strarg.match(/^(.*?)%([-_0^#])?([0-9]+)?([%AaBbCcdDeFgGhHIjklmMnNPprRsStTuUVwWxXyYz])/)) {
				if (marr[1]) pref = marr[1];
				else pref = "";
				if (marr[2]) flag = marr[2];
				if (marr[3]) wid = parseInt(marr[3]);
				ch = marr[4];
				strarg = strarg.replace(/^.*?%([-_0^#])?([0-9]+)?[%AaBbCcdDeFgGhHIjklmMnNPprRsStTuUVwWxXyYz]/, "");
				rep = rep + pref + mk_ent(flag, wid, ch);
			}
			rep += strarg;
			cbok(rep);
		}
		else cbok(date.toString().replace(/[\(\)]/g, ""));
//»			
	},//»
	'base64': function() {//«
		const DEFAULT_WRAP = 76;
		let sws = failopts(args, {SHORT:{d:1, w:3, m:3},LONG:{decode:1, wrap:3, mime:3}})
		if (!sws) return;
		let if_decode = sws.decode||sws.d;
		let mime = sws.mime||sws.m;
		let if_getbin = !if_decode;
		let wrap_str = sws.wrap||sws.w;
		if (if_decode && wrap_str) return cberr("Conflicting arguments: decoding and line wrapping");
		let wrap_num;
		let no_wrap = false;
		if (wrap_str) {
			wrap_num = wrap_str.pi({NOTNEG:1});
			if (isNaN(wrap_num)) return cberr("Wrap value must be integer >= 0");
			if (wrap_num==0) no_wrap = true;
		}
		else wrap_num = DEFAULT_WRAP;
		let fname = args.shift();
		let doit=async (ret)=>{//«
			if (!ret) {
				if (fname) cberr("could not stat: " + fname);
				return;
			}
			if (if_decode){//«
				let ret2;
				try {
					ret2 = await Core.api.textToBytes(atob(ret));
				}
				catch(e){
					return cberr(e.message);
				}
				if (mime) wout(new Blob([ret2],{type:mime}));
				else wout((new TextDecoder('ascii')).decode(ret2));
				cbok();
			}//»
			else {//«
				const tobinstr = (bytes)=>{//«
					let binary = '';
					let len = bytes.byteLength;
					for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
					return binary;
				};//»
				const textout=(textret)=>{//«
					if (!textret) return cberr("unable to convert the blob");
					if (no_wrap) return cbok(textret);
					let str = "";
					let arr = [];
					while (textret.length){
						arr.push(textret.slice(0, wrap_num));
						textret = textret.slice(wrap_num);
					}
					wout(arr.join("\n"));
					wout(EOF);
					cbok();
				};//»
				const blob_to_text=(blob, cb)=>{//«
					let reader = new FileReader();
					reader.onloadend = ()=>{
						textout(btoa(tobinstr(new Uint8Array(reader.result))));
					}
					reader.onerror = ()=>{
						textout();
					}
					reader.readAsArrayBuffer(blob);
				};//»
				if (ret instanceof Uint8Array) return textout(btoa(tobinstr(ret)));
				blob_to_text(new Blob([ret],{type:"blob"}));
			}//»
		}//»
		if (!fname) {//«
			let str = "";
			let iter=0;
			read_stdin(ret=>{
				if (util.isobj(ret)&&ret.EOF){
					doit(str);
					return;
				}
				if (ret instanceof Uint8Array) {
					str = ret;
					return;
				}
				if (typeof ret !== "string") return cberr("Expected string input on stdin");
				if (iter) str += "\n"+ret;
				else str = ret;
				iter=1;
			},{SENDEOF:true})
		}//»
		else arg2con(fname, doit, if_getbin);
	},//»
	'crc32': function(){//«
		var _ = this.exports;
		util.crc32(args.join(" "), arr=>{
			let str = '';
			for (let ch of arr) str += ch.toString(16).lpad(2,"0");
			cbok(str);
		},"bytes");
	},//»
	'sha1sum':function(){digest("SHA-1")},
	'sha256sum':function(){digest("SHA-256")},
	'sha384sum':function(){digest("SHA-384")},
	'sha512sum':function(){digest("SHA-512")},

}//»
if (!comarg) return Object.keys(COMS);

//Imports«
//var log = Desk.log;


//const {suse,sherr,ENV,failopts,cbok,cberr,wout,werr,termobj,wrap_line} = Shell;
const {log,cwarn,cerr,globals}=Core;
const {util,fs}=globals;
const {
strnum,
isnotneg,
isnum,
isid,
isarr,
isstr,
isobj,
make,
}=util;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
const{
	wrap_line,
	cbeof,
	sherr,
	get_options,
	termobj,
	cur_com_name,
	read_file_args_or_stdin,
	read_stdin,
	cur_dir,
	constant_vars,
	is_writable,
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
	ENV
}=Shell;
//»


const fsapi = NS.api.fs;

function digest(which){//«
let fname = args.pop();
let doit=(buf)=>{
	crypto.subtle.digest(which, buf)
	.then(ret=>{
		let arr = new Uint8Array(ret);
		let str = '';
		for (let ch of arr) str += ch.toString(16).lpad(2,"0");
		wout(str);
		cbok();
	})
	.catch(e=>{
		cberr(e.message);
	})
}
if (!fname) {
	let str = "";
	let iter=0;
	let arr = [];
	read_stdin(async ret=>{
		if (util.isobj(ret)&&ret.EOF){
			doit(await Core.api.strToBuf(arr.join("\n")));
			return;
		}
		if (typeof ret !== "string") return cberr("Expected string input on stdin");
		arr.push(ret);
	},{SENDEOF:true})
}
else {
	atbc(fname,ret=>{
		if (!ret) return cberr("could not stat: " + fname);
		doit(ret.buffer);
	});
}

}//»



COMS[comarg](args);


}

