const KEY_ENV_STR = "ENCRYPT_KEY";
const DEF_ALGO = "AES-GCM";
const DEF_KEY_LEN = 256;
const crypto = window.crypto.subtle;

export const lib = (comarg, args, Core, Shell)=>{

const COMS={

encrypt:async(args)=>{//«
	let algo = DEF_ALGO;
	let keylen = DEF_KEY_LEN;
	let sws = failopts(args,{SHORT:{p:3}});
	if (!sws) return;
	let pass_str;
	if (sws.p) pass_str = sws.p.valueOf();
	else pass_str = await Shell.getLineInput("? ", true);
	const doencrypt=async mess_str=>{//«
		let key = await get_key(algo);
		if (key) werr(`Using existing key in the environment (${KEY_ENV_STR})`);
		else {
			key = await make_key(algo, keylen);
			set_var_str(KEY_ENV_STR, await export_key(key));
			werr(`The generated key (base64) has been set to ${KEY_ENV_STR}`);
		}		
		try{
			let rv = await encrypt(algo, key, pass_str, mess_str);
			woutobj(new Blob([rv],{type:"blob"}));
			cbok();
		}catch(e){cberr(e)}
	};//»
	let arr = [];
	read_file_args_or_stdin(args,(rv,fname,err)=>{//«
		if (!rv){
			if (err) werr(err);
			return;
		}   
		if (isobj(rv)&&rv.EOF==true) {
//			if (done) return;
//			done = true;
			let out = '';
			if (!arr.length) return cberr("No input received... aborting");
			for (let ln of arr)out+=ln.valueOf()+"\n";
			return doencrypt(out.substr(0, out.length-1));
		}
		if (isarr(rv) && rv.length && isstr(rv[0])) arr=arr.concat(rv);
		else if (isstr(rv)) arr.push(rv);
		else {
			werr("Dropping unknown input (see console)");
log(rv);
		}
	}, {SENDEOF:true, GETVALUEOF:true}); //»
},//»
decrypt:async(args)=>{//«
	let algo = DEF_ALGO;
	let sws = failopts(args,{SHORT:{p:3, t:1}});
	if (!sws) return;
	let pass_str;
	if (sws.p) pass_str = sws.p.valueOf();
	else pass_str = await Shell.getLineInput("? ", true);
	const dodecrypt=async buf=>{//«
		let key = await get_key(algo);
		if (!key) return cberr(`'${KEY_ENV_STR}' is not in the environment!`);
		try{
			let rv = await decrypt(algo, key, pass_str, buf);
			if (sws.t) wout(new TextDecoder().decode(new Uint8Array(rv)));
			else woutobj(rv);
			cbok();
		}catch(e){cberr(e);}
	};//»
	if (args.length > 1) return cberr("Only want 0 or 1 args!");
	read_file_args_or_stdin(args,async(rv,fname,err)=>{//«
		if (!rv){
			if (err) werr(err);
			return;
		}   
		if (typeof(rv) === "object"){
			if (rv.EOF===true) return;
			dodecrypt(await capi.toBuf(rv));
		}
		else{
log(rv);
			werr(`decrypt received an unknown object (expected Uint8Array or Blob)`);
		}
	}, {SENDEOF:true, BINARY: true}); //»
},//»

}

if (!comarg) return Object.keys(COMS);

//Imports«

const{NS,xgetobj,globals,log,cwarn,cerr}=Core;
const{fs,util,widgets,dev_env,dev_mode}=globals;
const{strnum,isarr,isobj,isstr,mkdv}=util;
const{fmt,read_stdin, woutobj,pathToNode,read_file_args_or_stdin,serr,normpath,cur_dir,respbr,set_var_str,get_var_str,refresh,failopts,cbok,cberr,wout,werr,termobj,wrap_line,kill_register,EOF,ENV}=Shell;
const fsapi=NS.api.fs;
const capi = Core.api;

//»

//Funcs«
const get_key=(algo)=>{
	return new Promise(async(Y,N)=>{
		let enckey = get_var_str(KEY_ENV_STR);
		if (!enckey) return Y();
		let str = atob(enckey);
		let arr = new Uint8Array(str.length);
		for (let i=0; i < str.length; i++) arr[i]=str[i].charCodeAt();
		Y(await crypto.importKey("raw",arr.buffer,algo,true,["encrypt", "decrypt"]))
	});
};

const make_key=(algo,length)=>{
	return crypto.generateKey({name:algo,length:length},true,["encrypt","decrypt"]);
};
const FATAL=s=>{throw new Error(s)};

const encrypt=(algo, key, pass, mess)=>{
	let pass_bytes;
	if (isstr(pass)) pass_bytes = new TextEncoder().encode(pass);
	else if (!(pass instanceof Uint8Array)) FATAL("Invalid password format");
	else pass_bytes = pass;
	let mess_bytes;
	if (isstr(mess)) mess_bytes = new TextEncoder().encode(mess);
	else if (!(mess instanceof Uint8Array)) FATAL("Invalid message format");
	else mess_bytes = mess;
	return crypto.encrypt({name: algo,iv: pass_bytes}, key, mess_bytes);
};

const decrypt=(algo, key, pass, mess)=>{
	let pass_bytes;
	if (isstr(pass)) pass_bytes = new TextEncoder().encode(pass);
	else if (!(pass instanceof Uint8Array)) FATAL("Invalid password format");
	else pass_bytes = pass;
	return crypto.decrypt({name: algo,iv: pass_bytes}, key, mess);
};

const export_key=(key,if_raw)=>{
	return new Promise(async(Y,N)=>{
		let exp = await crypto.exportKey("raw", key);
		if (if_raw) return Y(exp);
		let arr = new Uint8Array(exp);
		let b = '';
		for (let i=0; i < arr.length; i++) b+=String.fromCharCode(arr[i]);
		Y(btoa(b));
	});
};
//»

COMS[comarg](args);

}


