import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const engines = [
  { value: "algolia", label: "Algolia" },
  {
    value: "meilisearch",
    label: "Meilisearch",
    modes: [
      { value: "fulltextsearch", label: "Full-text search" },
      { value: "semanticsearch", label: "Semantic search" },
      { value: "hybridsearch", label: "Hybrid search" },
    ],
    models: [
      "cf-bge-base-en-v1.5",
      "cf-bge-large-en-v1.5",
      "cf-bge-small-en-v1.5",
      "cohere-embed-english-v3.0",
      "cohere-embed-multilingual-v3.0",
      "cohere-embed-english-light-v3.0",
      "cohere-embed-multilingual-light-v3.0",
      "jina-colbert-v2",
      "local-all-MiniLM-L6-v2",
      "local-bge-base-en-v1.5",
      "local-bge-small-en-v1.5",
      "local-gte-small",
      "mistral",
      "openai-large",
      "openai-small",
      "voyage-2",
      "voyage-large-2",
      "voyage-multilingual-2",
    ],
  },
  // {
  //   value: "supabase",
  //   label: "Supabase",
  //   modes: [
  //     { value: "fulltextsearch", label: "Full-text search" },
  //     { value: "semanticsearch", label: "Semantic search" },
  //     { value: "hybridsearch", label: "Hybrid search" },
  //   ],
  //   models: [
  //     "gte-base",
  //     "gte-large",
  //     "gte-small",
  //   ],
  // }
];

const Selector = ({ options, value, onChange, placeholder, className }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const ComboBox = ({ options, value, onChange, placeholder, className }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {options.find((option) => option.value === value)?.label || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function ConfigSelector({ className, onConfigChange, initialConfig }) {
  const [engine, setEngine] = React.useState(initialConfig?.engine || "meilisearch");
  const [mode, setMode] = React.useState(initialConfig?.mode || "fulltextsearch");
  const [model, setModel] = React.useState(initialConfig?.model || "");

  React.useEffect(() => {
    const newConfig = { engine, mode, model };
    if (JSON.stringify(newConfig) !== JSON.stringify(initialConfig)) {
      onConfigChange(newConfig);
    }
  }, [engine, mode, model, onConfigChange, initialConfig]);

  const handleEngineChange = (newEngine) => {
    setEngine(newEngine);
    if (newEngine === "algolia") {
      setMode("");
      setModel("");
    } else {
      setMode("fulltextsearch");
      setModel("");
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "fulltextsearch") {
      setModel("");
    }
  };

  const currentEngine = engines.find((e) => e.value === engine);
  const showModeSelector = engine === "meilisearch";
  const showModelSelector = showModeSelector && (mode === "semanticsearch" || mode === "hybridsearch");

  return (
    <div className={cn("flex flex-col space-y-2 xs:flex-row xs:items-center xs:space-x-4 xs:space-y-0", className)}>
      <Selector
        options={engines}
        value={engine}
        onChange={handleEngineChange}
        placeholder="Select engine..."
        className="w-full xs:w-[150px]"
      />

      {showModeSelector && (
        <Selector
          options={currentEngine.modes}
          value={mode}
          onChange={handleModeChange}
          placeholder="Select mode..."
          className="w-full xs:w-[150px]"
        />
      )}

      {showModelSelector && (
        <ComboBox
          options={currentEngine.models.map(m => ({ value: m, label: m }))}
          value={model}
          onChange={setModel}
          placeholder="Select model..."
          className="w-full xs:w-[150px]"
        />
      )}
    </div>
  );
}
