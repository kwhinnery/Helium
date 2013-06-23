// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');

//Load test configuration
//Ti.include('/tests/config.js');

//launch unit tests or demo
var demo = (typeof(RUNDEMO)!='undefined') ? RUNDEMO : false;
if (demo) {
	//Include the contents of demo/app.js, which should mirror the app.js of
	//a real Helium app
	Ti.include('/demo/app.js');
}
else {
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
	
	//Include tests
	Ti.include(
		'/helium.js',
		'/tests/test.js',
		'/tests/core.js',
		'/tests/ui_platform_specific.js',
		'/tests/ui.js'
	);
	
	var suite = (typeof(TEST_SUITE)!='undefined') ? TEST_SUITE : '';
	he.test.run(suite);
}