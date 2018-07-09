var env = process.env.NODE_ENV || 'development';

if(env === 'development'){
    process.env.PORT=3000;
    process.env.MONGODB_URI='mongodb://localhost:27017/TodoApp';
} else if(env === 'test'){
    process.env.PORT=3000;
    process.env.MONGODB_URI='mongodb://localhost:27017/TodoAppTest';
}

const express = require('express');
const bodyParser =require('body-parser');
const {ObjectId} = require('mongodb');
const _= require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User}= require('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//Insert new todo
app.post('/todos',(req,res)=>{
    var todo=new Todo({
        text: req.body.text
    });
    todo.save().then((doc)=>{
        res.send(doc);
    },(e)=>{
        res.status(400).send(e);
    });
});

//Get all todos
app.get('/todos',(req,res)=>{
    Todo.find().then((todos)=>{
        res.send({
            todos
        })
    },(e)=>{
        res.status(400).send(e);
    });
});

//Get individual todo
app.get('/todos/:id',(req,res)=>{
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id).then((todo)=>{
        if(todo!=null){
            return res.send({todo});
        }else{
            return res.status(404).send(id);
        }
    },(error)=>{
        return res.status(400).send();
    });
});
//Delete a todo
app.delete('/todos/:id',(req,res)=>{
    //get the id
    var id= req.params.id;
    //validate the id, if not valid 404
    if(!ObjectId.isValid(id)){
        return  res.status(404).send();
    }
    //remove todo by id
    Todo.findByIdAndRemove(id).then((todo)=>{
        if(!todo){
            //if no doc send 404, if doc send doc back with 200
            return res.status(404).send();
        }
        return res.send({todo});
    },(error)=>{
        //if error 400
        return res.status(400).send();
    });
});
//Update a todo
app.patch('/todos/:id',(req,res)=>{
    var id = req.params.id;
    var body = _.pick(req.body,['text', 'completed']);
    if(!ObjectId.isValid(id)){
        return  res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed=false;
        body.completedAt=null;
    }
    Todo.findByIdAndUpdate(id,{$set:body},{new : true}).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
        
    }).catch((e)=>{
        res.status(400).send();
    });
});

app.listen(port,()=>{
    console.log(`Started on port ${port}`);
});

module.exports={app};