import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shimmer rounded-md bg-card/60 border border-border/40",
        className,
      )}
      {...props}
    />
  );
}
