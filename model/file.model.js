import mongoose  from "mongoose";

const fileSchema = new mongoose.Schema({

    title : {
        type : String,
        required :true,

    },
    descriptcion :{
        type :String,
        
    },
    subject :{
        type : String,
        required : true
    },
    fileUrl : {
        type : String,

    },
    cretedBy :{

        type : String
    }
})

const  File = new  mongoose.model("File", fileSchema);

export default File;    
 