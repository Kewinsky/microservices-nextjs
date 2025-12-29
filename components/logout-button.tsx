"use client";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    apiClient.logout();
    router.push("/auth/login");
    router.refresh();
  };

  return <Button onClick={logout}>Logout</Button>;
}
