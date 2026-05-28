"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import styles from "../../app/(dashboard)/cars/add/Add.module.css"


type ModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  date: Date | undefined,
  setDate: (date: Date | undefined) => void;
};

export function DatePicker({ open, setOpen, date, setDate }: ModalProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (

    <Field className={styles.fieldContainer}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-optional"
            className="w-32  h-justify-between font-normal h-12"
          >
            {date ? format(date, "PPP") : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            defaultMonth={date}
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
            }}
            disabled={{ before: today }}
            className="bg-[#fff]!"
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
