Servers.NewServerWindow.FailoverTargets = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.failoverTargetsGrid = new Servers.NewServerWindow.FailoverTargetsGrid();
	this.makeAddComponents();

	Servers.NewServerWindow.FailoverTargets.superclass.constructor.call(this, {
	    title: 'Add Failover Targets',
	    itemId: 'failoverTargets',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    padding: 10,
	    items: [{
		xtype: 'container',
		width: 300,
		layout: 'vbox',
		layoutConfig: {
		    align: 'stretch'
		},
		items: [
		    {
			xtype: 'container',
			flex: 1,
			layout: 'fit',
			items: this.failoverTargetsGrid
		    },
		    this.addComponents
		]
	    }, {
		xtype: 'container',
		itemId: 'container'
	    }]
	});
    },

    makeAddComponents: function() {
	this.addComponents = {
	    xtype: 'container',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    height: 23,
	    margins: '5 0 0 0',
	    items: [{
		flex: 1,
		xtype: 'storecombobox',
		itemId: 'addCombo',
		style: {
		    marginTop: Ext.isIE ? '1px' : '0px'
		},
		storeConfig: {
		    url: paths.servers.physical_servers
		}
	    }, {
		width: 120,
		xtype: 'container',
		margins: '0 0 0 5',
		layout: 'anchor',
		items: {
		    anchor: '100%',
		    xtype: 'button',
		    text: 'Add Failover Target',
		    handler: function() {
			var addCombo = this.find('itemId', 'addCombo')[0];
			var physicalServer = addCombo.getValue();
			if (physicalServer == '')
			    return;
			this.failoverTargetsGrid.addFailoverTarget(physicalServer);
			addCombo.reset();
		    },
		    scope: this
		}
	    }]
	};
    },

    setPhysicalServer: function(config) {
	if (this.zone != config.zone)
	    this.failoverTargetsGrid.removeAll();

	this.zone = config.zone;
	this.physicalServer = config.physicalServer;

	var addCombo = this.find('itemId', 'addCombo')[0];
	addCombo.getStore().baseParams.zone = this.zone;
	addCombo.getStore().baseParams.except = this.physicalServer;
	addCombo.getStore().load();
    },

    onNext: function() {
	var container = this.getComponent('container');
	container.removeAll();

	var failoverTargets = this.failoverTargetsGrid.getFailoverTargets();
	for (var i = 0; i < failoverTargets.length; ++i) {
	    var tag = failoverTargets[i];
	    for (var field in tag)
		container.add({
		    xtype: 'hidden',
		    name: 'failover_targets[][priority]',
		    value: i
		});
		container.add({
		    xtype: 'hidden',
		    name: 'failover_targets[][' + field + ']',
		    value: tag[field]
		});
	}

	container.doLayout();
    }

});

Servers.NewServerWindow.FailoverTargetsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();
	this.makeContextMenu();

	Servers.NewServerWindow.FailoverTargetsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'physical_server',
	    stripeRows: true,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    this.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    this.contextMenu.showAt(e.getXY());
		}
	    }
	});
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'Failover Targets',
	    dataIndex: 'physical_server',
	    id: 'physical_server'
	}]);
    },

    makeStore: function() {
	this.store = new Ext.data.ArrayStore({
	    fields: ['physical_server']
	});
    },

    makeContextMenu: function() {
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: {
		text: 'Delete',
		handler: function() {
		    var record = grid.getSelectionModel().getSelected();
		    this.store.remove(record);
		},
		scope: this
	    },
	    scope: this
	});
    },

    removeAll: function() {
	this.store.removeAll();
    },

    addFailoverTarget: function(physicalServer) {
	var RecordType = this.store.recordType;
	var record = new RecordType({
	    physical_server: physicalServer
	});
	this.store.add(record);
    },

    getFailoverTargets: function() {
	var failoverTargets = new Array();
	this.store.each(function(record) {
	    failoverTargets.push(record.data);
	});
	return failoverTargets;
    }

});
