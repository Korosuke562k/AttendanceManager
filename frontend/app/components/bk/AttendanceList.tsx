"use client";
import { formatInTimeZone } from 'date-fns-tz';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react'

const url = "http://localhost:3001/";


interface attendance {
  id: number,
  date : string,
  clockin : string,
  reststopwork : string,
  reststartwork : string,
  clockout : string,
  workingtime : number,
  comment : string
}

const AttendanceList = () => {
  const [date,setDate] = useState<Date>(new Date());
  const today = date;
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth();
  const thisDate = today.getDate();
  const thisDay = today.getDay();
  const thisFirstDate = new Date(thisYear,thisMonth+1,1)
  const thisLastDate = new Date(thisYear,thisMonth+1,0).getDate();
  let num = 0;
  
  const week = ['日','月','火','水','木','金','土']
  
  const [attendance, setAttendance] = useState<attendance[]>([]);

  // fetch関数
  useEffect(() => {
    fetchAttendance();
  },[]);

  // このコンポーネントは初回のみ動かす
  const fetchAttendance = () => {
    fetch(url)
    .then((res) => { return res.json()})
    .then((result) => {
      setAttendance(result)})
  }

  // SQLから抽出したデータを表示月のみに絞るコンポーネント
    const targetAttendance = attendance.filter((attend) => {
      const TargetMonth = new Date(attend.date)
      return (
        TargetMonth.getFullYear() === thisYear &&
        TargetMonth.getMonth() === thisMonth
      )
    })

    // 合計勤務時間を表示する関数
  const attendanceSummary = targetAttendance.reduce((sum,attend) => {
    const TargetMonth = new Date(attend.date)
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

  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='mx-auto max-w-screen-lg'>
        <div className='font-bold text-3xl p-5'>勤怠一覧</div>
        <div className='flex gap-4'>
          <div className='pb-5 pl-8 flex gap-2'>
            <button className='w-5 text-black' onClick={() => handleChangeMonth('prev')}>
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
          <div>{thisMonth + 1}月の勤務時間：{formatTime(attendanceSummary)}</div>
        </div>

        <div className='w-full h-[60vh] overflow-scroll'> 
          <table className='min-w-max text-center border-spacing-8 mb-4'>
            <thead>
              <tr>
                <th className="w-20 px-4 py-2">日付</th>
                <th className="w-20 px-4 py-2">曜日</th>
                <th className="w-28 px-4 py-2">出勤時間</th>
                <th className="w-28 px-4 py-2">退勤時間</th>
                <th className="w-28 px-4 py-2">休憩開始</th>
                <th className="w-28 px-4 py-2">休憩終了</th>
                <th className="w-28 px-4 py-2">勤務時間</th>
                <th className="w-40 px-4 py-2">コメント</th>
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
                <tr key={index}>
                  <td>{thisMonth + 1}/{index + 1}</td>
                  <td>（{week[targetDay]}）</td>
                  <td>{todayAttendance?.clockin && formatInTimeZone(todayAttendance.clockin, 'Asia/Tokyo','HH：mm')}</td>
                  <td>{todayAttendance?.clockout && formatInTimeZone(todayAttendance.clockout, 'Asia/Tokyo','HH：mm')}</td>
                  <td>{todayAttendance?.reststartwork && formatInTimeZone(todayAttendance.reststopwork, 'Asia/Tokyo','HH：mm')}</td>
                  <td>{todayAttendance?.reststartwork && formatInTimeZone(todayAttendance.reststartwork, 'Asia/Tokyo','HH：mm')}</td>
                  <td>{todayAttendance?.workingtime && formatTime(todayAttendance.workingtime)}</td>
                  <td>{todayAttendance?.comment  ?? ""}</td>
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