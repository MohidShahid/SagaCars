import mongoose from "mongoose";

const {Schema} = mongoose;

const schema = new Schema({
    registration_no : {
        type : String,
        unique : true
    },
    title : {type : String, required : true},
    mileage : {type: Number, required : true},
    purchasePrice : {type : Number, required : true},
    targetSalePrice : {type : Number, required : true},
    dueDate : {type : Date, required: true},
    Instructions : String,
    isSold: {type : Boolean, Default : false},
    soldPrice : {type : Number},
    status : String,
    // "in-prep" | "ready" | "sold" | "on-hold" 


}, {timestamps : true});


const Vehicle = mongoose.model('Vehicle', schema);

export default Vehicle;


