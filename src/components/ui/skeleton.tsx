import { cn } from "@/lib/utils"
import React from "react";

function Skeleton({
  className,
  children, // Add children prop
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    >
      {/* Render children if provided, otherwise just the div */}
      {children}
    </div>
  )
}

export { Skeleton }
