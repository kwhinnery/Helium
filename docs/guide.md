# User Guide

Helium is a helper library for [Appcelerator Titanium](http://www.appcelerator.com), licensed under the
[Apache 2.0 Open Source License](http://www.apache.org/licenses/LICENSE-2.0.html).  While Helium provides
only gentle massaging and augmentation to the core Titanium APIs, Helium is intended to make it easier to
write *COMPONENT-ORIENTED* and *EVENT-DRIVEN* rich client applications (like your mobile app).

## Component-Oriented?

A useful way to think about your Titanium Mobile application is to consider it a combination of loosely coupled,
reusable components.  Your job as the developer is to build components can be used to build a more complex 
application.  A useful metaphor is a LEGO set - let's say, hypothetically, that you are putting together a 
[LEGO Death Star](http://shop.lego.com/ByTheme/Product.aspx?p=10188&cn=416&d=322) with your son or daughter.
If you sat down and tried to build the entire thing from top to bottom, you would quickly lose your place.  Instead,
you build the frame first, then the garbage chute, then the Emperor's throne room, the detention room, and so on, 
and then place these higher level components inside the frame of the Death Star.  You complete the construction of 
a very complicated LEGO model by breaking up its construction into more manageable chunks.  You should approach building 
your Titanium Mobile application in the same way.

The LEGO bricks in our case are the Titanium APIs for creating Views, Buttons, and other widgets.  The intermediate
components in your application might be a common footer, a specialized button, a custom TableViewRow, or a login view.
You will be coding these smaller components as stand-alone widgets, breaking up your application into more manageable,
reusable, and testable (!) chunks.  With each of these components, you will compose a higher-level application,
like a game, a Twitter client, or a mobile client for your Human Resources ERP system.

Each component you build is concerned with only three things:

* Building its self
* Managing its internal state (reacting to user input, interacting as needed with business objects or web services)
* Publishing and/or subscribing to events that it cares about

## Event-Driven?

Assembling the components needed for your application is only half the battle for most applications.
Components need to accept user input and update themselves as a result of user interaction or other events
inside your application (a web service returning results, or a record inserted into a database).

In a good rich client application, this is accomplished by publishing and subscribing to events.  JavaScript
(and Titanium Mobile) is naturally event driven, so most of the plumbing for building an event driven application
is already baked into the framework.  Not only can your components react to standard events like clicks and
so forth - they can also respond to application-level events and provide their own event interface.

This is a lot of hypotheticals - let's see how this plays out in code.

## Using Helium

To use all Helium functionality, just Ti.include the file into the current context - this will create a global
`he` namespace which contains the Helium API:

	Ti.include('/helium.js');

## Creating components

Helium allows you to create Titanium widgets and custom components, styled by Property Sets (psets).  psets are very similar
to CSS (or JSS) classes, but since they're declared in JavaScript, you can use variables and helper functions while declaring them,
which is incredibly powerful.  Default psets can be assigned for an object type, or they can be used similarly to style classes. 
Objects can be created using multiple pset declarations, all merged together with the latter arguments taking precedence 
over the former.  Objects in the `Ti.UI` namespace can be created and styled like so:

	var myThemeColor = '#ff0000';
	
	he.registerPsets({
		View: { //default pset for all Ti.UI.View objects
			backgroundColor:myThemeColor,
			height:100,
			width:100
		},
		roundedCorners: { // this is used like a CSS style class, only it's created with dynamic info
			borderRadius:Ti.Platform.displayCaps.platformWidth/10
		}
	});
	
	var v = he.create('View','roundedCorners',{width:200}); //can specify as many string pset names or objects as desired
	/*
		v has:
			- backgroundColor:'#ff0000'
			- height:100
			- width: 200 - note that the last argument to he.create takes precedence
			- borderRadius: whatever the dynamically computed value is when the pset was registered
	*/
	
You can also create your own higher-level widgets to use with `he.create`, which we'll go over next.

## Registering components

To create a component in Helium, you will use `he.register`.  This function takes two arguments - the first
is the name of your new component, and the second is a function that builds and returns it:
	
	he.register('MyView', function(args) {
		var v = he.create('View',args||{});
		v.add(he.create('Label',{text:'Hello World'}));
		return v;
	});

An astute reader might ask 'Why do I need `he.register`, can't I just declare a function that builds a component?'
Well you could, but registering a widget with `he.register` allows you to create an instance of your
widget with `he.create`, which has two key benefits:

*Helium will auto-merge psets and custom arguments for your constructor*

	he.create('MyView','short','roundedCorners',{top:10}); // args variable for he.register function 
															// gets the merged version of all arguments
	
*You can use default psets with your own custom components*

	he.registerPsets({
		MyView: {
			backgroundColor:'red',
			someCustomProperty:true
		}
	});
	
	he.create('MyView'); // args variable for call to he.register above will get {backgroundColor:'red',someCustomProperty:true}
	
## Making your components do stuff

Chances are that your components will need to react to user input and input from the application environment.  The way to
make your components react is to allow them to publish and subscribe to custom events:

	he.register('MyView', function(args) {
		var v = he.create('View');
		var l1 = he.create('Label',{text:'logged out'});
		var l2 = he.create('Label',{text:'logged in',visible:false});
		l2.addEventListener('click',function() {
			v.fireEvent('textClicked');
		});
		v.add(l1);
		v.add(l2);
		
		//custom event - listening for authentication
		v.addEventListener('authenticated',function(e) {
			l1.hide();
			l2.show();
		});
		
		return v;
	});
	
	//Create an instance of my view
	var myView = he.create('MyView');
	
	//after authentication, switch view state via event...
	myView.fireEvent('authenticated');
	
	//If I care about the label getting clicked, I can subscribe to that event...
	myView.addEventListener('textClicked', function() {
		alert('clicked!');
	});

## And much, much more

Helium is packed with other goodies, which this guide will include over time.  But these are the basics of creating a component-oriented,
event-driven app with Helium.  Check out the API reference, source code, and demo app for more information.
