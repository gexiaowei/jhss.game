/**
 * @description  Game Chart for html5
 * @param {String} id the Id of svg element
 */
function GameChart(id) {
	var snap = new Snap('#' + id);
	snap.rect().attr({
		width: '100%',
		height: '100%',
		fill: '#F3C659'
	});
	this.s = snap;
	this.width = snap.attr('width');
	this.height = snap.attr('height');
	this.init();
};

/**
 *@description the array of all stock codes
 *@const
 */
GameChart.prototype.ALL_STOCK_CODES = ['11600666'];

/**
 *@description the array of all stock names
 *@const
 */
GameChart.prototype.ALL_STOCK_NAMES = [''];

/**
 *@description the max point count of whole screen
 *@const
 */
GameChart.prototype.MAX_COUNT = 60;

/**
 *@description init the datas which use for game from network
 */
GameChart.prototype.init = function () {
	var index = parseInt((this.ALL_STOCK_CODES.length * Math.random()).toFixed(0));
	var stockcode = this.ALL_STOCK_CODES[index];
	var size = this.MAX_COUNT + 60;
	var gal = new GalHttpRequest('http://220.181.47.36/quote/kline/day/list?code=11600666&xrdrtype=0&pageindex=1&pagesize=120', {
		code: stockcode,
		xrdrtype: '0',
		pageindex: '1',
		pagesize: size
	});
	var self = this;
	gal.requestPacketFromNet({
		success: function (data) {
			self.load(data);
		},
		error: function (error) {
			this.throwerror(error);
		}
	});
};

/**
 *@description load the game datas
 *@param {Object} datas the datas from network
 *klinedata contains endDate, open, high, low, close, amount, money
 */
GameChart.prototype.load = function (data) {
	var index_init = this.MAX_COUNT - 1;
	this.index_current = 0;
	var temp_datas = data.kline;
	if (!temp_datas || temp_datas.length === 0) {
		return;
	}

	var klinedatas = [];

	var temp_data = {
		endDate: 0,
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
		low = 0;

	for (var i = 0; i < temp_datas.length; i++) {
		var data = temp_datas[i];
		for (var param in temp_data) {
			temp_data[param] += data[param];
		}
		var temp = {
			endDate: temp_data.endDate,
			open: temp_data.open / 1000,
			high: temp_data.high / 1000,
			low: temp_data.low / 1000,
			close: temp_data.close / 1000,
			amount: temp_data.amount,
			money: temp_data.money / 1000
		};

		klinedatas.push(temp);

		if (i == 0) {
			high = temp.high;
			low = temp.low;
		} else {
			high = Math.max(high, temp.high);
			low = Math.min(low, temp.low);
		}
		//show 60 points while data init
		if (i == index_init) {
			temp_high = high;
			temp_low = low;
		}
	}

	this.high = high;
	this.low = low;
	this.temp_high = temp_high;
	this.temp_low = temp_low;
	this.klinedatas = klinedatas;
	this.showchart();
};

/**
 *@description do when an error throw in load datas from network
 *@param{Object} datas the error info
 */
GameChart.prototype.throwerror = function (datas) {

};

/**
 *@description init chart while data init
 */
GameChart.prototype.showchart = function () {
	this.width_per = this.width / (this.MAX_COUNT * 3 - 1);
	this.height_per = this.height / (this.high - this.low);
	this.group_scaleable = this.s.g();
	this.group_unscaleable = [];
	for (var i = 0; i < this.MAX_COUNT; i++) {
		this.index_current = i;
		this.add(i);
	}
	//transform the matrix of scale and translate
	this.transform();
	this.next();
};

/**
 *@description show next point
 */
GameChart.prototype.next = function () {
	this.index_current++;
	var data = this.klinedatas[this.index_current];
	if (!data) {
		return;
	}
	this.temp_high = data.high;
	this.temp_low = data.low;
	for (var i = this.index_current - 1; i > this.index_current - 60; i--) {
		var temp_data = this.klinedatas[i];
		this.temp_high = Math.max(this.temp_high, temp_data.high);
		this.temp_low = Math.min(this.temp_low, temp_data.low);
	}

	this.add(this.index_current);
	this.transform();
	var self = this;
	setTimeout(function () {
		self.next();
	}, 300);
};

GameChart.prototype.add = function (index) {
	var data = this.klinedatas[index],
		x = (3 * index + 1) * this.width_per,
		y_high = (this.high - data.high) * this.height_per,
		y_low = (this.high - data.low) * this.height_per,
		y_open = (this.high - data.open) * this.height_per,
		y_close = (this.high - data.close) * this.height_per;

	var color = '#fff';
	if (data.open > data.close) {
		color = '#29922C';
	} else if (data.open < data.close) {
		color = '#FB1728';
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
};

GameChart.prototype.transform = function () {
	//调整整体
	var m = new Snap.Matrix();
	var scale_y = (this.high - this.low) / (this.temp_high - this.temp_low);
	var scale_point_y = (this.high - this.temp_high) * this.height / (this.high - this.low + this.temp_low - this.temp_high);
	m.scale(1, scale_y, 0, scale_point_y);
	m.translate(-Math.max(this.index_current - (this.MAX_COUNT - 1), 0) * this.width_per * 3, 0);
	this.group_scaleable.transform(m);
	//调整特殊形状
	for (var i = 0; i < this.group_unscaleable.length; i++) {
		var unscaleable = this.group_unscaleable[i];
		var postion_y_new = (this.temp_high - unscaleable.value) * this.height / (this.temp_high - this.temp_low),
			postion_y_ori = (this.high - unscaleable.value) * this.height_per,
			m_single = new Snap.Matrix();
		m_single.translate(-Math.max(this.index_current - (this.MAX_COUNT - 1), 0) * this.width_per * 3, postion_y_new - postion_y_ori);
		unscaleable.shape.transform(m_single);
	}
}

/**
 *@description buy the stock in the current index point
 *use all money
 */
GameChart.prototype.buy = function () {
	var data = this.klinedatas[this.index_current];
	var price = data.close;
};

/**
 *@description sell the stock in the current index point
 *use all money
 */
GameChart.prototype.sell = function () {
	var data = this.klinedatas[this.index_current];
	var price = data.close;
};
