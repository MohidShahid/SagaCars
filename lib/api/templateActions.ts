import { PreparationTemplate, ApiResponse } from "@/types/PreparationTemplate";
import axios from "axios";

export async function createTemplate(data: PreparationTemplate): Promise<ApiResponse<PreparationTemplate>> {
    const res = await axios.post("/api/templates", data);
    return res.data;
};



export async function getAllTemplates(): Promise<ApiResponse<PreparationTemplate[]>> {
    const res = await axios.get("/api/templates");
    return res.data;
}