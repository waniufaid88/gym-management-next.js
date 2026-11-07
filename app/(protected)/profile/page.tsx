import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import UserProfile from "./userProfile";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <UserProfile userName={currentUser.name} userEmail={currentUser.email} />
  );
}
