Servers.NewServerWindow.SelectImportTarget = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('selectImportTarget');
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectImportTargetGrid();

	Servers.NewServerWindow.SelectImportTarget.superclass.constructor.call(this, {
	    title: 'Select Import Target',
	    itemId: 'selectImportTarget',
	    layout: 'fit',
	    border: false,
	    items: this.grid
	});
    },

    onNext: function() {
	if (this.grid.getSelectionModel().hasSelection()) {
	    var item = this.grid.getSelectionModel().getSelected().data;
	    this.fireEvent('selectImportTarget', item);
	    return true;
	} else {
	    Ext.MessageBox.alert('Error', 'Select an import target');
	    return false;
	}
    }

});

Servers.NewServerWindow.SelectImportTargetGrid = Ext.extend(Ext.grid.GridPanel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeColModel();
	this.makeStore();

	Servers.NewServerWindow.SelectImportTargetGrid.superclass.constructor.call(this, {
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
	    url: paths.import_targets.index,
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
