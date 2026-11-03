"use client";

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-6"></div>
      <h1 className="text-green-600 text-4xl font-bold mb-4">Loading...</h1>
      <p className="text-gray-700 mb-8">Please wait while we fetch the data.</p>
    </div>
  );
}

export default Loading;
