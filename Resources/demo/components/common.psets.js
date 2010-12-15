(function() {
	var textColor = '#000';
	var barColor = '#ff0000';
	
	he.registerPsets({
		Label: {
			color:textColor,
			font: {
				fontFamily:he.os({
					iphone:'Helvetica Neue',
					android:'Droid Serif'
				}),
				fontSize: he.pt(14,21,10)
			}
		}
	});
})();