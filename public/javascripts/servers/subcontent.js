Servers.SubcontentTab = Ext.extend(Ext.TabPanel, {

    constructor: function() {
	this.makeComponents();
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
    },

    makeComponents: function() {
	this.descriptionPanel = new Servers.SubcontentTab.DescriptionPanel();
	this.chartPanel = new  Servers.SubcontentTab.ChartPanel();
	this.tagsPanel = new Servers.SubcontentTab.TagsPanel();

	var tab = this;
	this.tagsPanel.addTag = function(tag) {
	    tab.addTag(tag);
	};
	this.tagsPanel.destroyTag = function(config) {
	    tab.destroyTag(config)
	};
    },

    showContent: function(item) {
	this.descriptionPanel.showContent(item);
	this.chartPanel.showContent(item);
	this.tagsPanel.showContent(item);
    },

    updateValues: function(item) {
	this.descriptionPanel.updateValues(item);
    },

    updateMonitor: function() {
	this.chartPanel.updateMonitor();
    },

    updateTags: function() {
	this.tagsPanel.updateTags();
    }

});
