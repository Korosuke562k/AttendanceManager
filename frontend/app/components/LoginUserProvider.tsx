"use client"

import { createContext, useContext } from "react"

export interface LoginUser {
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

const LoginUserContext = createContext<LoginUser | null>(null);

interface LoginUserProviderProps {
  LoginUser: LoginUser | null;
  children: React.ReactNode;
}

export const LoginUserProvider = ({LoginUser,children}: LoginUserProviderProps) => {
  return (
    <LoginUserContext.Provider value={LoginUser}>
      {children}
    </LoginUserContext.Provider>
  )
}

export const useLoginUser = () => {
  return useContext(LoginUserContext)
}