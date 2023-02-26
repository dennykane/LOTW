
let SHOW_EMPTY_ICONS = true;
//let SHOW_EMPTY_ICONS = false;

export const app = function(arg) {

const IGen=function(){//«

const ICONS={//«
	Explorer:"\u{1f50d}",
	TextEdit:["\u{1f4dd}",100,76],
	Settings: ["\u2699",100,64],
	Help:["\u2753",100,64],
	Terminal:"\u{1f5b3}",
	Synth:"\u{1f39b}",
	Applications:"\u{1f4dc}"
};//»
//SVG Strings«

let svg_open = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128">';
let rect_beg = '<rect style="fill:';
let rect_end = '" width="128" height="128" x="0" y="0" />';
let svg_close = '</svg>';
let blackrect = '<rect width="128" height="128" x="0"  y="0" style="color:#000;fill:#000;stroke:#aaa;stroke-width:4;" />';
let noapp1 = blackrect + '<text text-anchor="middle" x="64" y="87.34375" xml:space="preserve" style="font-size:72px;font-weight:bold;line-height:125%;letter-spacing:0px;word-spacing:0px;fill:#cc0;stroke:#fff;font-family:Times New Roman;"><tspan y="87.34375">';
let noapp2 = '</tspan></text>';
let fold_back = '<g transform="matrix(2.4716489,0,0,2.4716489,-0.69290156,15.625899)"><path style="fill:#868876;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 4.315197,0.7879925 0,37.8986865 43.902439,0 0,-33.5834895 -22.326454,0 -3.752345,-3.7523452 z" />';
let fold_closed = '<path style="fill:#c0c1ac;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 4.3626238,38.700495 0,-25.278499 12.5731272,0 4.759317,-4.759317 26.392576,0 0,29.853898 z" />';
let fold_open = '<path style="fill:#bcbda7;fill-opacity:1;stroke:#636555;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"  d="m 4.3140235,38.796086 -3.5336837,-11.938809 17.5291782,0 1.655381,-2.207175 31.602731,0 -3.210436,14.246311 z" />';
let closed_folder = svg_open + fold_back + fold_closed + "</g></svg>";
//»

let make_rect=(colarg)=>{return rect_beg+colarg+rect_end;}
const make_appicon_str=(appname, extarg, opts)=>{//«
	if (!opts) opts = {};
	let is_app_folder = opts.APPFOLDER;
	let testlet = null;
	let testlet_col = "black";
	let testlet_op = 1;
	let testlet_x = 64;
	let testlet_y = 100;
	let testlet_sz = 100;
	let marr;
	let subtle_let = false;
	let gotstr, pathstr;
	let icn = ICONS[appname];
	if (icn) {
		let str = svg_open;
		if (isarr(icn)) {
			testlet = icn[0];
			if (icn[1]) testlet_y = icn[1];
			if (icn[2]) testlet_x = icn[2];
			if (icn[3]) testlet_sz = icn[3];
		} else testlet = icn;
		if (appname==="Terminal") str+=make_rect("#fff");
		return `${str}<text text-anchor="middle" x="${testlet_x}" xml:space="preserve" style="fill-opacity:${testlet_op};fill:${testlet_col};font-size:${testlet_sz}px;"><tspan y="${testlet_y}">${testlet}</tspan></text></svg>`;
	}
	if (appname == "Folder") return [(`${svg_open}${fold_back}${fold_closed}"</g></svg>`), (`${svg_open}${fold_back}${fold_open}"</g></svg>`)];
	let arr = appname.split(".");
	let name = arr.pop();
	if (!icn) pathstr = noapp1 + name.slice(0, 2) + noapp2;
	else pathstr = '';
	let str = svg_open;
	str += pathstr;
	if (testlet) str += `<text text-anchor="middle" x="${testlet_x}" xml:space="preserve" style="font-size:${testlet_sz}px;font-style:normal;font-weight:bold;line-height:125%;letter-spacing:0px;word-spacing:0px;fill:${testlet_col};fill-opacity:${testlet_op};stroke:#fff;stroke-width:0px;"><tspan y="${testlet_y}">${testlet}</tspan></text>`;
	str += '</svg>';
	return str;
}//»

this.attach = (obj, cb)=>{//«

let appname = obj.APP.split(".").pop();

return new Promise((Y,N)=>{
	let par = obj.PAR;
	let loadcb = ()=>{
		if (par.onload) par.onload();
		if (cb) cb();
		Y();
	};
	const geturl = str => {
		return URL.createObjectURL(new Blob([str], {
			type: "image/svg+xml;charset=utf-8"
		}));
	}

	let img = new Image();
	img.draggable=false;
	par.add(img);
	par.img = img;
	img.onload = loadcb;
	let ret = make_appicon_str(appname, obj.EXT);
	if (typeof ret === "string") {
		img.src = geturl(ret);
		return;
	}
	let img2 = util.make('img');
	par.add(img2);
	par.img2 = img2;
	img2.src = geturl(ret[1]);
	img.src = geturl(ret[0]);
	img2.dis = "none";
});

}//»

}
const igen = new IGen();
//»

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;
const topwin = Main.top;

const APPOBJ = arg.APPOBJ||{};
const{util,widgets}=globals;
const{isstr, isarr}=util;
const {popyesno}=widgets;
const {mk,mkdv,mksp,configPath}=capi;
const fs = NS.api.fs;
const main = Main;

//»

//Var«

let empty_svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="128" height="128"></svg>';
const is_chrome = arg.ISCHROME;
let config_path;
let default_icon_names=[
"sys.Applications",
"sys.Terminal",
"sys.Explorer",
"sys.TextEdit",
"audio.Synth",
"sys.Help",
"sys.Settings",
"sys.Folder",
"dev.Weird",
//"sys.WWW"
];
let cur_evt;
let context_menu_active=false;
let icon_names;
let CDI=null;
let rect;
let base_rect;
let launcher_is_active=false;
let usebasefs, usefinalfs;
let BASEICONFS=28;
let MAXFS = 128;
let MINFS = 8;
let BASEWIDTH=36;
let use_opacity=0.5;
if (APPOBJ.opacity) use_opacity = APPOBJ.opacity;

if (APPOBJ.baseSize) {
	usebasefs = (APPOBJ.baseSize+"").pi({MAX:MAXFS, MIN: MINFS})
	if (isNaN(usebasefs)) usebasefs = BASEICONFS;
}
else usebasefs = BASEICONFS;
BASEWIDTH=usebasefs;
let SYSICONNAMEFS=17;
//let TRANSDELAY="0.333s";
const INITDELAY=333;
//let MSDELAY=333;
//let MSDELAY=166;
let MSDELAY=250;
let ICONMAXWIDTRANS ="max-width 0."+MSDELAY+"s";
let ICONTRFORMTRANS ="transform 0."+MSDELAY+"s";
let ICONDIMTRANS =`width 0.${MSDELAY}s, height 0.${MSDELAY}s`;

let ICONOPTRANS ="opacity 0.666s";
const BORWID="2";
const BORCOL="#f00";

let TRYMULT = "1.";
let TRYMULTITER=0;
let IFNOSCALE=false;
let DEFMAGSCALE=4.0;
const MAXSCALE=10.0;
let usefinalsc;
let usebasesc=1;
//if (APPOBJ.magScale) {

if (APPOBJ.finalSize && !APPOBJ.magScale){
	APPOBJ.magScale=APPOBJ.finalSize/usebasefs;
}
if (APPOBJ.magScale) {
	usefinalsc = (APPOBJ.magScale+"").pf({MAX:MAXSCALE, MIN: 1})
	if (isNaN(usefinalsc)) usefinalfs = DEFMAGSCALE;
}
else usefinalsc = DEFMAGSCALE;

if (usefinalsc > usebasesc) {
	(()=>{
		let usei,val,lastval;
		let find_the_mult = ()=>{
			for (let i=0; i <= 9; i++){
				TRYMULTITER++;
				if (TRYMULTITER>1000) {
cerr("WHOA INFINITE LOOPER!!!");
					return;
				}
				let mult = TRYMULT+i;
				val = eval(`${usebasesc}*Math.pow(${mult},5)`);
				if (val > usefinalsc) {
					TRYMULT = TRYMULT+(i-1);
					if (TRYMULT.length >= 7) return;
					find_the_mult();
					return;
				}
			}
			TRYMULT = TRYMULT+9;
			if (TRYMULT.length >= 7) return;
			find_the_mult();
		}
		find_the_mult();
	})();
}
else {
	TRYMULT="1.0";
	IFNOSCALE=true;
}

let ICONFSMULT = parseFloat(TRYMULT);
//cwarn("TRYMULT",TRYMULT);
let FS6=usebasesc;
let FS5=FS6*ICONFSMULT;
let FS4=FS5*ICONFSMULT;
let FS3=FS4*ICONFSMULT;
let FS2=FS3*ICONFSMULT;
let FS1=FS2*ICONFSMULT;

//cwarn(ICONFSMULT, parseFloat((FINALICONFS-FS1).toFixed(5)), FS6,FS1);

let FS1_5 = (FS1+FS2)/2;
let FS2_5 = (FS2+FS3)/2;
let FS3_5 = (FS3+FS4)/2;
let FS4_5 = (FS4+FS5)/2;
let FS5_5 = (FS5+FS6)/2;

let FS1_5_diff = FS1 - FS1_5;
let FS2_5_diff = FS2 - FS2_5;
let FS3_5_diff = FS3 - FS3_5;
let FS4_5_diff = FS4 - FS4_5;
let FS5_5_diff = FS5 - FS5_5;

let icon_arr = [];
let icon_arr_left = [];
let icon_arr_right = [];
let num_icons, num_icons_min1, num_icons_min2, num_icons_min3, num_icons_min4, num_icons_min5
//»

//Dom«

main.bgcol="#000";
main.tcol="#ccc";

const body = mkdv();//«
main.add(body);
body.pos="absolute";
body.b=0;
body.w="100%";
body.dis="flex";
body.style.cssText+=`
flex-direction:column;
align-items:center;
`;//»
const sys_foot=mkdv();
sys_foot.dis="flex";
sys_foot.style.cssText+=`
flex: 0 0 auto;
justify-content:space-between;
align-items:flex-end;
`;


body.add(sys_foot);
const sys_foot_center = mkdv();
const sys_foot_left = mkdv();
sys_foot_left.pad=5;
const sys_foot_right = mkdv();
sys_foot_right.pad=5;

sys_foot.add(sys_foot_left);
sys_foot.add(sys_foot_center);
sys_foot.add(sys_foot_right);

sys_foot_center.bgcol="rgba(255,255,255,0.15)";
sys_foot_center.op=0;
sys_foot_center.pad=5;

sys_foot_left.style.cssText+=`
align-items:flex-end;
display:flex;
flex:0 1 auto;
`;
sys_foot_center.style.cssText+=`
align-items:flex-end;
display:flex;
flex:0 1 auto;
`;
sys_foot_right.style.cssText+=`
align-items:flex-end;
display:flex;
flex:0 1 auto;
`;

sys_foot_center.onmouseenter = e => {
return;
	let ret = Desk.get_drag_img();
	if (!(ret && ret.type === "appicon")) return;
	CDI = ret;
	sys_foot_center.style.cursor = "copy";
	sys_foot_center.op=1;
	if (is_chrome) CDI.copyto("Launcher");
};
sys_foot_center.onmouseleave = e => {
return;
	if (Desk.get_drag_img()) sys_foot_center.op=use_opacity;
	sys_foot_center.style.cursor = "";
	if (is_chrome&&CDI) CDI.clear();
	CDI = null;
};


//»

//Obj/CB«
this.click_icon=num=>{
let icn = icon_arr[num-1];
if (icn) {
if (icn.div) icn.div.bor=BORWID+"px solid "+BORCOL;
else icn.bor=BORWID+"px solid "+BORCOL;
    setTimeout(()=>{
if (icn.div) icn.div.bor=BORWID+"px solid transparent";
else icn.bor=BORWID+"px solid transparent";
    },333);
    icn.wrapdiv.click();
}
};
this.kill=()=>{
};
this.key_handler=(sym,e,ispress)=>{
};
//»
//Funcs«

const set_fs=(elem,e)=>{//«
let iter = elem.iter;
let namesp = elem.name_span;
if (launcher_is_active) {
	setTimeout(()=>{
if (elem.div) elem.div.bor=BORWID+"px solid "+BORCOL;
else elem.bor=BORWID+"px solid "+BORCOL;
if (namesp.dis==="none") {
		namesp.dis="block";
		namesp.op=0;
setTimeout(()=>{
		namesp.op=1;
},0);
}
		namesp.x = -(3+(namesp.getBoundingClientRect().width-elem.getBoundingClientRect().width)/2);
	},MSDELAY);
}
if (IFNOSCALE) return;
let rect = elem.getBoundingClientRect();
let l = rect.left;
let r = rect.right;
let c = (l+r)/2;
let w = rect.width;
let w_2 = w/2;
let x = e.clientX;
let dx= x-c;
let is_west = (dx < 0);
let abs_dx = Math.abs(dx);
let per = (w_2-abs_dx)/w_2;
if (per < 0) per= 0;

let fs = FS1_5 + (per*FS1_5_diff);
let near_fs = FS1_5 - (per*FS1_5_diff);
let near_fs_2 = FS2_5 - (per*FS2_5_diff);
let near_fs_3 = FS3_5 - (per*FS3_5_diff);
let near_fs_4 = FS4_5 - (per*FS4_5_diff);

let far_fs = FS2_5 + (per*FS2_5_diff);
let far_fs_2 = FS3_5 + (per*FS3_5_diff);
let far_fs_3 = FS4_5 + (per*FS4_5_diff);
let far_fs_4 = FS5_5 + (per*FS5_5_diff);
(elem.do_scale&&elem.do_scale(BASEWIDTH*fs))||
	(elem.style.maxWidth=(BASEWIDTH*fs)+"px");
//If on west, smaller numbers will get the larger value
//If on east, larger numbers will get the larger value
let diffp = num_icons-iter-1;
let diffm = iter;
let icon_p1=icon_arr[iter+1]||icon_arr_right[0],
	icon_p2=icon_arr[iter+2]||icon_arr_right[1-diffp],
	icon_p3=icon_arr[iter+3]||icon_arr_right[2-diffp],
	icon_p4=icon_arr[iter+4]||icon_arr_right[3-diffp],
	icon_p5=icon_arr[iter+5]||icon_arr_right[4-diffp];
let icon_m1=icon_arr[iter-1]||icon_arr_left[4], 
	icon_m2=icon_arr[iter-2]||icon_arr_left[3+diffm], 
	icon_m3=icon_arr[iter-3]||icon_arr_left[2+diffm], 
	icon_m4=icon_arr[iter-4]||icon_arr_left[1+diffm], 
	icon_m5=icon_arr[iter-5]||icon_arr_left[0+diffm];
if (is_west){
(icon_p1.do_scale&&icon_p1.do_scale(BASEWIDTH*far_fs))||
	(icon_p1.style.maxWidth=BASEWIDTH*far_fs+"px");
(icon_p2.do_scale&&icon_p2.do_scale(BASEWIDTH*far_fs_2))||
	(icon_p2.style.maxWidth=BASEWIDTH*far_fs_2+"px");
(icon_p3.do_scale&&icon_p3.do_scale(BASEWIDTH*far_fs_3))||
	(icon_p3.style.maxWidth=BASEWIDTH*far_fs_3+"px");
(icon_p4.do_scale&&icon_p4.do_scale(BASEWIDTH*far_fs_4))||
	(icon_p4.style.maxWidth=BASEWIDTH*far_fs_4+"px");
(icon_p5.do_scale&&icon_p5.do_scale(BASEWIDTH*usebasesc))||
	(icon_p5.style.maxWidth=BASEWIDTH*usebasesc+"px");

(icon_m1.do_scale&&icon_m1.do_scale(BASEWIDTH*near_fs))||
	(icon_m1.style.maxWidth=BASEWIDTH*near_fs+"px");
(icon_m2.do_scale&&icon_m2.do_scale(BASEWIDTH*near_fs_2))||
	(icon_m2.style.maxWidth=BASEWIDTH*near_fs_2+"px");
(icon_m3.do_scale&&icon_m3.do_scale(BASEWIDTH*near_fs_3))||
	(icon_m3.style.maxWidth=BASEWIDTH*near_fs_3+"px");
(icon_m4.do_scale&&icon_m4.do_scale(BASEWIDTH*near_fs_4))||
	(icon_m4.style.maxWidth=BASEWIDTH*near_fs_4+"px");
(icon_m5.do_scale&&icon_m5.do_scale(BASEWIDTH*usebasesc))||
	(icon_m5.style.maxWidth=BASEWIDTH*usebasesc+"px");
}
else {
(icon_p1.do_scale&&icon_p1.do_scale(BASEWIDTH*near_fs))||
	(icon_p1.style.maxWidth=BASEWIDTH*near_fs+"px");
(icon_p2.do_scale&&icon_p2.do_scale(BASEWIDTH*near_fs_2))||
	(icon_p2.style.maxWidth=BASEWIDTH*near_fs_2+"px");
(icon_p3.do_scale&&icon_p3.do_scale(BASEWIDTH*near_fs_3))||
	(icon_p3.style.maxWidth=BASEWIDTH*near_fs_3+"px");
(icon_p4.do_scale&&icon_p4.do_scale(BASEWIDTH*near_fs_4))||
	(icon_p4.style.maxWidth=BASEWIDTH*near_fs_4+"px");
(icon_p5.do_scale&&icon_p5.do_scale(BASEWIDTH*usebasesc))||
	(icon_p5.style.maxWidth=BASEWIDTH*usebasesc+"px");

(icon_m1.do_scale&&icon_m1.do_scale(BASEWIDTH*far_fs))||
	(icon_m1.style.maxWidth=BASEWIDTH*far_fs+"px");
(icon_m2.do_scale&&icon_m2.do_scale(BASEWIDTH*far_fs_2))||
	(icon_m2.style.maxWidth=BASEWIDTH*far_fs_2+"px");
(icon_m3.do_scale&&icon_m3.do_scale(BASEWIDTH*far_fs_3))||
	(icon_m3.style.maxWidth=BASEWIDTH*far_fs_3+"px");
(icon_m4.do_scale&&icon_m4.do_scale(BASEWIDTH*far_fs_4))||
	(icon_m4.style.maxWidth=BASEWIDTH*far_fs_4+"px");
(icon_m5.do_scale&&icon_m5.do_scale(BASEWIDTH*usebasesc))||
	(icon_m5.style.maxWidth=BASEWIDTH*usebasesc+"px");
}

};//»
const check_active = () => {//«
    for (let dv of icon_arr) {
        if (dv.active) return dv;
    }
    return false;
};//»
const reset_bar=(which)=>{//«
	if (context_menu_active) return;
	for (let d of icon_arr) {
		delete d.active;
		if (d.is_app) d.style.transition=ICONMAXWIDTRANS;
		else {
			d.style.transition=ICONTRFORMTRANS;
			d.div.style.transition=ICONDIMTRANS;
		}
		(d.do_scale&&d.do_scale(BASEWIDTH))||
			(d.style.maxWidth=BASEWIDTH+"px");
		setTimeout(()=>{
			d.name_span.dis="none";
			d.name_span.op=0;
			if (d.div) d.div.bor=BORWID+"px solid transparent";
			else d.bor=BORWID+"px solid transparent";
		},MSDELAY);
	}
	for (let d of icon_arr_left) d.style.maxWidth=BASEWIDTH+"px";
	for (let d of icon_arr_right) d.style.maxWidth=BASEWIDTH+"px";
	
	setTimeout(()=>{
		if (check_active()) return;
		launcher_is_active=false;
		sys_foot_center.op=use_opacity;
	},MSDELAY+10);
};//»
const update_num_icons=inc=>{//«
	num_icons+=inc;
	num_icons_min1 = num_icons-1;
	num_icons_min2 = num_icons-2;
	num_icons_min3 = num_icons-3;
	num_icons_min4 = num_icons-4;
	num_icons_min5 = num_icons-5;
};//»
const add_empty_icon=(where)=>{//«
	let dv = mkdv();
	dv.pos="relative";
	let icondv = mkdv();
	if (SHOW_EMPTY_ICONS) icondv.bgcol="rgba(255,0,0,0.25)";
	let img = new Image();
	img.bor=BORWID+"px solid transparent";
	img.style.maxWidth=BASEWIDTH;
	img.style.transition=ICONMAXWIDTRANS;
	icondv.add(img);
	img.src=URL.createObjectURL(new Blob([empty_svg],{type:"image/svg+xml;charset=utf-8"}));
	dv.add(icondv);
	where.add(dv);
	if (where===sys_foot_left) icon_arr_left.push(img);
	else icon_arr_right.push(img);
};//»
const add_icon=(app_or_win,i)=>{//«

	return new Promise(async(Y,N)=>{
		let wrapdiv=mkdv();
		let dv = mkdv();
		wrapdiv.add(dv);
		wrapdiv.pos="relative";
		let icondv = mkdv();
		let name;
		let is_app=false;
		let img;
		if (isstr(app_or_win)){
			is_app=true;
			name = app_or_win.split(".").pop();
			await igen.attach({PAR:icondv,APP:app_or_win});
//log(icondv, app_or_win);
			img = icondv.img;
			img.style.maxWidth=BASEWIDTH;
			img.style.transition=ICONMAXWIDTRANS;
			img.is_app=true;
			img.bor=BORWID+"px solid transparent";
//			img.div=wrapdiv;
		}
		else{
			name = app_or_win.name;
			icondv.add(app_or_win);
			icondv.img=app_or_win.win;
			img=icondv.img;
			img.style.transition=ICONTRFORMTRANS;
			img.div.style.transition=ICONDIMTRANS;
			img.div.bor=BORWID+"px solid transparent";
		}
const rm_icon=async()=>{
	if (!is_chrome) return;
	let new_names = [];
	let new_arr=[];
	let iter=0;
	for (let icn of icon_arr){
		if (icn===img) dv.del();
		else {
			icn.iter = iter;
			new_arr.push(icn);
			if (icn.is_app) new_names.push(icn.name);
			iter++;
		}
	}
	icon_arr=new_arr;
	update_num_icons(-1);
	await fs.writeHtml5File(config_path,new_names.join("\n"),{ROOT:true});
};
		img.wrapdiv=wrapdiv;
		img.iter=i;
		dv.add(icondv);
		img.wrapdiv=wrapdiv;
		wrapdiv.onclick=e=>{//«
			reset_bar(1);
			if (is_app) Desk.open_app(app_or_win,()=>{});
			else{
				img.unminimize();
				let iter = 0;
				let new_arr=[];
				for (let icn of icon_arr){
					if (icn===img) wrapdiv.del();
					else {
						icn.iter = iter;
						new_arr.push(icn);
						iter++;
					}
				}
				icon_arr=new_arr;
				update_num_icons(-1);
			}
		};//»
		dv.oncontextmenu=e=>{//«
			if (!is_chrome) return;
			if (!is_app) return;
			let elem = Desk.deskcontext({
				x: e.clientX,
				y: e.clientY
			}, {
			items: [`Remove '${name}' from the Launcher`, rm_icon]
/*
			items: [`Remove '${name}' from the Launcher`, ()=>{
				rm_icon(dv,img);
				let new_names = [];
				let new_arr=[];
				let iter=0;
				for (let icn of icon_arr){
					if (icn===img) dv.del();
					else {
						icn.iter = iter;
						new_arr.push(icn);
						if (icn.is_app) new_names.push(icn.name);
						iter++;
					}
				}
				icon_arr=new_arr;
				update_num_icons(-1);
				await fs.writeHtml5File(config_path,new_names.join("\n"),{ROOT:true});
			}]
*/

		});
		context_menu_active = true;
		Desk.desk_menu.kill_cb=()=>{
			context_menu_active = false;
			reset_bar(2);
		};

		};//»
		dv.onmousemove=e=>{//«
			cur_evt=e;
			if(launcher_is_active) set_fs(img,e);
		};//»
		dv.onmouseenter=e=>{//«
			cur_evt=e;
			if (!check_active()) {
				setTimeout(()=>{
					let elem = check_active();
					if (!elem) return;
					launcher_is_active=true;
					sys_foot_center.op=1;
					set_fs(elem,cur_evt);
					setTimeout(()=>{
						if (!check_active()) return;
						for (let im of icon_arr) {
							if (im.is_app) im.style.transition="max-width 0s";
							else {
								im.style.transition="transform 0s";
								im.div.style.transition="width 0s, height 0s";
							}
						}
					},MSDELAY+10);
				},INITDELAY);
			}
			if (launcher_is_active) set_fs(img,e,i);
			img.active=true;
		};//»
		dv.onmouseleave=e=>{//«
			cur_evt=e;
			setTimeout(()=>{
				if (context_menu_active) return;
				delete img.active;
				setTimeout(()=>{
					namesp.dis="none";
					if (img.div) img.div.bor=BORWID+"px solid transparent";
					else img.bor=BORWID+"px solid transparent";
				},MSDELAY);
			},0);
			setTimeout(()=>{
				if (check_active()) return;
				reset_bar(4);
			},10);
		};//»
		dv.onmouseup=async e=>{//«
			if (!CDI) return;
			sys_foot_center.style.cursor = "";
			let app = CDI.app;
			CDI.del();
			CDI = null;
			Desk.clear_drag_img();
			for (let icn of icon_arr) {
				if (icn.name === app) return;
			}
			let r = dv.getBoundingClientRect();
			let is_before = e.clientX<((r.left+r.right)/2);
			await add_icon(app, num_icons);
			let newicon=icon_arr.pop();
			if(is_before){
//				sys_foot_center.insertBefore(newicon.div,wrapdiv);
				sys_foot_center.insertBefore(newicon.wrapdiv,wrapdiv);
				icon_arr.splice(img.iter,0,newicon);
			}
			else if (img.iter < num_icons-1){
//				sys_foot_center.insertBefore(newicon.div,wrapdiv.nextSibling);
				sys_foot_center.insertBefore(newicon.wrapdiv,wrapdiv.nextSibling);
				icon_arr.splice(img.iter+1,0,newicon);
			}
			else icon_arr.push(newicon);
			let names=[];
			for (let i=0; i <icon_arr.length; i++){
				let icn = icon_arr[i];
				icn.iter=i;
				if (icn.is_app) names.push(icn.name);
			}
			update_num_icons(1);
			if (is_chrome) await fs.writeHtml5File(config_path, names.join("\n"), {
				ROOT: true
			});

		};//»
		icon_arr.push(img);
		let namesp = mkdv();//«
		wrapdiv.add(namesp);
		namesp.ta="center";
		namesp.style.minWidth="100%";
		namesp.ff="sans-serif";
		namesp.mart=-(2*SYSICONNAMEFS)+"px";
		namesp.fs=SYSICONNAMEFS;
		namesp.bgcol="#000";
		namesp.fw="bold";
		namesp.style.borderRadius="10px";
		namesp.padb=namesp.padt="3px";
		namesp.padl=namesp.padr="5px";
		namesp.marl=namesp.marr="auto";
		namesp.pos="absolute";
		namesp.loc(-5,0);
		namesp.x=0;
		namesp.dis="none";
		namesp.op=0;
		namesp.style.transition=ICONOPTRANS;
		namesp.innerHTML=name;
		dv.name_span = namesp;
//»
		img.name_span = namesp;
		if (is_app) img.name=app_or_win;
		sys_foot_center.add(wrapdiv);
		if (is_chrome&&is_app) {
			dv.draggable=true;
			dv.ondragstart=e=>{
				e.preventDefault();
				reset_bar();
				popyesno(`Remove '${name}' from the launcher?`,ret=>{
					if (ret) rm_icon();
				});
			};
		}
		Y();
	});

};//»

//»

const init=async()=>{//«

/*«
	config_path = await configPath("desk/launcher.txt");
	let str = await fs.readHtml5File(config_path);
	if (str){
		let arr = str.split("\n");
		for (let i=0; i < arr.length; i++) arr[i]=arr[i].trim();
		icon_names=[];
		for (let nm of arr){
			if (nm) icon_names.push(nm);
		}

	}
	else{
		await fs.writeHtml5File(config_path,default_icon_names.join("\n"),{ROOT:true});
		icon_names = default_icon_names;
	}
»*/

	icon_names = default_icon_names;
	num_icons = icon_names.length;
	num_icons_min1 = num_icons-1;
	num_icons_min2 = num_icons-2;
	num_icons_min3 = num_icons-3;
	num_icons_min4 = num_icons-4;
	num_icons_min5 = num_icons-5;

	for (let i=0; i < 5; i++) add_empty_icon(sys_foot_left);
	for (let i=0; i < num_icons; i++) {
		await add_icon(icon_names[i], i);
		if(i===0) sys_foot_center.op=use_opacity;
	}
	sys_foot_center.style.maxHeight=sys_foot_center.getBoundingClientRect().height;

	for (let i=0; i < 5; i++) add_empty_icon(sys_foot_right);

};//»

init();

/*Old Desktop integration«
this.get_base_size=()=>{
return BASEWIDTH;
};
this.next_loc=()=>{
let r = sys_foot_center.getBoundingClientRect();
return {x:r.right,y:r.top};
};
this.add_window=win=>{
add_icon(win, num_icons);
update_num_icons(1);
};

if (is_chrome) Desk.api.setLauncher(this);
»*/


}

