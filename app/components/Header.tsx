import React from 'react'

function Header() {
  return (
    <header className="mb-10 text-center sm:text-left">
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
      Transiett - code test
    </h1>
    <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
      Create campaigns, generate discount codes, and export them as
      CSV. Built with Next.js, TypeScript, TextEncoder,Tailwind CSS and Sequalize and PostgreSQL.
    </p>
  </header>
  )
}

export default Header