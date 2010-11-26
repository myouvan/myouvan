Servers.SubcontentTab.ChartPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeChartContainer();

	Servers.SubcontentTab.ChartPanel.superclass.constructor.call(this, {
	    border: false,
	    items: [
		{
		    html: 'CPU use',
		    bodyStyle: {
			padding: '3px'
		    },
		    border: false
		},
		this.chartContainer
	    ],
	    listeners: {
		added: this.addEventHandlers,
		destroy: this.removeEventHandlers
	    }
	});
    },

    makeChartContainer: function() {
	this.chartContainer = new Ext.Panel({
	    layout: "fit",
	    border: false,
	    width: 400,
	    height: 250
	});
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showChart.createDelegate(this));
	servers.on('monitorServer', this.updateChart.createDelegate(this));
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showChart.createDelegate(this));
	servers.un('monitorServer', this.updateChart.createDelegate(this));
    },

    showChart: function(item) {
	this.chart = new Servers.SubcontentTab.Chart({
	    url: item.server.paths.monitor
	});

	this.chartContainer.removeAll();
	this.chartContainer.add(this.chart);
    },

    updateChart: function() {
	if (this.chart)
	    this.chart.store.load();
    }

});

Servers.SubcontentTab.Chart = Ext.extend(Ext.chart.LineChart, {

    constructor: function(config) {
	this.makeComponents(config);
    },

    makeComponents: function(config) {
	this.makeStore(config);

	Servers.SubcontentTab.Chart.superclass.constructor.call(this, {
	    store: this.store,
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
    },

    makeStore: function(config) {
	this.store = new Ext.ux.ItemsStore({
	    url: config.url,
	    autoLoad: true,
	    fields: [
		'index',
		'cpu_use'
	    ]
	});
    }

});
