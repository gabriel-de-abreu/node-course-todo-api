const {MongoClient,ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(error,db)=>{
    if(error){
        console.log("Unable to connect to MongoDB server");
        return;
    }
    console.log("Connected to MongoDB server");
    db.collection('Todos').insertOne({
        text:"Another thing to do", completed:false
    }).then(()=>{
        console.log("Inserted!");
    },(error)=>{
        console.log("Failed",error);
    });
    db.close();
});