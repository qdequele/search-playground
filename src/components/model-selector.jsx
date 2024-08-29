"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const models = [
  {
    value: "cf-bge-base-en-v1.5",
    label: "cf-bge-base-en-v1.5",
  },
  {
    value: "cf-bge-large-en-v1.5",
    label: "cf-bge-large-en-v1.5",
  },
  {
    value: "cf-bge-small-en-v1.5",
    label: "cf-bge-small-en-v1.5",
  },
  {
    value: "local-bge-base-en-v1.5",
    label: "local-bge-base-en-v1.5",
  },
  {
    value: "mistral",
    label: "mistral",
  },
  {
    value: "openai-large",
    label: "openai-large",
  },
  {
    value: "openai-small",
    label: "openai-small",
  },
  {
    value: "voyage-2",
    label: "voyage-2",
  },
  {
    value: "voyage-large-2",
    label: "voyage-large-2",
  },
  {
    value: "voyage-multilingual-2",
    label: "voyage-multilingual-2",
  },
];

export function ModelSelector({ className, onChange, defaultValue }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("cf-bge-base-en-v1.5")

  React.useEffect(() => {
    if (typeof onChange === "function") {
      onChange(value)
    }
    if (typeof defaultValue === "string") {
      if (!value) {
        setValue(defaultValue)
      }
    }
  }, [value])

  let selectNewValue = (value) => {
      setValue(value)
      if (typeof onChange === "function") {
        onChange(value)
      }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {value
            ? models.find((framework) => framework.value === value)?.label
            : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    selectNewValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === model.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {model.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
