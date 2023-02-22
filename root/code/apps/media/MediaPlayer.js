/*   !!!!IMPORTANT FFMPEG STUFF   !!!«

README (ffmpeg for mp4!!!)«

For this command:

ffmpeg -i $1 -c:v copy -c:a copy -movflags frag_keyframe+empty_moov+default_base_moof $2

It outputs something here (like 1000):
moov.mvhd.timescale (pos 20)

But all zeros here::
moov.mvhd.duration (pos 24)

Question: how to we get total movie duration?

MSE: Random seeking does not appear to be supported for fragmented Mp4 files, even 
after adding the mfra. It needs to append everything. Perhaps we can just rip out 
the 'moof' atoms (not the mdat).

To support quasi-seeking, you need to request huge chunks before hand, then it will 
only seek up to the end of the buffered amount.

»

In bvi, directly underneath "mvhd" (when the rows are 20 bytes long) in input.mp4 are the 4 hex
chars for the duration. This needs to be put back in. The moov atom is either at the beginning or
ending of the file!

//Using od«

//If this outputs "mvhd"
$ od -c -j 36 -N 4 -A n --endian=big downloaded.mp4 
m v h d

//Then this will give the size (c5a42e):
od -t x1 -j 56 -N 4 -A n --endian=big downloaded.mp4 
00 2e a4 c5

Save the 4 bytes and change downloaded.mp4:

ffmpeg -i downloaded.mp4 -c:v copy -c:a copy -movflags frag_keyframe+empty_moov+default_base_moof changed.mp4

Verify that changed.mp4 has "mvhd" at byte #36, then do this:

printf '\x00\x2e\xa4\xc5' | dd of=changed.mp4 bs=1 seek=56 count=4 conv=notrunc

Otherwise, "mvhd" was probably moved to the end of the file.

//»

It looks like downloaded mp4 videos always have the duration at bytes 56-59 (end of the third row).
So just read those bytes.

This seems to be the proper way to get local streaming working. 


Looks like youtube-dl only lets us get separate audio and video webm tracks (at least in this case)

[youtube] AWAsI3U2EaE: Downloading webpage
[info] Available formats for AWAsI3U2EaE:
format code  extension  resolution note
249          webm       audio only tiny   52k , webm_dash container, opus @ 52k (48000Hz), 1.33MiB
250          webm       audio only tiny   69k , webm_dash container, opus @ 69k (48000Hz), 1.75MiB
140          m4a        audio only tiny  127k , m4a_dash container, mp4a.40.2@127k (44100Hz), 3.22MiB
251          webm       audio only tiny  134k , webm_dash container, opus @134k (48000Hz), 3.42MiB
394          mp4        192x144    144p   51k , mp4_dash container, av01.0.00M.08@  51k, 25fps, video only, 1.31MiB
160          mp4        192x144    144p   52k , mp4_dash container, avc1.4d400b@  52k, 25fps, video only, 1.32MiB
278          webm       192x144    144p   65k , webm_dash container, vp9@  65k, 25fps, video only, 1.65MiB
395          mp4        320x240    240p   78k , mp4_dash container, av01.0.00M.08@  78k, 25fps, video only, 1.98MiB
133          mp4        320x240    240p  105k , mp4_dash container, avc1.4d400d@ 105k, 25fps, video only, 2.67MiB
242          webm       320x240    240p  117k , webm_dash container, vp9@ 117k, 25fps, video only, 2.99MiB
396          mp4        480x360    360p  139k , mp4_dash container, av01.0.01M.08@ 139k, 25fps, video only, 3.53MiB
243          webm       480x360    360p  209k , webm_dash container, vp9@ 209k, 25fps, video only, 5.32MiB
134          mp4        480x360    360p  255k , mp4_dash container, avc1.4d4015@ 255k, 25fps, video only, 6.47MiB
397          mp4        640x480    480p  245k , mp4_dash container, av01.0.04M.08@ 245k, 25fps, video only, 6.23MiB
244          webm       640x480    480p  364k , webm_dash container, vp9@ 364k, 25fps, video only, 9.25MiB
135          mp4        640x480    480p  461k , mp4_dash container, avc1.4d401e@ 461k, 25fps, video only, 11.70MiB
18           mp4        480x360    360p  576k , avc1.42001E, 25fps, mp4a.40.2 (44100Hz), 14.62MiB (best)


To make a video, put them together like this (takes no time at all):
ffmpeg -i audiotrack.webm -i videotrack.webm -c:a copy -c:v copy output.webm

To just add a very small video track. It seemed okay with rate=0.1, but rate 0.01 seemed to break.

Without '-shortest', it will just keep encoding video forever.

ffmpeg -i audio.webm -f lavfi -i color=size=2x2:rate=1:color=black -c:a copy -shortest output.webm

Then we can use output.webm


»*/
/*Errors«

Possible CHUNK_APPEND_DEMUX_ERROR (or whatever) that fires the error event.

What we can do is save the currentTime, then restart everything and just seek back
there..

»*/

export const app = function(arg) {

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;
//Imports«
//let Desk = arg.DESK;
//let Core = arg.CORE
let _;

const fsapi = NS.api.fs;
const widgets = NS.api.widgets;
//let globals = Core.globals;
let fs = globals.fs;
let util = globals.util;
 _ = util;
let jlog = _.jlog;
let isnum = _.isnum;
let center = _.center;
let make = _.make;

//let log = Core.log;
let wout = log;
let xget = Core.xget;
//let cerr = Core.cerr;
//let cwarn = Core.cwarn;
//const cwarn=()=>{}
let cwrn=Core.cwarn;
let ks2str = util.keysym_to_str;
let main = Main;
let topwin = Main.top;
const {poperr}=widgets;
//let poperr=(e)=>{
//cerr(e)
//};

//»

//VAR«
let noplay;
let last_endtime;
let did_get_end;
let VIDEO_ASPECT;
let INIT_BUFSZ = 1024*1024-1;
let MS_LOOKAHEAD = 5000;

let cur_rate = 1;
let cur_rate_delta = 0.01;
//let small_dt = 1/60;
let small_dt = 60;

let srcbuf;
let msrc = new MediaSource;
let acodec=null;
let vcodec=null;
let tracks, duration;
let timepoints = [];
let timemap = {};

let buffer_refill_in_progress;
const MIN_SEEK_DIFF = 250;
let sleep_timer;

let file_url
let file_path;
let file_ext;

let ext_to_parser;

//»

//DOM«
let meddiv=null;
let vid;
main.bgcol="#000";
//»

//Parsers«

const WebmParser=function(){//«


//Var«

let seg_len, seg_off, file_len;
let seek_len, seek_iter;

let cues_pos, info_pos, tracks_pos;
let cues_len, info_len, tracks_len;

let acodec_id_map = {
	"A_VORBIS": "vorbis",
	"A_OPUS": "opus"
}

let vcodec_id_map = {
	"V_VP8": "vp8",
	"V_VP9": "vp9"
}

/*
1: video,
2: audio, 
3: complex, 
0x10: logo, 
0x11: subtitle, 
0x12: buttons, 
0x20: control
*/
const VIDEO_TRACK_TYPE=1;
const AUDIO_TRACK_TYPE=2;
const COMPLEX_TRACK_TYPE=3;
const LOGO_TRACK_TYPE=0x10;
const SUBTITLE_TRACK_TYPE=0x11;
const BUTTONS_TRACK_TYPE=0x12;
const CONTROL_TRACK_TYPE=0x20;

let track_types = [//«
	VIDEO_TRACK_TYPE,
	AUDIO_TRACK_TYPE,
	COMPLEX_TRACK_TYPE,
	LOGO_TRACK_TYPE,
	SUBTITLE_TRACK_TYPE,
	BUTTONS_TRACK_TYPE,
	CONTROL_TRACK_TYPE
];//»

//Matroska/EBML«

let Void_ID = "ec";
let CRC32_ID = "bf";

let EBML_ID = "1a45dfa3";   		//0«

let EBMLVersion_ID = "4286"; 		//1
let EBMLReadVersion_ID = "42f7";	//1
let EBMLMaxIDLength_ID = "42f2";	//1
let EBMLMaxSizeLength_ID = "42f3";	//1

let DocType_ID = "4282";			//1
let DocTypeVersion_ID = "4287";		//1
let DocTypeReadVersion_ID = "4285";	//1

let EMBL_IDs = [//«
EBMLVersion_ID,
EBMLReadVersion_ID,
EBMLMaxIDLength_ID,
EBMLMaxSizeLength_ID,
DocType_ID,
DocTypeVersion_ID,
DocTypeReadVersion_ID
];//»

//»

let Segment_ID = "18538067";		//0«

let SeekHead_ID = "114d9b74";		//1//«

let Seek_ID = "4dbb";				//2«

let SeekID_ID = "53ab";				//3
let SeekPosition_ID = "53ac";		//3

let Seek_IDs = [//«
SeekID_ID,
SeekPosition_ID
];//»

//»

let SeekHead_IDs = [//«
	Seek_ID
];//»

//»
let Info_ID = "1549a966";			//1//«

let SegmentUID_ID = "73a4";			//2
let SegmentFilename_ID = "7384";	//2
let PrevUID_ID = "3cb923";			//2
let PrevFilename_ID = "3c83ab";		//2
let NextUID_ID = "3eb923";			//2
let NextFilename_ID = "3e83bb";		//2
let SegmentFamily_ID = "4444";		//2
let ChapterTranslate_ID = "6924";	//2
let TimecodeScale_ID = "2ad7b1";	//2
let Duration_ID = "4489";			//2
let DateUTC_ID = "4461";			//2
let Title_ID = "7ba9";				//2
let MuxingApp_ID = "4d80";			//2
let WritingApp_ID = "5741";			//2

let Info_IDs = [//«
SegmentUID_ID,
SegmentFilename_ID,
PrevUID_ID,
PrevFilename_ID,
NextUID_ID,
NextFilename_ID,
SegmentFamily_ID,
ChapterTranslate_ID,
TimecodeScale_ID,
Duration_ID,
DateUTC_ID,
Title_ID,
MuxingApp_ID,
WritingApp_ID
];//»

//»
let Tracks_ID = "1654ae6b";//1//«

let TrackEntry_ID = "ae"; //2//«

let TrackNumber_ID = "d7";//3
let TrackUID_ID = "73c5";//3
let TrackType_ID = "83";//3
let FlagEnabled_ID = "b9";//3
let FlagDefault_ID = "88";//3
let FlagForced_ID = "55aa";//3
let FlagLacing_ID = "9c";//3
let MinCache_ID = "6de7";//3
let MaxCache_ID = "6df8";//3
let DefaultDuration_ID = "23e383";//3
let DefaultDecodedFieldDuration_ID = "234e7a";//3
let MaxBlockAdditionID_ID = "55ee";//3
let Name_ID = "536e";//3
let Language_ID = "22b59c";//3
let CodecID_ID = "86";//3
let CodecPrivate_ID = "63a2";//3
let CodecName_ID = "258688";//3
let AttachmentLink_ID = "7446";//3
let CodecDecodeAll_ID = "aa";//3
let TrackOverlay_ID = "6fab";//3
let CodecDelay_ID = "56aa";//3
let SeekPreRoll_ID = "56bb";//3
let TrackTranslate_ID = "6624";//3
let Video_ID = "e0";//3«
let FlagInterlaced_ID = "9a";
let FieldOrder_ID = "9d";
let StereoMode_ID = "53b8";
let AlphaMode_ID = "53c0";
let PixelWidth_ID = "b0";
let PixelHeight_ID = "ba";
let PixelCropBottom_ID = "54aa";
let PixelCropTop_ID = "54bb";
let PixelCropLeft_ID = "54cc";
let PixelCropRight_ID = "54dd";
let DisplayWidth_ID = "54b0";
let DisplayHeight_ID = "54ba";
let DisplayUnit_ID = "54b2";
let AspectRatioType_ID = "54b3";
let ColourSpace_ID = "2eb524";
let Colour_ID = "55b0";

let Video_IDs = [//«
FlagInterlaced_ID,
FieldOrder_ID,
StereoMode_ID,
AlphaMode_ID,
PixelWidth_ID,
PixelHeight_ID,
PixelCropBottom_ID,
PixelCropTop_ID,
PixelCropLeft_ID,
PixelCropRight_ID,
DisplayWidth_ID,
DisplayHeight_ID,
DisplayUnit_ID,
AspectRatioType_ID,
ColourSpace_ID,
Colour_ID
];//»

//»
let Audio_ID = "e1";//3«
let SamplingFrequency_ID = "b5";
let OutputSamplingFrequency_ID = "78b5";
let Channels_ID = "9f";
let BitDepth_ID = "6264";

let Audio_IDs = [//«
SamplingFrequency_ID,
OutputSamplingFrequency_ID,
Channels_ID,
BitDepth_ID
];//»

//»
let TrackOperation_ID =	"e2";//3
let ContentEncodings_ID = "6d80";//3

//TrackNumber_ID,					//0
//TrackUID_ID,					//1
//TrackType_ID,					//2
//FlagLacing_ID,					//6
//Language_ID,					//13
//CodecID_ID,						//14
//Video_ID,						//23
//Audio_ID,						//24
//CodecPrivate_ID,				//15

let TrackEntry_ID_Names = [//«
"TrackNumber_ID",
"TrackUID_ID",
"TrackType_ID",
"FlagLacing_ID",
"Language_ID",
"CodecID_ID",
"Video_ID",
"Audio_ID",
"DefaultDuration_ID",
"CodecPrivate_ID",
"FlagEnabled_ID",
"FlagDefault_ID",
"FlagForced_ID",
"MinCache_ID",
"MaxCache_ID",
"DefaultDecodedFieldDuration_ID",
"MaxBlockAdditionID_ID",
"Name_ID",
"CodecName_ID",
"AttachmentLink_ID",
"CodecDecodeAll_ID",
"TrackOverlay_ID",
"CodecDelay_ID",
"SeekPreRoll_ID",
"TrackTranslate_ID",
"TrackOperation_ID",
"ContentEncodings_ID"
];//»

let TrackEntry_IDs = [//«
TrackNumber_ID,
TrackUID_ID,
TrackType_ID,
FlagLacing_ID,
Language_ID,
CodecID_ID,
Video_ID,
Audio_ID,
DefaultDuration_ID,
CodecPrivate_ID,
FlagEnabled_ID,
FlagDefault_ID,
FlagForced_ID,
MinCache_ID,
MaxCache_ID,
DefaultDecodedFieldDuration_ID,
MaxBlockAdditionID_ID,
Name_ID,
CodecName_ID,
AttachmentLink_ID,
CodecDecodeAll_ID,
TrackOverlay_ID,
CodecDelay_ID,
SeekPreRoll_ID,
TrackTranslate_ID,
TrackOperation_ID,
ContentEncodings_ID
];//»

//»

let Tracks_IDs = [//«
	TrackEntry_ID
];//»

//»
let Cues_ID = "1c53bb6b";//1«

let CuePoint_ID = "bb"; //2«

let CueTime_ID = "b3";//3
let CueTrackPositions_ID = "b7";//3«

let CueTrack_ID = "f7";//4
let CueClusterPosition_ID = "f1";//4
let CueRelativePosition_ID = "f0";//4
let CueDuration_ID = "b2";//4
let CueBlockNumber_ID = "5378";//4
let CueCodecState_ID = "ea";//4
let CueReference_ID = "db";//4

let CueTrackPositions_IDs = [//«
CueTrack_ID,
CueClusterPosition_ID,
CueRelativePosition_ID,
CueDuration_ID,
CueBlockNumber_ID,
CueCodecState_ID,
CueReference_ID
];//»

//»

let CuePoint_IDs = [//«
	CueTime_ID,
	CueTrackPositions_ID 
];//»

//»

//»

//Unused...
let Cluster_ID = "1f43b675";//1
let Attachments_ID = "1941a469";//1
let Chapters_ID = "1043a770";//1
let Tags_ID = "1254c367";//1

let Segment_IDs = [//«
SeekHead_ID,
Info_ID,
Tracks_ID,
Cues_ID,
Cluster_ID,
Attachments_ID,
Chapters_ID,
Tags_ID
];//»

//»

//»

//»

//Funcs«

const ebml_sz=(buf, pos)=>{//«
//cwarn("ebml_sz("+pos+")");
	var nb;
	var b = buf[pos];
	if (b&128) {nb = 1; b^=128;}
	else if (b&64) {nb = 2;b^=64;}
	else if (b&32) {nb = 3;b^=32;}
	else if (b&16) {nb = 4;b^=16;}
	else if (b&8) {nb = 5;b^=8;}
	else if (b&4) {nb = 6;b^=4;}
	else if (b&2) {nb = 7;b^=2;}
	else if (b&1) {nb = 8;b^=1;}
	var str = "0x"+(b.toString(16));
	var end = pos+nb;
	var ch; 
	for (let i=pos+1; i < end; i++) {
		ch = buf[i].toString(16);
		if (ch.length==1) ch = "0"+ch;
		str = str + ch;
	}   
	return [parseInt(str), end]
}//»

const parse_cues=(buf)=>{//«
cwarn("parse_cues()");
	timepoints = [];
	timemap = {};
	let iter=-2;
	let err=(str)=>{
		timepoints = null;
		timemap = null;
		poperr(str+" (iter="+iter+", curpos="+curpos+")");
	}
	let bufend = buf.length;
	let ret, curpos;
let cues_end;
	curpos = 0;
	if (!hexeq(buf,curpos,4,Cues_ID)) return err("No Cues ID @"+curpos);
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	cues_len = ret[0];
cwarn("cues_len: " + cues_len);
	curpos = ret[1];
	cues_end = curpos + cues_len;
//	while (curpos < bufend) {
	while (curpos < cues_end) {//«
		let obj = {};
		iter+=2;
	   //if (iter > 1000) return cberr("INFINITE LOOP @: " + curpos + " and BUFLEN: " + buf.length);
//BB
		if (!hexeq(buf, curpos,1, CuePoint_ID)) return err("Cannot find CuePoint_ID");
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];
//B3
		if (!hexeq(buf, curpos,1, CueTime_ID)) return err("Cannot find CueTime_ID @" +curpos+" ("+CueTime_ID.toString(16)+")");
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];
		let cue_time = parseInt("0x"+gethex(buf, curpos, ret[0]));
		curpos += ret[0];
//B7
		if (!hexeq(buf, curpos,1, CueTrackPositions_ID)) return err("Cannot find CueTrackPositions_ID");
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];
//F7
		if (!hexeq(buf, curpos,1, CueTrack_ID)) return err("Cannot find CueTrack_ID");
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[0]+ret[1];
//F1
		if (!hexeq(buf, curpos,1, CueClusterPosition_ID)) {
log(ret);
			return err("Cannot find CueClusterPosition_ID (" + CueClusterPosition_ID+")");
		}
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];
//		cues_arr[iter] = parseInt("0x"+cue_time);
//		cues_arr[iter+1] = parseInt("0x"+(gethex(buf, curpos, ret[0])))+seg_off;
		timepoints.push(cue_time);
		timemap[""+cue_time] = parseInt("0x"+(gethex(buf, curpos, ret[0])))+seg_off;
		curpos += ret[0];

//Other stuff that might be children of CueTrackPositions«
//let CueRelativePosition_ID = "f0";//4
//let CueDuration_ID = "b2";//4
//let CueBlockNumber_ID = "5378";//4
//let CueCodecState_ID = "ea";//4
//let CueReference_ID = "db";//4

//F0
		if (hexeq(buf, curpos,1, CueRelativePosition_ID,true)) {
			curpos+=1;
			ret = ebml_sz(buf, curpos);
			curpos = ret[1];
			curpos += ret[0];
		}
//»
//	curpos += ret[0];
	}//»

cwarn("parse_cues: DONE!");
}//»

const parse_tracks=(buf)=>{//«
cwarn("parse_tracks()");
//log(buf);
	let bufend = buf.length;

	let ret, curpos;
	let track_num=0;
	curpos = 0;
	if (!hexeq(buf,curpos,4,Tracks_ID)) return cerr("No Tracks_ID ID @"+curpos);
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	curpos = ret[1];

	while (curpos < bufend) {//«
cwarn("Doing track_num="+track_num);
		let trackentry_end;
	   //if (iter > 1000) return cberr("INFINITE LOOP @: " + curpos + " and BUFLEN: " + buf.length);
		if (!hexeq(buf, curpos,1, TrackEntry_ID)) return err("Cannot find TrackEntry_ID");
		curpos+=1;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];

		trackentry_end = curpos + ret[0];

/*
Need to loop through level 3 

let TrackEntry_IDs = [//«
TrackNumber_ID,					//0
TrackUID_ID,					//1
TrackType_ID,					//2
FlagLacing_ID,					//6
Language_ID,					//13
CodecID_ID,						//14
Video_ID,						//23
Audio_ID,						//24
CodecPrivate_ID,				//15
FlagEnabled_ID,
FlagDefault_ID,
FlagForced_ID,
MinCache_ID,
MaxCache_ID,
DefaultDuration_ID,
DefaultDecodedFieldDuration_ID,
MaxBlockAdditionID_ID,
Name_ID,
CodecName_ID,
AttachmentLink_ID,
CodecDecodeAll_ID,
TrackOverlay_ID,
CodecDelay_ID,
SeekPreRoll_ID,
TrackTranslate_ID,
TrackOperation_ID,
ContentEncodings_ID
];//»

*/
		let trackentryid_num=0;
		let cur_codec=null, cur_track_type=null;
		while (curpos < trackentry_end) {//«
			let gotid=null;
//			cur_codec = null;
//			cur_track_type = null;
//			for (let id of TrackEntry_IDs) {
			for (let i=0; i < TrackEntry_IDs.length; i++) {//«
				let id = TrackEntry_IDs[i];
				let name = TrackEntry_ID_Names[i];
				let idlen = id.length/2;
				if (hexeq(buf, curpos, idlen, id, true)){
					curpos+=idlen;
					ret = ebml_sz(buf, curpos);
					curpos = ret[1];
					gotid = id;
					let val = gethex(buf, curpos, ret[0]);
					if (name == "TrackType_ID"){
						val = parseInt("0x"+val);
						cur_track_type = val;
						if (val===VIDEO_TRACK_TYPE) {
							cwarn("Found video track");
							if (cur_codec) {
								vcodec = vcodec_id_map[cur_codec];
								if (!vcodec) return cerr("The codec name was not found in vcodec_id_map: " + cur_codec);
							}
						}
						else if (val===AUDIO_TRACK_TYPE) {
							cwarn("Found audio track");
							if (cur_codec) {
								acodec = acodec_id_map[cur_codec];
								if (!acodec) return cerr("The codec name was not found in acodec_id_map: " + cur_codec);
							}
						}
						else if (val===SUBTITLE_TRACK_TYPE) cwarn("Found subtitle track (ignoring)");
						else if (track_types.includes(val)) cwarn("Ignoring known track type: " + val);
						else cwarn("Unknown track type found: " + val);
					}
//					else if (name==="CodecID_ID"||name=="Language_ID") {
					else if (name==="CodecID_ID") {
						val = hex2text(val);
						if (cur_track_type) {
							if (cur_track_type==VIDEO_TRACK_TYPE) {
								vcodec = vcodec_id_map[val];
								if (!vcodec) return cerr("The codec name was not found in vcodec_id_map: " + val);
							}
							else if (cur_track_type==AUDIO_TRACK_TYPE) {
								acodec = acodec_id_map[val];
								if (!acodec) return cerr("The codec name was not found in acodec_id_map: " + val);
							}
						}
						else cur_codec = val;
					}
					else if (name == "CodecPrivate_ID"){
						val = "["+(val.length/2)+" bytes]";
					}
					else if (val.length > 100) val = val.slice(0,100)+"...";
//cwarn("Found TrackEntry_IDs["+i+"]: "+name+" = "+val);
					curpos += ret[0];
					break;
				}
			}//»
			if (!gotid) {
cerr("Did not find a valid id in TrackEntry_IDs @track_num=" + tracknum + " trackentryid_num="+trackentryid_num);
				return;
			}
			trackentryid_num++;
		}//»
		track_num++;
	}//»

}//»

//»

this.parse_init = (buf)=>{//«

	let bufend = buf.length;
	let ret, toend;
	let curpos;
	let tracks_end;

	if (!hexeq(buf, 0, 4, EBML_ID)) return cerr("No EBML marker!");
	curpos = 4;
	ret = ebml_sz(buf, curpos);
	curpos = ret[0] + ret[1];
	if (!hexeq(buf, curpos,4, Segment_ID)) return cerr("No Segment ID!");
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	seg_len = ret[0];
	seg_off = ret[1];
	file_len = seg_off + seg_len;
cwarn("Segment length: " + seg_len);
cwarn("Segment offset: " + seg_off);
cwarn("File length: " + file_len);
	curpos = seg_off;

	if (!hexeq(buf,curpos,4,SeekHead_ID)) return cerr("No SeekHead ID!");
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	curpos = ret[1];

	seek_len = ret[0];
	seek_iter=0;
	toend = curpos + seek_len;
	cues_pos = 0;
	info_pos = 0;
	tracks_pos = 0;

	while (curpos < toend) {//«

		let seek_id_len;
		let gotid;
		let seek_pos_len;
		let gotpos;

		if (!hexeq(buf, curpos,2,Seek_ID)) return cerr("No Seek ID @"+curpos);
		curpos+=2;
		ret = ebml_sz(buf, curpos);
		curpos = ret[1];

		if (!hexeq(buf,curpos,2,SeekID_ID)) return cerr("No SeekID ID @"+curpos);
		curpos+=2;
		ret = ebml_sz(buf, curpos);
		seek_id_len = ret[0];
		curpos = ret[1];
		gotid = gethex(buf,curpos, seek_id_len);
		curpos+=seek_id_len;

		if (!hexeq(buf,curpos,2,SeekPosition_ID)) return cerr("No SeekPosition ID @"+curpos);
		curpos+=2;
		ret = ebml_sz(buf, curpos);
		seek_pos_len = ret[0];
		curpos = ret[1];
		gotpos = gethex(buf, curpos, seek_pos_len);
		if (gotid==Cues_ID) cues_pos = parseInt("0x"+gotpos)+seg_off;
		else if (gotid==Info_ID) info_pos = parseInt("0x"+gotpos)+seg_off;
		else if (gotid==Tracks_ID) tracks_pos = parseInt("0x"+gotpos)+seg_off;
		else if (gotid==Cluster_ID) {
cwarn("Found Cluster position in Seekhead: " + parseInt("0x"+gotpos)+seg_off);
		}
		else if (gotid==Attachments_ID){
cwarn("Found Attachments position in SeekHead: " + parseInt("0x"+gotpos)+seg_off);
		}
		else if (gotid==Chapters_ID){
cwarn("Found Chapters position in SeekHead: " + parseInt("0x"+gotpos)+seg_off);
		}
		else if (gotid==Tags_ID){
cwarn("Found Tags position in SeekHead: " + parseInt("0x"+gotpos)+seg_off);
		}
		else {
cwarn("Got unknown ID in SeekHead: " + gotid + " , position: " + parseInt("0x"+gotpos)+seg_off);
		}
		curpos+=seek_pos_len;
		seek_iter++;
	}//»

	if (!(cues_pos&&info_pos&&tracks_pos)) return cerr("Did not get all positions!");


log("");
cwarn("Info_ID", Info_ID);
cwarn("INFO_POS: " + info_pos);
	curpos = info_pos;
	if (!hexeq(buf,curpos,4,Info_ID)) return cerr("No Info ID @"+curpos);
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	info_len = ret[0];
cwarn("INFO_LEN: " + info_len);

log("");
cwarn("Tracks_ID", Tracks_ID);
cwarn("TRACKS_POS: " + tracks_pos);
	curpos = tracks_pos;
	if (!hexeq(buf,curpos,4,Tracks_ID)) return cerr("No Tracks ID @"+curpos);
	curpos+=4;
	ret = ebml_sz(buf, curpos);
	tracks_len = ret[0];
cwarn("TRACKS_LEN: " + tracks_len);
	tracks_end = tracks_pos + tracks_len;

	if (tracks_end >= bufend)  return cerr("Tracks are out of range of INIT_BUFSZ=" + INIT_BUFSZ);

	parse_tracks(buf.slice(tracks_pos, tracks_end));

log("");
cwarn("Cues_ID", Cues_ID);
cwarn("CUES_POS: " + cues_pos);


	this.cues_pos = cues_pos;

	if (cues_pos >= bufend) {
		timepoints = timemap = null;
cwarn("cues_pos is out of range!");
	}
	else {
		curpos = cues_pos;
		if (!hexeq(buf,curpos,4,Cues_ID)) {
			timepoints = timemap = null;
cerr("No Cues ID @"+curpos);
			return 
		}
		curpos+=4;
		ret = ebml_sz(buf, curpos);
		cues_len = ret[0];
cwarn("CUES_LEN: " + cues_len);
		if (cues_pos + cues_len <= bufend) {
cwarn("Seems okay to parse cues in initial buffer!");
//			parse_cues(buf.slice(cues_pos, cues_pos+cues_len));
			parse_cues(buf.slice(cues_pos));
		}
		else {
			timepoints = timemap = null;
			cwarn("Have cues start but not cues end!!???");
		}
	}
}//»

this.parse_cues = parse_cues;

}//»

const Mp4Parser=function(){//«

/*«

The last 16 bytes in the file are something like:
<----16--->	<---mfro--> <-FlgVr---> <-offset-->
00 00 00 10 6D 66 72 6F 00 00 00 00 00 00 93 FA

This tells how far from the end is the 'mfra' atom, which should have all the information, eg

[mfra] size=8+37874
  [tfra] size=12+18917, version=1
    track_ID = 1
    length_size_of_traf_num = 0
    length_size_of_trun_num = 0
    length_size_of_sample_num = 0
  [tfra] size=12+18917, version=1
    track_ID = 2
    length_size_of_traf_num = 0
    length_size_of_trun_num = 0
    length_size_of_sample_num = 0
  [mfro] size=12+4
    mfra_size = 37882

static int mov_write_mfra_tag(AVIOContext *pb, MOVMuxContext *mov){//«
 int64_t pos = avio_tell(pb);
 int i;
 
 avio_wb32(pb, 0); // size placeholder/
 ffio_wfourcc(pb, "mfra");
 // An empty mfra atom is enough to indicate to the publishing point that
 // the stream has ended.
 if (mov->flags & FF_MOV_FLAG_ISML)
 return update_size(pb, pos);
 
 for (i = 0; i < mov->nb_streams; i++) {
 MOVTrack *track = &mov->tracks[i];
 if (track->nb_frag_info)
 mov_write_tfra_tag(pb, track);
 }
 
 avio_wb32(pb, 16);
 ffio_wfourcc(pb, "mfro");
 avio_wb32(pb, 0); // version + flags
 avio_wb32(pb, avio_tell(pb) + 4 - pos);
 
 return update_size(pb, pos);
}//»
static int mov_write_tfra_tag(AVIOContext *pb, MOVTrack *track) {//«
  int64_t pos = avio_tell(pb);
  int i;

  avio_wb32(pb, 0); //size placeholder
  ffio_wfourcc(pb, "tfra");
  avio_w8(pb, 1); // version 
  avio_wb24(pb, 0);

  avio_wb32(pb, track->track_id);
  avio_wb32(pb, 0); // length of traf/trun/sample num 
  avio_wb32(pb, track->nb_frag_info);
  for (i = 0; i < track->nb_frag_info; i++) {
	  avio_wb64(pb, track->frag_info[i].time);
	  avio_wb64(pb, track->frag_info[i].offset + track->data_offset);
	  avio_w8(pb, 1); // traf number 
	  avio_w8(pb, 1); // trun number 
	  avio_w8(pb, 1); // sample number 
  }

  return update_size(pb, pos);
}//»
static int read_tfra(struct Tracks *tracks, int start_index, AVIOContext *f) {//«
    int ret = AVERROR_EOF, track_id;
    int version, fieldlength, i, j;
    int64_t pos   = avio_tell(f);
    uint32_t size = avio_rb32(f);
    struct Track *track = NULL;

    if (avio_rb32(f) != MKBETAG('t', 'f', 'r', 'a'))
        goto fail;
    version = avio_r8(f);
    avio_rb24(f);
    track_id = avio_rb32(f); //track id
    for (i = start_index; i < tracks->nb_tracks && !track; i++)
        if (tracks->tracks[i]->track_id == track_id)
            track = tracks->tracks[i];
    if (!track) {
 //Ok, continue parsing the next atom
        ret = 0;
        goto fail;
    }
    fieldlength = avio_rb32(f);
    track->chunks  = avio_rb32(f);
    track->offsets = av_mallocz_array(track->chunks, sizeof(*track->offsets));
    if (!track->offsets) {
        ret = AVERROR(ENOMEM);
        goto fail;
    }
    // The duration here is always the difference between consecutive
    // start times.
    for (i = 0; i < track->chunks; i++) {
        if (version == 1) {
            track->offsets[i].time   = avio_rb64(f);
            track->offsets[i].offset = avio_rb64(f);
        } else {
            track->offsets[i].time   = avio_rb32(f);
            track->offsets[i].offset = avio_rb32(f);
        }
        for (j = 0; j < ((fieldlength >> 4) & 3) + 1; j++)
            avio_r8(f);
        for (j = 0; j < ((fieldlength >> 2) & 3) + 1; j++)
            avio_r8(f);
        for (j = 0; j < ((fieldlength >> 0) & 3) + 1; j++)
            avio_r8(f);
        if (i > 0)
            track->offsets[i - 1].duration = track->offsets[i].time -
                                             track->offsets[i - 1].time;
    }
    if (track->chunks > 0) {
        track->offsets[track->chunks - 1].duration = track->offsets[0].time +
                                                     track->duration -
                                                     track->offsets[track->chunks - 1].time;
    }
    // Now try and read the actual durations from the trun sample data.
    for (i = 0; i < track->chunks; i++) {
        int64_t duration = read_moof_duration(f, track->offsets[i].offset);
        if (duration > 0 && abs(duration - track->offsets[i].duration) > 3) {
            // 3 allows for integer duration to drift a few units,
            // e.g., for 1/3 durations
            track->offsets[i].duration = duration;
        }
    }
    if (track->chunks > 0) {
        if (track->offsets[track->chunks - 1].duration <= 0) {
            fprintf(stderr, "Calculated last chunk duration for track %d "
                    "was non-positive (%"PRId64"), probably due to missing "
                    "fragments ", track->track_id,
                    track->offsets[track->chunks - 1].duration);
            if (track->chunks > 1) {
                track->offsets[track->chunks - 1].duration =
                    track->offsets[track->chunks - 2].duration;
            } else {
                track->offsets[track->chunks - 1].duration = 1;
            }
            fprintf(stderr, "corrected to %"PRId64"\n",
                    track->offsets[track->chunks - 1].duration);
            track->duration = track->offsets[track->chunks - 1].time +
                              track->offsets[track->chunks - 1].duration -
                              track->offsets[0].time;
            fprintf(stderr, "Track duration corrected to %"PRId64"\n",
                    track->duration);
        }
    }
    ret = 0;

fail:
    avio_seek(f, pos + size, SEEK_SET);
    return ret;
}
//»

»*/

const MP4_VIDEO_TRACK_ID = 1;
const MP4_AUDIO_TRACK_ID = 2;
let video_timescale;
let audio_timescale;
let duration_secs;
let duration_mins;
let duration_hrs;
let video_height, video_width;


const parse_atom_head=(buf, offset, if_test)=>{//«
	let err=(str)=>{if (!if_test) cerr(str);}
	if (buf.length < offset+8) return err("parse_atom_head() Not enough in this buffer 1");
	let size = read_4byte_int(buf, offset);
	let type = hex2text(gethex(buf, offset+4, 4));
	let start = 8;
	if (size===0) return err("parse_atom_head(): Got condition size===0... this atom goes to the end of the file!!!");
	else if (size === 1) {
		if (buf.length < offset+16) return err("parse_atom_head() Not enough in this buffer 2");
		size = read_8byte_int(buf, offset+8);
		start = 16;
	}
	return {
		size: size,
		type: type,
		start: start
	}
}//»
const get_atom_defs=(buf, pos, len)=>{//«
	let wrn=(s)=>{cwarn("scan_atoms(): "+s)}
	let ret;
	let curpos = pos;
	let totlen = 0;
	let arr = [];
	ret = parse_atom_head(buf, curpos);
	while (ret) {
//wrn("Found atom: " + ret.type);
		arr.push({type: ret.type, pos: curpos, sz: ret.size});
		curpos += ret.size;
		totlen += ret.size;
		if (totlen >= len) return arr;
//		if (totlen >= len) return wrn("Stopping @ totlen="+totlen+"  >=  " + len);
		ret = parse_atom_head(buf, curpos);
	}
	return arr;
}//»

const parse_mvhd=(buf, pos, sz)=>{//«

/*//«
atom_sz             0/4
type='mvhd'         4/4
ver/flags           8/4
creationTime;       12/4
modificationTime;   16/4
timeScale;          20/4
duration;           24/4
preferredRate;      28/4
preferredVolume;    32/2
reserved1           34/10
matrix;             44/36
previewTime;        80/4
previewDuration;    84/4
posterTime;         88/4
selectionTime;      92/4
selectionDuration;  96/4
currentTime;        100/4
nextTrackID;        104/4
»*/

if (sz!=108) return cerr("Invalid size for 'mvhd' atom: sz="+sz + " != 108");
if (pos+sz >= buf.length) return cerr("This buffer does not contain the entire 'mvhd' atom!");

cwarn("parse_mvhd():");
cwrn("timescale",read_4byte_int(buf, pos+20));
cwrn("duration",read_4byte_int(buf, pos+24));
/*
mvhd_timescale = read_4byte_int(buf, pos+20);
mvhd_duration = read_4byte_int(buf, pos+24);

if (!(mvhd_timescale && mvhd_duration)) return cerr("mvhd: Could not find timescale and duration");

duration_secs = mvhd_duration / mvhd_timescale;
duration_mins = Math.floor(duration_secs / 60);
if (duration_mins < 10) duration_mins = "0"+duration_mins;
duration_hrs = Math.floor(duration_mins / 60);

cwarn("mvhd duration: " + duration_hrs + ":"+duration_mins+":"+(duration_secs%60).toFixed(2));
*/

}//»

const parse_trak=(buf, pos, sz)=>{//«
	const TKHD_SZ = 92; 
	const MDHD_SZ = 32;
	const VMHD_SIZE=20;
	const SMHD_SIZE=16;
	let err=(s)=>{cerr("parse_trak(): "+s)}
	let wrn=(s)=>{cwarn("parse_trak(): "+s)}
	let curpos, ret;
	let mdia_defs, minf_defs, stbl_defs;
	let num_stsd_ents, num_stts_ents, num_stss_ents, num_stsc_ents, num_stco_ents;
	let sample_counts=[], sample_durations=[];
	let sync_samples = null;
	let sample_to_chunks=[];
	let chunk_offsets=[];
	let trak_def = {};
	let is_video=false;
	if (pos+sz >= buf.length) return cerr("This buffer does not contain the entire 'trak' atom!");
	curpos = pos+8;
	ret = parse_atom_head(buf, curpos);
	if (!(ret && ret.type == "tkhd" && ret.size == TKHD_SZ)) return err("Expected 'tkhd' type atom as first in 'trak'");
	trak_def.id = read_4byte_int(buf, curpos+20);
	ret = read_2byte_int(buf, curpos+84);
	if (ret) trak_def.width = ret;
	ret = read_2byte_int(buf, curpos+88);
	if (ret) trak_def.height = ret;
	curpos += TKHD_SZ;
	ret = parse_atom_head(buf, curpos);
	if (!ret) return cerr("dsjahJK");
	if (ret.type=="edts"){
cwarn("Skipping atom type=edts");
		curpos+=ret.size;
		ret = parse_atom_head(buf, curpos);
		if (!ret) return cerr("YUIn,m");
	}
	if (ret.type != "mdia")return err("Expected 'mdia' atom");
	curpos += ret.start;
//	mdia_defs = get_atom_defs(buf, curpos, ret.size-8);
	ret = parse_atom_head(buf, curpos);
	if (!(ret&&ret.type=="mdhd"&&ret.size==MDHD_SZ)) return err("Expected 'mdhd' atom");
	trak_def.timescale = read_4byte_int(buf, curpos+20);
	trak_def.duration = read_4byte_int(buf, curpos+24);
	trak_def.duration_secs = trak_def.duration/trak_def.timescale;
	curpos += ret.size;
	ret = parse_atom_head(buf, curpos);
	if (!(ret&&ret.type=="hdlr")) return err("Expected 'hdlr' atom");
	trak_def.type = hex2text(gethex(buf, curpos+16, 4));
	trak_def.name = hex2text(gethex(buf, curpos+32, ret.size-32));
	curpos += ret.size;
	ret = parse_atom_head(buf, curpos);
	if (!(ret&&ret.type=="minf")) return err("Expected 'minf' atom");
//	minf_defs = get_atom_defs(buf, curpos+ret.start, ret.size-8);
//jlog(minf_defs);
	curpos += ret.start;
	ret = parse_atom_head(buf, curpos);
	if (!ret) return err("GjskTGS");
cwarn("Doing trak type: " + trak_def.type);
	if (trak_def.type=="vide"){
		if (!(ret.type=="vmhd"&&ret.size==VMHD_SIZE)) return err("For 'vide' trak_type, expected atom 'vmhd', got '"+ret.type+"'");
		is_video = true;
		curpos += VMHD_SIZE;
		ret = parse_atom_head(buf, curpos);
	}
	else if (trak_def.type=="soun"){
		if (!(ret.type=="smhd"&&ret.size==SMHD_SIZE)) return err("For 'soun' trak_type, expected atom 'smhd', got '"+ret.type+"'");
		curpos += SMHD_SIZE;
		ret = parse_atom_head(buf, curpos);
	}
	else return wrn("Skipping: 'trak_def.type="+trak_def.type+"'  ('"+ret.type+"')");

	if (is_video) video_timescale = trak_def.timescale;
	else audio_timescale = trak_def.timescale;

	if (!(ret&&ret.type=='dinf')) return err("Expected 'dinf' atom!");
	curpos += ret.size;
	ret = parse_atom_head(buf, curpos);
	if (!(ret&&ret.type=='stbl')) return err("Expected 'stbl' atom!");
	stbl_defs = get_atom_defs(buf, curpos+ret.start, ret.size-8);
	curpos += ret.start;
	ret = parse_atom_head(buf, curpos);
	if (!(ret&&ret.type=='stsd')) return err("Expected 'stsd' atom");

/*stsd«
Sample Description Atom    Bytes 
Atom size                   4
Type='stsd'                 4
Version/Flags               4
Number of entries           4
Sample Description Table    Var

General Structure of a Sample Description
While the exact format of the sample description varies by media type, the first four fields 
of every sample description are the same.

Sample description size
A 32-bit integer indicating the number of bytes in the sample description.

Important: When parsing sample descriptions in the 'stsd' atom, be aware of the
sample description size value in order to read each table entry correctly. Some sample 
descriptions terminate with four zero bytes that are not otherwise indicated.

Data format
A 32-bit integer indicating the format of the stored data. This depends on the media type, but is 
usually either the compression format or the media type.

Reserved
Six bytes that must be set to 0.

Data reference index
A 16-bit integer that contains the index of the data reference to use to retrieve data associated 
with samples that use this sample description. Data references are stored in data reference atoms.

These four fields may be followed by additional data specific to the media type and data format. 
See Media Data Atom Types for additional details regarding specific media types and media formats.


»*/

/*Mp4 Codecs«

H.264 Baseline: avc1.42E0xx, where xx is the AVC level
H.264 Main: avc1.4D40xx, where xx is the AVC level
H.264 High: avc1.6400xx, where xx is the AVC level
MPEG-4 Visual Simple Profile Level 0: mp4v.20.9
MPEG-4 Visual Advanced Simple Profile Level 0: mp4v.20.240

video/mp4; codecs="avc1.42E01E, mp4a.40.2"
video/mp4; codecs="avc1.58A01E, mp4a.40.2"
video/mp4; codecs="avc1.4D401E, mp4a.40.2"
video/mp4; codecs="avc1.64001E, mp4a.40.2"

video/mp4; codecs="mp4v.20.8,   mp4a.40.2"
video/mp4; codecs="mp4v.20.240, mp4a.40.2"

»*/

curpos+=12;
num_stsd_ents = read_4byte_int(buf, curpos);
curpos+=4;
for (let i=0; i < num_stsd_ents; i++){
	let sz = read_4byte_int(buf, curpos);
	let dat_ref_idx = read_2byte_int(buf, curpos+10);
	let xbytes = sz - 16;
	let fmt = hex2text(gethex(buf, curpos+4, 4));
	if (fmt==="avc1") {
		if (xbytes < 82) return cerr("Expected a longer fmt=avc1 sample description entry");
		let avcC_str = hex2text(gethex(buf, curpos+16+74, 4));
		if (avcC_str !== "avcC") return cerr("Expected the string 'avcC', got: " + avcC_hex);
		let AVCProfileIndication = gethex(buf, curpos+16+79,1);
		let profile_compatibility = gethex(buf, curpos+16+80,1);
		let AVCLevelIndication = gethex(buf, curpos+16+81,1);
		vcodec=fmt+"."+AVCProfileIndication+profile_compatibility+AVCLevelIndication;
	}
	else if (fmt==="mp4a") {
		acodec = "mp4a.40.2"
cwarn("Assuming acodec mp4a => mp4a.40.2");
	}
	//At the 78th byte into the dat, should start the string "avcC", skip 1 byte, then use the hex string of the next 3 byte
//cwarn("stsd["+i+"]:  sz="+sz+"  fmt=" + fmt + "  dat_ref_idx="+dat_ref_idx+"  xbytes="+xbytes);
	curpos+=sz;
}

return trak_def;

};//»
const parse_moov=(buf, pos, sz)=>{//«
//cwarn("parse_moov():");
let ret;
let atom_defs = get_atom_defs(buf, pos+8, sz-8);

for (let def of atom_defs) {
	if (def.type=="trak") {
		ret = parse_trak(buf, def.pos, def.sz);
		if (!ret) return cerr("sjyBNsh");
		if (ret.height && ret.width) {
			video_height = ret.height;
			video_width = ret.width;
		}
	}
	else if (def.type=="mvhd") {
		parse_mvhd(buf, def.pos, def.sz);
	}
	else {
cwarn("Got type: " + def.type);
	}
}

}//»
const parse_mfra=(buf, pos, sz)=>{//«
	let err=(s)=>{//«
		timepoints=timemap=null;
		cerr("parse_mfra(): " + s);
	}//»
	cwarn("parse_mfra():");
	let ret, curpos;
	curpos = pos+8;
	let mfra_defs = get_atom_defs(buf, curpos, sz-8);
//jlog(mfra_defs);
	if (mfra_defs.length < 2) return err("Yoinkity gafun");

	let mfro_def = mfra_defs.pop();
	if (!mfro_def.type=="mfro") return err("Expected 'mfro' atom!");
	timepoints=[];
	timemap={};
	for (let tfra of mfra_defs){
		if (tfra.type!=="tfra") return err("Expected 'tfra' atom header");
		curpos = tfra.pos;
		let id = read_4byte_int(buf, curpos+12);
		let len = read_4byte_int(buf, curpos+16);
		let nb_frag_info = read_4byte_int(buf, curpos+20);
//cwarn("tfra_id", id, "len", len, "nb_frag_info", nb_frag_info);
		let use_timescale;
		if (id === MP4_VIDEO_TRACK_ID) {
			use_timescale = video_timescale;
//cwrn("VIDEO TIMESCALE", use_timescale);
		}
		else if (id === MP4_AUDIO_TRACK_ID) {
			if (mfra_defs.length>1) continue;
			use_timescale = audio_timescale;
		}
		else {
			cwarn("Unknown id in 'tfra:'");
			continue;
		}
		curpos += 24;
//log("nb_frag_info", nb_frag_info);
		for (let i = 0; i < nb_frag_info; i++) {
			let time = read_8byte_int(buf, curpos);
			let offset = read_8byte_int(buf, curpos+8);
			let trafnum = read_1byte_int(buf, curpos+16); 
			let trunnum = read_1byte_int(buf, curpos+17); 
			let sampnum = read_1byte_int(buf, curpos+18); 
			curpos+=19;
/*
Now we can load up the:
let timepoints = [];
let timemap = {};
*/
			let tm = Math.floor(1000*(time/use_timescale));
			timepoints.push(tm);
			timemap[""+tm]=offset;
		}
		if (timepoints&&timepoints.length) {
//log("NEXT TO LAST TIME-: " + (timepoints[timepoints.length-2]));
log("LAST TIME: ",(timepoints[timepoints.length-1]));
log("TIMESCALE",use_timescale);
			duration = timepoints[timepoints.length-1];
		}

	}

}
this.parse_mfra = parse_mfra;
//»

this.parse_init = (buf)=>{//«
timepoints=timemap=null;
let buflen = buf.length;

log("");
log("Parsing mp4...");

let ret;
let curpos;

curpos = 0;
ret = parse_atom_head(buf, curpos);

if (!(ret&&ret.type==="ftyp")) return cerr("parse_atom_head() 'ftyp' atom not found");

cwarn("ftyp: <"+arr2text(buf.slice(ret.start, ret.size))+">");

curpos = ret.size;

ret = parse_atom_head(buf, curpos, true);
while (ret) {
	let typ = ret.type;
	let lastpos = curpos;
	curpos += ret.size;
	if (typ=="free"||typ=="mdat"||typ=="moof"){}
	else if (typ=="moov"){
		if (curpos > buflen) return cerr("moov: Not contained in initial buffer: curpos="+curpos + "  >  buflen=" +buflen);
		parse_moov(buf, lastpos, ret.size);
	}
	else if (typ=="mfra"){
		if (curpos > buflen) return cerr("mfra: Not contained in initial buffer: curpos="+curpos + "  >  buflen=" +buflen);
		parse_mfra(buf, lastpos, ret.size);
	}
	else return cerr("Got unknown top-level atom type: "+typ);
	ret = parse_atom_head(buf, curpos, true);
}

if (!(video_width && video_height)) cwarn("Got no video dimensions!");
else cwarn("Video dimensions: "+video_width+"x"+video_height);

}//»

}//»

ext_to_parser = {
	"webm": WebmParser,
	"mp4": Mp4Parser
}

//»

//Funcs«

const resize=()=>{//«
	if (!(vid&&meddiv)) return;
	var h = main.clientHeight;
	var w = main.clientWidth;
	if (vid.videoHeight <= h && vid.videoWidth <= w){
			vid.height = vid.videoHeight;
			vid.width = vid.videoWidth;
	}
	else {
		if (h*VIDEO_ASPECT > w) {
			vid.width = w;
			vid.height = w/VIDEO_ASPECT;
		}
		else {
			vid.height = h;
			vid.width = h*VIDEO_ASPECT;
		}
//		if (vid.videoHeight > main.clientHeight)vid.height = main.clientHeight;
//		else if (vid.videoWidth > main.clientWidth)vid.width = main.clientWidth;
	}

	center(meddiv, topwin);
}
this.resize=resize;//»

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
//let arr = raw.split
		for (let i=0; i < raw.length; i+=2) ret_str += raw[i]+raw[i+1]+" ";
	}
//return raw;
	return ret_str;
}//»
const read_1byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 1));}
const read_2byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 2));}
const read_4byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 4));}
const read_8byte_int=(bufarg, offset)=>{return parseInt("0x"+gethex(bufarg, offset, 8));}
//function read_4byte_float(bufarg, offset){return parseFloat("0x"+gethex(bufarg, offset, 4));}


const set_media=(elem)=>{//«
	meddiv = make('div');
	meddiv.pos = "absolute";
	main.add(meddiv);
	vid = elem;
	elem.attset("controls", "true");
	meddiv.add(elem);
	main.add(meddiv);
	resize();
}//»

const check_ret_error=(bufarg, errret)=>{//«
	if (!bufarg) {
		if (errret) {
			if (errret.MESS) poperr(errret.MESS);
			else if (errret.STAT) poperr("Status: " + errret.STAT);
			else poperr("???");
		}
		else poperr("Nothing returned at init!");
		return true;
	}
	if (!(bufarg instanceof ArrayBuffer)){
log(bufarg);
		poperr("What the hell did we get if not ArrayBuffer at init?");
		return true;
	}
	return false;
}//»

const getbuf=(endtime)=>{//«
	if (buffer_refill_in_progress) return;
if (endtime == last_endtime){
//cwarn("Looks like the end!!!");
return;
}
	buffer_refill_in_progress = true;
	var getpos1=null;
	var getpos2=null;
	for (let i=0; i < timepoints.length-2; i++) {
		if (endtime >= timepoints[i] && endtime <= timepoints[i+1]) {
//			getpos1 = timemap[timepoints[i]];
//			getpos2 = timemap[timepoints[i+2]];
			getpos1 = timemap[timepoints[i]];
			getpos2 = timemap[timepoints[i+10]];
			break;
		}
	}
	if (!getpos1){
		getpos1 = timemap[timepoints[timepoints.length-1]];
		getpos2 = "end";
		did_get_end = true;
	}

	if ((typeof getpos1 == "number") && (typeof getpos2 == "number")){
cwarn("Getting: " + (getpos2 - getpos1));
	}
	else {
cwarn("Get rest!");
	}

	if (!getpos2) getpos2 = "end";

	xget(file_url+"&range="+getpos1+"-"+(getpos2), function(bufarg, errret) {//«
		if (!bufarg) {
			if (errret) {
				if (errret.MESS) poperr(errret.MESS);
				else if (errret.STAT) poperr("Status: " + errret.STAT);
				else poperr("???");
			}
			else poperr("Nothing returned at time: " + endtime);
			return;
		}
		if (!(bufarg instanceof ArrayBuffer)){
log(bufarg);
			poperr("What the hell did we get if not ArrayBuffer at time: "+endtime);
			return;
		}
//var arr = new Uint8Array(bufarg);
//log("0x"+arr[0].toString(16)+arr[1].toString(16)+arr[2].toString(16)+arr[3].toString(16));
		srcbuf.appendBuffer(bufarg);
		last_endtime = endtime;
		buffer_refill_in_progress = false;
	});//»

}//»

const check_buffer=(buffered, ctime, if_seek)=>{//«
	var buflen = buffered.length;
	let gotnow = Math.floor(ctime * 1000);
	if (buflen) {
		for (let i=0; i < buflen; i++) {
			let gotstart = Math.floor(buffered.start(i)*1000);
			let gotend = Math.floor(buffered.end(i)*1000);
//			if (!buffer_refill_in_progress && (gotnow > gotstart) && (gotnow < gotend) && ((gotend - gotnow) < 2000)) {
			if (!buffer_refill_in_progress && (gotnow > gotstart) && (gotnow < gotend) && ((gotend - gotnow) < MS_LOOKAHEAD)) {
				getbuf(gotend);
				break;
			}
		}
	}
	if (if_seek) getbuf(gotnow);
//log("FALLTHROUGH: " + buffer_refill_in_progress);
}//»

const init_stream_handlers=()=>{//«

	vid.ontimeupdate = function(e) {//«
		check_buffer(this.buffered, this.currentTime);
	}//»
	vid.onseeking = function(e) {//«
		var ctime = this.currentTime;
		if (sleep_timer) {
			clearTimeout(sleep_timer);
		}
		var buffered = this.buffered;
		sleep_timer = setTimeout(_=>{
			sleep_timer = null;
			check_buffer(buffered, ctime, true);
		}, MIN_SEEK_DIFF);
	}//»
	vid.onstalled = function(e) {//«
		var ctime = this.currentTime;
		if (!vid.didplay && ctime===0) {
			meddiv.tcol="red";
			meddiv.innerHTML="Stalled.";
		}
		else if (vid.didplay&&!vid.paused) {
cwarn("STALLED: "+ctime);
		}
	}//»

vid.onmousedown=e=>{
let r = vid.gbcr();
//log(r);
//log(vid.duration);
//let secs = duration_secs*((e.clientX-r.x)/r.width);
//log(secs);
};

cwarn("Starting streaming!");

}//»

const get_file_range=(start, end)=>{
//cwarn(start, end);
	return new Promise(async(y,n)=>{
		if (file_url){
			xget(file_url+"&range="+start+"-"+end, (bufret, errret)=>{
				if (check_ret_error(bufret, errret)) return y();
				y(bufret);
			});
		}
		else if (file_path){
			let rv = await fsapi.readFile(file_path,{start:start,end:end, binary:true});
			if (rv instanceof Uint8Array) return y(rv.buffer);
			return y();
		}
	});
};

const even_out_buffers_and_start_streaming=async(cb)=>{//«
	let byte2=null;
	for (let tp of timepoints) {
		if (timemap[tp]>INIT_BUFSZ){
			byte2=timemap[tp];
			break;
		}
	}
	if (!byte2) return cwarn("Got no next byte after: " + INIT_BUFSZ + ", nothing to do!");
	let bufret3 = await get_file_range(INIT_BUFSZ, byte2);
//	xget(file_url+"&range="+INIT_BUFSZ+"-"+byte2, function(bufret3, errret3) {//«
//	if (check_ret_error(bufret3, errret3)) return;
	srcbuf.appendBuffer(bufret3);
//	if (cb) cb(init_stream_handlers);
	if (cb) {
		let doupdate=()=>{
			cb();
			srcbuf.onupdate = null;
		}
		srcbuf.onupdate = doupdate;
	}
	else init_stream_handlers();
//	});//»
}//»

const init_streaming=async()=>{//«
let fatal = (s)=>{
	meddiv.tcol="red";
	meddiv.innerHTML="Aborted.";
	poperr(s);
}

let parser_obj = ext_to_parser[file_ext];
if (!parser_obj){
	err("No parser found for ext="+file_ext);
	return;
}
	let parser = new parser_obj();


//xget(file_url+"&range=0-"+INIT_BUFSZ, function(bufret, errret) {//«

//	if (check_ret_error(bufret, errret)) return;
	let bufret = await get_file_range(0,INIT_BUFSZ);
	if (!bufret) return;
	parser.parse_init(new Uint8Array(bufret));

	vid.src = URL.createObjectURL(msrc);

	msrc.addEventListener("error", function(e) {//«
log("MEDIASOURCE ERROR");
cerr(e);
	});//»

	msrc.addEventListener("sourceopen", async function() {//«
		if (vid instanceof HTMLVideoElement) {
//			if (!(acodec&&vcodec)) return cerr("Could not find both codecs (acodec="+acodec+", vcodec="+vcodec+")")
//			let str="video/"+file_ext;
			if (!vcodec) return fatal("Could not find video codec")
cwarn("vcodec="+vcodec);
			if (acodec) srcbuf = msrc.addSourceBuffer('video/'+file_ext+'; codecs="'+vcodec+', '+acodec+'"');
			else srcbuf = msrc.addSourceBuffer('video/'+file_ext+'; codecs="'+vcodec+'"');

		}
		else {
			if (!acodec) return fatal("Could not find audio codec")
			srcbuf = msrc.addSourceBuffer('audio/'+file_ext+'; codecs="'+acodec+'"');
		}
//log(bufret);

//cwarn("*******   Returning from init_streaming!!!   ********");
//return;

		srcbuf.appendBuffer(bufret);
//log(timepoints, timemap);
		if (!(timepoints && timemap)){//«
//This is a webm idea...
			if (file_ext==="webm") {//«
				if (!parser.cues_pos) return poperr("parser.cues_pos NOT FOUND");
cwarn("Requesting webm cues...");
				let bufret2 = await get_file_range(parser.cues_pos, (parser.cues_pos+INIT_BUFSZ));
				if (!bufret2) return;
//				xget(file_url+"&range="+parser.cues_pos+"-"+(parser.cues_pos+INIT_BUFSZ), function(bufret2, errret2) {//«
//				if (check_ret_error(bufret2, errret2)) return;
				parser.parse_cues(new Uint8Array(bufret2));
				if (!(timepoints && timemap)) return poperr("parser.parse_cues returned no timepoints && timemap!");
				if (!timepoints.length) return poperr("Got no timepoints!");
//				Need to find the cluster that INIT_BUFSZ is in, and get the rest of it
//				srcbuf.appendBuffer(bufret2);
				even_out_buffers_and_start_streaming();
//				});//»
			}//»
			else if (file_ext==="mp4") {//«
cwarn("Requesting mp4 mfra...");
				xget(file_url+"&getmfra=1", function(bufret2, errret2) {//«
					if (check_ret_error(bufret2, errret2)) return;
					let mfra = new Uint8Array(bufret2);
//log(mfra.slice(mfra.length-16));
					parser.parse_mfra(mfra, 0, mfra.length);
					if (!(timepoints && timemap)) return poperr("parser.parse_mfra returned no timepoints && timemap!");
					if (!timepoints.length) return poperr("parse_mfra returned no timepoints!");
					even_out_buffers_and_start_streaming(()=>{
						srcbuf.appendBuffer(bufret2);
						init_stream_handlers();
					});
				});//»
			}//»
		}//»
		else {
			if (!timepoints.length){
				poperr("No timepoints.length!!!");
				return;
			}
			even_out_buffers_and_start_streaming();
		}

	});//»

//});//»

}//»

const doget=(start, end)=>{

};
const init=(path)=>{//«
//	file_url = url;

	let marr;
	if (marr=path.match(/(webm|mp4)$/)) vid = make('video');
	else if (marr=path.match(/(wav|ogg|mp3|m4a)$/)) vid = make('audio');
	else return poperr("Unknown file type: " + path);
	file_ext = marr[1];
	if (file_ext!="webm") return poperr("Only handling 'webm' streaming!");
	meddiv = make('div');
	meddiv.pos="absolute";
	meddiv.fs=42;
	meddiv.innerHTML="Loading...";
	meddiv.tcol="#ccc";
	main.add(meddiv);
//	vid.dis="none";
	vid.attset("controls", "true");
	main.add(meddiv);
	resize();
	vid.didplay = false;

	vid.onerror = function(e) {//«
log("Caught: vid.error: " + this.currentTime);
cerr(this.error.message);
	}//»
	vid.oncanplay=()=>{//«
		if (!vid.didplay) {
			vid.didplay = true;
//log("VIDEO DIMS: "+vid.videoWidth+"x"+vid.videoHeight);
			VIDEO_ASPECT = vid.videoWidth/vid.videoHeight;
			meddiv.innerHTML="";
			meddiv.add(vid);
			resize();
			vid.play();
		}
	}//»

//	if (url.match(/^https?:\/\//)) init_streaming();
//	else if (url.match(/^filesystem:/)) vid._src = url;
//	else poperr("Unknown URL scheme: " + url);

	init_streaming();

}//»
const load_blob = blob=>{

	let  vid = make('video');
	this.video = vid;
	Main.add(vid);
	Main.over="scroll";
	vid.src=URL.createObjectURL(blob);
	vid.controls=true;

};
const load_file=async(path)=>{

if (!path.match(/^\//)) {
poperr("Invalid path arg!");
	return;
}
let node = await fsapi.pathToNode(path);
if (!node){
poperr(`File not found:\x20(${path})`);
return;
}
let rtyp = node.root.TYPE;
if (rtyp=="local"){
file_url = Core.loc_url(path);
init(file_url);
}
else if (rtyp=="fs"){
let fspath = Core.fs_url(path);
let  vid = make('video');
this.video = vid;
Main.add(vid);
Main.over="scroll";
vid.src=fspath;
vid.controls=true;
}
else{
return poperr("Unsupported fs type: "+rtyp);
}

};

//»

//CB«

this.set_elem=(elem)=>{//«
	main.innerHTML="";
	set_media(elem);
}//»
this.onloadfile = function(path) {//«
log(path);
//load_file(path);
/*
	if (obj) {
		if (obj.URL) load_url(obj.URL);
//		else if (obj.STREAM) Streamer(obj.STREAM);
		else if (obj.AUD instanceof HTMLAudioElement) {
			set_media(obj.AUD);
//			obj.AUD.attset("controls", "true");
			obj.AUD.play();
		}
		else {
else if (obj instanceof Uint8Array) console.warn("WE SHOULD NOT BE TAKING BYTES HERE, ONLY URL's!!! SO CHANGE THE WAY DESKTOP FEEDS STUFF INTO US!!!");
log("WHAT IN MediaPlayer?");
log(obj);
		}
	}
	else {
	}
*/
}//»
this.onappinit=apparg=>{

noplay = apparg.noplay;
if (apparg.file) load_file(apparg.file);
else if (apparg.blob) load_blob(apparg.blob);

};
this.onkill = function() {//«
	if (vid) {
		vid.pause();
		vid.del();
		vid.ontimeupdate=null;
		vid.onstalled=null;
	}
	if (meddiv) meddiv.del();
}//»
this.onkeydown = function(e,sym) {//«

	if (!vid) return;

	if (sym=="SPACE_") {
		if (vid.paused) vid.play();
		else vid.pause();
	}
	else if (sym=="LEFT_"){
		let newtime = vid.currentTime - small_dt;
		if (newtime < 0) newtime = 0;
		if (vid.paused){
			vid.onseeked=(e)=>{
			vid.onseeked = null;
			setTimeout(()=>{vid.pause();},0);}
		}
		vid.currentTime=newtime;
cwarn(newtime);
	}
	else if (sym=="RIGHT_"){
		let newtime = vid.currentTime + small_dt;
		if (newtime > vid.duration) newtime = vid.duration;
		if (vid.paused){
			vid.onseeked=(e)=>{
			vid.onseeked = null;
			setTimeout(()=>{vid.pause();},0);}
		}
		vid.currentTime=newtime;
//cwarn(newtime);
cwarn(newtime, vid.currentTime);
	}
	else if (sym=="0_") vid.playbackRate = 1.0;
	else if (sym=="UP_C") {
		vid.playbackRate += cur_rate_delta;
log(vid.playbackRate);
	}
	else if (sym=="DOWN_C") {
		vid.playbackRate -= cur_rate_delta;
log(vid.playbackRate);
	}
}//»

//»

//log(fsapi);
//if (!arg.file) return cerr("No 'file' in the arg!");

if (arg&&arg.file) load_file(arg.file);

//load_url(Core.loc_url("/"+arg.file));

}
