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

  const handleValueChange = React.useCallback((newValue) => {
    setValue(newValue)
    if (typeof onChange === "function") {
      onChange(newValue)
    }
  }, [onChange])

  React.useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue placeholder="Select mode...">
          {modes.find((mode) => mode.value === value)?.label || "Select mode..."}
        </SelectValue>
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