"use client"

import * as React from "react"
import { Smile, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { FluentEmoji } from "@/components/dashboard/catalog/fluent-emoji"
import { EMOJI_GROUPS } from "@/lib/emojis"

export const EmojiPicker = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="size-11 p-0">
              {value ? <FluentEmoji char={value} size={28} /> : <Smile className="size-5 text-muted-foreground" />}
            </Button>
          }
        />
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Pesquisar emoji..." />
            <CommandList className="max-h-64">
              <CommandEmpty>Nenhum emoji encontrado.</CommandEmpty>
              {EMOJI_GROUPS.map((group) => (
                <CommandGroup key={group.name} heading={group.name}>
                  <div className="grid grid-cols-8 gap-0.5">
                    {group.emojis.map((emoji) => (
                      <CommandItem
                        key={emoji.char}
                        value={`${group.name} ${emoji.keywords} ${emoji.char}`}
                        onSelect={() => {
                          onChange(emoji.char)
                          setOpen(false)
                        }}
                        className="aspect-square cursor-pointer justify-center p-1"
                      >
                        <FluentEmoji char={emoji.char} size={26} />
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Remover ícone"
          onClick={() => onChange("")}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
