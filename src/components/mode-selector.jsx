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

const modes = [
  {
    value: "fulltextsearch",
    label: "Full-text search",
  },
  {
    value: "semanticsearch",
    label: "Semantic search",
  },
  {
    value: "hybridsearch",
    label: "Hybrid search",
  }
]

export function ModeSelector({ className, onChange, defaultValue }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("fulltextsearch")

  React.useEffect(() => {
    if (typeof onChange === "function") {
      onChange(value)
    }
    if (typeof defaultValue === "string") {
      setValue(defaultValue)
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
            ? modes.find((framework) => framework.value === value)?.label
            : "Select mode..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search mode..." />
          <CommandList>
            <CommandEmpty>No mode found.</CommandEmpty>
            <CommandGroup>
              {modes.map((mode) => (
                <CommandItem
                  key={mode.value}
                  value={mode.value}
                  onSelect={(currentValue) => {
                    selectNewValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === mode.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {mode.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
