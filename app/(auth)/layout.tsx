import { getServerSession } from 'next-auth';
import '../globals.css'
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession();
  if (session) {
    redirect("/")
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
          <div className='flex flex-col h-screen'>
            <div className='flex flex-1 flex-row overflow-hidden'>
              {children}
            </div>
            <Toaster />
          </div>
      </body>
    </html>
  )
}
