import './globals.css';

export const metadata = {
  title: 'Widget Tâche 13BK',
  description: 'Widget de tâches, notes et rappels pour tableau de bord GoHighLevel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
