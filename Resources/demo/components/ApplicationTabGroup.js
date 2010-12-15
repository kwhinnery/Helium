(function() {
	he.register('ApplicationTabGroup', function(args) {
		var tabs = he.create('TabGroup');
		
		var incomplete = he.create('IncompleteWindow');
		tabs.addTab(he.create('Tab',{
			icon:'demo/images/inbox.png',
			title:'Incomplete',
			window:incomplete
		}));
		
		var complete = he.create('CompleteWindow');
		tabs.addTab(he.create('Tab',{
			icon:'demo/images/star.png',
			title:'Complete',
			window:complete
		}));
		
		return tabs;
	});
})();