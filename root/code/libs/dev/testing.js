
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

	BLAH:async()=>{

		let dirpath =`${globals.home_path}/.data/apps/what/Cool`
		wout(`Making directory: ${dirpath}`);
		if (await fs.mkDir(dirpath)) return cbok();
		cberr("Failed");

	}

}

if (!comarg) return Object.keys(COMS);

//Imports«

const {NS,globals,log,cwarn,cerr}=Core;
const fs = NS.api.fs;
const capi = Core.api;

const{
	wout,
	cbok,
	cberr,
	ENV
} = Shell;

//»

COMS[comarg](args);

}
