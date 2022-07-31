
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

	_template_:()=>{
		wout("It works!");
		cbok();
	}

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fsapi=NS.api.fs;
const capi = Core.api;

const{
	wout,
	cbok,
	cberr
} = Shell;

//»

COMS[comarg](args);

}
