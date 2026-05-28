"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import styles from "../../app/(dashboard)/cars/add/Add.module.css";

// This is a generic interface. It will accept any data type T.
type CheckboxDropdownProps<T> = {
  label: string;
  placeholder?: string;
  items: T[];
  selectedKeys: string[];
  getOptionValue: (item: T) => string;
  getOptionLabel: (item: T) => string;
  onCheckedChange: (key: string, checked: boolean) => void;
};

export function CheckboxDropdown<T>({
  label,
  placeholder = "Select Items",
  items,
  selectedKeys,
  getOptionValue,
  getOptionLabel,
  onCheckedChange,
}: CheckboxDropdownProps<T>) {
  return (
    <FieldGroup className="w-full">
      <Field className={styles.fieldContainer}>
        <FieldLabel className={styles.fieldLabel}>{label}</FieldLabel>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`${styles.inputField} flex justify-between items-center bg-white hover:bg-zinc-50 w-full`}
            >
              <span className="truncate">
                {selectedKeys.length === 0
                  ? placeholder
                  : `${selectedKeys.length} items selected`}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] bg-white border border-zinc-200 shadow-md rounded-md p-1 z-[9999]">
            <DropdownMenuLabel className="text-zinc-500 font-semibold px-2 py-1.5 text-xs">
              Checklist Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 my-1" />
            <div className="max-h-60 overflow-y-auto">
              {items.map((item, idx) => {
                const key = getOptionValue(item);
                const labelText = getOptionLabel(item);
                const isChecked = selectedKeys.includes(key);

                return (
                  <DropdownMenuCheckboxItem
                    key={key || idx}
                    checked={isChecked}
                    onCheckedChange={(checked) => onCheckedChange(key, checked)}
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center justify-between px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded cursor-pointer"
                  >
                    {labelText}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>
    </FieldGroup>
  );
}
