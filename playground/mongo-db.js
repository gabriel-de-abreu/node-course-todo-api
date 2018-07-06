const {MongoClient,ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(error,db)=>{
    if(error){
        console.log("Unable to connect to MongoDB server");
        return;
    }
    console.log("Connected to MongoDB server");

    // db.collection('Todos').find().count().then((count)=>{
    //     console.log(`Todos: ${count}`);
    // },(error)=>{
    //     console.log("Unable to fetch todos",error);
    // });
    db.collection('Users').find({name:'Gabriel'}).toArray().then((docs)=>{
        console.log(JSON.stringify(docs,undefined,2));
    },(error)=>{
        console.log("Unable to query",err);
    });

    db.close();
});

