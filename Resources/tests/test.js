(function() {
	he.test.add({
		name:'Testing asynch unit test functionality',
		suite:'test',
		setup: function() {
			he.test.assert(true,'Setup function called');
		},
		unit: function() {
			he.test.assert(true, 'Assertion should return true');
			he.test.warn('This is a test warning - should show up in the console, not to worry.');
		}
	});
	
	he.test.add({
		name:'Testing visual test functionality',
		suite:'test',
		visual: {
			build: function() {
				return Ti.UI.createView({
					backgroundColor:'blue',
					top:50,
					left:0,
					right:0,
					height:80
				});
			},
			conditions: [
				'is the box blue? (testing visual tests - answering no is a failed test.  Put any question you want here.)',
				'is the blue box as wide as the test container?'
			]
		}
	});
})();