import Image from "next/image";
import type { User } from "../users.types";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Image
          src={user.image}
          alt={`${user.firstName} ${user.lastName}`}
          width={96}
          height={96}
          className="rounded-full border"
          unoptimized
        />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>

          <p className="text-sm text-muted-foreground">@{user.username}</p>

          <p className="text-sm">{user.company.title}</p>

          <p className="text-sm text-muted-foreground">
            {user.company.name} · {user.address.city}, {user.address.country}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="break-all text-sm font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Department</p>
          <p className="text-sm font-medium">{user.company.department}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Age</p>
          <p className="text-sm font-medium">{user.age}</p>
        </div>
      </div>
    </section>
  );
}
