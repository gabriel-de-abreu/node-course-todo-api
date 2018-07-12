const bcrypt = require('bcryptjs');

var password = '123abc';
bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,(err,hash)=>{
        console.log(hash);
    });
});
var anotherPass='123';
var hashedPassword = "$2a$10$NNm.gYRamWJqD6ZwWUr5suwZuHJXNaubP03xZqhyP8H5kwafz1T0C";
bcrypt.compare(anotherPass,hashedPassword,(err,res)=>{
    console.log(res);
});
// const {SHA256} = require('crypto-js');
// const jwt = require('jsonwebtoken');
// var message = 'I am number 3';
// var hash = SHA256(message).toString();

// console.log(`Messsage: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//     id: 4
// }

// var token = jwt.sign(data,'123');
// console.log(token);

// var decoded = jwt.verify(token,'123');
// console.log(decoded);
// var token = {
//     data,
//     hash:SHA256(JSON.stringify(data)+ 'somesecret').toString()
// }

// // token.data.id=5;
// // token.hash=SHA256(JSON.stringify(token.data)).toString();
// var resultHash=SHA256(JSON.stringify(token.data)+ 'somesecret').toString();

// if(resultHash==token.hash){
//     console.log('Data was not changed');
// }else{
//     console.log('Data was changed!');
// }