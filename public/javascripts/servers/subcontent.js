Servers.SubcontentTab = function() {

    var descriptionPanel = new Servers.SubcontentTab.DescriptionPanel();
    var chartPanel = new  Servers.SubcontentTab.ChartPanel();

    Servers.SubcontentTab.baseConstructor.apply(this, [{
	activeTab: 0,
	layoutOnTabChange: true,
	border: false,
	items: [
	    {
		title: 'Description',
		autoScroll: true,
		items: descriptionPanel,
		border: false,
		bodyStyle: 'padding: 10px'
            },
	    {
		title: 'Monitoring',
		autoScroll: true,
		items: chartPanel,
		border: false,
		bodyStyle: 'padding: 10px'
	    }
	]
    }]);

    this.showContent = function(server, interfaces, monitorPath) {
	descriptionPanel.showContent(server, interfaces);
	chartPanel.showContent(monitorPath);
    };

    this.updateValues = function(item) {
	descriptionPanel.updateValues(item);
    };

    this.updateMonitor = function() {
	chartPanel.updateMonitor();
    };

};

Servers.SubcontentTab.inherit(Ext.TabPanel);
