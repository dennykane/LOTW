/*syscalls«

restart_syscall      0
exit		  1
fork		  2
read		  3
write		  4
open		  5
close		  6
waitpid		  7
creat		  8
link		  9
unlink		 10
execve		 11
chdir		 12
time		 13
mknod		 14
chmod		 15
lchown		 16
break		 17
oldstat		 18
lseek		 19
getpid		 20
mount		 21
umount		 22
setuid		 23
getuid		 24
stime		 25
ptrace		 26
alarm		 27
oldfstat		 28
pause		 29
utime		 30
stty		 31
gtty		 32
access		 33
nice		 34
ftime		 35
sync		 36
kill		 37
rename		 38
mkdir		 39
rmdir		 40
dup		 41
pipe		 42
times		 43
prof		 44
brk		 45
setgid		 46
getgid		 47
signal		 48
geteuid		 49
getegid		 50
acct		 51
umount2		 52
lock		 53
ioctl		 54
fcntl		 55
mpx		 56
setpgid		 57
ulimit		 58
oldolduname	 59
umask		 60
chroot		 61
ustat		 62
dup2		 63
getppid		 64
getpgrp		 65
setsid		 66
sigaction		 67
sgetmask		 68
ssetmask		 69
setreuid		 70
setregid		 71
sigsuspend		 72
sigpending		 73
sethostname	 74
setrlimit		 75
getrlimit		 76   
getrusage		 77
gettimeofday	 78
settimeofday	 79
getgroups		 80
setgroups		 81
select		 82
symlink		 83
oldlstat		 84
readlink		 85
uselib		 86
swapon		 87
reboot		 88
readdir		 89
mmap		 90
munmap		 91
truncate		 92
ftruncate		 93
fchmod		 94
fchown		 95
getpriority	 96
setpriority	 97
profil		 98
statfs		99
fstatfs		100
ioperm		101
socketcall		102
syslog		103
setitimer		104
getitimer		105
stat		106
lstat		107
fstat		108
olduname		109
iopl		110
vhangup		111
idle		112
vm86old		113
wait4		114
swapoff		115
sysinfo		116
ipc		117
fsync		118
sigreturn		119
clone		120
setdomainname	121
uname		122
modify_ldt		123
adjtimex		124
mprotect		125
sigprocmask	126
create_module	127
init_module	128
delete_module	129
get_kernel_syms	130
quotactl		131
getpgid		132
fchdir		133
bdflush		134
sysfs		135
personality	136
afs_syscall	137
setfsuid		138
setfsgid		139
_llseek		140
getdents		141
_newselect		142
flock		143
msync		144
readv		145
writev		146
getsid		147
fdatasync		148
_sysctl		149
mlock		150
munlock		151
mlockall		152
munlockall		153
sched_setparam		154
sched_getparam		155
sched_setscheduler		156
sched_getscheduler		157
sched_yield		158
sched_get_priority_max	159
sched_get_priority_min	160
sched_rr_get_interval	161
nanosleep		162
mremap		163
setresuid		164
getresuid		165
vm86		166
query_module	167
poll		168
nfsservctl		169
setresgid		170
getresgid		171
prctl              172
rt_sigreturn	173
rt_sigaction	174
rt_sigprocmask	175
rt_sigpending	176
rt_sigtimedwait	177
rt_sigqueueinfo	178
rt_sigsuspend	179
pread64		180
pwrite64		181
chown		182
getcwd		183
capget		184
capset		185
sigaltstack	186
sendfile		187
getpmsg		188
putpmsg		189
vfork		190
ugetrlimit		191
mmap2		192
truncate64		193
ftruncate64	194
stat64		195
lstat64		196
fstat64		197
lchown32		198
getuid32		199
getgid32		200
geteuid32		201
getegid32		202
setreuid32		203
setregid32		204
getgroups32	205
setgroups32	206
fchown32		207
setresuid32	208
getresuid32	209
setresgid32	210
getresgid32	211
chown32		212
setuid32		213
setgid32		214
setfsuid32		215
setfsgid32		216
pivot_root		217
mincore		218
madvise		219
getdents64		220
fcntl64		221
//* 223 is unused
gettid		224
readahead		225
setxattr		226
lsetxattr		227
fsetxattr		228
getxattr		229
lgetxattr		230
fgetxattr		231
listxattr		232
llistxattr		233
flistxattr		234
removexattr	235
lremovexattr	236
fremovexattr	237
tkill		238
sendfile64		239
futex		240
sched_setaffinity	241
sched_getaffinity	242
set_thread_area	243
get_thread_area	244
io_setup		245
io_destroy		246
io_getevents	247
io_submit		248
io_cancel		249
fadvise64		250
// 251 is available for reuse (was briefly sys_set_zone_reclaim)
exit_group		252
lookup_dcookie	253
epoll_create	254
epoll_ctl		255
epoll_wait		256
remap_file_pages	257
set_tid_address	258
timer_create	259
timer_settime	260
timer_gettime	261
timer_getoverrun	262
timer_delete	263
clock_settime	264
clock_gettime	265
clock_getres	266
clock_nanosleep	267
statfs64		268
fstatfs64		269
tgkill		270
utimes		271
fadvise64_64	272
vserver		273
mbind		274
get_mempolicy	275
set_mempolicy	276
mq_open 		277
mq_unlink		278
mq_timedsend	279
mq_timedreceive	280
mq_notify		281
mq_getsetattr	282
kexec_load		283
waitid		284
// sys_setaltroot	285
add_key		286
request_key	287
keyctl		288
ioprio_set		289
ioprio_get		290
inotify_init	291
inotify_add_watch	292
inotify_rm_watch	293
migrate_pages	294
openat		295
mkdirat		296
mknodat		297
fchownat		298
futimesat		299
fstatat64		300
unlinkat		301
renameat		302
linkat		303
symlinkat		304
readlinkat		305
fchmodat		306
faccessat		307
pselect6		308
ppoll		309
unshare		310
set_robust_list	311
get_robust_list	312
splice		313
sync_file_range	314
tee		315
vmsplice		316
move_pages		317
getcpu		318
epoll_pwait	319
utimensat		320
signalfd		321
timerfd_create	322
eventfd		323
fallocate		324
timerfd_settime	325
timerfd_gettime	326
signalfd4		327
eventfd2		328
epoll_create1	329
dup3		330
pipe2		331
inotify_init1	332
preadv		333
pwritev		334
rt_tgsigqueueinfo	335
perf_event_open	336
recvmmsg		337
fanotify_init	338
fanotify_mark	339
prlimit64		340
name_to_handle_at	341
open_by_handle_at	342
clock_adjtime	343
syncfs		344
sendmmsg		345
setns		346
process_vm_readv	347
process_vm_writev	348
kcmp		349
finit_module	350
sched_setattr	351
sched_getattr	352
renameat2		353
seccomp		354
getrandom		355
memfd_create	356
bpf		357
execveat		358
socket		359
socketpair		360
bind		361
connect		362
listen		363
accept4		364
getsockopt		365
setsockopt		366
getsockname	367
getpeername	368
sendto		369
sendmsg		370
recvfrom		371
recvmsg		372
shutdown		373
userfaultfd	374
membarrier		375
mlock2		376
copy_file_range	377
preadv2		378
pwritev2		379
pkey_mprotect	380
pkey_alloc		381
pkey_free		382
statx		383
arch_prctl		384

»*/

export const lib = (comarg, args, Core, Shell)=>{

const COMS = {//«

'parsewasm':function(){//«

let sws = failopts(args,{
	LONG:{
		nglbimps:1,
		nglbexps:1,
		nfncimps: 1,
		nfncexps: 1,
		elements: 1,
		start: 1,
		type:1,
		toplevel:1,
		imports:1,
		exports:1,
		decls: 1,
		globals: 1,
//		code: 3,
		data:1,
		fmt:3,
//		funcnumtoname:3,
		funcnamebyindex:3,
		indexbyfuncname:3,
		codebyname:3,
		codebyindex:3,
		sigbyname:3,
		sigbyindex:3
	}
});
if (!sws) return;

let fname = args.shift();
let ret;
let dofuncs = [];
atbc(fname, wasm=>{//«
if (!wasm) return cberr("Got no wasm!");

let parser = new WasmParser(wasm);
//nglbimps:1, nfncimps: 1, nfncexps: 1, nglbexps:1,
let getnum;
let funcnum = null;
let funcfmt = "text";
if (sws.fmt){//«
	if (sws.fmt.match(/^t(ext)?$/)){
		funcfmt = "text";
	}
	else if (sws.fmt.match(/^b(in(ary)?)?/)){
		funcfmt = "bin";
	}
	else return cberr(sws.fmt+": invalid function format");
}//»

if (sws.sigbyindex) {//«
	let str = sws.sigbyindex;
	if (!okint(str)) return cberr(str+": invalid function number");
	let index = parseInt(str);
	dofuncs.push(()=>{
		let gotret;
		let outarr = [];
		let doit=()=>{return parser.dump_types({OP:OP_GET_SIG_BY_NUM, VAL: gotret});}
		gotret = parser.dump_imports({OP: OP_GET_TYPE_BY_NUM, WHICH: FUNCTION, VAL: index, OUT: outarr}, true);
		if (!(gotret===null)) return doit();
		gotret = parser.dump_decls({OP: OP_GET_DECL_TYPE, VAL: (index-outarr[0])});
		if (gotret===null){
//cerr("WHOA! DIDN'T GET A DECL WITH A VALUE=="+(index-num_imports)+"!!!");
			return;
		}
		return doit();
	});
}//»
if (sws.sigbyname) {//«
	dofuncs.push(()=>{
		let outarr = [];
		let doit=()=>{return parser.dump_types({OP:OP_GET_SIG_BY_NUM, VAL: gotret});}
		let gotret = parser.dump_imports({OP: OP_GET_TYPE_BY_NAME, WHICH: FUNCTION, VAL: sws.sigbyname, OUT: outarr}, true);
		if (!(gotret===null)) return doit();
		let index = parser.dump_exports({OP: OP_MATCH_NAME, WHICH: FUNCTION, VAL: sws.sigbyname}, true);
		if (index == null) return false;
		gotret = parser.dump_decls({OP: OP_GET_DECL_TYPE, VAL: (index-outarr[0])});
		if (gotret===null){
cerr("WHOA! DIDN'T GET A DECL WITH A VALUE=="+(index-outarr[0])+"!!!");
			return;
		}
		return doit();
	});
}//»
if (sws.codebyname) {//«
	dofuncs.push(()=>{
		let index = parser.dump_exports({OP: OP_MATCH_NAME, WHICH: FUNCTION, VAL: sws.codebyname})
		if (index===null) return false;
		let num_imports = parser.dump_imports({OP: OP_GET_COUNT, WHICH: FUNCTION}, true);
		let body_num = index - num_imports;
		return parser.dump_code(body_num, funcfmt);
	});
}//»
if (sws.codebyindex) {//«
	let str = sws.codebyindex;
	if (!okint(str)) return cberr(str+": invalid function number");
	let num = parseInt(str);
	dofuncs.push(()=>{
		let num_imports = parser.dump_imports({OP: OP_GET_COUNT, WHICH: FUNCTION}, true);
		let body_num = num - num_imports;
//cwarn("Getting body number: " + body_num);
		return parser.dump_code(body_num, funcfmt);
	});
}//»
if (sws.funcnamebyindex) {//«
	let str = sws.funcnamebyindex;
	if (!okint(str)) return cberr(str+": invalid function number");
	let num = parseInt(str);
	dofuncs.push(()=>{
//cwarn("HI");
		let gotret = parser.dump_imports({OP: OP_GET_NAME_AT_NUM, WHICH: FUNCTION, VAL: num}, true);
//log(gotret);
		if (util.isstr(gotret)) {
			wout(gotret);
			return true;
		}
		gotret = parser.dump_exports({OP: OP_GET_NAME_AT_NUM, WHICH: FUNCTION, VAL: num}, true);
		if (util.isstr(gotret)) {
			wout(gotret);
			return true;
		}
		return false;
	});
}//»
if (sws.indexbyfuncname) {//«
	dofuncs.push(()=>{
		let gotret = parser.dump_imports({OP: OP_GET_NUM_BY_NAME, WHICH: FUNCTION, VAL: sws.indexbyfuncname}, true);
		if (gotret!==null) {
			wout(""+gotret);
			return true;
		}
		gotret = parser.dump_exports({OP: OP_MATCH_NAME, WHICH: FUNCTION, VAL: sws.indexbyfuncname}, true);
		if (gotret!==null) {
			wout(""+gotret);
			return true;
		}

//		if (util.isstr(gotret)) {
//			wout(gotret);
//			return true;
//		}
		return false;
	});
}//»
if (sws.nglbimps) dofuncs.push(()=>{return parser.dump_imports({OP: OP_GET_COUNT, WHICH: GLOBAL});});
if (sws.nfncimps) dofuncs.push(()=>{return parser.dump_imports({OP: OP_GET_COUNT, WHICH: FUNCTION});});
if (sws.nglbexps) dofuncs.push(()=>{return parser.dump_exports({OP: OP_GET_COUNT, WHICH: GLOBAL});});
if (sws.nfncexps) dofuncs.push(()=>{return parser.dump_exports({OP: OP_GET_COUNT, WHICH: FUNCTION});});
if (sws.toplevel) dofuncs.push(parser.dump_toplevel);
if (sws.imports) dofuncs.push(parser.dump_imports);
if (sws.exports) dofuncs.push(parser.dump_exports);
if (sws.data) dofuncs.push(parser.dump_data);
if (sws.type) dofuncs.push(parser.dump_types);
if (sws.decls) dofuncs.push(parser.dump_decls);
if (sws.globals) dofuncs.push(parser.dump_globals);
if (sws.start) dofuncs.push(parser.dump_start);
if (sws.elements) dofuncs.push(parser.dump_elements);

if (!dofuncs.length) return cberr("Nothing to do!");

for (let func of dofuncs){
	try{
		ret = func();
	}
	catch(e){
		cerr(e);
		return cberr(e.message);
	}
	if (!ret) return cberr("There was an error");

}

cbok();

});//»

},//»
'lebdec':function(){//«
	if (!args.length) return cbok();
	let arr = [];
	let didbreak = false;
	let argsin=[];
	for (let str of args) argsin = argsin.concat(str.split(/ +/));

	for (let n  of argsin) {
		let num = parseInt(n);
		if (num > 255) return cberr("Illegal byte value: " + num);
		else if (num < 0) return cberr("Got negative value: " + num);
		let binstr = num.toString(2);
		if (binstr.length < 8){
			arr.unshift(binstr);
			didbreak = true;
			break;
		}
		arr.unshift(binstr.slice(1));
	}
	if (!didbreak) return cberr("Invalid byte sequence");
	wout(parseInt(arr.join(""), 2)+"");
	cbok();

},//»
'lebenc':function(){//«
	if (!args.length) return cbok();
	if (args.length > 1) return _.suse("number");
	let num = parseInt(args[0]);
	let bits = num.toString(2);
	let arr = [];
	while (true){
		if (bits.length <= 7){
			arr.push(parseInt(bits,2));
			break;
		}
		let end = bits.slice(bits.length-7);
		arr.push(parseInt("1"+end,2));
		bits = bits.slice(0, bits.length-7);
	}
	let hexout = "";
	for (let n of arr) {
		let s = n.toString(16);
		if (s.length==1) s = "0"+s;
		hexout += "0x"+s+" ";
	}
	wout(hexout.replace(/ $/,""));
	cbok();
},//»
'cheezwasm':function(){//«

var fname = args.shift();
if (!fname) return cberr("Need filename!");
let mainfunc = args.shift();
if (!mainfunc) {
	mainfunc = "main";
}
wout("Using main function: " + mainfunc);
let func;
let run = _=>{
	let got;
	wout("Calling: " + mainfunc + " with " + args.length + " arguments!");
	if (args.length) {
		for (let i=0; i < args.length; i++) args[i] = parseInt(args[i]);
		 got = func(...args);
	}
	else got = func();
	wout("Returned: " + got);
	cbok();

}


let info = {//«
	env: {//«
		log: str=>{console.log(str)}
	}//»
};//»

_.atbc(fname, wasm=>{//«
	if (!wasm) return cberr("Got no wasm!");

	WebAssembly.instantiate(wasm, info).then(ret=>{
		let inst = ret.instance;
		let	mod = ret.module;
		let	exp = inst.exports;
		func = exp[mainfunc];
		if (!func) return cberr("Not an exported function: " + mainfunc);
		run();
	}).catch(e=>{
log(e);
		cberr(e.message);
	})

});//»

},//»
'ezwasm':function(){//«

/*HOWTO IMPORT A JS FUNCTION INTO C/C++«

*****************     program.c   *************************

(pound) include <Math.h>

void consoleLog (float num);

float getSqrt (float num) {
  consoleLog(num);
  return sqrt(num);
}


***********************************************************

$ emcc -s "EXPORTED_FUNCTIONS=['_getSqrt']" -s ERROR_ON_UNDEFINED_SYMBOLS=0 program.c -o modname.js

Need to grep these variables from modname.js:

var STATIC_BUMP = X;

Module['wasmTableSize'] = Y;
Module['wasmMaxTableSize'] = Z;

»*/

//Standard imports«
var err = cberr;
var ok = cbok;
var out = wout;
//»

//Com init«
var which = args.shift();
if (!which) return cberr("No arg!");

let numstr = args.shift();
let num=100;
if (numstr){
	num = util.strnum(numstr);
	if (!isint(num)) return err("Invalid number: " + numstr);
	if (num <= 0) return err("Want a positive number");
}
//»

//Funcs«

let abort = mess=>{throw mess;}
let nogrow = _=>{abort("Cannot grow memory!");}
let invfunc = _=>{abort("Invalid function called!");}
let noimpl = name=>{abort("Not implenthing: " + name);}
let noop = _=>{}

function assert(condition, text) {if (!condition) {abort('Assertion failed: ' + text);}}

function staticAlloc(size) {//«
  assert(!staticSealed);
  var ret = STATICTOP;
  STATICTOP = (STATICTOP + size + 15) & -16;
  assert(STATICTOP < TOTAL_MEMORY, 'not enough memory for static allocation - increase TOTAL_MEMORY');
  return ret;
}//»
function alignMemory(size, factor) {//«
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  var ret = size = Math.ceil(size / factor) * factor;
  return ret;
}//»

//»

//Init«
const TOTAL_MEMORY = 16*1024*1024;
const TOTAL_STACK = 5242880;
const WASM_PAGE_SIZE = 65536;

const STATIC_BUMP = 1536;
const wasmTableSize = 0;
const wasmMaxTableSize = 0;

var TABLE_SIZE = wasmTableSize;
var MAX_TABLE_SIZE = wasmMaxTableSize;

var GLOBAL_BASE = 1024;
var STACK_ALIGN = 16;
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
var staticSealed = false;
var tempDoublePtr;

STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
STATICTOP = STATIC_BASE + STATIC_BUMP;

tempDoublePtr = STATICTOP;STATICTOP += 16;

STATIC_BASE = GLOBAL_BASE;
DYNAMICTOP_PTR = staticAlloc(4);
STACK_BASE = STACKTOP = alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = alignMemory(STACK_MAX);
assert(tempDoublePtr % 8 == 0);

let memory = new WebAssembly.Memory({
	'initial': TOTAL_MEMORY / WASM_PAGE_SIZE,
	'maximum': TOTAL_MEMORY / WASM_PAGE_SIZE 
});
let table = new WebAssembly.Table({
	'initial': TABLE_SIZE,
	'maximum': MAX_TABLE_SIZE,
	'element': 'anyfunc'
});

//log(memory.buffer);

let info = {//«

	env: {//«
		memory: memory,
		table: table,
		_consoleLog: str=>{console.log(str)},
		enlargeMemory: _=>{nogrow();},
		abortStackOverflow: _=>{abort("Stack Overflow")},
		abortOnCannotGrowMemory: nogrow,
		getTotalMemory: _=>{return TOTAL_MEMORY},
		nullFunc_ii: _=>{invfunc()},
		nullFunc_iiii: _=>{invfunc()},
		___setErrNo: _=>{noimpl("setErrNo")},
		___syscall140: _=>{noimpl("___syscall140")},
		___syscall146: _=>{noimpl("___syscall146")},
		___syscall54: _=>{noimpl("___syscall54")},
		___syscall6: _=>{noimpl("___syscall6")},
		_emscripten_memcpy_big: _=>{noimpl("_emscripten_memcpy_big")},
//		: _=>{noimpl("")},
//		: _=>{noimpl("")},
		___lock: noop,
		___unlock: noop,
		memoryBase: STATIC_BASE,
		tableBase: 0,
		DYNAMICTOP_PTR: DYNAMICTOP_PTR,
		tempDoublePtr: tempDoublePtr,
		STACKTOP: STACKTOP, 
		STACK_MAX: STACK_MAX
	},//»
	global:{//«
      'NaN': NaN,
      'Infinity': Infinity
	}//»

};//»

let mod, inst, exp;
//In HEAPU8, you have 16,777,216 8 bit numbers with which to fucking DO ANYTHING!!!
let HEAPU8 = new Uint8Array(memory.buffer);


//»

let run=_=>{//«
//log(mem);
	let ret;
	out("Getting the square root of: " + num);
	ret = exp._getSqrt(num);
	out("Returned: " + ret);
	ok();
}//»

Core.get_wasm(which,ret=>{//«
	if (!ret) return err("No wasm: " + which);
	WebAssembly.instantiate(ret, info)
	.then(ret2=>{
		inst = ret2.instance;
		mod = ret2.module;
		exp = inst.exports;
log(exp);
		run();
	},
	e=>{
		err(e);
	})
});//»

},//»
'walt':async function(){//«
	var fname = args.shift();
	let mod;
	if (!fname) return cberr("Need filename!");
	let ret = await fsapi.getMod('util.wasm.walt');
	if (!(ret&&ret.Walt)) return cberr("No walt module!");
	mod = ret.Walt
	ret = await fsapi.readFile(normpath(fname));
	if (!ret) return cberr(fname+": not found");
	let out;
	try {
		out = mod.compile(ret.join("\n"));
	}
	catch(e){
log(e);
		cberr(e.message);
		return;
	}
	if (!out) return cberr("No compiler output!");
	let blob = new Blob([out.buffer()],{type:"application/wasm"});
	woutobj(blob);
	cbok();
},//»
'runwasm':async function(){//«
	var fname = args.shift();
	if (!fname) return cberr("Need filename");
	var funcname = args.shift();
	if (!funcname) return cberr("Need function name");
	var badarg = ()=>{
		cberr("Expected JSON parseable boolean, int, float, or null  arguments!");
	}
	let ret = await fsapi.readFile(normpath(fname),{BINARY: true});
	if (!ret) return cberr(fname+": not found");
	WebAssembly.instantiate(ret.buffer).then(binmod=> { 
		var exports = binmod.instance.exports
		var func = exports[funcname];
		if (!func) return cberr(funcname+": not a wasm function");
		var outargs=[];
		var ret;
		for (let str of args) {
			let arg;
			try {
				arg = JSON.parse(str);
			}
			catch(e){
				return badarg();
			}
			if (!(isbool(arg)||isnum(arg)||isnull(arg))) return badarg();
			outargs.push(arg);
		}
		try {
			ret = func.apply(null, args)
		}
		catch(e) {
			cberr(e.message);
			return;
		}

		if (!isnull(ret)) ret+="";
		cbok(ret);
	}).catch(e=>{
		cberr(e.message);
	})
},//»

/*
'parsewasm':function(){//«
var _=this.exports;

let sections = ["Type","Import","Function", "Table", "Memory","Global", "Export", "Start", "Element", "Code", "Data"];
//0 indicating a Function import or definition
//1 indicating a Table import or definition
//2 indicating a Memory import or definition
//3 indicating a Global import or definition
let external_kinds = ["Function", "Table", "Memory", "Global"];

var cberr = _.cberr;
var cbok = _.cbok;
var wout = _.wout;
var werr = _.werr;


var sws = _.failopts(args,{SHORT:{e:1,i:1}});
if (!sws) return;
var fname = args.shift();
var dump_imports = sws.i;
var dump_exports = sws.e;

var dump_sections = true;
if (dump_imports||dump_exports) dump_sections = false;

//«
//const TYPE=1;	//Function signature declarations
//const IMPORT=2;	//Import declarations
//const FUNCTION=3;	//Function declarations
//const TABLE=4;	//Indirect function table and other tables
//const MEMORY=5;	//Memory attributes
//const GLOBAL=6;	//Global declarations
//const EXPORT=7;	//Exports
//const START=8;	//Start function declaration
//const ELEMENT=9;	//Elements section
//const CODE=10;	//Function bodies (code)
//const DATA=11;	//Data segments
//»
let leb = LEB128();
let getnum = leb.decodeUInt32;
if (!fname) return cberr("Need filename!");

_.atbc(fname, wasm=>{//«
if (!wasm) return cberr("Got no wasm!");
_=wasm;
//log(wasm);

if (_.length < 8) return cberr("Invalid length (need at least 8 bytes)");

if (!(_[0]==0&&_[1]==97&&_[2]==115&&_[3]==109)) return cberr("Invalid magic: need '\\0asm'!");
if (!(_[4]==1&&_[5]==0&&_[6]==0&&_[7]==0)) return cberr("Looking for version 1!");
let len = _.length;
let cur = 8;

let ret;
let iter = 0;
while (cur < len){//«
	iter++;
	if (iter > 20) return cberr("INFINITE LOOP!!!");
	let which = _[cur];
	if (which==0) return cberr("Not (yet) handling custom sections!");
	else if (which>11) return cberr("Section number > 11: " + which);
	cur++;
	ret = getnum(_, cur);
	if (!Number.isInteger(ret.value)) return cberr("Non integer value returned: " + ret.value);
	let hex = (cur-1).toString(16);
	if (hex.length%2) hex = "0"+hex;
	if (dump_sections) {
		wout("Section#"+which+" @ 0x"+hex+": " + ret.value + " bytes ("+sections[which-1]+")");
		cur=ret.nextIndex;
		cur+=ret.value;
	}
	else {
		cur=ret.nextIndex;
		let nextcur = cur + ret.value;
		if (which==2 && dump_imports) {//«
//log("GOTO: " + (ret.value + ret.nextIndex));
			wout("Found imports:");
			ret = getnum(_,cur);
			let n = ret.value;
//log(n, which, dump_imports);
			cur = ret.nextIndex;
			let j,len;
			let modstr, namestr
			for (let i=0; i < n; i++){//«
				ret = getnum(_, cur);
				len = ret.value;
				cur = ret.nextIndex;
				modstr = "";
				for (j=0; j < len; j++) modstr+=String.fromCharCode(_[cur+j]);
				cur+=j;
				ret = getnum(_, cur);
				len = ret.value;
				cur = ret.nextIndex;
				namestr = "";
				for (j=0; j < len; j++) namestr+=String.fromCharCode(_[cur+j]);
				cur+=j;
				let kindval = _[cur];
				let kind = external_kinds[kindval];
				if (!kind) return cberr("Invalid external kind at: " + cur);
				if (kindval==0) {//«
					wout(i+") "+modstr+"->"+namestr + " [" + kind+"("+(_[++cur])+")]");
					cur++;
				}//»
				else if (kindval==3) {//Global«

					//-0x01 (i.e., the byte 0x7f)	i32 ==> 127
					//-0x02 (i.e., the byte 0x7e)	i64 ==> 126
					//-0x03 (i.e., the byte 0x7d)	f32
					//-0x04 (i.e., the byte 0x7c)	f64
					//let which = 
					//const i32 = "";
					cur++;
					let numval = _[cur];
					let numtype;
					switch(numval){
						case 0x7f: numtype = "i32";
						case 0x7e: numtype = "i64";
						case 0x7d: numtype = "f32";
						case 0x7c: numtype = "f64";
					}
					if (!numtype) return cberr("Unkown value type at: " + cur);
					cur++;
					let mutval = _[cur];
					if (!(mutval==1||mutval==0)) return cberr("Uknown mutability at: " + cur);
					let mutstr = mutval==0 ? "const":"var";
					wout(i+") "+modstr+"->"+namestr + " [" + kind+ "("+numtype+","+mutstr+")]");
					cur++;
				}//»
				else if (kindval==2) {//Memory«
					cur++;
					let if_max = _[cur];
					cur++;
					ret = getnum(_, cur);
					let initial_mem = ret.value;
					let max_mem;
					cur = ret.nextIndex;
					if (if_max){
						ret = getnum(_, cur);
						max_mem = ret.value;
						cur = ret.nextIndex;
						wout(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_mem+"->"+max_mem+")]");
					}
					else wout(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_mem+")]");
				}//»
				else if (kindval==1) {//Table«
//-0x10 (i.e., the byte 0x70)	anyfunc
//-0x20 (i.e., the byte 0x60)	func
					cur++;
					let elem_type = _[cur];
					if (elem_type!=0x70) return cberr("Unknown elem_type != 'anyfunc!'");
					cur++;
					let if_max = _[cur];
					cur++;
					ret = getnum(_, cur);
					let initial_sz = ret.value;
					let max_sz;
					cur = ret.nextIndex;
					if (if_max){
						ret = getnum(_, cur);
						max_sz = ret.value;
						cur = ret.nextIndex;
						wout(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_sz+"->"+max_sz+")]");
					}
					else wout(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_sz+")]");
				}//»
			}//»
			cur = nextcur;
		}//»
		else if (which==7 && dump_exports) {
log("EXPORTS!");
			cur=ret.nextIndex;
			cur+=ret.value;
		}
		else {
			cur=ret.nextIndex;
			cur+=ret.value;
		}
	}
}//»


cbok();


});//»

},//»
*/

}//»
if (!comarg) return Object.keys(COMS);

//Imports«
const NS = window[__OS_NS__];
const fsapi = NS.api.fs;

var Desk = Core.Desk;
var log = Core.log;
var cwarn = Core.cwarn;
var cerr = Core.cerr;
var _;
var globals = Core.globals;
var util = globals.util;

_=util;
var isstr = _.isstr;
var strnum = _.strnum;
var isnotneg = _.isnotneg;
var isid = _.isid;
var isarr = _.isarr;
var isobj = _.isobj;
var isnum = _.isnum;
var isnull = _.isnull;
var isbool = _.isbool;
var isint = _.isint;

var fs = globals.fs;

//const Shell = this._;
const{
normpath,cberr,cbok,wout,werr,failopts,atbc,woutobj,arg2con
}=Shell;

//»
const okint = val=>{//«
    if (typeof val == "number") return true;
    if (typeof val == "string") {
        return (val.match(/^0x[0-9a-fA-F]+$/)||val.match(/^0o[0-7]+$/)||val.match(/^[0-9]+$/));
    }
    return false;
};//» 

//Var«
const TYPE=1;	//Function signature declarations
const IMPORT=2;	//Import declarations
const FUNCTION=3;	//Function declarations
const TABLE=4;	//Indirect function table and other tables
const MEMORY=5;	//Memory attributes
const GLOBAL=6;	//Global declarations
const EXPORT=7;	//Exports
const START=8;	//Start function declaration
const ELEMENT=9;	//Elements section
const CODE=10;	//Function bodies (code)
const DATA=11;	//Data segments

//const GLOBAL_IMPORTS = 1;
//const FUNC_IMPORTS = 2;
//const GLOBAL_EXPORTS = 3;
//const FUNC_EXPORTS = 4;
const OP_GET_COUNT = 12;
const OP_MATCH_NAME = 13;
const OP_GET_NAME_AT_NUM = 14;
const OP_GET_TYPE_BY_NAME = 15;
const OP_GET_SIG_BY_NUM = 16;
const OP_GET_DECL_TYPE = 17;
const OP_GET_TYPE_BY_NUM = 18;
const OP_GET_NUM_BY_NAME= 19;
//»

function WasmParser(buf){//«
let shell_obj = Shell;
//log(shell_obj);
let term = shell_obj.termobj;
let stdout = shell_obj.wout;
let stderr = shell_obj.werr;
let woutarr = shell_obj.woutarr;
let _;
let buflen = buf.length;

let lebdec=pos=>{//«
	let arr = [];
	let didbreak = false;
//	let i=pos, num=buf[pos];
//cwarn("IN: " + pos);
	if (buf[pos]==0) return {val: 0, next: pos+1}
	let i, num;
//	for (i = pos; num = buf[i] || Number.isInteger(num); i++) {
	let max_end = pos + 20;
	for (i = pos; i < buflen; i++) {
//cwarn(num.toString(16));
		let binstr = buf[i].toString(2);
		if (binstr.length < 8){
			arr.unshift(binstr);
			didbreak = true;
			break;
		}
		arr.unshift(binstr.slice(1));
	}
//log(arr);
//log(didbreak);
	if (!didbreak) return barf("lebdec: could not decode at position: " + tohex(pos));
	return {val: parseInt(arr.join(""), 2), next: pos+arr.length};
}
//this.lebdec = lebdec;
//»
let getnum = lebdec;

/*
'lebenc':function(){//«
	var _=this.exports;
	var cberr = _.cberr;
	var cbok = _.cbok;
	var wout = _.wout;
	var werr = _.werr;
	if (!args.length) return cbok();
	if (args.length > 1) return _.suse("number");
	let num = parseInt(args[0]);
	let bits = num.toString(2);
	let arr = [];
	while (true){
		if (bits.length <= 7){
			arr.push(parseInt(bits,2));
			break;
		}
		let end = bits.slice(bits.length-7);
		arr.push(parseInt("1"+end,2));
		bits = bits.slice(0, bits.length-7);
	}
	let hexout = "";
	for (let n of arr) {
		let s = n.toString(16);
		if (s.length==1) s = "0"+s;
		hexout += "0x"+s+" ";
	}
	wout(hexout.replace(/ $/,""));
	cbok();
},//»
*/

//Section type constants«
//»
const VALUE_TYPES = {//«
	"127": "i32",
	"126": "i64",
	"125": "f32",
	"124": "f64"
}
//-0x01 (i.e., the byte 0x7f)	i32 ==> 127
//-0x02 (i.e., the byte 0x7e)	i64 ==> 126
//-0x03 (i.e., the byte 0x7d)	f32
//-0x04 (i.e., the byte 0x7c)	f64
//»
const sections = ["Type","Import","Function", "Table", "Memory","Global", "Export", "Start", "Element", "Code", "Data"];
const external_kinds = ["Function", "Table", "Memory", "Global"];
const opcodes=[//«
"unreachable",
"nop",
"block",
"loop",
"if",
"else",
"",
"",
"",
"",
"",
"end",
"br",
"br_if",
"br_table",
"return",
"call",
"call_indirect",
"",
"",
"",
"",
"",
"",
"",
"",
"drop",
"select",
"",
"",
"",
"",
"get_local",
"set_local",
"tee_local",
"get_global",
"set_global",
"",
"",
"",
"i32.load",
"i64.load",
"f32.load",
"f64.load",
"i32.load8_s",
"i32.load8_u",
"i32.load16_s",
"i32.load16_u",
"i64.load8_s",
"i64.load8_u",
"i64.load16_s",
"i64.load16_u",
"i64.load32_s",
"i64.load32_u",
"i32.store",
"i64.store",
"f32.store",
"f64.store",
"i32.store8",
"i32.store16",
"i64.store8",
"i64.store16",
"i64.store32",
"current_memory",
"grow_memory",
"i32.const",
"i64.const",
"f32.const",
"f64.const",
"i32.eqz",
"i32.eq",
"i32.ne",
"i32.lt_s",
"i32.lt_u",
"i32.gt_s",
"i32.gt_u",
"i32.le_s",
"i32.le_u",
"i32.ge_s",
"i32.ge_u",
"i64.eqz",
"i64.eq",
"i64.ne",
"i64.lt_s",
"i64.lt_u",
"i64.gt_s",
"i64.gt_u",
"i64.le_s",
"i64.le_u",
"i64.ge_s",
"i64.ge_u",
"f32.eq",
"f32.ne",
"f32.lt",
"f32.gt",
"f32.le",
"f32.ge",
"f64.eq",
"f64.ne",
"f64.lt",
"f64.gt",
"f64.le",
"f64.ge",
"i32.clz",
"i32.ctz",
"i32.popcnt",
"i32.add",
"i32.sub",
"i32.mul",
"i32.div_s",
"i32.div_u",
"i32.rem_s",
"i32.rem_u",
"i32.and",
"i32.or",
"i32.xor",
"i32.shl",
"i32.shr_s",
"i32.shr_u",
"i32.rotl",
"i32.rotr",
"i64.clz",
"i64.ctz",
"i64.popcnt",
"i64.add",
"i64.sub",
"i64.mul",
"i64.div_s",
"i64.div_u",
"i64.rem_s",
"i64.rem_u",
"i64.and",
"i64.or",
"i64.xor",
"i64.shl",
"i64.shr_s",
"i64.shr_u",
"i64.rotl",
"i64.rotr",
"f32.abs",
"f32.neg",
"f32.ceil",
"f32.floor",
"f32.trunc",
"f32.nearest",
"f32.sqrt",
"f32.add",
"f32.sub",
"f32.mul",
"f32.div",
"f32.min",
"f32.max",
"f32.copysign",
"f64.abs",
"f64.neg",
"f64.ceil",
"f64.floor",
"f64.trunc",
"f64.nearest",
"f64.sqrt",
"f64.add",
"f64.sub",
"f64.mul",
"f64.div",
"f64.min",
"f64.max",
"f64.copysign",
"i32.wrap/i64",
"i32.trunc_s/f32",
"i32.trunc_u/f32",
"i32.trunc_s/f64",
"i32.trunc_u/f64",
"i64.extend_s/i32",
"i64.extend_u/i320",
"i64.trunc_s/f32",
"i64.trunc_u/f32",
"i64.trunc_s/f64",
"i64.trunc_u/f64",
"f32.convert_s/i32",
"f32.convert_u/i32",
"f32.convert_s/i64",
"f32.convert_u/i64",
"f32.demote/f64",
"f64.convert_s/i32",
"f64.convert_u/i32",
"f64.convert_s/i64",
"f64.convert_u/i64",
"f64.promote/f32",
"i32.reinterpret/f32",
"i64.reinterpret/f64",
"f32.reinterpret/i32",
"f64.reinterpret/i64"
];//»

let cur, iter, ret;

let barf = str=>{
console.error(str);
	throw new Error(str);
}
let cberr = barf;
let wout = stdout;
let werr = stderr;
let tohex=(num, nopref)=>{//«
	let str = num.toString(16);
	if (str.length%2) str = "0"+str;
	if (nopref) return str;
	return ("0x"+str);
}//»
let tobin=(num, nopref)=>{//«
	let str = num.toString(2);
	if (str.length < 8) str = str.lpad(8,"0");
	else if (str.length < 16) str = str.lpad(16,"0");
	else if (str.length < 32) str = str.lpad(32,"0");
	else if (str.length < 64) str = str.lpad(64,"0");
//	if (str.length%2) str = "0"+str;
//str =
	if (nopref) return str;
	return ("0b"+str);
}//»
let scan_to_section=(section)=>{//«

_=buf;
check_header();
cur = 8;
iter = 0;
while (cur < buflen){//«
	iter++;
	if (iter > 20) return cberr("INFINITE LOOP!!!");
	let which = _[cur];
	if (which==0) return cberr("Not (yet) handling custom sections!");
	else if (which>11) return cberr("Found a section number > 11: (" +which+")");
	cur++;
	ret = getnum(cur);
	if (!Number.isInteger(ret.val)) return cberr("Non integer value returned: " + ret.val);
	cur=ret.next;
	if (which == section) {
//log(`section ${section} @${cur}`);
		return true;
	}
	if (which > section) return false;
	cur+=ret.val;
}//»

}//»
let check_header=()=>{//«
_=buf;
if (buflen < 8) return barf("Invalid length (need at least 8 bytes)");
if (!(_[0]==0&&_[1]==97&&_[2]==115&&_[3]==109)) return barf("Invalid magic: need '\\0asm'!");
if (!(_[4]==1&&_[5]==0&&_[6]==0&&_[7]==0)) return barf("Looking for version 1!");
}//»

this.dump_toplevel = ()=>{//«

_=buf;
check_header();
cur = 8;
iter = 0;
while (cur < buflen){//«
	iter++;
	if (iter > 20) return cberr("INFINITE LOOP!!!");
	let which = _[cur];
	if (which==0) return cberr("Not (yet) handling custom sections!");
	else if (which>11) return cberr("Found a section number > 11: (" +which+")");
	cur++;
	ret = getnum(cur);
	if (!Number.isInteger(ret.val)) return cberr("Non integer value returned: " + ret.val);
	let hex = (cur-1).toString(16);
	if (hex.length%2) hex = "0"+hex;
	stdout("Section#"+which+" @ 0x"+hex+": " + ret.val + " bytes ("+sections[which-1]+")");
	cur=ret.next;
	cur+=ret.val;
}//»
stdout("Validated toplevel wasm: " + cur + "/" + buflen + " bytes");
return true;

}//»
this.dump_types=(arg, retonly)=>{//«
//		gotret = parser.dump_types({OP:OP_GET_SIG_BY_NUM, VAL: gotret});

if (!scan_to_section(TYPE)) return false;

if (!arg) arg = {};

let op = arg.OP;
let get_which = arg.WHICH;
let get_val = arg.VAL;

let out = (str)=>{
	if (op) return;
	wout(str);
}
//count	varuint32	count of type entries to follow
//entries	func_type*	repeated type entries as described above
ret = getnum(cur);
let n = ret.val;
if (!op) werr("Found "+n+" function type signatures at " + tohex(cur));
cur = ret.next;
/*«
-0x01 (i.e., the byte 0x7f)	i32
-0x02 (i.e., the byte 0x7e)	i64
-0x03 (i.e., the byte 0x7d)	f32
-0x04 (i.e., the byte 0x7c)	f64
-0x10 (i.e., the byte 0x70)	anyfunc
-0x20 (i.e., the byte 0x60)	func
-0x40 (i.e., the byte 0x40)	pseudo type for representing an empty block_type

form			varint7			the value for the func type constructor as defined above (0x60 for 'func')
param_count		varuint32		the number of parameters to the function
param_types		value_type*		the parameter types of the function
return_count	varuint1		the number of results from the function
return_type		value_type?		the result type of the function (if return_count is 1)
»*/
let param_cnt,ret_cnt, ret_type, tmp, form;
let param_arr, param_str;
for (let i=0; i < n; i++){
	form = _[cur];
	if (form != 0x60) return barf("Expexted a 'func' type constructor (0x60), got: " + tohex(form));
	cur++;
	ret = getnum(cur);
	cur = ret.next;
	param_cnt = ret.val;
	param_arr=[];
	for (let j=0; j < param_cnt;j++){
		tmp = VALUE_TYPES[(""+_[cur])];
		if (!tmp) return barf("Found bad parameter value type at: " +tohex(cur));
		param_arr.push(tmp);
		cur++;
	}
	ret_cnt=_[cur];
	if (!(ret_cnt==0||ret_cnt==1)) return barf("Found: "+ret_cnt+" return values at: " + tohex(cur)+"; expected either 0 or 1!");
	if (ret_cnt==1) {
		cur++;
		ret_type = VALUE_TYPES[(""+_[cur])];
		if (!ret_type) return barf("Found bad return value type at: " +tohex(cur));
	}
	else ret_type = "void";
	if (!param_arr.length) param_str = "void";
	else param_str = "[" + param_arr.join(",")+"]";
	if (op){
		if (op === OP_GET_SIG_BY_NUM){
			if (i===get_val){
				wout(param_arr.length+" params: "+param_str+"; return: " + ret_type);
				return true;
			}
		}
	}
	else out(i+") "+param_arr.length+" params: "+param_str+"; return: " + ret_type);
	cur++;
}

if (op) return false;

//if (get_which) {
//	if (retonly) return retnum;
//	else out(""+retnum);
//}

return true;
}//»
this.dump_imports=(arg, retonly)=>{//«
/*Import entry«
module_len	varuint32	length of module_str in bytes
module_str	bytes	module name: valid UTF-8 byte sequence
field_len	varuint32	length of field_str in bytes
field_str	bytes	field name: valid UTF-8 byte sequence
kind	external_kind	the kind of definition being imported

Followed by, if the kind is Function:

Field	Type	Description
type	varuint32	type index of the function signature

or, if the kind is Table:

Field	Type	Description
type	table_type	type of the imported table

or, if the kind is Memory:

Field	Type	Description
type	memory_type	type of the imported memory

or, if the kind is Global:

Field	Type	Description
type	global_type	type of the imported global

»*/
if (!scan_to_section(IMPORT)) return false;
if (!arg) arg = {};

let op = arg.OP;
let get_which = arg.WHICH;
let get_val = arg.VAL;
let out_arr = arg.OUT;
let out = (str)=>{
	if (get_which) return;
	wout(str);
}

ret = getnum(cur);
let n = ret.val;
out("Found "+n+" imports at " + tohex(cur));
cur = ret.next;
let j,len;
let modstr, namestr
let retnum = 0;
for (let i=0; i < n; i++){//«

	ret = getnum(cur);
	len = ret.val;
	cur = ret.next;
	modstr = "";
	for (j=0; j < len; j++) modstr+=String.fromCharCode(_[cur+j]);
	cur+=j;

	ret = getnum(cur);
	len = ret.val;
	cur = ret.next;
	namestr = "";
	for (j=0; j < len; j++) namestr+=String.fromCharCode(_[cur+j]);
	cur+=j;

	let kindval = _[cur];
	let kind = external_kinds[kindval];
	if (!kind) return cberr("Invalid external kind at: " + cur);
	if (kindval==0) {
		cur++;
		if (op){
			if (op==OP_GET_COUNT){
				if (get_which == FUNCTION) retnum++;
			} 
			else if (op==OP_GET_NAME_AT_NUM) {
				if (get_which == FUNCTION)	{
					if (retnum == get_val) return namestr;
					retnum++;
				}
			}
			else if (op==OP_GET_TYPE_BY_NAME) {
				if (namestr === get_val) return _[cur];
				retnum++;
			}
			else if (op==OP_GET_NUM_BY_NAME) {
				if (namestr === get_val) return i;
			}
			else if (op==OP_GET_TYPE_BY_NUM) {
				if (i === get_val) return _[cur];
				retnum++;
			}
		}
//		if (get_which == FUNC_IMPORTS) retnum++;
		else out(i+") "+modstr+"->"+namestr + " [" + kind+"("+(_[cur])+")]");
		cur++;
	}
	else if (kindval==3) {//Global«
		//let which = 
		//const i32 = "";
		cur++;
		let numval = _[cur];
		let numtype = VALUE_TYPES[(""+numval)];
		if (!numtype) return cberr("Unkown value type at: " + cur);
		cur++;
		let mutval = _[cur];
		if (!(mutval==1||mutval==0)) return cberr("Uknown mutability at: " + cur);
		let mutstr = mutval==0 ? "const":"var";
		if (op){
			if (op==OP_GET_COUNT){
				if (get_which == GLOBAL) retnum++;
			} 
		}
//		if (get_which == GLOBAL_IMPORTS) retnum++;
		else out(i+") "+modstr+"->"+namestr + " [" + kind+ "("+numtype+","+mutstr+")]");
		cur++;
	}//»
	else if (kindval==2) {//Memory«
		cur++;
		let if_max = _[cur];
		cur++;
		ret = getnum(cur);
		let initial_mem = ret.val;
		let max_mem;
		cur = ret.next;
		if (if_max){
			ret = getnum(cur);
			max_mem = ret.val;
			cur = ret.next;
			out(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_mem+"->"+max_mem+")]");
		}
		else out(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_mem+")]");
	}//»
	else if (kindval==1) {//Table«
//-0x10 (i.e., the byte 0x70)	anyfunc
//-0x20 (i.e., the byte 0x60)	func
		cur++;
		let elem_type = _[cur];
		if (elem_type!=0x70) return cberr("Unknown elem_type != 'anyfunc!'");
		cur++;
		let if_max = _[cur];
		cur++;
		ret = getnum(cur);
		let initial_sz = ret.val;
		let max_sz;
		cur = ret.next;
		if (if_max){
			ret = getnum(cur);
			max_sz = ret.val;
			cur = ret.next;
			out(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_sz+"->"+max_sz+")]");
		}
		else out(i+") "+modstr+"->"+namestr + " [" + kind+ "("+initial_sz+")]");
	}//»
}//»
if (op==OP_GET_NAME_AT_NUM) return null;
if (op === OP_GET_TYPE_BY_NAME || op === OP_GET_TYPE_BY_NUM || op == OP_GET_NUM_BY_NAME) {
	if (out_arr) out_arr[0] = retnum;
	return null;
}
//else if (op == OP)
if (get_which) {
	if (retonly) return retnum;
	else wout(""+retnum);
}

return true;

}//»
this.dump_decls=(arg)=>{//«
//		gotret = parser.dump_decls({OP: OP_GET_DECL_TYPE, VAL: index-num_imports});
//count	varuint32	count of signature indices to follow
//types	varuint32*	sequence of indices into the type section
	if (!arg) arg = {};
	let op = arg.OP;
	let get_val = arg.VAL;

	if (!scan_to_section(FUNCTION)) return false;
	ret = getnum(cur);
	let n = ret.val;
	if (!op) werr("Found "+n+" signature indices at " + tohex(cur));
	cur = ret.next;
	for (let i=0; i < n; i++){
		ret = getnum(cur);
		if (op){
			if (op == OP_GET_DECL_TYPE) {
				if (get_val == i) return ret.val;
			}
		}
		else wout(i+") " + ret.val);
		cur = ret.next;
	}
	if (op) return null;
	return true;
}//»
this.dump_globals=()=>{//«
//count	varuint32	count of global variable entries
//globals	global_variable*	global variables, as described below
	if (!scan_to_section(GLOBAL)) return false;
	ret = getnum(cur);
	let n = ret.val;
	werr("Found "+n+" global variables at " + tohex(cur));
//type	global_type	type of the variables
//init	init_expr	the initial value of the global

//global_type
//content_type	value_type	type of the value
//mutability	varuint1	0 if immutable, 1 if mutable

//init_expr
//i32.const:   		0x41:	varint32
//i64.const:   		0x42:	varint64
//f32.const:  		0x43:	uint32
//f64.const:  	 	0x44:	uint64
//get_global:		0x23: 	global_index : varuint32	


	cur = ret.next;
	let val_type, mut, expr, opcode, initval;
	for (let i=0; i < n; i++){
//		ret = getnum(cur);
		val_type = VALUE_TYPES[""+_[cur]];
		if (!val_type) return barf("Invalid value type at: "+tohex(cur));
		cur++;
		mut = _[cur];
		if (!(mut==0||mut==1)) return barf("Invalid mutability at: "+tohex(cur));
		cur++;
		opcode = _[cur];
		if (!(opcode==0x23||(opcode>=0x41&&opcode<=0x44))) return barf("Invalid initializer operation at: " + tohex(cur));
		cur++;
		if (opcode == 0x23||opcode<=0x42){
			ret = getnum(cur);
			initval = ret.val;
			cur = ret.next;
		}
		else {
			let donum = opcode==0x43?4:8;
			let arr = [];
			for (let j=0; j < donum; j++) arr.push(tohex(_[cur++],true));
			initval = arr.join(" ");
		}
		if (_[cur]!=0xb) return barf("Expected an 'end' opcode (0xb), got: "+_[cur]);
		cur++;
		wout(i+") "+(mut==1?"var":"const")+" " + val_type+" ["+opcodes[opcode]+ "("+initval+")]");
//		cur = ret.next;
	}



	return true;
}//»
this.dump_exports=(arg, retonly)=>{//«

/*Export extry«
field_len	varuint32	length of field_str in bytes
field_str	bytes	field name: valid UTF-8 byte sequence
kind	external_kind	the kind of definition being exported
index	varuint32	the index into the corresponding index space
»*/
if (!arg) arg = {};
let op = arg.OP;
let get_which = arg.WHICH;
let get_val = arg.VAL;
let arr = [];

if (!scan_to_section(EXPORT)) return false;
let out = (str)=>{
	if (op) return;
	wout(str);
}
ret = getnum(cur);
let n = ret.val;
if (!op) werr("Found "+n+" exports at " + tohex(cur));
cur = ret.next;
let j,len;
let namestr;
let index;
let retnum=0;
//		gotret = parser.dump_exports({OP: OP_GET_NAME_AT_NUM, WHICH: FUNCTION, VAL: num}, true);

for (let i=0; i < n; i++){//«
	ret = getnum(cur);
	len = ret.val;
	cur = ret.next;
	namestr = "";
	for (j=0; j < len; j++) namestr+=String.fromCharCode(_[cur+j]);
	cur+=j;
	let kindval = _[cur];
	let kind = external_kinds[kindval];
	if (!kind) return cberr("Invalid external kind at: " + cur);
	cur++;
	ret = getnum(cur);
	index = ret.val;
//log(i, index, get_val);
	if (op){
		if (op == OP_GET_COUNT){
			if (get_which == GLOBAL && kindval==3) retnum++;
			else if (get_which == FUNCTION && kindval==0) retnum++;
		}
		else if (op == OP_MATCH_NAME){
			if (get_val == namestr) return index;
		}
		else if (op == OP_GET_NAME_AT_NUM){
			if (index === get_val) return namestr;
		}
	}
	else arr.push((i+") "+namestr + " [" + kind + "("+index+")]"));
	cur = ret.next;
}//»
if (op) {
	if(op==OP_MATCH_NAME||op==OP_GET_NUM_BY_NAME||op==OP_GET_NAME_AT_NUM) return null;
	if (get_which) {
		if (retonly) return retnum;
		else wout(""+retnum);
	}
}
woutarr(arr);
return true;

}//»
this.dump_start=()=>{//«
if (!scan_to_section(START)) return false;
ret = getnum(cur);
let start_num = ret.val;
werr("Start function index: " + start_num);
return true;
}//»
this.dump_elements=()=>{//«
/*
count		varuint32		count of element segments to follow
entries		elem_segment*	repeated element segments as described below

a elem_segment is:

index		varuint32	the table index (0 in the MVP)
offset		init_expr	an i32 initializer expression that computes the offset at which to place the elements
num_elem	varuint32	number of elements to follow
elems		varuint32*	sequence of function indices
*/
if (!scan_to_section(ELEMENT)) return false;
ret = getnum(cur);
let n = ret.val;
werr("Found "+n+" elements at " + tohex(cur));
cur = ret.next;
let index, offset, num_elem, elems;
//i32.const:   		0x41:	varint32
//get_global:		0x23: 	global_index : varuint32	
let opcode, opname, val, nelems, indices;
for (let i=0; i < n; i++){
ret = getnum(cur);
index = ret.val;
if (index!==0) return barf("Expected a '0' index (table), got: " + index + " at " + tohex(cur));
cur = ret.next;
opcode = _[cur];
if (!(opcode==0x23||opcode==0x41)) return barf("Invalid initializer opcode, expected 0x23 or 0x41, got: " + opcode + " at " + tohex(cur));
cur++;
ret = getnum(cur);
val = ret.val;
cur = ret.next;
if (_[cur]!=0xb) return barf("Expected an 'end' opcode (0xb), got: "+_[cur]);
cur++;
ret = getnum(cur);
nelems = ret.val;
cur = ret.next;
indices = [];
for (let i=0; i < nelems; i++){
	ret = getnum(cur);
	indices.push(ret.val);
	cur = ret.next;
}
wout("Found: " + indices.length + " indices, "+opcodes[opcode]+"("+val+")");
wout("(See the console)");
console.log(indices);
}

return true;
}//»
this.dump_code=(num, fmt)=>{//«

if (!scan_to_section(CODE)) return false;
ret = getnum(cur);
let n = ret.val;
//werr("Found "+n+" function bodies at " + tohex(cur));
if (num>=n) return barf("The requested function index exceeds the bounds!");
cur = ret.next;
for (let i=0; i < num; i++){
	ret = getnum(cur);
	cur = ret.next;
	cur += ret.val;
}

ret = getnum(cur);
let size = ret.val;

let func_start = ret.next;
let func_end = func_start + size;
//log("Found function "+num+": " + tohex(cur), size, func_start, func_end);
let arr = [];
//let out = [];
//let wid = 
let curln = "";
let w = term.w;
let curlnnum = 0;
if (fmt == "bin") {//«
	for (let i=func_start; i < func_end; i++) {
		if (curlnnum == 20 || (curln.length+5 >= w)){
			arr.push(curln);
			curln = "";
			curlnnum = 0;
		}
		let val = tohex(_[i],true);
		if (!curln) curln = val;
		else curln = curln + " " + val;
		curlnnum++;
	}
	if (curln) arr.push(curln);
//	wout(arr.join("\n"));
	woutarr(arr);
	return true;
}//»
else {
let num_local_entries;
let level = 0;
let opnum, opname, index, val;
//let iter = 0;
let outarr = [];
let out = (str)=>{
	if (!level) outarr.push((str));
	else outarr.push((("  ").repeat(level))+str);
}

/*«

Control Flow

unreachable		0x00
nop				0x01	
block			0x02	sig : block_type			begin a sequence of expressions, yielding 0 or 1 values	
loop			0x03	sig : block_type 			begin a block which can also form control flow loops
if				0x04	sig : block_type			begin if expression
else			0x05								begin else expression of if
end				0x0b								end a block, loop, or if
br				0x0c	relative_depth : varuint32	break that targets an outer nested block
br_if			0x0d	relative_depth : varuint32	conditional break that targets an outer nested block
br_table		0x0e	see below					branch table control flow construct
return			0x0f								return zero or one value from this function

The sig fields of block and if operators specify function signatures which describe their use of 
the operand stack.

block_type
A varint7 indicating a block signature. These types are encoded as:
either a value_type indicating a signature with a single result
or -0x40 (i.e., the byte 0x40) indicating a signature with 0 results.


The br_table operator has an immediate operand which is encoded as follows:

target_count	varuint32	number of entries in the target_table
target_table	varuint32*	target entries that indicate an outer block or loop to which to break
default_target	varuint32	an outer block or loop to which to break in the default case


Call operators
call			0x10	function_index : varuint32	call a function by its index
call_indirect	0x11	type_index : varuint32, 	call a function indirect with an expected signature
						reserved : varuint1			


Parametric operators
drop			0x1a								ignore value
select			0x1b								select one of two values based on condition


Variable access
get_local		0x20	local_index : varuint32		read a local variable or parameter
set_local		0x21	local_index : varuint32		write a local variable or parameter
tee_local		0x22	local_index : varuint32		write a local variable or parameter and return the same value
get_global		0x23	global_index : varuint32	read a global variable
set_global		0x24	global_index : varuint32	write a global variable


Memory-related operators
i32.load		0x28	memory_immediate			load from memory
i64.load		0x29	memory_immediate			load from memory
f32.load		0x2a	memory_immediate			load from memory
f64.load		0x2b	memory_immediate			load from memory
i32.load8_s		0x2c	memory_immediate			load from memory
i32.load8_u		0x2d	memory_immediate			load from memory
i32.load16_s	0x2e	memory_immediate			load from memory
i32.load16_u	0x2f	memory_immediate			load from memory
i64.load8_s		0x30	memory_immediate			load from memory
i64.load8_u		0x31	memory_immediate			load from memory
i64.load16_s	0x32	memory_immediate			load from memory
i64.load16_u	0x33	memory_immediate			load from memory
i64.load32_s	0x34	memory_immediate			load from memory
i64.load32_u	0x35	memory_immediate			load from memory
i32.store		0x36	memory_immediate			store to memory
i64.store		0x37	memory_immediate			store to memory
f32.store		0x38	memory_immediate			store to memory
f64.store		0x39	memory_immediate			store to memory
i32.store8		0x3a	memory_immediate			store to memory
i32.store16		0x3b	memory_immediate			store to memory
i64.store8		0x3c	memory_immediate			store to memory
i64.store16		0x3d	memory_immediate			store to memory
i64.store32		0x3e	memory_immediate			store to memory
current_memory	0x3f	reserved : varuint1			query the size of memory
grow_memory		0x40	reserved : varuint1			grow the size of memory

The memory_immediate type is encoded as follows:

flags			varuint32	a bitfield which currently contains the alignment in the least significant 
																	bits, encoded as log2(alignment)
offset			varuint32	the value of the offset

As implied by the log2(alignment) encoding, the alignment must be a power of 2. As an additional 
validation criteria, the alignment must be less or equal to natural alignment. The bits after the 
log(memory-access-size) least-significant bits must be set to 0. These bits are reserved for 
future se (e.g., for shared memory ordering requirements).

The reserved immediate to the current_memory and grow_memory operators is for future use and must be 0 
in the MVP.

Constants
i32.const		0x41	value : varint32			a constant value interpreted as i32
i64.const		0x42	value : varint64			a constant value interpreted as i64
f32.const		0x43	value : uint32				a constant value interpreted as f32
f64.const		0x44	value : uint64				a constant value interpreted as f64

Comparison operators
i32.eqz		0x45		
i32.eq		0x46		
i32.ne		0x47		
i32.lt_s	0x48		
i32.lt_u	0x49		
i32.gt_s	0x4a		
i32.gt_u	0x4b		
i32.le_s	0x4c		
i32.le_u	0x4d		
i32.ge_s	0x4e		
i32.ge_u	0x4f		
i64.eqz		0x50		
i64.eq		0x51		
i64.ne		0x52		
i64.lt_s	0x53		
i64.lt_u	0x54		
i64.gt_s	0x55		
i64.gt_u	0x56		
i64.le_s	0x57		
i64.le_u	0x58		
i64.ge_s	0x59		
i64.ge_u	0x5a		
f32.eq		0x5b		
f32.ne		0x5c		
f32.lt		0x5d		
f32.gt		0x5e		
f32.le		0x5f		
f32.ge		0x60		
f64.eq		0x61		
f64.ne		0x62		
f64.lt		0x63		
f64.gt		0x64		
f64.le		0x65		
f64.ge		0x66		


Numeric operators

i32.clz		0x67		
i32.ctz		0x68		
i32.popcnt	0x69		
i32.add		0x6a		
i32.sub		0x6b		
i32.mul		0x6c		
i32.div_s	0x6d		
i32.div_u	0x6e		
i32.rem_s	0x6f		
i32.rem_u	0x70		
i32.and		0x71		
i32.or		0x72		
i32.xor		0x73		
i32.shl		0x74		
i32.shr_s	0x75		
i32.shr_u	0x76		
i32.rotl	0x77		
i32.rotr	0x78		
i64.clz		0x79		
i64.ctz		0x7a		
i64.popcnt	0x7b		
i64.add		0x7c		
i64.sub		0x7d		
i64.mul		0x7e		
i64.div_s	0x7f		
i64.div_u	0x80		
i64.rem_s	0x81		
i64.rem_u	0x82		
i64.and		0x83		
i64.or		0x84		
i64.xor		0x85		
i64.shl		0x86		
i64.shr_s	0x87		
i64.shr_u	0x88		
i64.rotl	0x89		
i64.rotr	0x8a		
f32.abs		0x8b		
f32.neg		0x8c		
f32.ceil	0x8d		
f32.floor	0x8e		
f32.trunc	0x8f		
f32.nearest	0x90		
f32.sqrt	0x91		
f32.add		0x92		
f32.sub		0x93		
f32.mul		0x94		
f32.div		0x95		
f32.min		0x96		
f32.max		0x97		
f32.copysign0x98		
f64.abs		0x99		
f64.neg		0x9a		
f64.ceil	0x9b		
f64.floor	0x9c		
f64.trunc	0x9d		
f64.nearest	0x9e		
f64.sqrt	0x9f		
f64.add		0xa0		
f64.sub		0xa1		
f64.mul		0xa2		
f64.div		0xa3		
f64.min		0xa4		
f64.max		0xa5		
f64.copysign0xa6		


Conversions

i32.wrap/i64		0xa7		
i32.trunc_s/f32		0xa8		
i32.trunc_u/f32		0xa9		
i32.trunc_s/f64		0xaa		
i32.trunc_u/f64		0xab		
i64.extend_s/i32	0xac		
i64.extend_u/i320	xad		
i64.trunc_s/f32		0xae		
i64.trunc_u/f32		0xaf		
i64.trunc_s/f64		0xb0		
i64.trunc_u/f64		0xb1		
f32.convert_s/i32	0xb2		
f32.convert_u/i32	0xb3		
f32.convert_s/i64	0xb4		
f32.convert_u/i64	0xb5		
f32.demote/f64		0xb6		
f64.convert_s/i32	0xb7		
f64.convert_u/i32	0xb8		
f64.convert_s/i64	0xb9		
f64.convert_u/i64	0xba		
f64.promote/f32		0xbb		

Reinterpretations

i32.reinterpret/f32	0xbc		
i64.reinterpret/f64	0xbd		
f32.reinterpret/i32	0xbe		
f64.reinterpret/i64	0xbf	
»*/
/*«
body_size	varuint32	size of function body to follow, in bytes
local_count	varuint32	number of local entries
locals	local_entry*	local variables
code	byte*	bytecode of the function
end	byte	0x0b, indicating the end of the body

Local Entry
Each local entry declares a number of local variables of a given type. It is legal to have 
several entries with the same type.

Field	Type	Description
count	varuint32	number of local variables of the following type
type	value_type	type of the variables

const VALUE_TYPES = {
	"127": "i32",
	"126": "i64",
	"125": "f32",
	"124": "f64"
}

»*/
cur = func_start;
ret = getnum(cur);
num_local_entries = ret.val;
cur = ret.next;

for (let i=0; i < num_local_entries; i++){//«
	ret = getnum(cur);
	let num_of_type = ret.val;
	cur = ret.next;
	let val_type = VALUE_TYPES[""+_[cur]];
	wout(num_of_type + " local variables of type: " + val_type);
	cur++;
}//»

let iter=0;

while (cur < func_end) {//«
if (iter>10000){
console.error("INFINITE");
return;
}
iter++;


opnum = _[cur];
opname = opcodes[""+opnum];
if (!opname) return barf("No operation for number: " + tohex(opnum));
//index;
if (opnum >= 2 && opnum <= 4){//«block/loop/if
/*«
block	0x02	sig : block_type	begin a sequence of expressions, yielding 0 or 1 values
loop	0x03	sig : block_type	begin a block which can also form control flow loops
if	0x04		sig : block_type		begin if expression


block_type
A varint7 indicating a block signature. These types are encoded as:

either a value_type indicating a signature with a single result
or -0x40 (i.e., the byte 0x40) indicating a signature with 0 results.
»*/
	cur++;
	let block_type="";
	ret = _[cur];
	if (ret == 0x40){
		block_type = "void";
	}
	else {
		block_type = VALUE_TYPES[(""+ret)];
		if (!block_type) {
			return barf("Unknown return value type from '"+opname+"' at: " + tohex(cur) + "(expected one of: 0x40(void), 0x7c(f64), 0x7d(f32), 0x7e(i64) or 0x7f(i32), but got: " + tohex(ret));
		}
	}
	out(opname + "(" + block_type+"):");
	cur++;
	level++;
}//»
else if (//x10,c,d,0x20->24,0x41->42 «
	opnum == 0x10 || //call
	opnum == 0xc || //br
	opnum == 0xd || //br_if
	(opnum >= 0x20 && opnum <= 0x24) || //(get|set|tee)(local|global)
	(opnum == 0x41 || opnum == 0x42) //i(32|64).const
){//get|set/local|global
//get_local		0x20	local_index : varuint32		read a local variable or parameter//«
//set_local		0x21	local_index : varuint32		write a local variable or parameter
//tee_local		0x22	local_index : varuint32		write a local variable or parameter and return the same value
//get_global		0x23	global_index : varuint32	read a global variable
//set_global		0x24	global_index : varuint32	write a global variable»
cur++;
ret = getnum(cur);
out(opname +"("+ret.val+")");
cur = ret.next;
}//»
else if (opnum==0x11){//call_indirect«
//type_index : varuint32
//reserved : varuint1
//call			0x10	function_index : varuint32	call a function by its index

//call_indirect	0x11	type_index : varuint32, 	call a function indirect with an expected signature
//						reserved : varuint1			

//console.error("Not yet implemented: " + opname + " (need to make sure the reserved varuint1 is real first!)");
//out("call_indirect");
cur++;
ret = getnum(cur);
out(opname +"("+ret.val+")");
cur = ret.next;
//	return true;
}//»
else if (opnum >= 0x28 && opnum <= 0x40){//«
/*
flags	varuint32	a bitfield which currently contains the alignment 
					in the least significant bits, encoded as log2(alignment)
offset	varuint32	the value of the offset
*/
let flags, offset;

cur++;

ret = getnum(cur);
flags = ret.val;
cur = ret.next;

ret = getnum(cur);
offset = ret.val;

out(opname +"(flags="+tobin(flags)+", offset="+tohex(offset)+")");

cur = ret.next;

}//»
else if (opnum==0x43||opnum==0x44){ //«f32.const
	cur++;
	let donum = opnum==0x43?4:8;
	let arr = [];
	for (let i=0; i < donum; i++)arr.push(tohex(_[cur++], true));
	out(opname+"("+arr.join(" ")+")");
}//»
else if (opnum == 0xe){//br_table//«
//target_count	varuint32	number of entries in the target_table
//target_table	varuint32*	target entries that indicate an outer block or loop to which to break
//default_target	varuint32	an outer block or loop to which to break in the default case
let cnt, tbl, dflt;
cur++;
ret = getnum(cur);
cnt = ret.val;
cwarn("COUNT:"+cnt);
cur = ret.next;
tbl = [];
for (let i=0; i <cnt; i++){
	ret = getnum(cur);
	tbl.push(ret.val);
	cur = ret.next;
}
ret = getnum(cur);
dflt = ret.val;

out(opname +"(table=["+tbl.join(",")+"], default="+dflt+")");

cur = ret.next;

}//»
else if (//0,1,5,b,f,1a,1b,0x45->bf «
	(opnum >= 0x45 && opnum <= 0xbf) ||
	opnum <= 1 ||
	opnum == 5 ||
	opnum == 0xb ||
	opnum == 0xf ||
	opnum == 0x1a ||
	opnum == 0x1b
	){
	out(opname);
	cur++;
	if (opnum==0xb) {
		level--;
		if (level < 0 && cur < func_end) return barf("Got level < 0 on 'end' at: " + tohex(cur));
	}
//	cur = ret.next;
}//»
else {//«
console.error("Unexpected opcode found: " + tohex(opnum) +" ->  " + opname);
	return true;
}//»


}//»

woutarr(outarr);

if (cur != func_end) return barf("cur("+cur+") != func_end("+func_end+")");
return true;
}

}//»
this.dump_data=async()=>{//«
/*«
count		varuint32	count of data segments to follow
entries		data_segment*	repeated data segments as described below

data segment:
index	varuint32	the linear memory index (0 in the MVP)
offset	init_expr	an i32 initializer expression that computes the offset at which to place the data
size	varuint32	size of data (in bytes)
data	bytes		sequence of size bytes
»*/
if (!scan_to_section(DATA)) return false;
ret = getnum(cur);
let n = ret.val;
wout("Found "+n+" data segments at " + tohex(cur));
cur = ret.next;

let index, offset, size, data;
//i32.const:   		0x41:	varint32
//get_global:		0x23: 	global_index : varuint32	
let opcode, opname, val, nelems, indices;
for (let i=0; i < n; i++){//«
	ret = getnum(cur);
	index = ret.val;
	if (index!==0) return barf("Expected a '0' index");
	cur = ret.next;
	opcode = _[cur];
	if (!(opcode==0x23||opcode==0x41)) return barf("Invalid initializer opcode, expected 0x23 or 0x41, got: " + opcode + " at " + tohex(cur));
	cur++;
	ret = getnum(cur);
	val = ret.val;
	cur = ret.next;
	if (_[cur]!=0xb) return barf("Expected an 'end' opcode (0xb), got: "+_[cur]);
	cur++;
	ret = getnum(cur);
	size = ret.val;
	cur = ret.next;
	wout("Found: " + size + " bytes of data, "+opcodes[opcode]+" ("+val+")");
//	wout("(See the console)");
	let bytes = _.slice(cur, cur+size);
log("**********************************************************");
log(await (Core.api.toStr(bytes)));
	cur+=size;
}//»
	return true;
}//»

}//»


COMS[comarg](args);

}



/*
'wasmio':function(){//«

	var _=this.exports;

	var which = args.shift();
	if (!which) return _.cberr("Nothing");

	let wasmname = which; //brum==stdin, sloom==example.txt
	let cur_out_str="";
	let cur_err_str="";
	let Module, FS;

	let file_name = "example.txt";
	let file_str = "Hello\necho all\n\n\nthese lines\n\nback at me???\nHAR.\n";
	var intarr = util.text_to_bytes(file_str, true);
	let stdin_iter=0;
	let lastch;
	let io = {//«
		putchout:code=>{
			if (code==10){
				if (lastch === 10) _.respbr();
				else _.wout(cur_out_str);
				cur_out_str="";
			}
			else cur_out_str+=String.fromCharCode(code);
			lastch = code;
		},
		putcherr:code=>{
			if (code==10){
				_.werr(cur_err_str);
				cur_err_str="";
			}
			cur_err_str+=String.fromCharCode(code);
		},
		getchin:()=>{
			if (stdin_iter==file_str.length) return null;
			let ch = file_str[stdin_iter++];
			return ch.charCodeAt();
		}
	}//»
	function set_file(){//«
		var node = FS.createFile(FS.root, file_name, {isDevice: false}, true, true);
		node.contents = intarr;
		node.usedBytes = file_str.length;
	}//»
	fs.getmod("wasmio",(wasmmod)=>{//«!!!!! IN BLOCK COMMENT !!!!!
		if (!wasmmod) return _.cberr("No wasm module!");
		Core.get_wasm(wasmname,(wasmret)=>{
			//log(wasmret);
			if (!wasmret) return _.cberr("No "+wasmname+".wasm!");
			wasmmod.WASMIO({wasmBinary:wasmret}, null, 
			{
				LOAD: (ret, errmess)=>{
					if (!ret) return _.cberr(errmess);
					Module = ret;
				},
				EXIT:retval=>{
					if (retval===0) _.cbok();
					else _.cberr();
				},
				PRERUN:fs=>{
					FS = fs;
					set_file();
				}
			} , {IO:io, TABLESIZE: 505, STATICBUMP: 23936});
		});
	});//»

},//»
'wast2wasm':function(){//«
	var fname = args.shift();
	if (!fname) return cberr("Need filename!");
	fs.getmod('util.libwabt',ret=>{//!!!!!IN BLOCK COMMENT!!!!!
		if (!ret) return cberr("NOLIBWABT");
		var mod = ret.getmod();
		arg2con(fname,ret=>{
			if (!ret) return cberr(fname+": not found");
			var script, blob;
			try {
				script = mod.wasm.parseWast('filename.wast', ret);
				script.resolveNames();
				script.validate();
				blob = new Blob([script.toBinary({log: true}).buffer],{type:"application/wasm"});
			}
			catch(e){
				cberr(e.message);
				return;
			}
			woutobj(blob);
			cbok();
		});
	});
},//»
*/
