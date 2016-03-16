var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res)  {
	res.send('Todo API Root');
});

//get /todos
app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed ==='true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	}else if (queryParams.hasOwnProperty('completed') && queryParams.completed ==='false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	};

	if(queryParams.hasOwnProperty('description') && queryParams.description.trim().length > 0 ) {
		filteredTodos = _.where(filteredTodos, {description: queryParams.description});
	};

	if(filteredTodos){
		res.json(filteredTodos);
	}else{
		res.status(404).send();
	}
	
});

//get /todos/:id
app.get('/todos/:id', function (req, res) {
	//res.json('Asking for Todo with id of ' + req.params.id);
	//res.json(todos[req.params.id]);
	var todoId  =  parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	

	if (matchedTodo) {
		res.json(matchedTodo);	
	}else{
		res.status(404).send();
	}
});

//POST /todos
app.post('/todos', function (req, res) {

	var body = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(404).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId++;
	
	todos.push(body)
	res.json(todos);
});

//DELETE /todos/id
app.delete('/todos/:id', function (req, res) {
	var todoId  =  parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	

	if (matchedTodo) {
		//res.json(matchedTodo);
		//todos.splice(index, 1);	
		todos = _.without(todos, matchedTodo);
		res.json(todos);
	}else{
		res.status(404).json({"error": "no todo found with that id"});
	}
});

//update /id
app.put('/todos/:id', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if(body.hasOwnProperty('completed') || !_.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}else {
		//never provided
	}

	if(body.hasOwnProperty('description') || !_.isString(body.description) || body.description.trim().length > 0 ){
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}else {
		//never provided
	}
	
	_.extend(matchedTodo,validAttributes);
	res.json(todos);
	
});

app.listen(PORT, function (){
	console.log('Express listening on port ' + PORT + '!');
});