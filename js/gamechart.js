/**
 * @description  Game Chart for html5
 * @param {String} id the Id of svg element
 */
function GameChart(id) {
	var snap = new Snap('#' + id);
	this.s = snap;
	this.width = snap.asPX('width');
	this.height = snap.attr('height') * 2 / 3;
	this.height_assist = snap.attr('height') / 3;
	this.s.rect().attr({
		width: '100%',
		height: '100%',
		fill: '#F3C659'
	});
	this.s.line(0, this.height, this.width, this.height).attr({
		stroke: '#000',
		strokeWidth: 0.5,
		fill: 'transparent'
	});
	this.init();
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
	this.group_scaleable.remove();
	for (var i = 0; i < this.group_unscaleable.length; i++) {
		this.group_unscaleable[i].shape.remove();
	}
	for (var i = 0; i < this.group_line_avg.length; i++) {
		this.group_line_avg[i].remove();
	}
	this.init();
};

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
	this.index_mark = [];
};

/**
 *@description load the game datas
 *@param {Object} datas the datas from network
 *klinedata contains endDate, open, high, low, close, amount, money
 */
GameChart.prototype.load = function (data) {
	console.log(data);
	var index_init = this.MAX_COUNT - 1;
	this.index_current = 0;
	var temp_datas = data.kline;
	if (!temp_datas || temp_datas.length === 0) {
		return;
	}

	var klinedatas = [];

	var temp_data = {
		enddate: 0,
		open: 0,
		high: 0,
		low: 0,
		close: 0,
		amount: 0,
		money: 0
	};

	var temp_high = 0,
		temp_low = 0,
		high = 0,
		low = 0,
		temp_high_assist = 0,
		high_assist = 0;

	var temp_total = [0, 0, 0];
	var avg_interval = [5, 10, 20];
	for (var i = 0; i < temp_datas.length; i++) {
		var data = temp_datas[i];
		for (var param in temp_data) {
			if (param != 'enddate' && param != 'amount') {
				temp_data[param] += data[param];
			} else {
				temp_data[param] = data[param];
			}
		}

		console.log(temp);

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

		for (var m = 0; m < temp_total.length; m++) {
			temp_total[m] += temp.close;
			temp_total[m] -= (klinedatas[i - avg_interval[m]] ? klinedatas[i - avg_interval[m]].close : 0);
			temp.avg[m] = (i < (avg_interval[m] - 1) ? null : temp_total[m] / avg_interval[m]);
		}

		klinedatas.push(temp);
		if (i == 0) {
			high = temp.high;
			low = temp.low;
			high_assist = temp.amount;
		} else {
			high = Math.max(high, temp.high);
			low = Math.min(low, temp.low);
			high_assist = Math.max(high_assist, temp.amount);
		}
		//show 60 points while data init
		if (i == index_init) {
			temp_high = high;
			temp_low = low;
			temp_high_assist = high_assist;
		}

		if (i == 0) {
			this.startdate = temp.endDate;
		} else if (i == temp_datas.length - 1) {
			this.enddate = temp.endDate;
		}

	}

	this.high = high;
	this.low = low;
	this.high_assist = high_assist;
	this.temp_high = temp_high;
	this.temp_low = temp_low;
	this.temp_high_assist = temp_high_assist;
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
	this.width_per = this.width / (this.MAX_COUNT * 3 - 1);
	this.height_per = this.height / (this.high - this.low);
	this.height_per_assist = this.height_assist / this.high_assist;
	this.group_scaleable = this.s.g();
	this.group_other = this.s.g();

	this.s.rect(0, this.height, this.width, this.height_assist).attr({
		fill: '#F3C659'
	});
	this.group_assist = this.s.g();
	this.group_unscaleable = [];
	this.group_line_avg = [];
	var colors = ["#00ace5", "#cd8e06", "#c32ec3"];
	for (var i = 0; i < 3; i++) {
		var polyline = this.s.polyline().attr({
			stroke: colors[i],
			fill: 'transparent'
		});
		this.group_other.add(polyline);
		this.group_line_avg.push(polyline);
	}
	for (var i = 0; i < this.MAX_COUNT; i++) {
		this.index_current = i;
		this.add(i);
	}
	//transform the matrix of scale and translate
	this.transform();
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
	this.temp_high = data.high;
	this.temp_low = data.low;
	this.temp_high_assist = data.amount;
	for (var i = this.index_current - 1; i > this.index_current - 60; i--) {
		var temp_data = this.klinedatas[i];
		this.temp_high = Math.max(this.temp_high, temp_data.high);
		this.temp_low = Math.min(this.temp_low, temp_data.low);
		this.temp_high_assist = Math.max(this.temp_high_assist, temp_data.amount);
	}

	this.add(this.index_current);
	this.transform();

	var self = this;
	setTimeout(function () {
		self.next();
	}, 100);
};

GameChart.prototype.add = function (index) {
	var data = this.klinedatas[index],
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
	}

	//均线设置
	for (var m = 0; m < data.avg.length; m++) {
		var points = [];
		for (var n = 0; n <= index; n++) {
			if (this.klinedatas[n].avg[m]) {
				points.push((3 * n + 1) * this.width_per);
				points.push((this.temp_high - this.klinedatas[n].avg[m]) * this.height / (this.temp_high - this.temp_low));
			}
		}
		this.group_line_avg[m].attr({
			points: points
		});
	}

	var line_hl = this.s.line(x, y_high, x, y_low).attr({
		stroke: color,
		strokeWidth: 1
	});
	this.group_scaleable.add(line_hl);
	if (data.open == data.close) {
		var line_cross = this.s.line(x - this.width_per, y_open, x + this.width_per, y_open).attr({
			stroke: color,
			strokeWidth: 1
		});
		this.group_other.add(line_cross);
		this.group_unscaleable.push({
			shape: line_cross,
			value: data.open
		});
	} else {
		var line_oc = this.s.line(x, y_open, x, y_close).attr({
			stroke: color,
			strokeWidth: 2 * this.width_per
		});
		this.group_scaleable.add(line_oc);
	}
	var line_assist = this.s.line(x, y_assist, x, this.height + this.height_assist).attr({
		stroke: color,
		strokeWidth: 2 * this.width_per
	});
	this.group_assist.add(line_assist);
};

/**
 *@description do a transform after a new point add to the svg chart
 */
GameChart.prototype.transform = function () {
	var length_move = -Math.max(this.index_current - (this.MAX_COUNT - 1), 0) * this.width_per * 3;
	//调整整体
	var m = new Snap.Matrix();
	var scale_y = (this.high - this.low) / (this.temp_high - this.temp_low);
	var scale_point_y = (this.high - this.temp_high) * this.height / (this.high - this.low + this.temp_low - this.temp_high);
	m.scale(1, scale_y, 0, scale_point_y);
	m.translate(length_move, 0);
	this.group_scaleable.transform(m);
	//调整特殊形状
	for (var i = 0; i < this.group_unscaleable.length; i++) {
		var unscaleable = this.group_unscaleable[i];
		var postion_y_new = (this.temp_high - unscaleable.value) * this.height / (this.temp_high - this.temp_low),
			postion_y_ori = (this.high - unscaleable.value) * this.height_per,
			m_single = new Snap.Matrix();
		m_single.translate(length_move, postion_y_new - postion_y_ori);
		unscaleable.shape.transform(m_single);
	}
	var m_line = new Snap.Matrix();
	m_line.translate(length_move, 0);
	for (var i = 0; i < this.group_line_avg.length; i++) {
		this.group_line_avg[i].transform(m_line);
	}

	var m_assist = new Snap.Matrix();
	m_assist.scale(1, this.high_assist / this.temp_high_assist, 0, this.height + this.height_assist);
	m_assist.translate(length_move, 0);
	this.group_assist.transform(m_assist);
};

/**
 *@description buy the stock in the current index point
 */
GameChart.prototype.buy = function () {
	if (this.index_mark.indexOf(this.index_current) == -1) {
		this.addMark('buy');
		this.index_mark.push(this.index_current);
		return true;
	}
	return false;
};

/**
 *@description sell the stock in the current index point
 */
GameChart.prototype.sell = function () {
	if (this.index_mark.indexOf(this.index_current) == -1) {
		this.addMark('sell')
		this.index_mark.push(this.index_current);
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
GameChart.prototype.addMark = function (tag) {
	if (!this.klinedatas[this.index_current]) {
		return;
	}
	var a1 = 1.8,
		a2 = 5 / 9,
		a3 = 7 / 9,
		r = 15;
	var value = null,
		color = '',
		flag = 1,
		text_flag = '';
	switch (tag) {
	case 'buy':
		value = this.klinedatas[this.index_current].high;
		text_flag = '买';
		color = '#FF333D';
		break;
	case 'sell':
		value = this.klinedatas[this.index_current].low;
		color = '#2CA332';
		flag = -1;
		text_flag = '卖';
		break;
	default:
		break;
	}
	if (!value) {
		return;
	}

	var point = {
		x: (3 * this.index_current + 1) * this.width_per,
		y: (this.high - value) * this.height_per
	};

	var d = Snap.format('M{x1},{y1}C{x1},{y1},{x2},{y2},{x3},{y3}C{x4},{y4},{x5},{y5},{x6},{y6}C{x7},{y7},{x8},{y8},{x9},{y9}C{x10},{y10},{x1},{y1},{x1},{y1}', {
		x1: point.x,
		y1: point.y,
		x2: point.x + r,
		y2: point.y + (-a1 * r + a3 * r) * flag,
		x3: point.x + r,
		y3: point.y - flag * a1 * r,
		x4: point.x + r,
		y4: point.y + (-a1 * r - a2 * r) * flag,
		x5: point.x + a2 * r,
		y5: point.y - flag * (1 + a1) * r,
		x6: point.x,
		y6: point.y - flag * (1 + a1) * r,
		x7: point.x - a2 * r,
		y7: point.y - flag * (1 + a1) * r,
		x8: point.x - r,
		y8: point.y - flag * (a1 + a2) * r,
		x9: point.x - r,
		y9: point.y - flag * a1 * r,
		x10: point.x - r,
		y10: point.y + (-a1 * r + a3 * r) * flag
	});

	var mark = this.s.path(d).attr({
		fill: color,
	});
	var marktext = this.s.text(point.x, point.y - flag * a1 * r, text_flag).attr({
		fill: '#fff',
		'font-size': r,
		'text-anchor': 'middle',
		'dominant-baseline': 'middle'

	});
	var group_mark = this.s.g();
	group_mark.add(mark, marktext);
	var postion_y_new = (this.temp_high - value) * this.height / (this.temp_high - this.temp_low),
		postion_y_ori = (this.high - value) * this.height_per,
		m_single = new Snap.Matrix();
	m_single.translate(-Math.max(this.index_current - (this.MAX_COUNT - 1), 0) * this.width_per * 3, postion_y_new - postion_y_ori);
	group_mark.transform(m_single);
	this.group_unscaleable.push({
		value: value,
		shape: group_mark
	});
};
