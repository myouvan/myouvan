Servers.SubcontentTab = Ext.extend(Ext.TabPanel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('addTag');
	this.addEvents('destroyTag');
    },

    makeComponents: function() {
	this.descriptionPanel = new Servers.SubcontentTab.DescriptionPanel();
	this.chartPanel = new  Servers.SubcontentTab.ChartPanel();
	this.tagsPanel = new Servers.SubcontentTab.TagsPanel();

	Servers.SubcontentTab.superclass.constructor.call(this, {
	    activeTab: 0,
	    layoutOnTabChange: true,
	    border: false,
	    items: [
		{
		    title: 'Description',
		    autoScroll: true,
		    items: this.descriptionPanel,
		    border: false,
		    bodyStyle: {
			padding: '10px'
		    }
		},
		{
		    title: 'Monitoring',
		    autoScroll: true,
		    items: this.chartPanel,
		    border: false,
		    bodyStyle: {
			padding: '10px'
		    }
		},
		{
		    title: 'Tags',
		    autoScroll: true,
		    items: this.tagsPanel,
		    border: false,
		    bodyStyle: {
			padding: '10px'
		    }
		}
	    ]
	});
    }

});
