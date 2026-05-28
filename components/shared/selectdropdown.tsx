"use client"
import React from 'react'

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import styles from "../../app/(dashboard)/cars/add/Add.module.css"

// This defines generic props using a type parameter <T>
type SelectDropdownProps<T> = {
  label: string;
  placeholder?: string;
  items: T[];
  getOptionValue: (item: T) => string; // Function to extract the option's value (e.g. item._id)
  getOptionLabel: (item: T) => string; // Function to extract the option's label (e.g. item.name)
  onValueChange: (value: string) => void; // Event handler for selection
  value?: string; // Current selected value
  loading?: boolean;
}

export function SelectDropdown<T>({
  label,
  placeholder = "Select Option",
  items,
  getOptionValue,
  getOptionLabel,
  onValueChange,
  value,
  loading = false,
}: SelectDropdownProps<T>) {
  const [alignItemWithTrigger] = React.useState(true)

  return (
    <FieldGroup className="w-full">
      <Field className={styles.fieldContainer}>
        <FieldLabel className={styles.fieldLabel}>{label}</FieldLabel>
        <Select onValueChange={onValueChange} value={value} disabled={loading}>
          <SelectTrigger className={styles.inputField}>
            <SelectValue placeholder={loading ? "Loading..." : placeholder} />
          </SelectTrigger>
          <SelectContent
            position={alignItemWithTrigger ? "item-aligned" : "popper"} className='bg-white'
          >
            <SelectGroup>
              {items?.map((item, index) => {
                const val = getOptionValue(item);
                const name = getOptionLabel(item);
                return (
                  <SelectItem key={val || index} value={val}>
                    {name}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}
