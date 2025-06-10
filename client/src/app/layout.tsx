import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { UserProvider } from '../context/UserContext';
import { RestaurantProvider } from '../context/RestaurantContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Queneca',
  description: 'Your app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <RestaurantProvider>
            <Navbar />
            <main className="pt-4 px-2">{children}</main>
          </RestaurantProvider>
        </UserProvider>
      </body>
    </html>
  );
}
