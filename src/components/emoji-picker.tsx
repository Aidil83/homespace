"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile, X } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    label: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😎", "🤓"],
  },
  {
    label: "People",
    emojis: ["👋", "🤚", "✋", "🖐️", "👌", "🤞", "✌️", "🤟", "🤙", "👍", "👏", "🙌", "🤝", "💪", "🧠", "👀"],
  },
  {
    label: "Nature",
    emojis: ["🌱", "🌿", "🍀", "🌳", "🌸", "🌺", "🌻", "🌈", "⭐", "🌙", "☀️", "🔥", "💧", "🌊", "🦋", "🐝"],
  },
  {
    label: "Food",
    emojis: ["🍎", "🍊", "🍋", "🍇", "🍓", "🫐", "🍕", "🍔", "☕", "🍵", "🧁", "🍰", "🍩", "🌮", "🥗", "🍜"],
  },
  {
    label: "Objects",
    emojis: ["📝", "📚", "📖", "✏️", "🖊️", "📌", "📎", "🔑", "💡", "🔔", "📦", "🎁", "🏷️", "💼", "🗂️", "📋"],
  },
  {
    label: "Symbols",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "⚡", "💫", "✨", "🎯", "✅", "❌", "⚠️", "💬", "🚀", "🎉"],
  },
];

interface EmojiPickerProps {
  currentEmoji?: string | null;
  onSelect: (emoji: string | null) => void;
  children?: React.ReactNode;
}

export function EmojiPicker({ currentEmoji, onSelect, children }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(emoji: string) {
    onSelect(emoji);
    setOpen(false);
  }

  function handleRemove() {
    onSelect(null);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md text-2xl hover:bg-accent transition-colors"
          >
            {currentEmoji || <Smile className="h-5 w-5 text-muted-foreground" />}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        {currentEmoji && (
          <button
            onClick={handleRemove}
            className="mb-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Remove icon
          </button>
        )}
        <div className="max-h-64 overflow-y-auto">
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.label} className="mb-2">
              <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">
                {category.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
