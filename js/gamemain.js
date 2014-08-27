$(document).ready(function () {
	var status = 0,
		totolmoney = 100000,
		holdnum = 0;
	var game = new GameChart('game');
	game.finish(function (price) {
		alert("一共获利：" + (totolmoney + holdnum * price).toFixed(0) + "元");
		status = 0;
		totolmoney = 100000;
		holdnum = 0;
	});
	$('#operate').click(function (e) {
		switch (status) {
		case 0:
			e.target.childNodes[0].nodeValue = '买';
			game.next();
			status = 1;
			break;
		case 1:
			if (game.buy()) {
				holdnum = totolmoney / game.getPrice();
				totolmoney = 0;
				status = 2;
				e.target.childNodes[0].nodeValue = '卖';
			}
			break;
		case 2:
			if (game.sell()) {
				totolmoney = holdnum * game.getPrice();
				holdnum = 0;
				status = 1;
				e.target.childNodes[0].nodeValue = '买';
			}
			break;
		case 3:
			game.reset();
			e.target.childNodes[0].nodeValue = '开始游戏';
			status = 0;
			break;
		default:
			break;
		}
	});
});
