Servers.SubcontentTab.ChartPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
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
		this.container
	    ]
	});
    },

    makeComponents: function() {
	this.makeContainer();
    },

    makeContainer: function() {
	this.container = new Ext.Panel({
	    layout: "fit",
	    border: false,
	    width: 400,
	    height: 250
	});
    },

    showContent: function(monitorPath) {
	this.store = new Ext.ux.ItemsStore({
	    url: monitorPath,
	    autoLoad: true,
	    fields: [
		'index',
		'cpu_use'
	    ]
	});

	var chart = new Ext.chart.LineChart({
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

	this.container.removeAll();
	this.container.add(chart);
    },

    updateMonitor: function() {
	if (this.store)
	    this.store.reload();
    }

});
