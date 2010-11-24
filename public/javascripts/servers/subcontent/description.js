Servers.SubcontentTab.DescriptionPanel = function() {

    var propPanels = new Array();
    var valuePanels = new Array();

    var addPropPanel = function(field, label, colspan) {
	var valuePanel = new Ext.Panel({
	    border: false,
	    padding: '0 0 0 10px',
	});
	valuePanels[field] = valuePanel;

	var propPanel =  new Ext.Panel({
	    items: new Ext.Panel({
		layout: 'hbox',
		width: colspan == 1 ? 340 : 687,
		border: false,
		items: [
		    {
			border: false,
			width: 130,
			bodyStyle: {
			    fontWeight: 'bold',
			    textAlign: 'right'
			},
			html: label + ':'
		    },
		    valuePanel
		]
	    }),
	    colspan: colspan
	});
	propPanels.push(propPanel);
    };

    addPropPanel('name', 'Name', 2),
    addPropPanel('uuid', 'UUID', 2),
    addPropPanel('title', 'Title', 2),
    addPropPanel('status', 'Status', 1),
    addPropPanel('auto_restart', 'Auto Restart', 1),
    addPropPanel('zone', 'Zone', 1),
    addPropPanel('virtualization', 'Virtualization', 1),
    addPropPanel('physical_server', 'Physical Server', 1),
    addPropPanel('pool', 'Pool', 1),
    addPropPanel('storage_iqn', 'Storage IQN', 2),
    addPropPanel('cpus', 'CPUs', 1),
    addPropPanel('memory', 'Memory(MB)', 1)

    for (var i = 0; i < 2; ++i) {
	addPropPanel('ip_address' + i, 'IP Address(' + (i + 1) + ')', 1),
	addPropPanel('mac_address' + i, 'Mac Address(' + (i + 1) + ')', 1)
    }

    addPropPanel('avatar', 'Avatar', 2)
    
    Servers.SubcontentTab.DescriptionPanel.baseConstructor.apply(this, [{
	layout: 'table',
	defaults: {
	    padding: '3px',
	    border: false
	},
	layoutConfig: {
	    columns: 2
	},
	border: false,
	items: propPanels
    }]);

    this.showContent = function(server, interfaces) {
	for (var field in server)
	    if (valuePanels[field])
		valuePanels[field].update(server[field]);

	for (var i = 0; i < interfaces.length; ++i)
	    for (var field in interfaces[i])
		if (valuePanels[field + i])
		    valuePanels[field + i].update(interfaces[i][field]);

	avatarImg = '<img src="' + server.paths.avatarThumb + '" width="150" height="150" />';
	valuePanels['avatar'].update(avatarImg);
    };

    this.updateValues = function(item) {
	for (var field in item)
	    if (valuePanels[field])
		valuePanels[field].update(item[field]);
    };

};

Servers.SubcontentTab.DescriptionPanel.inherit(Ext.Panel);
