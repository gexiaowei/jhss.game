$(document).ready(function () {
	var status = 0,
		totolmoney = 100000,
		buy = 0,
		holdnum = 0,
		clickable = true;
	var game = new GameChart('game', {
		onloadstart: function () {
			$('.load').show();
		},
		onloadend: function () {
			$('.load').hide();
		}
	});
	game.finish(function (startdate, enddate, stockname, price) {
		clickable = false;
		var reslut = [startdate, enddate, stockname, (totolmoney + holdnum * price) - 100000];
		setreslut(reslut);
		$('#operate').css('background-color', '#FD5359');
		$('#operate').text('再来一次');
		status = 3;
		totolmoney = 100000;
		holdnum = 0;
		setTimeout(function () {
			clickable = true;
		}, 2000);
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
		$('#total_profit').text((totolmoney + holdnum * price).toFixed(2));
	});

	$('#operate').click(function (e) {
		if (!clickable) {
			return;
		}
		$('#operate').css('background-color', '#FD5359');
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
				$('#operate').css('background-color', '#3aa400');
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
			$('.fund').show();
			$('.chart').show();
			$('.sharebar').hide();
			$('.gamereslut').hide();
			$('#operate').text('开始游戏');
			resetDatas();
			game.reset();
			status = 0;
			break;
		default:
			break;
		}
	});

	$('#download_mncg').click(function () {
		window.open('http://www.youguu.com/download/mncg_code.html');
	});
	$('#download_yglc').click(function () {
		window.open('http://www.youguu.com/download/yglc_code.html');
	});
});


function resetDatas() {
	$('#total_profit').text('100000.00');
	$('#current_profit').text('0.00');
}

function setreslut(reslut) {
	$('.fund').hide();
	$('.chart').hide();
	$('.sharebar').show();
	$('.gamereslut').show();

	$('#date').text(getdate(reslut[0]) + '至' + getdate(reslut[1]));
	$('#stockname').text(reslut[2]);
	var proift = reslut[3];
	var color = '#FF2633';
	if (proift < 0) {
		color = '#29922C';
	}
	$('#profitunit').css('color', color);
	$('#profittotal').css('color', color);
	$('#profittotal').text(proift.toFixed(2));

	var appraisal = getAppraisal(proift);
	$('#appraisal').text(appraisal);
	var desc = '我在优顾模拟炒股内';
	desc += (proift >= 0 ? '赚' : '亏');
	desc += Math.abs(proift).toFixed(2);
	desc += '元！';
	desc += appraisal;
	dataForWeixin.desc = desc;
	setShareInfo();
};

function getdate(dateint) {
	var datestr = (dateint / 1000000).toFixed(0);
	return datestr.substr(0, 4) + '-' + datestr.substr(4, 2) + '-' + datestr.substr(6, 2);
}

function getAppraisal(profit) {
	var profitpercent = profit / 1000;
	var appraisal;
	if (0 <= profitpercent && profitpercent < 5) {
		appraisal = '哎呀，赚的这么少！不如去优顾理财找个靠谱的理财方法吧！';
	} else if (5 <= profitpercent && profitpercent < 15) {
		appraisal = '看大门的老孙都比你牛，再接再厉啦，╮(╯▽╰)╭';
	} else if (15 <= profitpercent && profitpercent < 35) {
		appraisal = '一“大波”IPHONE 6在向你招手！';
	} else if (35 <= profitpercent && profitpercent < 50) {
		appraisal = '收益不错嘛，去换辆跑车追女神吧！';
	} else if (50 <= profitpercent && profitpercent < 80) {
		appraisal = '英雄！小伙伴儿们都惊呆了！';
	} else if (80 <= profitpercent && profitpercent < 90) {
		appraisal = '传说中的股神！去优顾模拟炒股里拯救世界吧！';
	} else if (90 <= profitpercent) {
		appraisal = '已经超神了！人生巅峰就此开展！';
	} else if (-5 <= profitpercent && profitpercent < 0) {
		appraisal = '留的青山在，不怕没柴烧，改日再战！';
	} else if (-15 <= profitpercent && profitpercent < -5) {
		appraisal = '麻麻，股市好可怕';
	} else if (-35 <= profitpercent && profitpercent < -15) {
		appraisal = '惨”，求小伙伴们请吃饭';
	} else if (-50 <= profitpercent && profitpercent < -35) {
		appraisal = '谁借我一件衣服，我觉得好冷啊';
	} else {
		appraisal = '也是传奇！精确反向指标！';
	}
	return appraisal;
}
