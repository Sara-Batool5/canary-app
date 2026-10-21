'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import { Logo } from '@/components/app-shell/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6"
      >
        <div className="flex flex-1 items-center">
          <Logo href="/" />
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
          <Link
            href="/login"
            className={buttonVariants({ variant: 'ghost', size: 'lg', className: 'px-3' })}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ size: 'lg', className: 'px-3.5' })}
          >
            Get started
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 border-border bg-card/90 p-6 backdrop-blur-xl"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col gap-8 pt-2">
              <Logo href="/" />
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10')}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: 'lg' }), 'h-10')}
                >
                  Get started
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
