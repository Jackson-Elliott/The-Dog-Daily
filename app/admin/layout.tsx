import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import AdminHeader from "@/components/AdminHeader";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const cookieStore = await cookies();
  const loggedIn = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AdminHeader loggedIn={loggedIn} />
      {children}
    </div>
  );
}
