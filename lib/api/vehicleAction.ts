import axios from "axios";
import { VehicleFormData } from "@/types/Vehicle";
import { PreparationTemplate } from "@/types/PreparationTemplate";


export async function getVehicles() {
    const data = await axios.get("/api/vehicles");
    return data;
}



export async function createVehicle(data: { vehicle: any; checkList: any }) {
    const res = await axios.post("/api/vehicles", data);
    return res.data;
}

export async function updateChecklistItem(vehicleId: string, itemTitle: string, isCompleted: boolean) {
    const res = await axios.put("/api/vehicles", { vehicleId, itemTitle, isCompleted });
    return res.data;
}

export async function getDashboardOverview() {
    const res = await axios.get("/api/dashboard/overview");
    return res.data;
}

export async function updateVehicle(id: string, data: any) {
    const res = await axios.put(`/api/vehicles/${id}`, data);
    return res.data;
}

