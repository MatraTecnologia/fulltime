"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CHAR_TO_FLUENT, fluentEmojiUrl } from "@/lib/emojis"

export const FluentEmoji = ({
  char,
  size = 24,
  className,
}: {
  char: string
  size?: number
  className?: string
}) => {
  const [failed, setFailed] = React.useState(false)
  const fluent = CHAR_TO_FLUENT[char]

  if (!char || !fluent || failed) {
    return (
      <span className={cn("inline-block leading-none", className)} style={{ fontSize: size }}>
        {char}
      </span>
    )
  }

  return (
    <img
      src={fluentEmojiUrl(fluent)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={cn("inline-block object-contain", className)}
      onError={() => setFailed(true)}
    />
  )
}
