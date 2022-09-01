
export const lib = (comarg, args, Core, Shell)=>{

const COMS={

/*
	BLAH:async()=>{

		let dirpath =`${globals.home_path}/.data/apps/what/Cool`
		wout(`Making directory: ${dirpath}`);
		if (await fs.mkDir(dirpath)) return cbok();
		cberr("Failed");

	}
*/

PLAYTEST:async()=>{

let path = args.shift();
if (!path) return cberr("No path");

let url = Core.fs_url(normpath(path));
let ent = webkitResolveLocalFileSystemURL(url,(e)=>{

killreg(cb=>{
	audio.pause();
    termobj.getch_loop(null);
	cb&&cb();
})

termobj.getch_loop(ch=>{//«
	if (ch=="-") audio.currentTime-=5;
	else if (ch=="=") audio.currentTime+=5;
});//»


let mk = capi.mk;
let audio = mk('audio');
audio.src = url;
audio.play();

},()=>{
cberr("Np such file");
});

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
	normpath,
	kill_register: killreg,
	termobj,
	ENV
} = Shell;

//»

COMS[comarg](args);

}
