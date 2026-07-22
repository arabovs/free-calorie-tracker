import { listAppUsers } from "@/app/actions";
import { UserSelect } from "@/components/user-select";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const users = await listAppUsers();

  return (
    <div className="min-h-dvh bg-black">
      <UserSelect users={users} />
    </div>
  );
}
