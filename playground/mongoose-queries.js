const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo');

// var id = "5b5429514944d3a270b0eb1c";

// if(!ObjectID.isValid(id)){
//     console.log('Not valid');
// }
// Todo.find({
//     _id:id
// }).then((todos)=>{
//     console.log('Todos', todos);
// });

// Todo.findById(id).then((todos)=>{
//     console.log(todos);
// }).catch((e)=>console.log(e));
