var Servers = function() {
};

Servers.prototype.show = function() {

    //------------------------------
    //   windows, panels
    //------------------------------

    var indexGrid = new Servers.IndexGrid();
    var subcontentTab = new Servers.SubcontentTab();
    var newServerWindow = new Servers.NewServerWindow();
    var selectServerWindow = new Servers.SelectServerWindow();

    //------------------------------
    //   handlers
    //------------------------------

    var createServer = function() {
	newServerWindow.setSubmitOpts({
            url: paths.servers.index,
            method: 'POST',
            waitMsg: 'Creating...',
            success: function(f, action) {
		var item = action.result.item;
		indexGrid.addRecord(item);
		newServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            }
	});
	newServerWindow.show();
    };

    indexGrid.showServer = function() {
	Ext.Ajax.request({
	    url: indexGrid.selectedPaths().server,
	    method: 'GET',
	    success: function(res, opts) {
		var result = Ext.decode(res.responseText);

		var server = result.items.server;
		var interfaces = result.items.interfaces;
		var monitorPath = indexGrid.selectedPaths().monitor;

		subcontentTab.showContent(server, interfaces, monitorPath);
		subcontentTab.show();

		Ext.getCmp('content-container').doLayout();
	    },
	    failure: function(res, opts) {
		alert('Error');
	    }
	});
    };

    var changeStatus = function(status) {
	indexGrid.updateSelectedValues({ status: status });
	subcontentTab.updateValues({ status: status });
    };

    var operateServer = function(operation, status) {
	Ext.Ajax.request({
	    url: indexGrid.selectedPaths()[operation],
	    method: 'POST',
	    success: function(res, opts) {
		changeStatus(status);
	    },
	    failure: function(res, opts) {
		Ext.MessageBox.alert('Error', 'Failed to ' + operation + ' server');
	    }
	});
    };

    indexGrid.suspendServer = function() {
	operateServer('suspend', 'Suspending');
    };

    indexGrid.resumeServer = function() {
	operateServer('resume', 'Resuming');
    };

    indexGrid.rebootServer = function() {
	operateServer('reboot', 'Rebooting');
    };

    indexGrid.terminateServer = function() {
	operateServer('terminate', 'Terminating');
    };

    indexGrid.restartServer = function() {
	operateServer('restart', 'Restarting');
    };

    indexGrid.migrateServer = function() {
	selectServerWindow.setSubmitOpts({
            url: indexGrid.selectedPaths().migrate,
            method: 'POST',
            waitMsg: 'Migrating...',
            success: function(f, action) {
		changeStatus('Migrating');
		selectServerWindow.hide();
            },
            failure: function(f, action) {
		Ext.MessageBox.alert('Error', 'Failed to create server');
            }
	});
	selectServerWindow.show();
    };

    var updateValues = function() {
	Ext.Ajax.request({
            url: paths.servers.status,
            method: 'GET',
            success: function(res, opts) {
		var items = Ext.decode(res.responseText).items;
		indexGrid.updateValues(items);

		if (indexGrid.isSelected()) {
		    var id = indexGrid.selectedId();
		    if (items[id])
			subcontentTab.updateValues(items[id]);
		}
            },
            failure: function(res, opts) {
            }
	});
    };

    var updateMonitor = function() {
	subcontentTab.updateMonitor();
    };

    //------------------------------
    //   create button
    //------------------------------

    var createButton = new Ext.Button({
	text: 'Create Server',
	border: false,
	handler: createServer
    });

    //------------------------------
    //   index panel
    //------------------------------

    var indexPanel = new Ext.Panel({
	layout: 'vbox',
	layoutConfig: {
	    align: 'stretch'
	},
	border: false,
	items: [
	    {
		height: 30,
		border: false,
		items: createButton
	    },
	    {
		flex: 1,
		layout: 'fit',
		border: false,
		items: indexGrid
	    }
	],
	listeners: {
	    added: function() {
		this.updateValuesTimer = setInterval(updateValues, 10000);
		this.updateMonitorTimer = setInterval(updateMonitor, 5000);
	    },
	    destroy: function() {
		clearInterval(this.updateValuesTimer);
		clearInterval(this.updateMonitorTimer);
		newServerWindow.destroy();
		selectServerWindow.destroy();
	    }
	}
    });

    //------------------------------
    //   layout
    //------------------------------

    Ext.getCmp('subcontent').show();
    Ext.getCmp('subcontent').removeAll();
    Ext.getCmp('subcontent').add(subcontentTab);
    subcontentTab.hide();

    Ext.getCmp('content').removeAll();
    Ext.getCmp('content').add(indexPanel);
    Ext.getCmp('content-container').doLayout();

};
