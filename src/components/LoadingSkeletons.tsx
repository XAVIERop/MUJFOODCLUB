import { Skeleton } from "@/components/ui/skeleton";

export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-20" />
      <div className="flex space-x-2">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
  </div>
);

export const MenuItemSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  </div>
);

export const CafeCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-24 rounded" />
    </div>
  </div>
);

export const AnalyticsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <AnalyticsCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
