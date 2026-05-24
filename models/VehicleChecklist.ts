import mongoose from "mongoose";

const {Schema} = mongoose;

const checklistItemSchema = new Schema({
  title: { type: String, required: true },
  order: { type: Number },
//   status: { 
//     type: String, 
//     enum: ['pending', 'in-progress', 'done'], 
//     default: 'pending' 
//   },
//   completedBy: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User'                             // ← reference to User
//   },
  isCompleted : {type : Boolean, default : false},
  completedAt: { type: Date },
  notes: { type: String }
})

const schema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle',                         // ← reference to Vehicle
    required: true 
  },
  templateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PreparationTemplate'              // ← reference to Template
  },
  items: [checklistItemSchema],
}, { timestamps: true })

const VehicleChecklist = mongoose.model("VehicleChecklist", schema);

export default VehicleChecklist;