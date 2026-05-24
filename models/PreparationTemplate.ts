import mongoose from "mongoose";

const {Schema} = mongoose;


// Sub-schema for each item inside the template
const templateItemSchema = new mongoose.Schema({
  title: { type: String, required: true },  // "Full Valet"
  order: { type: Number, required: true },  // 1, 2, 3...
})

const schema = new Schema({
    name : {type : String, required : true},
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',                            // ← reference to User
    required: true 
  },
  items: [templateItemSchema],  
    
}, {timestamps : true})

const PreparationTemplate = mongoose.model("PreparationTemplate", schema);

export default PreparationTemplate;