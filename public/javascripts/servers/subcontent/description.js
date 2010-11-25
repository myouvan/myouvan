Servers.SubcontentTab.DescriptionPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.SubcontentTab.DescriptionPanel.superclass.constructor.call(this, {
	    layout: 'table',
	    defaults: {
		padding: '3px',
		border: false
	    },
	    layoutConfig: {
		columns: 2
	    },
	    border: false,
	    items: [
		this.propPanels['name'],
		this.propPanels['uuid'],
		this.propPanels['title'],
		this.propPanels['status'],
		this.propPanels['auto_restart'],
		this.propPanels['zone'],
		this.propPanels['virtualization'],
		this.propPanels['physical_server'],
		this.propPanels['pool'],
		this.propPanels['storage_iqn'],
		this.propPanels['cpus'],
		this.propPanels['memory'],
		this.propPanels['ip_address0'],
		this.propPanels['mac_address0'],
		this.propPanels['ip_address1'],
		this.propPanels['mac_address1'],
		this.propPanels['avatar']
	    ]
	});
    },

    makeComponents: function() {
	this.makePropPanels();
    },

    makePropPanels: function() {
	this.propPanels = {
	    name: new Servers.SubcontentTab.PropPanel({
		label: 'Name',
		colspan: 2
	    }),
	    uuid: new Servers.SubcontentTab.PropPanel({
		label: 'UUID',
		colspan: 2
	    }),
	    title: new Servers.SubcontentTab.PropPanel({
		label: 'Title',
		colspan: 2
	    }),
	    status: new Servers.SubcontentTab.PropPanel({
		label: 'Status',
		colspan: 1
	    }),
	    auto_restart: new Servers.SubcontentTab.PropPanel({
		label: 'Auto Restart',
		colspan: 1
	    }),
	    zone: new Servers.SubcontentTab.PropPanel({
		label: 'Zone',
		colspan: 1
	    }),
	    virtualization: new Servers.SubcontentTab.PropPanel({
		label: 'Virtualization',
		colspan: 1
	    }),
	    physical_server: new Servers.SubcontentTab.PropPanel({
		label: 'Physical Server',
		colspan: 1
	    }),
	    pool: new Servers.SubcontentTab.PropPanel({
		label: 'Pool',
		colspan: 1
	    }),
	    storage_iqn: new Servers.SubcontentTab.PropPanel({
		label: 'Storage IQN',
		colspan: 2
	    }),
	    cpus: new Servers.SubcontentTab.PropPanel({
		label: 'CPUs',
		colspan: 1
	    }),
	    memory: new Servers.SubcontentTab.PropPanel({
		label: 'Memory(MB)',
		colspan: 1
	    }),
	    ip_address0: new Servers.SubcontentTab.PropPanel({
		label: 'IP Address(1)',
		colspan: 1
	    }),
	    mac_address0: new Servers.SubcontentTab.PropPanel({
		label: 'Mac Address(1)',
		colspan: 1
	    }),
	    ip_address1: new Servers.SubcontentTab.PropPanel({
		label: 'IP Address(2)',
		colspan: 1
	    }),
	    mac_address1: new Servers.SubcontentTab.PropPanel({
		label: 'Mac Address(2)',
		colspan: 1
	    }),
	    avatar: new Servers.SubcontentTab.PropPanel({
		label: 'Avatar',
		colspan: 2
	    })
	};
    },

    showContent: function(server, interfaces) {
	for (var field in server)
	    if (this.propPanels[field])
		this.propPanels[field].setValue(server[field]);

	for (var i = 0; i < interfaces.length; ++i)
	    for (var field in interfaces[i])
		if (this.propPanels[field + i])
		    this.propPanels[field + i].setValue(interfaces[i][field]);

	avatarImg = '<img src="' + server.paths.avatarThumb + '" width="150" height="150" />';
	this.propPanels['avatar'].setValue(avatarImg);
    },

    updateValues: function(item) {
	for (var field in item)
	    if (this.propPanels[field])
		this.propPanels[field].setValue(item[field]);
    }

});

Servers.SubcontentTab.PropPanel = Ext.extend(Ext.Panel, {

    constructor: function(config) {
	this.makeValuePanel();
	Servers.SubcontentTab.PropPanel.superclass.constructor.call(this, {
	    items: new Ext.Panel({
		layout: 'hbox',
		width: config.colspan == 1 ? 340 : 687,
		border: false,
		items: [
		    {
			border: false,
			width: 130,
			bodyStyle: {
			    fontWeight: 'bold',
			    textAlign: 'right'
			},
			html: config.label + ':'
		    },
		    this.valuePanel
		]
	    }),
	    colspan: config.colspan
	});
    },

    makeValuePanel: function() {
	this.valuePanel = new Ext.Panel({
	    border: false,
	    padding: '0 0 0 10px',
	});
    },

    setValue: function(value) {
	this.valuePanel.update(value);
    }

});
