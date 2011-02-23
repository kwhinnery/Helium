# API Documentation

Welcome to the Helium API documentation - Code Strong.

## Testing

Helium provides a framework for visual and non-visual unit testing.  Test suites can be added and executed at any time, but are typically `Ti.include`-ed in `app.js` and run immediately in non-production situations.

### he.test.add(/\*Object\*/ args)

Add a unit test to the set of tests to be run.  `args` contains the necessary elements for the test:

<table>
	<tr>
		<th>name</th>
		<td>(String) the name of the test, output in the console</td>
	</tr>
	<tr>
		<th>suite</th>
		<td>(String, optional) the name of the test suite the test is associated with</td>
	</tr>
	<tr>
		<th>setup</th>
		<td>(Function, optional) function to be run first, executing any setup logic for the test</td>
	</tr>
	<tr>
		<th>asynch</th>
		<td>(Boolean, optional, default: false) whether or not this test will run and return immediately. `asynch` tests need to manually call `he.test.done()`</td>
	</tr>
	<tr>
		<th>visual</th>
		<td>
			(Object, visual tests only)
			<table>
				<tr>
					<th>build</th>
					<td>(Function) a function that must return a view, to be added inside the visual test window, which implements a visual test</td>
				</tr>
				<tr>
					<th>conditions</th>
					<td>(Array<String>) one or more strings describing the visual conditions that must be met for the test to pass</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<th>unit</th>
		<td>(Function) a non-visual test to be run, will contain assertions</td>
	</tr>
</table>

#### Example

	//Non-visual test
	he.test.add({
		name:'Test addition',
		suite:'math',
		unit: function() {
			he.test.assert(2+2===4,'Two plus two equals four');
		}
	});
	
	//Asynchronous non-visual test
	he.test.add({
		name:'Test Ajax',
		suite:'network',
		asynch:true,
		unit: function() {
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function() {
				he.test.assert(true,'Network call came back');
				he.test.done();
			};
			xhr.open('GET','http://www.google.com');
			xhr.send();
		}
	});
	
	//Asynchronous non-visual test with failure after specified timeout length
	he.test.add({
		name:'Test Ajax',
		suite:'network',
		asynch:true,
		fail: "Message will be displayed if async test did not complete after specified timeout.",
		timeout: 1000, //Add failure if he.test.done() has not called after 1000ms.
		unit: function() {
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function() {
				he.test.assert(true,'Network call came back');
				he.test.done();
			};
			xhr.open('GET','http://www.google.com');
			xhr.send();
		}
	});
	
	//Visual test
	he.test.add({
		name:'Testing UI colors',
		suite:'ui',
		visual: {
			build: function() {
				var testContainer = Ti.UI.createView({layout:'vertical'});
				testContainer.add(Ti.UI.createLabel({
					text:'All your base are belong to us!',
					color:'red'
				}));
				testContainer.add(Ti.UI.createLabel({
					text:'Is this real life?',
					color:'green'
				}));
				return testContainer;
			},
			conditions: [
				'Is the first label red?',
				'Is the second label stacked below, and green in color?'
			]
		}
	});
	
### he.test.done()

For asynchronous tests, indicate that the currently executing test has concluded.

#### Example

	//Asynchronous non-visual test
	he.test.add({
		name:'Test Ajax',
		suite:'network',
		asynch:true,
		unit: function() {
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function() {
				he.test.assert(true,'Network call came back');
				he.test.done();
			};
			xhr.open('GET','http://www.google.com');
			xhr.send();
		}
	});

### he.test.warn(/\*String\*/ warningMessage)

Print a warning message to the test console, and register a test warning for the final test report.

#### Example

	he.test.add({
		name:'Test sanity',
		suite:'sanity',
		unit: function() {
			if (you.likeJustinBieber) {
				he.test.warn('Dude. Seriously?');
			}
			var justinBieberSucks = true;
			he.test.assert(justinBieberSucks,'Justin Bieber sucks');
		}
	});
	
### he.test.assert(/\*Boolean\*/ value, /\*String\*/ description)

Make a test assertion, with a description of the condition you are testing.  Test passes and failures will be counted and reported when all tests in a suite (or all tests) are complete.

#### Example

	he.test.add({
		name:'Test something',
		suite:'something',
		unit: function() {
			var titaniumIsAwesome = true;
			he.test.assert(titaniumIsAwesome,'Titanium is an awesome platform');
		}
	});
	
### he.test.assertTypeof(/\*Polymorphic\*/ value, /\*String\*/ type, /\*String\*/ description)

Asserts the value is of the passed type. Can pass 'array' as type and it will use he.isArray to test type.

#### Example

	he.test.add({
		name: 'Test thing is object',
		suite: 'things',
		unit: function() {
			var thing = {};
			he.test.assertTypeof(thing, 'object', 'thing is object!')
		}
	})
	
	he.test.add({
		name: 'Test foobar is array',
		suite: 'things',
		unit: function() {
			var foobar = [];
			he.test.assertTypeof(foobar, 'array', 'foobar is array!')
		}
	})
	
### he.test.run(/\*String [optional]\*/ suite)

Run unit tests, and print output to the console and screen (in the form of a summary alert).  Optionally takes a string, which will restrict the tests run to a given suite.  If suite is undefined or an empty string, all tests will be run.

#### Example

	he.test.run('ui'); // run tests in the ui suite
	he.test.run(); // run all tests
	

## Helium Core

These functions are used globally in all aspects of Helium.  If the Helium library were to be broken up into parts (likely down the road), these functions would be required by all sub-modules.

### he.isArray(/\*Object\*/ obj) : Boolean

Determine whether `obj` is an array.

#### Example

	var willBeTrue = he.isArray([1,2,3]);
	var willBeFalse = he.isArray({'0':1,'1':2,'2':3});
	
### he.extend(/\*Object\*/ base, /\*Object...\*/ properties) : Object

Replace the attributes of the base object with the attributes of one or more passed objects.  Used for merging property sets.  Not recursive - all top-level attributes of `base` are replaced with any object by the same key in the `properties` object(s).  Returns the modified base object.

#### Examples

	var base = {
		awesome:true,
		sumpm:'else',
		nested: {
			one:'two',
			three:'four
		}
	};
	
	//make a clone of an object
	var clone = he.extend({},base);
	
	//replace values in the base object
	he.extend(base,{awesome:false},{sumpm:'other'});
	//base.awesome === false
	//base.sumpm === 'other'
	
	//note - replacement of values is not recursive
	he.extend(base,{
		nested: {foo:'bar'}
	});
	//he.nested.one === undefined
	//he.nested.foo === 'bar'
	
### he.load(/\*String... scriptPaths\*/)

Load a script in the given path(s) exactly once in the current execution context.  Avoids redundant script loading and collisions.

#### Example

	he.load('/lib/something.js', '/lib/somethingElse.js');
	
	// Will do nothing, since these scripts already loaded
	he.load('/lib/something.js', '/lib/somethingElse.js');
	
### he.hasProperty(/\*String\*/ key) : Boolean

Determine if a given property (Ti.App.Properties) has been defined.

#### Example

	var defined = he.hasProperty('savedUsername');
	
### he.saveObject(/\*String\*/ key,/\*Object\*/ val)

Create a persistent JavaScript object between app launches.  Uses JSON to store object via `Ti.App.Properties`.

#### Example

	var profile = {
		username: 'jhaynie',
		title: 'CEO'
	};
	
	he.saveObject('savedProfile',profile);
	
### he.loadObject(/\*String\*/ key) : Object

Load a saved JavaScript object by the given key - will only work with objects saved via `he.saveObject`.

#### Example

	var profile = he.loadObject('savedProfile');
	Ti.API.info(JSON.stringify(profile));