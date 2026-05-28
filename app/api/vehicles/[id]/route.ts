import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const updateData = await request.json();

  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    return Response.json({ message: "Vehicle not found" }, { status: 404 });
  }

  // Update vehicle
  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    id,
    {
      $set: {
        title: updateData.title,
        mileage: Number(updateData.mileage),
        purchasePrice: Number(updateData.purchasePrice),
        targetRetail: Number(updateData.targetRetail),
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : vehicle.dueDate,
        instructions: updateData.instructions,
        status: updateData.status,
        isSold: updateData.status === "sold",
        soldPrice: updateData.status === "sold" ? Number(updateData.soldPrice) : null,
        soldAt: updateData.status === "sold" ? (vehicle.soldAt || new Date()) : null,
        expenses: updateData.expenses || [],
      },
    },
    { new: true }
  );

  return Response.json(updatedVehicle);
}
