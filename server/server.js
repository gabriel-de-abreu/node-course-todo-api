var express = require('express');
var bodyParser =require('body-parser');
var {ObjectId} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User}= require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

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
app.listen(port,()=>{
    console.log(`Started on port ${port}`);
});

module.exports={app};