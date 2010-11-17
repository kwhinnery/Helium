// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');
var win = Ti.UI.createWindow();
win.add(Ti.UI.createImageView({image:'helium.png', height:'auto', width:'auto'}));
win.add(Ti.UI.createLabel({
	text:'Unit tests in progress - check the console for details.',
	color:'#787878',
	bottom:20,
	right:10,
	left:10,
	font:{fontSize:12},
	height:'auto',
	textAlign:'center'
}));
win.open();

//Include Helium and associated tests
Ti.include(
	'/helium.js',
	'/tests/config.js',
	'/tests/test.js',
	'/tests/core.js',
	'/tests/ui.js'
);

//Run test suite
var suite = (typeof(TEST_SUITE)!='undefined') ? TEST_SUITE : '';
he.test.run(suite);