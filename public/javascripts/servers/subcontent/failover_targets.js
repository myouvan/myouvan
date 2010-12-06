Servers.Subcontent.FailoverTargets = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.showFailoverTargetsDelegate = this.showFailoverTargets.createDelegate(this);
    },

    makeComponents: function() {
	this.makeAddComponents();

	Servers.Subcontent.FailoverTargets.superclass.constructor.call(this, {
	    layout: 'vbox',
	    layoutConfig: {
		align: 'stretch'
	    },
	    width: 300,
	    height: 300,
	    border: false,
	    items: [
		{
		    flex: 1,
		    xtype: 'container',
		    layout: 'fit',
		    itemId: 'container'
		},
		this.addComponents
	    ],
	    listeners: {
		added: this.addEventHandlers.createDelegate(this),
		beforedestroy: this.removeEventHandlers.createDelegate(this)
	    }
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
		xtype: 'container',
		layout: 'absolute',
		items: {
		    x: 0,
		    y: Ext.isIE ? 1 : 0,
		    anchor: '100%',
		    xtype: 'storecombobox',
		    itemId: 'addCombo',
		    storeConfig: {
			url: paths.servers.physical_servers
		    },
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
			this.addFailoverTarget({
			    'failover_target[server_id]': this.currentItem.id,
			    'failover_target[physical_server]': physicalServer
			});
			addCombo.clearValue();
		    },
		    scope: this
		}
	    }]
	};
    },

    addEventHandlers: function() {
	servers.on('gotServer', this.showFailoverTargetsDelegate);
    },

    removeEventHandlers: function() {
	servers.un('gotServer', this.showFailoverTargetsDelegate);
    },

    showFailoverTargets: function(item) {
	if (this.currentItem && this.currentItem.id == item.id)
	    return;

	var addCombo = this.find('itemId', 'addCombo')[0];
	addCombo.getStore().baseParams.zone = item.zone;
	addCombo.getStore().baseParams.except = item.physical_server;
	addCombo.getStore().load();

	this.failoverTargetsGrid = new Servers.Subcontent.FailoverTargetsGrid({
	    url: item.paths.failover_targets
	});
	this.failoverTargetsGrid.on('destroyFailoverTarget', this.destroyFailoverTarget.createDelegate(this));

	var container = this.getComponent('container');
	container.removeAll();
	container.add(this.failoverTargetsGrid);

	this.currentItem = item;
    },

    addFailoverTarget: function(failoverTarget) {
	Ext.Ajax.request({
	    url: paths.failover_targets.index,
	    method: 'POST',
	    params: failoverTarget,
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.failoverTargetsGrid.addRecord(item);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to add failover target');
	    },
	    scope: this
	});
    },

    destroyFailoverTarget: function(item) {
	Ext.Ajax.request({
	    url: item.paths.failover_target,
	    method: 'DELETE',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.failoverTargetsGrid.destroyRecord(item);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to destroy failover target');
	    },
	    scope: this
	});
    }

});

Servers.Subcontent.FailoverTargetsGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function(config) {
	this.makeComponents(config);

	this.addEvents('destroyFailoverTarget');
    },

    makeComponents: function(config) {
	this.makeColModel();
	this.makeStore(config);
	this.makeContextMenu();

	Servers.Subcontent.FailoverTargetsGrid.superclass.constructor.call(this, {
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'physical_server',
	    stripeRows: true,
	    loadMask: true,
	    listeners: {
		rowcontextmenu: function(grid, row, e) {
		    grid.getSelectionModel().selectRow(row);
		    e.stopEvent();
		    grid.contextMenu.showAt(e.getXY());
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

    makeStore: function(config) {
	this.store = new Ext.ux.ItemsStore({
	    url: config.url,
	    autoLoad: true,
	    fields: [
		'id',
		'priority',
		'physical_server',
		'paths'
	    ],
	    storeId: 'id'
	});
    },

    makeContextMenu: function() {
	this.contextMenu = new Ext.menu.Menu({
	    style: {
		overflow: 'visible'
	    },
	    items: [{
		text: 'Delete',
		handler: function() {
		    var record = this.getSelectionModel().getSelected();
		    this.fireEvent('destroyFailoverTarget', record.data);
		},
		scope: this
	    }]
	});
    },

    addRecord: function(item) {
	var RecordType = this.store.recordType;
	var record = new RecordType(item);
	this.store.add(record);
    },

    destroyRecord: function(item) {
	var ri = this.store.findExact('id', item.id);
	if (ri != -1)
	    this.store.removeAt(ri);
    }

});
