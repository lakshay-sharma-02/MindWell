import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-border/40 flex items-center px-4 md:px-8 justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-32 hidden md:block" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="flex-1 container-wide py-8 md:py-12 space-y-8">
                {/* Banner / Hero */}
                <div className="space-y-4">
                    <Skeleton className="h-10 w-2/3 md:w-1/3" />
                    <Skeleton className="h-6 w-full md:w-1/2" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-2xl border border-border/40 space-y-4">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
