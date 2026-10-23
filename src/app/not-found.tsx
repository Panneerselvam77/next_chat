import Link from "next/link";
import { Home, ArrowLeft, SearchX } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-none text-center shadow-none">
        <CardHeader className="items-center space-y-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <SearchX
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Error 404
          </p>

          <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
            Page not found
          </CardTitle>

          <CardDescription className="max-w-sm text-base leading-7">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            may have been moved, deleted, or the URL might be incorrect.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Don&apos;t worry, there&apos;s more to discover on your feed.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/feed">
            <Home className="mr-2 size-4" />
            Back to feed
          </Link>

          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
