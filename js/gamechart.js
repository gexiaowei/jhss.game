/**
 * @description  Game Chart for html5
 * @param {String} id the Id of svg element
 */
function GameChart(id) {
	this.snap = new Snap('#' + id);
	this.init();
};

/**
 *@description the array of all stock codes
 *@const
 */
GameChart.prototype.ALL_STOCK_CODES = ['600037'];

GameChart.prototype.ALL_STOCK_NAMES = []

/**
 *@description init the datas which use for game from network
 */
GameChart.prototype.init = function () {
	var index_stock = parseInt((Math.random() * this.ALL_STOCK_CODES.length).toFixed(0));
	var gal = new GalHttpRequest('http://220.181.47.36/quote/kline/day/list?code={code}&xrdrtype={xrdrtype}&pageindex={pageindex}&pagesize={pagesize}', {
		code: this.ALL_STOCK_CODES[index_stock],
		xrdrtype: '0',
		pageindex: '0',
		pagesize: '120'
	});
	gal.requestPacketFromNet({
		success: this.load,
		error: this.throwerror
	});
};

/**
 *@description load the game datas
 *@param {Object} datas the datas from network
 */
GameChart.prototype.load = function (datas) {
	console.log(datas);
};

/**
 *@description do when an error throw in load datas from network
 *@param{Object} datas the error info
 */
GameChart.prototype.throwerror = function (datas) {

}

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
