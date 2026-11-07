"use client";

interface UserProfileProps {
  userName: string;
  userEmail: string;
}

export default function UserProfile({ userName, userEmail }: UserProfileProps) {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal account information.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-200">
            <span className="text-3xl font-semibold text-gray-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-lg font-semibold">{userName}</h2>

          <p className="text-sm text-gray-600">
            Email: <span className="font-medium">{userEmail}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
