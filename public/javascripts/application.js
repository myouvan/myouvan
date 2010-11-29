//------------------------------
//   extended JsonStore
//------------------------------

Ext.ux.ItemsStore = Ext.extend(Ext.data.JsonStore, {
    constructor: function(config) {
	if (config.url) {
	    config.proxy = new Ext.data.HttpProxy({
		url: config.url,
		method: 'GET',
		headers: {
		    Accept: 'application/json'
		}
	    });
	    delete config.url;
	}

	Ext.applyIf(config, {
	    autoDestroy: true,
	    autoLoad: false,
	    autoSave: false,
	    root: 'items',
	    fields: ['value']
	});

	Ext.ux.ItemsStore.superclass.constructor.call(this, config);
    }
});

//------------------------------
//   extended ComboBox
//------------------------------

Ext.ux.StoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: false,
	    forceSelection: true,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});

Ext.ux.EditableStoreComboBox = Ext.extend(Ext.form.ComboBox, {
    constructor: function(config) {
	if (config.storeConfig) {
	    config.store = new Ext.ux.ItemsStore(config.storeConfig);
	    delete config.storeConfig;
	}

	Ext.applyIf(config, {
	    editable: true,
	    forceSelection: false,
	    triggerAction: 'all',
	    displayField: 'value',
	    msgTarget: 'qtip',
	});

	Ext.ux.StoreComboBox.superclass.constructor.call(this, config);
    }
});

Ext.reg('storecombobox', Ext.ux.StoreComboBox);
Ext.reg('editablestorecombobox', Ext.ux.EditableStoreComboBox);
