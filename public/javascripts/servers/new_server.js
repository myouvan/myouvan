Servers.NewServerWindow = function() {

    //--- card

    var selectImagePanel = new Servers.NewServerWindow.SelectImagePanel();
    var formPanel = new Servers.NewServerWindow.FormPanel();
    var tagsPanel = new Servers.NewServerWindow.TagsPanel();
    var flashPanel = new Servers.NewServerWindow.FlashPanel();

    flashPanel.onSet(function(thumb, icon) {
	formPanel.setAvatar(thumb, icon);
	nextButton.enable();
    });

    var activeItem = 0;

    var card = new Ext.Panel({
	layout: 'card',
	activeItem: 0,
	width: 400,
	items: [
	    selectImagePanel,
	    formPanel,
	    tagsPanel,
	    flashPanel
	]
    });

    var prevCard = function() {
	if (activeItem > 0) {
	    if (activeItem == 1) {
		prevButton.disable();
	    } else if (activeItem == 3) {
		nextButton.setText('Next');
		nextButton.enable();
	    }

	    activeItem--;
	    card.layout.setActiveItem(activeItem);
	}
    };

    var nextCard = function() {
	if (activeItem < 3) {
	    if (activeItem == 0) {
		if (!selectImagePanel.isSelected()) {
		    Ext.MessageBox.alert('Error', 'Select an image');
		    return;
		}
		var id = selectImagePanel.selectedId();
		formPanel.setImageId(id);

		prevButton.enable();
	    } else if (activeItem == 2) {
		formPanel.setTags(tagsPanel.tags);

		nextButton.setText('Create');
		nextButton.disable();
	    }

	    activeItem++;
	    card.layout.setActiveItem(activeItem);
	} else if (activeItem == 3) {
	    prevCard();
	    prevCard();
	    formPanel.submit();
	}
    };

    //--- buttons

    var prevButton = new Ext.Button({
	text: 'Prev',
	handler: prevCard
    });

    var nextButton = new Ext.Button({
	text: 'Next',
	handler: nextCard
    });

    var closeButton = new Ext.Button({
	text: 'Close',
	handler: function() {
	    wdw.hide();
	}
    });

    //--- window

    Servers.NewServerWindow.baseConstructor.apply(this, [{
	title: 'Create Server',
	modal: true,
	width: 650,
	height: 468,
	layout: 'fit',
	plain: true,
	closable: false,
	items: card,
	buttonAlign: 'center',
	buttons: [
	    prevButton,
	    nextButton,
	    closeButton
	],
	listeners: {
	    beforeshow: function() {
		activeItem = 0;
		card.layout.setActiveItem(activeItem);

		prevButton.disable();
		nextButton.enable();
		nextButton.setText('Next');

		selectImagePanel.resetPanel();
		formPanel.resetPanel();
		tagsPanel.resetPanel();
	    }
	}
    }]);

    var wdw = this;

    //--- submit

    this.setSubmitOpts = function(opts) {
	formPanel.setSubmitOpts(opts);
    }

};

Servers.NewServerWindow.inherit(Ext.Window);
