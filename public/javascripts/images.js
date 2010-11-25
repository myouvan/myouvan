var Images = function() {
};

Images.prototype.show = function() {

    //------------------------------
    //   windows, panels
    //------------------------------

    var indexPanel = new Images.IndexPanel();
    var indexGrid = indexPanel.indexGrid;

    var newImageWindow = new Images.NewImageWindow();

    //------------------------------
    //   handlers
    //------------------------------

    indexPanel.onDestroy = function() {
	newImageWindow.destroy();
    };

    indexPanel.createImage = function() {
	newImageWindow.setForCreate({
            url: paths.images.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var image = action.result.item;
		indexGrid.addRecord(item);
		newImageWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create image');
            }
	});
	newImageWindow.show();
    };

    indexGrid.updateImage = function() {
	newImageWindow.setForUpdate({
            url: indexGrid.selectedPaths().image,
            method: 'PUT',
            waitMsg: 'Updating...',
            success: function(f, action) {
		var item = action.result.item;
		indexGrid.updateSelectedValues(item);
		newImageWindow.hide();
            },
            failure: function(form, action) {
		alert('Failed to update image');
            }
	});

	Ext.Ajax.request({
	    url: indexGrid.selectedPaths().image,
	    method: 'GET',
	    success: function(res, opts) {
		result = Ext.decode(res.responseText);
		newImageWindow.setValues(result.item);
		newImageWindow.show();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    indexGrid.destroyImage = function() {
	Ext.Ajax.request({
	    url: indexGrid.selectedPaths().image,
	    method: 'DELETE',
	    success: function(res, opts) {
		indexGrid.removeSelected();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').hide();
    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();

};
