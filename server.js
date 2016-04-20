var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//get /todos
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false
	};

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});

//get /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//DELETE /todos/id
app.delete('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No Todo with id'
			});
		} else {
			res.status(204).send();
		}

	}, function(e) {
		res.status(500).send();
	});

});

//update /id
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};
	var todoId = parseInt(req.params.id, 10);

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).json({
				error: 'No Todo with id'
			});
		}

	}, function(e) {
		res.status(500).send();
	});

});

//get /users
app.get('/users', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('email') && query.email.length > 0) {
		where.email = {
			$like: '%' + query.email + '%'
		};
}
	if (query.hasOwnProperty('p') && query.p.length > 0) {
		where.password = {
			$like: '%' + query.p + '%'
		};
	}
	db.user.findAll({
		where: where
	}).then(function(users) {
		res.json(users);
	}, function(e) {
		res.status(500).send();
	});

});

//get /users/:id
app.get('/users/:id', function(req, res) {
	var userId = parseInt(req.params.id, 10);
	db.user.findById(userId).then(function(user) {
		if (user) {
			res.json(user.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//DELETE /todos/id
app.delete('/users/:id', function(req, res) {

	var userId = parseInt(req.params.id, 10);
	db.user.destroy({
		where: {
			id: userId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No user with id'
			});
		} else {
			res.status(204).send();
		}

	}, function(e) {
		res.status(500).send();
	});

});

//update /id
app.put('/users/:id', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var attributes = {};
	var userId = parseInt(req.params.id, 10);

	if (body.hasOwnProperty('email')) {
		attributes.email = body.email;
	}

	if (body.hasOwnProperty('password')) {
		attributes.password = body.password;
	}

	db.user.findById(userId).then(function(user) {
		if (user) {
			user.update(attributes).then(function(user) {
				res.json(user.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).json({
				error: 'No Todo with id'
			});
		}

	}, function(e) {
		res.status(500).send();
	});

});

// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then( function (user) {
		res.header('Auth', user.generateToken('authentication')).json(user.toPublicJSON());
	}, function (){
		res.status(401).send();
	});
});


db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});