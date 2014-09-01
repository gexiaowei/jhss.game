$(document).ready(function () {
	var status = 0,
		totolmoney = 100000,
		buy = 0,
		holdnum = 0;
	var game = new GameChart('game');
	game.finish(function (startdate, enddate, stockname, price) {
		var reslut = [startdate, enddate, stockname, (totolmoney + holdnum * price)];
		setreslut(reslut);
		$('#operate').text('再来一次');
		status = 3;
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
			$('#gameprofit').removeAttr("style");
			$('#gamecontainer').removeAttr("style");
			$('#gamend').css('display', 'none');
			$('#operate').text('开始游戏');
			game.reset();
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


function setreslut(reslut) {
	$('#gameprofit').css('display', 'none');
	$('#gamecontainer').css('display', 'none');
	$('#gamend').removeAttr("style");

	$('#date').text(getdate(reslut[0]) + '至' + getdate(reslut[1]));
	$('#stockname').text(reslut[2]);
	var proift = reslut[3];
	var color = '#FF2633';
	if (proift < 100000) {
		color = '#29922C';
	}
	$('#profitunit').css('color', color);
	$('#profittotal').css('color', color);
	$('#profittotal').text(proift.toFixed(2));

	dataForWeixin.desc = 'zheshiyigeceshi';
	setShareInfo();
};

function getdate(dateint) {
	var datestr = (dateint / 1000000).toFixed(0);
	return datestr.substr(0, 4) + '-' + datestr.substr(4, 2) + '-' + datestr.substr(6, 2);
}
