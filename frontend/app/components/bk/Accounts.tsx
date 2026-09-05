"use client";
import { formatInTimeZone } from 'date-fns-tz';
import React, { useEffect, useState } from 'react'

const url = "http://localhost:3001/accounts";


interface user {
  id: number,
  clerk_user_id : string,
  name : string,
  email : string,
  role : string,
  role_name : string,
  create_at : string
}

const Accounts = () => {

  const [users, setUsers] = useState<user[]>([]);
  const [originalUsers, setOriginalUsers] = useState<user[]>([]);

  // fetch関数
  useEffect(() => {
    fetchUsers();
  },[]);

  // このコンポーネントは初回のみ動かす
  const fetchUsers = () => {
    fetch(url)
    .then((res) => { return res.json()})
    .then((result) => {
      console.log("API",result);
      setUsers(result.users);
      setOriginalUsers(result.users);
  })
    
  }

  // タブを変更するたびにsetUsersへ連携して一時保存
  const updateUsers = (targetRole:string,targetId:number) => {
    setUsers(users.map((user) => {
      if(user.id === targetId) {
        return {
          ...user,role: targetRole
        }
      }
      return user;
    }))
  }


  // 保存ボタンを押すと、差分のみDBへ連携される
  const saveUsers = () => {
    const diffUsers = users.filter((user) => {
      const originalUser = originalUsers.find((origin) => {
        return origin.id === user.id
      });
      return originalUser && originalUser.role !== user.role
    });
    console.log(diffUsers);
    
    if(diffUsers.length === 0) {
      return alert('変更がありません。')
    }
    updateSQL(diffUsers)
  };


  // DBへ連携される流れ
    const updateSQL = async (diffUsers:user[]) => {
      const res = await fetch(url,{
        body :JSON.stringify(diffUsers),
        method: 'PUT',
        headers: { 'Content-Type' : 'application/json'}
      });

      const result = await res.json();
      alert(result.message);
      fetchUsers();
    }

  

  // 時間を00:00の表記で表す（勤務合計時間/勤務時間で使用）
  const formatTime = (hours:number) => {
    const h = Math.floor( hours / 60)
    const m = Math.floor( hours % 60)
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
  }
  


  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='font-bold text-3xl p-5 flex justify-between'>
          <p>社員一覧</p>
          <div>
            {/* <button className="btn btn-outline btn-secondary mr-4">キャンセル</button> */}
            <button className="btn btn-outline btn-primary" onClick={saveUsers}>保存</button>
          </div>
        </div>
        <div className='w-full h-[60vh] overflow-scroll'> 
          <table className='min-w-max text-center border-spacing-8 mb-4'>
            <thead>
              <tr>
                <th className="w-20 px-4 py-2">No</th>
                <th className="w-20 px-4 py-2">氏名</th>
                <th className="w-20 px-4 py-2">メールアドレス</th>
                <th className="w-28 px-4 py-2">権限</th>
                <th className="w-28 px-4 py-2">作成日</th>
              </tr>
            </thead>
            <tbody>

              {users.map((user,index) => {
                return (
                <tr key={index}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select name='role' value={user.role} onChange={(e) => updateUsers(e.target.value,user.id)}>
                      <option value="user">ユーザー</option>
                      <option value="admin">管理者</option>
                    </select>
                  </td>
                  <td>{user.create_at.toString().slice(0,19).replace('T',' ')}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}


export default Accounts


