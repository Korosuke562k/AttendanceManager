import Link from 'next/link'

interface AsideProps {
  role: string
}

const Aside = (props:AsideProps) => {
  console.log('Asideで受け取ったroleは',props);
  
  
  return (
    <aside className='h-[calc(100vh-80px-30px)] bg-amber-100 w-40 pt-5'>
      <ul className='flex flex-col justify-center items-center gap-5 text-black'>
        <li><Link href="/dashboard">logo</Link></li>
        <li><Link href="/dashboard">打刻</Link></li>
        <li><Link href="/dashboard/AttendanceList">勤怠一覧</Link></li>
        <li><a href="/dashboard/requests">申請</a></li>
        {props.role === 'admin' && (
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