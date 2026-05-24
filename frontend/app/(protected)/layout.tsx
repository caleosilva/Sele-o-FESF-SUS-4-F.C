import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AuthProvider } from "@/components/AuthProvider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <PageHeader />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
