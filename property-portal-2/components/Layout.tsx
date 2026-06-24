import Head from 'next/head';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children, title = 'Property Platform' }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Property oversight and management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <nav className="mt-2">
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
            <li><a href="/properties" className="hover:underline">Properties</a></li>
            {/* Add other navigation links here */}
          </ul>
        </nav>
      </header>
      <main className="p-4 max-w-6xl mx-auto">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 mt-8 text-center">
        <p>&copy; {new Date().getFullYear()} Property Management Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
