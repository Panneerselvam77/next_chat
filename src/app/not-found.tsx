import Link from "next/link";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

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
      <Card className="w-full max-w-lg items-center border-border/70 text-center shadow-sm">
        <CardHeader className="items-center space-y-4 px-7 pt-8">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX
              className="size-8"
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

        <CardContent className="items-center px-7">
          <p className="text-sm text-muted-foreground">
            Don&apos;t worry, there&apos;s more to discover on your feed.
          </p>
        </CardContent>

        <CardFooter className="flex-col justify-center gap-2 px-7 pb-8 sm:flex-row">
          <Link
            href="/feed"
            className={buttonVariants({ className: "w-full sm:w-auto" })}
          >
            <Home aria-hidden="true" />
            Back to feed
          </Link>

          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "w-full sm:w-auto",
            })}
          >
            <ArrowLeft aria-hidden="true" />
            Return home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
