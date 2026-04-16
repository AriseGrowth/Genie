import './globals.css';
import { UserProvider } from '../lib/UserContext';
import { WorkspaceProvider } from '../lib/WorkspaceContext';
import { GenieProvider } from '../lib/GenieContext';
import Nav from '../components/Nav/Nav';
import GenieOrb from '../components/Genie/GenieOrb';
import GeniePanelWrapper from '../components/Genie/GeniePanelWrapper';

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
            <GenieProvider>
              <Nav />
              <main style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
                {children}
              </main>
              <GenieOrb />
              <GeniePanelWrapper />
            </GenieProvider>
          </WorkspaceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
