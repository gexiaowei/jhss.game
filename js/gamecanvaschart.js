/**
 * @description  Game Chart for html5
 * @param {String} id the Id of svg element
 */
function GameChart(id) {
	var canvas = document.getElementById(id);
	this.context = canvas.getContext('2d');
	this.width = canvas.offsetWidth;
	canvas.width = this.width;
	canvas.height = 500;
	this.height = canvas.offsetHeight * 2 / 3;
	this.height_assist = canvas.offsetHeight / 3;
	this.reset();
}

/**
 *@description the array of all stock codes
 *@const
 */
GameChart.prototype.ALL_STOCK_CODES = ['11600037', '11600070', '11600104', '11600137', '11600201', '11600211', '11600243', '11600265', '11600317', '11600343', '11600351', '11600370', '11600455', '11600522', '11600523', '11600660', '11600661', '11600674', '11600681', '11600719', '11600732', '11600768', '11600879', '11600886', '11600892', '11600967', '11601199', '11601231', '11601801', '21000055', '21000099', '21000418', '21000421', '21000511', '21000534', '21000550', '21000565', '21000566', '21000702', '21000802', '21000803', '21000887', '21000890', '21000909', '21000917', '21000920', '21000951', '21002030', '21002066', '21002072', '21002089', '21002107', '21002115', '21002121', '21002124', '21002158', '21002173', '21002183', '21002188', '21002207', '21002215', '21002221', '21002227', '21002228', '21002260', '21002300', '21002323', '21002345', '21002354', '21002372', '21002380', '21002388', '21002401', '21002418', '21002421', '21002427', '21002459', '21002467', '21002472', '21002496', '21002510', '21002522', '21002576', '21002579', '21002595', '21002615', '21002632', '21002650', '21300011', '21300033', '21300066', '21300092', '21300107', '21300116', '21300156', '21300181', '21300200', '21300207', '21300233', '21300261', '21300272', '21300283'];

/**
 *@description the array of all stock names
 *@const
 */
GameChart.prototype.ALL_STOCK_NAMES = ['歌华有线', '浙江富润', '上汽集团', '浪莎股份', '金宇集团', '西藏药业', '青海华鼎', 'ST景谷', '营口港', '航天动力', '亚宝药业', '三房巷', '博通股份', '中天科技', '贵航股份', '福耀玻璃', '新南洋', '川投能源', '万鸿集团', '大连热电', '上海新梅', '宁波富邦', '航天电子', '国投电力', '宝诚股份', '北方创业', '江南水务', '环旭电子', '皖新传媒', '方大集团', '中信海直', '小天鹅Ａ', '南京中北', '烯碳新材', '万泽股份', '江铃汽车', '渝三峡Ａ', '海南海药', '正虹科技', '北京旅游', '金宇车城', '中鼎股份', '法尔胜', '数源科技', '电广传媒', '南方汇通', '中国重汽', '达安基因', '瑞泰科技', '德棉股份', '新海宜', '沃华医药', '三维通信', '科陆电子', '天邦股份', '汉钟精机', '千足珍珠', '怡亚通', '新嘉联', '准油股份', '诺普信', '东华能源', '奥特迅', '合兴包装', '伊立浦', '太阳电缆', '中联电气', '潮宏基', '科冕木业', '伟星新材', '科远股份', '新亚制程', '中海科技', '康盛股份', '达实智能', '尤夫股份', '*ST天业', '二六三', '双环传动', '辉丰股份', '天汽模', '浙江众成', '通达动力', '中京电子', '豪迈科技', '哈尔斯', '道明光学', '加加食品', '鼎汉技术', '同花顺', '三川股份', '科新机电', '建新股份', '坚瑞消防', '神雾环保', '佐力药业', '高盟新材', '欣旺达', '金城医药', '雅本化学', '开能环保', '温州宏丰'];

/**
 *@description the max point count of whole screen
 *@const
 */
GameChart.prototype.MAX_COUNT = 60;

/**
 *@description clear the svg and reinit all data
 */
GameChart.prototype.reset = function () {
	this.clear();
	this.init();
};

GameChart.prototype.clear = function () {
	//TODO 背景和分割线
	this.context.clearRect(0, 0, this.width, this.height + this.height_assist);
	this.context.beginPath();
	this.context.rect(0, 0, this.width, this.height + this.height_assist);
	this.context.closePath();
	this.context.fillStyle = '#F3C659';
	this.context.fill();
	this.context.beginPath();
	this.context.moveTo(0, this.height);
	this.context.lineTo(this.width, this.height);
	this.context.strokeStyle = '#000';
	this.context.stroke();
}

/**
 *@description init the datas which use for game from network
 */
GameChart.prototype.init = function () {
	var index = parseInt((this.ALL_STOCK_CODES.length * Math.random()).toFixed(0)),
		stockcode = this.ALL_STOCK_CODES[index],
		stockname = this.ALL_STOCK_NAMES[index],
		size = this.MAX_COUNT + 60,
		gal = new GalHttpRequest('http://220.181.47.36/quote/kline/day/list?code={code}&xrdrtype={xrdrtype}&pageindex={pageindex}&pagesize={pagesize}', {
			code: stockcode,
			xrdrtype: '0',
			pageindex: '1',
			pagesize: size
		}),
		self = this;
	gal.requestPacketFromNet({
		success: function (data) {
			self.load(data);
		},
		error: function (error) {
			self.throwerror(error);
		}
	});
	this.stockname = stockname;
};

/**
 *@description load the game datas
 *@param {Object} datas the datas from network
 *klinedata contains endDate, open, high, low, close, amount, money
 */
GameChart.prototype.load = function (data) {
	var index_init = this.MAX_COUNT - 1;
	this.index_current = index_init;
	var temp_datas = data.kline;
	if (!temp_datas || temp_datas.length === 0) {
		return;
	}

	//数据集合
	var klinedatas = [];
	this.array_mark = [];

	var temp_data = {
		enddate: 0,
		open: 0,
		high: 0,
		low: 0,
		close: 0,
		amount: 0,
		money: 0
	};

	var temp_total = [0, 0, 0],
		avg_interval = [5, 10, 20];

	//初始化数据
	for (var i = 0; i < temp_datas.length; i++) {
		var data = temp_datas[i];
		for (var param in temp_data) {
			if (param != 'enddate' && param != 'amount') {
				temp_data[param] += data[param];
			} else {
				temp_data[param] = data[param];
			}
		}
		//临时存储变量
		var temp = {
			endDate: temp_data.enddate,
			open: temp_data.open / 1000,
			high: temp_data.high / 1000,
			low: temp_data.low / 1000,
			close: temp_data.close / 1000,
			amount: temp_data.amount,
			money: temp_data.money / 1000,
			avg: []
		};
		//均线数据
		for (var m = 0; m < temp_total.length; m++) {
			temp_total[m] += temp.close;
			temp_total[m] -= (klinedatas[i - avg_interval[m]] ? klinedatas[i - avg_interval[m]].close : 0);
			temp.avg[m] = (i < (avg_interval[m] - 1) ? null : temp_total[m] / avg_interval[m]);
		}
		//起始和结束时间计算
		if (i == 0) {
			this.startdate = temp.endDate;
		} else if (i == temp_datas.length - 1) {
			this.enddate = temp.endDate;
		}
		//放入变量
		klinedatas.push(temp);
		this.array_mark.push(0);
	}

	this.klinedatas = klinedatas;
	this.showchart();
};

/**
 *@description do when an error throw in load datas from network
 *@param{Object} datas the error info
 */
GameChart.prototype.throwerror = function (data) {
	console.log(data);
};

/**
 *@description init chart while data init
 */
GameChart.prototype.showchart = function () {
	this.clear();
	if (!this.width_per) {
		this.width_per = this.width / (this.MAX_COUNT * 3 - 1);
	}
	this.offset = Math.max(this.index_current - this.MAX_COUNT + 1, 0);
	var high, low, high_assist;
	for (var i = this.offset; i < this.MAX_COUNT + this.offset; i++) {
		var temp = this.klinedatas[i];
		if (i == this.offset) {
			high = temp.high;
			low = temp.low;
			high_assist = temp.amount;
		} else {
			high = Math.max(high, temp.high);
			low = Math.min(low, temp.low);
			high_assist = Math.max(high_assist, temp.amount);
		}
	}
	this.high = high;
	this.low = low;
	this.high_assist = high_assist;
	this.points_avg = [];
	for (var i = 0; i < this.MAX_COUNT; i++) {
		this.add(i);
	}
	var colors = ["#00ace5", "#cd8e06", "#c32ec3"];
	for (var m = 0; m < colors.length; m++) {
		this.context.beginPath();
		for (var n = this.points_avg.length - 1; n >= 0; n--) {
			var point = this.points_avg[n];
			if (!point.y[m]) {
				break;
			}
			if (n == 0) {
				this.context.moveTo(point.x, point.y[m]);
			} else {
				this.context.lineTo(point.x, point.y[m]);
			}
		}
		this.context.strokeStyle = colors[m];
		this.context.lineWidth = 1;
		this.context.stroke();
	}
	for (var i = this.offset; i < this.MAX_COUNT + this.offset; i++) {
		if (this.array_mark[i] != 0) {
			this.addMark(this.array_mark[i], i);
		}
	}
};

/**
 *@description show next point
 */
GameChart.prototype.next = function () {
	this.index_current++;
	var data = this.klinedatas[this.index_current];
	if (!data) {
		if (this.finishcallback) {
			var price = this.klinedatas[this.klinedatas.length - 1].close;
			this.finishcallback(this.startdate, this.enddate, this.stockname, price);
		}
		return;
	}
	if (this.pricecallback) {
		this.pricecallback(data.close);
	}
	this.showchart();
	var self = this;
	setTimeout(function () {
		self.next();
	}, 500);
};

GameChart.prototype.add = function (index) {

	this.height_per = this.height / (this.high - this.low);
	this.height_per_assist = this.height_assist / this.high_assist;

	var data = this.klinedatas[index + this.offset],
		x = (3 * index + 1) * this.width_per,
		y_high = (this.high - data.high) * this.height_per,
		y_low = (this.high - data.low) * this.height_per,
		y_open = (this.high - data.open) * this.height_per,
		y_close = (this.high - data.close) * this.height_per,
		y_assist = this.height + (this.high_assist - data.amount) * this.height_per_assist;

	if (data.open > data.close) {
		color = '#29922C';
	} else if (data.open < data.close) {
		color = '#FB1728';
	} else {
		color = '#ffffff';
		y_open -= 1;
		y_close += 1;
	}

	var y_avg = [];
	for (var i = 0; i < data.avg.length; i++) {
		y_avg.push(data.avg[i] ? (this.high - data.avg[i]) * this.height_per : null);
	}

	this.context.beginPath();
	this.context.moveTo(x, y_high);
	this.context.lineTo(x, y_low);
	this.context.strokeStyle = color;
	this.context.lineWidth = 1;
	this.context.stroke();

	this.context.beginPath();
	this.context.moveTo(x, y_open);
	this.context.lineTo(x, y_close);
	this.context.strokeStyle = color;
	this.context.lineWidth = 2 * this.width_per;
	this.context.stroke();

	this.context.beginPath();
	this.context.moveTo(x, y_assist);
	this.context.lineTo(x, this.height + this.height_assist);
	this.context.strokeStyle = color;
	this.context.lineWidth = 2 * this.width_per;
	this.context.stroke();

	this.points_avg.push({
		x: x,
		y: y_avg
	});
};

/**
 *@description do a transform after a new point add to the svg chart
 */
GameChart.prototype.transform = function () {

};

/**
 *@description buy the stock in the current index point
 */
GameChart.prototype.buy = function () {
	if (this.array_mark[this.index_current] == 0) {
		this.addMark(1, this.index_current);
		this.array_mark[this.index_current] = 1;
		return true;
	}
	return false;
};

/**
 *@description sell the stock in the current index point
 */
GameChart.prototype.sell = function () {
	if (this.array_mark[this.index_current] == 0) {
		this.addMark(-1, this.index_current);
		this.array_mark[this.index_current] = -1;
		return true;
	}
	return false;
};

/**
 *@description return the close price at the current index
 */
GameChart.prototype.getPrice = function () {
	var data = this.klinedatas[this.index_current];
	if (!data) {
		data = this.klinedatas[this.klinedatas.length - 1];
	}
	return data.close;
};

/**
 *@description add a callback function while the game finish
 *@param{Function} callback the callback while the game finish
 */
GameChart.prototype.finish = function (callback) {
	this.finishcallback = callback;
};

/**
 *@description add a callback function while the price changed
 *@param{Function} callback the callback while the price changed
 */
GameChart.prototype.pricechange = function (callback) {
	this.pricecallback = callback;
};

/**
 *@description add a buy or sell mark in the postion of a point at index
 *@param{string} tag buy or sell
 */
GameChart.prototype.addMark = function (flag, index) {
	if (!this.klinedatas[index]) {
		return;
	}
	var a1 = 1.8,
		a2 = 5 / 9,
		a3 = 7 / 9,
		r = 15;
	var value = null,
		color = '',
		text_flag = '';
	switch (flag) {
	case 1:
		value = this.klinedatas[index].high;
		text_flag = '买';
		color = '#FF333D';
		break;
	case -1:
		value = this.klinedatas[index].low;
		color = '#2CA332';
		text_flag = '卖';
		break;
	default:
		break;
	}
	if (!value) {
		return;
	}

	var point = {
		x: (3 * (index - this.offset) + 1) * this.width_per,
		y: (this.high - value) * this.height_per
	};
	var x1 = point.x,
		y1 = point.y,
		x2 = point.x + r,
		y2 = point.y + (-a1 * r + a3 * r) * flag,
		x3 = point.x + r,
		y3 = point.y - flag * a1 * r,
		x4 = point.x + r,
		y4 = point.y + (-a1 * r - a2 * r) * flag,
		x5 = point.x + a2 * r,
		y5 = point.y - flag * (1 + a1) * r,
		x6 = point.x,
		y6 = point.y - flag * (1 + a1) * r,
		x7 = point.x - a2 * r,
		y7 = point.y - flag * (1 + a1) * r,
		x8 = point.x - r,
		y8 = point.y - flag * (a1 + a2) * r,
		x9 = point.x - r,
		y9 = point.y - flag * a1 * r,
		x10 = point.x - r,
		y10 = point.y + (-a1 * r + a3 * r) * flag;

	this.context.beginPath();
	this.context.moveTo(x1, y1);
	this.context.bezierCurveTo(x1, y1, x2, y2, x3, y3);
	this.context.bezierCurveTo(x4, y4, x5, y5, x6, y6);
	this.context.bezierCurveTo(x7, y7, x8, y8, x9, y9);
	this.context.bezierCurveTo(x10, y10, x1, y1, x1, y1);
	this.context.closePath();
	this.context.fillStyle = color;
	this.context.fill();

	this.context.font = "12pt Calibri";
	this.context.fillStyle = '#fff';
	this.context.textAlign = 'center';
	this.context.textBaseline = "middle";
	this.context.fillText(text_flag, x1, y1 - flag * a1 * r);

};
