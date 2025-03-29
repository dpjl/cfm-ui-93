
import React from 'react';
import ThemeToggle from '../ThemeToggle';
import LanguageToggle from '../LanguageToggle';

const PageHeader: React.FC = () => {
  return (
    <header className="z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <h1 className="text-xl font-semibold">CFM Media Manager</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
};

export default PageHeader;
