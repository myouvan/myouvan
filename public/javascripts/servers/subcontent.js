Servers.SubcontentTab = Ext.extend(Ext.TabPanel, {

    constructor: function() {
	this.makeComponents();

	this.updateChartDelegate =  this.updateChart.createDelegate(this);
    },

    makeComponents: function() {
	this.descriptionPanel = new Servers.SubcontentTab.DescriptionPanel();
	this.chartPanel = new  Servers.SubcontentTab.ChartPanel();
	this.tagsPanel = new Servers.SubcontentTab.TagsPanel();

	Servers.SubcontentTab.superclass.constructor.call(this, {
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
		items: this.descriptionPanel
	    }, {
		title: 'Monitoring',
		itemId: 'monitoring',
		items: this.chartPanel
	    }, {
		title: 'Tags',
		itemId: 'tags',
		items: this.tagsPanel
	    }],
	    listeners: {
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this),
		tabchange: this.updateChart.createDelegate(this)
	    }
	});
    },

    addEventHandlers: function() {
	servers.on('monitorServer', this.updateChartDelegate);
    },

    removeEventHandlers: function() {
	servers.un('monitorServer', this.updateChartDelegate);
    },

    updateChart: function() {
	if (this.getActiveTab().itemId == 'monitoring')
	    this.chartPanel.updateChart();
    }

});
