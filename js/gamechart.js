/**
 * @description  Game Chart for html5
 * @param {String} id the Id of svg element
 */
function GameChart(id) {
	var snap = new Snap('#' + id)
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
	var gal = new GalHttpRequest('http://220.181.47.36/quote/kline/day/list?code={code}&xrdrtype={xrdrtype}&pageindex={pageindex}&pagesize={pagesize}', {
		code: stockcode,
		xrdrtype: '0',
		pageindex: '1',
		pagesize: this.MAX_COUNT + 60
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
	this.index_current = index_init;
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
	this.group_kline = this.s.g();
	for (var i = 0; i < this.MAX_COUNT; i++) {
		var data = this.klinedatas[i];
		var x = (3 * i + 1) this.width_per,
			y_high = (this.high - data.high) * this.height_per,
			y_low = (this.high - data.low) * this.height_per,
			y_open = (this.high - data.open) * this.height_per,
			y_close = (this.high - data.close) * this.height_per;
		var line_hl = this.s.line(x, y_high, x, y_low).attr({
			stroke: '#000',
			strokeWidth: 2
		});
		var line_oc = this.s.line(x, y_open, x, y_close).attr({
			stroke: '#000',
			strokeWidth: 2 * this.width_per
		});
		this.group_kline.add(line_hl);
		this.group_kline.add(line_oc);
	}
	this.next();
};

/**
 *@description show next point
 */
GameChart.prototype.next = function () {
	this.index_current++;
};

/**
 *@description buy the stock in the current index point
 *use all money
 */
GameChart.prototype.buy = function () {

};

/**
 *@description sell the stock in the current index point
 *use all money
 */
GameChart.prototype.sell = function () {

};
