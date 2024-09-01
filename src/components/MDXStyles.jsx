import React from 'react';

export function MDXStyles({ children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="prose prose-lg dark:prose-invert">
        {children}
      </div>
    </div>
  );
}