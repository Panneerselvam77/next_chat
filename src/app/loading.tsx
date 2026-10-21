import { cn } from "cn";
import { LoaderIcon } from "lucide-react";

const Spinner = ({ className, ...props }: React.ComponentProps<"svg">) => {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
};

export default function Loading() {
  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
    </div>
  );
}
