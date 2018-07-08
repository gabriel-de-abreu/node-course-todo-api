var mongoose= require('mongoose');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo',{
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim:true
    },
    completed:{
        type: Boolean,
        default: false
    },
    completedAt:{
        type: Number,
        default: null
    }
});

var User= mongoose.model('User',{
    email:{
        type: String,
        required: true,
        minlength:1,
        trim:true
    }
});

var user = new User({
    email:"batata@batata.com"
});
user.save();

// var todo= new Todo({
//     text: ' Drink water   ',
//     completed:true,
//     completedAt: 123
// });
// todo.save().then((doc)=>{
//     console.log('Saved todo',doc);
// },(e)=>{
//     console.log('Unable to save',e);
// });

// //save new 
// todo.save();