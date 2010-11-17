/*
	Your application's app.js should be little more than a bootstrap file
	for the rest of your application - let your factory functions handle all
	the heavy lifting
*/

Ti.include(
	'/helium.js',
	'/demo/model/Todo.js', //Include our business model object
	'/demo/components/common.psets.js', //Load up a file which defines shared and default psets
	'/demo/components/common.js', //Load up common UI widgets - many defined in one file
	'/demo/components/ApplicationTabGroup.js', //by convention, bigger components can go in single files (though they need not)
	'/demo/components/CompleteWindow.js',
	'/demo/components/IncompleteWindow.js'
);

//Optionally run your unit tests
//Ti.include('/demo/tests/tests.js');
//he.test.run();

//Bootstrap your application
var appTabs = he.create('ApplicationTabGroup');
appTabs.open();