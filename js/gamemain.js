$(document).ready(function () {
	var status = 0,
		totolmoney = 100000,
		buy = 0,
		holdnum = 0;
	var game = new GameChart('game');
	game.finish(function (price) {
		alert("一共获利：" + (totolmoney + holdnum * price).toFixed(0) + "元");
		status = 0;
		totolmoney = 100000;
		holdnum = 0;
	});
	game.pricechange(function (price) {
		var profit = (price - buy) * holdnum;
		var color = '#745719';
		if (profit < 0) {
			color = '#2CA332';
		} else if (profit > 0) {
			color = '#FF333D';
		}
		$('#current_profit').css('color', color);
		$('#current_profit').text(profit.toFixed(2));
	});

	$('#operate').click(function (e) {
		switch (status) {
		case 0:
			$('#operate').text('买');
			game.next();
			status = 1;
			break;
		case 1:
			if (game.buy()) {
				buy = game.getPrice();
				holdnum = totolmoney / game.getPrice();
				totolmoney = 0;
				status = 2;
				$('#operate').text('卖');
			}
			break;
		case 2:
			if (game.sell()) {
				totolmoney = holdnum * game.getPrice();
				holdnum = 0;
				status = 1;
				$('#operate').text('买');
			}
			break;
		case 3:
			game.reset();
			$('#operate').text('开始游戏');
			status = 0;
			break;
		default:
			break;
		}

		$('#total_profit').text(totolmoney.toFixed(2));

	});

	$('#download').click(function () {
		//TODO 修改下载地址
		location.href = 'http://www.baidu.com';
	});
});
