(function() {
	//quickie random string generator
	function rnd(){ return String((new Date()).getTime()).replace(/\D/gi,''); }
	
	he.test.add({
		name:'Testing he.extend API options',
		suite:'core',
		unit: function() {
			var orig = {
				foo:'bar',
				gang: {
					car:'Mystery Machine',
					members:['Scooby','Shaggy','Thelma','Daphne','Freddy']
				}
			};
			
			var clone = he.extend({},orig);
			he.test.assert(clone.foo=='bar'&&clone.gang.members[1]=='Shaggy','Testing object cloning');
			
			he.extend(orig,{foo:'truthiness'});
			he.test.assert(orig.foo=='truthiness','Testing object extension');
			
			he.extend(orig,{
				gang:{
					car:'Oldsmobile'
				}
			});
			he.test.assert(orig.gang.car=='Oldsmobile','Testing overriding nested property');
			he.test.assert(orig.gang.members==undefined,'Extend should not have touched this array');
		}
	});
	
	he.test.add({
		name:'Testing script loading (enforcing a script is loaded only once in current context)',
		suite:'core',
		unit: function() {
			he.load('/lib/include.js', '/lib/someLibrary/include.js');
			//these should initialize variables in the helium namespace
			
			he.test.assert(he.someUselessJunk=='foo','Testing include');
			he.test.assert(he.otherUselessJunk=='bar','Testing subfolder include');
			
			he.someUselessJunk = 'scrappy';
			he.load('/lib/include.js');
			//This should do nothing
			
			he.test.assert(he.someUselessJunk == 'scrappy','Script include should not override this behavior');
			
			he.otherUselessJunk = 'frodo';
			Ti.include('/lib/someLibrary/include.js');
			he.test.assert(he.otherUselessJunk=='bar','Negative test to make sure Ti.include will load up the file again.');
		}
	});
	
	he.test.add({
		name:'Testing Ti.App.Properties helpers',
		suite:'core',
		unit: function() {
			
			var key1 = rnd();
				
			he.test.assert(!he.hasProperty(key1),'Confirm we get a false for a property key that doesnt exist');
			Ti.App.Properties.setString(key1,'foobar');
			he.test.assert(he.hasProperty(key1) && Ti.App.Properties.getString(key1)=='foobar','Now the key should exist and be set to foobar');
			
			var key2 = rnd();
			var person = {
				name:'Kevin',
				skillz:['Rhyming','Stealing','Hustling','Flowing'],
				info: {
					sex:'Yes Please',
					phone:5554443333
				}
			};
			
			he.saveObject(key2,person);
			var saved = he.loadObject(key2);
			he.test.assert(person.name==saved.name && person.skillz[3]==saved.skillz[3] && person.info.phone==saved.info.phone,'Object saved should have same properties as original');
		}
	});
	
	he.test.add({
		name:'Testing string-based pub/sub',
		suite:'core',
		asynch:true,
		unit: function() {
			
			var gotOne = false, gotOneAsWell = false, gotTwo = false, gotTwoAsWell = false, gotThree = false;
			
			he.sub('app:test.one',function() {
				gotOne = true;
			});
			Ti.App.addEventListener('app:test.one', function() {
				gotOneAsWell = true;
			});
			
			he.sub('app:test.two',function(e) {
				if (e.foo=='bar') {
					gotTwo = true;
				}
			});
			Ti.App.addEventListener('app:test.two', function(e) {
				if (e.foo=='bar') {
					gotTwoAsWell = true;
				}
			});
			
			he.sub('app:test.three',function() {
				gotThree = true;
			});
			
			he.pub('app:test.one');
			he.pub('app:test.two',{foo:'bar'});
			Ti.App.fireEvent('app:test.three');
			
			setTimeout(function() {
				he.test.assert(gotOne,'Got a naked message via he.sub');
				he.test.assert(gotOneAsWell,'Got a naked message via Ti.App.addEventListener');
				he.test.assert(gotTwo,'Got a data-passing message via he.sub');
				he.test.assert(gotTwoAsWell,'Got a data-passing message via Ti.App.addEventListener');
				he.test.assert(gotThree,'Used he.sub to subscribe to an event fired by Ti.App.fireEvent');
				he.test.done();
			},500);		
		}
	});
	
	he.test.add({
		name:'Testing RegExp pub/sub',
		suite:'core',
		asynch:true,
		unit: function() {
			var gotMessage = 0, shouldNotGet = true, gotData = false;
			
			he.sub(/^app:reg\.*/, function(data) {
				gotMessage++;
				if (data && data.foo == 'baz') {gotData = true;}
			});
			
			he.sub(/^app:reg\.*foobar$/,function() {
				shouldNotGet = false;
			});
			
			he.pub('app:reg.one');
			he.pub('app:reg.two',{foo:'baz'});
			
			setTimeout(function() {
				he.test.assert(gotMessage==2,'Got a reg exp message twice via he.sub');
				he.test.assert(shouldNotGet,'Should not fire since RegExp is not satisfied');
				he.test.assert(gotData,'Got a data-passing message via RegExp he.sub');
				he.test.done();
			},500);	
		}
	});
	
	he.test.add({
		name:'Testing screen density helpers',
		suite:'core',
		unit: function() {
			var val = he.density({
				high:1,
				medium:2,
				low:3
			});
			
			var func = he.density({
				high:function() {return 1;},
				medium:function() {return 2;},
				low:function() {return 3;}
			});
			
			var density = Ti.Platform.displayCaps.density, valCorrect = false, funcCorrect = false;
			
			if (density == 'high') {
				valCorrect = val==1; 
				funcCorrect = func==1;
			}
			//Helium considers first-gen iPhones to be 'mid res
			else if (density == 'medium') {
				valCorrect = val==2; 
				funcCorrect = func==2;
			}
			else if (density == 'low') {
				valCorrect = val==3; 
				funcCorrect = func==3;
			}
			
			he.test.assert(valCorrect, 'We got the right raw value back');
			he.test.assert(funcCorrect, 'We got the right function call return back');
		}
	});
	
	he.test.add({
		name:'Testing point helper for normalized positioning and font size, etc., for iPhone/Android',
		suite:'core',
		unit: function() {
			var density = Ti.Platform.displayCaps.density;
			var osname = Ti.Platform.osname;
			
			var val = he.pt(2,3,1), worked = false;
			if (osname == 'iphone' || osname == 'ipad' || (osname == 'android' && density == 'medium')) {
				worked = val==2;
			}
			else if (osname == 'android' && density == 'high') {
				worked = val==3;
			}
			else if (osname == 'android' && density == 'low') {
				worked = val==1;
			}
			
			he.test.assert(worked,'We got the right normalized point value back from the helper');
		}
	});
	
	he.test.add({
		name:'Testing OS helpers',
		suite:'core',
		unit: function() {
			var val = he.os({
				android:1,
				iphone:2,
				ipad:3
			});
			
			var func = he.os({
				android:function() {return 1;},
				iphone:function() {return 2;},
				ipad:function() {return 3;}
			});
			
			var osname = Ti.Platform.osname, valCorrect = false, funcCorrect = false;
			
			if (osname == 'android') {
				valCorrect = val==1; 
				funcCorrect = func==1;
			}
			else if (osname == 'iphone') {
				valCorrect = val==2; 
				funcCorrect = func==2;
			}
			else if (osname == 'ipad') {
				valCorrect = val==3; 
				funcCorrect = func==3;
			}
			
			he.test.assert(valCorrect, 'We got the right raw value back');
			he.test.assert(funcCorrect, 'We got the right function call return back');
		}
	});
	
	he.test.add({
		name:'Testing Locale helpers',
		suite:'core',
		unit: function() {
			var val = he.locale({
				en:1,
				es:2,
				def:3,
				'en-GB':4
			});
			
			var func = he.locale({
				en:function() {return 1;},
				es:function() {return 2;},
				def:function() {return 3;},
				'en-GB':function() {return 4;}
			});
			
			var locale = Ti.Platform.locale, valCorrect = false, funcCorrect = false;
			
			if (locale == 'en') {
				valCorrect = val==1; 
				funcCorrect = func==1;
			}
			else if (locale == 'es') {
				valCorrect = val==2; 
				funcCorrect = func==2;
			}
			else if (locale == 'en-GB') {
				valCorrect = val==4; 
				funcCorrect = func==4;
			}
			else {
				valCorrect = val==3; 
				funcCorrect = func==3;
			}
			
			he.test.assert(valCorrect, 'We got the right raw value back');
			he.test.assert(funcCorrect, 'We got the right function call return back');
		}
	});
	
})();