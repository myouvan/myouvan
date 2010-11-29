Servers.NewServerWindow.SelectTargetPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.grid = new Servers.NewServerWindow.SelectTargetGrid();

	Servers.NewServerWindow.SelectTargetPanel.superclass.constructor.call(this, {
	    title: 'Select Target',
	    layout: 'fit',
	    layoutConfig: {
		align: 'stretch'
	    },
	    border: false,
	    items: this.grid,
	    listeners: {
		beforeshow: function() {
		    this.grid.store.load();
		}
	    }
	});
    },

    isSelected: function() {
	return this.grid.isSelected();
    },

    selectedId: function() {
	return this.grid.selectedId();
    },

    resetPanel: function() {
	this.grid.resetGrid();
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
	    loadMask: true
	});
    },

    makeColModel: function() {
	this.colModel = new Ext.grid.ColumnModel([
	    {
		header: 'Zone',
		dataIndex: 'zone',
		width: 100,
		sortable: true
	    },
	    {
		header: 'Physical Server',
		dataIndex: 'physical_server',
		width: 100,
		sortable: true
	    },
	    {
		header: 'Name',
		dataIndex: 'name',
		width: 150,
		sortable: true
	    },
	    {
		header: 'CPUs',
		dataIndex: 'cpus',
		width: 80,
		sortable: true
	    },
	    {
		header: 'Memory(MB)',
		dataIndex: 'memory',
		width: 100,
		sortable: true
	    }
	]);
    },

    makeStore: function() {
	this.store = new Ext.ux.ItemsStore({
	    url: paths.targets.index,
	    autoLoad: false,
	    fields: [
		'zone',
		'physical_server',
		'name',
		'uuid',
		'cpus',
		'memory',
		'storage_iqn',
		'mac_address0',
		'mac_address1'
	    ]
	});
    },

    isSelected: function() {
	return this.getSelectionModel().hasSelection();
    },

    selectedId: function() {
	return this.getSelectionModel().getSelected().get('id');	
    },

    resetGrid: function() {
	this.store.load();
	this.getSelectionModel().clearSelections();
    }

});
