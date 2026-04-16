import './globals.css';
import { UserProvider } from '../lib/UserContext';
import { WorkspaceProvider } from '../lib/WorkspaceContext';
import Nav from '../components/Nav/Nav';

export const metadata = {
  title: 'Genie',
  description: 'AI Executive Assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <WorkspaceProvider>
            <Nav />
            <main style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
              {children}
            </main>
          </WorkspaceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
