// import { Suspense } from "react";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// import { getAuthenticatedUser } from "@/lib/auth/session";
// import LogoutLink from "./logout-link";
// import FeedCard from "@/components/FeedCard";

// async function FeedContent() {
//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("accessToken")?.value;

//   if (!accessToken) {
//     redirect("/login");
//   }

//   const user = await getAuthenticatedUser(accessToken);

//   if (!user) {
//     redirect("/login");
//   }

//   return (
//     <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10">
//       <header className="flex items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold">Your feed</h1>
//           <p className="text-sm text-muted-foreground">
//             Signed in as {user.firstName} {user.lastName}
//           </p>
//         </div>
//         <LogoutLink />
//       </header>
//       <section>
//         <FeedCard />
//       </section>
//     </main>
//   );
// }

// export default function FeedPage() {
//   return (
//     <Suspense
//       fallback={
//         <main className="flex min-h-screen items-center justify-center">
//           <p className="text-sm text-muted-foreground">Loading your feed...</p>
//         </main>
//       }
//     >
//       <FeedContent />
//     </Suspense>
//   );
// }

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import LogoutLink from "./logout-link";
import { getAuthenticatedUser } from "@/lib/auth/session";
import PostSearch from "@/features/post/components/PostSearch";
import PostFeed from "@/features/post/components/PostFeed";

export default async function FeedPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const user = accessToken ? await getAuthenticatedUser(accessToken) : null;

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
          <Link href="/feed" className="inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircle aria-hidden="true" className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Gather</span>
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              {user.firstName} {user.lastName}
            </p>
            <LogoutLink />
          </div>
        </div>

        <div className="py-7">
          <p className="text-sm font-medium text-primary">Your community</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            The feed
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover conversations, ideas, and people worth following.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <PostSearch />
        <section aria-labelledby="latest-posts-heading" className="space-y-4">
          <div>
            <h2
              id="latest-posts-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Latest posts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh conversations from the community.
            </p>
          </div>
          <PostFeed />
        </section>
      </div>
    </main>
  );
}
