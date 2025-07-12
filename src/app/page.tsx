import DashboardClient from './dashboard-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold text-primary">InventarioClaro</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <DashboardClient />
        </div>
      </main>
    </div>
  );
}
