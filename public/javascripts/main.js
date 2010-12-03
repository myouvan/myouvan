var images = new Images();
var servers = new Servers();

var currentNav = null;

var changeNavClass = function(elem) {
    if (currentNav)
	currentNav.removeClass('ec2-navigation-selected');
    elem.addClass('ec2-navigation-selected');
    currentNav = elem;
};

var showImages = function() {
    images.show();
    changeNavClass(Ext.get('nav-images'));
};

var showServers = function() {
    servers.show();
    changeNavClass(Ext.get('nav-servers'));
};

var showViewport = function() {
    var navLink = function(id, text) {
	return '<img src="/images/r_arrow.gif" />' +
	    '<a id="' + id + '" class="ec2-navigation" href="#">' +
	    text + '</a>';
    };

    new Ext.Viewport({
	layout: 'fit',
	items: {
	    layout: 'border',
	    items: [{
		region: 'west',
		split: true,
		title: 'Navigation',
		headerCssClass: 'ec2-panel-header',
		width: 150,
		margins: '5 0 5 5',
		padding: 5,
		defaults: {
		    padding: 5,
		    border: false
		},
		items: [{
		    html: navLink('nav-images', 'Images')
		}, {
		    html: navLink('nav-servers', 'Servers')
		}]
	    }, {
		xtype: 'container',
		id: 'content-container',
		layout: 'border',
		region: 'center',
		margins: '5 5 5 0',
		items: [{
		    id: 'content',
		    region: 'center',
		    layout: 'fit'
		}, {
		    id: 'subcontent',
		    split: true,
		    region: 'south',
		    height: 200,
		    layout: 'fit'
		}]
	    }]
	}
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
    Ext.Ajax.diableCaching = true;
    Ext.Ajax.defaultHeaders = {
	Accept: 'application/json'
    };
    Ext.BLANK_IMAGE_URL = '/stylesheets/images/gray/s.gif';
    Ext.chart.Chart.CHART_URL = '/javascripts/ext-3.3.0/resources/charts.swf';
    Ext.QuickTips.init();

    showViewport();
});
