(function() {
	//migrate the database, if needed
	var db = Ti.Database.open('todos');
	db.execute('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, todo TEXT, done INTEGER)');
})();

//Declare a Todo class
function Todo(text,done,id) {
	this.text = text;
	this.done = done;
	this.id = id;
	
	//check this todo item off the list
	this.checkOff = function() {
		this.done = true;
		Todo.save(this);
		he.pub('app:todo.completed'); //app-wide notification that we updated a record
	};
}

//Add 'static' functions to the Todo object
//We're sorta imitating the ActiveRecord pattern
Todo.list = function(done) {
	
};

Todo.save = function(todo) {
	
};