var FormPanel = function() {

    var zoneCombo = new Ext.form.ComboBox({
	name: 'server[zone]',
	fieldLabel: 'Zone',
	width: 150,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.servers.zones),
	displayField: 'value',
	msgTarget: 'qtip',
	listeners: {
	    select: function(combo, record, index) {
		physicalServerCombo.getStore().baseParams['zone'] = record.get('value');
		physicalServerCombo.getStore().load();
		physicalServerCombo.reset();
		physicalServerCombo.enable();
	    }
	}
    });

    var physicalServerCombo = new Ext.form.ComboBox({
	name: 'server[physical_server]',
	fieldLabel: 'Physical Server',
	width: 150,
	editable: false,
	forceSelection: false,
	triggerAction: 'all',
	store: comboItemsStore(paths.servers.physical_servers),
	displayField: 'value',
	msgTarget: 'qtip'
    });

    var imageIdHidden = new Ext.form.Hidden({
	name: 'server[image_id]'
    });

    var tagsHidden = new Ext.form.Hidden({
	name: 'tags'
    });

    var avatarThumbHidden = new Ext.form.Hidden({
	name: 'avatar[thumb]'
    });

    var avatarIconHidden = new Ext.form.Hidden({
	name: 'avatar[icon]'
    });

    var formItems = [
	{
	    xtype: 'textfield',
	    name: 'server[name]',
	    fieldLabel: 'Name',
	    width: 100,
	    msgTarget: 'qtip'
	},
	{
	    xtype: 'textfield',
	    name: 'server[title]',
	    fieldLabel: 'Title',
	    width: 200,
	    msgTarget: 'qtip'
	},
	zoneCombo,
	physicalServerCombo,
	new Ext.form.ComboBox({
	    name: 'server[pool]',
	    fieldLabel: 'Pool',
	    width: 150,
	    editable: false,
	    forceSelection: false,
	    triggerAction: 'all',
	    store: comboItemsStore(paths.servers.pools),
	    displayField: 'value',
	    msgTarget: 'qtip'
	}),
	new Ext.form.ComboBox({
	    name: 'server[virtualization]',
	    fieldLabel: 'Virtualization',
	    width: 200,
	    editable: false,
	    forceSelection: false,
	    triggerAction: 'all',
	    store: comboItemsStore(paths.servers.virtualizations),
	    displayField: 'value',
	    msgTarget: 'qtip'
	}),
	new Ext.form.NumberField({
	    name: 'server[cpus]',
	    fieldLabel: 'CPUs',
	    width: 100,
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}),
	new Ext.form.NumberField({
	    name: 'server[memory]',
	    fieldLabel: 'Memory(MB)',
	    width: 100,
	    allowDecimals: false,
	    msgTarget: 'qtip'
	}),
	{
	    xtype: 'hidden',
	    name: 'interface[0][number]',
	    value: '0'
	},
	{
	    xtype: 'textfield',
	    name: 'interface[0][ip_address]',
	    fieldLabel: 'IP Address(1)',
	    width: 150,
	    msgTarget: 'qtip'
	},
	{
	    xtype: 'hidden',
	    name: 'interface[1][number]',
	    value: '1'
	},
	{
	    xtype: 'textfield',
	    name: 'interface[1][ip_address]',
	    fieldLabel: 'IP Address(2)',
	    width: 150,
	    msgTarget: 'qtip'
	},
	{
	    xtype: 'textarea',
	    name: 'server[comment]',
	    fieldLabel: 'Comment',
	    width: 300,
	    height: 100
	},
	{
	    xtype: 'checkbox',
	    name: 'server[auto_restart]',
	    fieldLabel: 'Auto Restart',
	    boxLabel: 'Restart automatically on unintentional shutdown',
	    inputValue: 'true'
	},
	tagsHidden,
	avatarThumbHidden,
	avatarIconHidden
    ];

    var form = new Ext.form.FormPanel({
	width: 424,
	labelWidth: 100,
	labelAlign: 'right',
	bodyStyle: {
	    padding: '5px 0',
	},
	border: false,
	autoScroll: true,
	items: formItems
    });

    FormPanel.baseConstructor.apply(this, [{
	layout: 'hbox',
	layoutConfig: {
	    align: 'stretch',
	    pack: 'center',
	},
	border: false,
	items: form
    }]);

    this.setImageId = function(id) {
	imageIdHidden.setValue(id);
    };

    this.setTags = function(tags) {
	tagsHidden.setValue(Ext.encode(tags));
    };

    this.setAvatar = function(thumb, icon) {
	avatarThumbHidden.setValue(thumb);
	avatarIconHidden.setValue(icon);
    };

    this.resetPanel = function() {
	form.getForm().reset();
	physicalServerCombo.disable();
    };

    this.setSubmitOpts = function(opts) {
	this.submitOpts = opts;
    };

    this.submit = function() {
	form.getForm().submit(this.submitOpts);
    };

};

FormPanel.inherit(Ext.Panel);
