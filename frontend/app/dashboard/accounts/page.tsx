"use client"

import Accounts from "@/app/components/Accounts";
import { useLoginUser } from "@/app/components/LoginUserProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function AccountsPage() {

  const loginUser = useLoginUser();
  const router = useRouter();

  // adminじゃなければトップへリダイレクト
  useEffect(() => {
    if(loginUser && loginUser.role !== 'admin'){
      router.replace("/dashboard")
    }
  },[loginUser,router])

  // useContextから情報が得られていない場合は何も返さない
  if(!loginUser || loginUser?.role !== "admin"){
    return null;
  }
  else if(loginUser.role === 'admin'){
    return <Accounts />
  }

}