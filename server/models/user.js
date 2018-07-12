const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        minlength:1,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message: 'is not a valid e-mail!'
        }
    },
    password:{
        type:String,
        require:true,
        minlength:6
    },
    tokens:[{
        access:{
            type:String,
            required: true
        },
        token:{
            type:String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject= user.toObject();

    return _.pick(userObject,['email','_id']);
};

UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token= jwt.sign({
        _id: user._id.toHexString(),access
    },'123');
    user.tokens = user.tokens.concat([{access,token}]);

    return user.save().then(()=>{
        return token;
    })
};

UserSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;

    try{
    decoded = jwt.verify(token,'123');
    } catch (error){
        return Promise.reject();
    }

    return User.findOne({
        _id:decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.pre('save',function (next){
    if(this.isModified('password')){
         bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(this.password,salt,(err,hash)=>{
                this.password=hash;
                next();
            })
         });
    }else{
        next();
    }
});

UserSchema.statics.findByCredentials = function(email,password){
    var User = this;
    
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve,reject)=>{
            //use bcrypt to compare
            bcrypt.compare(password,user.password,(err,res)=>{
                if(!res){
                    return reject();
                }
                return resolve(user);
            });
        });
    });
};

var User= mongoose.model('User',UserSchema);

module.exports={User};