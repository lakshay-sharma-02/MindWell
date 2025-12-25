import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "avatar" | "image" | "button";
  className?: string;
  count?: number;
}

export function SkeletonLoader({ variant = "card", className, count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-muted rounded-full w-1/4" />
              <div className="h-6 bg-muted rounded-full w-3/4" />
              <div className="h-4 bg-muted rounded-full w-full" />
              <div className="h-4 bg-muted rounded-full w-2/3" />
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded-full w-full" />
            <div className="h-4 bg-muted rounded-full w-5/6" />
            <div className="h-4 bg-muted rounded-full w-4/6" />
          </div>
        );
      case "avatar":
        return (
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
        );
      case "image":
        return (
          <div className="aspect-video bg-muted rounded-xl animate-pulse" />
        );
      case "button":
        return (
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
