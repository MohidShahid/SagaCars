import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddVehicle = () => {
  return (
    <div className="pt-12 flex flex-col gap-8">
      <h1 className="font-bold text-3xl">Add Vehicle</h1>
      <form className="">
        <FieldGroup className="grid md:grid-cols-2 items-center justify-center gap-12">
          <Field>
            <FieldLabel>
              Registration Number <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="reg"
              type="text"
              placeholder="Registration No"
              required
              
            />
          </Field>

          <Field>
            <FieldLabel>
              Vehicle Title <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="title"
              type="text"
              placeholder="Make/Model/Year"
              required
            />
          </Field>
          <Field>
            <FieldLabel>
              Mileage <span className="text-destructive">*</span>
            </FieldLabel>
            <Input id="mileage" type="Number" placeholder="mileage" required />
          </Field>
          <Field>
            <FieldLabel>
              Purchase Price<span>&#163;</span>{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="purchasePrice"
              type="Number"
              placeholder="Purchase Price &#163;"
              required
            />
          </Field>
          <Field>
            <FieldLabel>
              Target Retail<span>&#163;</span>{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="retailprice"
              type="Number"
              placeholder="Target Retail &#163;"
              required
            />
          </Field>
          <Field>
            <FieldLabel>Instructions / Notes</FieldLabel>
            <Input
              id="instructions"
              type="Number"
              placeholder="Instructions / Notes &#163;"
              required
            />
          </Field>
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default AddVehicle;
