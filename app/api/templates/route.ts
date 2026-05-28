import PreparationTemplate from "@/models/PreparationTemplate";
import { connectDB } from "@/lib/db";



export async function GET() {
    await connectDB();
    const templates = await PreparationTemplate.find();

    return Response.json({ data: templates, success: true });
}


export async function POST(request: Request) {
    await connectDB();

    const body = await request.json();
    // console.log(body);

    await PreparationTemplate.create(body);

    return Response.json({ message: "Checklist Template Created Successfully" })
}