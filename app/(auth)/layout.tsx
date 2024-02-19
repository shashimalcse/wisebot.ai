import { getServerSession } from 'next-auth';
import '../globals.css'
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import Provider from '../(context)/client-provider';

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
      <Provider session={session}>
        <body>
          <div className='flex flex-col h-screen'>
            <div className='flex flex-1 flex-row overflow-hidden'>
              {children}
            </div>
            <Toaster />
          </div>
        </body>
      </Provider>
    </html>
  )
}
