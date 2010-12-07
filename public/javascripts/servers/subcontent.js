Servers.Subcontent = Ext.extend(Ext.TabPanel, {

    constructor: function() {
	this.makeComponents();
	this.initHandlers();
    },

    makeComponents: function() {
	this.description = new Servers.Subcontent.Description();
	this.monitoring = new  Servers.Subcontent.Monitoring();
	this.tags = new Servers.Subcontent.Tags();
	this.failoverTargets = new Servers.Subcontent.FailoverTargets();

	Servers.Subcontent.superclass.constructor.call(this, {
	    activeTab: 0,
	    layoutOnTabChange: true,
	    border: false,
	    defaults: {
		autoScroll: true,
		border: false,
		bodyStyle: {
		    padding: '10px'
		}
	    },
	    items: [{
		title: 'Description',
		itemId: 'description',
		items: this.description
	    }, {
		title: 'Monitoring',
		itemId: 'monitoring',
		items: this.monitoring
	    }, {
		title: 'Tags',
		itemId: 'tags',
		items: this.tags
	    }, {
		title: 'Failover Targets',
		itemId: 'failoverTargets',
		items: this.failoverTargets
	    }],
	    listeners: {
		tabchange: this.updateChart.createDelegate(this)
	    }
	});
    },

    initHandlers: function() {
	this.setDynamicHandlers({
	    target: servers,
	    handlers: {
		event: 'monitorServer',
		fn: this.updateChart
	    }
	});
    },

    updateChart: function() {
	if (this.getActiveTab().itemId == 'monitoring')
	    this.monitoring.updateChart();
    }

});
