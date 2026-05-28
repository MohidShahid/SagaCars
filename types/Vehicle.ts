export interface VehicleFormData{
    registration_no : string,
    title : string,
    mileage : number | string,
    purchasePrice : number | string,
    targetRetail : number | string,
    dueDate : Date | undefined,
    instructions : string,
    templateId : string,
    checklistItems : Array<object>,
}