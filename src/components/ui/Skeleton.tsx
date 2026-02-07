'use client'

export default function SkeletonCard() {
  return (
    <div className="relative overflow-hidden w-full bg-[#0F0F0F] rounded-[2rem] border border-white/5 p-4 mb-4 shadow-2xl">
      {/* 1. Banner Skeleton with Shimmer */}
      <div className="relative w-full h-32 bg-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      {/* 2. Content Section */}
      <div className="mt-4 space-y-3">
        {/* Title Line */}
        <div className="relative h-5 w-3/4 bg-zinc-800/50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        {/* Info Grid (Entry Fee & Prize) */}
        <div className="flex justify-between items-center mt-2">
          <div className="relative h-4 w-20 bg-zinc-800/50 rounded-md overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>
          <div className="relative h-4 w-24 bg-zinc-800/50 rounded-md overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Area */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="relative h-10 w-full bg-zinc-800/50 rounded-xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>
    </div>
  )
}
