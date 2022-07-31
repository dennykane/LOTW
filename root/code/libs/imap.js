
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

imap:async()=>{

let portarg = args.shift();
if (!portarg) return cberr("No port given!");
let port = portarg.ppi({MAX:MAX_PORT});
if (isNaN(port)) return cberr(`${portarg}: invalid port number`);
try{

let got = await fetch(`${IMAP_HOST}:${port}/`);
cbok(await got.text());

}catch(e){cberr(e);return;}
//log(got);
//log(port);

}

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fsapi=NS.api.fs;
const capi = Core.api;
const MAX_PORT = 2**16-1;
const IMAP_HOST = "http://localhost";

const{
	cbok,
	cberr
} = Shell;

//»


COMS[comarg](args);

}
