import {connectDB} from "@/lib/db";
import VehicleChecklist from "@/models/VehicleChecklist";
import Vehicle from "@/models/Vehicle"

interface IChecklistItem {
  title: string;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

interface VehicleDoc {
  _id: unknown;
  [key: string]: unknown;
}

export async function GET (){
    await connectDB();
    const vehicles = await Vehicle.find().lean();

    const vehiclesWithChecklists = await Promise.all(
        vehicles.map(async (vehicle: unknown) => {
            const v = vehicle as VehicleDoc;
            const checklist = await VehicleChecklist.findOne({ vehicleId: v._id }).lean();
            return {
                ...v,
                checklist: checklist || null
            };
        })
    );

    return Response.json(vehiclesWithChecklists);
}

export async function POST (request : Request){
  await connectDB();
  const {vehicle, checkList} = await request.json()
  const data = await Vehicle.create(vehicle);
  await VehicleChecklist.create({...checkList, vehicleId : data._id})
   return Response.json("Vehicle Created Successfully")
}

export async function PUT(request: Request) {
  await connectDB();
  const { vehicleId, itemTitle, isCompleted } = await request.json();

  await VehicleChecklist.updateOne(
    { vehicleId, "items.title": itemTitle },
    {
      $set: {
        "items.$.isCompleted": isCompleted,
        "items.$.completedAt": isCompleted ? new Date() : null
      }
    }
  );

  // Auto-update vehicle status to "ready" if all checklist items are completed
  const checklist = await VehicleChecklist.findOne({ vehicleId });
  if (checklist) {
    const allCompleted = checklist.items.length > 0 && checklist.items.every((item: IChecklistItem) => item.isCompleted);
    await Vehicle.findByIdAndUpdate(vehicleId, {
      status: allCompleted ? "ready" : "in-prep"
    });
  }

  return Response.json({ message: "Checklist updated successfully" });
}