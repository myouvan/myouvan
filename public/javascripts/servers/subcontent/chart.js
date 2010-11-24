var ChartPanel = function() {

    var container = new Ext.Panel({
	layout: "fit",
	border: false,
	width: 400,
	height: 250
    });

    ChartPanel.baseConstructor.apply(this, [{
	border: false,
	items: [
	    {
		html: 'CPU use',
		bodyStyle: {
		    padding: '3px'
		},
		border: false
	    },
	    container
	]
    }]);

    var panel = this;

    this.showContent = function(store) {
	var chart = new Ext.chart.LineChart({
	    store: store,
	    xField: 'index',
	    series: [
		{
		    yField: "cpu_use",
		    style: {
			size: 0
		    }
		}
	    ],
	    extraStyle: {
		animationEnabled: false,
		xAxis: {
		    showLabels:false
		}
	    },
	    xAxis: new Ext.chart.NumericAxis({
		maximum: 49,
		minimum: 0
	    }),
	    yAxis: new Ext.chart.NumericAxis({
		maximum: 100,
		minimum: 0
	    })
	});

	container.removeAll();
	container.add(chart);
	panel.store = store;
    };

    this.updateMonitor = function() {
	panel.store.reload();
    };

};

ChartPanel.inherit(Ext.Panel);
