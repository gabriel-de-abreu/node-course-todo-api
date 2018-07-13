const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
    _id: userOneID,
    email: 'batata@example.com',
    password: 'first one pass',
    tokens: [{
    access: 'auth',
    token: jwt.sign({
        _id:userOneID,
        access: 'auth'
    },'123').toString() 
    }]
},{
    _id:userTwoID,
    email: 'batata2@example.com',
    password: 'second one pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({
            _id:userTwoID,
            access: 'auth'
        },'123').toString() 
    }]
}];

const todos=[{
    _id: new ObjectID(),
    text: 'Dummy todo 1',
    _creator:userOneID
},{
    _id: new ObjectID(),
    text: 'Dummy todo 2',
    completed: true,
    completedAt: 333,
    _creator:userOneID
},{
    _id: new ObjectID(),
    text: 'Dummy todo 3',
    _creator:userTwoID
}];

const populateTodos = (done)=>{
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos);
    }).then(()=>done());
};
const populateUsers = (done)=>{
    User.remove({}).then(()=>{
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();
        return Promise.all([user1,user2]).then(()=> done()).catch((e)=>{
            done();
        })
    });
};

module.exports={
    users,
    todos,
    populateTodos,
    populateUsers
}