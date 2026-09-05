import { auth } from "@clerk/nextjs/server";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Footer from "../components/Footer";
import { LoginUserProvider } from "../components/LoginUserProvider";
import { redirect } from "next/navigation";

interface LoginUser {
  id: number,
  clerk_user_id: string,
  name: string,
  email: string,
  role: string,
  create_at: string,
  deleteflag: number,
  group_id: number,
  group_name: string,
  group_branch: string
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  const { userId } = await auth();
  let loginUser:LoginUser | null = null;

  if (userId) {
    const res = await fetch(
      `http://localhost:3001/accounts/role/${userId}`,
      {
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const result = await res.json();
      loginUser = result;
      // console.log("loginUser",loginUser);
    }

    if(loginUser?.deleteflag === 1){
      redirect("/account-disabled")
    }
  }

  return (
    <LoginUserProvider LoginUser={loginUser}>
        <main>
          <div>
            <Header />
            <div className='sm:flex'>
              <Aside />
              <main className="max-sm:h-[calc(100vh-80px-30px-40px)] mx-auto px-5">{children}</main>
            </div>
            <Footer />
          </div>
        </main>
    </LoginUserProvider>
    )
}