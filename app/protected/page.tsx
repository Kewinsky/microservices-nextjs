import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();
  
  // Spróbuj najpierw przez getClaims (dla Supabase session)
  let user = null;
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  
  if (!claimsError && claimsData?.claims) {
    user = claimsData.claims;
  } else {
    // Jeśli nie ma Supabase session, sprawdź token z cookie
    const cookies = await import('next/headers').then(m => m.cookies());
    const authToken = cookies.get('auth_token')?.value;
    
    if (authToken) {
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      if (!userError && userData?.user) {
        user = {
          sub: userData.user.id,
          email: userData.user.email,
          ...userData.user.user_metadata
        };
      }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  return JSON.stringify(user, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-bold text-xl mb-2">Items Management</h3>
          <p className="text-muted-foreground mb-4">
            Manage your items with full CRUD operations
          </p>
          <a href="/items" className="text-primary hover:underline">
            Go to Items →
          </a>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-bold text-xl mb-2">System Logs</h3>
          <p className="text-muted-foreground mb-4">
            View activity logs from all microservices
          </p>
          <a href="/logs" className="text-primary hover:underline">
            View Logs →
          </a>
        </div>
      </div>
    </div>
  );
}
