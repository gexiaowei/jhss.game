/*!
 * Yoguu Javascript Library
 * base64
 * data:2014年7月16日
 * mail:gandxiaowei@gmail.com
 * Copyright 2014 www.youguu.com
 */
function GalHttpRequest(base_url, params) {
	this.base_url = base_url;
	this.params = params;
}

GalHttpRequest.prototype.requestFromNet = function (callback) {
	if (callback == null) {
		return;
	}

	var xhr = createXMLHttpRequest(this.base_url, this.params);
	if (!xhr) {
		callback.error({
			status: "-0001",
			message: "浏览器不支持跨域请求"
		});
		return;
	}

	xhr.onloadend = function () {
		var text = xhr.responseText;
		console.log("text:" + text);
		if (!text) {
			callback.error({
				status: "-0001",
				message: "回调文本为空"
			});
		}
		var data = getObjectFromText(text);
		if (data && data.status == "0000") {
			callback.success(data);
		} else {
			callback.error(data);
		}
	};

	xhr.onerror = function (error) {
		callback.error({
			status: "-0001",
			message: error.toString()
		});
	};
	xhr.withCredentials = true;
	xhr.send();
};

GalHttpRequest.prototype.requestPacketFromNet = function (callback) {
	if (callback == null) {
		return;
	}

	var xhr = createXMLHttpRequest(this.base_url, this.params);
	if (!xhr) {
		callback.error({
			status: "-0001",
			message: "浏览器不支持跨域请求"
		});
		return;
	}

	//保证返回流不被修改
	xhr.overrideMimeType("text/plain; charset=x-user-defined");

	xhr.onloadend = function () {
		var data = xhr.response;
		var buff = [];
		for (var i = 0, j = data.length; i < j; i++) {
			buff.push(data[i].charCodeAt(0));
		};
		var len = readInt(buff);
		var seq = readInt(buff);
		var operatecode = readInt(buff);
		var packet = new Packet(operatecode, seq);
		packet.input(buff);
		try {
			packet.decode();
		} catch (error) {
			callback.error({
				status: "-0001",
				message: '数据异常'
			});
		}

		var info = packet.getValue();
		if (info.status.status == '0000' || info.status[0].status == '0000') {
			callback.success(info);
		} else {
			callback.error(info);
		}
	};

	xhr.onerror = function (error) {
		callback.error({
			status: "-0001",
			message: error.toString()
		});
	};
	xhr.withCredentials = true;
	xhr.send();

};

GalHttpRequest.prototype.jiemibase64 = function (data) {
	var text1 = getObjectFromText(data);
	return text1;
};

function getObjectFromText(text) {
	var base64 = new Base64();
	if (text.indexOf("~") == 0) {
		text = base64.decode(text);
	}
	var data = eval("(" + text + ")");
	return data;
}

function createXMLHttpRequest(base_url, params) {
	var base64 = new Base64();
	var request_url = replaceUrl(base_url, params);
	//使用默认值
	var user_id;
	var session_id;
	try {
		if (typeof (window.localStorage) === 'object' && localStorage.getItem("userinfo_currect")) {
			user_id = JSON.parse(localStorage.getItem("userinfo_currect")).userid;
			session_id = JSON.parse(localStorage.getItem("userinfo_currect")).sessionid;
		} else {
			user_id = "-1";
			session_id = "0110001";
		}
	} catch (err) {}

	//生成XMLHttpRequest
	var xhr = createCorsRequest(request_url, "GET");

	//添加请求头
	if (xhr) {
		xhr.setRequestHeader("ak", '0');
		xhr.setRequestHeader("userid", user_id);
		xhr.setRequestHeader("sessionid", session_id);
	}
	console.log("请求地址:" + request_url);
	return xhr;
}

function replaceUrl(base_url, params) {
	var base64 = new Base64();
	var request_url = base_url;
	//从数据中获取以下值
	var ak = "";
	var user_id = "";
	var user_name = "";
	var session_id = "";

	//替换URL
	if (params) {
		for (var param_name in params) {
			request_url = request_url.replace("{" + param_name + "}", base64.encode(params[param_name]));
		}
	}
	return request_url;
}

function createCorsRequest(url, method) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// Check if the XMLHttpRequest object has a "withCredentials" property.
		// "withCredentials" only exists on XMLHTTPRequest2 objects.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// Otherwise, check if XDomainRequest.
		// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// Otherwise, CORS is not supported by the browser.
		xhr = null;
	}
	return xhr;
}

function Base64() {}

/*!
 *10個策略 随机使用
 * */
var keys = ["789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ6abcdefghijklmnopqrstuvwxyz501234", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", "3456789_-ABCDEFGHIJKLMNOPQRSTUVWX2YZabcdefghijklmnopqr1stuvwxyz0", "-ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz9012345678", "_-ABCDEFGHIJKLMNOPQRSTUVWXYZ9abcdefghijklmnopqrstuvwxyz801234567", "9_-ABCDEFGHIJKLMNOPQRSTUVWXYZ8abcdefghijklmnopqrstuvwxyz70123456", "6789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ5abcdefghijklmnopqrstuvwxyz40123", "89_-ABCDEFGHIJKLMNOPQRSTUVWXYZ7abcdefghijklmnopqrstuvwxyz6012345", "456789_-ABCDEFGHIJKLMNOPQRSTUVWXY3Zabcdefghijklmnopqrs2tuvwxyz01", "56789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ4abcdefghijklmnopqrstuvwxyz3012"];

/*!
 * 加密base64加密的数据
 */
Base64.prototype.encode = function (en_str) {
	var random_index = Math.floor(Math.random() * 10);
	var key = keys[random_index];
	var de_str = "~" + random_index;

	var chr1, chr2, chr3;
	var en_byte = getBytesFromString(en_str);
	len = en_byte.length;
	var i = 0;
	while (i < len) {
		chr1 = en_byte[i++] & 0xff;
		if (i == len) {
			de_str += key.charAt(chr1 >> 2);
			de_str += key.charAt((chr1 & 0x3) << 4);
			break;
		}

		chr2 = en_byte[i++];
		if (i == len) {
			de_str += key.charAt(chr1 >> 2);
			de_str += key.charAt(((chr1 & 0x3) << 4) | ((chr2 & 0xF0) >> 4));
			de_str += key.charAt((chr2 & 0xF) << 2);
			break;
		}

		chr3 = en_byte[i++];
		de_str += key.charAt(chr1 >> 2);
		de_str += key.charAt(((chr1 & 0x3) << 4) | ((chr2 & 0xF0) >> 4));
		de_str += key.charAt(((chr2 & 0xF) << 2) | ((chr3 & 0xC0) >> 6));
		de_str += key.charAt(chr3 & 0x3F);
	}

	return de_str;
};

/*!
 * 解密base64加密的数据
 */
Base64.prototype.decode = function (de_str) {
	var key_index = de_str.substr(1, 1);
	var really_str = de_str.substr(2);

	var key = keys[key_index];
	var len = really_str.length;
	var en_btyes = [];

	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
	while (i < really_str.length) {
		enc1 = key.indexOf(really_str.charAt(i++));
		enc2 = key.indexOf(really_str.charAt(i++));
		enc3 = key.indexOf(really_str.charAt(i++));
		enc4 = key.indexOf(really_str.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		if (chr1 > 0) {
			en_btyes.push(chr1);
		}

		if (enc3 != 64 && chr2 > 0) {
			en_btyes.push(chr2);
		}

		if (enc4 != 64 && chr3 > 0) {
			en_btyes.push(chr3);
		}
	}
	return getStringFromByteArrs(en_btyes);
};

function readInt(buff) {
	return (buff.shift() << 24) | (buff.shift() << 16) | (buff.shift() << 8) | (buff.shift() & 0xff);
}

/**Packet解析*/
function Packet(operatecode, seq) {
	this.operatecode = operatecode;
	this.seq = seq;
};

/**Packet输入解析流*/
Packet.prototype.input = function (buff) {
	this.buff = buff;
};

/**Packet解析方法*/
Packet.prototype.decode = function () {
	var count = this.getInt();
	this.tables = [];
	for (var i = 0; i < count; i++) {
		this.tables.push(this.decodeTable());
	};
};

/**获取Packet解析完成Object*/
Packet.prototype.getValue = function () {
	var info = {};
	if (!this.tables) {
		return info;
	}
	for (var i = 0; i < this.tables.length; i++) {
		var table = this.tables[i];
		info[table.name] = table.rows;
	}
	return info;
};

/**解析表*/
Packet.prototype.decodeTable = function () {
	var table = {};
	var nameLen = this.getInt();
	if (nameLen > this.buff.length) {
		throw new Error('数据异常');
	}
	table.name = getStringFromByteArrs(this.get(nameLen)).toLocaleLowerCase();
	table.field = [];
	var names = [];
	table.rows = [];
	var fieldCount = this.getInt();
	for (var i = 0; i < fieldCount; i++) {
		var field = this.decodeField();
		table.field.push(field);
		names.push(field.name);
	}
	var rowCount = this.getInt();
	for (var i = 0; i < rowCount; i++) {
		table.rows.push(this.decodeRow(table.field));
	}
	return table;
};

/**解析列名*/
Packet.prototype.decodeField = function () {
	var datafield = {};
	var flag = this.buff.shift();
	datafield.type = String.fromCharCode(this.buff.shift());
	datafield.precise = this.getShort();
	datafield.length = this.getInt();
	var size = this.getInt();
	if (size > this.buff.length) {
		throw new Error('数据异常');
	}
	datafield.name = getStringFromByteArrs(this.get(size)).toLocaleLowerCase();
	if (flag > 0 && this.buff.length > 4) {
		size = Math.min(this.getInt(), this.buff.length);
		datafield.caption = getStringFromByteArrs(this.get(size));
	}
	return datafield;
};

/**解析数据列*/
Packet.prototype.decodeRow = function (fields) {
	var row = {};
	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		var name = field.name;
		switch (field.type) {
		case 'B':
			var len = this.getInt();
			if (len > this.buff.length) {
				throw new Error('数据异常');
			};
			row[name] = this.get(len);
			break;
		case 'S':
			len = this.getInt();
			if (len > this.buff.length) {
				throw new Error('数据异常');
			};
			row[name] = getStringFromByteArrs(this.get(len))
			break;
		case 'C':
			row[name] = this.getChar();
			break;
		case 'T':
			row[name] = this.getShort();
			break;
		case 'N':
			row[name] = this.getInt();
			break;
		case 'L':
			row[name] = this.getLong();
			break;
		case '1':
			row[name] = this.getCompressLong();
			break;
		case '2':
			row[name] = this.getCompressInt();
			break;
		case '3':
			row[name] = this.getCompressDateTime();
			break;
		case 'F':
			row[name] = this.getFloat();
			break;
		case 'D':
			row[name] = this.getDouble();
			break;
		default:
			console.log('未知类型:' + field.type);
			break;
		}
	};
	return row;
};

Packet.prototype.get = function (count) {
	var temp = [];
	for (var i = 0; i < count; i++) {
		temp.push(this.buff.shift());
	};
	return temp;
};

Packet.prototype.getChar = function () {
	String.fromCharCode(this.buff.shift());
};

Packet.prototype.getShort = function () {
	var b0 = this.buff.shift();
	var b1 = this.buff.shift();
	return (b0 << 8) | (b1 & 0xff);
}

Packet.prototype.getInt = function () {
	var b0 = this.buff.shift();
	var b1 = this.buff.shift();
	var b2 = this.buff.shift();
	var b3 = this.buff.shift();
	var addr = b3 & 0xFF;
	addr |= ((b2 << 8) & 0xFF00);
	addr |= ((b1 << 16) & 0xFF0000);
	addr |= ((b0 << 24) & 0xFF000000);
	return addr;
};

Packet.prototype.getLong = function () {
	var b0 = this.buff.shift();
	var b1 = this.buff.shift();
	var b2 = this.buff.shift();
	var b3 = this.buff.shift();
	var b4 = this.buff.shift();
	var b5 = this.buff.shift();
	var b6 = this.buff.shift();
	var b7 = this.buff.shift();
	return (((b0 & 0xff) << 56) | ((b1 & 0xff) << 48) | ((b2 & 0xff) << 40) | ((b3 & 0xff) << 32) | ((b4 & 0xff) << 24) | ((b5 & 0xff) << 16) | ((b6 & 0xff) << 8) | ((b7 & 0xff) << 0));
};

Packet.prototype.getCompressDateTime = function () {
	var intDateTime = this.getInt();
	var minute = intDateTime & 0x3F;
	var hour = (intDateTime >>> 6) & 0x1F;
	var day = (intDateTime >>> 11) & 0x1F;
	var month = (intDateTime >>> 16) & 0x0F;
	var year = (intDateTime >>> 20) & 0x0FFF;
	var longDateTime = year * 10000000000 + month * 100000000 + day * 1000000 + hour * 10000 + minute * 100;
	return longDateTime;
};

Packet.prototype.getCompressInt = function () {
	var val = 0;
	var b;
	var ind = 0;
	do {
		b = this.buff.shift();
		if (ind == 0 && (b & 0x40) != 0) {
			val = 0xffffffff;
		}
		ind++;
		val = (val << 7) | (b & 0x7f);
	} while ((b & 0x80) == 0);
	return val;
};

Packet.prototype.getCompressLong = function () {
	var val = 0;
	var b;
	var ind = 0;
	do {
		b = this.buff.shift();
		if (ind == 0 && (b & 0x40) != 0) {
			val = 0xffffffffffffffff;
		}
		ind++;
		val = (val << 7) | (b & 0x7f);
	} while ((b & 0x80) == 0);
	return val;
};

Packet.prototype.getFloat = function () {
	return intBitsToFloat(this.getInt());
};

Packet.prototype.getDouble = function () {
	var b0 = this.buff.shift();
	var b1 = this.buff.shift();
	var b2 = this.buff.shift();
	var b3 = this.buff.shift();
	var b4 = this.buff.shift();
	var b5 = this.buff.shift();
	var b6 = this.buff.shift();
	var b7 = this.buff.shift();

	var signed = b0 & 0x80;
	var e = (b1 & 0xF0) >> 4;
	e += (b0 & 0x7F) << 4;

	var m = b7;
	m += b6 << 8;
	m += b5 << 16;
	m += b4 * Math.pow(2, 24);
	m += b3 * Math.pow(2, 32);
	m += b2 * Math.pow(2, 40);
	m += (b1 & 0x0F) * Math.pow(2, 48);

	switch (e) {
	case 0:
		e = -1022
		break;
	case 2047:
		return m ? NaN : (signed ? -Infinity : Infinity);
	default:
		m += Math.pow(2, 52);
		e -= 1023;
	}
	if (signed) {
		m *= -1;
	}
	return m * Math.pow(2, e - 52);
};

function intBitsToFloat(i) {
	var int8 = new Int8Array(4); //[0,0,0,0]
	var int32 = new Int32Array(int8.buffer, 0, 1); //0
	var float32 = new Float32Array(int8.buffer, 0, 1); //0
	int32[0] = i;
	return float32[0];
};

function getBytesFromString(str) {
	var utf8 = unescape(encodeURIComponent(str));
	var arr = [];
	for (var i = 0; i < utf8.length; i++) {
		arr.push(utf8.charCodeAt(i));
	}
	return arr;
}

function getStringFromByteArrs(arr) {
	var i, str = '';
	for (i = 0; i < arr.length; i++) {
		str += '%' + ('0' + arr[i].toString(16)).slice(-2);
	}
	str = decodeURIComponent(str);
	return str;
}
