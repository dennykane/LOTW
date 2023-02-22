
export const mod = function(Core){

var cur_get_cb = null;
var iter_cb = null;
var log = Core.log;
var cwarn = Core.cwarn;

//WORKER_STR«


const worker_str = `
var iter=0;
var tar;
var out;


self.onmessage=function(e) {
	var dat = e.data;var com = dat.com;
	if (com=="init") {tar = new Tar();}
	else if (com == "add") {
		if (tar) {
			out = tar.append(dat.path, dat.input);
			iter++;
			self.postMessage({
				iter: iter
			});
		}
	}
	else if (com=="clear") {if(tar)tar.clear();iter=0;}
	else if (com=="get") self.postMessage({buf:out});
};


var utils = {};
var header = {};
var lookup = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];

function clean(length) {
	var i, buffer = new Uint8Array(length);
	for (i = 0; i < length; i += 1) buffer[i] = 0;
	return buffer
}

function extend(orig, length, addLength, multipleOf) {
	var newSize = length + addLength,
		buffer = clean((parseInt(newSize / multipleOf) + 1) * multipleOf);
	buffer.set(orig);
	return buffer
}

function pad(num, bytes, base) {
	num = num.toString(base || 8);
	return "000000000000".substr(num.length + 12 - bytes) + num
}

function stringToUint8(input, out, offset) {
	var i, length;
	out = out || clean(input.length);
	offset = offset || 0;
	for (i = 0, length = input.length; i < length; i += 1) {
		out[offset] = input.charCodeAt(i);
		offset += 1
	}
	return out
}

function uint8ToBase64(uint8) {
	var i, extraBytes = uint8.length % 3,
		output = "",
		temp, length;

	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63]
	}
	for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
		temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
		output += tripletToBase64(temp)
	}
	switch (output.length % 4) {
		case 1:
			output += "=";
			break;
		case 2:
			output += "==";
			break;
		default:
			break
	}
	return output
}
utils.clean = clean;
utils.pad = pad;
utils.extend = extend;
utils.stringToUint8 = stringToUint8;
utils.uint8ToBase64 = uint8ToBase64;
var headerFormat = [{
	"field": "fileName",
	"length": 100
}, {
	"field": "fileMode",
	"length": 8
}, {
	"field": "uid",
	"length": 8
}, {
	"field": "gid",
	"length": 8
}, {
	"field": "fileSize",
	"length": 12
}, {
	"field": "mtime",
	"length": 12
}, {
	"field": "checksum",
	"length": 8
}, {
	"field": "type",
	"length": 1
}, {
	"field": "linkName",
	"length": 100
}, {
	"field": "ustar",
	"length": 8
}, {
	"field": "owner",
	"length": 32
}, {
	"field": "group",
	"length": 32
}, {
	"field": "majorNumber",
	"length": 8
}, {
	"field": "minorNumber",
	"length": 8
}, {
	"field": "filenamePrefix",
	"length": 155
}, {
	"field": "padding",
	"length": 12
}];

function formatHeader(data, cb) {
	var buffer = utils.clean(512),
		offset = 0;
	headerFormat.forEach(function(value) {
		var str = data[value.field] || "",
			i, length;
		for (i = 0, length = str.length; i < length; i += 1) {
			buffer[offset] = str.charCodeAt(i);
			offset += 1
		}
		offset += value.length - i
	});
	if (typeof cb === "function") return cb(buffer, offset);
	return buffer
}
header.structure = headerFormat;
header.format = formatHeader;
var recordSize = 512,
	blockSize;

function Tar(recordsPerBlock) {
	this.written = 0;
	blockSize = (recordsPerBlock || 20) * recordSize;
	this.out = utils.clean(blockSize)
}
Tar.prototype.append = function(filepath, input, opts, callback) {
	var data, checksum, mode, mtime, uid, gid, headerArr;
	if (typeof input === "string") input = utils.stringToUint8(input);
	else if (input.constructor !== Uint8Array.prototype.constructor) throw "Invalid input type. You gave me: " + input.constructor.toString().match(/function\\s*([$A-Za-z_][0-9A-Za-z_]*)\\s*\\(/)[1];
	if (typeof opts === "function") {
		callback = opts;
		opts = {}
	}
	opts = opts || {};
	mode = opts.mode || parseInt("777", 8) & 4095;
	mtime = opts.mtime || Math.floor(+new Date / 1E3);
	uid = opts.uid || 0;
	gid = opts.gid || 0;
	data = {
		fileName: filepath,
		fileMode: utils.pad(mode, 7),
		uid: utils.pad(uid, 7),
		gid: utils.pad(gid, 7),
		fileSize: utils.pad(input.length, 11),
		mtime: utils.pad(mtime, 11),
		checksum: "        ",
		type: "0",
		ustar: "ustar  ",
		owner: opts.owner || "",
		group: opts.group || ""
	};
	checksum = 0;
	Object.keys(data).forEach(function(key) {
		var i, value = data[key],
			length;
		for (i = 0, length = value.length; i < length; i += 1) checksum += value.charCodeAt(i)
	});
	data.checksum = utils.pad(checksum, 6) + "\x00 ";
	headerArr = header.format(data);
	var i, offset, length;
	this.out.set(headerArr, this.written);
	this.written += headerArr.length;
	if (this.written + input.length > this.out.length) this.out = utils.extend(this.out, this.written, input.length, blockSize);
	this.out.set(input, this.written);
	this.written += input.length + (recordSize - (input.length % recordSize || recordSize));
	if (this.out.length - this.written < recordSize * 2) this.out = utils.extend(this.out, this.written, recordSize * 2, blockSize);
	return this.out;
};
Tar.prototype.clear = function() {
	this.written = 0;
	this.out = utils.clean(blockSize)
};
`;


//_+='iter++;'
//_+='self.postMessage({iter: iter});'

//»

var worker = new Worker(URL.createObjectURL(new Blob([worker_str],{type:"text/javascript"})));

this.init = function(iter_cb_arg) {//«
	iter_cb = iter_cb_arg;
	worker.postMessage({com:"init"});
};//»

this.add=function(path,input){//«
	worker.postMessage({com:"add", path: path, input: input});
};//»

this.clear=function(){//«
	worker.postMessage({com:"clear"});
};//»

worker.onmessage = function(e) {//«
	var dat = e.data;
	if (dat.buf) {
		if (cur_get_cb) {
			cur_get_cb(dat.buf);
			cur_get_cb = null;
		}
		else cwarn("NO CUR_GET_CB SET");
	}
	else if (dat.iter) {
		if (iter_cb) iter_cb(dat.iter);
//		else console.warn("NO ITER_CB SET");
	}
	else {
cwarn("Tar: NO dat.buf && no dat.iter!!!!");
//log(cur_get_cb);
	}
}//»

this.get=function(cb){//«
	cur_get_cb = cb;
	worker.postMessage({com:"get"});
}//»

}

