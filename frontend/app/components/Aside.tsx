  "use client"

  import Link from 'next/link'
  import { useLoginUser } from './LoginUserProvider';


  const Aside = () => {
    const LoginUser = useLoginUser();
    // console.log('Asideで受け取ったroleは',LoginUser?.role);
    
    return (
      <aside className='max-sm:h-10 sm:h-[calc(100vh-80px-30px)] shrink-0 bg-amber-100 w-full sm:w-40 py-2 sm:pt-5'>
        <ul className='flex sm:flex-col justify-center items-center gap-10 font-bold text-black'>
          {/* <li><Link href="/dashboard">logo</Link></li> */}
          <li><Link href="/dashboard">打刻</Link></li>
          <li><Link href="/dashboard/AttendanceList">勤怠一覧</Link></li>
          <li><a href="/dashboard/requests">申請</a></li>
          {LoginUser && LoginUser.role === 'admin' && (
            <>
              <li><a href="/dashboard/accounts">社員一覧</a></li>
              <li><a href="/dashboard/settings">設定</a></li>
            </>
          )}
        </ul>
      </aside>
    )
  }

  export default Aside