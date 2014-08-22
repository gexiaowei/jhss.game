/**
 * @description  Game Chart for html5
 * @param {type} id the Id of svg element
 */
function GameChart(id) {
	this.snap = new Snap('#' + id);
	this.init();
};

/***/
GameChart.prototype.init = function () {
	var gal = new GalHttpRequest('');
	gal.requestFromNet({
		success: this.load(datas),
		error: this.throwerror(datas)
	});
};

GameChart.prototype.load = function (datas) {

};

GameChart.prototype.throwerror = function (datas) {

}

GameChart.prototype.buy = function () {

};

GameChart.prototype.sell = function () {

};
