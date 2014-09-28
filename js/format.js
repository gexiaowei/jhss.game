/**
 * 格式化大数据
 * @param   {Number} num 大数据
 * @returns {String} 格式完成的字符串
 */
function formatBigNum(num) {
	if (Math.abs(num) < 10000) {
		this.num = num.toFixed(2);
		this.unit = '';
	} else if (Math.abs(num) >= 10000 && Math.abs(num) < 100000000) {
		this.num = (num / 10000).toFixed(2);
		this.unit = '万';
	} else {
		this.num = (num / 100000000).toFixed(2);
		this.unit = '亿';
	}
}

formatBigNum.prototype.toString = function () {
	return this.num + this.unit;
}
