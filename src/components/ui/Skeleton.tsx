export default function SkeletonCard() {
  return (
    <div className="w-full h-48 bg-gray-900/50 rounded-2xl p-4 mb-4 animate-pulse border border-gray-800">
      <div className="w-full h-24 bg-gray-800 rounded-xl mb-4"></div>
      <div className="h-4 w-2/3 bg-gray-800 rounded mb-2"></div>
      <div className="h-3 w-1/3 bg-gray-800 rounded"></div>
    </div>
  );
}

