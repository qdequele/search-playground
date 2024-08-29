import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

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

export function ModeSelector({ className, onChange, defaultValue = "fulltextsearch" }) {
  const [value, setValue] = React.useState(defaultValue)

  React.useEffect(() => {
    if (typeof onChange === "function") {
      onChange(value)
    }
  }, [value, onChange])

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        setValue(newValue)
        if (typeof onChange === "function") {
          onChange(newValue)
        }
      }}
    >
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue placeholder="Select mode..." />
      </SelectTrigger>
      <SelectContent>
        {modes.map((mode) => (
          <SelectItem key={mode.value} value={mode.value}>
            {mode.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}