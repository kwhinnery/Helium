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
		name: 'Test async failure after timeout',
		suite: 'test',
		asynch: true,
		fail: 'Async test did fail as expected and error was logged after timeout.',
		timeout: 500,
		unit: function () {
			// Don't call he.test.done() and we should get an error to signify the test did not complete withing the timeout (in this case 500ms).
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
	
	he.test.add({
		name: 'Testing tyepof assert',
		suite: 'test',
		unit: function () {
			he.test.assertTypeof({}, 'object', 'Should be typeof object');
			he.test.assertTypeof('foobar', 'string', 'Should be typeof string');
			he.test.assertTypeof(123456, 'number', 'Should be typeof number');
			he.test.assertTypeof(true, 'boolean', 'Should be typeof boolean');
			
			var blah;
			he.test.assertTypeof(blah, 'undefined', 'Should be typeof undefined');
			
			he.test.assertTypeof([], 'array', 'Should be typeof array');
		}
	});
})();