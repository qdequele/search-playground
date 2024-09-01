'use client';

import { MDXProvider } from '@mdx-js/react';
import { MDXStyles } from './MDXStyles';

const components = {
  h1: (props) => <h1 className="text-4xl font-bold mb-6" {...props} />,
  h2: (props) => <h2 className="text-3xl font-semibold mt-8 mb-4" {...props} />,
  h3: (props) => <h3 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
  p: (props) => <p className="mb-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: (props) => <li className="mb-2" {...props} />,
  a: (props) => <a className="text-blue-500 hover:underline" {...props} />,
};

export function MDXWrapper({ children }) {
  return (
    <MDXProvider components={components}>
      <MDXStyles>{children}</MDXStyles>
    </MDXProvider>
  );
}