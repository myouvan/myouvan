Servers.NewServerWindow.FormPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();

	Servers.NewServerWindow.FormPanel.superclass.constructor.call(this, {
	    title: 'Input Specifications',
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center'
	    },
	    border: false,
	    items: this.form
	});
    },

    makeFormItems: function() {
	this.formItems = [{
	    xtype: 'hidden',
	    name: 'server[image_id]',
	    itemId: 'image_id'
	}, {
	    xtype: 'textfield',
	    name: 'server[name]',
	    itemId: 'name',
	    fieldLabel: 'Name',
	    width: 100,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'textfield',
	    name: 'server[title]',
	    itemId: 'title',
	    fieldLabel: 'Title',
	    width: 200,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'storecombobox',
	    name: 'server[zone]',
	    itemId: 'zone',
	    fieldLabel: 'Zone',
	    width: 150,
	    storeConfig: {
		url: paths.servers.zones
	    },
	    listeners: {
		select: function(combo, record, index) {
		    var psCombo = this.getComponent('physical_server');
		    psCombo.getStore().baseParams['zone'] = record.get('value');
		    psCombo.getStore().load();
		    psCombo.reset();
		    psCombo.enable();
		},
		scope: this
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[physical_server]',
	    itemId: 'physical_server',
	    fieldLabel: 'Physical Server',
	    width: 150,
	    storeConfig: {
		url: paths.servers.physical_servers
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[pool]',
	    itemId: 'pool',
	    fieldLabel: 'Pool',
	    width: 150,
	    storeConfig: {
		url: paths.servers.pools
	    }
	}, {
	    xtype: 'storecombobox',
	    name: 'server[virtualization]',
	    itemId: 'virtualization',
	    fieldLabel: 'Virtualization',
	    width: 200,
	    storeConfig: {
		url: paths.servers.virtualizations
	    }
	}, {
	    xtype: 'numberfield',
	    name: 'server[cpus]',
	    itemId: 'cpus',
	    fieldLabel: 'CPUs',
	    width: 100,
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'numberfield',
	    name: 'server[memory]',
	    itemId: 'memory',
	    fieldLabel: 'Memory(MB)',
	    width: 100,
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'hidden',
	    name: 'interface[0][number]',
	    itemId: 'interface_number0',
	    value: '0'
	}, {
	    xtype: 'textfield',
	    name: 'interface[0][ip_address]',
	    itemId: 'ip_address0',
	    fieldLabel: 'IP Address(1)',
	    width: 150,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'hidden',
	    name: 'interface[1][number]',
	    itemId: 'interface_number1',
	    value: '1'
	}, {
	    xtype: 'textfield',
	    name: 'interface[1][ip_address]',
	    itemId: 'ip_address1',
	    fieldLabel: 'IP Address(2)',
	    width: 150,
	    msgTarget: 'qtip'
	}, {
	    xtype: 'textarea',
	    name: 'server[comment]',
	    itemId: 'comment',
	    fieldLabel: 'Comment',
	    width: 300,
	    height: 100
	}, {
	    xtype: 'checkbox',
	    name: 'server[auto_restart]',
	    itemId: 'auto_restart',
	    fieldLabel: 'Auto Restart',
	    boxLabel: 'Restart automatically on unintentional shutdown',
	    inputValue: 'true'
	}, {
	    xtype: 'hidden',
	    name: 'tags',
	    itemId: 'tags',
	}, {
	    xtype: 'hidden',
	    itemId: 'avatar_thumb',
	    name: 'avatar[thumb]'
	}, {
	    xtype: 'hidden',
	    itemId: 'avatar_icon',
	    name: 'avatar[icon]'
	}];
    },

    makeForm: function() {
	this.form = new Ext.form.FormPanel({
	    width: 424,
	    labelWidth: 100,
	    labelAlign: 'right',
	    bodyStyle: {
		padding: '5px 0',
	    },
	    border: false,
	    autoScroll: true,
	    items: this.formItems
	});
    },

    setImageId: function(id) {
	this.form.getComponent('image_id').setValue(id);
    },

    setTags: function(tags) {
	this.form.getComponent('tags').setValue(Ext.encode(tags));
    },

    setAvatar: function(thumb, icon) {
	this.form.getComponent('avatar_thumb').setValue(thumb);
	this.form.getComponent('avatar_icon').setValue(icon);
    },

    resetPanel: function() {
	this.form.getForm().reset();
	this.form.getComponent('physical_server').disable();
    },

    setSubmitOpts: function(opts) {
	this.submitOpts = opts;
    },

    submit: function() {
	this.form.getForm().submit(this.submitOpts);
    }
});
