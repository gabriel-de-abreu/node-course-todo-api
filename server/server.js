require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const _ = require('lodash');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');
var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//Users routes
//Insert a new user
app.post('/users', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    try {
        await user.save();
        var token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }
    catch (error) {
        return res.status(400).send(error);
    }
});

// Get a user
app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

//POST /users/login
app.post("/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }
    catch (error) {
        res.status(400).send();
    }
});

//DELETE /users/login/token
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    }
    catch (error) {
        res.status(400).send();
    }
});

//Todos routes
//Insert new todo
app.post('/todos', authenticate, async (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    try {
        await todo.save();
        res.send({ todo });
    } catch (error) {
        res.status(400).send(error);
    }
});

//Get all todos
app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({
            _creator: req.user._id
        });
        res.send({ todos });
    }
    catch (error) {
        res.status(400).send(error);
    }
});

//Get individual todo
app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    try{
        var todo = await Todo.findOne({
            _id: id,
            _creator: req.user._id
        });
        if (todo) {
            return res.send({ todo });
        } else {
            return res.status(404).send(id);
        } 
    }
    catch(error){
        return res.status(400).send();
    }
});
//Delete a todo
app.delete('/todos/:id', authenticate, async (req, res) => {
    //get the id
    const id = req.params.id;
    //validate the id, if not valid 404
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    try {
        var todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send();
        }
        return res.send({ todo });
    }
    catch (error) {
        return res.status(400).send();
    }
});

//Update a todo
app.patch('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    try {
        var todo = await Todo.findOneAndUpdate(
            {
                _id: id,
                _creator: req.user._id
            }
            , { $set: body }, { new: true });
        if (!todo) {
            return res.status(404).send();
        }
        return res.send({ todo });
    }
    catch (error) {
        res.status(400).send();
    }
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };