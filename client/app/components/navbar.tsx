'use client'

import { UserButton } from '@clerk/nextjs'

const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-white">Talk PDF</h1>
      </div>
      <div className="flex items-center">
        <UserButton />
      </div>
    </nav>
  )
}

export default Navbar 