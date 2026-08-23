import { auth } from "@clerk/nextjs/server";
import Header from "../components/Header";
import Aside from "../components/Aside";
import Footer from "../components/Footer";



export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  const { userId } = await auth();
  let role = '';

  if (userId) {
    const res = await fetch(
      `http://localhost:3001/accounts/role/${userId}`,
      {
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const result = await res.json();
      role = result;
      console.log(role);
      
    }
  }


  return (
    <main>
      <div>
        <Header />
        <div className='flex'>
          <Aside role={role}/>
          <main className="mx-auto">{children}</main>
        </div>
        <Footer />
      </div>
    </main>
    )
}