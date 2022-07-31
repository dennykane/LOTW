
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

gcloud:async()=>{//«

	const send=(str)=>{
		let mod = NS.mods["util.pager"];
		if (!mod){
			wout(str);
			cbok();
			return;
		}
		let pager = new mod(Core, Shell);
		pager.init(str,`gcloud(${argstr})`,cbok, "termdump");
	};
	if (!canget()) return;
	let do_fmt = get_var_str("MANFMT");
	let argstr = args.join(" ");
	let store = await capi.getStore("gcloud");
	let store_key = args.join("-");
	let rv = await store.get(store_key);
	if (rv){
		if (rv==="0") return cberr(`No such gcloud command: '${argstr}'`);
		werr("Using cache...");
		return send(await capi.decompress(rv));
	}
	let out="";
	let str = await run_cli("PAGER=cat gcloud "+argstr);
	let lines = str.split("\n");
	if (lines.length==1&&lines[0]=="") {
		cberr(`No such gcloud command: '${argstr}'`);
		if (!await store.set(store_key, "0")){
console.error("Could not write to the database!");
		}
		return 
	}
	for (let ln of lines) out+=ln.replace(/\x1b\x5b[1-9]?(;[1-9])?m/g,"")+"\n";
	send(out);
	if (!await store.set(store_key, await capi.compress(out))){
console.error("Could not write to the database!");
	}

},//»

sendchat:async()=>{//«
	let opts = failopts(args,{l:{room:3},s:{r:3}});
	if (!opts) return;
	let name = opts.room||opts.r;
	if (!name) return cberr("No 'room' arg given! ");
	let mess = args.join(" ").regstr();
	if (!mess) return cberr("No message given!");
	let rv = await fetch(`/_createchat?room=${name}`,{method:"POST",body:mess});
	let txt = await rv.text();
	if (rv.ok!==true) return cberr(txt);
	cbok(txt);
},//»
getchats:async()=>{//«
	let name = args.shift();
	if (!name) return cberr("No 'room' arg given! ");
	let rv = await fetch(`/_getchats?room=${name}`);
	let txt = await rv.text();
	if (rv.ok!==true) return cberr(txt);
	let arr = JSON.parse(txt);
	woutobj(arr);
	cbok();
},//»
testmail:async()=>{//«
	if (!(dev_mode&&dev_env)) return cberr("Not dev");
	let rv = await fetch('/_testmail');
	if (!rv) return cberr("???");
	let txt = await rv.text();
	if (rv.ok!==true) return cberr(txt);
	cbok(txt);
},//»
sendmail:async()=>{//«
/*

~/.mailrc example:
vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
#FROM LOTW Admin <lotw.xyz@gmail.com>

#TO
me=<someone>@gmail.com
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

*/
let rcobj = await getmailrc();
if (!isobj(rcobj)){
	if (isstr(rcobj)) cberr(rcobj);
	else {
		cberr("Uknown value returned from getmailrc");
		console.log(rcobj);
	}	
	return;
}
let toobj = rcobj.to;
let aliases = toobj.aliases;
let subobj = rcobj.sub;
let from = rcobj.from;

const getval=(which)=>{//«
	return new Promise((y,n)=>{
		stdin(str=>{
			if (isstr(str)) y(str);
		},{ONCE:true,PROMPT:`${which}: `});
	});
};//»
if (from) wout("Sending as: "+from);

let to = await getval("To");
if (!to) return cberr();
let _to = to;
if (aliases[to]) to = aliases[to];
to = toobj[to];
if (!to) return cberr("Unknown mail recipient: "+_to);
wout(to);
let sub = await getval("Subject");
if (!sub) sub = "[no subject]";
else if (subobj[sub]) {
	sub = subobj[sub];
	wout(sub);
}
wout("Type the message, then Ctrl-C to send");
let str='';
let nlines=0;
let goteof = false;
stdin(rv=>{
	if (isstr(rv)) {
		if (rv=="\n") str+=rv;
		else str+=rv+"\n";
		nlines++;
	}
	else if (rv.EOF===true){
		if (goteof) return;
		goteof = true;
		if (!str.match(/[a-z]+/i)) return cberr("Nothing intelligible to send");
		wout(nlines+" lines "+str.length+" bytes");
		respbr();
        termobj.set_prompt("Really send [n/Y]? ", {
            NOPUSH: 1,
            NOSCROLL: 1
        }); 
        refresh();
    	termobj.getch(async(rv2)=>{
			if (rv2===undefined||rv2=="y"||rv2=="Y") {
				wout("Sending...");
				let out = `Subject: ${sub}\n`;
				if (from) out+=`From: ${from}\n`
				out +=`\n${str}`
				let rv = await fetch(`${LOCURL}/_email?to=${encodeURIComponent(to)}`, {method:"POST",body:out, headers:{'Content-Type':"text/plain"}});
				let txt = await rv.text();
				cbok(txt);
			}
			else {
				cberr("Cancelled!");
			}
		});
	}
});

},//»
getmail:async args=>{//«

	const getmail = (num)=>{//«
		return new Promise(async(y,n)=>{
			let url = `${MAILURL}/?com=get&arg=${num}`;
			let body;
			try{
				let rv = await fetch(url);
				y(await rv.text());
			}
			catch(e){
	console.log(e);
				y();
			}
		})
	};//»

	let arg = args.shift();
	if (!arg) return cberr("No arg to get!");
	if (!arg.match(/^[0-9]+$/)) return cberr("Bad number");
	let n = parseInt(arg);
	if (n < 1) return cberr("Number too small");
	//if (n > sizes.length) return cberr( "Number too large");
	let rv = await getmail(n);
	if (!rv) return cberr("There was a problem");
	wout(rv);
	wout({EOF:true});
	cbok();

},//»
cli:async args=>{//«

// 
//  escaped single quotes---  (\x27 == "'")
// 	                       V
// cli 'printf "Subject: I\x27m fine, and you?\n\nWrite you stuff\nwith line breaks\n\nlike this" | /usr/sbin/ssmtp some@domain.ext'
//

// Escape double quotes using 2 slashes.
//                                                   ---Need extra slash here
// 													 V
// cli 'printf "\x27single quoted\x27\n\n...and...\n\n\\x22double quoted\\x22"'

	if (!canget()) return;
	wout(await run_cli(args.join(" ")));
	cbok();

},//»
gapi:async args=>{//«
//https://apis.google.com/js/platform.js

if (!window.gapi && !await capi.makeScript("https://apis.google.com/js/api.js")) return cberr("Could not load gapi!");
let apiKey = get_var_str("GAPI_KEY");
let clientId = get_var_str("GAPI_CLIENT_ID");
if (!(apiKey && clientId)) return cberr("Need GAPI_KEY and GAPI_CLIENT_ID defined in the environment!");
gapi.load('client:auth2', ()=>{
	gapi.client.init({
	apiKey: apiKey,
	clientId: clientId,
//	discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
	discoveryDocs: [],
//	scope: 'https://www.googleapis.com/auth/gmail.readonly'
	scope: 'profile email'
	}).then(()=>{
// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(stat=>{
			cwarn("status", stat);
		});
// Handle the initial sign-in state.
		let stat = gapi.auth2.getAuthInstance().isSignedIn.get();
log(stat);
		if (!stat) gapi.auth2.getAuthInstance().signIn();

		cbok();
	}, (err)=>{
cberr("Init failure");
		cerr(err);
	});
});
log(gapi);
cbok();
},//»
doggl:async(args)=>{//«
	let s = '';
	fileorin(args,(rv,fname,err)=>{
		if (!rv){
			if (err) werr(err);
			return;
		}
		if (rv.EOF===true){
			let docobj = get_doc(s);
			let doc = docobj.doc;
			let tit = doc.title;
			let qarr = tit.split(/ +/);
			let terms = [];
			for (let q of qarr){
				if (!q.match(/[a-zA-Z]/)) break;
				terms.push(q);
			}
			let stats = doc.getElementById("resultStats").innerText.replace(/^.+(About.+)$/,"$1");
			let srch = doc.getElementById("search");
			let res = srch.getElementsByClassName("r");
			let links = [];
			let descs = [];
			let arr = [];
			let obj = {type:"GoogleResults", query: terms, stats: stats}
			obj.results = arr;
			for (let r of res){
				let a = r.childNodes[0];
				arr.push({link:a.href, desc:a.innerText});
			}
			woutobj(obj);
			cbok();
			return;
		}
		if (isarr(rv) && rv.length && isstr(rv[0])){
			s+=rv.join("\n");
		}
		else if (isstr(rv)){
			s+=rv;
		}
		else{
			werr("Dropping non string/array-of-strings input");
		}
	},{SENDEOF:true});
},//»
dumpcache:async(args)=>{//«
	const sws = failopts(args,{SHORT:{z:1}});
	if (!sws) return;
	let s = JSON.stringify(getcache());
	let val;
	if (sws.z) val = await fs.dogzip(new Uint8Array(await capi.toBuf(s)));
	else val = s;
	woutobj(val);
	cbok();
},//»
setcache: async(args)=>{//«
	let path = args.shift();
	if (!path) return cberr("No path given");
	let rv = await fsapi.readFile(normpath(path));
	if (!rv) return cberr("Nothing found");
	if (path.match(/\.gz$/)){
		try {
			rv = await fs.dogzip(rv, true);
		}
		catch(e){
			cberr("Bad .gz file?");
			return;
		}
	}
	let obj;
	try{
		obj = JSON.parse(rv);
	}
	catch(e){
		cberr("Parse error");
		return;
	}
	getcache(obj);
	cbok("OK");
},//»
browse:async(args)=>{//«

const sws = failopts(args,{SHORT:{c:1,l:3}});
if (!sws) return;
let cacheonly = sws.c;
let wraplen;
if (sws.l){
	let n = sws.l.pnni();
	if (!NUM(n)) return cberr("Bad length arg");
	wraplen = n;
	if (wraplen < 30) return cberr("Minimum wrap length == 30!");
}

const done=(err)=>{//«
	termobj.getch_loop(null);
	if (err) cberr(err);
	else cbok();
	killed = true;
};//»
let killed = false;
let history=[];
let curpos=0;
let gobj;
let last_cant_go=false;
let art;
const show_search_page=()=>{//«
	links = [];
	werr(`Query: "${gobj.query.join(' ')}"`);
	let results = gobj.results;
	let iter=0;
	for (let res of results){
		werr(`${iter}) ${res.desc}`);
		links.push(res.link);
		iter++;
	}
};//»
/*
kill_register(cb=>{
log("KILL???");
	done();
	cb&&cb();
});
*/
stdin((obj,is_kill)=>{
	if (!obj) return;
	if (isobj(obj)){
		if (obj.EOF===true) {
			if (is_kill) done();
			return;
		}
	}
	if (obj.type=="GoogleResults"){//«
		gobj = obj;
		show_search_page();
	}//»
	else{
		werr(`Unknown type: ${obj.type}`);
	}
	const follow_link = async(link, if_history)=>{//«
		wout(`Following ${link}...`);
		let CACHE=getcache();
		let rv = CACHE[link];
		let didget = false;
		if (!rv) {
			if (cacheonly) return done(`Not found in cache: ${link}`);
			werr(`Internet request!`);
			rv = await get(link);
cwarn("Returned from innernette");
if (!rv||rv.match(/^[\s\t]*$/)){
werr("Empty response (404?)");
return;
}
			CACHE[link] = rv;
			didget = true;
		}
		if (!if_history) {
			history.push(link);
			let n = history.length - curpos - 1;
			if (n) {
				for (let i=0; i < n; i++) history.pop();
			}
			curpos++;
		}
		let docobj = get_doc(rv);
		let doc = docobj.doc;
		let body = docobj.body;
		breaker();
		termobj.set_seek_stop();
		werr(`${link}`);
		werr(`${docobj.title}`);
		let marr;
		let arts;
		let keep_breaks =false;
		if (marr = link.match(/^(https?:\/\/developers.google.com)\//)){//«
			arts = body.getElementsByClassName("devsite-article-body");
			if (!(arts&&arts.length==1)) arts = doc.getElementsByTagName("ARTICLE");
			if (!(arts&&arts.length==1)){
log("ARTS",arts);
log(body);
				return done("Can't find good <article>");
			}
			keep_breaks=true;
			art = arts[0];
		}//»
		else if (marr = link.match(/^(https?:\/\/github.com)\//)){//«
			arts = body.getElementsByClassName("repository-content");
			if (!(arts&&arts.length==1)){
log("ARTS",arts);
log(body);
				return done("Can't find good class=repository-content");
			}
			art = arts[0];
		}//»
		else if (marr = link.match(/^(https?:\/\/www.reddit.com)\//)){//«
			let conts = body.getElementsByClassName("content");
for (let elm of conts){
if(elm.tagName==="DIV"){
arts=[elm];
break;
}
}
			if (!(arts&&arts.length==1)){
log("ARTS",arts);
log(body);
				return done("Can't find good class=content");
			}

			art = arts[0];
		}//»
		else if (marr = link.match(/^(https?:\/\/www.sitepoint.com)\//)){//«
			arts = body.getElementsByClassName("ArticleCopy");
			if (!(arts&&arts.length==1)){
log("ARTS",arts);
log(body);
				return done("Can't find good class == ArticleCopy");
			}
			keep_breaks=true;
			art = arts[0];
		}//»
		else {
log(body);
			return werr("Unknown domain/document format!");
		}
		clean_tags(art);
		render_content(marr[1],art,keep_breaks,wraplen);
		werr(`${link}`);
	};//»
	termobj.getch_loop(async(ch)=>{//«
		if (killed) return cerr("ISKILLED!");
		if (ch=="q") return done();
		if (ch=="b"){
			if (curpos==0) {
				if (!last_cant_go) werr("Can't go back");
				last_cant_go=true;
				return 
			}
			last_cant_go=false;
			if (curpos==1) {
				curpos=0;
				return show_search_page();
			}
			curpos--;
			let link = history[curpos-1]
			if (!link) return werr(`No link found at: ${curpos}`);
log(link);

			follow_link(link, true);
			return;
		}
		if (ch=="f"){
			if (curpos==history.length) {
				if (!last_cant_go) werr("Can't go forward");
				last_cant_go=true;
				return 
			}
			last_cant_go=false;
			curpos++;
			let link = history[curpos-1];
			if (!link) {
log(history);
				return werr(`No link found at: ${curpos-1}`);
			}
			follow_link(link, true);
			return;
		}
		if (ch=="p"){
if (!(widgets&&art)) return;
widgets.pophuge(art,{SEL:true});
return;
		}
        if (!(ch&&ch.match(/^[0-9]$/))) {
cwarn(ch);
			return; 
        }
		last_cant_go=false;
		let num = ch.pi();
		let link = links[num];
		if (!link) {
log(num,links);
			return done("No link found for: "+ch);
		}
		follow_link(link);
	});//»
});

},//»
curl:async(args)=>{//«
	let path = args[0];
	if (!path) return cberr("No path");
	if (!canget()) return;
	wout(await get(path));
	cbok();

},//»
wget:async(args)=>{//«
//n == no strip args
	let opt={
		s:{n:1},
		l:{
			"no-strip":1
		}
	};
	let opts = failopts(args,opt);
	if (!opts) return;
	let path = args[0];
	if (!path) return cberr("No path");
	if (!canget()) return;
	let fname = path.split("/").pop();
	if (!fname) return cberr("No filename!");
	if(!(opts["no-strip"]||opts.n)) fname = fname.split("?")[0];
	
	let savepath = normpath(fname);
	if (await fsapi.pathToNode(savepath)) return cberr(`Not clobbering ${savepath}`);
	werr("Getting: "+path);
	let rv = await get(path);
	if (!rv) return cberr("No response");
	if (! await fsapi.writeFile(savepath, rv)) return cberr("The file could not be saved");
	cbok();

},//»
gglstrip:async(args)=>{//«
	if (!args.length) return cberr("No file");
	let rv = await fsapi.readFile(normpath(args[0]));
	if (!rv) return cberr("File not found");
	let doc = (new DOMParser()).parseFromString(rv.join("\n"), "text/html");
	let elems = Array.from(doc.getElementsByClassName("g"));
	werr(`${elems.length} results found`);
	let out='';
	for (let e of elems) out+=e.outerHTML+"\n";
	wout(out);
	cbok();
},//»
ggl:async(args)=>{//«
	if (!args.length) return cberr("No search terms");
	if (!canget()) return;
	let savepath=normpath(`GSRCH:${args.join("_")}.html`);
	if (await fsapi.pathToNode(savepath)) return cberr(`Not clobbering ${savepath}`);
	werr("Google search: '"+args.join(" ")+"'...");
	let rv = await get(`www.google.com/search?q=${args.join("+")}`);
	if (!rv) return cberr("No response");
	let doc = (new DOMParser()).parseFromString(rv, "text/html");
//The search results are kept in these containers: <div class="g">...</div>
	let elems = Array.from(doc.getElementsByClassName("g"));
	werr(`${elems.length} results found`);
	let out='';
	for (let e of elems) out+=e.outerHTML+"\n";
	if (! await fsapi.writeFile(savepath, out)) return cberr("The file could not be saved");
//	if (! await fsapi.writeFile(savepath, rv)) return cberr("The file could not be saved");
	cbok();
},//»
getgmail:async(args)=>{//«
	if (!(dev_env&&dev_mode)) return cberr("Only for dev mode!");
	let sws = failopts(args, {SHORT:{u:3, p:3}});
	if (!sws) return;
	let user = sws.u;
	let pass = sws.p;
	if (!(user&&pass)) return cberr("Need username and password!");
	wout(await run_cli(`curl -u ${user}:${pass} --silent "https://mail.google.com/mail/feed/atom"`));
	cbok();
},//»
parsemail:async(args)=>{//«

stdin(str=>{

	if (!isstr(str)) return cberr("Unexpected object in stdin");
	let parser = new DOMParser()
	let doc = parser.parseFromString(str, "application/xml");
	let ents = doc.getElementsByTagName("entry");
	let objs = [];
	for (let ent of ents){
		let link = ent.getElementsByTagName('link')[0];
		let href = link.getAttribute("href");
		objs.push({
			title:ent.getElementsByTagName('title')[0].textContent,
			summary:ent.getElementsByTagName('summary')[0].textContent,
			id:ent.getElementsByTagName('id')[0].textContent.split(":").pop(),
			from:{
				name: ent.getElementsByTagName('name')[0].textContent,
				email: ent.getElementsByTagName('email')[0].textContent
			}
		});
	}
	cbok();
});

},//»
htparse:async(args)=>{//«

	let opts = failopts(args,{LONG:{moz:1},SHORT:{}});
	if (!opts) return;
	let s = '';
	fileorin(args,(rv,fname,err)=>{
		if (!rv){
			if (err) werr(err);
			return;
		}
		if (isarr(rv) && rv.length && isstr(rv[0])){
			s+=rv.join("\n");
			let docobj = get_doc(s);
			let doc = docobj.doc;
			let tit = doc.title;
			let art;
			if (opts.moz) art = doc.getElementById("content");
			else{
				werr("Unknown htdoc format (using doc.body)");
				art = doc.body;
			}
			if (!art) return cberr("No <content> found!");

			clean_tags(art);
/*XXX BADBUG

Putting this single line out before the content is put out like this: 
wout(arr.join("\n"));
...while command  is in the middle of a pipeline with less at the end creates
a problem upon quitting (pressing 'q') the pager, less. All of the lines in Terminal's
lines array are removed, except for this one line. Then, trying to push the UP key (which
puts the previous command on the command line) caused the situation in Terminal to go into
an infinite loop. Here was the offending code in Terminal (which has now been updated to remove
the infinite loop):

                while (cur_prompt_line+1 != lines.length) {
                    lines.pop();
                }
*/

			wout("Title: "+tit);
//			wout("Yoom, gwub harch........");
			render_content('https://developer.mozilla.org',art,true);
			cbok();

		}
		else{
			werr("Dropping non string/array-of-strings input");
		}
	});
//	},{SENDEOF:true});
}//»

}

if (!comarg) return Object.keys(COMS);

//Imports«
//const{NS,xgetobj,globals,}=Core;
const{fs,util,widgets,dev_env,dev_mode}=globals;
const{strnum,isarr,isobj,isstr,mkdv}=util;
const{fmt,read_stdin, woutobj,get_path_of_object,pathToNode,read_file_args_or_stdin,serr,normpath,cur_dir,respbr,get_var_str,refresh,failopts,cbok,cberr,wout,werr,termobj,wrap_line,kill_register,EOF,ENV}=Shell;
const fsapi=NS.api.fs;
const capi = Core.api;
const fileorin = read_file_args_or_stdin;
const stdin = read_stdin;
const NUM = Number.isFinite;
//»
//Var«

const MAILPORT=20002;

const locport = globals.local_port;
const LOCURL = `http://${window.location.hostname}:${locport}`
const MAILURL = `http://${window.location.hostname}:${MAILPORT}`
const log = (...args)=>console.log(...args);
const cwarn = (...args)=>console.warn(...args);
const cerr = (...args)=>console.error(...args);
const wrap = fmt;
const ok_attrs=["style","href"];

let links;
//»
//Funcs«

/*
//This does into some kind of net/iface.lib
const do_call_or_ans=async(args, if_call)=>{//«
	const get_time=()=>{
		let arr = new Date().toString().split(" ");
		let mon = arr[1];
		let d = arr[2].replace(/^0/,"");
		let tmarr = arr[4].split(":");
		let ampm="a";
		let hr = parseInt(tmarr[0]);
		if (hr >= 12){
			ampm = "p";
			if (hr >= 13) hr-=12;
			return `${mon} ${d} @${hr}:${tmarr[1]}${ampm}`;
		}
	};
	let chan;
	let win;
	let killed = false;
	kill_register(cb=>{
		killed=true;
		if (chan) chan.close();
		cb();
	});
	let name = args.shift();
	if (!name) return cberr("No name given!");
	let mod = await fsapi.getMod("iface.net",{STATIC:true});
	if (!mod) return cberr("No iface.net mod!");
	let api = mod.api;
	let myname = await api.getMyName();
	if (!myname) return cberr("You are not logged in!");

	if (if_call) {
		wout(`Calling as: ${myname}...`);
		chan = api.makeCall(myname, name);
	}
	else {
		wout(`Answering as: ${myname}...`);
		chan = api.answerCall(myname, name);
	}

	await chan.init();
	wout("Connected");
	chan.set_close(()=>{
		if (win){
			let d = mkdv();
			d.mar=5;
			d.pad=5;
			d.bgcol="#500";
			d.tcol="#fff";
			d.innerText=`Peer connection ended @${get_time()}`;
			win.main.insertBefore(d, win.main.childNodes[0]);
		}
		killed=true;
		wout("Closed");
		cbok();
	});
	chan.set_recv(obj=>{
		if (!(obj&&obj.text)) return;
		let s = `${name} (${get_time()}): ${obj.text}`;
		if (win){
			let d = mkdv();
			d.innerText = s;
			d.mar = 5;
			d.pad = 5;
			d.bor = "1px solid black";
			win.main.insertBefore(d, win.main.childNodes[0]);
		}
		else {
console.log(s);
		}
	});
	if (_Desk) {
		win = await Desk.openApp("None",true,{LETS:"CC"});
		win.main.add(make('br'));
		win.main.over="auto";
		win.main.style.userSelect="text";
		win.title="Call\xa0Center";
	}
	while (!killed) {
		let rv = await getLineInput(">\x20")
		rv = rv.regstr();
		if (rv) chan.send(JSON.stringify({text:rv}));
	}
};
'call':async(args)=>{do_call_or_ans(args, true);},
'answer':async(args)=>{do_call_or_ans(args);},
//»
*/

const getcache = (val)=>{//«
	if (val) {
		Core.set_appvar(termobj.topwin, "BROWSERCACHE", val);
		return;
	}
	return Core.get_appvar(termobj.topwin, "BROWSERCACHE")
}//»

const canget=()=>{//«
	if (!locport) return cberr("No local port");
	return true;
};//»

const run_cli = (comarg)=>{//«
	return new Promise(async(y,n)=>{
		let url = `${LOCURL}/_com?arg=${encodeURIComponent(comarg)}`;
		let body;
		try{
			let rv = await fetch(url);
			y(await rv.text());
		}
		catch(e){
console.log(e);
			y();
		}
	})
};//»

const get = (path)=>{//«
	return new Promise(async(y,n)=>{
		let url = `${LOCURL}/_wget?path=${encodeURIComponent(path)}`;
		let body;
		try{
			let rv = await fetch(url);
			y(await rv.text());
		}
		catch(e){
console.log(e);
			y();
		}
	})
};//»

const get_doc = (str)=>{//«
	let parser = new DOMParser()
	let doc = parser.parseFromString(str, "text/html");
	let scripts = doc.getElementsByTagName("SCRIPT");
	for (let s of scripts) s.innerHTML="";
	let styles = doc.getElementsByTagName("STYLE");
	for (let s of styles) s.innerHTML="";
	let tit = doc.getElementsByTagName("TITLE")[0];
	return {
		title:(tit&&tit.innerText||""),
		doc:doc,
		body: doc.body
	};
}//»

const clean_tags=(elm)=>{//«
	if (elm.style){
		let pos = elm.style.position;
		if (pos=="absolute"||pos=="fixed") elm.parentNode.removeChild(elm);
	}
	let atts = elm.attributes;
	if (atts && atts.length){
		let arr = [];
		for (let att of atts){
			let nm = att.name;
			let val = att.value;
			if (!ok_attrs.includes(nm)) arr.push(nm);
		}
		for (let nm of arr) elm.removeAttribute(nm);
	}
	let kids = elm.childNodes;
	for (let kid of kids) clean_tags(kid);
};//»
const breaker=()=>{werr("#".repeat(termobj.w));};
const render_content=(hostname, art, keep_breaks, wraplen)=>{//«
	let txt = art.innerText;
	let txtarr = txt.split("\n");
	let out='';
	let last_break=false;
	for (let i=0; i < txtarr.length; i++){
		let s = txtarr[i];
		if (!s.length || s.match(/^[ \t]+$/)){
			last_break=true;
			continue;
		}
		else {
			let marr;
			if (marr = s.match(/^( +)/)) {
				s = s.replace(/^ +/,"\xa0".repeat(marr[1].length));
			}
			if (keep_breaks && last_break) out+="\n"
			out+=s+"\n"
			last_break=false;
		}
	}

	let arr = out.split("\n");
	for (let i=0; i < arr.length; i++){
		let str = arr[i];
		arr[i] = wrap(str,{maxlen:wraplen});
	}
	wout(arr.join("\n"));
//for (let ln of arr){
//wout(ln);
//}
	breaker();
	links=[];
	let iter=0;
	for (let ln of art.getElementsByTagName("A")){
		let use_ln;
		if(ln.origin==window.location.origin){
			if (ln.hash.match(/^#/) || ln.pathname == window.location.pathname) continue;
			let usehost = hostname;
			if (ln.pathname.match(/\.md$/)) usehost = "https://github.com";
			use_ln = usehost+ln.pathname;
		}
		if (!use_ln) use_ln = ln.href;
		if (!use_ln) continue;

		let desc = ln.innerText.replace(/\n/g," ").regstr();
		if (!(!desc||desc.match(/^[ \t]$/))) {
			werr(`${iter}) ${desc}`);
			iter++;
			links.push(use_ln);
		}
	}
	breaker();
}//»

const getmailrc=()=>{//«

return new Promise(async(y,n)=>{

const perr=s=>{
	y(`Parse error: ${s}`);
	return false;
}
const err=(s)=>{
	y(s);
};
let cursec;
let is_alias;
let obj={
	to:{aliases:{}},
	sub:{}
};
let user = ENV.USER;
if (!(user && user!="user")) return err("No valid user");
let rv =await fsapi.readFile(`/home/${user}/.mailrc`,{FORCETEXT:true});
if (rv===false) return err(`~/.mailrc not found`);
if (!(isarr(rv)&&isstr(rv[0]))) return err("Unknown value returned from fs.readFile");

const parse_field=str=>{
	let sec = obj[cursec];

	let arr = str.split("=");

	if (arr.length!=2) return perr("87rSj");
	let k = arr[0];
	if (!k.length) return perr("79gJn");
	let v = arr[1];
	if (!v.length) return perr("33yHH");
	if (cursec=="to"){
		if (is_alias){
			if (!sec[v]) return perr("28HGT");
			sec.aliases[k]=v;
			return true;
		}
		else if (!v.match(/^[a-z]+[a-z.]?[a-z0-9]+@[a-z]+\.(com|net|org|gov)+$/)) return perr("98hTh");
	}
	sec[k]=v;
	return true;
};
for (let ln of rv){
	is_alias=false;
	ln = ln.regstr();
	if (!ln.length) continue;
	if (ln.match(/^#FROM /)){
		let arr = ln.split(" ");
		arr.shift();
		obj.from = arr.join(" ");
		continue;
	}
	if (ln=="#TO") {
		cursec="to";
		continue;
	}
	else if (ln=="#SUBJECT") {
		cursec="sub";
		continue;
	}
	let parts = ln.split(" ");
	if (parts.length==1){
		if (!parse_field(parts[0])) return;
	}
	else if (parts.length==2){
		if (!parts[0]=="alias") return perr("674YI");
		is_alias=true;
		if (!parse_field(parts[1])) return;
	}
	else{
		return perr("485SA");
	}
	//let arr = ln.split("=");
}
y(obj);
});

}//»

/*
const get_store=(name)=>{//«
	return new Promise(async(Y,N)=>{
		if (!await fsapi.loadMod("sys.idb")) return N("Cannot load module: sys.idb!");
		let mod = new NS.mods["sys.idb"](Core);
		mod.init("storage", name);
		Y(mod.tx());
	});
};//»
*/

//»

COMS[comarg](args);


}

