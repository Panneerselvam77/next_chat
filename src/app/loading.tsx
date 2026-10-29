import { MessageCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-muted-foreground"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <MessageCircle aria-hidden="true" className="size-6" />
      </span>
      <span className="inline-flex items-center gap-2 text-sm">
        <Spinner aria-hidden="true" />
        Getting things ready...
      </span>
    </div>
  );
}
