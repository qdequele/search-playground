'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleDotDashed, Github, Menu, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
import { FeedbackModal } from '@/components/FeedbackModal';

function NavLink({ href, children, onClick }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} onClick={onClick}>
      <Button 
        variant="ghost" 
        size="sm"
        className={cn(
          isActive && "font-bold underline",
          "transition-all duration-200 ease-in-out w-full justify-start"
        )}
      >
        {children}
      </Button>
    </Link>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openFeedback = () => setIsFeedbackOpen(true);
  const closeFeedback = () => setIsFeedbackOpen(false);

  return (
    <div className="border-b">
      <div className="flex items-center justify-between mx-6 my-3">
        <div className="flex items-center">
          <CircleDotDashed className="h-6 w-6" />
          <h1 className="pl-6 font-bold text-lg">Search Playground</h1>
          {!isMobile && (
            <nav className="ml-6 space-x-4 flex items-center">
              <NavLink href="/">Playground</NavLink>
              <NavLink href="/info">Info</NavLink>
              <NavLink href="/guides">Guides</NavLink>
            </nav>
          )}
        </div>
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        ) : (
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={openFeedback}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
            <Link
              href="https://www.meilisearch.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Go to Meilisearch</Button>
            </Link>
            <Link
              href="https://github.com/meilisearch/meilisearch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <Github className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <ModeToggle />
          </div>
        )}
      </div>
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h1 className="font-bold text-lg">Search Playground</h1>
              <Button variant="ghost" size="icon" onClick={closeMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-grow flex flex-col justify-between p-4">
              <div className="space-y-2">
                <NavLink href="/" onClick={closeMenu}>Playground</NavLink>
                <NavLink href="/info" onClick={closeMenu}>Info</NavLink>
                <NavLink href="/guides" onClick={closeMenu}>Guides</NavLink>
              </div>
              <div className="space-y-4">
                <Link
                  href="https://www.meilisearch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  <Button variant="outline" className="w-full justify-start">Go to Meilisearch</Button>
                </Link>
                <div className="h-4"></div>
                <Link
                  href="https://github.com/meilisearch/meilisearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Github className="h-[1.2rem] w-[1.2rem] mr-2" />
                    GitHub
                  </Button>
                </Link>
                <div className="pt-2">
                  <ModeToggle />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />
    </div>
  );
}