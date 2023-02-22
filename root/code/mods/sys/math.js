
export const mod = function(Core) {


//Imports«
const {log} = Core;
//var util = Core.globals.util;
let jlog=obj=>{log(JSON.stringify(obj, null, "  "));};
//»

this.parse_shell_math = function (var_env, get_var_str, math_arr, math_resolve_cb) {//«
	var error_str;
	function synerr(badtok){return 'syntax error in expression (error token is "'+badtok+'")';}
	function deref_var_num(str) {//«
		if (!var_env[str]) return 0
		else return parseInt(var_env[str]);
	}//»
	function set_var_num(str, val) {//«
//log(val, typeof val);
		var_env[str] = parseInt(val);
	}//»
	function deref_var_incr(str, incr, pos) {//«
		var val = deref_var_num(str);
		var newval;
		if (incr == "++") newval=val+1;
		else newval=val-1;
		set_var_num(str, newval);
		if (pos == "pre") return parseInt(newval);
		return parseInt(val);
	}//»
	function get_math_scale() {//«
		var ret = get_var_str("MATH_SCALE");
		if (ret && typeof ret == "string" && ret.match(/^[0-9]+$/)) {
			var num = parseInt(ret);
			if (num == 0) return null;
			if (num > 20) return 20;
			return num;
		}
		return null;
	}//»
	var math_scale = get_math_scale();
//SHELLNOTES:7
	var m_ops = {//«
		"**":{"pr": 11, "ra": true},
		"/": {"pr": 10},
		"*": {"pr": 10},
		"%": {"pr": 10},
		"+": {"pr": 9},
		"-": {"pr": 9},
		"<<": {"pr": 8},
		">>": {"pr": 8},
		">=":{"pr":7},
		"<=":{"pr":7},
		">":{"pr":7},
		"<":{"pr":7},
		"!=":{"pr":6},
		"==":{"pr":6},
		"&":{"pr":5},
		"^":{"pr":4},
		"|":{"pr":3},
		"&&":{"pr":2},
		"||":{"pr":1}
	}//»


	function tokenize(arr_arg) {//«
		var str_arr = [];
		var toks = [];
		var arr, error, cap, ret;
		function get_mathrun(pos) {//«
			var arr = [];
			var ret; 
			for (var i = pos; i < toks.length; i++) {
				var tok = toks[i];
				if (tok == "(") {
					ret = get_mathrun(i+1);
					if (ret != null) {
						arr.push({'t': "group", 'arg': true, 'group': ret});
						toks.splice(i+1, ret.length+1);
					}
					else return null;
				}
				else if (tok == ")") {
					return arr;
				}
				else arr.push(tok);
			}
			return null;
		}//»
		function binopify(arr) {//«

			if (arr.length==4&&arr[1].match(/^[<>=!]$/)&&arr[2]=="=") {
				arr[1]+=arr[2];
				arr[2]=arr[3];
				arr.pop();
			}

			for (var i=0; i < arr.length; i++) {
				var tok = arr[i];
				var t = tok.t;
				var next = arr[i+1];
				if (t == "group") arr[i] = {'t': "group", 'arg': true, 'group' : binopify(arr[i].group)};

				if (!next) break;
				var nextt = next.t;
				if (t == "var" || t == "num" || t == "group" || t == "incr") {
					if (typeof(next) == "string") {
						var useop = null;
						if (next.length > 1 && (cap = next.match(/^([-+])[-+]+/))) {
							arr[i+1] = next.slice(1);
							useop = cap[1];
							arr.splice(i+1,0, {'t': "m_op",'tok': useop, 'm_op': m_ops[useop]});
						}
						else {
							useop = next;
							if (m_ops[useop]) arr[i+1] = {'t': "m_op",'tok': useop, 'm_op': m_ops[useop]};
							else {
								if (useop.match(/[-*\/%+&^\|]?=/)) {
									arr[i+1] = {'t': "assign", 'assign': useop};
								}
								else if (useop == "?" || useop == ":" || useop == ",") {}
								else {
log("NO OP:");
log(useop);
								}
							}
						}
					}
					else if (nextt){
//log("Why is there a following: " + nextt);
//error = 'syntax error in expression (error token is "hi")';
						error = true;
//log(next);
//						error_str = synerr(util.tok_to_string(next));
						error_str = synerr("?");
console.warn("FIX THIS!!!")
						return null;
					}
				}
			}

			var temp = [];
			var unops = ["+", "-", "!", "~"];
			for (var i=0; i < arr.length; i++) {
				var tok = arr[i];
				if (typeof(tok) == "string") {
					if (tok.length > 1) {
						var tokarr = tok.split("");
						for (var j=0; j < tokarr.length; j++) {
							var tokj = tokarr[j];
							if (unops.includes(tokj)) temp.push({'t': "unop", 'unop': tokj});
							else if (tokj == "?") temp.push({'t': "cond"});
							else if (tokj == ":") temp.push({'t': "cond-or"});
							else if (tokj == ",") temp.push({'t': "comma"});
							else {
log("NOT A SAKETOK HERE: " + tokarr[j]);
								return null;
							}
						}
					}
					else { 
						if (unops.includes(tok)) temp.push({'t': "unop", 'unop': tok});
						else if (tok == "?") temp.push({'t': "cond"});
						else if (tok == ":") temp.push({'t': "cond-or"});
						else if (tok == ",") temp.push({'t': "comma"});

						else {
							log("NOT A SAFE TOK HERE: " + tok);
							return null;
						}
					}
				}
				else temp.push(tok);
			}
			return temp;

		}//»
		function unopify(arr) {//«
			if (!arr) return null;
			if (arr[0] && arr[0].group) arr[0] = {'t': "group", 'arg': true, 'group': unopify(arr[0].group)}
			for (var i=1; i < arr.length; i++) {
				var tok = arr[i];
				var tokt = tok.t;
				var prev = arr[i-1];
				var prevt = prev.t;
				if (tokt == "group") arr[i] = {'t': "group", 'arg': true, 'group' : unopify(arr[i].group)};
				if (tokt && (tokt == "num" || tokt == "var" || tokt == "group" || tokt == "incr") && prevt == "unop") {
					var unops = [prev.unop];
					arr.splice(i-1, 1);
					i--;
					for (var j = i-1; j >= 0; j--) {
						if (arr[j].t == "unop") {
							unops.unshift(arr[j].unop);
							arr.splice(j, 1);
							i--;
						}
					}
					arr[i].unops = unops;
				}
			}
			return arr;
		}//»
		function binop_runs(arr) {//«
			if (!arr) return null;
			var run;
			var ret = [];
			for (var i=0; i < arr.length; i++) {
				var tok = arr[i];
				if (tok.arg) {
					var run = [];
					if (tok.t == "group") arr[i] = {'t': "group", 'arg': true, 'group': binop_runs(arr[i].group)};
					var run = [arr[i]];
					for (var j = i+1; arr[j]; j+=2) {
						if (arr[j].t == "m_op") {
							if (arr[j+1] && arr[j+1].arg) {
								if (arr[j+1].group) arr[j+1] = {'t': "group", 'arg': true, 'group': binop_runs(arr[j+1].group)};
								run.push(arr[j]);
								run.push(arr[j+1]);
								i=j+1;
							}
							else return null;
						}
						else break;
					}
					ret.push({'t': "binop_run", 'binop_run': run});
				}
				else ret.push(tok);
			}
			return ret;
		}//»
		function conditionals(arr) {//«
			function check_runs(runarg) {
				for (var i=0; i < runarg.length; i++) {
					if (runarg[i].t == "group") {
						conditionals(runarg[i].group);
					}
				}
			}
			for (var i=0; i < arr.length; i++) {
				var tok = arr[i];
				var tokt = arr[i].t;
				if (tokt == "cond") {
					if (i > 0 && (arr[i-1].t == "binop_run" || arr[i-1].t == "conditional") && arr[i+1] && arr[i+2] && arr[i+3] && arr[i+1].t == "binop_run" && arr[i+2].t == "cond-or" && arr[i+3].t == "binop_run") {

						if (arr[i-1].t == "binop_run") check_runs(arr[i-1].binop_run);
						if (arr[i+1].t == "binop_run") check_runs(arr[i+1].binop_run);
						if (arr[i+3].t == "binop_run") check_runs(arr[i+3].binop_run);

						if (arr[i-1].t == "conditional") {
							var usearr = arr[i-1].conditional;
							while(true) {
								if (usearr[2].t == "conditional") usearr = usearr[2].conditional;
								else break;
							}
							usearr[2] = {"t": "conditional", "conditional": [usearr[2], arr[i+1], arr[i+3]]}
							arr.splice(i, 4);
							i--;
						}

						else {
							arr[i-1] = {"t": "conditional", "conditional": [arr[i-1], arr[i+1], arr[i+3]]};
							arr.splice(i, 4);
							i--;
						}
					}
					else {
log("\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
log("INVALID CONDITIONAL IN MATH EXPRESSION");
log(arr[i-1]);
log(arr[i]);
log(arr[i+1]);
log(arr[i+2]);
log(arr[i+3]);
						arr = null;
						return null;
					}
				}
				else { 
					if (tokt == "cond-or") {
log("ERROR COND-OR");
						return null;
					}
				}
			}
			return true;
		}//»
		function assignments(arr) {//«
			function isvar(tok) {
				var run = tok.binop_run;
				if (run && run.length == 1 && (run[0].t == "var" || run[0].t == "incr")) return true;
				return false;
			}
			var tok, prev, next, obj, start, end;
			for (var i=arr.length-2; i > 0; i--) {
				tok = arr[i];
				prev = arr[i-1];
				next = arr[i+1];
				start = i-1;
				end = i+1;
				if (tok.assign) {
					if (next && prev && (next.binop_run || next.conditional) && isvar(prev)) {}
					else {
log("NOTTA VAR");
jlog(prev);
						return null;
					}
					obj = {'t': "assignment", "rval": next, "arr":[tok.assign, prev]};
					for (var j=i-2; j > 0; j-=2) {
						if (arr[j].assign) {
							if (isvar(arr[j-1])) {
								obj.arr.push(arr[j].assign);
								obj.arr.push(arr[j-1]);
								start = j-1;
							}
							else {
log("INVALID RVAL:");
jlog(arr[j-1]);
								return null;
							}
						}
						else break;
					}
					arr.splice(start, end-start+1, obj);
					i=start;
				}
			}
			return true;
		}//»
		for (var i=0; i < arr_arg.length; i++) {//«
			var obj = arr_arg[i];
			if (typeof(obj) == "string") str_arr.push(obj);
			else if (obj.push){
				for (var j=0; j < obj.length; j++) {
					if (typeof(obj[j]) == "string") str_arr.push(obj[j]);
					else if (typeof(obj[j]) == "object") {
						var type = obj[j].t;
						if (type) str_arr.push(obj[j][type]);
					}
				}
			}
		}//»
		arr = str_arr.join("").regstr().split(" ");
		error = null;
		for (var i=0; i < arr.length; i++) {//«
			var str = arr[i];
			while(str) {
				cap = str.match(/^([_a-zA-Z][_a-zA-Z0-9]*|\d+\.\d+|\d+|<<=|>>=|[=!-*\/%+&^\|]=|<<|>>|&&|\|\||\*\*|[+|-]+|<<|>>|[?:,=&^!~\)\(%*\/<>])/);
				if (cap && cap[1]) {
					var tok = cap[1];
					toks.push(cap[1]);
					str = str.slice(cap[1].length);
				}
				else {
					error = true;
					error_str = str;
					break;
				}
			}
		}//»
		if (error) {
//log("\n???????????????????????????????????????\n");
			error_str = synerr(str);
//error_str = 'syntax error in expression (error token is "'+str'")';
			return null;
		}
		for (var i=0; i < toks.length; i++) {//«
			var tok = toks[i];
			var prev = null;
			if (i>0) prev = toks[i-1];
			var next = null;
			if (i+1 < toks.length) next = toks[i+1];
			if (tok.match(/^[0-9]/)) toks[i] = {'t': "num", 'num' : tok, 'arg': true};
			else if (tok.match(/[_a-zA-Z]/)) {
//Peek ahead to look for ++/-- then peek behind to look for ++/--
				if (next && next.match && (cap = next.match(/^(\+\+|--)/))) {
					toks[i+1] = next.replace(/^(\+\+|--)/, "");
					toks[i] = {'t': "incr", 'var': tok, 'arg': true, 'incr': cap[1], 'incr_pos': "post"};
					if (!toks[i+1]) toks.splice(i+1, 1);
				}
				else if (prev && prev.match && (cap = prev.match(/(\+\+|--)$/))) {
					toks[i-1] = prev.replace(/(\+\+|--)$/, "");
					toks[i] = {'t': "incr", 'var': tok, 'arg': true, 'incr': cap[1], 'incr_pos': "pre"};
					if (!toks[i-1]) {
						toks.splice(i-1, 1);
						i--;
					}
				}
				else toks[i] = {'t': "var", 'arg': true, 'var': tok};
			}
		}//»
		arr=[];
		for (var i=0; i < toks.length; i++) {//«
			var tok = toks[i];
			if (tok == ")") {
log("ERROR UNBALANCED PARENS 1");
				return null;
			}
			else if (tok == "(") {
				ret = get_mathrun(i+1);
				if (ret == null) {
					log("ERROR UNBALANCED PARENS 2");
					return null;
				}
				else {
					arr.push({'t': "group", 'arg': true, 'group': ret});
					toks.splice(i+1, ret.length+1);
				}
			}
			else {
				arr.push(tok);
			}
		}//»
		arr = binopify(arr);
		arr = unopify(arr);
		arr = binop_runs(arr);
		if (!arr) return null;
		if (!conditionals(arr)) return null;
		return arr;
	}//»
	function shunter(arr) {//«
		var stack = [];
		var que = [];
		for (var i=0; i < arr.length; i++) {//«
			var tok = arr[i];
			if (tok.match(/^[0-9]/)) que.push(tok);
			else if (tok == "(") stack.unshift("(");
			else if (tok == ")") {
				var got = stack.shift();
				while (got) {
					if (got == "(") break;
					else {
						que.push(got);
						got = stack.shift();
					}
				}
				if (!got) {
log("ERROR: NO LEFT PAREN");
					return null;
				}
			}
			else {
//This has to be an operator.  Look at the top of the stack;
				var op1 = m_ops[tok];
				if (!op1) {
					alert("WHADDD IS THISSS????: [" + tok + "]");
					return;
				}
				if (!stack[0]) stack.unshift(tok);
				else {
					var op2 = m_ops[stack[0]];
					if (!op2) {
						stack.unshift(tok);
					}
					else {
						//While the top of the stack meets the requirements, pop it onto the que
						while (op2 && ((!op1.ra && op2.pr >= op1.pr) || op2.pr > op1.pr)) {
							que.push(stack.shift());
							if (!stack.length) break;
							op2 = m_ops[stack[0]];
						}
						stack.unshift(tok);
					}
				}
			}

		}//»
		while(stack.length) {
			var ch = stack.shift();
			if (ch == "(" || ch == ")") {
log("ERROR: mismatched parens");
				return null;
			}
			que.push(ch);
		}
		return que;
	}//»
	function revpolish_solver(arr) {//«
		var stack = [];
		function eval_it(op, num) {//«
			var ret;
			if (stack.length < num) return null;
			var num1=parseInt(stack.pop()), num2, num3;
			if (num > 1) {
				num2 = parseInt(stack.pop());
				if (num == 3) num3 = parseInt(stack.pop());
			}
			if (op == "**") ret = Math.pow(num2, num1);
			else if (num==2) {
				ret = Math.floor(parseInt(eval(num2 + op + num1)));
			}
			else {
log("WHADOO WE DO WITH NUM: " + num);
			}
			stack.push(ret);
			return true;
		}//»
		var tok = arr.shift();
		var nogood = null;
		while(tok) {
			if (tok.match(/[0-9]/)) stack.push(tok);
			else {
				if (!eval_it(tok, 2)) {
					nogood = true;
					break;
				}
			}
			tok = arr.shift();
		}
		if (nogood) {
log("ERROR: Not enough numbers on the stack!");
		}
		else {
			if (stack.length != 1) {
log("ERROR: STACK LENGTH != 1");
			}

			else {
				return {'OK': true, 'VAL':stack[0]};
			}
		}
	}//»
	function solve(arr) {//«
		function isvar(tok) {//«
			var run = tok.binop_run;
			var vartok = run[run.length-1];
			if (run && vartok && vartok.t == "var") return vartok["var"];
			return false;
		}//»
		function solve_phrase(arr) {//«
			function solve_run(run) {//«
				var tok, ret;
				if (run.length == 1) {//«
					tok = run[0];
					if (tok.t == "incr") {
						ret = deref_var_incr(tok['var'], tok['incr'], tok['incr_pos']);
						return ret;
					}
					else if (tok.t == "var") {
						ret = deref_var_incr(tok['var']);
						return ret;
					}
				}//»
				function eval_binop(tok, arg2, arg1) {//«
					var op = tok.tok;
					var pr = tok.m_op.pr;
					var val1, val2;
					var un1 = arg1.unops;
					var un2 = arg2.unops;
					if (arg1.t == "num") val1 = arg1.num;
					else if (arg1.t == "var") val1 = deref_var_num(arg1["var"]);
					else if (arg1.t == "incr") val1 = deref_var_incr(arg1["var"], arg1["incr"], arg1["incr_pos"]);
					else if (arg1.t == "group") val1 = solve(arg1.group);

					if (arg2.t == "num") val2 = arg2.num;
					else if (arg2.t == "var") val2 = deref_var_num(arg2["var"]);
					else if (arg1.t == "incr") val2 = deref_var_incr(arg2["var"], arg2["incr"], arg2["incr_pos"]);
					else if (arg2.t == "group") val2 = solve(arg2.group);

					if (val1==null || val2==null) return null;
					if (math_scale == null) {
						val1 = parseInt(val1);
						val2 = parseInt(val2);
					}
					else {
						val1 = parseFloat(val1).toFixed(math_scale);
						val2 = parseFloat(val2).toFixed(math_scale);
					}
				
					var unop;

					if (un1) {
						while(un1.length) {
							unop = un1.pop();
							if (unop == "!") {
								if (val1 == 0) val1 = 1;
								else val1 = 0;
							}
							else val1 = eval(unop + "" + val1);
						}
					}

					if (un2) {
						while(un2.length) {
							unop = un2.pop();
							if (unop == "!") {
								if (val2 == 0) val2 = 1;
								else val2 = 0;
							}
							else val2 = eval(unop + "" + val2);
						}
					}

					var float_ret;
					if (op == "/" && val2  == 0) {
log("ERROR: DIV BY 0!!!");
						return null;
					}
					if (op == "**") float_ret = Math.pow(val1, val2);
					else if (pr == 6 || pr == 7) {
						if (eval(val1 + op + val2)) float_ret = 1;
						else float_ret = 0;
					}
					else { 
						float_ret = eval(val1 + " " +  op + " " + val2);
					}
					if (math_scale == null)  return parseInt(float_ret);
					else return parseFloat(float_ret.toFixed(math_scale));

				}//»
				var stack = [];
				var que = [];
				//Shuntyard«
				for (var i=0; i < run.length; i++) {
					tok = run[i];
					if (tok.arg) {
						que.unshift(tok);
					}
					else {
						if (!stack.length) stack.push(tok);
						else {
							var op1 = tok;
							var op2 = stack[stack.length-1];
							while (op2 && ((!op1.ra && (op1.m_op.pr <= op2.m_op.pr)) || op1.m_op.pr < op2.m_op.pr)) {
								que.unshift(stack.pop());
								if (!stack.length) break;
								op2 = stack[stack.length-1];
							}
							stack.push(op1);
						}
					}
				}
				while(stack.length) que.unshift(stack.pop());
			//»		
				tok = que.pop();
				while (tok) {
					if (tok.arg) stack.push(tok);
					else {
						ret = eval_binop(tok, stack.pop(), stack.pop());
						if (ret == null) return null;
						else stack.push({'t': "num", 'num': ret}); 
					}
					tok = que.pop();
				}
				if (stack.length == 1 && stack[0]['t'] == "group") return solve(stack[0].group);
				return stack[0].num;
			}//»
				var rval = arr.pop();//«
				if (rval) {
					var type = rval.t;
					if (type == "binop_run" || type == "conditional" ) {}
					else {
log("ERROR RVAL:");
log(rval);
						return null;
					}
				}
				else {
log("NOTHING");
					return null;
				}
				if (arr.length){
					if (!(arr.length%2)) {
						for (var i=0; i < arr.length; i+=2) {
							if ((ret = isvar(arr[i])) && arr[i+1].assign) { 
								arr[i] = ret; 
								arr[i+1] = arr[i+1].assign;
							}
							else {
log("ERROR ASSIGNMENT SEQUENCE");
								return null;
							}
						}
					}
					else {
log("ERROR ASSIGNMENT ARRAY LENGTH");
						return null
					}
				}
				var retval;
				if (type == "binop_run") retval = solve_run(rval.binop_run);
				else if (type == "conditional") {
					var got = solve([rval.conditional[0]]);
					if (got == null) return null;
					else if (parseInt(got) == 0) retval = solve([rval.conditional[2]]);
					else retval = solve([rval.conditional[1]]);
				}
				if (retval == null) return null;
				var curval = retval;
				if (arr.length) {
					while (arr.length) {
						var assop = arr.pop();
						var varname = arr.pop();
						var varval = deref_var_num(varname);
						if (assop == "=") {}
						else curval = eval(varval + assop[0] + curval);
						set_var_num(varname, curval);
					}
				}
				return curval;
			//»
		}//»
	//«
		var phrases = [];
		var phrase = [];
		if (!arr) return null; 
		for (var i=0; i < arr.length; i++) {
			if (arr[i].t == "comma") {
				phrases.push(phrase);
				phrase = [];
			}
			else phrase.push(arr[i]);
		}
		if (phrase.length) phrases.push(phrase);
		var ret;
		for (var i=0; i < phrases.length; i++) {
			ret = solve_phrase(phrases[i]);
			if (ret == null) return null;
		}
		return ret;
	//»
	}//»
	var arr = tokenize(math_arr);
	if (arr == null) {
		math_resolve_cb(null, error_str);
		return;
	}
	var ret = solve(arr);
	if (ret == null) math_resolve_cb(null, error_str);
	else math_resolve_cb({'t': "number", 'number': ret});
}//»

}

