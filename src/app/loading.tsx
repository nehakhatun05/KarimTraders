export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-3xl">K</span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        <p className="text-gray-600 font-medium">Loading fresh goodness...</p>
      </div>
    </div>
  );
}
