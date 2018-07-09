const expect = require('expect');
const request = require('supertest');
const {ObjectID}=require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos=[{
    _id: new ObjectID(),
    text: 'Dummy todo 1'
},{
    _id: new ObjectID(),
    text: 'Dummy todo 2'
},{
    _id: new ObjectID(),
    text: 'Dummy todo 3'
}];

beforeEach((done)=>{
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos);
    }).then(()=>done());
});

describe('POST /todos',()=>{
    it('should create a new todo',(done)=>{
        var text = 'Test todo text';
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(text);
        })
        .end((error,res)=>{
            if(error){
                return done(err);
            }
            Todo.find({text}).then((todos)=>{
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create todo with invalid body data',(done)=>{
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
            });
        Todo.find().then((todos) =>{
            expect(todos.length).toBe(3);
            done();
        }).catch((e)=>done(e));
    });
});

describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(3);
        })
        .end(done);
    });
});

describe('GET /todos/id',()=>{
    it('should return a doc',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found',(done)=>{
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid obj id',(done)=>{
        var id=2312321;
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

});

describe('DELETE todos/id',()=>{
    it('should remove a todo',(done)=>{
        var hexId=todos[1]._id.toHexString();
        
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(todos[1]._id,(todo)=>{
                expect(todo).toNotExist();
                done();
            }).catch((error)=>done(error));
        });
    });
    it('should return 404 if todo not found',(done)=>{
        request(app)
        .delete(`/todos/${new ObjectID()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid',(done)=>{
        request(app)
        .delete("/todos/321312231")
        .expect(404)
        .end(done);
    });
});