Servers.NewServerWindow.FormPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();
	Servers.NewServerWindow.FormPanel.superclass.constructor.call(this, {
	    layout: 'hbox',
	    layoutConfig: {
		align: 'stretch',
		pack: 'center',
	    },
	    border: false,
	    items: this.form
	});
    },

    makeComponents: function() {
	this.makeFormItems();
	this.makeForm();
    },

    makeFormItems: function() {
	var panel = this;
	this.formItems = {
	    image_id: new Ext.form.Hidden({
		name: 'server[image_id]'
	    }),
	    name: new Ext.form.TextField({
		name: 'server[name]',
		fieldLabel: 'Name',
		width: 100,
		msgTarget: 'qtip'
	    }),
	    title: new Ext.form.TextField({
		name: 'server[title]',
		fieldLabel: 'Title',
		width: 200,
		msgTarget: 'qtip'
	    }),
	    zone: new Ext.ux.StoreComboBox({
		name: 'server[zone]',
		fieldLabel: 'Zone',
		width: 150,
		storeConfig: {
		    url: paths.servers.zones
		},
		listeners: {
		    select: function(combo, record, index) {
			var psCombo = panel.formItems['physical_server'];
			psCombo.getStore().baseParams['zone'] = record.get('value');
			psCombo.getStore().load();
			psCombo.reset();
			psCombo.enable();
		    }
		}
	    }),
	    physical_server: new Ext.ux.StoreComboBox({
		name: 'server[physical_server]',
		fieldLabel: 'Physical Server',
		width: 150,
		storeConfig: {
		    url: paths.servers.physical_servers
		}
	    }),
	    pool: new Ext.ux.StoreComboBox({
		name: 'server[pool]',
		fieldLabel: 'Pool',
		width: 150,
		storeConfig: {
		    url: paths.servers.pools
		}
	    }),
	    virtualization: new Ext.ux.StoreComboBox({
		name: 'server[virtualization]',
		fieldLabel: 'Virtualization',
		width: 200,
		storeConfig: {
		    url: paths.servers.virtualizations
		}
	    }),
	    cpus: new Ext.form.NumberField({
		name: 'server[cpus]',
		fieldLabel: 'CPUs',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    memory: new Ext.form.NumberField({
		name: 'server[memory]',
		fieldLabel: 'Memory(MB)',
		width: 100,
		allowDecimals: false,
		msgTarget: 'qtip'
	    }),
	    interface_number0: new Ext.form.Hidden({
		name: 'interface[0][number]',
		value: '0'
	    }),
	    ip_address0: new Ext.form.TextField({
		name: 'interface[0][ip_address]',
		fieldLabel: 'IP Address(1)',
		width: 150,
		msgTarget: 'qtip'
	    }),
	    interface_number1: new Ext.form.Hidden({
		name: 'interface[1][number]',
		value: '1'
	    }),
	    ip_address1: new Ext.form.TextField({
		name: 'interface[1][ip_address]',
		fieldLabel: 'IP Address(2)',
		width: 150,
		msgTarget: 'qtip'
	    }),
	    comment: new Ext.form.TextArea({
		name: 'server[comment]',
		fieldLabel: 'Comment',
		width: 300,
		height: 100
	    }),
	    auto_restart: new Ext.form.Checkbox({
		name: 'server[auto_restart]',
		fieldLabel: 'Auto Restart',
		boxLabel: 'Restart automatically on unintentional shutdown',
		inputValue: 'true'
	    }),
	    tags: new Ext.form.Hidden({
		name: 'tags'
	    }),
	    avatar_thumb: new Ext.form.Hidden({
		name: 'avatar[thumb]'
	    }),
	    avatar_icon: new Ext.form.Hidden({
		name: 'avatar[icon]'
	    })
	};
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
	    items: [
		this.formItems['image_id'],
		this.formItems['name'],
		this.formItems['title'],
		this.formItems['zone'],
		this.formItems['physical_server'],
		this.formItems['pool'],
		this.formItems['virtualization'],
		this.formItems['cpus'],
		this.formItems['memory'],
		this.formItems['interface_number0'],
		this.formItems['ip_address0'],
		this.formItems['interface_number1'],
		this.formItems['ip_address1'],
		this.formItems['comment'],
		this.formItems['auto_restart'],
		this.formItems['tags'],
		this.formItems['avatar_thumb'],
		this.formItems['avatar_icon']
	    ]
	});
    },

    setImageId: function(id) {
	this.formItems['image_id'].setValue(id);
    },

    setTags: function(tags) {
	this.formItems['tags'].setValue(Ext.encode(tags));
    },

    setAvatar: function(thumb, icon) {
	this.formItems['avatar_thumb'].setValue(thumb);
	this.formItems['avatar_icon'].setValue(icon);
    },

    resetPanel: function() {
	this.form.getForm().reset();
	this.formItems['physical_server'].disable();
    },

    setSubmitOpts: function(opts) {
	this.submitOpts = opts;
    },

    submit: function() {
	this.form.getForm().submit(this.submitOpts);
    }
});
