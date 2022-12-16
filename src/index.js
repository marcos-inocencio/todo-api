const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( users => users.username === username );

  if(!user) return response.status(404).json({ error: 'User not found' });

  request.user = user;

  return next();
}

function checkTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todos => todos.id === id);

  if(!todo) return response.status(404).json({ error: 'Todo not found' });

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlredyExists = users.some(
    user => user.username === username
  );

  if(userAlredyExists) {
    return response.status(400).json({error: 'Username already exists!'});
  }

  const user = {
    id: uuidv4(),
    name: name, 
    username: username, 
    todos: []
  }

  users.push(user)

  response.status(201).json(user);
});

app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  let todo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  };

  user.todos.push(todo)

  response.status(201).json(todo);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodo, (request, response) => {
  const { user } = request;
  const { todo } = request;

  user.todos.splice(todo, 1);

  response.status(204).send();
});

module.exports = app;