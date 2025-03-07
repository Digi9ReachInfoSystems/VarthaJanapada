const mongoose = require("mongoose");


const wishListSchema= new mongoose.Schema({
    collection_Name:{
        type:String,
        required:[true,"A Collection name should be there."]
    },
    description:{
        type:String,
        required:[true,"A description is needed for Collection."]
    },
    createdTime:{
        type:date
    }
})