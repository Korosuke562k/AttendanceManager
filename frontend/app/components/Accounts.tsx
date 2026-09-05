"use client";

import { useEffect, useState } from 'react'
import { useLoginUser } from './LoginUserProvider';

const url = "http://localhost:3001/accounts";
const groupUrl = "http://localhost:3001/group/";


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

interface Belonging {
  id: number,
  name: string,
  branch_flag :number
}

const Accounts = () => {

  // 変更したユーザー情報を一時保存
  const [users, setUsers] = useState<user[]>([]);
  
  // DBから所得したときのユーザー情報
  const [originalUsers, setOriginalUsers] = useState<user[]>([]);

  // 変更したユーザーのカラム変更管理
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dbから所得したときのグループ管理
  const [originalGroup, setOriginalGroup] = useState<Belonging[]>([]);

  // LoginUserProvider.tsxより現在のログインユーザー情報を所得
  const LoginUser = useLoginUser();  

  // 権限フィルター用
  const [selectedRole,setSelectedRole]= useState<string | null>(null);

  // 所属グループフィルター用
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  // fetch関数
  useEffect(() => {
    fetchUsers(),fetchGroup();
  },[]);

  // このコンポーネントは初回のみ動作(DBからのユーザー所得)
  const fetchUsers = () => {
    fetch(url)
    .then((res) => { return res.json()})
    .then((result) => {
      console.log("API",result);
      setUsers(result.users);
      setOriginalUsers(result.users);
    })
  }

  // このコンポーネントは初回のみ動作(DBからのロール所得)
  const fetchGroup = () => {
    fetch(groupUrl)
    .then((res) => { return res.json()})
    .then((result) => {
      console.log("Role一覧", result);
      setOriginalGroup(result)
    })

  }

  // フィルター後の配列
  const filteredUsers:user[] = users.filter((user) => {
    const groupMatch = (selectedGroup === null) || (user.group_id === selectedGroup);
    const roleMatch = (selectedRole === null) || (user.role === selectedRole);

    return groupMatch && roleMatch
  })

  // 条件解除ボタン でリセット
  const lessFilter = () => {
    setSelectedRole(null);
    setSelectedGroup(null);
  }

  // 対象者の権限のプルダウンを変更するたびにsetUsersへ連携して一時保存
  const updateUsers = (targetRole:string,targetId:number) => {
    setUsers(users.map((user) => {
      if(user.id === targetId) {
        return {
          ...user,role: targetRole
        }
      }
      return user;
    }))
    setSelectedId(targetId)
  }

  // 保存ボタンを押すと、差分のみDBへ連携される
  const saveUsers = () => {
    
    const diffUsers = users.filter((user) => {
      const originalUser = originalUsers.find((origin) => {
        return origin.id === user.id
      });
      return originalUser && originalUser.role !== user.role || originalUser && originalUser.deleteflag
    });
    console.log(diffUsers);
    
    if(diffUsers.length === 0) {
      return alert('変更がありません。')
    }
    if(confirm('変更を実施しますか？')) {
      updateSQL(diffUsers)
    } else{
      return alert('キャンセルしました。')
    }
  };

  // DBへ連携される流れ（非同期のためasyncを使用）
    const updateSQL = async (diffUsers:user[]) => {
      const res = await fetch(url,{
        body :JSON.stringify(diffUsers),
        method: 'PUT',
        headers: { 'Content-Type' : 'application/json'}
      });

      const result = await res.json();
      alert(result.message);
      fetchUsers();
      setSelectedId(null)
    }

  // 削除ボタンの処理（確認画面が表示され、OKを押すと削除される）
    const deleteUsers = (deleteUser:number) => {
    }


  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='font-bold text-3xl py-2'>社員一覧</div>
        <div className='flex justify-center items-center py-2'>
          <p>ロール：</p>
          {/* 権限フィルター */}
          <select name="role" value={selectedRole ?? ""} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="" disabled>未選択</option>
            <option value="user">ユーザー</option>
            <option value="admin">管理者</option>
          </select>

          <p className='pl-8'>所属：</p>
          {/* 所属フィルター */}
          <select name="group" className='mr-8' value={selectedGroup ?? ""} onChange={(e) => setSelectedGroup(Number(e.target.value))}>
            <option value="" disabled>未選択</option>
            {originalGroup.map((belonging) => {
              return <option value={belonging.id} key={belonging.id}>{belonging.name}</option>
            })}
          </select>
          
          <button className="btn btn-outline btn-secondary mr-5" onClick={lessFilter}>条件解除</button>
          <button className="btn btn-outline btn-primary" onClick={saveUsers}>保存</button>
        </div>
        <div className='w-[70vw] h-[55vh] overflow-scroll'> 
          <table className='min-w-max text-center border-spacing-8 mb-4'>
            <thead>
              <tr className='border-b-2 border-1'>
                <th className="w-20 px-4 py-2">No</th>
                <th className="w-24 px-4">氏名</th>
                <th className="w-24 px-4">メールアドレス</th>
                <th className="w-28 px-4">権限</th>
                <th className="w-28 px-4">所属</th>
                <th className="w-28 px-4">作成日</th>
                <th className="w-28 px-4">削除</th>
              </tr>
            </thead>
            <tbody>

              {filteredUsers.map((user,index) => {
                return (
                <tr key={index} className='border-1'>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td  className={selectedId === user.id  ? 'bg-blue-100':''}>
                    {/* 本店 or 同じ支店に所属している場合に権限変更可能 */}
                    {LoginUser && (LoginUser.group_branch == '本店' || LoginUser.group_name === user.group_name) ? (
                          <select name='role' value={user.role} onChange={(e) => updateUsers(e.target.value,user.id)}>
                            <option value="user">ユーザー</option>
                            <option value="admin">管理者</option>
                          </select>                      
                        ) : (user.role === 'admin' ? '管理者' : 'ユーザー')
                      } 
                  </td>
                  <td>{user.group_name}</td>
                  <td>{user.create_at.toString().slice(0,19).replace('T',' ')}</td>
                  <td><button className="btn btn-outline btn-secondary btn-xs" onClick={ () => deleteUsers(user.id)}>削除</button></td>
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


