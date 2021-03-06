const expect = require('expect');
const request = require('supertest');
const {ObjectID}=require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos',()=>{
    it('should create a new todo',(done)=>{
        var text = 'Test todo text';
        request(app)
        .post('/todos')
        .set('x-auth',users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
        })
        .end((error,res)=>{
            if(error){
                return done(error);
            }
            Todo.find({text}).then((todos)=>{
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            });
        });
    });

    it('should not create todo with invalid body data',(done)=>{
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
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
        });
    });
});

describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
        .get('/todos')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/id',()=>{
    it('should return a doc',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
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
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid obj id',(done)=>{
        var id=2312321;
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    
    it('should not return doc created by other user',(done)=>{
        request(app)
            .get(`/todos/${todos[2]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE todos/id',()=>{
    it('should remove a todo',(done)=>{
        var hexId=todos[1]._id.toHexString();
        
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[0].tokens[0].token)
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
            });
        });
    });
    it('should not remove a todo of another user',(done)=>{
        var hexId=todos[1]._id.toHexString();
        
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then((todo)=>{
                expect(todo).toExist();
                done();
            }).catch((error)=>done(error));
        });
    });
    it('should return 404 if todo not found',(done)=>{
        request(app)
        .delete(`/todos/${new ObjectID()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid',(done)=>{
        request(app)
        .delete("/todos/321312231")
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/id',()=>{
    it('should update the todo',(done)=>{
        var text = "changing this task";
        var completed= true;
        var id=todos[0]._id.toHexString();
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth',users[0].tokens[0].token)
        .send({text,completed})
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completedAt).toBeA('number');
        }).end(done);
    });
    
    it('should clear completedAt when todo is not completed',(done)=>{
        var id= todos[1]._id.toHexString();
        var text = "changing this task";
        var completed = false;
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth',users[0].tokens[0].token)
        .send({text,completed})
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completedAt).toNotExist();
            expect(res.body.todo.completed).toBe(false);
        })
        .end(done);
    });

    it('should not update the todo from another user',(done)=>{
        var text = "changing this task";
        var completed= true;
        var id=todos[0]._id.toHexString();
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth',users[1].tokens[0].token)
        .send({text,completed})
        .expect(404)
        .end(done);
    });
    
    it('should not clear completedAt when todo is not completed from another user',(done)=>{
        var id= todos[1]._id.toHexString();
        var text = "changing this task";
        var completed = false;
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth',users[1].tokens[0].token)
        .send({text,completed})
        .expect(404)
        .end(done);
    });
});

describe('GET /users/me',()=>{
    it('should return user if authenticated', (done)=>{
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return a 401 if not authenticated',(done)=>{
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res)=>{
            expect(res.body).toEqual({});
        })
        .end(done)  ;
    });
});

describe('POST /user',()=>{
    it('should create a user',(done)=>{
        var email = 'example@example.com';
        var password = '123abc';

        request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        }).end((err)=>{
            if(err){
                return done(err);
            }
            User.findOne({email}).then((user)=>{
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
                });
            });
        });    
    it('should return validations errors if request invalid',(done)=>{
        request(app)
        .post('/users')
        .send({
            email: "dsadasdadasl.com",
            password: "123abc"
        })
        .expect(400)
        .end(()=>{
            request(app)
            .post('/users')
            .send({
                email: "batata@mail.com",
                password: "123"
            })
            .expect(400)
            .end(done);
        });
    });
    it('should not create user if email in use',(done)=>{
        request(app)
        .post('/users')
        .send({
            email: users[1].email,
            password: "123abc"
        })
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login',()=>{
    it('should login and return auth token',(done)=>{
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();
        }).end((error,res)=>{
            if(error){
                return done(error);
            }
            User.findById(users[1]._id).then((user)=>{
                expect(user.tokens[1]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();                
            }).catch((e)=>done(e));
        });
    });

    it('should reject a login',(done)=>{
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password : "adahsaedaads"
        })
        .expect(400)
        .expect((res)=>{
            expect(res.headers['x-auth']).toNotExist();
            done();
        })
        .catch((error)=>(done(error)));    
    });
});

describe('DELETE /users/me/token',()=>{
    it('should remove auth token on logout',(done)=>{
        request(app)
        .delete('/users/me/token')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .end((error)=>{
            if(error){
                return done(error);
            }
            User.findById(new ObjectID(users[0]._id)).then((user)=>{
                expect(user.tokens[0]).toNotExist();
                done();
            }).catch((error)=>done(error));
        });
    });
});
