const {MongoClient,ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(error,db)=>{
    if(error){
        console.log("Unable to connect to MongoDB server");
        return;
    }
    console.log("Connected to MongoDB server");
    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5b3ff3c52b0b223be65b4380')
    // },{
    //     $set:{
    //         completed:true
    //     }
    // },{
    //     returnOriginal:false
    // }).then((result)=>{
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
       name: 'Jen'
    },{
        $set:{
            name: 'Gabriel de Abreu'
        },
        $inc:{
            age: 1
        }
    },{
        returnOriginal:false
    }).then((result)=>{
        console.log(result);
    });
    db.close();
});