/*
Copyright 2010 Kevin Whinnery

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var he = {};

/*
Helium Test
-----------
super simple unit testing framework
*/
(function() {
	he.test = {}; //test namespace
	var unitTests = [],
	failureMessages = [],
	testsExecuted = 0,
	assertions = 0,
	successes = 0,
	failures = 0,
	warnings = 0,
	executing = false,
	asyncFailTimeout; // Holds a JS timeout object that will be exectued after a defined period if an async test is not completed.
	
	/*
	Add a test to the unit test suite.  Possible arguments are:
	{
	name: String, name of unit test
	suite: String (optional), name of unit test suite this test belongs to
	setup: Function (optional), perform any setup that needs to happen prior to the test being run
	//and one of...
	visual: {
	build: Function, create a view, to be added to a view inside a window, to create a visual test
	conditions: String[], a description of the conditions that need to be true for the test to pass
	}
	//or...
	unit: Function, a non-visual test to be run - must call he.test.done to complete, as all
	tests are assumed to be asynchronous
	}
	*/	
	he.test.add = function(/*Object*/ test) {
		unitTests.push(test);
	};

	//Flip a boolean flag to indicate a test has completed running
	he.test.done = function() {
		executing=false;
		
		// Test is done, if we have a failure timeout clear it, async test went ok.
		if (asyncFailTimeout != undefined) {
			clearTimeout(asyncFailTimeout);
		}
	};

	//Insert a warning
	he.test.warn = function(/*String*/ description) {
		warnings++;
		Ti.API.warn('[Helium] UNIT TEST WARNING: '+description);
	};

	//Assert that a given condition is true
	he.test.assert = function(/*Boolean*/ value, /*String*/ description) {
		assertions++;
		if (value) {
			successes++;
			Ti.API.debug('[Helium] UNIT TEST PASSED: '+description);
		}
		else {
			failures++;
			failureMessages.push(description);
			Ti.API.error('[Helium] UNIT TEST FAILED: '+description);
		}
	};
	
	//Assert that the passed value is of the correct type, does accept 'array' as a type and will use he.isArray to check arrays.
	he.test.assertTypeof = function(/*Polymorphic*/ value, /*String*/ type, /*String*/ description) {
		if (type === 'object' ||
			type === 'number' ||
			type === 'string' ||
			type === 'boolean' ||
			type === 'undefined') {
			return he.test.assert((typeof value === type), description);
		} else if (type === 'array') {
			return he.test.assert(he.isArray(value), description);
		} else {
			he.test.assert(false, description);
			Ti.API.error('[Helium] invalid assertTypeof parameter passed, use: object, number, string or array');
		}
	};

	//Run all tests, or the given suite
	he.test.run = function(/*String [optional]*/ suite) {
		//reset and clone unit test set for a fresh run
		var tests = unitTests.slice();
		failureMessages = [];
		assertions = 0;
		successes = 0;
		warnings = 0;
		failures = 0;

		//current set of visual test conditions
		var visualConditions = [];

		//Set up UI tests
		var userTestView = null, testWindow = null; //will be overridden and re-added with every visual test

		var testControls = Ti.UI.createView({
			height:100,
			bottom:5,
			left:5,
			right:5
		});

		function continueVisual() {
			visualConditions.shift();
			if (visualConditions.length > 0) {
				conditionText.text = visualConditions[0];
			}
			else {
				conditionText.text = 'Waiting...';
				he.test.done();
				testWindow.close();
			}
		}

		var noButton = Ti.UI.createButton({
			title:'No',
			right:0,
			width:50,
			height:50
		});
		
		noButton.addEventListener('click', function() {
			he.test.assert(false,visualConditions[0]);
			continueVisual();
		});

		var yesButton = Ti.UI.createButton({
			title:'Yes',
			right:55,
			width:50,
			height:50
		});
		yesButton.addEventListener('click', function() {
			he.test.assert(true,visualConditions[0]);
			continueVisual();
		});

		var conditionText = Ti.UI.createLabel({
			text:'Waiting...',
			color:'#000',
			font:{
				fontSize:12
			},
			top:0,
			left:0,
			bottom:0,
			right:110
		});

		testControls.add(yesButton);
		testControls.add(noButton);
		testControls.add(conditionText);

		var testViewContainer = Ti.UI.createView({
			backgroundColor:'#fff',
			bottom:110,
			left:5,
			right:5,
			top:5
		});

		Ti.API.info('********* Begin Unit Tests ***********');
		Ti.API.info('Begin hardcore testing action...');
		var timer = setInterval(function() {
			if (tests.length == 0 && !executing) {
				clearInterval(timer);
				Ti.API.info('Test run finished!  So, how did we do?');
				Ti.API.info('Total assertions: ' + assertions);
				Ti.API.info('Successes: ' + successes);
				Ti.API.info('Warnings: ' + warnings);
				Ti.API.info('Failures: ' + failures);

				//alert uses setTimeout to get around android timing issues
				var title = 'Tests Complete';
				var msg = 'Yeah, baby!  No test failures!';
				if (failures > 0) {
					Ti.API.error('Aww, hamburgers!  You have '+failures+' failed tests - check the log for details.');
					msg = 'D\'oh!  The following tests failed: \n';
					for (var j=0;j<failureMessages.length;j++) {
						msg=msg+failureMessages[j]+'\n';
					}
				}
				var alertDialog = Titanium.UI.createAlertDialog({
					title: 'Tests Complete',
					message: msg,
					buttonNames: ['OK']
				});
				alertDialog.show();

				Ti.API.info('********* End Unit Tests ***********');
			}
			if (!executing && tests.length > 0) {
				executing = true;
				var tst = tests.shift();

				if (!suite || tst.suite == suite) {
					Ti.API.debug('[Helium] Executing Test: '+tst.name);
					if (tst.setup != undefined) {
						tst.setup.call(tst);
					}

					if (tst.unit != undefined) {
						tst.unit.call(tst);
						if (!tst.asynch) {
							executing = false;
						}
						else {
							// Async test has a fail message and timeout, check that he.test.done() has been called by callback after timeout time.
							// This means that in async tests if the test is not completed within the timeout time (i.e. callback has not been fired) we mark the test as a failure.
							if (tst.fail != undefined && tst.timeout != undefined) {
								asyncFailTimeout = setTimeout(function () {
									if (executing) { // It's still executing after specified timeout period.
										// Give it a failure status.
										failures++;
										failureMessages.push(tst.fail);
										Ti.API.error('[Helium] UNIT TEST FAILED: '+tst.fail);

										// Manually mark the test as completed.
										he.test.done();
									}
								}, tst.timeout);
							}
						}
						testsExecuted++;
					}
					else { //assuming visual test in this case
						if (userTestView != null) {
							testViewContainer.remove(userTestView);
						}
						visualConditions = tst.visual.conditions;
						userTestView = tst.visual.build();
						testViewContainer.add(userTestView);
						conditionText.text = visualConditions[0];
						//grr... window management cruft for Android - need to re-create every time
						testWindow = Ti.UI.createWindow({
							backgroundColor:'#787878'
						});
						testWindow.add(testControls);
						testWindow.add(testViewContainer);

						testWindow.open({animated:false});
					}
				}
				else {
					executing = false;
				}
			}
		},50);
	};

})();

/* 
Helium Core
-----------
Core utilities and helper functions.
*/
(function() {
	he.isArray = function(obj) {
		return !!(obj && obj.concat && obj.unshift && !obj.callee);
	};

	//Extend an object with the properties from another (thanks Dojo)
	//public API defined by he.extend - calls private function mixin
	var empty = {};
	function mixin(/*Object*/ target, /*Object*/ source){
		var name, s, i;
		for(name in source){
			if (source.hasOwnProperty(name)) {
				s = source[name];
				if(!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))){
					target[name] = s;
				}
			}
		}
		return target; // Object
	};
	he.extend = function(/*Object*/ obj, /*Object...*/ props){
		if(!obj){ obj = {}; }
		for(var i=1, l=arguments.length; i<l; i++){
			mixin(obj, arguments[i]);
		}
		return obj; // Object
	};

	//Ensure scripts are Ti-included exactly once in the current context
	var scriptRegistry = {};
	he.load = function(/*String... arguments*/) {
		for (var i=0;i<arguments.length;i++) {
			if (scriptRegistry[arguments[i]]==undefined) {
				scriptRegistry[arguments[i]]=0;//loaded
				Ti.include(arguments[i]);
			}
		}
	};

	//Flexible wrappers around the properties API for persisting any JavaScript object
	he.hasProperty = function(/*String*/ key) {
		return Ti.App.Properties.hasProperty(key);
	};
	he.saveObject = function(/*String*/ key,/*Object*/ val) {
		Ti.App.Properties.setString(key,JSON.stringify(val));
	};
	he.loadObject = function(/*String*/ key) {
		var value = Ti.App.Properties.getString(key);
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	};

	//Shorthand for app-level events
	var listeners = [];
	he.pub = function(/*String*/ name,/*Object*/ data) {
		//first, check to see if we have a regex listener and call it if we do
		for (var i = 0;i < listeners.length;i++) {
			var listener = listeners[i];
			if (listener.regex.test(name)) {
				listener.fn.call(this,data);
			}
		}
		//then, pass through to standard Titanium event handling
		Ti.App.fireEvent(name,data||{});
	};
	he.sub = function(/*String or RegExp*/ nameOrRegex,/*Function*/ fn) {
		//string indicated plain old subscribe
		if (typeof(nameOrRegex) == 'string') {
			Ti.App.addEventListener(nameOrRegex,fn);
		}
		else {
			//assume we have a regular expression and add it to listeners
			listeners.push({
				regex:nameOrRegex,
				fn:fn
			});
		}
	};

	//OS, Locale, and Density specific branching helpers
	var density = Ti.Platform.displayCaps.density;
	var locale = Ti.Platform.locale;
	var osname = Ti.Platform.osname;

	he.density = function(/*Object*/ map) {
		var type;
		if (density == 'high') {
			type = typeof(map.high);
			if (type != 'undefined') {
				if (type == 'function') { return map.high(); }
				else { return map.high; }
			}
		}
		else if (density == 'medium') {
			type = typeof(map.medium);
			if (type != 'undefined') {
				if (type == 'function') { return map.medium(); }
				else { return map.medium; }
			}
		}
		else if (density == 'low') {
			type = typeof(map.low);
			if (type != 'undefined') {
				if (type == 'function') { return map.low(); }
				else { return map.low; }
			}
		}
	};

	/*
	iPhone positioning is based on a point system, which is always 320x480.
	Android has many, many different screen densities and we don't support a
	point system.  For cross-platform positioning, we need to normalize for this
	by assuming the 'normal' value is the point value for iPhone, and the 320x480
	pixel value for Android.  You can then specify a android high density pixel value,
	then an Android low density pixel value.  

	This sucks - hopefully Helium or Titanium can get smarter about this.

	*/
	he.pt = function(/*Number*/ normal,/*Number*/ androidHigh,/*Number*/ androidLow) {
		if (osname == 'android') {
			if (density == 'high' && androidHigh) {return androidHigh;}
			if (density == 'low' && androidLow) {return androidLow;}
		}
		return normal;
	};

	he.locale = function(/*Object*/ map) {
		var def = map.def||null; //default function or value
		if (map[locale]) {
			if (typeof map[locale] == 'function') { return map[locale](); }
			else { return map[locale]; }
		}
		else {
			if (typeof def == 'function') { return def(); }
			else { return def; }
		}
	};

	he.os = function(/*Object*/ map) {
		var def = map.def||null; //default function or value
		if (map[osname]) {
			if (typeof map[osname] == 'function') { return map[osname](); }
			else { return map[osname]; }
		}
		else {
			if (typeof def == 'function') { return def(); }
			else { return def; }
		}
	};
})();

/*
Helium Network
--------------
Ajax and remote server communication helpers
*/
(function() {
	/*
	Simplified Ajax API for remote services
	Parameters:
	url: String, The resource you are addressing via HTTP
	options: {
	method: String ('GET'), The HTTP method you're using
	body: Object or XML/JSON String - JavaScript object with parameters (usually translated to form-encoded for POST)
	headers: Array and array of key/value objects for the HTTP headers for this request
	format: String, one of ['xml','json','text'] - determines what your handlers get back as 1st arg
	success: function(responseData,HTTPClient) - success handler is fired onload - get your specified data type and raw XHR
	error: function(HTTPClient) - called on any error condition - get raw XHR
	}
	*/
	//he.ajax = function(/*String*/ url, /*Object*/ options) {
		//TODO: Need to give this API more thought
		//};
})();

/*
Helium UI
---------
Helpers for registering and styling Titanium and app-specific components
*/
(function() {
	var psets={};

	//Register new psets - currently all psets are global (like CSS)
	he.registerPsets = function(/*Object*/ propertySets) {
		he.extend(psets,propertySets);
	};

	//get the pset by the given key
	he.getPset = function(/*String*/ key) {
		return he.extend({},psets[key]); //return clone
	};

	//apply a pset to a selected target
	he.applyPset = function(/*Object*/ target /*String... pset names*/) {
		for (var j = 1; j < arguments.length; j++) {
			he.extend(target,psets[arguments[j]]);
		}
		return target;
	};

	//transition pset properties
	he.transform = function(/*Object*/ target, /*String or Array*/ pset, /*Number [optional]*/ duration, /*Function [optional]*/ callback) {
		var args = {};
		if (typeof(pset) == 'string') {
			args = he.getPset(pset);
		}
		else {
			for (var i=0;i<pset.length;i++) {
				he.applyPset(args,pset[i]);
			}
		}
		/*
		he.os({
		iphone:function() {args.transform = Ti.UI.create2DMatrix();}
		});
		*/
		args.duration=duration||0;
		target.animate(args,callback||function(){});
	};

	/*
		Register a custom UI builder, which will be passed merged pset arguments
	*/
	var widgetRegistry = {};
	he.register = function(/*String*/ widgetName, /*Function*/ builder) {
		var widget = {};
		widget[widgetName] = builder;
		he.extend(widgetRegistry,widget);
	};

	/*
		Create a Titanium or custom UI component, styled with psets
	*/
	he.create = function(/*String*/ viewType /* String or Object... psets or plain objects */) {
		var args = {};

		//First, grab widget defaults if we have them
		he.applyPset(args,viewType);

		for (var j = 1; j < arguments.length; j++) {
			if (typeof(arguments[j]) == 'string') {
				he.applyPset(args,arguments[j]);
			}
			else {
				he.extend(args,arguments[j]);
			}
		}

		//Use a custom builder if we have it, otherwise assume it's a Ti.UI namespaced object
		if (widgetRegistry.hasOwnProperty(viewType)) {
			return widgetRegistry[viewType](args);
		}
		else {
			try {
				return Ti.UI['create'+viewType](args);
			} catch(e) {
				Ti.API.error('[Helium.create] No constructor found for type: '+viewType);
				return null;
			}
		}
	};
})();