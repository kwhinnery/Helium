# Helium

Helium is a helper library for [Appcelerator Titanium](http://www.appcelerator.com).  Helium provides facilities
for:

* Component-oriented UI construction
* Externalizing and re-using UI properties
* Smarter script loading
* Visual and non-visual unit testing
* JavaScript-y localization (coming soon)
* Ajax (coming soon)
* Utilities for persisting JavaScript object graphs, application level messaging, and more
* Spontaneous generation of rainbows and unicorns

Helium is maintained separately from Appcelerator Titanium, and is not currently supported by Appcelerator through any premium
or community support offerings (though we're happy to help the community out as best we can).

## Documentation

Check out the docs folder in this repository for API documentation and usage instructions.

## Running Helium

Rename `Resources/tests/config.js.example` to `Resources/tests/config.js` - empty string in `TEST_SUITE` indicates that full test
suite should be run - you can specify a suite here as well.  If you set `RUNDEMO` to true, you'll launch the Helium demo app
instead.

