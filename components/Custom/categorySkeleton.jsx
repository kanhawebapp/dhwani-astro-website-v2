export default function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 py-5 w-full">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="rounded-4xl overflow-hidden bg-white shadow-xl">
          {/* Image Skeleton */}
          <div className="relative overflow-hidden bg-gray-200 h-35 sm:h-50">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
          </div>

          <div className="p-3 space-y-3">
            {/* Title */}
            <div className="relative overflow-hidden bg-gray-200 rounded h-5 w-3/4">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
            </div>

            {/* Description */}
            <div className="relative overflow-hidden bg-gray-200 rounded h-3 w-full">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
            </div>

            <div className="relative overflow-hidden bg-gray-200 rounded h-3 w-5/6">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
            </div>

            {/* Price */}
            <div className="flex justify-center">
              <div className="relative overflow-hidden bg-gray-200 rounded-full h-8 w-24">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-center">
              <div className="relative overflow-hidden bg-gray-200 rounded-full h-10 w-[80%]">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}