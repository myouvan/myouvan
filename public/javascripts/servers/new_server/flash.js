Servers.NewServerWindow.FlashPanel = Ext.extend(Ext.Panel, {

    constructor: function() {
	this.makeComponents();

	this.addEvents('setAvatar');
	ovater_set = this.setAvatar.createDelegate(this);
    },

    makeComponents: function() {
	Servers.NewServerWindow.FlashPanel.superclass.constructor.call(this, {
	    title: 'Create Avatar',
	    itemId: 'flash',
	    layout: 'fit',
	    border: false,
	    items: {
		xtype: 'flash',
		url: '/ova.swf'
	    }
	});
    },

    setAvatar: function(thumb, icon) {
	this.fireEvent('setAvatar', thumb, icon);
    }

});

// call from avatar flash
var ovater_set;
