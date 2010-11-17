var showViewport = function() {
    var items = [
	{
	    region: 'north',
	    border: false,
	    html: '<h1 class="x-panel-header">Provisioning Tool</h1>'
	},
	{
            region: 'west',
            title: 'Navigation',
            width: 150,
            split: true,
	    items: [
		{
		    border: false,
		    style: {
			padding: '10px'
		    },
                    html: '<a id="nav-images" href="">Images</a>'
		},
		{
		    border: false,
		    style: {
			padding: '10px'
		    },
                    html: '<a id="nav-servers" href="">Servers</a>'
		}
	    ]
	},
	{
	    id: 'content-container',
	    layout: 'border',
	    region: 'center',
	    border: false,
	    items: [
		{
		    id: 'content',
		    region: 'center',
		    layout: 'fit'
		},
		{
		    id: 'subcontent',
		    region: 'south',
		    height: 200,
		    split: true,
		    layout: 'fit'
		}
	    ]
	}
    ];

    new Ext.Viewport({
	title: 'Provisioning Tool',
	layout: 'border',
	items: items
    });

    Ext.get('nav-images').on('click', function(ev) {
	showImages();
	ev.stopEvent();
    });

    Ext.get('nav-servers').on('click', function(ev) {
	showServers();
	ev.stopEvent();
    });
};

Ext.onReady(function() {
    showViewport();
});
