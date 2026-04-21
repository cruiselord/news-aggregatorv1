"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Settings, BarChart3, Database, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname.includes("/admin/login")) {
      setIsLoading(false);
      return;
    }

    // Check admin authentication (simple check via localStorage)
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Render login page without sidebar
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-5 bg-background">
      {/* Sidebar */}
      <div className="md:col-span-1 border-r border-border bg-card p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            🛡️ Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Content Management & Analytics
          </p>
        </div>

        <nav className="space-y-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/sources">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Sources
            </Button>
          </Link>
          <Link href="/admin/clusters">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Clusters
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>

        <Button
          variant="outline"
          className="w-full justify-start"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="md:col-span-4 p-6 md:p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
