Servers.NewServerWindow.Avatar = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('setAvatar');
	ovater_set = this.setAvatar.createDelegate(this);
    },

    makeComponents: function() {
	Servers.NewServerWindow.Avatar.superclass.constructor.call(this, {
	    title: 'Create Avatar',
	    itemId: 'avatar',
	    layout: 'fit',
	    border: false,
	    items: [{
		xtype: 'flash',
		url: '/ova.swf'
	    }, {
		xtype: 'hidden',
		itemId: 'thumb',
		name: 'avatar[thumb]'
	    }, {
		xtype: 'hidden',
		itemId: 'icon',
		name: 'avatar[icon]'
	    }]
	});
    },

    setAvatar: function(thumb, icon) {
	this.getComponent('thumb').setValue(thumb);
	this.getComponent('icon').setValue(icon);
	this.fireEvent('setAvatar');
    }

});

// call from avatar flash
var ovater_set;
