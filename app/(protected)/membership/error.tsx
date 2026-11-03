"use client";

function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-red-600 text-4xl font-bold mb-4">
        Something went wrong!
      </h1>
      <p className="text-gray-700 mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Try Again
      </button>
    </div>
  );
}

export default Error;
