Servers.NewServerWindow.SelectTargetPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectTargetGrid();

	Servers.NewServerWindow.SelectTargetPanel.superclass.constructor.call(this, {
	    title: 'Select Target',
	    itemId: 'selectTarget',
	    layout: 'fit',
	    border: false,
	    items: this.grid
	});
    },

    isSelected: function() {
	return this.grid.getSelectionModel().hasSelection()
    },

    selectedRecord: function() {
	return this.grid.getSelectionModel().getSelected();
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
