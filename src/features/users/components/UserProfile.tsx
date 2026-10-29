import Image from "next/image";
import type { User } from "../users.types";
import { BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 shadow-sm">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary sm:h-32" />
      <CardContent className="gap-0 px-5 pb-5 sm:px-7">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Image
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
              width={96}
              height={96}
              className="size-24 rounded-2xl border-4 border-card bg-card object-cover shadow-sm sm:size-28"
              unoptimized
            />
            <div className="pb-1">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Community member
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-b pb-5 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness aria-hidden="true" className="size-4" />
            {user.company.title} at {user.company.name}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-4" />
            {user.address.city}, {user.address.country}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-3">
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </dt>
            <dd className="break-all text-sm font-medium">{user.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Department
            </dt>
            <dd className="inline-flex items-center gap-1.5 text-sm font-medium">
              <UserRound aria-hidden="true" className="size-4 text-muted-foreground" />
              {user.company.department}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Age
            </dt>
            <dd className="text-sm font-medium">{user.age}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
