import { UserButton } from '@clerk/nextjs'

const Header = () => {
  return (
    <header className='w-full h-20 bg-[#14B8A6] flex items-center justify-between px-8'>
      <p className='text-gray-100 text-2xl font-bold'>打刻画面</p>
      <UserButton/>
    </header>
  )
}

export default Header