"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/login") {
      setAllowed(true);
      return;
    }
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setAllowed(true);
        else router.replace("/dashboard/login");
      })
      .catch(() => router.replace("/dashboard/login"));
  }, [pathname, router]);

  if (!allowed && pathname !== "/dashboard/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
