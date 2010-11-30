Servers.SubcontentTab.ChartPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.showChartDelegate =  this.showChart.createDelegate(this);
	this.updateChartDelegate =  this.updateChart.createDelegate(this);
    },

    makeComponents: function() {
	Servers.SubcontentTab.ChartPanel.superclass.constructor.call(this, {
	    border: false,
	    items: [{
		html: 'CPU use',
		bodyStyle: {
		    padding: '3px'
		},
		border: false
	    }, {
		layout: "fit",
		itemId: 'container',
		border: false,
		width: 400,
		height: 250
	    }],
	    listeners: {
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
	    }
	});
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showChartDelegate);
	servers.on('monitorServer', this.updateChartDelegate);
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showChartDelegate);
	servers.un('monitorServer', this.updateChartDelegate);
    },

    showChart: function(item) {
	if (this.currentItem && this.currentItem.server.id == item.server.id)
	    return;

	this.chart = new Servers.SubcontentTab.Chart({
	    url: item.server.paths.monitor
	});

	var container = this.getComponent('container');
	container.removeAll();
	container.add(this.chart);

	this.currentItem = item;
    },

    updateChart: function() {
	if (this.chart && this.chart.isVisible())
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
	    series: [{
		yField: "cpu_use",
		style: {
		    size: 0
		}
	    }],
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
