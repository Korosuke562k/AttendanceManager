"use client"
import { log } from 'console';
import React, { useEffect, useState } from 'react'
import { resumeToPipeableStream } from 'react-dom/server';

const url = "http://localhost:3001/";

const AttendanceActions = () => {
  const date = new Date();
  const [time, setTime] = useState<Date | null>(null);

  const [reStartTime,setRestStartTime] = useState<Date | null>(null);
  const [reStopTime, setRestStopTime] = useState<Date | null>(null);
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [stopDateTime, setStopDateTime] = useState<Date | null>(null);

  let diff = 0;


  //各ボタンを押したときの操作（退勤ボタンのみ、1秒後にresetするためにuseEffect,setTimeoutを使用）

  // 出勤ボタンを押したとき
  const clickStart = () => {
    if(!startDateTime){
      setStartDateTime(new Date())
    }
  };
  
  // 休憩開始ボタンを押したとき
  const restStop = () => {
    if(!startDateTime){
      alert('出勤ボタンが押されていません。')
    }
    else if(startDateTime){
      setRestStopTime(new Date());

    }
  }

  // 休憩終了を押したとき
  const restStart = () => {
    if(!startDateTime || !reStopTime){
      alert('出勤休憩開始ボタンのどちらかが押されていません。')
    }
    else if(reStopTime){
      setRestStartTime(new Date());
    }
  }


  // 退勤ボタンを押したとき
  const clickStop = () => {
    // 出勤ボタンを教えていない場合はアラートを出す
    if (!startDateTime) {
      alert('出勤ボタンが押されていません。')
      return;
    }
    else if(reStopTime && !reStartTime) {
      alert('休憩終了ボタンが押されていません。')
      return;
    }

    // 退勤時間を一時保存
    const stop = new Date();
    setStopDateTime(stop);

    // 退勤 - 出勤
    let diff = stop.getTime() - startDateTime.getTime();

    let restTime = 0;

    // 休憩している場合は休憩時間を勤怠から差し引く
    if(reStartTime && reStopTime) {
      restTime  = reStartTime.getTime() - reStopTime.getTime();
    }

    // diffを ×1000で秒 ×60で分へ
    diff = Math.floor((diff - restTime) / 1000 / 60);


    const addData = {
      date: startDateTime,
      clockin: startDateTime,
      reststopwork: reStopTime,
      reststartwork: reStartTime,
      clockout: stop,
      workingtime : diff,
      comment: null,
    } 

    interface addData {
      date: Date;
      clockin: Date;
      reststopwork: Date | null;
      reststartwork: Date | null;
      clockout: Date | null;
      workingtime: number;
      comment: null;
    }

    let addResult = "";

    const addSQL = (addData:addData) => {
      fetch(url, {
        body: JSON.stringify(addData),
        method: "POST",
        headers: {"Content-Type" : "application/json",}
      })
      .then((res)=> res.json())
      .then((result) => addResult = result.message)
    }

    addSQL(addData);


    // 1秒空けてからリセットする。
    setTimeout(()=> {
      alert(addResult)
      console.log(addResult);
      Reset();
    },1000)
  }



    // 勤怠記録を画面上に表示
    const startDate = startDateTime
    ? `${String(startDateTime.getHours()).padStart(2,"0")}:${String(startDateTime.getMinutes()).padStart(2,"0")}`
    : "00:00";

    const reStopDate = reStopTime
    ? `${String(reStopTime.getHours()).padStart(2,"0")}:${String(reStopTime.getMinutes()).padStart(2,"0")}`
    : "00:00";

    const reStartDate = reStartTime
    ? `${String(reStartTime.getHours()).padStart(2,"0")}:${String(reStartTime.getMinutes()).padStart(2,"0")}`
    : "00:00";

    const stopDate = stopDateTime
    ? `${String(stopDateTime.getHours()).padStart(2,"0")}:${String(stopDateTime.getMinutes()).padStart(2,"0")}`
    : "00:00";
    
  //resetボタンの関数（初期値に戻す）
  const Reset = () => {
    setStartDateTime(null)
    setRestStartTime(null)
    setRestStopTime(null);
    setStopDateTime(null);
  }


  // 毎秒起動させて現在時刻を表示させる
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => {
      setTime(new Date());
    },1000);
    return () => clearInterval(timer);
  }, []);


  return (
      <div className='flex flex-col w-full px-40'>
        <div className='mt-4 mx-auto w-full max-w-screen-md'>
          {/* <div className='text-center font-bold text-3xl p-5'>打刻画面</div> */}
          <div className='flex flex-col'>
            <div className='text-center'>
              <p className='text-2xl mt-4'>{date.toLocaleDateString("ja-JP")}</p>
              <p className='mt-5 text-7xl font-bold'>{time? time.toLocaleTimeString() : "--:--:--"}</p>
            </div>
            <div className='flex justify-center gap-10 mt-20'>
              <div className='flex flex-col'>
                <button className="w-40 h-40 btn btn-error rounded-full" onClick={clickStart}>出勤</button>
                <div className='w-40 h-10 text-center font-bold text-3xl mt-4 border'>{startDate}</div>
              </div>
              <div className='flex flex-col'>
                <button className="w-40 h-40 btn btn-error rounded-full" onClick={restStop}>休憩開始</button>
                <div className='w-40 h-10 text-center font-bold text-3xl mt-4 border'>{reStopDate}</div>
              </div>
              <div className='flex flex-col'>
                <button className="w-40 h-40 btn btn-error rounded-full" onClick={restStart}>休憩終了</button>
                <div className='w-40 h-10 text-center font-bold text-3xl mt-4 border'>{reStartDate}</div>
              </div>              
              <div className='flex flex-col'>
                <button className="w-40 h-40 btn btn-error rounded-full" onClick={clickStop}>退勤</button>
                <div className='w-40 h-10 text-center font-bold text-3xl mt-4 border'>{stopDate}</div>
              </div>
            </div>
            <div className='mt-10'>
              <h3 className='font-bold underline mb-5'>お知らせ</h3>
              <table className='border-collapse border w-full text-center border-spacing-8 mb-4'>
                <thead>
                  <tr className='py-3'>
                    <th>日付</th>
                    <th>区分</th>
                    <th>内容</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_,i) => {
                    return (
                      <tr className='py-3 border-collapse border' key={i}>
                        <td>{date.toLocaleDateString("ja-JP")}</td>
                        <td>3</td>
                        <td>おはようございます。本日も元気な朝です。</td>
                      </tr>
                    )
                  })}
              </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
  )
}

export default AttendanceActions