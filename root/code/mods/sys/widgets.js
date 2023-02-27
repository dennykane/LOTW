
//Var«

export const mod = function(Core) {

const api={};
let Desk=Core.Desk;
const set_desk=arg=>{
	Desk = arg;
};
this.set_desk = set_desk;
api.setDesk = set_desk;
//const {globals}=Core;
//const log=(...args)=>{console.log(...args);}
//const cwarn=(...args)=>{console.warn(...args);}
//const cerr=(...args)=>{console.error(...args);}
const{globals,NS,log,cwarn,cerr}=Core;
const {util}=globals;
const {mk,mksp,mkdv}=util;
//let globals = Core.globals;
let CG_zIndex = 9999999;
let min_win_z = 10;
const MENU_BGCOL="#c0c0c0";
const ACTIVE_MENU_BG = "#006";
const ACTIVE_MENU_FG = "#fff";

const make=x=>{return document.createElement(x);};
const isarr=arg=>{return (arg && typeof arg === "object" && typeof arg.length !== "undefined");}
const now=if_secs=>{var ms=new Date().getTime();if(if_secs)return Math.floor(ms/1000);return ms;}
const center = (elem, usewin) => {
	let usew = winw();
	let useh = winh();
	if (usewin) {
		if (usewin.main) {
			usew = usewin.main.w;
			useh = usewin.main.h;
		} else {
			usew = usewin.offsetWidth;
			useh = usewin.offsetHeight;
		}
	}
	let elemw = elem.offsetWidth;
	let elemh = elem.offsetHeight;
	let usex = (usew / 2) - (elemw / 2);
	let usey = (useh / 2) - (elemh / 2);
	if (usex < 0) usex = 0;
	if (usey < 0) usey = 0;
	elem.x = usex;
	elem.y = usey;
}
//»

//IGen«

const IGen=function() {

function gbid(id) {return document.getElementById(id);}
let log = Core.log;
let globals = Core.globals;
let fs;
let svg_open = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" ';
let noptr = 'pointer-events:none;';
/*//«
const make_dialog_button_str = (which) => {
	let id = Core.api.randStr(3);
	let base_id = id + "_" + which;
	let svg_id = "db_" + base_id;
	let str = svg_open + ' width="92px" height="23px" id="' + svg_id + '">';
	let lg_on_id = 'db_LGON__' + base_id + '';
	let lg_off_id = 'db_LGOFF__' + base_id + '';
	let rg_on_id = 'db_RGON__' + base_id + '';
	let rg_off_id = 'db_RGOFF__' + base_id + '';
	let but_id = "db_BUT_" + base_id;
	let st1_off = "ffffff";
	let st2_off = "dcdcdc";
	let st1_on = "cce9ff";
	let st2_on = "679fff";
	str += '<defs>';
	str += '<linearGradient id="' + lg_on_id + '">';
	str += '<stop style="stop-color:#' + st1_on + ';stop-opacity:1" offset="0" />';
	str += '<stop style="stop-color:#' + st2_on + ';stop-opacity:1" offset="1" />';
	str += '</linearGradient>';
	str += '<linearGradient id="' + lg_off_id + '">';
	str += '<stop style="stop-color:#' + st1_off + ';stop-opacity:1" offset="0" />';
	str += '<stop style="stop-color:#' + st2_off + ';stop-opacity:1" offset="1" />';
	str += '</linearGradient>';
	let rg_end = ' cx="48.43528" cy="-16.264071" r="34.778648" fx="48.43528" fy="-16.264071" gradientUnits="userSpaceOnUse" gradientTransform="matrix(3.9100589,0.00913822,-7.3543269e-4,0.31468071,-143.14782,8.809004)" />';
	str += '<radialGradient id="' + rg_on_id + '" xlink:href="#' + lg_on_id + '"' + rg_end;
	str += '<radialGradient id="' + rg_off_id + '" xlink:href="#' + lg_off_id + '"' + rg_end;
	str += '</defs>';
	str += '<g style="' + noptr + '"><rect id="' + but_id + '" style="fill:url(#' + rg_off_id + ');color:#000000;fill-opacity:1;fill-rule:nonzero;stroke:#000087;stroke-width:0.89999998;stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" width="68.457298" height="19.69697" rx="7.8000002" ry="7.9000001" x="12.421577" y="1.8640296" />';
	str += '<text text-anchor="middle" x="46" y="15.775874" xml:space="preserve" style="font-size:13px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;font-family:Sans;-inkscape-font-specification:Sans">';
	str += '<tspan>' + which + '</tspan></text></g></svg>';
	return [str, svg_id, but_id, rg_on_id, rg_off_id];
};
//»*/
const make_popup_str=(which)=>{let str=svg_open+' width="64px" height="64px">';let alert_yellow='Gold';if(which=="idea"){let lsty_1=' style="fill:none;stroke:#e98f2c;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"';str+='<path d="m 29.559104,44.909254 a 13.539703,13.539703 0 1 1 12.774974,0.122635" transform="translate(-4.5774122,-5.07004)" style="color:#000000;fill:none;stroke:#e98f2c;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" />';str+='<path d="m 31.632996,45.55994 1.5398,-6.173398 0.568182,-7.825476-2.651515,-2.531772-4.734849,0-0.189394,2.992094 2.84091,3.222255 4.545454,-0.230161 2.840909,-4.37306 0,-4.142899-2.462121,-3.682577" style="fill:none;stroke:#e98f2c;stroke-width:1.4;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" />';str+=	'<path d="m 25.407645,39.8604 0,5.871212 12.121212,0 0,-6.060606"'+lsty_1+' />';str+='<path d="M 13.286433,45.731612 19.725827,41.75434"'+lsty_1+' />';str+='<path d="M 14.422796,31.527067 6.6576443,30.958885"'+lsty_1+' />';str+='<path d="M 14.990978,16.75434 11.392493,11.072522"'+lsty_1+' />';str+='<path d="m 24.460675,11.640703 0,-7.575757"'+lsty_1+' />';str+='<path d="M 38.097039,11.640703 39.422796,2.5497945"'+lsty_1+' />';str+='<path d="M 47.566736,15.239188 52.11219,10.314946"'+lsty_1+' />';str+='<path d="m 49.081887,31.148279 7.19697,0.378788"'+lsty_1+' />';str+='<path d="m 43.210675,40.80737 7.386364,5.113636"'+lsty_1+' />';str+='<path d="M 24.460675,51.406327 38.899177,51.005258"'+lsty_1+' />';str+='<path d="M 24.326985,56.794446 38.765487,56.393377"'+lsty_1+' />';str+='<path d="m 35.427806,54.441177 a 1.9385027,4.0775399 0 1 1-3.877005,0 1.9385027,4.0775399 0 1 1 3.877005,0 z" transform="matrix(1,0,0,0.5,-1.3414645,31.023755)" style="color:#000000;fill:#e98f2c;fill-opacity:1;fill-rule:nonzero;stroke:#e98f2c;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" />';}else if(which=="alert"){str+='<path d="M 32.129316,4.1098389 A 1.9399015,1.9399015 0 0 0 30.558815,5.2119455 L 6.6155497,55.137373 a 1.9399015,1.9399015 0 0 0 1.7358178,2.782819 l 49.0437415,0 A 1.9399015,1.9399015 0 0 0 59.130927,55.10982 L 34.03045,5.1843928 a 1.9399015,1.9399015 0 0 0-1.708265,-1.0745539 1.9399015,1.9399015 0 0 0-0.192869,0 z" style="font-size:medium;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-indent:0;text-align:start;text-decoration:none;line-height:normal;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;text-anchor:start;baseline-shift:baseline;color:#000000;fill:'+alert_yellow+';fill-opacity:1;stroke:'+alert_yellow+';stroke-width:3.87899995;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate;font-family:Sans;-inkscape-font-specification:Sans"/>';str+='<g style="font-size:56px;font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Times New Roman">';str+='<path d="m 32.621634,45.333283 c-2.575997,0-4.704,2.184002-4.704,4.704 0,2.687997 2.016003,4.76 4.648,4.76 2.687997,0 4.816,-2.072003 4.816,-4.648 0,-2.631998-2.128003,-4.816-4.76,-4.816 m 0.784,-4.368 c 0.727999,-6.887994 1.232002,-9.632006 2.912,-15.008 0.783999,-2.463998 1.008,-3.584002 1.008,-4.872 0,-3.639997-1.736003,-5.712-4.704,-5.712-3.023997,0-4.76,2.072003-4.76,5.6 0,1.399998 0.224001,2.464002 1.008,4.984 1.623998,5.319994 2.184001,8.120006 2.912,15.008 l 1.624,0"/></g>';}else if(which=="error"){str+='<path d="M 12.826086,22.695652 0.62845029,34.752046-16.521739,34.652173-28.578133,22.454537-28.47826,5.304348-16.280624,-6.7520463 0.86956503,-6.6521733 12.925959,5.5454627 z" transform="matrix(1.349617,0,0,1.349617,42.340122,13.11007)" style="color:#000000;fill:#d42121;fill-opacity:1;fill-rule:nonzero;stroke:#c6c6c6;stroke-width:1.3996563;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate" />';str+='<text x="8.4782629" y="36.608696" xml:space="preserve" style="font-size:13px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Sans;-inkscape-font-specification:Sans">';str+='<tspan x="8.4782629" y="36.608696">ERROR</tspan></text>';}else if(which=="ok"){str+='<defs><filter color-interpolation-filters="sRGB" id="pu_FILTER"><feGaussianBlur stdDeviation="0.77384537" /></filter></defs>';str+='<rect width="58.038403" height="58.038403" rx="8.0885181" ry="8.1922169" x="3.4741683" y="3.2831869" style="color:#000000;fill:#42c129;fill-opacity:1;fill-rule:nonzero;stroke:#000000;stroke-width:1.45200002;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;filter:url(#pu_FILTER);enable-background:accumulate" />';str+='<text x="16.18037" y="47.81963" xml:space="preserve" style="font-size:48px;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Times New Roman;-inkscape-font-specification:\"Times New Roman\"">';str+='<tspan x="15.18037" y="47.81963">&#x2713;</tspan></text>';}str+='</svg>';return [str];};

const ctl_factory = (par, type, subtype, args) => {
	let obj = {};
	let elm, svg_id, pathid, kids;
	if (type == "dialog") {
		svg_id = args[0];
		let but_id = args[1];
		let rg_on_id = args[2];
		let rg_off_id = args[3];
		obj.off = () => {
			try {
				gbid(but_id).style.fill = "url(#" + rg_off_id + ")";
			} catch (e) {}
		};
		obj.on = () => {
			try {
				gbid(but_id).style.fill = "url(#" + rg_on_id + ")";
			} catch (e) {}
		};
	}
	return obj;
};
const attach = (obj) => {
	let parelm = obj['PAR'];
	let type = obj['TYPE'];
	let idarg = obj['ID'];
	let subtype = obj['SUBTYPE'];
	let svgstr, svgelm;
	let retarr;
//	if (type == "dialog") retarr = make_dialog_button_str(subtype, idarg);
//	else if (type == "popup") retarr = make_popup_str(subtype);
	retarr = make_popup_str(subtype);
	parelm.innerHTML = retarr.shift();
	parelm.svgctl = ctl_factory(parelm, type, subtype, retarr);
	return parelm;
};
this.attach = attach;

}

const igen = new IGen();

//»

//Context Menu«

const noop=()=>{};
if (!Desk) {
	Desk = {
		window_on: noop,
		window_off: noop
	};
	this.Desk = Desk
}
const{winw,winh,winx,winy}=Core.api;
const noprop=(e)=>{e.stopPropagation();}
const set_box_shadow=(elm,val)=>{elm.style.webkitBoxShadow=val;elm.style.boxShadow=val;}

const menu_loc_from = (menuobj, item) => {//«
	let type = menuobj.type;
	let parelem = menuobj.parelem;
	let menuelem = menuobj.elem;
	let l, t, r, b;
	let w, h;
	let arr;
	if (type == "desk") {
		r = winw();
		l = menuelem.offsetLeft;
	} else {
		let menurect = menuelem.getBoundingClientRect();
		let parrect = parelem.getBoundingClientRect();
		l = menurect.left;
		r = parrect.right;
	}
	let newx, newy;
	if (item) {
		let r = item.gbcr();
		newy = r.top - 5;
	}
	if (l + 375 < r) newx = menuelem.x + menuelem.offsetWidth;
	else {
		newx = menuelem.x;
		let curelem = menuelem;
		while (curelem) {
			curelem.x -= curelem.offsetWidth;
			curelem = curelem.prevelem;
		}
	}
	return {
		x: newx,
		y: newy
	};
}//»
const ContextMenu=function(elem, loc, type, prevelem, noarg, if_internal) {//«
	let killed = false;
	let _Desk = Desk;
	let self = this;
	let menu = make('div');
	menu.style.userSelect="none";
	menu.className="context_menu";
	menu.bor="2px outset #aaa";
    menu.style.borderRadius="2px";
    menu.bgcol=MENU_BGCOL;
    menu.padt=5;
    menu.padb=2;
    menu.fs=16;
	menu.pos="absolute";
	menu.style.minWidth = 180;
	let usex=loc.x-winx(), usey=loc.y-winy();
	if (if_internal) {
		usex-=8;
		usey-=2;
	}
	if (loc.BREL===true){
		menu.y="";
		menu.b = usey;
	}
	else {
		menu.b="";
		menu.y = usey;
	}
	if (loc.RREL===true) {
		menu.x = "";
		menu.r=usex;
	}
	else{
		menu.r="";
		menu.x = usex;
	}
	let curitem=null;
	let kids = [];

	const check_menu_width = (sp) => {
		let diff = menu.offsetWidth - sp.offsetWidth;
		let mindiff = 57;
		let diffoff = mindiff - diff;
		if (diffoff > 0) sp.marr = diffoff;
	};
	const next_item = () => {
		let kid;
		if (!curitem) kid = kids[0];
		else {
			let pos = kids.indexOf(curitem);
			if (pos < kids.length - 1) kid = kids[pos + 1];
			else kid = kids[0];
		}
		if (kid) kid.on();
	};
	const prev_item = () => {
		let kid;
		if (!curitem) kid = kids[kids.length - 1];
		else {
			let pos = kids.indexOf(curitem);
			if (pos > 0) kid = kids[pos - 1];
			else kid = kids[kids.length - 1];
		}
		if (kid) kid.on();
	};

	this.adjust_y = function() {
		if (type == "desk") {
			let y = 0;
			let winh=window.innerHeight;
			let _h = menu.getBoundingClientRect().height;
			if (menu.y + _h > winh) {
				menu.y = winh - _h;
			}
		} else {
			let menurect = menu.getBoundingClientRect();
			let parrect = elem.getBoundingClientRect();
			let t = menurect.top;
			let b = parrect.bottom;
			if (t + menu.offsetHeight > b) menu.y = elem.offsetHeight - menu.offsetHeight;
		}
	};
	this.kill = function() {
		if (killed) return;
		delete elem.context_menu;
		menu.del();
		if (self == _Desk.desk_menu) {
			if (_Desk.desk_menu.kill_cb) _Desk.desk_menu.kill_cb();
			_Desk.desk_menu = null;
			_Desk.CG.off()
		} 
		killed = true;
		if (self.par) self.par.kill();
		if (self.kid) self.kid.kill();
	};
	this.key_handler = function(sym) {
		if (sym == "UP_") prev_item();
		else if (sym == "DOWN_") next_item();
		else if (sym == "RIGHT_") {
			if (curitem && curitem.is_array) curitem.select();
		} else if (sym == "LEFT_") {
			if (curitem && curitem.menu.par) {
				curitem.menu.par.curitem.on();
				delete curitem.menu.par.kid;
				curitem.menu.elem.del();
			}
		}
	};
	this.select = function() {
		if (curitem) curitem.select();
		else cerr("No curitem!");
	};
	this.scroll_to = num => {
		if (num == 0) {
			kids[0].on();
			return;
		}
		for (let i = 0; i < num; i++) next_item();
	};
	this.add_item = function(name, val) {
		const select = () => {
			if (val instanceof Function) {
				self.kill();
				val();
			} else if (isarr(val)) {
				self.curitem = curitem;
				let olditem = curitem;
				if (curitem) curitem.off();
				let newmenu = new ContextMenu(elem, menu_loc_from(self, olditem), type, menu, null, true);
				newmenu.kill_cb = _Desk.desk_menu.kill_cb;
				_Desk.desk_menu = newmenu;
				for (let i = 0; i < val.length; i += 2) {
					let item = newmenu.add_item(val[i], val[i + 1]);
					if (i == 0) item.on();
				}
				newmenu.par = self;
				self.kid = newmenu;
				newmenu.adjust_y();
			}
		};
		let div = make('div');
		const delete_menus=()=>{//«
			let gotmenu = _Desk.desk_menu || elem.context_menu;
			if (!gotmenu) {
				cerr("No gotmenu???");
				return;
			}
			let gotcur = gotmenu.curitem;
			if (!gotcur) return;
			
			let gotmatch = false;
			let arr = [];
			while (true) {
				try {
					arr.push(gotcur.menu.elem);
					gotcur = gotcur.menu.par.curitem;
				} catch (e) {
					break;
				}
				if (!gotcur) {
					cerr("!!!! Could not find the previous item! !!!!");
					break;
				}
				if (gotcur.menu === div.menu) {
					gotmatch = true;
					break;
				}
			}
			if (!gotmatch) {
				return;
			}
			for (let elm of arr) {
				if (elem.context_menu.par) delete elem.context_menu.par.kid;
				elm.del();
			}
		};//»
		div.menu = self;
		div.marb = 5;
		div.padl = 18;
		div.padr = 15;
		div.padt = 5;
		div.padb = 5;
		div.h="20px";
		div.ff = "sans-serif";
		div.dis = "flex";
		div.style.justifyContent = "space-between";
		div.style.alignItems = "center";
		let namesp = make('sp');
		div.add(namesp);
		div.className= "context_menu_item";
		namesp.className ="context_menu_label";
		menu.add(div);
		if (isarr(val)) {
			div.tcol = "#000";
			namesp.innerHTML = name.tonbsp();
			let sp = make('span');
			sp.ta = "right";
			sp.fs = 12;
			sp.html('&#9654;');
			sp.style.cssFloat = "right";
			div.add(sp);
			div.is_array = true;
			check_menu_width(namesp);
		} else {
			if (val) div.tcol = "#000";
			else {
				div.tcol = "#333";
				div.style.fontStyle="italic";
			}
			let mark = null;
			if (name.match(/\x20*__XMARK__\x20*$/)) {
				name = name.replace(/\x20*__XMARK__\x20*$/, "");
				mark = '&#10007;'
			} else if (name.match(/\x20*__CHECK__\x20*$/)) {
				name = name.replace(/\x20*__CHECK__\x20*$/, "");
				mark = '&#10003;'
			}
			namesp.innerHTML = name.tonbsp();
			check_menu_width(namesp);
			if (mark) {
				let sp = make('span');
				sp.html(mark);
				sp.html(mark);
				sp.is_sym = true;
				div.add(sp);
			}
		}
		div.on = function(if_mouse) {
			if (curitem) curitem.off();
			div.bgcol = ACTIVE_MENU_BG;
			div.hold_tcol = div.tcol;
			div.tcol = ACTIVE_MENU_FG;
			curitem = div;
			if (type == "desk") _Desk.desk_menu = curitem.menu;
			else elem.context_menu = curitem.menu;
			curitem.menu.curitem = curitem;
		};
		div.off = function() {
			curitem = null;
			div.tcol = div.hold_tcol;
			div.bgcol = "";
		};
		div.select = select;
		div.onclick = ()=>{
			if(self.kid) {
				delete_menus();
				div.on(true);
				return;
			}
			delete_menus();
			select();
		};
		div.onmouseenter = e => {
			if((_Desk.desk_menu || elem.context_menu)!==self) return;
			if (curitem) {
				div.on(true);
				return;
			}
			delete_menus();
			div.on(true);
		};
		div.onmouseover=()=>{
			div.style.cursor="default";
		};
		kids.push(div);
		return div;
	}

	elem.context_menu = this;
	this.type=type;
	this.elem = menu;
	this.parelem = elem;
	menu.onclick = noprop;
	menu.onmousedown = noprop;
	menu.ondblclick = noprop;
	menu.oncontextmenu = noprop;
	menu.z = CG_zIndex+1;
	menu.prevelem = prevelem;

	document.body.add(menu);
}
this.ContextMenu = ContextMenu;
//»
const wincontext=(loc, win)=>{//«
	let obj = win.obj;
	if (!(obj && obj.get_context)) return;
	let arr = obj.get_context();
	if (!isarr(arr)) return;
	if (obj.onblur) obj.onblur();
	let rect = win.getBoundingClientRect();
	let menu = new ContextMenu(win, loc, "win");
	Desk.desk_menu = menu;
	let app = win.app;
	let name = app.split(".").pop();
	let i=0;
	for (; i < arr.length; i += 2) {
		menu.add_item(arr[i], arr[i + 1]);
	}
	if (!arr.length){
		menu.add_item(`About ${name}`, ()=>{
			obj.onblur&&obj.onblur();
			make_popup({STR:"Nothing here yet!", WIN:win,CB:()=>{
				obj.onfocus&&obj.onfocus();
			}});
		});
	}
	menu.adjust_y();
};//»
this.wincontext=wincontext;


//»

//Popup/Prompt«
let popup_link_col = "#009"
//let prompt_boxshadow = "0px 0px 20px 2px #888888";
let popup_queue = [];
const make_func_span=(str,cb)=>{let sp=make('sp');if(str=="__BR__")str="<hr style='margin:0px;height:6px;visibility:hidden;'>";sp.html(str);if(cb){sp.ael('click',cb);sp.tcol=popup_link_col;sp.style.textDecoration="underline";sp.style.cursor="pointer";}return sp;}
const make_func_div=(all)=>{let div=make('div');for(let i=0;i<all.length;i++){let arr=all[i];if(typeof arr=="string")div.add(make_func_span(arr));else div.add(make_func_span(arr[0],arr[1]));}return div;}
this.pophuge = (str, opts = {}) => {
	return make_popup({
		STR: str,
		VERYBIG: true,
		WIN: opts.win,
		TIT: opts.title,
		SEL: opts.SEL
	});
}

const popmacro = () => {
	if (Desk.CPR) return false;
	make_popup({
		TIT: "The Macronator",
		MACRO: true,
		TIME: 5000,
		FS: 22,
		STR: "Press Macro Keys...",
		CB: function(ret) {}
	});
	return true;
}
this.popmacro=popmacro;

const popinfo = (str, type) => {
	return make_popup({
		'STR': str,
		'TYP': type,
		'INF': true
	});
}
this.popinfo = popinfo;
//const popok = (str, timearg) => {
const popok = (str, opts={}) => {
	make_popup({
		STR: str,
		TYP: "ok",
		TIME: opts.time,
		WIN: opts.win,
		TIT: opts.title,
		CB:opts.cb
	});
}
this.popok = popok;
api.popok=popok;
const poperr = (str, opts = {}) => {
	return make_popup({
		STR: str,
		TYP: "error",
		TIME: opts.time,
		WIN: opts.win,
		CB: opts.cb,
		TIT: opts.title,
		WIDE: opts.wide
	});
}
this.poperr = poperr;
//api.poperr=poperr;
api.poperr = (str, opts={})=>{
	return new Promise((Y, N) => {
		if (!opts.cb) opts.cb = Y;
		poperr(str, opts);
	});
}
const popup = (str, opts={}) => {
	return make_popup({
		TIT: opts.title,
		STR: str,
		SEL: opts.sel,
		WIN: opts.win,
		CB: opts.cb,
		WIDE: opts.wide
	});
}
this.popup=popup;
api.popup=popup;
this.popwide = (str,opts={})=>{
	opts.STR=str;opts.WIDE=true;
	return make_popup(opts);
};
//const popkey = (str_or_arr, chars, cb, if_long) => {
const popkey = (arr, cb, opts={}) => {
	let str="",chars={};
	let ch;
	for (let i = 0; i < arr.length; i++) {
		if (i<10) ch = String.fromCharCode(i + 48);
		else if (i<36) ch = String.fromCharCode(i-10 + 97);
		else if (i < 62) ch = String.fromCharCode(i-36 + 65);
		else break;
		str += ch + ")\xa0" + arr[i] + "<br>";
		chars[ch]=arr[i];
	}
	return make_popup({
		'TIT': opts.title||"Choose one",
		'STR': str,
		'KEYS': chars,
		'CB': cb,
		WIN:opts.win		
	});
}
this.popkey=popkey;

api.popkey = (arr, opts = {}) => {
	return new Promise((Y, N) => {
		popkey(arr,Y,opts);
	});
}

//const popin = (str, cb, deftxt, title) => {
const popin = (str, cb, opts) => {
	if (!str) str = " ";
	return make_popup({
		CANCEL:true,
		ONCANCEL:"",
		STR: str,
		INPUT: true,
		CB: cb,
		TXT: opts.deftxt,
		TIT: opts.title
	});
}
this.popin = popin;
api.popin = (str, opts = {}) => {
	return new Promise((Y, N) => {
		make_popup({
			STR: str,
			CANCEL:true,
			INPUT: true,
			CB: Y,
			TXT: opts.defTxt,
			TIT: opts.title,
			WIN: opts.win,
			PASSWORD: opts.password,
//			CHOICES: opts.choices
		});
	});
}

const popwait = (str, cb, type) => {
	return make_popup({
		STR: str,
		TYP: type,
		CB: cb
	});
}
this.popwait=popwait;
api.popwait = (str, type)=>{
	return new Promise((y,n)=>{
		popwait(str,y,type);
	});
};

const popform = (arr, cb, title) => {//«
	let table = make('table');
	let focuselm = null;
	for (let i = 0; i < arr.length; i++) {
		let tr = make('tr');
		let lab_td = make('td');
		lab_td.style.verticalAlign = "top";
		let elm_td = make('td');
		let type = arr[i][0];
		let label = arr[i][1];
		let def = arr[i][2];
		let optarg = arr[i][3];
		let elm;
		if (type == "select") {
			if (!def) def = 0;
			else def = parseInt(def);
			elm = make('select');
			elm.style.width = "85";
			let list = optarg;
			for (let j = 0; j < list.length; j++) {
				let opt = make('option');
				opt.attset('value', list[j]);
				if (j == def) opt.attset("selected", "true");
				opt.html(list[j]);
				elm.add(opt);
			}
		} else if (type == "field") {
			elm = make('span');
			elm.innerHTML = def;
		} else if (type == "check") {
			elm = make('input');
			elm.type = "checkbox";
			if (def) elm.checked = true;
			elm.ael('click', e => {
				setTimeout(_ => {
					elm.checked = !elm.checked;
				}, 1);
			});
		} else if (type == "text") {
			elm = make('input');
			elm.type = "text";
			if (def) elm.attset("placeholder", def);
			if (!focuselm) focuselm = elm;
		} else if (type == "textarea") {
			elm = make('textarea');
			elm.rows = 6;
			elm.style.width = 235;
			if (optarg) elm.attset("maxlength", optarg);
			if (def) elm.attset("placeholder", def);
			if (!focuselm) focuselm = elm;
		}
		elm.ael('mousedown', function(e) {
			e.stopPropagation();
		});
		elm.attset("name", label);
		lab_td.html(label + ":");
		lab_td.tcol="#000";
		elm_td.add(elm);
		tr.add(lab_td);
		tr.add(elm_td);
		tr.elm = elm;
		table.add(tr);
	}
	return make_popup({
		'STR': table,
		'TYP': "form",
		'CB': cb,
		'TIT': title,
		'FOCUS': focuselm
	});
}//»
this.popform = popform;
api.popform=(arr,title)=>{
	return new Promise((y,n)=>{
		popform(arr,y,title);
	});
};

this.popcancel = (str, cb) => {
	return make_popup({
		STR: str,
		CANCEL: true,
		CB: cb
	});
}

const popyesno = (str, cb, if_rev) => {
	return make_popup({
		STR: str,
		TYP: "yesno",
		CB: cb,
		REV: if_rev
	});
}
this.popyesno = popyesno;
api.popyesno = (str, opts = {}) => {
	return new Promise((Y, N) => {
		make_popup({
			STR: str,
			TYP: "yesno",
			CB: Y,
			REV: opts.reverse,
			TIT: opts.title,
			WIN:opts.win,
			DEFNO: opts.defNo
		});
	});
}

const poparea = (str_or_arr, title, if_rev_arr, cb, read_only, if_cancel, win) => {
	let arr;
	if (typeof str_or_arr == "string") arr = str_or_arr.split("\n");
	else arr = str_or_arr;
	if (if_rev_arr) arr = arr.reverse();
	let div = make('div');
	let area = make('textarea');
	area.value = arr.join("\n");
	area.id="prompt_textarea";
	if (read_only) {
		area.attset("readonly", "1");
	}
	area.w = "100%";
	area.h = "100%";
	area.fs = 20;
	div.add(area);
	return make_popup({
//		INPUT:if_input,
		USEINPUT:area,
		'SEL': true,
		'STR': div,
		'VERYBIG': true,
		'CB': cb,
		'TIT': title,
		CANCEL:if_cancel,
		WIN:win
	});
}
this.poparea=poparea;
this.popinarea=(tit, cb)=>{
	poparea("",tit,null,cb,false,true);
};
api.popinarea=(str,tit, opts={})=>{
	let if_can = true;
	if (opts.noCancel) if_can = false;
//	let read_only = fa;
//if (opts.readOnly) read
	return new Promise((y,n)=>{
//		poparea(str,tit,null,y,true,true, opts.win);
		poparea(str,tit,null,y,opts.readOnly,if_can, opts.win);
	})
}
const make_prompt=(str,def_text,cb,if_long)=>{let isshort=true;if(if_long)isshort=null;make_popup({'STR':str,'ICO':true,'TXT':def_text,'CB':cb,'SHT':isshort});}
this.make_prompt=make_prompt;

const mkpopup_imgdiv = (type, use_img, if_big_img) => {
	let imgdiv = make('div');
	imgdiv.pos = 'absolute';
	let usedim = 64;
	if (if_big_img) usedim = 128;
	imgdiv.w = usedim;
	imgdiv.h = usedim;
	let usetype = type;
	if (!type || type == "form") usetype = "alert";
	else if (type == "yesno") usetype = "alert";
	if (use_img) {
		let img;
		if (use_img instanceof HTMLImageElement) img = use_img;
		if (img && img instanceof HTMLImageElement) {
			imgdiv.style.backgroundImage = "url(" + img.src + ")";
			imgdiv.style.backgroundPosition = "center center";
			imgdiv.style.backgroundRepeat = "no-repeat";
			imgdiv.style.backgroundSize = "contain";
		}
	} else {
		igen.attach({
			'PAR': imgdiv,
			'TYPE': "popup",
			"SUBTYPE": usetype
		});
	}
	return imgdiv
}
const do_links = elm=>{//«
	let lns = Array.from(elm.getElementsByTagName("a"));
	for (let ln of lns){
		let win;
		ln.onclick=e=>{
			e.preventDefault();
			e.stopPropagation();
			if (win&&!win.closed){
				win.focus();
				return;
			}
			win = window.open(ln.href, ln.href,`width=${window.outerWidth-100},height=${window.outerHeight-100}`)
		};      
		ln.onmousedown=(e)=>{
			e.preventDefault();
			e.stopPropagation();
		}       
		ln.oncontextmenu=e=>{
			e.stopPropagation();
		};
	}
};//»
const mkpopup_tdiv = (str, opts={}) => {

	let w = opts.WIN;
	let text_fs = opts.FS;
	let if_big_img = opts.BIGIMG;
	let selectable = opts.SELECTABLE;
	let if_verybig = opts.VERYBIG;
	let if_systerm = opts.SYSTERM;
	let tdiv = make('div');
	if (selectable) {
		tdiv.style.userSelect = "text";
		tdiv.ael('mousedown', function(e) {
			e.stopPropagation()
		});
	}
	if (text_fs) tdiv.fs = text_fs;
	else tdiv.fs = 18;
	if (!(opts.NOBOLD||if_systerm)) tdiv.fw = "bold";
	
	tdiv.tcol = "black";
	tdiv.pos = 'absolute';
	let usex = 109;
	if (if_big_img) usex += 64;
	tdiv.loc(usex, 37);
	if (if_verybig) {
		tdiv.bor="1px dotted #333";
		tdiv.classList.add("scroller");
		tdiv.overy="auto";
		if (w){
				tdiv.w = w.gbcr().width - (20 + 134);
				tdiv.h = w.gbcr().height - (35 + 79);
		}
		else{
				tdiv.w = winw() - (20 + 134);
				tdiv.h = winh() - (35 + 79);
		}
	} else {
		tdiv.overy = "auto";
		tdiv.w = opts.WIDTH - 134;
		tdiv.h = 75;
	}
	tdiv.overx = "hidden";
	if (str) {
		if (typeof str == "string") {
			tdiv.style.overflowWrap = "break-word";
			tdiv.innerHTML=str;
		} else if (str instanceof HTMLElement) {
			tdiv.add(str);
		} else if (str instanceof Blob) {
			str.render(tdiv);
		}
		do_links(tdiv);

	}
	return tdiv;
}


const make_popup = (arg) => {//«
	const popup_dequeue = () => {
		make_popup(_popup_queue.shift());
	}
	const mkbut=(txt, if_active)=>{
		let d = mkdv();
//		d.tabIndex=""+(cur_tab_index++);
		d.onfocus=()=>{
			d.fw="bold";
			d.bgcol="#ccf";
		}
		d.onblur=()=>{
			d.fw="";
			d.bgcol="";
		}
		d.ta="center";
		d.fs=14;
		d.tcol="#000";
		d.innerText=txt;
		d.bor="3px outset #ccc";
		d.onmousedown=()=>{d.bor="3px inset #ccc";};
		d.onmouseup=()=>{d.bor="3px outset #ccc";};
		d.onmouseout=()=>{d.bor="3px outset #ccc";};
		d.w=68.46;
		d.type = "popup_button";
		if (if_active) active_button = d;
		return d;
	}
	const do_cancel = ()=>{
		div.del();
		if (w) delete w.popup;
		else{
			_Desk.CG.off();
			_Desk.CPR = null;
		}
		if (cb) {
			if ('ONCANCEL' in arg) cb(arg.ONCANCEL);
			else cb(false);
		}
		if (!w){
			if (_popup_queue.length) popup_dequeue();
			else if (holdwin) _Desk.window_on(holdwin);
		}
	};
	const nopropdef=(e)=>{
		e.stopPropagation();
		e.preventDefault();
	};
	const noprop=(e)=>{
		e.stopPropagation();
	};
	let cur_tab_index = 1;
	let active_button;
	let w = arg.WIN;
	let _Desk = Desk;
	let _popup_queue = popup_queue;
	if (!w) {
		if (_Desk.CPR && _Desk.CPR !== true) {
			_popup_queue.push(arg);
			return;
		}
	}
	let choices;
	let no_buttons;
	let if_cancel, if_input, if_macro, if_password;
	let if_systerm;
	let expires;
	let if_rev, title, str, type;
	let res_text, cb, if_short, if_info;
	let text_fs;
	let verybig;
	let big_img, use_img, caption, selectable;
	let keys, timer;
	let oktxt, cantxt;
	let comp_keydown;
	let div = make('div');
	let butdiv = make('div');
	let cancel_button_div;
	let okbutdiv;
	butdiv.pos="absolute";
	butdiv.b=0;
	butdiv.r=0;
	butdiv.mar=5;
	div.add(butdiv);
	div.fs=18;
	div.style.userSelect = "none";
	div.style.boxShadow = "2px 3px 7px #444";
	if (document.activeElement) document.activeElement.blur();
	if (typeof arg == "string") {
		str = arg;
		type = typearg;
	} else if (typeof arg == "object") {
		str = arg.STR || arg.DIV;
		if_systerm = arg.SYSTERM;
		if (if_systerm) {
			div.key_handler = str.obj.key_handler;
		}
		if_cancel = arg.CANCEL;
		verybig = arg.VERYBIG;
		oktxt = arg.OKTXT;
		cantxt = arg.CANTXT;
		caption = arg.CAP;
		text_fs = arg.FS;
		use_img = arg.IMG;
		big_img = arg.BIGIMG;
		if_input = arg.INPUT;
		if_password = arg.PASSWORD;
		if_macro = arg.MACRO;
		res_text = arg.TXT;
		cb = arg.CB;
		if_short = arg.SHT;
		if_info = arg.INF;
		title = arg.TITLE || arg.TIT;
		timer = arg.TIME;
		expires = arg.EXP;
		keys = arg.KEYS;
		if_rev = arg.REV;
		selectable = arg.SEL;
		type = arg.TYPE || arg.TYP;
		no_buttons = arg.NOBUTTONS;
	} else if (arg) str = arg;
	if (!str) str = "";
	if (typeof str == "object" && typeof str.length == "number") str = make_func_div(str);
	else if (typeof str == "string") str = str.replace(/__BR__/g, "<hr style='margin:0px;height:6px;visibility:hidden;'>");
	if (str instanceof HTMLElement) div.htelem = str;
	let usewid = 420;
	if (big_img||arg.WIDE) usewid += 64;
	let def_text_h = 75;
	let def_h = arg.HEIGHT||154;
	if (big_img) def_h += 32;
	if (arg.WIDTH) usewid = arg.WIDTH;
	else if (if_short) usewid = 275;
	else if (verybig) {
		if (w){
			usewid = w.gbcr().width-20;
			def_h = w.gbcr().height-35;
		}
		else{
			usewid = winw() - 20;
			def_h = winh() - 35;
		}
		def_text_h = def_h - 79;
	}
	let holdwin;
	if (!w) {
		holdwin = _Desk.CWIN;
		if (holdwin) _Desk.window_off(holdwin)
	}
	if (keys) {
		if (keys == "__ANY__") div.keys = true;
		else div.__keys = keys;
	}
	if (w) {
		w.popup=div;
		div.z=10000000;
		w.add(div);
	}
	else document.body.add(div);
	
	div.ael('dblclick', e => {
		e.stopPropagation()
	});
	if (cb) div.cb = cb;
	div.nosave = true;
	div.w = usewid;
	div.h = def_h;
	div.bgcol = "#fff";
	div.pos = 'absolute';
	if (!w) {
		div.z = 10000000;
		if (_Desk.CG) _Desk.CG.on();
		_Desk.CPR = div;
	}
	let bar = make("div");
	bar.type = "prompt";
	bar.style.borderBottom = "1px solid #515151";
	bar.pos = "absolute";
	bar.h = 21;
	bar.w = usewid;
	if (title) {
		bar.ta = "center";
		bar.fw = "bold";
		bar.fs = "16px";
		bar.padt = 4;
		bar.tcol = "#bbb";
		bar.innerHTML = title;
	}
	bar.bgcol = "#303030";
	div.add(bar);
	let imgdiv = mkpopup_imgdiv(type, use_img, big_img);
	imgdiv.x = 25;
	div.add(imgdiv);
	imgdiv.y = div.offsetHeight / 2 - imgdiv.offsetHeight / 2;
	if (caption) {
		let capdiv = make('div');
		capdiv.tcol = "#000";
		capdiv.pos = 'absolute';
		capdiv.loc(25, 100);
		capdiv.innerHTML = caption;
		capdiv.ta = "center";
		div.add(capdiv);
		let wid = capdiv.offsetWidth;
		if (wid > 64) {
			let diffx = (wid - 64) / 2;
			if (diffx < 25) capdiv.x = 25 - diffx;
			else capdiv.x = 0;
		}
	}
	let tdiv = mkpopup_tdiv(str, {
		NOBOLD: arg.NOBOLD,
		WIDTH: usewid,
		WIDE: arg.WIDE,
		FS: text_fs,
		BIGIMG: big_img,
		SELECTABLE: selectable,
		VERYBIG: verybig,
		SYSTERM: if_systerm,
		WIN:w
	});
	if (str instanceof HTMLElement) div.htelm = str;
	div.messdiv = tdiv;
	div.add(tdiv);
	if (if_macro) {
		div.is_macro = true;
		tdiv.ta = "center";
		Core.reset_macro_vars();
		Core.set_macro_update_cb(str => {
			tdiv.innerHTML = str;
		});
		_Desk.set_macros();
	}

	okbutdiv = make('div');
	okbutdiv.dis = "inline-block";
	let input;
	if (if_input||arg.USEINPUT) {
		if (arg.USEINPUT) {
			input = arg.USEINPUT;
//			butdiv.add(okbutdiv);
		}
		else {
			input = make('input');
			if (res_text) input.value = res_text;
			if (if_password) input.type="password";
			else input.type = "text";
			if (if_short) input.w = 140;
			else input.w = 250;
			input.h = 20;
			tdiv.add(make('br'));
			tdiv.add(input);
		}
		input.tabIndex = ""+(cur_tab_index++);
		input.ael('mousedown', e => {
			e.stopPropagation();
		});
		setTimeout(() => {
			input.focus();
			input.select();
		}, 1);
		div.res_input = input;
//		butdiv.add(okbutdiv);
	}
	else if (if_cancel) okbutdiv = null;
//	else if (!if_cancel) butdiv.add(okbutdiv);
//	else okbutdiv = null;
	let useok = "OK";
	if (oktxt) useok = oktxt;
	else if (type == "yesno") {
//		if (if_rev) useok = "NO";
//		else useok = "YES";
		useok = "YES";
	}
	if (okbutdiv) okbutdiv.add(mkbut(useok, true));
	div.ok_button = okbutdiv;
	if (keys || if_macro || no_buttons) {
		okbutdiv.op = 0;
		div.inactive = true;
	}

	let ok_cb = () => {
		div.del();
		delete div.active;
		if (input && input.matchdiv) input.matchdiv.del();
		if (!w&&_Desk.CG) _Desk.CG.off();
		if (comp_keydown) document.removeEventListener('keydown', comp_keydown);
		if (type == "form") {
			let rows = div.htelm.childNodes;
			let retobj = {};
			for (let i = 0; i < rows.length; i++) {
				let elm = rows[i].elm;
				if (elm.type == "checkbox") retobj[elm.name] = elm.checked;
				else retobj[elm.name] = elm.value;
			}
			if (cb) cb(retobj);

			if (w) {
				delete w.popup;
				if (w===_Desk.CWIN&&w.obj&&w.obj.onfocus) w.obj.onfocus();
			}
			else _Desk.CPR = null;
			return;
		}
		if (div.timer) clearTimeout(div.timer);
		if (div.cb) {
			if (div.res_input) div.cb(div.res_input.value);
			else {
				if (div.__keys) {
					if (div.choices) div.cb(div.choices[div.keyok]);
					else div.cb(div.keyok);
				}
				else {
					div.cb(true);
				}
			}
		}
		if (w) {
			delete w.popup;
			if (w===_Desk.CWIN&&w.obj&&w.obj.onfocus)  w.obj.onfocus();
		}
		else {
			_Desk.CPR = null;
			if (_popup_queue.length) {
				_Desk.CPR = true;
				popup_dequeue();
			} else if (holdwin) _Desk.window_on(holdwin);
		}
	};
	div.ok = ok_cb;
	if (!no_buttons) okbutdiv.ael('click', ok_cb);
	if (expires || timer) {
		if (expires) {
			timer = expires - now();
			if (timer < 0) timer = 0;
		}
		let timerdiv = make('div');
		timerdiv.pos = 'absolute';
		timerdiv.loc(1, 1);
		timerdiv.w = 1;
		timerdiv.h = 1;
		timerdiv.op = 0;
		div.add(timerdiv);
		div.timeoutdiv = timerdiv;
		timerdiv.ael('click', e => {
			e.stopPropagation();
			div.del();
			delete div.active;
			if (!w) _Desk.CG.off();
			if (comp_keydown) document.removeEventListener('keydown', comp_keydown);
			if (div.cb) div.cb();

			if (w) delete w.popup;
			else{
				_Desk.CPR = null;
				if (_popup_queue.length) {
					_Desk.CPR = true;
					popup_dequeue();
				} else if (holdwin) _Desk.window_on(holdwin);
			}
		});
		div.timer = setTimeout(_ => {
			if (!w) div.timeoutdiv.click();
			else if (_Desk.CWIN && _Desk.CWIN.popup === div) _Desk.CWIN.popup.timeoutdiv.click();
		}, parseInt(timer));
	}
	if (if_cancel || type == "form" || type == "yesno" || cantxt) {
		cancel_button_div = make('div');
		cancel_button_div.dis="inline-block";
		cancel_button_div.marl=10;
		let usecan = "CANCEL";
		if (cantxt) usecan = cantxt;
		else if (type == "yesno") {
//			if (if_rev) usecan = "YES";
//			else usecan = "NO";
			usecan = "NO";
		}
		cancel_button_div.ael('click', () => {
			do_cancel();
		});
//		butdiv.add(cancel_button_div);
		if (!if_input && !arg.USEINPUT && if_cancel) {
			cancel_button_div.add(mkbut(usecan, true));
			div.cancel_only = true;
		} else {
			cancel_button_div.add(mkbut(usecan, false));
		}
		div.cancel_button = cancel_button_div;
	}
	div.cancel = do_cancel;

	if (verybig){}
	else if (tdiv.scrollHeight > def_text_h) {
		let hdiff = tdiv.scrollHeight - def_text_h;
		let tot_h = window.innerHeight;
		let hi_h = def_h + hdiff + 20;
		if (hi_h <= tot_h) {
			div.h = def_h + hdiff;
			tdiv.h = def_text_h + hdiff;
			center(div);
		} else {
			div.h = tot_h - 20;
			tdiv.h = (tot_h - 20) - (def_h - def_text_h);
			center(div);
		}
		div.y = div.y - 17;
	}

let butdiv1, butdiv2;
if (okbutdiv && cancel_button_div){
	if (if_rev) {
		butdiv1 = cancel_button_div;
		butdiv2 = okbutdiv;
	}
	else{
		butdiv1 = okbutdiv;
		butdiv2 = cancel_button_div;
	}
}
else if (okbutdiv) butdiv1 = okbutdiv;
else if (cancel_button_div) butdiv1 = cancel_button_div;
if (butdiv1) {
	butdiv.add(butdiv1);
	butdiv1.childNodes[0].tabIndex=""+(cur_tab_index++);
}
if (butdiv2) {
	butdiv.add(butdiv2);
	butdiv2.childNodes[0].tabIndex=""+(cur_tab_index++);
}
	if (input){}
	else if (arg.FOCUS) arg.FOCUS.focus();
	else if (butdiv1) setTimeout(()=>{butdiv1.childNodes[0].focus();},10);

	if (!w) center(div);
	else center(div, w);
	div.active = true;
	return div;

}//»

this.make_popup = make_popup;
NS.api.wdg=api;
NS.api.widgets=api;

//»

}
