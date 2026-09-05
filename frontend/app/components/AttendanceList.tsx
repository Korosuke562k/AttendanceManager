"use client";

import { formatInTimeZone } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import { useEffect, useState } from 'react'
import { useLoginUser } from './LoginUserProvider';

const url = "http://localhost:3001/";

interface attendance {
  id: number,
  date : string,
  clockin : string,
  reststopwork : string,
  reststartwork : string,
  clockout : string,
  workingtime : number,
  comment : string,
  user_id : number
}

// interface ListProps {
//   id: number,
//   clerk_user_id: string,
//   name: string,
//   email: string,
//   role: string,
//   create_at: string,
//   deleteflag: number,
//   group_id: number,
//   group_name: string,
//   group_branch: string
// }

// interface logionProps {
//   loginUser: user | null;
// }

interface user {
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


const AttendanceList = () => {
  const [date,setDate] = useState<Date>(new Date());
  const today = date;
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  const thisLastDate = new Date(thisYear,thisMonth+1,0).getDate();
  let num = 0;
  
  const week = ['日','月','火','水','木','金','土']
  
  const [attendance, setAttendance] = useState<attendance[]>([]);

  // LoginUserProvider.tsxより現在のログインユーザー情報を所得
  const LoginUser = useLoginUser();  

  // 選択対象のユーザー（初期値はログインユーザー）
  const [selectUser, SetSelectUser] = useState(LoginUser?.id)

  // DBのユーザー情報格納先
  const [users, setUsers] = useState<user[]>([]);


  // fetch関数（初回のみ動かす）
  useEffect(() => {
    fetchAttendance(),fetchUsers()
  },[]);

  // このコンポーネントは初回のみ動かす（DBからのユーザー全件所得）
  const fetchUsers = () => {
    fetch("http://localhost:3001/accounts")
    .then((res) => { return res.json()})
    .then((result) => {
      // console.log("API",result.users);
      setUsers(result.users);
  })
  }

  // このコンポーネントは初回のみ動かす
  const fetchAttendance = () => {
    fetch(url)
    .then((res) => { return res.json()})
    .then((result) => { setAttendance(result)})
  }

  // SQLから抽出したデータを表示月のみ、選択されたユーザーのみに絞る関数
    const targetAttendance = attendance.filter((attend) => {
      const TargetMonth = new Date(attend.date)
      const targetId = attend.user_id
      return (
        targetId === selectUser &&
        TargetMonth.getFullYear() === thisYear &&
        TargetMonth.getMonth() === thisMonth
      )
    })

    // 合計勤務時間を表示する関数
  const attendanceSummary = targetAttendance.reduce((sum,attend) => {
    // const TargetMonth = new Date(attend.date)
    return  sum + attend.workingtime;
    }, 0)
  
  // 時間を00:00の表記で表す（勤務合計時間/勤務時間で使用）
  const formatTime = (hours:number) => {
    const h = Math.floor( hours / 60)
    const m = Math.floor( hours % 60)
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
  }
  
  // 表示月を変更するコンポーネント
  const handleChangeMonth = (pager:string) => {
    if(pager === 'prev') {
      setDate(new Date(thisYear,thisMonth - 1))
    } else if(pager === 'next') {
      setDate(new Date(thisYear,thisMonth + 1))
    }
  }

  // 管理者がユーザーの勤怠記録を変更する場合
  const userChange = () => {
    if(confirm('変更を実施しますか？')){
      alert("変更しました。")
    } else alert("変更をキャンセルしました。")
  }

  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='mx-auto max-w-screen-lg'>
          <div className='font-bold text-3xl p-5'>勤怠一覧</div>
          <div className='flex gap-4 items-center mb-4'>
            <div className='pl-4 flex gap-1  items-center'>
              <button className='text-black' onClick={() => handleChangeMonth('prev')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}  stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                </svg>
              </button>
              <p>{thisYear}年{thisMonth + 1}月</p>
              <button className="text-black" onClick={() => {handleChangeMonth('next')}} >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <div className='mr-4'>{thisMonth + 1}月の合計：{formatTime(attendanceSummary)}</div>
            {LoginUser && LoginUser.role === 'admin' && (
              <>
                <div>ユーザー：
                  <select name="selectUser" value={selectUser} onChange={e => SetSelectUser(Number(e.target.value))}>
                    {users.map((user) => {
                      // IF分で本社か支社で分岐を行う。
                      // 本社の場合は全社員表示
                      if(LoginUser && LoginUser.group_branch == '本店'){
                        return (
                          <option value={user.id} key={user.id}>{user.id} - {user.name}</option>
                        )

                        // 支社の場合は所属支店のみ表示
                      } else if(LoginUser && LoginUser.group_branch === '支店' && LoginUser.group_id === user.group_id){ 
                        return (
                          <option value={user.id} key={user.id}>{user.id} - {user.name}</option>
                        )
                      }
                    })}
                  </select>
                </div>
                <button className='btn btn-outline btn-warning btn-sm' onClick={userChange}>保存</button>
              </>
            )}
          </div>

          <div className='w-[90vw] sm:w-[70vw] h-[60vh] overflow-auto'> 
            <table className='min-w-max text-center border-spacing-8 mb-4'>
              <thead>
                <tr className='border-1 border-b-2'>
                  <th className="w-14 md:w-18 md:py-2">日付</th>
                  <th className="w-14 md:w-18 md:py-2">曜日</th>
                  <th className="w-18 md:w-24 md:px-2 py-2">出勤時間</th>
                  <th className="w-18 md:w-24 md:px-2 py-2">退勤時間</th>
                  <th className="w-18 md:w-24 md:px-2 py-2">休憩開始</th>
                  <th className="w-18 md:w-24 md:px-2 py-2">休憩終了</th>
                  <th className="w-18 md:w-24 md:px-2 py-2">勤務時間</th>
                  <th className="w-22 md:w-40 md:px-2 py-2">コメント</th>
                  {LoginUser && LoginUser.role === 'admin' && (
                    <>
                      <th className='w-20 px-2 py-2'>編集</th>
                      <th className='w-20 px-2 py-2'>削除</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>

                {[...Array(thisLastDate)].map((_,index) => {
                  const targetDate = new Date(thisYear,thisMonth,index + 1)
                  const targetDay = targetDate.getDay();
                  
                  const todayAttendance = targetAttendance.find((attendance) => {
                    const attendanceDate = new Date(attendance.date);

                    return (
                      attendanceDate.getFullYear() === thisYear &&
                      attendanceDate.getMonth() === thisMonth &&
                      attendanceDate.getDate() === index + 1
                    );
                  })

                  return (
                  <tr key={index} className='border-1'>
                    <td  className='py-1'>{thisMonth + 1}/{index + 1}</td>
                    {/* 曜日の欄 土日のみ色を変化 */}
                    <td className={targetDay === 6? "text-blue-500": targetDay === 0? "text-red-500": ""}>（{week[targetDay]}）</td>
                    <td>{todayAttendance?.clockin && formatInTimeZone(todayAttendance.clockin, 'Asia/Tokyo','HH：mm')}</td>
                    <td>{todayAttendance?.clockout && formatInTimeZone(todayAttendance.clockout, 'Asia/Tokyo','HH：mm')}</td>
                    <td>{todayAttendance?.reststartwork && formatInTimeZone(todayAttendance.reststopwork, 'Asia/Tokyo','HH：mm')}</td>
                    <td>{todayAttendance?.reststartwork && formatInTimeZone(todayAttendance.reststartwork, 'Asia/Tokyo','HH：mm')}</td>
                    <td>{todayAttendance?.workingtime && formatTime(todayAttendance.workingtime)}</td>
                    <td>{todayAttendance?.comment  ?? ""}</td>
                    {LoginUser && LoginUser.role === 'admin' && (
                      <>
                        <td><button className="btn btn-outline btn-info btn-xs">編集</button></td>
                        <td><button className="btn btn-outline btn-secondary btn-xs">削除</button></td>
                      </>
                    )}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttendanceList