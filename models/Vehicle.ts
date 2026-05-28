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
    targetRetail : {type : Number, required : true},
    dueDate : {type : Date, required: true},
    instructions : String,
    isSold: {type : Boolean, Default : false},
    soldPrice : {type : Number},
    soldAt : {type : Date},
    status : String,
    // "in-prep" | "ready" | "sold" | "on-hold" 
    expenses: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
}, {timestamps : true});


const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', schema);

export default Vehicle;


