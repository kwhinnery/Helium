switch(Titanium.Platform.osname){
	case "iphone":
		he.test.add({
			name:'Testing platform specific (iPhone) Titanium.UI.iPhone namespace',
			suite:'ui_platform_specific',
			visual: {
				build: function() {
					var testContainer = Ti.UI.createView({layout:'vertical'}); //use raw constructor to avoid Helium defaults
					Titanium.UI.iPhone.statusBarStyle = Titanium.UI.iPhone.StatusBar.OPAQUE_BLACK;
					return testContainer;
				},
				conditions: [
					'Is the status bar (top) in opaque black?'
				]
			}
		});
		break;
	case "android":
		he.test.add({
			name:'Testing platform specific (Android) Titanium.UI.Android namespace',
			suite:'ui_platform_specific',
			visual: {
				build: function() {
					var testContainer = Ti.UI.createView({layout:'vertical'}); //use raw constructor to avoid Helium defaults
					var basicSwitch = Titanium.UI.createSwitch({
						style:Titanium.UI.Android.SWITCH_STYLE_CHECKBOX,
					    value:false
					});
					testContainer.add(basicSwitch);
					return testContainer;
				},
				conditions: [
					'Is the switch having an Android checkbox look?'
				]
			}
		});
		break;
	case "ipad":
		he.test.add({
			name:'Testing platform specific (iPad) Titanium.UI.iPad namespace',
			suite:'ui_platform_specific',
			visual: {
				build: function() {
					var testContainer = Ti.UI.createView({layout:'vertical'}); //use raw constructor to avoid Helium defaults

					var b1 = Ti.UI.createButton({
						title:'Show Popover 1',
						height:50,
						width:300,
						top:100
					});
					testContainer.add(b1);
					
					// build first popover
					b1.addEventListener('click', function()
					{
						var close = Ti.UI.createButton({
							title:'Close'
						});
						var canc = Ti.UI.createButton({
							title:'Cancel'
						});
						canc.addEventListener('click', function()
						{
							popover.hide({animated:true});
						});
						close.addEventListener('click', function()
						{
							popover.hide({animated:true});
						});
						var popover = Ti.UI.iPad.createPopover({ 
							width:200, 
							height:350,
							title:'Table View',
							rightNavButton:close,
							leftNavButton:canc,
							barColor:'#111'
						}); 
						var searchBar = Ti.UI.createSearchBar({top:0,height:44,barColor:'#333'});

						var tableView = Ti.UI.createTableView({
							data:[{title:'Option 1'},{title:'Option 3'},{title:'Option 2'}],
							top:44,
							height:300
						});

						popover.add(searchBar);
						popover.add(tableView);

						popover.show({
							view:b1,
							animated:true
						});
						

					});
					
					return testContainer;
				},
				conditions: [
					'Clicking on the button should make a popover appear, is it the case?'
				]
			}
		});
		break;
}
