var SubcontentTab = function() {

    var descriptionPanel = new DescriptionPanel();
    var chartPanel = new ChartPanel();

    SubcontentTab.baseConstructor.apply(this, [{
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

    this.showContent = function(server, interfaces, monitorStore) {
	descriptionPanel.showContent(server, interfaces);
	chartPanel.showContent(monitorStore);
    };

    this.updateStatus = function(item) {
	descriptionPanel.updateStatus(item);
    };

    this.updateMonitor = function() {
	chartPanel.updateMonitor();
    };

};

SubcontentTab.inherit(Ext.TabPanel);
