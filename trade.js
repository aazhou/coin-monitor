var request = require('request'),
	moment = require('moment'),
	mailer = require('nodemailer'),
	util = require('util');

var okTickerUrl = 'https://www.okcoin.com/api/ticker.do?symbol=ltc_cny';
var last = 0.0;
var percentForNotify = 0.3;

var Monitor = function () {
	var self = this;

	this.fetchTicker = function () {
		request(okTickerUrl, function (error, resp, body) {
			if (error) {
				console.error(error);
				return;
			}

			var result = JSON.parse(body);
			var current = parseFloat(result.ticker.last);
			var changePercent = ((current - last) / current) * 100;

			var content = util.format('[%s]\n当前价格为: %s\n上一次价格: %s\n变动比率:%s% \n==============', moment().format('MMMM Do YYYY, h:mm:ss a'),current, last, changePercent);
			console.log(content);

			if (last != 0 && Math.abs(changePercent) > percentForNotify) {
				self.notifyEmail(content);
			}
			last = current;
		});
	};


	this.notifyEmail = function (content, callback) {
		var transport = mailer.createTransport("SMTP",{
		    service: "qq",
		    auth: {
		        user: "zhoulong@fishsaying.com",
		        pass: "xxxxxx"
		    }
		});
		var mailOptions = {
		    from: "Aaron.L.Zhou <zhoulong@fishsaying.com>",
		    to: 'zhoulong@fishsaying.com, vigorpro@gmail.com, livehl@126.com',
		    subject: "OKCoin 价格监控通知", 
		    text: content
		};

		transport.sendMail(mailOptions, function(error, response) {
			if (callback) {
				callback();
			}
		    
		    if(error){
		        console.error(error);
		        return;
		    }
		    console.warn(util.format('已邮件通知'));
		});
	};
};

var monitor = new Monitor();

setInterval(function (){ monitor.fetchTicker();}, 5000);

process.on('uncaughtException', function (err) {
	console.error(err);
    console.error(err.stack);

    monitor.notifyEmail(err+'\n'+err.stack, function(){
    	process.exit(0);
    });
});


