Servers.NewServerWindow.SelectTarget = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('selectTarget');
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectTargetGrid();

	Servers.NewServerWindow.SelectTarget.superclass.constructor.call(this, {
	    title: 'Select Target',
	    itemId: 'selectTarget',
	    layout: 'fit',
	    border: false,
	    items: [this.grid, {
		xtype: 'hidden',
		name: 'server[storage_iqn]',
		itemId: 'storage_iqn',
	    }, {
		xtype: 'hidden',
		name: 'interface[0][mac_address]',
		itemId: 'mac_address0'
	    }, {
		xtype: 'hidden',
		name: 'interface[1][mac_address]',
		itemId: 'mac_address1'
	    }]
	});
    },

    onNext: function() {
	if (this.grid.getSelectionModel().hasSelection()) {
	    var item = this.grid.getSelectionModel().getSelected().data;
	    for (var field in item) {
		var cmp = this.getComponent(field);
		if (cmp)
		    cmp.setValue(item[field])
	    }
	    this.fireEvent('selectTarget', item);
	    return true;
	} else {
	    Ext.MessageBox.alert('Error', 'Select an target');
	    return false;
	}
    }

});

Servers.NewServerWindow.SelectTargetGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();

	Servers.NewServerWindow.SelectTargetGrid.superclass.constructor.call(this, {
	    border: false,
	    colModel: this.colModel,
	    store: this.store,
	    autoExpandColumn: 'name',
	    columnLines: true,
	    stripeRows: true,
	    loadMask: true,
	    sm: new Ext.grid.RowSelectionModel({
		singleSelect: true
	    })
	});
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([{
	    header: 'Zone',
	    dataIndex: 'zone',
	    width: 100,
	    sortable: true
	}, {
	    header: 'Physical Server',
	    dataIndex: 'physical_server',
	    width: 100,
	    sortable: true
	}, {
	    header: 'Name',
	    dataIndex: 'name',
	    sortable: true,
	    id: 'name'
	}, {
	    header: 'CPUs',
	    dataIndex: 'cpus',
	    width: 80,
	    sortable: true
	}, {
	    header: 'Memory(MB)',
	    dataIndex: 'memory',
	    width: 100,
	    sortable: true
	}]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.targets.index,
	    autoLoad: true,
	    fields: [
		'zone',
		'physical_server',
		'name',
		'uuid',
		'virtualization',
		'cpus',
		'memory',
		'storage_iqn',
		'mac_address0',
		'mac_address1',
		'paths'
	    ]
	});
    }

});
