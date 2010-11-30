Servers.SubcontentTab = Ext.extend(Ext.TabPanel, {

    constructor: function() {
	this.makeComponents();
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
		items: this.descriptionPanel,
	    }, {
		title: 'Monitoring',
		items: this.chartPanel,
	    }, {
		title: 'Tags',
		items: this.tagsPanel,
	    }]
	});
    }

});
