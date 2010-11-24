Servers.SubcontentTab.ChartPanel = function() {

    var container = new Ext.Panel({
	layout: "fit",
	border: false,
	width: 400,
	height: 250
    });

    Servers.SubcontentTab.ChartPanel.baseConstructor.apply(this, [{
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

    this.showContent = function(monitorPath) {
	var store = new itemsStore(monitorPath, [
	    'index',
	    'cpu_use'
	]);
	store.load();

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
	if (panel.store)
	    panel.store.reload();
    };

};

Servers.SubcontentTab.ChartPanel.inherit(Ext.Panel);
