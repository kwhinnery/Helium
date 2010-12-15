(function() {
	
	he.test.add({
		name:'Testing basic property set helpers',
		suite:'ui',
		unit:function() {
			he.registerPsets({
				foo:{
					bar:'baz',
					scooby:['doo'],
					nested:{
						ok:true
					}
				},
				testing:{
					val:123
				},
				overrider: {
					bar:'crap',
					nested:{
						anotherValue:true
					}
				}
			});
			
			var foo = he.getPset('foo');
			var testing = he.getPset('testing');			
			he.test.assert(foo.bar=='baz'&&foo.nested.ok&&foo.scooby[0]=='doo'&&testing.val==123, 'Testing registration of property sets');
			
			//Should not be able to change pset value
			foo.bar = 'kevin';
			var clone = he.getPset('foo');
			he.test.assert(clone.bar=='baz','getPset should always return a clone of the original');
			
			//Should be able to merge multiple psets into a JavaScript object
			//Can be a Titanium widget or anything else
			var target = {myValue:true};
			he.applyPset(target,'foo','testing','overrider');
			he.test.assert(target.myValue,'Should retain original properties');
			he.test.assert(target.bar=='crap','Last specified value from a pset should override');
			//he.test.assert(target.nested.ok&&target.nested.anotherValue,'Should merge sub-objects');
			he.test.assert(target.val==123,'All specified psets should be added to target');
		}
	});
	
	he.test.add({
		name:'Testing basic Titanium widget creation, with defaults, args and psets',
		suite:'ui',
		visual: {
			build: function() {
				//register some psets that we'll need
				he.registerPsets({
					View:{
						backgroundColor:'red'
					},
					myLabel: {
						color:'green'
					}
				});
				
				var testContainer = Ti.UI.createView({layout:'vertical'}); //use raw constructor to avoid Helium defaults
				var v = he.create('View',{top:10,height:50,width:150});
				testContainer.add(v);
				var l = he.create('Label','myLabel',{text:'All your base are belong to us!',height:'auto',width:'auto'});
				testContainer.add(l);
				
				return testContainer;
			},
			conditions: [
				'Is there a red rectangle in a vertical layout?',
				'Is the label text green?'
			]
		}
	});
	
	he.test.add({
		name:'Testing Helium widget registration, creation, transition, and animation',
		suite:'ui',
		visual: {
			build: function() {
				//First, register a basic component - remember, psets become global, like in CSS
				he.registerPsets({
					initialState: {
						backgroundColor:'blue',
						height:100,
						width:100
					},
					newState: {
						backgroundColor:'red',
						height:200,
						width:200
					},
					leftState: {
						left:10
					},
					topState: {
						top:10
					}
				});
				
				he.register('MyView', function(args) {
					var myView = he.create('View',args);
					return myView;
				});
				
				//Next, use the new widget, and apply a pset, then animate it
				var myView = he.create('MyView','initialState');
				
				setTimeout(function() {
					he.applyPset(myView,'newState');
				},2000);
				
				setTimeout(function() {
					he.transform(myView,['leftState','topState'],1000,function() {
						myView.add(he.create('Label',{text:'worked!'}));
					});
				},3000);
				
				function trans() {
					setTimeout(function() {
						he.transform(myView,'initialState',1000);
					},5000);
				}
				
				he.os({
					iphone:trans,
					ipad:trans
				});
				
				return myView;
			},
			conditions: [
				'Initially, did you see a 100x100 blue box?',
				'After two seconds, did the box change to a red 200x200 box?',
				'After three seconds, did the box shift up and left?',
				'After the shift, did a label get added to the box?',
				'After five seconds, did the box morph to its initial blue state (iOS only, Android does not support this)?'
			]
		}
	});
	
	he.test.add({
		name:'Testing point/pixel layout helper',
		suite:'ui',
		visual: {
			build: function() {
				he.registerPsets({
					variableWidth:{
						width:he.pt(50,100,25)
					},
					label: {
						backgroundColor:'#000',
						color:'#fff',
						width:'auto',
						height:50
					}
				});
				
				var testContainer = Ti.UI.createView({layout:'vertical'}); //use raw constructor to avoid Helium defaults
				var ruler = he.create('View',{height:50});
				ruler.add(he.create('Label','label',{text:'a',left:25}));
				ruler.add(he.create('Label','label',{text:'b',left:50}));
				ruler.add(he.create('Label','label',{text:'c',left:100}));
				testContainer.add(ruler);
				
				var v = he.create('View','variableWidth',{backgroundColor:'#ababab',left:0,height:35});
				testContainer.add(v);
				
				return testContainer;
			},
			conditions: [
				he.os({
					iphone:'is the gray bar even with b?',
					android:he.density({
						high:'is the gray bar even with c?',
						medium:'is the gray bar even with b?',
						low:'is the gray bar even with a?'
					})
				})
			]
		}
	});
})();