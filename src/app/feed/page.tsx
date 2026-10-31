import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Home,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth/session";
import CreatePostForm from "@/features/post/components/CreatePostForm";
import PostFeed from "@/features/post/components/PostFeed";
import PostSearch from "@/features/post/components/PostSearch";
import LogoutLink from "./logout-link";

export default async function FeedPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const user = accessToken ? await getAuthenticatedUser(accessToken) : null;

  if (!user) {
    redirect("/login");
  }

  const profileHref = `/users/${encodeURIComponent(user.username)}`;
  const navigation = [
    { href: "/feed", label: "Home", icon: Home },
    { href: "#search", label: "Explore", icon: Search },
    { href: profileHref, label: "Profile", icon: UserRound },
  ];

  return (
    <main className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1280px] md:grid-cols-[72px_minmax(0,600px)] md:justify-center xl:grid-cols-[250px_minmax(0,600px)_350px]">
        <aside className="sticky top-0 hidden h-screen flex-col justify-between px-2 py-3 md:flex xl:px-4">
          <div className="flex flex-col gap-5">
            <Link
              href="/feed"
              aria-label="Gather home"
              className="flex size-12 items-center justify-center self-center rounded-full text-primary transition-colors hover:bg-primary/10 xl:size-auto xl:justify-start xl:self-start xl:px-3"
            >
              <MessageCircle aria-hidden="true" className="size-7" />
              <span className="ml-3 hidden text-xl font-extrabold tracking-tight text-foreground xl:inline">
                Gather
              </span>
            </Link>

            <nav aria-label="Main navigation" className="flex flex-col gap-1">
              {navigation.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-current={label === "Home" ? "page" : undefined}
                  className="flex items-center justify-center gap-4 rounded-full px-3 py-3 text-foreground transition-colors hover:bg-muted xl:justify-start"
                >
                  <Icon aria-hidden="true" className="size-6" />
                  <span
                    className={`hidden text-lg xl:inline ${label === "Home" ? "font-bold" : ""}`}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </nav>

            <Link
              href="#compose"
              aria-label="Create a post"
              title="Create a post"
              className="flex h-12 items-center justify-center rounded-full bg-primary px-3 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 xl:h-12 xl:px-6"
            >
              <span className="xl:hidden">+</span>
              <span className="hidden xl:inline">Post</span>
            </Link>
          </div>

          <div className="hidden flex-col gap-3 md:flex xl:hidden">
            <LogoutLink compact />
          </div>

          <div className="hidden flex-col gap-3 xl:flex">
            <Link
              href={profileHref}
              className="flex items-center gap-3 rounded-full p-3 transition-colors hover:bg-muted"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {user.username}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  @{user.username}
                </span>
              </span>
            </Link>
            <LogoutLink />
          </div>
        </aside>

        <section className="min-h-screen border-x border-border">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-5">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Home</h1>
              <p className="text-xs text-muted-foreground">
                Your community timeline
              </p>
            </div>
            <div className="md:hidden">
              <LogoutLink />
            </div>
            <Sparkles
              aria-hidden="true"
              className="hidden size-5 text-primary md:block"
            />
          </header>

          <PostSearch />
          <CreatePostForm username={user.username} />
          <section id="timeline" aria-label="Your community timeline">
            <PostFeed />
          </section>
        </section>

        <aside className="sticky top-0 hidden h-screen overflow-y-auto px-5 py-4 xl:block">
          <div className="space-y-4">
            <Card className="gap-0 rounded-2xl border-0 bg-muted/70 shadow-none">
              <CardHeader className="px-5 pb-2 pt-5">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Welcome to Gather
                </h2>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  A place for thoughtful conversations with people you follow.
                </p>
                <Link
                  href="#compose"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  Share what&apos;s on your mind
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-2xl border-border/70 shadow-none">
              <CardHeader className="px-5 pb-3 pt-5">
                <h2 className="text-lg font-extrabold">Your profile</h2>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{user.username}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="mt-2 line-clamp-3 text-sm leading-5 text-muted-foreground">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={profileHref}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  View your profile
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <p className="px-2 text-xs leading-5 text-muted-foreground">
              Be kind, stay curious, and make space for good conversations.
            </p>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-background/95 px-5 py-2 backdrop-blur-md md:hidden"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            aria-current={label === "Home" ? "page" : undefined}
            className="flex flex-col items-center gap-1 py-1 text-muted-foreground transition-colors hover:text-primary aria-[current=page]:text-primary"
          >
            <Icon aria-hidden="true" className="size-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
