"use client";

import { useEffect, useState } from "react";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { trpc } from "@/lib/trpc/react-query";

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
}

export function SearchAutocomplete({ onSearch }: SearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: suggestions = [], refetch } = trpc.autocomplete.useQuery(
    { query: inputValue },
    { enabled: false }
  );

  // Debounce effect to prevent API calls on every keystroke
  useEffect(() => {
    if (inputValue.length < 3) {
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      refetch();
      setIsOpen(true);
    }, 300); // Wait for 300ms of no typing before fetching

    return () => clearTimeout(timer); // Cleanup timer on unmount or next keystroke
  }, [inputValue, refetch]);

  function handleSelect(suggestion: string) {
    setInputValue(suggestion);
    setIsOpen(false);
    onSearch(suggestion);
  }

  return (
    <Command className="rounded-lg border shadow-md w-full max-w-lg">
      <CommandInput
        placeholder="Search for 'social media stocks'..."
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsOpen(false);
            onSearch(inputValue);
          }
        }}
      />
      {isOpen && (
        <CommandList>
          {suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion}
              onSelect={() => handleSelect(suggestion ?? "")}
            >
              {suggestion}
            </CommandItem>
          ))}
        </CommandList>
      )}
    </Command>
  );
}
