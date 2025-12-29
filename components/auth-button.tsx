import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cookies } from "next/headers";

export async function AuthButton() {
  const supabase = await createClient();

  // Spróbuj najpierw przez getClaims (dla Supabase session)
  let user = null;
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  
  if (!claimsError && claimsData?.claims) {
    user = claimsData.claims;
  } else {
    // Jeśli nie ma Supabase session, sprawdź token z cookie (z API Gateway)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (authToken) {
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      if (!userError && userData?.user) {
        user = {
          sub: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata?.name,
          ...userData.user.user_metadata
        };
      }
    }
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        {user.name ? `Witaj, ${user.name}!` : `Witaj, ${user.email}!`}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
