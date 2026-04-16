import './globals.css';
import { UserProvider } from '../lib/UserContext';
import { WorkspaceProvider } from '../lib/WorkspaceContext';
import { GenieProvider } from '../lib/GenieContext';
import Nav from '../components/Nav/Nav';
import GenieOrb from '../components/Genie/GenieOrb';
import GeniePanelWrapper from '../components/Genie/GeniePanelWrapper';
import ApprovalPoller from '../components/Genie/ApprovalPoller';

export const metadata = {
  title: 'Genie',
  description: 'AI Executive Assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c6aff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Genie" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <UserProvider>
          <WorkspaceProvider>
            <GenieProvider>
              <ApprovalPoller />
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
