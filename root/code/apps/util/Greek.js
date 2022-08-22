/*«
Greek Symbols

Α
U+0391
Β
U+0392
Γ
U+0393
Δ
U+0394
Ε
U+0395
Ζ
U+0396
Η
U+0397
Θ
U+0398
Ι
U+0399
Κ
U+039A
Λ
U+039B
Μ
U+039C
Ν
U+039D
Ξ
U+039E
Ο
U+039F
Π
U+03A0
Ρ
U+03A1
Σ
U+03A3
Τ
U+03A4
Υ
U+03A5
Φ
U+03A6
Χ
U+03A7
Ψ
U+03A8
Ω
U+03A9


α
U+03B1
β
U+03B2
γ
U+03B3
δ
U+03B4
ε
U+03B5
ζ
U+03B6
η
U+03B7
θ
U+03B8
ι
U+03B9
κ
U+03BA
λ
U+03BB
μ
U+03BC
ν
U+03BD
ξ
U+03BE
ο
U+03BF
π
U+03C0
ρ
U+03C1
ς
U+03C2
σ
U+03C3
τ
U+03C4
υ
U+03C5
φ
U+03C6
χ
U+03C7
ψ
U+03C8
ω
U+03C9
»*/
export const app = function(arg) {

//Imports«

const {Core, Main, NS}=arg;
const{log,cwarn,cerr,api:capi, globals, Desk}=Core;

const{fs,util}=globals;
const{make,mkdv,mk,mksp}=util;

const Win = Main.top;

//»

//Var«



//»

//DOM«

let inp = mk('input');
inp.w="100%";
inp.bgcol="#000";
inp.tcol="#ccc";
inp.fs=24;
Main.add(inp);

Main.tcol="#ccc";
Main.fs=24;

//»

//Funcs«

let letters=[//«
"a",
"b",
"g",
"d",
"e",
"z",
"h",
"0",
"i",
"k",
"l",
"m",
"n",
"X",
"o",
"p",
"r",
"S",
"s",
"t",
"u",
"f",
"x",
"y",
"w"
]//»

const add_letter=ch=>{
//log(ch);
inp.value+=ch;
};

const init=()=>{//«

let tab = mk('table');
tab.fs=32;
Main.add(tab);


let tr2 = mk('tr');
tr2.ff="serif";
tr2.fw=900;
tab.add(tr2);
for (let ch of letters){
let sp = mk('td');
sp.pad=5;
sp.innerText = ch;
tr2.add(sp);
}


let tr1 = mk('tr');
tab.add(tr1);
for (let i=0x3b1; i <= 0x3c9; i++){

let s = i.toString(16);
let ch = eval(`"\\u0${s}"`);
let sp = mk('td');
sp.pad=5;
sp.innerText = ch;
tr1.add(sp);

}


let tr0 = mk('tr');
tab.add(tr0);
for (let i=0x391; i <= 0x3a1; i++){
let s = i.toString(16);
let ch = eval(`"\\u0${s}"`);
let sp = mk('td');
sp.pad=5;
sp.innerText = ch;
tr0.add(sp);
}

for (let i=0x3a2; i <= 0x3a9; i++){
let s;
if (i==0x3a2) s = (0x3a3).toString(16);
else s = i.toString(16);
let ch = eval(`"\\u0${s}"`);
let sp = mk('td');
sp.pad=5;
sp.innerText = ch;
tr0.add(sp);
}



}//»

//»

//OBJ/CB«

this.onappinit=init;

this.onloadfile=bytes=>{};

this.onkeydown = function(e,s) {//«

if (s=="ENTER_"){
inp.value="";
return;
}
else if (s=="c_C"){
//log("COPY");
    inp.focus();
    inp.select();
    document.execCommand("copy")
	inp.blur();
return;
}
else if (s=="BACK_"){
let val = inp.value;
if (!val) return;
inp.value = val.slice(0, val.length-1);
}

//αβγδεζηθικλμνξοπρςστυφχψω
//abgdezh0iklmnxoprsStuqXyw
let ch;
if (s=="a_"){ch="α"}
else if (s=="b_"){ch="β"}
else if (s=="g_"){ch="γ"}
else if (s=="d_"){ch="δ"}
else if (s=="e_"){ch="ε"}
else if (s=="z_"){ch="ζ"}
else if (s=="h_"){ch="η"}
else if (s=="0_"){ch="θ"}
else if (s=="i_"){ch="ι"}
else if (s=="k_"){ch="κ"}
else if (s=="l_"){ch="λ"}
else if (s=="m_"){ch="μ"}
else if (s=="n_"){ch="ν"}
else if (s=="x_S"){ch="ξ"}
else if (s=="o_"){ch="ο"}
else if (s=="p_"){ch="π"}
else if (s=="r_"){ch="ρ"}
else if (s=="s_S"){ch="ς"}
else if (s=="s_"){ch="σ"}
else if (s=="t_"){ch="τ"}
else if (s=="u_"){ch="υ"}
else if (s=="f_"){ch="φ"}
else if (s=="x_"){ch="χ"}
else if (s=="y_"){ch="ψ"}
else if (s=="w_"){ch="ω"}
else if (s=="SPACE_"){ch=" "}

if (ch) add_letter(ch);

}//»

this.onkeypress=e=>{//«
};//»
this.onkill = function() {//«

}//»
this.onresize = function() {//«
}//»
this.onfocus=()=>{//«
}//»

this.onblur=()=>{//«
}//»

//»

}

