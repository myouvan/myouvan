var NewServerWindow = function() {

    //--- card

    var selectImagePanel = new SelectImagePanel();
    var formPanel = new FormPanel();
    var tagsPanel = new TagsPanel();
    var flashPanel = new FlashPanel();

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
	],
	listeners: {
	    beforeshow: function() {
		activeItem = 0;
		card.layout.setActiveItem(activeItem);

		prevButton.disable();
		nextButton.enable();
		nextButton.setText('Next');
	    }
	}
    });

    var prevCard = function() {
	if (activeItem > 0) {
	    activeItem--;
	    card.layout.setActiveItem(activeItem);

	    if (activeItem == 0) {
		prevButton.disable();
	    } else if (activeItem == 2) {
		nextButton.setText('Next');
		nextButton.enable();
	    }
	}
    };

    var nextCard = function() {
	if (activeItem < 3) {
	    activeItem++;
	    card.layout.setActiveItem(activeItem);
	    
	    if (activeItem == 1) {
		if (!selectImagePanel.isSelected()) {
		    Ext.MessageBox.alert('Error', 'Select an image');
		    return;
		}
		var id = selectImagePanel.selectedId();
		formPanel.setImageId(id);

		prevButton.enable();
	    } else if (activeItem == 3) {
		formPanel.setTags(tagsPanel.tags);

		nextButton.setText('Create');
		nextButton.disable();
	    }
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

    var wdw = this;

    var closeButton = new Ext.Button({
	text: 'Close',
	handler: function() {
	    wdw.hide();
	}
    });

    //--- window

    NewServerWindow.baseConstructor.apply(this, [{
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
		selectImagePanel.resetPanel();
		formPanel.resetPanel();
		tagsPanel.resetPanel();
	    }
	}
    }]);

    this.setSubmitOpts = function(opts) { formPanel.setSubmitOpts(opts); }

};

NewServerWindow.inherit(Ext.Window);
