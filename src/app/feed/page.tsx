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

import PostFeed from "@/features/post/components/PostFeed";

export const instant = false;

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Your Feed</h1>
        <p className="mt-2 text-muted-foreground">
          Discover what people are sharing.
        </p>
      </header>

      <PostFeed />
    </main>
  );
}
