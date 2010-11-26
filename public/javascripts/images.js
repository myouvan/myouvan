var Images = Ext.extend(Ext.util.Observable, {

    constructor: function() {
	this.addEvents('createdImage');
	this.addEvents('updatedImage');
	this.addEvents('destroyedImage');
    },

    createImage: function() {
	this.newImageWindow.setForCreate({
            url: paths.images.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var item = action.result.item;
		this.fireEvent('createdImage', item);
		this.newImageWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create image');
            },
	    scope: this
	});
	this.newImageWindow.show();
    },

    updateImage: function(item) {
	this.newImageWindow.setForUpdate({
            url: item.paths.image,
            method: 'PUT',
            waitMsg: 'Updating...',
            success: function(f, action) {
		var item = action.result.item;
		this.fireEvent('updatedImage', item);
		this.newImageWindow.hide();
            },
            failure: function(form, action) {
		alert('Failed to update image');
            },
	    scope: this
	});

	Ext.Ajax.request({
	    url: item.paths.image,
	    method: 'GET',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.newImageWindow.setValues(item);
		this.newImageWindow.show();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    },
	    scope: this
	});
    },

    destroyImage: function(item) {
	Ext.Ajax.request({
	    url: item.paths.image,
	    method: 'DELETE',
	    success: function(res, opts) {
		var item = Ext.decode(res.responseText).item;
		this.fireEvent('destroyedImage', item);
	    },
	    failure: function(res, opts) {
		alert('Error');
	    },
	    scope: this
	});
    },

    show: function() {
	this.indexPanel = new Images.IndexPanel();
	this.newImageWindow = new Images.NewImageWindow();

	this.initEventHandlers();

	Ext.getCmp('subcontent').removeAll();
	Ext.getCmp('subcontent').hide();
	Ext.getCmp('content').removeAll();
	Ext.getCmp('content').add(this.indexPanel);
	Ext.getCmp('content-container').doLayout();
    },

    initEventHandlers: function() {
	this.indexPanel.on('destroy', function() {
	    this.newImageWindow.destroy();
	});

	this.indexPanel.on('createImage', this.createImage.createDelegate(this));
	this.indexPanel.on('updateImage', this.updateImage.createDelegate(this));
	this.indexPanel.on('destroyImage', this.destroyImage.createDelegate(this));
    }

});
