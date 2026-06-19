export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 w-full animate-pulse">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Skeleton Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="h-32 bg-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Skeleton Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4 py-2">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 py-2">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 py-2">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
