Servers.Subcontent.Monitoring = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.showChartDelegate =  this.showChart.createDelegate(this);
    },

    makeComponents: function() {
	Servers.Subcontent.Monitoring.superclass.constructor.call(this, {
	    border: false,
	    items: [{
		xtype: 'container',
		html: 'CPU use',
		bodyStyle: {
		    padding: '3px'
		}
	    }, {
		xtype: 'container',
		layout: 'fit',
		itemId: 'container',
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
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showChartDelegate);
    },

    showChart: function(item) {
	if (this.currentItem && this.currentItem.id == item.id)
	    return;

	this.chart = new Servers.Subcontent.Chart({
	    url: item.paths.monitor
	});

	var container = this.getComponent('container');
	container.removeAll();
	container.add(this.chart);

	this.currentItem = item;
    },

    updateChart: function() {
	if (this.chart)
	    this.chart.store.load();
    }

});

Servers.Subcontent.Chart = Ext.extend(Ext.chart.LineChart, {

    constructor: function(config) {
	this.makeComponents(config);
    },

    makeComponents: function(config) {
	this.makeStore(config);

	Servers.Subcontent.Chart.superclass.constructor.call(this, {
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
