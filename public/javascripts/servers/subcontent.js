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
		    bodyStyle: 'padding: 10px'
		},
		{
		    title: 'Monitoring',
		    autoScroll: true,
		    items: this.chartPanel,
		    border: false,
		    bodyStyle: 'padding: 10px'
		}
	    ]
	});
    },

    makeComponents: function() {
	this.descriptionPanel = new Servers.SubcontentTab.DescriptionPanel();
	this.chartPanel = new  Servers.SubcontentTab.ChartPanel();
    },

    showContent: function(server, interfaces, monitorPath) {
	this.descriptionPanel.showContent(server, interfaces);
	this.chartPanel.showContent(monitorPath);
    },

    updateValues: function(item) {
	this.descriptionPanel.updateValues(item);
    },

    updateMonitor: function() {
	this.chartPanel.updateMonitor();
    }

});
