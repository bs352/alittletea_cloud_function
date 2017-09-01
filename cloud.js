var AV = require('leanengine');

AV.Cloud.define('requestPast', function(request) {
	var result = [];

	var offset = 86400000;

	var doQuery = function(date) {
		var query = new AV.Query('Snapshot');
		query.limit(1);
		query.addDescending('date');
		query.lessThanOrEqualTo('date', date);
		query.greaterThanOrEqualTo('date', new Date(date.getTime() - offset));
		
		return query.find();
	};

	var dayBefore = function(date) {
		return new Date(date.getTime() - offset);
	};

	var findInDailyReport = function(date, reports) {
		var report = null;
		var lookupTime = new Date(date.iso);
		if (reports) {
		  for (var i = 0; i < reports.length; i++) {
			  var r = reports[i].toJSON();

			  var reportTime = new Date(r.date.iso);
			  // Find the max report whose date is less than 'date' in param
			  if (reportTime.getFullYear() == lookupTime.getFullYear() 
				  && reportTime.getMonth() == lookupTime.getMonth() 
				  && reportTime.getDate() == lookupTime.getDate() 
				  )
			  {
				  report = r;
			  }
		  }
		}
		if (report === null) {
			return 0;
		}
		else {
			//if (new Date(reportTime).getDate() == new Date(lookup))
			return report.cup;
		}
	};

	var date = new Date();

	date = dayBefore(date);
	
	return doQuery(date)
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			date = dayBefore(date);
			return doQuery(date);
		})
		.then(function(objects) {
			result.push(objects[0]);
			
			var query = new AV.Query('DailyReport');
			query.limit(7);
			query.addDescending('date');
			query.lessThanOrEqualTo('date', new Date());
			
			return query.find();
		})
		.then(function(objects) {
			var new_result = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i]) {
					var r = result[i].toJSON();
					r.totalcup = findInDailyReport(r.date, objects);
					new_result.push(r);
				}
			}
			return new_result;
		});
});

AV.Cloud.define('recordDaily', function(request) {
	var query = new AV.Query('Snapshot');
	query.limit(1)
	query.addDescending('date');
	query.lessThanOrEqualTo('date', new Date());
	query.greaterThanOrEqualTo('date', new Date(new Date().getTime() - 86400000));

	var getReportDate = function() {
		var now = new Date(); // 4AM in the morning in Beijing Time
		var then =  new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
		then = new Date(then.getTime() - 86400000);
		return then;
	}

	return query.find().then(function(objects){
		var DailyReport = AV.Object.extend('DailyReport');
		var report = new DailyReport();
		
		var s = objects[0];
		if (s) {
		  report.set('date', getReportDate());
		  report.set('cup', s.get('cup'));
		  report.set('sales', s.get('sales'));
		  report.set('orders', s.get('orders'));
		  
		  return report.save();
		}
		else {
		  report.set('date', getReportDate());
		  report.set('cup', 0);
		  report.set('sales', 0);
		  report.set('orders', 0);  
		  
		  return report.save();
		}
	}).then(function() {
		return 'ok';
	});
});