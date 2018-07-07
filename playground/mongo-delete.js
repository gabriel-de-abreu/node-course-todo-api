const {MongoClient,ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(error,db)=>{
    if(error){
        console.log("Unable to connect to MongoDB server");
        return;
    }
    console.log("Connected to MongoDB server");
    //delete many
    // db.collection('Todos').deleteMany({text : "Something to do"})
    // .then((result)=>{
    //     console.log(result);
    // });
    
    //delete one
    // db.collection('Todos').deleteOne({text:'Another thing to do'}).then((result)=>{
    //     console.log(result);
    // });

    db.collection('Todos').findOneAndDelete({completed:false}).then((result)=>{
        console.log(result);
    });
    db.close();
});