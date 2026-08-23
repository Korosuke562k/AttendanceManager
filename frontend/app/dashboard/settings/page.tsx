import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SettingPage() {
  const { userId } = await auth();

  const res = await fetch(
    `http://localhost:3001/accounts/role/${userId}`,
    {
      cache:"no-store"
    }
  );

  const role = await res.json();

  if(role != 'admin'){
    redirect("/dashboard")
  }
  return (
    <div>
      Setting
    </div>
  );
}