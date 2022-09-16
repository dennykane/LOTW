
/*TODO: 
webm audio+video / m4a audio / mp4 audio+video
*/

/*«

XXX EDGE CASE ERROR XXX:

ZBLERJ Desktop/sphinx.webm -s 1885.33 -e 1900.01 => 98067 bytes 14.68s == OK

What is really going on here to screw up the algorithm?
ZBLERJ Desktop/sphinx.webm -s 1885.33 -e 1900.001 => 161713 bytes 24.68 + time reported as much longer...
ZBLERJ Desktop/sphinx.webm -s 1885.33 -e 1900.0001 => 161713 bytes 24.68 + time reported as much longer...
ZBLERJ Desktop/sphinx.webm -s 1885.33 -e 1900.00001 => 161713 bytes 24.68 + time reported as much longer...

ZBLERJ Desktop/sphinx.webm -s 1885.33 -e 1900.002 => 98067 bytes 14.68s == OK

Solution: 
//@QIURTMCSL Took out this weird/crazy idea
//if (tm%2) tm-=1;


»*/
/*//«

https://matroska-org.github.io/libebml/specs.html

There is only one reserved word for Element Size encoding, which is an Element
Size encoded to all 1's. Such a coding indicates that the size of the Element
is unknown, which is a special case that we believe will be useful for live
streaming purposes. However, avoid using this reserved word unnecessarily,
because it makes parsing slower and more difficult to implement.

//»*/

export const lib = (comarg, args, Core, Shell)=>{//«

const MS_PER_WEBM_BLOCK = 20;

const COMS = {

ZBLERJ:async()=>{//«

//Var«

let rv;
let MAX_ITERS=10000;
let iter=0;
let clean_finish = false;
let num_clusters=0;

let seekhead, info, cues;

let seekhead_start, seekhead_end;
let info_start, info_end;
let cues_start;
let tracks_start, tracks_end;
let cluster_start;
let timecodescale;
let duration;
let timemult;
let start_cluster;
let end_cluster;
let end_cluster_plus1;
let clusters;
let tracks;

let cluster_positions=[];
//»
//Funcs«
const exit=code=>{cberr(`Exiting code: ${code}`);};
//»
//Options/Args«
let opts = failopts(args,{s:{s:3,e:3},l:{start:3,end:3}});
if (!opts) return;

let start_time = opts.start||opts.s;
let end_time = opts.end||opts.e;

if (!(start_time || end_time)) return cberr("Nothing to do!");
if (start_time==="-") start_time=0;
else{
//SJUOPUEA
//	start_time=parseFloat(Math.round(100*start_time)/100);
	start_time=parseFloat(start_time);
	if (!Number.isFinite(start_time) && start_time>=0) return cberr("Invalid start");
}
let path = args.shift();
if (!path) return cberr('No path given!');

let fullpath = normpath(path);
rv = await fs.pathToNode(fullpath);//Check if the file exists

if (!rv) return cberr(`${path}: no such file`);
if (rv.root.TYPE!=="fs") return cberr(`Only currently supporting local files!`);//Check if the file is "fs" (local)
//»
//EBML/Segment Header«

rv = await fs.readFile(fullpath, {binary: true, start:0, end:12});
if (!rv) return exit("E01");//Couldn't get at least 12 bytes from the file!
if (!(rv[0]==0x1a&&rv[1]==0x45&&rv[2]==0xdf&&rv[3]==0xa3)) return exit("E02");//No EBML_ID!
rv = ebml_sz(rv, 4);
let ebml_len = 4+rv[0]+1;
rv = await fs.readFile(fullpath, {binary: true, start:0, end:ebml_len});
let ebml = rv;//There are the EBML Header bytes
rv = await fs.readFile(fullpath, {binary: true, start:ebml_len, end:ebml_len+12});
if (!rv) return exit("E03");//Could not get 12 bytes of the Segment!
if (!(rv[0]==0x18&&rv[1]==0x53&&rv[2]==0x80&&rv[3]==0x67)) return exit("E04");//No SEGMENT_ID!
rv = ebml_sz(rv, 4);
let old_segment_len = rv[0];//The length of the original segment
let segment_body_offset = ebml_len + rv[1];//Add this to the reported Cue positions to get the actual file positions
let cur_off = segment_body_offset;

let segment_head = new Uint8Array(12);//«
{
	let a = segment_head;
	a[0]=0x18;
	a[1]=0x53;
	a[2]=0x80;
	a[3]=0x67;
	a[4]=0x1;
}//»

//»
//Find Webm element locations from SeekHead or by just searching«
while(true){

if (iter > MAX_ITERS) return exit(`E06-${iter}`);
rv = await fs.readFile(fullpath, {binary: true, start:cur_off, end:cur_off+12});

if (!rv) return exit(`E07-${iter}`);//Could not get 12 mode bytes of the Segment body!
let idname;
let idlen;

if (rv[0]==0xec){
	idname = "VOID";
	idlen=1;
}
else {
	try {
		idname = TOPLEVEL_ID_MAP[to_hex_str(rv, 4)];
	}
	catch(e){
log(rv);
		return exit(`E09-${iter}`);
	}
		idlen = 4;
}
if (!idname) return exit(`E08-${iter}`);
rv = ebml_sz(rv, idlen);
if (idname==="CLUSTER") {//«
	cluster_start = cur_off+rv[1];
	break;
}//»
else if (idname=="SEEKHEAD"){//«
	seekhead_start = cur_off;
	seekhead_end = seekhead_start+rv[0]+rv[1];
	seekhead = await fs.readFile(fullpath, {binary: true, start:seekhead_start, end:seekhead_end});
	rv = parse_section(seekhead, SEGMENT);
	if (rv[0]!=="SEEKHEAD:114d9b74") return exit("E24");
	let arr = rv[1];
	for (let i=0; i < arr.length-1; i+=2){
		let a = arr[i+1];
		if (!(a[0]==="SEEKID:53ab"&&a[2]==="SEEKPOSITION:53ac")) return exit(`E10`);
		let id = to_hex_str(a[1]);
		let pos = toint(a[3]);
		if (id===INFO_ID) info_start = pos+segment_body_offset;
		else if (id===CUES_ID) cues_start = pos+segment_body_offset;
		else if (id===CLUSTER_ID) cluster_start = pos+segment_body_offset;
		else if (id===TRACKS_ID) tracks_start = pos+segment_body_offset;
	}
	break;
}//»
else if (idname=="INFO") info_start = cur_off+rv[1];
else if (idname=="CUES") cues_start = cur_off+rv[1];
else if (idname=="TRACKS") tracks_start = cur_off+rv[1];
cur_off += rv[0]+rv[1];
if (old_segment_len == cur_off - segment_body_offset){
	clean_finish = true;
	break;
}
iter++;

}

if (!(info_start&&cues_start)) return exit("E11");

//»
//Extract relevant info from Info...//«
{

if (!info) {
	rv = await fs.readFile(fullpath, {binary: true, start:info_start, end:info_start+12});
	if (to_hex_str(rv, 4)!==INFO_ID) return exit("E12");
	rv = ebml_sz(rv, 4);
	info = await fs.readFile(fullpath, {binary: true, start:info_start, end:info_start+rv[1]+rv[0]});
}

rv = parse_section(info, SEGMENT);

if (rv[0]!=="INFO:1549a966") return exit("E17");
{
	let arr = rv[1];
	for (let i=0; i < arr.length-1; i+=2){
		if (arr[i]==="TIMECODESCALE:2ad7b1") timecodescale = toint(arr[i+1]);
		else if (arr[i]==="DURATION:4489") duration = (new DataView(arr[i+1].buffer)).getFloat32();
	}
}
if (!(timecodescale&&duration)) return exit("E18");
timemult = timecodescale/10**9;

}
if (end_time==="-") end_time=duration;
else{
//QMNUYEKS
//	end_time=parseFloat(Math.round(100*end_time)/100);
	end_time=parseFloat(end_time);
	if (!(Number.isFinite(end_time) && end_time>start_time && end_time <= duration)) return cberr("Invalid end_time");
}
if (start_time == 0 && end_time >= duration) return cbok("Nothing to do!");
let end_timestamp = (end_time - start_time)/timemult;
//»
//Tracks«
rv = await fs.readFile(fullpath, {binary: true, start:tracks_start, end:tracks_start+12});
if (to_hex_str(rv, 4)!==TRACKS_ID) return exit("E24");
rv = ebml_sz(rv, 4);
tracks = await fs.readFile(fullpath, {binary: true, start:tracks_start, end:tracks_start+rv[1]+rv[0]});
//»
//Cues«
rv = await fs.readFile(fullpath, {binary: true, start:cues_start, end:cues_start+12});
if (to_hex_str(rv, 4)!==CUES_ID) return exit("E13");

rv = ebml_sz(rv, 4);
cues = await fs.readFile(fullpath, {binary: true, start:cues_start, end:cues_start+rv[1]+rv[0]});

rv = parse_section(cues, SEGMENT);
if (rv[0]!=="CUES:1c53bb6b") return exit("E14");
//»
{//Get start and end cluster locations«

let ents = rv[1]
let last_pos;
let stm = start_time/timemult;
let etm = end_time/timemult;
for (let i=0; i < ents.length-1; i+=2){
	if (ents[i]!=="POINTENTRY:bb") return exit(`E15-${i}`);
	let ent = ents[i+1];
	if (!(ent[0]==="CUETIME:b3"&&ent[2]==="CUETRACKPOSITION:b7")) return exit(`E16-${i}`);
	let tm = toint(ent[1]);
//QIURTMCSL
//	if (tm%2) tm-=1;
	let tr = ent[3];

	if (!(tr[0]==="CUETRACK:f7"&&tr[2]=="CUECLUSTERPOSITION:f1")) return exit("E20");
	let pos = toint(tr[3]);
	let tmdiff = tm - stm;
	if (!start_cluster){
		if (tmdiff > 0){
			start_cluster = last_pos;
		}
		else if (tmdiff >= -3) {
			start_cluster = pos;
		}
	}
	if (tm >= etm){
		end_cluster = last_pos;
		break;
	}
	last_pos = pos;
}
if (!start_cluster) start_cluster = last_pos;
if (!end_cluster) end_cluster = last_pos;
if (!(start_cluster&&end_cluster)) {
log(start_cluster, end_cluster, last_pos);
	return exit("E19");
}

let from = end_cluster+segment_body_offset;
rv = await fs.readFile(fullpath, {binary: true, start: from, end: from+12});
if (!(rv[0]===0x1f&&rv[1]===0x43&&rv[2]===0xb6&&rv[3]===0x75)) return exit("E21");
rv = ebml_sz(rv, 4);

end_cluster_plus1 = from + rv[0] + rv[1];

//log(start_cluster , end_cluster, end_cluster_plus1);

}//»
{//Update Cluster times/Zero out excess blocks and create cluster time/pos array for new Cues«

let from = start_cluster+segment_body_offset;
//let to = end_cluster_plus1+segment_body_offset;
let to = end_cluster_plus1;
clusters = await fs.readFile(fullpath, {binary: true, start: from, end: to});
iter=0;
cur_off = 0;
let a = clusters;
let first_time;
let first_time_delta=0;
let last_cluster_pos;
let last_cluster_end;
let last_cluster_tm;
let did_slice_end;

while(true){//«
	if (iter > MAX_ITERS) return exit("E22");
	if (!(a[cur_off]===0x1f && a[cur_off+1]===0x43 && a[cur_off+2]===0xb6 && a[cur_off+3]===0x75)) {
		return exit(`E23-${iter}`);
	}
	last_cluster_pos = cur_off;
	rv = ebml_sz(a, cur_off+4);
	let cluster_sz_len = rv[1]-4;
	let cluster_sz_pos = cur_off+4;

//TYSHNRLKIUHJ
	let cluster_sz = rv[0];
	let cluster_begin = rv[1];
	let cluster_end = cluster_sz+cluster_begin;
	last_cluster_end = cluster_end;
	if (a[rv[1]]===0xe7){//«
//Get the size of the CLUSTERTIMECODE element
		let rv2 = ebml_sz(a, rv[1]+1);
		let tmcodestart = rv2[1];
		let tmcodeend = tmcodestart+rv2[0];
//Get the current time
		let curtmarr = a.slice(tmcodestart, tmcodeend);
		let usecurtmarrlen = curtmarr.length;
		let curtm = toint(curtmarr);
		if (curtm*timemult >= end_time) break;
//Create a zero'd out new time array with the length of the current one (so cluster array stays the same)
		let newtmarr = new Uint8Array(curtmarr.length);

//If this is the first cluster, set it to first_time.
//Also, if the start time is not aligned with the cluster timestamp,
//remove the excess beginning blocks and resequence the rest of them

		if (!Number.isFinite(first_time)) {//«

let d4 = start_time/timemult - curtm;
if (d4 >= 20){
first_time_delta = d4;
let excess_start_blocks = Math.floor(d4/MS_PER_WEBM_BLOCK);
if (a[tmcodeend]!==0xa3){//Looking for clusters like: timecode + simpleblock1 + simpleblock2...
	return exit("E26");
}
{//Zero out excess_start_blocks from the beginning of the first cluster (and after end if needed)«
	let coff = tmcodeend;
	let itr = 0;
//Scan forward to tne end of excess blocks
	while(itr < excess_start_blocks){
		if (!(a[coff]===0xa3)) {
			return exit(`E27-${itr}`);
		}
		let r = ebml_sz(a, coff+1);
		coff=r[0]+r[1];
		itr++;
	}


//Slice out the hole and create the smaller clusters array
{
let new_cluster_sz = cluster_sz-coff+tmcodestart;
let cluster_remainder = a.slice(coff);
let new_clusters = new Uint8Array(cluster_remainder.length+tmcodeend);
clusters.set(num_to_ebml_arr(new_cluster_sz, cluster_sz_len), 4);
new_clusters.set(clusters.slice(0, tmcodeend));
new_clusters.set(cluster_remainder, tmcodeend);
clusters = new_clusters;
a = clusters;
cluster_end-=coff-tmcodeend;
coff = tmcodeend;
}

	itr=0;
//This iterates through the rest of our first/current cluster to see of the end is contained within it
//I suppose a more subtle method can be used via timestamps
	while(true){//«
		if (itr > 10000) return exit("!?!?!?!?");
		if (!(a[coff]===0xa3)) {
			if (a[coff]==0x1f&&a[coff+1]==0x43&&a[coff+2]==0xb6&&a[coff+3]==0x75) {

				break;
			}
			if (a[coff]===0xa0){
				let r3 = ebml_sz(a, coff+1);
				let d3 = a.length - (coff+r3[0]);
				if (d3 >0 && d3 < 8){
cwarn("We have an ending BLOCKGROUP");
					return exit("E29");
				}
			}
			return exit(`E28-${itr}`);
		}
		let r = ebml_sz(a, coff+1);
		let newtm = itr*20;
//If this block is past the end, truncate the cluster
		if (newtm >= end_timestamp){//«
			did_slice_end = true;
let cluster_sz_pos = last_cluster_pos+4;
let r = ebml_sz(a, cluster_sz_pos);
let cluster_sz_len = r[1]-last_cluster_pos-4;
let l = cluster_sz_len;
let new_cluster_len = coff-cluster_sz_pos-4;
{
let ch = a[cluster_sz_pos+l+new_cluster_len+1];
if (ch===0xa3||ch===0xa0){
}
else{
cerr("Something's wrong! What is the hex number below");
log("0x"+((ch).toString(16)).padStart(2,"0"));
}
}
let arr = num_to_arr(new_cluster_len, l);
if (l==8) arr[0]|=0x1;
else if (l==7) arr[0]|=0x2;
else if (l==6) arr[0]|=0x4;
else if (l==5) arr[0]|=0x8;
else if (l==4) arr[0]|=0x10;
else if (l==3) arr[0]|=0x20;
else if (l==2) arr[0]|=0x40;
else if (l==1) arr[0]|=0x80;
a.set(arr, cluster_sz_pos);
clusters=a.slice(0, coff);
a = clusters;
//log(itr);
			break;
		}//»
		a.set(num_to_arr(newtm, 2), r[1]+1);
		coff=r[0]+r[1];
		itr++;
	}//»

}//»
}

			first_time = curtm;
		}//»

		let newtime = curtm-first_time;
		if (newtime) newtime -= first_time_delta;
		last_cluster_tm = newtime;
		let numarr = num_to_arr(newtime);
		newtmarr.set(numarr, usecurtmarrlen-numarr.length);
		a.set(newtmarr, tmcodestart);
		cluster_positions.push(newtime, cur_off);
	}//»
	else return exit("E23");
	cur_off = cluster_end;
	let diff = a.length - cur_off;
	if (!diff) break;

else if (diff < 0){
//cwarn(`diff (${diff}) < 0`);
break;
}
iter++;
}//»

if (!did_slice_end){//«
//The final timestamp in the final cluster will have this time.
//Slice everthing past it...
let itr=0;
//LNFHTYJHO
let usen = parseInt(tohex(a.slice(last_cluster_pos+8, last_cluster_pos+9))[1])+2;
let cluster_sz_pos = last_cluster_pos+4;
let r = ebml_sz(a, cluster_sz_pos);
let cluster_sz_len = r[1]-last_cluster_pos-4;
let cur_cluster_sz = r[0];
let coff = r[1]+usen;

while(true){
	if (itr > 10000) return exit("#!#!#!#!#!");
	if (!(a[coff]===0xa3)) {
		if (coff === a.length) break;
		if (a[coff]==0x1f&&a[coff+1]==0x43&&a[coff+2]==0xb6&&a[coff+3]==0x75) break;
		if (a[coff]===0xa0){
			let r3 = ebml_sz(a, coff+1);
			let d3 = a.length - (coff+r3[0]);
			if (d3 >0 && d3 < 8){
cwarn("We have an ending BLOCKGROUP");
				return exit("E30");
			}
		}
log(tohex(a.slice(coff, coff+20)));
		return exit(`E31-${itr}`);
	}
	let r = ebml_sz(a, coff+1);
	let newtm = last_cluster_tm+(itr*20);
if (newtm >= end_timestamp){//«
let l = cluster_sz_len;
let new_cluster_len = coff-cluster_sz_pos-4;
{
let ch = a[cluster_sz_pos+l+new_cluster_len+1];
if (ch===0xa3||ch===0xa0){
//log("Seems good!");
}
else{
cerr("Something's wrong! What is the hex number below");
log("0x"+((ch).toString(16)).padStart(2,"0"));
}
}

let arr = num_to_arr(new_cluster_len, l);
if (l==8) arr[0]|=0x1;
else if (l==7) arr[0]|=0x2;
else if (l==6) arr[0]|=0x4;
else if (l==5) arr[0]|=0x8;
else if (l==4) arr[0]|=0x10;
else if (l==3) arr[0]|=0x20;
else if (l==2) arr[0]|=0x40;
else if (l==1) arr[0]|=0x80;
a.set(arr, cluster_sz_pos);
clusters=a.slice(0, coff);
break;
}//»
	coff=r[0]+r[1];
	itr++;

}

}//»

}//»
{//Make new Cues«

//let add_len = seekhead.length+info.length+tracks.length;
let posns = cluster_positions;
let preknown_tot_cues_len = 12+(27*posns.length/2);
let add_len = info.length+tracks.length+preknown_tot_cues_len;

let cue_len = 0;
let cues_arr=[];
for (let i=0; i < posns.length; i+=2){//«

let tm = num_to_arr(posns[i]);
if (!tm.length) tm=[0];
let tmlen = 8;
//let tmlen = tm.length;
//log(posns[i+1]);

let pos = num_to_arr(posns[i+1]+add_len);
if (!pos.length) pos=[0];
//let poslen = pos.length;
let poslen = 8;

let entlen = 11+tmlen+poslen;

let a = new Uint8Array(entlen);

a[0]=0xbb;//POINTENTRY == 187
a[1]=128|(entlen-2);

a[2]=0xb3;//CUETIME == 179
a[3] = 128|(tmlen);
a.set(tm, 4+tmlen-tm.length);
let cur = 4+tmlen;

a[cur++]=0xb7;//CUETRACKPOSITION == 183
a[cur++]=128|(5+poslen);

a[cur++]=0xf7;//CUETRACK == 247 
a[cur++]=129;// 1 ==  (audio)
a[cur++]=1;

a[cur++]=0xf1;//CUECLUSTERPOSITION == 241
a[cur++]=128|(poslen);
a.set(pos, cur+poslen-pos.length);

cue_len+=a.length;
cues_arr.push(a);

}//»
let cues_len_arr = num_to_arr(cue_len);
cues = new Uint8Array(cue_len+4+8);
cues[0]=0x1c;
cues[1]=0x53;
cues[2]=0xbb;
cues[3]=0x6b;
cues[4]=0x1;
cues.set(cues_len_arr, 4+8-cues_len_arr.length);
let curoff = 4+8;
for (let cue of cues_arr){
	cues.set(cue, curoff);
	curoff+=cue.length;
}

}//»
{//Set Segment size and new Info->Duration«
let a = num_to_arr(info.length+tracks.length+clusters.length+cues.length);
segment_head.set(a, 12-a.length);
//log(end_timestamp);
//log((end_time-start_time)/timemult);
let tm = new Uint8Array((new Float32Array([(end_time-start_time)/timemult])).buffer);
let gotdur;
let dur_pos;
let arr = info;
for (let i=0; i < arr.length-2; i++){
	if (gotdur) break;
	if (arr[i]==0x44&&arr[i+1]==0x89) {
		let sz = ebml_sz(arr, i+2);
		if (sz[0]==4){
			dur_pos = sz[1];
			break;
		}
		else{
cwarn("Skipping sz returned", sz);
		}
	}
}
if (!dur_pos) return exit("E25");
info.set(tm.reverse(), dur_pos);
}//»
{//Send out«

let out = new Uint8Array(ebml.length+segment_head.length+info.length+tracks.length+cues.length+clusters.length);
let cur=0;
out.set(ebml,cur);cur+=ebml.length;
out.set(segment_head,cur);cur+=segment_head.length;
out.set(info,cur);cur+=info.length;
out.set(tracks,cur);cur+=tracks.length;
out.set(cues,cur);cur+=cues.length;
out.set(clusters,cur);

let file = new Blob([out],{type:"audio/webm"});
woutobj(file);
cbok();

}//»

}//»

}
if (!comarg) return Object.keys(COMS);


//Imports«

let _;//«
let getkeys = Core.api.getKeys;
_=Core;
let log = _.log;
let cwarn = _.cwarn;
let cerr = _.cerr;
let xget = _.xget;

let globals = _.globals;
if (!globals.audio) Core.api.mkAudio();

let audio_ctx = globals.audio.ctx;
let util = globals.util;
_ = util;
let strnum = _.strnum;
let isnotneg = _.isnotneg;
let isnum = _.isnum;
let ispos = function(arg) {return isnum(arg,true);}
let isneg = function(arg) {return isnum(arg,false);}
let isid = _.isid;
let isarr = _.isarr;
let isobj = _.isobj;
let isint = _.isint;
let isstr = _.isstr;
let isnull = _.isnull;
let make = _.make;
let iseof=Core.api.isEOF;
//let fs = globals.fs;

let fs_url = Core.fs_url;
let aumod=null;
//»

const {NS}=Core;

const fs = NS.api.fs;


const {//«
	wclerr,
	normpath,
	arg2con,
	get_reader,
	refresh,
	respbr,
	woutobj,
	read_stdin,
	cberr,
	failopts,
	cbok,
	termobj,
	werr,
	wout,
	ptw,
	read_file_args_or_stdin,
	set_obj_val
} = Shell;//»

let mkfakeobj=(type, obj, args)=>{//«
    var type_to_str={
        auf32: "audioFloat32Data",
        auenc: "audioEncodedData"
    }   
    var argstr="";
    if (args&&isarr(args)) argstr = args.join(",");
    obj.toString = ()=>{
        return "["+(type_to_str[type]||"Object")+" ("+argstr+")]";
    }   
    return obj;
}; //»
//»
//Var«


let PRINT_N_HEX_LINES=3;

let no_error = false;
let debug_section = false;

//»
//Funcs«


const add_sz_marker=(a, l)=>{//«
	if (l==8) a[0]|=0x1;
	else if (l==7) a[0]|=0x2;
	else if (l==6) a[0]|=0x4;
	else if (l==5) a[0]|=0x8;
	else if (l==4) a[0]|=0x10;
	else if (l==3) a[0]|=0x20;
	else if (l==2) a[0]|=0x40;
	else if (l==1) a[0]|=0x80;
};//»
const path_to_val = (bytes, qstr, fmt)=> {//«

let qarr = qstr.split("\/");
if (!qarr[0]) qarr.shift();

let marr = [];
let curobj = WEBM;
let curid;
let rv;

let subscript;
let getall=false;
let getlast=false;
let getfromend=null;
while (qarr.length) {
	let q1 = qarr.shift();
//log(q1);
	let arrnum=null;
	let bracks = q1.match(/^(.+)\[(\d*|f(\-\d+)?)\]$/);
//log(bracks);
	if (bracks){
//log(bracks);
		q1 = bracks[1];
		let br2 = bracks[2];
		let br3 = bracks[3];
		if (br3){
//log("BR3",br3);
			getfromend = parseInt(br3);
			getlast = false;
//log(getfromend);
		}
		else if (br2==="") getall=true;
		else if (br2==="f") {
			getlast = true;
		}
//		else 
		arrnum = parseInt(bracks[2]);
	}
	try {
	rv = parse_section_flat(bytes, curobj);
	}
	catch(e){
		return "Parse error";
	}
	let ids=[];
	for (let i=0; i < rv.length - 1; i+=2){
		if ((new RegExp("^.*"+q1+".*:","i")).test(rv[i])) {
			ids.push(rv[i]);
			curid = rv[i].split(":").pop();
			marr.push(rv[i+1]);
		}
	}
	if (!marr.length) return `No matches!`;
	subscript = 0;
	if (marr.length > 1) {
		if (arrnum===null) {
			return `Multiple matches(${marr.length}): ${q1}`;
		}

		if (arrnum >= marr.length) return `The requested array value(${arrnum}) is out of bounds [0-${marr.length-1}]`;
		if (getall) {
			if (qarr.length) return "Invalid query (all==true)";
			return marr;
		}
		if (getlast) subscript = marr.length - 1;
		else if (Number.isFinite(getfromend)){
subscript = marr.length - 1 + getfromend;
//log("SUBSCRIPT", subscript);
if (subscript < 0) {
cwarn("Subscript was negative", subscript);
	subscript = 0;
}
//log(s);
		}
		else subscript = arrnum;
	}

	if (qarr.length) {
		if (!curobj.kids) {
log(curobj);
			return "The current object has no kids!";
		}
		curobj = curobj.kids[curid];
		bytes = marr[subscript];
		marr=[];
	}
}

{

let val = marr[subscript];
//if (val.length > 8)
if (fmt==="int") {
	if (val.length > 8) return `Does not appear to be an 'int' (size==${val.length})`;
	return toint(val);
}
if (fmt=="float") {
	if (val.length > 8) return `Does not appear to be a 'float' (size==${val.length})`;
try {
	return tofloat(val);
}
catch(e){
return e.message;
}
}
if (fmt=="hex") return [tohex(val)];
if (fmt=="str") return [tostr(val)];
return val;

}

}//»
const tostr=(arr)=>{
	let s='';
	for (let code of arr) s+=String.fromCharCode(code);
	return s;
};
const tohex=(arr, line_w)=>{
	return to_hex_lines(arr, line_w);
};
const tofloat = (arr) => {
	if (arr.length <= 4) return (new DataView(arr.buffer)).getFloat32();
	if (arr.length <= 8) return (new DataView(arr.buffer)).getFloat64();
}
const toint = (arr) => {
	arr = arr.reverse();
	let n = 0;
	for (let i = 0; i < arr.length; i++) n |= (arr[i] << (i * 8));
	return n;
}
const to_hex_str=(arr, max_len)=>{
	let str = '';
	let len = arr.length;
	if (max_len) len = max_len;
	for (let i=0; i < len; i++) str = str + arr[i].toString(16).padStart(2, "0");
	return str;
};

const to_hex_lines=(arr, line_w)=>{
	if (!line_w) line_w = 20;
//	let line_w = 20;
	let str = '';
	for (let i=0; i < arr.length; i++) {
		str = str + arr[i].toString(16).padStart(2, "0") + " ";
		if (!((i+1)%line_w)) str+="\n";
	}
	return str;
}

const dump_hex_lines=(arr, line_w)=>{//«
log(to_hex_lines(arr));
}//»

const num_to_arr=(num, want_size)=>{//«
	let a = Array.from(new Uint8Array((new Uint32Array([num])).buffer).reverse());

//if (want_size)
	if (want_size && a.length === want_size) return a;
	if (!a[0]) a.shift();
	if (want_size && a.length === want_size) return a;
	if (!a[0]) a.shift();
	if (want_size && a.length === want_size) return a;
	if (!a[0]) a.shift();
	return a;
//	if (want_size && a.length === want_size) return a;
//	if (!a[0]) a.shift();
//	return a;
};//»

const num_to_ebml_arr=(num, want_size)=>{
	let arr = num_to_arr(num, want_size);
	add_sz_marker(arr, want_size);
	return arr;
};

const int_to_ebml=num=>{//«
	let n;

	if (num < 0) throw new Error(`Invalid number`);
	if (num < 127) return [0x80 | num];
	else if (num < 256) return [ 0x40, num];
	if (num < 65536) n = 0x20;
	else if (num <16777216) n = 0x10;
	else if (num < 4294967296) n = 0x08;

	if (!n) throw new Error(`Invalid number`);

	let a = num_to_arr(num);
	a.unshift(n);

	return a;

};//»

const get_chunk=(arr, tmmult, starttm)=>{//«

const set_len=()=>{
	let a = new Uint8Array((new Uint32Array([last-12])).buffer);
//log("LEN", a);
	out[8] = a[3];
	out[9] = a[2];
	out[10] = a[1];
	out[11] = a[0];
};
if (!arr.length) return;
//log(arr);
let out = new Uint8Array(200000);
out[0] = 0x1f;//CLUSTER_ID
out[1] = 0x43;//   |
out[2] = 0xb6;//   |
out[3] = 0x75;//   v
out[4] = 1;// 4->11 has the cluster length
out[12] = 0xe7;//CLUSTERTIMECODE
out[13] = 132;//Length = 4
//out[13]=1;//Use 8 bytes
{
//let a = new Uint8Array((new Uint32Array([starttm])).buffer);
let usetime;
if (!starttm) usetime=1;
else usetime = starttm;
//let a = new Uint8Array((new Uint32Array([starttm])).buffer);
let a = new Uint8Array((new Uint32Array([usetime])).buffer);
//log(a);
out[14] = a[3];
out[15] = a[2];
out[16] = a[1];
out[17] = a[0];
}
//log("Start", starttm);
let last=18;
//1f43b675
//a3
let curtm = 0;
for (let i=0; i < 1000; i+=2) {
	let tm = arr.shift();
	let dat = arr.shift();
	if (!tm) {
//log(i, curtm);
		set_len();
		return [out.slice(0, last), curtm];
	}
	let ln = dat.length;
	out.set([0xa3], last);
	last++;
	let a = int_to_ebml(ln);
try {
//log(a);
	out.set(a, last);
}
catch(e){
cerr("Out of bounds?", last);
return;
}
	last+=a.length;
//	let a = new Uint8Array((new Uint32Array([ln])).buffer)
//	out.set([0xa3, 1, 0, 0, 0, a[3], a[2], a[1], a[0]], last);
//	last+=9;
//log(curtm);
	let b = new Uint8Array((new Uint16Array([curtm])).buffer);
	dat.set([b[1], b[0]], 1);
try {
	out.set(dat, last);
}
catch(e){
cerr("Out of bounds?", last);
return;
}

//	out.set(dat, last);

	last+=ln;
	curtm+=Math.round(tm/tmmult);
}
set_len();
return [out.slice(0, last), curtm];


};//»

const parse_section=(buf, par, iter, done)=>{//«
	if (!done) done = false;
	if (!iter) iter=0;
	if (done) return;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}
let c=0;
let flen = buf.length;
let rv;
let kids = [];
while(1){
	if (done) return kids;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}

	let s;
	try{
		s=buf[c].toString(16);
	}
	catch(e){
		werr(`Read error @${c} in ${par.id}`);
		done=true;
		return;
	}
	let ch = s[0];
	let n;

	if (ch=="1"){n=4;}
	else if (ch.match(/[23]/)){n=3;}
	else if (ch.match(/[4-7]/)){n=2;}
	else n=1;
	rv=gethex(buf, c, n);
	let kid = par.kids[rv];

	if (rv=="ec"){
//log("kid", kid);
	}
	else if (!kid){
		if (!no_error) cberr(`Invalid id (${rv}) in ${par.id} @${c}`);
		return;
	}
	c+=n;
	let id = rv;
	if (!(rv = ebml_sz(buf,c))) return;
if (!rv[0]){
//log(c, buf.slice(c-1, c+20));
if (!no_error) cberr(`Got 0 length payload for id=${id}`);
return;
}
	let bytes = buf.slice(rv[1],rv[0]+rv[1]);
	if (kid) {//If not "Void" (0xec)
		kids.push(`${kid.id}:${id}`);
		if (kid.kids) {
			let sect = parse_section(bytes, kid, iter, done);
			if (!sect) return;
if (debug_section) {
log(sect);
}
			kids.push(sect);
		}
		else {
			kids.push(bytes);
		}

	}
	c=rv[0]+rv[1];
	if (c==flen) break;
}	
return kids;
};//»

const parse_section_flat=(buf, par, iter, done)=>{//«
	if (!done) done = false;
	if (!iter) iter=0;
	if (done) return;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}
let c=0;
let flen = buf.length;
let rv;
let kids = [];
while(1){
	if (done) return kids;
	iter++;
	if (iter>10000) {
		cberr("Inifite loop?");
		return;
	}

	let s;
	try{
		s=buf[c].toString(16);
	}
	catch(e){
		werr(`Read error @${c} in ${par.id}`);
		done=true;
		return;
	}
	let ch = s[0];
	let n;

	if (ch=="1"){n=4;}
	else if (ch.match(/[23]/)){n=3;}
	else if (ch.match(/[4-7]/)){n=2;}
	else n=1;
	rv=gethex(buf, c, n);
	let kid = par.kids[rv];
	if (rv=="ec"){
	}
	else if (!kid){
		if (!no_error) cberr(`Invalid id (${rv}) in ${par.id} @${c}`);
		return;
	}
	c+=n;
	let id = rv;
	if (!(rv = ebml_sz(buf,c))) return;
	if (!rv[0]){
		if (!no_error) cberr(`Got 0 length payload for id=${id}`);
		return;
	}
	let bytes = buf.slice(rv[1],rv[0]+rv[1]);
	if (kid) {//If not "Void" (0xec)
		kids.push(`${kid.id}:${id}`);
		kids.push(bytes);
//		if (kid.kids) kids.push(bytes.length);
//		else kids.push(bytes);
	}
	c=rv[0]+rv[1];
	if (c==flen) break;
}	
return kids;
};//»

//const parse_webm=webm=>{//«

//let iter=0;
//let done = false;


//return parse_section(webm, WEBM, 0, false);

//};//»

const ebml_sz=(buf, pos)=>{//«
	let nb;
	let b = buf[pos];

//xxxxxxxx
	if (b&128) {nb = 1; b^=128;}
	else if (b&64) {nb = 2;b^=64;}
	else if (b&32) {nb = 3;b^=32;}
	else if (b&16) {nb = 4;b^=16;}
	else if (b&8) {nb = 5;b^=8;}
	else if (b&4) {nb = 6;b^=4;}
	else if (b&2) {nb = 7;b^=2;}
	else if (b&1) {nb = 8;b^=1;}
	let str = "0x"+(b.toString(16));
	let end = pos+nb;
//	if (end>=buf.length) {
//		cberr(`Invalid ebml size @${pos}`);
//		return false;
//	}
	let ch; 
	for (let i=pos+1; i < end; i++) {
		ch = buf[i].toString(16);
		if (ch.length==1) ch = "0"+ch;
		str = str + ch;
	}   
	return [parseInt(str), end]
}//»
const arr2text=(arr)=>{//«
	let ret="";
	for (let i=0; i < arr.length; i++) {
		let code = arr[i];
		if (code===0) ret+=" ";
		else ret+=String.fromCharCode(code);
	}
	return ret;
}//»
const hex2text=(val)=>{//«
	let ret="";
	for (let j=0; j < val.length; j+=2) ret+=String.fromCharCode(parseInt("0x"+val.slice(j,j+2)));
	return ret;
}//»
const hexeq=(bufarg, start, offset, strarg, if_nowarn)=>{//«
	var arr =Array.prototype.slice.call(bufarg.slice(start,start+offset));
	var ret = arr.map(x=>{
		let s = ""+x.toString(16);
		if (s.length == 1) return "0"+s;
		return s;
	});
	var str = ret.toString().replace(/,/g,"");
	return (strarg===str);
}//»
const gethex=(bufarg, start, offset, if_fmt)=>{//«
	var arr =Array.prototype.slice.call(bufarg.slice(start,start+offset));
	var ret = arr.map(x=>{
		let s = ""+x.toString(16);
		if (s.length == 1) return "0"+s;
		return s;
	});
	let raw = ret.toString().replace(/,/g,"");
	let ret_str="";
	if (!if_fmt) ret_str = raw;
	else {
		for (let i=0; i < raw.length; i+=2) ret_str += raw[i]+raw[i+1]+" ";
	}
	return ret_str;
}//»
const read_1byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 1));}
const read_2byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 2));}
const read_4byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 4));}
const read_8byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 8));}
const read_nbyte_int=(n, bufarg, offset)=>{
	if (n===1) return read_1byte_int(bufarg, offset);
	if (n===2) return read_2byte_int(bufarg, offset);
	if (n===4) return read_4byte_int(bufarg, offset);
	if (n===8) return read_8byte_int(bufarg, offset);
};
//function read_4byte_float(bufarg, offset){return parseFloat("0x"+gethex(bufarg, offset, 4));}
//»

//Webm IDs«

const EBML_ID = "1a45dfa3";
const SEGMENT_ID = "18538067";

const SEEKHEAD_ID = "114d9b74";
const INFO_ID = "1549a966";
const TRACKS_ID = "1654ae6b";
const CUES_ID = "1c53bb6b";
const CLUSTER_ID = "1f43b675";
const TAGS_ID = "1254c367";
const ATTACHMENTS_ID = "1941a469";
const CHAPTERS_ID = "1043a770";
const VOID_ID = "ec";

const TOPLEVEL_IDS=[
	SEEKHEAD_ID,
	INFO_ID,
	TRACKS_ID,
	CUES_ID,
	CLUSTER_ID,
	TAGS_ID,
	ATTACHMENTS_ID,
	CHAPTERS_ID,
	VOID_ID
];

const TOPLEVEL_ID_MAP={
	[SEEKHEAD_ID]: "SEEKHEAD",
	[INFO_ID]: "INFO",
	[TRACKS_ID]: "TRACKS",
	[CUES_ID]: "CUES",
	[CLUSTER_ID]: "CLUSTER",
	[TAGS_ID]: "TAGS",
	[ATTACHMENTS_ID]: "ATTACHMENTS",
	[CHAPTERS_ID]: "CHAPTERS"
};


//»
const WEBM = {//«
"id":"WEBM",
"kids": {
	"1a45dfa3": {//HEADER«
		"id": "HEADER",
		"kids": {
			"4286": {"id": "EBMLVERSION"},
			"42f7": {"id": "EBMLREADVERSION"},
			"42f2": {"id": "EBMLMAXIDLENGTH"},
			"42f3": {"id": "EBMLMAXSIZELENGTH"},
			"4282": {"id": "DOCTYPE"},
			"4287": {"id": "DOCTYPEVERSION"},
			"4285": {"id": "DOCTYPEREADVERSION"}
		}
	},//»
	"18538067": {
		"id": "SEGMENT",
		"kids": {

			"114d9b74": {//SEEKHEAD«
				"id": "SEEKHEAD",
				"kids": {
					"4dbb": {
						"id": "SEEKENTRY", 		//MULT
						"out":[],
						"mult":true,
						"kids": {
							"53ab": {"id": "SEEKID"},
							"53ac": {"id": "SEEKPOSITION"}
						}
					}
				}
			},//»

			"1549a966": {//INFO 21«
				"id": "INFO",
				"kids": {
					"2ad7b1": {"id": "TIMECODESCALE"},
					"4489": {"id": "DURATION"},
					"7ba9": {"id": "TITLE"},
					"5741": {"id": "WRITINGAPP"},
					"4d80": {"id": "MUXINGAPP"},
					"4461": {"id": "DATEUTC"},
					"73a4": {"id": "SEGMENTUID"}
				}
			},//»
			"1654ae6b": {//TRACKS 22«
				"id": "TRACKS",
				"kids": {
					"ae": {
						"id": "TRACKENTRY",    //MULT
						"out":[],
						"mult": true,
						"kids": {
							"d7": {"id": "TRACKNUMBER"},
							"73c5": {"id": "TRACKUID"},
							"83": {"id": "TRACKTYPE"},
							"e0": {//Video«
								"id": "TRACKVIDEO",
								"kids": {
									"2383e3": {"id": "VIDEOFRAMERATE"},
									"54b0": {"id": "VIDEODISPLAYWIDTH"},
									"54ba": {"id": "VIDEODISPLAYHEIGHT"},
									"b0": {"id": "VIDEOPIXELWIDTH"},
									"ba": {"id": "VIDEOPIXELHEIGHT"},
									"54aa": {"id": "VIDEOPIXELCROPB"},
									"54bb": {"id": "VIDEOPIXELCROPT"},
									"54cc": {"id": "VIDEOPIXELCROPL"},
									"54dd": {"id": "VIDEOPIXELCROPR"},
									"54b2": {"id": "VIDEODISPLAYUNIT"},
									"9a": {"id": "VIDEOFLAGINTERLACED"},
									"9d": {"id": "VIDEOFIELDORDER"},
									"53b8": {"id": "VIDEOSTEREOMODE"},
									"53c0": {"id": "VIDEOALPHAMODE"},
									"54b3": {"id": "VIDEOASPECTRATIO"},
									"2eb524": {"id": "VIDEOCOLORSPACE"},
									"55b0": {"id": "VIDEOCOLOR"},
									"55b1": {"id": "VIDEOCOLORMATRIXCOEFF"},
									"55b2": {"id": "VIDEOCOLORBITSPERCHANNEL"},
									"55b3": {"id": "VIDEOCOLORCHROMASUBHORZ"},
									"55b4": {"id": "VIDEOCOLORCHROMASUBVERT"},
									"55b5": {"id": "VIDEOCOLORCBSUBHORZ"},
									"55b6": {"id": "VIDEOCOLORCBSUBVERT"},
									"55b7": {"id": "VIDEOCOLORCHROMASITINGHORZ"},
									"55b8": {"id": "VIDEOCOLORCHROMASITINGVERT"},
									"55b9": {"id": "VIDEOCOLORRANGE"},
									"55ba": {"id": "VIDEOCOLORTRANSFERCHARACTERISTICS"},
									"55bb": {"id": "VIDEOCOLORPRIMARIES"},
									"55bc": {"id": "VIDEOCOLORMAXCLL"},
									"55bd": {"id": "VIDEOCOLORMAXFALL"},
									"55d0": {"id": "VIDEOCOLORMASTERINGMETA"},
									"55d1": {"id": "VIDEOCOLORRX"},
									"55d2": {"id": "VIDEOCOLORRY"},
									"55d3": {"id": "VIDEOCOLORGX"},
									"55d4": {"id": "VIDEOCOLORGY"},
									"55d5": {"id": "VIDEOCOLORBX"},
									"55d6": {"id": "VIDEOCOLORBY"},
									"55d7": {"id": "VIDEOCOLORWHITEX"},
									"55d8": {"id": "VIDEOCOLORWHITEY"},
									"55d9": {"id": "VIDEOCOLORLUMINANCEMAX"},
									"55da": {"id": "VIDEOCOLORLUMINANCEMIN"},
									"7670": {"id": "VIDEOPROJECTION"},
									"7671": {"id": "VIDEOPROJECTIONTYPE"},
									"7672": {"id": "VIDEOPROJECTIONPRIVATE"},
									"7673": {"id": "VIDEOPROJECTIONPOSEYAW"},
									"7674": {"id": "VIDEOPROJECTIONPOSEPITCH"},
									"7675": {"id": "VIDEOPROJECTIONPOSEROLL"}
								}
							},//»
							"e1": {
								"id": "TRACKAUDIO",
								"kids": {
									"b5": {"id": "AUDIOSAMPLINGFREQ"},
									"78b5": {"id": "AUDIOOUTSAMPLINGFREQ"},
									"6264": {"id": "AUDIOBITDEPTH"},
									"9f": {"id": "AUDIOCHANNELS"}
								}
							},
							"e2": {"id": "TRACKOPERATION"},
							"e3": {"id": "TRACKCOMBINEPLANES"},
							"e4": {"id": "TRACKPLANE"},
							"e5": {"id": "TRACKPLANEUID"},
							"e6": {"id": "TRACKPLANETYPE"},
							"86": {"id": "CODECID"},
							"63a2": {"id": "CODECPRIVATE"},
							"258688": {"id": "CODECNAME"},
							"3b4040": {"id": "CODECINFOURL"},
							"26b240": {"id": "CODECDOWNLOADURL"},
							"aa": {"id": "CODECDECODEALL"},
							"56aa": {"id": "CODECDELAY"},
							"56bb": {"id": "SEEKPREROLL"},
							"536e": {"id": "TRACKNAME"},
							"22b59c": {"id": "TRACKLANGUAGE"},
							"b9": {"id": "TRACKFLAGENABLED"},
							"88": {"id": "TRACKFLAGDEFAULT"},
							"55aa": {"id": "TRACKFLAGFORCED"},
							"55ab": {"id": "TRACKFLAGHEARINGIMPAIRED"},
							"55ac": {"id": "TRACKFLAGVISUALIMPAIRED"},
							"55ad": {"id": "TRACKFLAGTEXTDESCRIPTIONS"},
							"55ae": {"id": "TRACKFLAGORIGINAL"},
							"55af": {"id": "TRACKFLAGCOMMENTARY"},
							"9c": {"id": "TRACKFLAGLACING"},
							"6de7": {"id": "TRACKMINCACHE"},
							"6df8": {"id": "TRACKMAXCACHE"},
							"23e383": {"id": "TRACKDEFAULTDURATION"},
							"6d80": {"id": "TRACKCONTENTENCODINGS"},
							"6240": {
								"id": "TRACKCONTENTENCODING",
								"kids": {
									"5031": {"id": "ENCODINGORDER"},
									"5032": {"id": "ENCODINGSCOPE"},
									"5033": {"id": "ENCODINGTYPE"},
									"5034": {"id": "ENCODINGCOMPRESSION"},
									"4254": {"id": "ENCODINGCOMPALGO"},
									"4255": {"id": "ENCODINGCOMPSETTINGS"},
									"5035": {"id": "ENCODINGENCRYPTION"},
									"47e7": {"id": "ENCODINGENCAESSETTINGS"},
									"47e1": {"id": "ENCODINGENCALGO"},
									"47e2": {"id": "ENCODINGENCKEYID"},
									"47e5": {"id": "ENCODINGSIGALGO"},
									"47e6": {"id": "ENCODINGSIGHASHALGO"},
									"47e4": {"id": "ENCODINGSIGKEYID"},
									"47e3": {"id": "ENCODINGSIGNATURE"}
								}
							},
							"23314f": {"id": "TRACKTIMECODESCALE"},
							"55ee": {"id": "TRACKMAXBLKADDID"}
						}
					}
				}
			},//»
			"1c53bb6b": {//CUES 28«
				"id": "CUES",
				"kids": {
					"bb": {
						"id": "POINTENTRY",		//MULT
						"out":[],
						"mult":true,
						"kids": {
							"b3": {"id": "CUETIME"},
							"b7": {
								"id": "CUETRACKPOSITION",
								"kids": {
									"f7": {"id": "CUETRACK"},
									"f1": {"id": "CUECLUSTERPOSITION"},
									"f0": {"id": "CUERELATIVEPOSITION"},
									"b2": {"id": "CUEDURATION"},
									"5378": {"id": "CUEBLOCKNUMBER"}
								}
							}	
						}
					}				
				}
			},//»
			"1f43b675": {//CLUSTER 31«
				"id": "CLUSTER",		// MULT
				"out":[],
				"mult":true,
				"kids": {
					"e7": {"id": "CLUSTERTIMECODE"},
					"a7": {"id": "CLUSTERPOSITION"},
					"ab": {"id": "CLUSTERPREVSIZE"},
					"a3": {"id": "SIMPLEBLOCK"},
					"a0": {
						"id": "BLOCKGROUP",
						"out":[],
						"mult":true,
					"kids": {
							"a1": {"id": "BLOCK"},
							"9b": {"id": "BLOCKDURATION"},
							"fb": {"id": "BLOCKREFERENCE"},
							"a4": {"id": "CODECSTATE"},
							"75a2": {"id": "DISCARDPADDING"},
							"75a1": {
								"id": "BLOCKADDITIONS",
								"kids": {
									"a6": {
										"id": "BLOCKMORE",
										"kids": {
											"ee": {"id": "BLOCKADDID"},
											"a5": {"id": "BLOCKADDITIONAL"}
										}
									}
								}
							}
						}
					}
				}
			},//»

			"1254c367": {//TAGS«
				"id": "TAGS",
				"kids": {
					"7373": {"id": "TAG"},
					"67c8": {"id": "SIMPLETAG"},
					"45a3": {"id": "TAGNAME"},
					"4487": {"id": "TAGSTRING"},
					"447a": {"id": "TAGLANG"},
					"4484": {"id": "TAGDEFAULT"},
					"44b4": {"id": "BUG"},
					"63c0": {"id": "TAGTARGETS"},
					"63ca": {"id": "TYPE"},
					"68ca": {"id": "TYPEVALUE"},
					"63c5": {"id": "TRACKUID"},
					"63c4": {"id": "CHAPTERUID"},
					"63c6": {"id": "ATTACHUID"}
				}
			},//»
			"1941a469": {//ATTACHMENTS«
				"id": "ATTACHMENTS",
				"kids": {
					"61a7": {"id": "ATTACHEDFILE"},
					"467e": {"id": "FILEDESC"},
					"466e": {"id": "FILENAME"},
					"4660": {"id": "FILEMIMETYPE"},
					"465c": {"id": "FILEDATA"},
					"46ae": {"id": "FILEUID"}
				}
			},//»
			"1043a770": {//CHAPTERS«
				"id": "CHAPTERS",
				"kids": {
					"45b9": {"id": "EDITIONENTRY"},
					"b6": {"id": "CHAPTERATOM"},
					"91": {"id": "CHAPTERTIMESTART"},
					"92": {"id": "CHAPTERTIMEEND"},
					"80": {"id": "CHAPTERDISPLAY"},
					"85": {"id": "CHAPSTRING"},
					"437c": {"id": "CHAPLANG"},
					"437e": {"id": "CHAPCOUNTRY"},
					"45bc": {"id": "EDITIONUID"},
					"45bd": {"id": "EDITIONFLAGHIDDEN"},
					"45db": {"id": "EDITIONFLAGDEFAULT"},
					"45dd": {"id": "EDITIONFLAGORDERED"},
					"73c4": {"id": "CHAPTERUID"},
					"98": {"id": "CHAPTERFLAGHIDDEN"},
					"4598": {"id": "CHAPTERFLAGENABLED"},
					"63c3": {"id": "CHAPTERPHYSEQUIV"}
				}
			}//»

		}
	}
}

};

const SEGMENT = WEBM.kids[SEGMENT_ID];
const SEGMENTKIDS = SEGMENT.kids;
const SEEKHEAD = SEGMENTKIDS[SEEKHEAD_ID];
const INFO = SEGMENTKIDS[INFO_ID];
const CUES = SEGMENTKIDS[CUES_ID];

//»


COMS[comarg](args);

}//»


























/*OLD«

WEBM:async ()=>{//«

let killed = false;
Shell.kill_register(cb=>{
	killed = true;
	cb&&cb();
});
let opts = failopts(args,{s:{s:3,e:3},l:{start:3,end:3}});
if (!opts) return;

let startpos = opts.start||opts.s;
let endpos = opts.end||opts.e;
if (!(startpos && endpos)) return cberr("Expected start and end args!");
if (startpos==="-") startpos=0;
else{
	startpos=parseFloat(startpos);
	if (!Number.isFinite(startpos) && startpos>=0) return cberr("Invalid start");
}

//log(startpos, endpos);
//cberr();
//return;

//NOTE1


//General types anywhere:
//ec void
//bf crc32
const arr_to_num = (arr)=>{let n = 0;for (let i=0; i<arr.length;i++)n|=(arr[i]<<(i*8)); return n;}
const NF=(s)=>{
cberr(`${s}: not found`);
};
let path = args.shift();
if (!path) return cberr('No path given!');


//log(parse_section(await fsapi.readFile(normpath(path),{binary:true}), WEBM, 0, false));
let init_bytes = 20000;

let a = await fsapi.readFile(normpath(path),{binary:true, start: 0, end: init_bytes});
if (!a) return cberr(`${path}: not found`);
if (!(a[0]==0x1A&&a[1]==0x45&&a[2]==0xDF&&a[3]==0xA3)){
return NF("EBML ID");
}
let c;
let r = ebml_sz(a, 4);
c = r[0]+r[1];
if (!(a[c]==0x18&&a[c+1]==0x53&&a[c+2]==0x80&&a[c+3]==0x67)){
	return NF("Segment ID");
}
r = ebml_sz(a, c+4);
let seg_start = r[1]
c=seg_start;
if (!(a[c]==0x11&&a[c+1]==0x4D&&a[c+2]==0x9B&&a[c+3]==0x74)) return NF("SeekHead ID");

r = ebml_sz(a, c+4);

//const SEGMENT = WEBM.kids[SEGMENT_ID].kids;
const SEGMENT = WEBM.kids[SEGMENT_ID];
const SEGMENTKIDS = SEGMENT.kids;
const SEEKHEAD = SEGMENTKIDS[SEEKHEAD_ID];
const INFO = SEGMENTKIDS[INFO_ID];
const CUES = SEGMENTKIDS[CUES_ID];

let skhd = parse_section(a.slice(r[1], r[1]+r[0]), SEEKHEAD, 0, false);
let cues_off;
let info_off;
let cluster_off;
let tracks_off;
for (let i=0; i < skhd.length; i+=2){//«
	if (skhd[i]!=="SEEKENTRY:4dbb") return NF("SeekEntry Id");
	let ent = skhd[i+1];
	if (ent.length!==4) return cberr(`Bad SeekEntry length: ${ent.length}`);
	if (ent[0]!=="SEEKID:53ab") return NF("SeekID Id");
	if (ent[2]!=="SEEKPOSITION:53ac") return NF("SeekPosition Id");
	let id = ent[1];
	if (id.length!==4) return cberr(`Bad SeekId array length: ${idarr.length}`);
	if (id[0]==0x1c&&id[1]==0x53&&id[2]==0xbb&&id[3]==0x6b){
		cues_off = arr_to_num(ent[3].reverse())+seg_start;
	}
	else if (id[0]==0x15&&id[1]==0x49&&id[2]==0xa9&&id[3]==0x66){
		info_off = arr_to_num(ent[3].reverse())+seg_start;
	}
//"1f43b675"
	else if (id[0]==0x1f&&id[1]==0x43&&id[2]==0xb6&&id[3]==0x75){
		cluster_off = arr_to_num(ent[3].reverse())+seg_start;
	}
	else if (id[0]==0x16&&id[1]==0x54&&id[2]==0xae&&id[3]==0x6b){
		tracks_off = arr_to_num(ent[3].reverse())+seg_start;
	}
//1654ae6b
}//»

//log(seg_start, info_off, cues_off, cluster_off, tracks_off);

if (!(info_off&&cues_off&&tracks_off)) return cberr("Did not get info_off, cues_off and tracks_off!");

if (!cluster_off){

{
let from = cues_off;

let sz = ebml_sz(a, cues_off+4);

//Hardcoded the location/size of the first POINTENTRY in the CUES
let arr = a.slice(from+6, from+20);

let rv = parse_section(arr, WEBM.kids["18538067"].kids["1c53bb6b"]);
let first_cluster = toint(rv[1][3][3])+seg_start;

//vvvvvvv  THERE IS A CLUSTER ID HERE   xxxxxxxxxx
log(tohex(a.slice(first_cluster, first_cluster+4)));

}

cberr("Find cluster off...");
return;
}


if (cluster_off > init_bytes){
	let rv = await fsapi.readFile(normpath(path),{binary:true, start: init_bytes, end: cluster_off});
	let b = new Uint8Array(init_bytes+rv.length);
	b.set(a, 0);
	b.set(rv, init_bytes);
	a=b;
}

r = ebml_sz(a, info_off+4);
let info = parse_section(a.slice(r[1], r[1]+r[0]), INFO, 0, false);
let duration;
let tcs;
for (let i=0; i < info.length; i+=2){//«
	if (info[i]=="DURATION:4489"){
		if (info[i+1].length !== 4) return cberr("Expected 4 bytes for Duration, got: "+info[i+1].length);
		duration = (new DataView(info[i+1].buffer)).getFloat32();
//		d+1].buration = (new DataView(info[i+1].buffer)).getFloat32();
	}
	else if (info[i]=="TIMECODESCALE:2ad7b1"){
		tcs = arr_to_num(info[i+1].reverse());
//log("TCS",tcs);
	}
}//»
if (!(duration&&tcs)) return cberr("Did not get duration and tcs!");
let tmmult = tcs/10**9;
//log("TMMULT",tmmult);
duration*=tmmult;
if (startpos >= duration) return cberr(`Invalid startpos duration=${duration}`);

if (endpos==="-") endpos=duration;
else{
	endpos=parseFloat(endpos);
	if (!(Number.isFinite(endpos) && endpos>startpos && endpos <= duration)) return cberr("Invalid endpos");
}
if (startpos == 0 && endpos == duration) return cbok("Nothing to do!");

r = ebml_sz(a, cues_off+4);

let cues = parse_section(a.slice(r[1], r[1]+r[0]), CUES, 0, false);

let ALLCUES=[];
let prev_tm=null, prev_off;
for (let i=0; i < cues.length; i+=2){//«
	if (cues[i]!=="POINTENTRY:bb") return NF("PointEntry Id");
	let cue = cues[i+1]
	if (cue.length!==4) return cberr(`Bad Cue array length: ${cue.length}`);
	if (cue[0]!=="CUETIME:b3") return NF("CueTime Id");
	if (cue[2]!=="CUETRACKPOSITION:b7") return NF("CueTrackPosition Id");
	let tm = arr_to_num(cue[1].reverse())*tmmult;
	let pos = cue[3];
	if (pos.length!==4) return cberr(`Bad Cue position array length: ${pos.length}`);
	if (pos[0]!=="CUETRACK:f7") return NF("CueTrack Id");
	if (pos[2]!=="CUECLUSTERPOSITION:f1") return NF("CueClusterPosition Id");
	if (pos[1].length!==1 && pos[1][0]!==1) return cberr("Expected CueTrack==1 (for audio track)");
	let off = arr_to_num(pos[3].reverse())+seg_start;
	if (tm < startpos) {
		prev_tm = tm;
		prev_off = off;
		continue;
	}
	if (prev_tm!==null){
		ALLCUES.push(prev_tm, prev_off);
		prev_tm = null;
	}
	ALLCUES.push(tm, off);
	if (tm > endpos) break;
}//»
if (prev_tm!==null){
	ALLCUES.push(prev_tm, prev_off);
	prev_tm = null;
}

{
let tm1 = ALLCUES[0];
let pos1 = ALLCUES[1];
let tm2 = ALLCUES[ALLCUES.length-2];
let pos2 = ALLCUES[ALLCUES.length-1];
//log(ALLCUES.length/2);
//log(ALLCUES);
let rv = await fsapi.readFile(normpath(path),{binary:true, start: pos1, end: pos2});
{


//NOTE2


}
//log(rv.slice(5,12));

//NOTE3


//log(rv);
//rv = parse_section(rv, SEGMENT, 0, false);
//log(rv);
//log(rv.length/2);
//log(pos2-pos1);
//log(rv);

}

//cbok();

//return;

//log(ALLCUES);

let ALLBLOCKS = [];

//prev_tm=null;
let prev_dur;
let prev_block;
let tot_dur=0;
let ALLCUESLEN = ALLCUES.length;
let num_clusters = Math.floor(ALLCUESLEN/2);
werr(`Reading ${num_clusters} clusters from disk...`);
wclerr("0%");

for (let i=0; i < ALLCUESLEN - 2; i+=2){//«

wclerr(`${Math.floor(100*i/ALLCUESLEN)}%`);
let tm1 = ALLCUES[i];
let b1 = ALLCUES[i+1];
let tm2 = ALLCUES[i+2];
let b2 = ALLCUES[i+3];
//cwarn(`Getting: ${b1}->${b2}`);
let a = await fsapi.readFile(normpath(path),{binary:true, start: b1, end: b2});
if (killed) return;
if (!(a[0]==0x1f&&a[1]==0x43&&a[2]==0xb6&&a[3]==0x75)) return cberr("Cluster ID not found");

let cluster = parse_section(a, SEGMENT, 0, false);
if (cluster[0]!=="CLUSTER:1f43b675") return cberr("Cluster ID not found");
let blocks = cluster[1];
if (!blocks.shift()[0]==="CLUSTERTIMECODE:e7") return cberr("ClusterTimeCode ID not found");
let gottm = arr_to_num(blocks.shift().reverse())
if (tm1 !== gottm*tmmult) return cberr(`tm1 (${tm1}) !== gottm*tmmult (${gottm*tmmult})`);

for (let j=0; j < blocks.length; j+=2){//«

if (blocks[j]!=="SIMPLEBLOCK:a3") {//«

//NOTE4

	if (i+2==ALLCUES.length && j+2==blocks.length){
cwarn(`Ignoring final block '${blocks[j]}'`);
		break;
	}

	return cberr("SimpleBlock ID not found");
}//»

let blk1 = blocks[j+1];
let blk2 = blocks[j+3];
let blk1tm = (tm1+arr_to_num([blk1[2], blk1[1]])*tmmult);
let blk2tm;
let blkdur;
if (blk2) blk2tm = (tm1+arr_to_num([blk2[2], blk2[1]])*tmmult);
else blk2tm = tm2;
blkdur = blk2tm - blk1tm;

if (blk1tm < startpos) {
	prev_dur = blkdur;
	prev_block = blk1;
	continue;
}
if (Number.isFinite(prev_dur)){
//log(tot_dur, prev_dur);
	tot_dur+=prev_dur;
//log(tot_dur);
	ALLBLOCKS.push(prev_dur, prev_block);
	prev_dur = null;
}

if (blkdur > 0) {
//log(tot_dur, blkdur);
	tot_dur+=blkdur;
}
else {
	blkdur = 0;
	cwarn(`blk1tm(${blk1tm})  >  blk2tm(${blk2tm})`);
}
ALLBLOCKS.push(blkdur, blk1);
if (blk1tm > endpos) break;

}//»

}//»

//log(tot_dur);

//log(ALLBLOCKS);
//cberr("Have we renumbered all the blocks???");
//return;

if (killed) return;
//log("???");

wclerr(`100%`);
werr("Reclustering...");
werr("0%");

//let new_duration_bytes = (new Uint8Array(new Float32Array([tot_dur]).buffer)).reverse();

let head = a;

const process=async()=>{//«

const _get_chunk=()=>{
	return new Promise((Y,N)=>{
		setTimeout(()=>{
			Y(get_chunk(ALLBLOCKS, tmmult, curtm));
		}, 0);
	});
};

let cluster;
let curtm=0;
let clusters=[];
let tot_bytes=0;
let chunk_iter=0;
while (cluster = await _get_chunk()){//«
	if (killed) return;
//log(cluster);
	let cl = cluster[0];
	clusters.push([curtm, cl]);
	tot_bytes+=cl.length;
	curtm+=cluster[1];
	chunk_iter++;
//	wclerr(`${Math.floor(100*chunk_iter)}`);
	wclerr(`${Math.floor(100*chunk_iter/num_clusters)}%`);
}//»
wclerr("100%");
let body;
let a = new Uint8Array(tot_bytes);
body = a;
let curoff = 0;
let posns=[];
//let times = [];
//log(clusters);
for (let arr of clusters){
	let cl = arr[1];
//	posns.push(int_to_ebml(arr[0]), int_to_ebml(curoff+seg_start));
	posns.push(arr[0], curoff+seg_start);
	a.set(cl, curoff);
	curoff+=cl.length;
}


//NOTE5

//cwarn("Cues");
//log("TIMES",times);

let cue_len = 0;
let cues_arr=[];
for (let i=0; i < posns.length; i+=2){//«

let tm = num_to_arr(posns[i]);
if (!tm.length) tm=[0];
let tmlen = tm.length;

let pos = num_to_arr(posns[i+1]);
if (!pos.length) pos=[0];
let poslen = pos.length;

let entlen = 11+tmlen+poslen;

let a = new Uint8Array(entlen);

a[0]=0xbb;//POINTENTRY == 187
a[1]=128|(entlen-2);

a[2]=0xb3;//CUETIME == 179
a[3] = 128|(tmlen);
a.set(tm, 4);
let cur = 4+tmlen;

a[cur++]=0xb7;//CUETRACKPOSITION == 183
a[cur++]=128|(5+poslen);

a[cur++]=0xf7;//CUETRACK == 247 
a[cur++]=129;// 1 ==  (audio)
a[cur++]=1;

a[cur++]=0xf1;//CUECLUSTERPOSITION == 241
a[cur++]=128|(poslen);
a.set(pos, cur);

cue_len+=a.length;
cues_arr.push(a);

}//»
let cues_len_arr = int_to_ebml(cue_len);
let cues = new Uint8Array(cue_len+4+cues_len_arr.length);
cues[0]=0x1c;
cues[1]=0x53;
cues[2]=0xbb;
cues[3]=0x6b;
cues.set(cues_len_arr, 4);
curoff=4+cues_len_arr.length;
for (let cue of cues_arr){
	cues.set(cue, curoff);
	curoff+=cue.length;
}

head.set(cues, cues_off);

let cues_end = cues_off+cues.length;
let diff = head.length - cues_end;
if (diff) {

	let new_head = head;
	new_head.set(new Uint8Array(diff), cues_end);

	if (diff > 9) {
		let diff_arr = num_to_arr(diff-9);
		let len = diff_arr.length;
		new_head[cues_end++] = 0xec;
		new_head[cues_end++] = 1;
		while (diff_arr.length<7) diff_arr.unshift(0);
		new_head.set(diff_arr, cues_end);
	}
	else {
console.warn(`Got (strangely small) diff==${diff}!!!`);
	}

	head = new_head;

}


{//«



let a = head;

//	"18538067":
for (let i=0; i < a.length-4; i++){

if (a[i+0]==0x18&&a[i+1]==0x53&&a[i+2]==0x80&&a[i+3]==0x67) {
if (a[i+4]!==1){
return cberr("Barfing on some weird a[i+4]!==1 ");

}
let rv = ebml_sz(a, i+4);
let cur_sz = rv[0];
//log("CURSEGSZ",cur_sz);
//log("NEWSEGSZ",head.length-seg_start+body.length);
let szarr = num_to_arr(head.length-seg_start+body.length);
while (szarr.length<7) szarr.unshift(0);
a.set(szarr, i+5);


//log(szarr);
//dump_hex_lines(a.slice(i, i+60));

break;
}

}


let gothead;
let arr;
for (let i=0; i < a.length-4; i++){
	if (gothead) break;
	if (a[i+0]==0x15&&a[i+1]==0x49&&a[i+2]==0xa9&&a[i+3]==0x66) {
		let ar = a.slice(i);
no_error = true;
		let rv = parse_section(ar, SEGMENT, false, 0);
no_error = false;
		if (rv) {
//log(rv);
			gothead = i;
			arr = ar;
		}
	}
}
if (!arr) return cberr("Could not find Info!?!?!");

let gotdur;
let dur_pos;
for (let i=0; i < arr.length-2; i++){
	if (gotdur) break;
	if (arr[i]==0x44&&arr[i+1]==0x89) {
		let sz = ebml_sz(arr, i+2);
		if (sz[0]==4){
			dur_pos = sz[1]+gothead;
			break;
		}
		else{
cwarn("Skipping sz returned", sz);
		}
	}
}
if (!dur_pos) return cberr("Could not find duration position!?!?!");

let dur = (new DataView(head.slice(dur_pos, dur_pos+4).buffer)).getFloat32();
if (dur*tmmult!==duration) return cberr("Got a different duration this time?!?!?!?");
//log(tot_dur/tmmult);
//log(new Uint8Array(new Float32Array([tot_dur/tmmult]).buffer));
{
//log("New duration", tot_dur);
let arr = new Uint8Array((new Float32Array([tot_dur/tmmult])).buffer);
//log(arr);
//arr = arr.reverse();
head.set(arr.reverse(), dur_pos);
}
dump_hex_lines(head.slice(dur_pos-3, dur_pos+17));

}//»

//log(head);

let file = new Uint8Array(head.length+body.length);
file.set(head, 0);
file.set(body, cluster_off);
//log("FILESZ",file.length);
//debug_section = true;
let rv = parse_section(file, WEBM, 0, false);
log(rv);
//debug_section = false;
woutobj(new Blob([file.buffer],{type:"audio/webm"}));

cbok();

}//»

setTimeout(process, 10);

return;


},//»

GETCLUSTERS:async()=>{//«

let path = args.shift();
if (!path) return cberr('No file path given!');
let a = await fsapi.readFile(normpath(path),{binary:true});
if (!a) return cberr(`${path}: not found`);

//let rv = path_to_val(a, "seg/clus[]");
//rv = rv.slice(0,2);
//let sz=0;
//rv.forEach(arr=>{sz+=arr.length});

cbok();

},//»
WEBZLERM:async()=>{//«

//81 00 00 80 fc ff fe
//81 00 15 80 bc ff fe
//...
//10 minutes starts with >150 of these with "bc"



//let head = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81, 0x04, 0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x04, 0x42, 0x85, 0x81, 0x02]);

//log(tohex(head));




cbok();

},//»
WEBOIMST:async()=>{//«

//Given some path of (possibly partial) IDS, and array positions, return the given data

//1: head/maxid

//2 seg/clust[0]/timecode


//let opts = failopts(args,{s:{s:3,e:3},l:{start:3,end:3}});
//if (!opts) return;

let path = args.shift();
if (!path) return cberr('No file path given!');

let qstr = args.shift();
if (!qstr) return cberr("No query string given!");

const OK_FMTS=["float","int", "hex", "str", "none"];

let fmt = args.shift();
if (fmt && !OK_FMTS.includes(fmt)) return cberr(`Invalid 'fmt' arg: ${fmt}`);
else if (!fmt) fmt="none";

let a = await fsapi.readFile(normpath(path),{binary:true});
if (!a) return cberr(`${path}: not found`);

let rv = path_to_val(a, qstr, fmt);

if (typeof rv === "string" && rv.length) return cberr(rv);
if (!rv && !Number.isFinite(rv)) return cberr("Nothing returned");

if (Number.isFinite(rv)) wout(`${rv}`);
else if (rv instanceof Uint8Array) log(rv);
else if (rv.length===1 && typeof rv[0]==='string') {
	let lns = rv[0].split("\n");
//if (termobj.h <= 4){
//	wout(rv[0]);
//	if (lns.length >= termobj.h) wout(`${lns.length-termobj.h+2} more lines (see console)`);
//}
//else {
if (termobj.h>1) {
	for (let i=0; i < termobj.h-2; i++){
		let ln = lns.shift();
		if (ln) wout(ln);
		else break;
	}
}
	if (lns.length) wout(`${lns.length} more lines (see console)`);
//}
log(rv[0]);
}
else {
cwarn("Unknown returned value");
	log(rv);
}

cbok();

},//»
INTTOEBML:()=>{//«
let s = args.shift();
let MAX = 2**32-1;

if (!s) return cberr('Nothing!');

let n = s.pnni({MAX:MAX});
if (!Number.isFinite(n)) return cberr("Invalid number");
if (n > MAX) return cberr("Too big");
log(int_to_ebml(n));

//log("GOT", n);

cbok();

},//»
OLDWEBM:async ()=>{//«

let killed = false;
Shell.kill_register(cb=>{
	killed = true;
	cb&&cb();
});
let opts = failopts(args,{s:{s:3,e:3},l:{start:3,end:3}});
if (!opts) return;

let startpos = opts.start||opts.s;
let endpos = opts.end||opts.e;
if (!(startpos && endpos)) return cberr("Expected start and end args!");
if (startpos==="-") startpos=0;
else{
	startpos=parseFloat(startpos);
	if (!Number.isFinite(startpos) && startpos>=0) return cberr("Invalid start");
}

//log(startpos, endpos);
//cberr();
//return;


const EBML_ID = "1a45dfa3";
const SEGMENT_ID = "18538067";
const SEEKHEAD_ID = "114d9b74";
const INFO_ID = "1549a966";
const TRACKS_ID = "1654ae6b";
const CUES_ID = "1c53bb6b";
const CLUSTER_ID = "1f43b675";

//NOTE6


//General types anywhere:
//ec void
//bf crc32
const arr_to_num = (arr)=>{let n = 0;for (let i=0; i<arr.length;i++)n|=(arr[i]<<(i*8)); return n;}
const NF=(s)=>{
cberr(`${s}: not found`);
};
let path = args.shift();
if (!path) return cberr('No path given!');


//log(parse_section(await fsapi.readFile(normpath(path),{binary:true}), WEBM, 0, false));
let init_bytes = 1000;

let a = await fsapi.readFile(normpath(path),{binary:true, start: 0, end: init_bytes});
if (!a) return cberr(`${path}: not found`);
if (!(a[0]==0x1A&&a[1]==0x45&&a[2]==0xDF&&a[3]==0xA3)){
return NF("EBML ID");
}
let c;
let r = ebml_sz(a, 4);
c = r[0]+r[1];
if (!(a[c]==0x18&&a[c+1]==0x53&&a[c+2]==0x80&&a[c+3]==0x67)){
	return NF("Segment ID");
}
r = ebml_sz(a, c+4);
let seg_start = r[1]
c=seg_start;
if (!(a[c]==0x11&&a[c+1]==0x4D&&a[c+2]==0x9B&&a[c+3]==0x74)) return NF("SeekHead ID");

r = ebml_sz(a, c+4);

//const SEGMENT = WEBM.kids[SEGMENT_ID].kids;
const SEGMENT = WEBM.kids[SEGMENT_ID];
const SEGMENTKIDS = SEGMENT.kids;
const SEEKHEAD = SEGMENTKIDS[SEEKHEAD_ID];
const INFO = SEGMENTKIDS[INFO_ID];
const CUES = SEGMENTKIDS[CUES_ID];

let skhd = parse_section(a.slice(r[1], r[1]+r[0]), SEEKHEAD, 0, false);
let cues_off;
let info_off;
let cluster_off;
let tracks_off;
for (let i=0; i < skhd.length; i+=2){//«
	if (skhd[i]!=="SEEKENTRY:4dbb") return NF("SeekEntry Id");
	let ent = skhd[i+1];
	if (ent.length!==4) return cberr(`Bad SeekEntry length: ${ent.length}`);
	if (ent[0]!=="SEEKID:53ab") return NF("SeekID Id");
	if (ent[2]!=="SEEKPOSITION:53ac") return NF("SeekPosition Id");
	let id = ent[1];
	if (id.length!==4) return cberr(`Bad SeekId array length: ${idarr.length}`);
	if (id[0]==0x1c&&id[1]==0x53&&id[2]==0xbb&&id[3]==0x6b){
		cues_off = arr_to_num(ent[3].reverse())+seg_start;
	}
	else if (id[0]==0x15&&id[1]==0x49&&id[2]==0xa9&&id[3]==0x66){
		info_off = arr_to_num(ent[3].reverse())+seg_start;
	}
//"1f43b675"
	else if (id[0]==0x1f&&id[1]==0x43&&id[2]==0xb6&&id[3]==0x75){
		cluster_off = arr_to_num(ent[3].reverse())+seg_start;
	}
	else if (id[0]==0x16&&id[1]==0x54&&id[2]==0xae&&id[3]==0x6b){
		tracks_off = arr_to_num(ent[3].reverse())+seg_start;
	}
//1654ae6b
}//»
if (!(info_off&&cues_off&&cluster_off&&tracks_off)) return cberr("Did not get info_off, cues_off, tracks_off and cluster_off!");

if (cluster_off > init_bytes){
	let rv = await fsapi.readFile(normpath(path),{binary:true, start: init_bytes, end: cluster_off});
	let b = new Uint8Array(init_bytes+rv.length);
	b.set(a, 0);
	b.set(rv, init_bytes);
	a=b;
}

r = ebml_sz(a, info_off+4);
let info = parse_section(a.slice(r[1], r[1]+r[0]), INFO, 0, false);
let duration;
let tcs;
for (let i=0; i < info.length; i+=2){//«
	if (info[i]=="DURATION:4489"){
		if (info[i+1].length !== 4) return cberr("Expected 4 bytes for Duration, got: "+info[i+1].length);
		duration = (new DataView(info[i+1].buffer)).getFloat32();
//		d+1].buration = (new DataView(info[i+1].buffer)).getFloat32();
	}
	else if (info[i]=="TIMECODESCALE:2ad7b1"){
		tcs = arr_to_num(info[i+1].reverse());
//log("TCS",tcs);
	}
}//»
if (!(duration&&tcs)) return cberr("Did not get duration and tcs!");
let tmmult = tcs/10**9;
//log("TMMULT",tmmult);
duration*=tmmult;
if (startpos >= duration) return cberr(`Invalid startpos duration=${duration}`);

if (endpos==="-") endpos=duration;
else{
	endpos=parseFloat(endpos);
	if (!(Number.isFinite(endpos) && endpos>startpos && endpos <= duration)) return cberr("Invalid endpos");
}
if (startpos == 0 && endpos == duration) return cbok("Nothing to do!");

//cwarn("SLICE", startpos , endpos);
r = ebml_sz(a, cues_off+4);

let cues = parse_section(a.slice(r[1], r[1]+r[0]), CUES, 0, false);

let ALLCUES=[];
let prev_tm=null, prev_off;
for (let i=0; i < cues.length; i+=2){//«
	if (cues[i]!=="POINTENTRY:bb") return NF("PointEntry Id");
	let cue = cues[i+1]
	if (cue.length!==4) return cberr(`Bad Cue array length: ${cue.length}`);
	if (cue[0]!=="CUETIME:b3") return NF("CueTime Id");
	if (cue[2]!=="CUETRACKPOSITION:b7") return NF("CueTrackPosition Id");
	let tm = arr_to_num(cue[1].reverse())*tmmult;
	let pos = cue[3];
	if (pos.length!==4) return cberr(`Bad Cue position array length: ${pos.length}`);
	if (pos[0]!=="CUETRACK:f7") return NF("CueTrack Id");
	if (pos[2]!=="CUECLUSTERPOSITION:f1") return NF("CueClusterPosition Id");
	if (pos[1].length!==1 && pos[1][0]!==1) return cberr("Expected CueTrack==1 (for audio track)");
	let off = arr_to_num(pos[3].reverse())+seg_start;
	if (tm < startpos) {
		prev_tm = tm;
		prev_off = off;
		continue;
	}
	if (prev_tm!==null){
		ALLCUES.push(prev_tm, prev_off);
		prev_tm = null;
	}
	ALLCUES.push(tm, off);
	if (tm > endpos) break;
}//»
if (prev_tm!==null){
	ALLCUES.push(prev_tm, prev_off);
	prev_tm = null;
}

//log(ALLCUES);

let ALLBLOCKS = [];

//prev_tm=null;
let prev_dur;
let prev_block;
let tot_dur=0;
let ALLCUESLEN = ALLCUES.length;
let num_clusters = Math.floor(ALLCUESLEN/2);
werr(`Reading ${num_clusters} clusters from disk...`);
wclerr("0%");

for (let i=0; i < ALLCUESLEN - 2; i+=2){//«

wclerr(`${Math.floor(100*i/ALLCUESLEN)}%`);
let tm1 = ALLCUES[i];
let b1 = ALLCUES[i+1];
let tm2 = ALLCUES[i+2];
let b2 = ALLCUES[i+3];
//cwarn(`Getting: ${b1}->${b2}`);
let a = await fsapi.readFile(normpath(path),{binary:true, start: b1, end: b2});
if (killed) return;
if (!(a[0]==0x1f&&a[1]==0x43&&a[2]==0xb6&&a[3]==0x75)) return cberr("Cluster ID not found");

let cluster = parse_section(a, SEGMENT, 0, false);
if (cluster[0]!=="CLUSTER:1f43b675") return cberr("Cluster ID not found");
let blocks = cluster[1];
if (!blocks.shift()[0]==="CLUSTERTIMECODE:e7") return cberr("ClusterTimeCode ID not found");
let gottm = arr_to_num(blocks.shift().reverse())
if (tm1 !== gottm*tmmult) return cberr(`tm1 (${tm1}) !== gottm*tmmult (${gottm*tmmult})`);

for (let j=0; j < blocks.length; j+=2){//«

if (blocks[j]!=="SIMPLEBLOCK:a3") {//«

//BLOCKGROUP{
//	BLOCK[129, 17, 128, 0, 252, 255, 254],
//	DISCARDPADDING[0, 227, 237, 156]
//}
	if (i+2==ALLCUES.length && j+2==blocks.length){
cwarn(`Ignoring final block '${blocks[j]}'`);
		break;
	}

	return cberr("SimpleBlock ID not found");
}//»

let blk1 = blocks[j+1];
let blk2 = blocks[j+3];
let blk1tm = (tm1+arr_to_num([blk1[2], blk1[1]])*tmmult);
let blk2tm;
let blkdur;
if (blk2) blk2tm = (tm1+arr_to_num([blk2[2], blk2[1]])*tmmult);
else blk2tm = tm2;
blkdur = blk2tm - blk1tm;

if (blk1tm < startpos) {
	prev_dur = blkdur;
	prev_block = blk1;
	continue;
}
if (prev_dur!==null){
	tot_dur+=prev_dur;
	ALLBLOCKS.push(prev_dur, prev_block);
	prev_dur = null;
}

if (blkdur > 0) {
	tot_dur+=blkdur;
}
else {
	blkdur = 0;
	cwarn(`blk1tm(${blk1tm})  >  blk2tm(${blk2tm})`);
}
ALLBLOCKS.push(blkdur, blk1);
if (blk1tm > endpos) break;

}//»

}//»

//log(tot_dur);

//log(ALLBLOCKS);
//cberr("Have we renumbered all the blocks???");
//return;

if (killed) return;
//log("???");

wclerr(`100%`);
werr("Reclustering...");
werr("0%");

//let new_duration_bytes = (new Uint8Array(new Float32Array([tot_dur]).buffer)).reverse();

let head = a;

const process=async()=>{//«

const _get_chunk=()=>{
	return new Promise((Y,N)=>{
		setTimeout(()=>{
			Y(get_chunk(ALLBLOCKS, tmmult, curtm));
		}, 0);
	});
};

let cluster;
let curtm=0;
let clusters=[];
let tot_bytes=0;
let chunk_iter=0;
while (cluster = await _get_chunk()){//«
	if (killed) return;
//log(cluster);
	let cl = cluster[0];
	clusters.push([curtm, cl]);
	tot_bytes+=cl.length;
	curtm+=cluster[1];
	chunk_iter++;
//	wclerr(`${Math.floor(100*chunk_iter)}`);
	wclerr(`${Math.floor(100*chunk_iter/num_clusters)}%`);
}//»
wclerr("100%");
let body;
let a = new Uint8Array(tot_bytes);
body = a;
let curoff = 0;
let posns=[];
//let times = [];
//log(clusters);
for (let arr of clusters){
	let cl = arr[1];
//	posns.push(int_to_ebml(arr[0]), int_to_ebml(curoff+seg_start));
	posns.push(arr[0], curoff+seg_start);
	a.set(cl, curoff);
	curoff+=cl.length;
}

//NOTE7


cwarn("Cues");
//log("TIMES",times);
let cue_len = 0;
let cues_arr=[];


for (let i=0; i < posns.length; i+=2){//«

let tm = num_to_arr(posns[i]);
if (!tm.length) tm=[0];
let tmlen = tm.length;

let pos = num_to_arr(posns[i+1]);
if (!pos.length) pos=[0];
let poslen = pos.length;

let entlen = 11+tmlen+poslen;

let a = new Uint8Array(entlen);

a[0]=0xbb;//POINTENTRY == 187
a[1]=128|(entlen-2);

a[2]=0xb3;//CUETIME == 179
a[3] = 128|(tmlen);
a.set(tm, 4);
let cur = 4+tmlen;

a[cur++]=0xb7;//CUETRACKPOSITION == 183
a[cur++]=128|(5+poslen);

a[cur++]=0xf7;//CUETRACK == 247 
a[cur++]=129;// 1 ==  (audio)
a[cur++]=1;

a[cur++]=0xf1;//CUECLUSTERPOSITION == 241
a[cur++]=128|(poslen);
a.set(pos, cur);

cue_len+=a.length;
cues_arr.push(a);

}//»



let cues_len_arr = int_to_ebml(cue_len);
let cues = new Uint8Array(cue_len+4+cues_len_arr.length);
cues[0]=0x1c;
cues[1]=0x53;
cues[2]=0xbb;
cues[3]=0x6b;
cues.set(cues_len_arr, 4);
curoff=4+cues_len_arr.length;
for (let cue of cues_arr){
	cues.set(cue, curoff);
	curoff+=cue.length;
}

head.set(cues, cues_off);

let cues_end = cues_off+cues.length;
let diff = head.length - cues_end;
if (diff) {

	let new_head = head;
	new_head.set(new Uint8Array(diff), cues_end);

	if (diff > 9) {
		let diff_arr = num_to_arr(diff-9);
		let len = diff_arr.length;
		new_head[cues_end++] = 0xec;
		new_head[cues_end++] = 1;
		while (diff_arr.length<7) diff_arr.unshift(0);
		new_head.set(diff_arr, cues_end);
	}
	else {
console.warn(`Got (strangely small) diff==${diff}!!!`);
	}

	head = new_head;

}


{//«



let a = head;

//	"18538067":
for (let i=0; i < a.length-4; i++){

if (a[i+0]==0x18&&a[i+1]==0x53&&a[i+2]==0x80&&a[i+3]==0x67) {
if (a[i+4]!==1){
return cberr("Barfing on some weird a[i+4]!==1 ");

}
let rv = ebml_sz(a, i+4);
let cur_sz = rv[0];
//log("CURSEGSZ",cur_sz);
//log("NEWSEGSZ",head.length-seg_start+body.length);
let szarr = num_to_arr(head.length-seg_start+body.length);
while (szarr.length<7) szarr.unshift(0);
a.set(szarr, i+5);


//log(szarr);
//dump_hex_lines(a.slice(i, i+60));

break;
}

}


let gothead;
let arr;
for (let i=0; i < a.length-4; i++){
	if (gothead) break;
	if (a[i+0]==0x15&&a[i+1]==0x49&&a[i+2]==0xa9&&a[i+3]==0x66) {
		let ar = a.slice(i);
no_error = true;
		let rv = parse_section(ar, SEGMENT, false, 0);
no_error = false;
		if (rv) {
//log(rv);
			gothead = i;
			arr = ar;
		}
	}
}
if (!arr) return cberr("Could not find Info!?!?!");

let gotdur;
let dur_pos;
for (let i=0; i < arr.length-2; i++){
	if (gotdur) break;
	if (arr[i]==0x44&&arr[i+1]==0x89) {
		let sz = ebml_sz(arr, i+2);
		if (sz[0]==4){
			dur_pos = sz[1]+gothead;
			break;
		}
		else{
cwarn("Skipping sz returned", sz);
		}
	}
}
if (!dur_pos) return cberr("Could not find duration position!?!?!");

let dur = (new DataView(head.slice(dur_pos, dur_pos+4).buffer)).getFloat32();
if (dur*tmmult!==duration) return cberr("Got a different duration this time?!?!?!?");
//log(tot_dur/tmmult);
//log(new Uint8Array(new Float32Array([tot_dur/tmmult]).buffer));
{
//log("New duration", tot_dur);
let arr = new Uint8Array(new Float32Array([tot_dur/tmmult]));
//arr = arr.reverse();
head.set(arr.buffer, dur_pos);
}
dump_hex_lines(head.slice(dur_pos-3, dur_pos+17));

}//»

//log(head);

let file = new Uint8Array(head.length+body.length);
file.set(head, 0);
file.set(body, cluster_off);
//log("FILESZ",file.length);
//debug_section = true;
let rv = parse_section(file, WEBM, 0, false);
log(rv);
//debug_section = false;
woutobj(new Blob([file.buffer],{type:"audio/webm"}));

cbok();

}//»

setTimeout(process, 10);

return;


},//»


«NOTE1
For the nth Cluster,
Cues[n]->PointEntry->CueTime == Clusters[n]->ClusterTimeCode

Given a slicing operation:



When slicing, should SeekHead stay the same???
What changes?
Set Info->Duration to the new Float32

const arr_to_num = (arr)=>{let n = 0;for (let i=0; i<arr.length;i++)n|=(arr[i]<<(i*8)); return n;}

arr_to_num([64, 66, 15]); //1000000

atn = arr_to_num

NPS: Nanoseconds per second
nps = 10**9 = 1_000_000_000

SOSS = Size of Segment Size
Number of bytes to encode the size of the segment in bytes (1-8 bytes)

HOS = Header of Segment
0x18 0x53 0x80 0x67 + SOSS (5-12 bytes)

BOS = Beginning of Segment (byte offset into the file after the EBML/Header and HOS)


DUR: Info->Duration

					   DUR[0]  DUR[1]  DUR[2] DUR[3]
arr = new Uint8Array([   70  ,  133  ,  234  , 0    ])

(new DataView(arr.buffer)).getFloat32() -> Multiply by TCS



TCS: Info->TimeCodeScale
	  	    TCS[2]  TCS[1]  TCS[0] 
tcs = atn([   64   ,  66   ,  15   ]) => 1000000

TM: TimeMultiplier:
	tcs/nps => 1000000/nps => 10**-3 => .001 


CTC: Cluster->ClusterTimeCode

CT: Cues->CueTime
	  CT[1]  CT[0]
atn([  17  , 39  ]) -> 10001

CCP: Cues->CueTrackPosition->CueClusterPosition
  (For Audio Track, Cues->CueTrackPosition->CueTrack == 1)
	  CCP[2]   CCP[1]  CCP[0]
atn([  167  ,   131  ,   2   ]) -> 164775 (byte offset from BOS)



SB: SimpleBlock

	  SB[2]  SB[1]	
atn([  208  ,  27   ]) * TM 



//»
NOTE2//«
let cur=0;
let nb = pos2-pos1;

while(1){
if (!rv[cur+4]) break;
log("=========================================");
if (!(rv[cur+4]===1 && rv[cur+12]===0xe7)){
cerr("UHOH!!!");
}
else{
log(cur, `Found ClusterTimeCode (e7) @${cur+12}`);
}
dump_hex_lines(rv.slice(cur,cur+20), cur);
let r = ebml_sz(rv, cur+4);
let sz = r[0];
cur = r[1]+sz;
if (cur===nb) {
log("Done!");
	break
}
else if (cur > nb){
cerr(`cur (${cur}) > nb (${nb}) !!!`);
break;
}
//log(cur, nb);
//log();
}
//»
//«NOTE3
rv is the full clusters block... just need to update the timestamps of each cluster
at CLUSTERTIMECODE: 0xe7/231.  Since this will only go down, it is just a matter of
overwriting.

So, just:
1) Update timestamps for each cluster here
2) Create a new Cues section, pointing to these new clusters.
//»
NOTE4//«
BLOCKGROUP{
	BLOCK[129, 17, 128, 0, 252, 255, 254],
	DISCARDPADDING[0, 227, 237, 156]
}
//»

//NOTE5
//"1c53bb6b": {//CUES 28 83 187 107«
	"id": "CUES",
	"kids": {
187		"bb": {// 1 + 1 
			"id": "POINTENTRY",		//MULT
			"out":[],
			"mult":true,
			"kids": {
179				"b3": {"id": "CUETIME"}, //2 + tmarr.length
183				"b7": {// 1+1
					"id": "CUETRACKPOSITION",
					"kids": {
247						"f7": {"id": "CUETRACK"},// 2+1
241						"f1": {"id": "CUECLUSTERPOSITION"},// 2+posnarr.length
						"f0": {"id": "CUERELATIVEPOSITION"},
						"b2": {"id": "CUEDURATION"},
						"5378": {"id": "CUEBLOCKNUMBER"}
					}
				}	
			}
		}				
	}
},

if (cues[i]!=="POINTENTRY:bb") return NF("PointEntry Id");
let cue = cues[i+1]
if (cue.length!==4) return cberr(`Bad Cue array length: ${cue.length}`);
if (cue[0]!=="CUETIME:b3") return NF("CueTime Id");
if (cue[2]!=="CUETRACKPOSITION:b7") return NF("CueTrackPosition Id");
let tm = arr_to_num(cue[1].reverse())*tmmult;
let pos = cue[3];
if (pos.length!==4) return cberr(`Bad Cue position array length: ${pos.length}`);
if (pos[0]!=="CUETRACK:f7") return NF("CueTrack Id");
if (pos[2]!=="CUECLUSTERPOSITION:f1") return NF("CueClusterPosition Id");

//»

//NOTE6«

For the nth Cluster,
Cues[n]->PointEntry->CueTime == Clusters[n]->ClusterTimeCode

Given a slicing operation:



When slicing, should SeekHead stay the same???
What changes?
Set Info->Duration to the new Float32

const arr_to_num = (arr)=>{let n = 0;for (let i=0; i<arr.length;i++)n|=(arr[i]<<(i*8)); return n;}

arr_to_num([64, 66, 15]); //1000000

atn = arr_to_num

NPS: Nanoseconds per second
nps = 10**9 = 1_000_000_000

SOSS = Size of Segment Size
Number of bytes to encode the size of the segment in bytes (1-8 bytes)

HOS = Header of Segment
0x18 0x53 0x80 0x67 + SOSS (5-12 bytes)

BOS = Beginning of Segment (byte offset into the file after the EBML/Header and HOS)


DUR: Info->Duration

					   DUR[0]  DUR[1]  DUR[2] DUR[3]
arr = new Uint8Array([   70  ,  133  ,  234  , 0    ])

(new DataView(arr.buffer)).getFloat32() -> Multiply by TCS



TCS: Info->TimeCodeScale
	  	    TCS[2]  TCS[1]  TCS[0] 
tcs = atn([   64   ,  66   ,  15   ]) => 1000000

TM: TimeMultiplier:
	tcs/nps => 1000000/nps => 10**-3 => .001 


CTC: Cluster->ClusterTimeCode

CT: Cues->CueTime
	  CT[1]  CT[0]
atn([  17  , 39  ]) -> 10001

CCP: Cues->CueTrackPosition->CueClusterPosition
  (For Audio Track, Cues->CueTrackPosition->CueTrack == 1)
	  CCP[2]   CCP[1]  CCP[0]
atn([  167  ,   131  ,   2   ]) -> 164775 (byte offset from BOS)



SB: SimpleBlock

	  SB[2]  SB[1]	
atn([  208  ,  27   ]) * TM 



//»

//NOTE7
"1c53bb6b": {//CUES 28 83 187 107«
	"id": "CUES",
	"kids": {
187		"bb": {// 1 + 1 
			"id": "POINTENTRY",		//MULT
			"out":[],
			"mult":true,
			"kids": {
179				"b3": {"id": "CUETIME"}, //2 + tmarr.length
183				"b7": {// 1+1
					"id": "CUETRACKPOSITION",
					"kids": {
247						"f7": {"id": "CUETRACK"},// 2+1
241						"f1": {"id": "CUECLUSTERPOSITION"},// 2+posnarr.length
						"f0": {"id": "CUERELATIVEPOSITION"},
						"b2": {"id": "CUEDURATION"},
						"5378": {"id": "CUEBLOCKNUMBER"}
					}
				}	
			}
		}				
	}
},

if (cues[i]!=="POINTENTRY:bb") return NF("PointEntry Id");
let cue = cues[i+1]
if (cue.length!==4) return cberr(`Bad Cue array length: ${cue.length}`);
if (cue[0]!=="CUETIME:b3") return NF("CueTime Id");
if (cue[2]!=="CUETRACKPOSITION:b7") return NF("CueTrackPosition Id");
let tm = arr_to_num(cue[1].reverse())*tmmult;
let pos = cue[3];
if (pos.length!==4) return cberr(`Bad Cue position array length: ${pos.length}`);
if (pos[0]!=="CUETRACK:f7") return NF("CueTrack Id");
if (pos[2]!=="CUECLUSTERPOSITION:f1") return NF("CueClusterPosition Id");

//»

»*/


