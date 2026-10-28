import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  id: number;
  title: string;
  body: string;
}

export default function FeedCard(props: Props) {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Terms of Service</CardTitle>
      </CardHeader>
      <CardContent className="-mb-(--card-spacing)">
        <div className="-mx-(--card-spacing) max-h-48 space-y-4 border-t bg-muted/50 px-(--card-spacing) py-4 text-sm leading-relaxed">
          <p>
            These terms govern your use of the workspace, including access to
            shared documents, project files, and collaboration tools.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {/* <Button variant="outline">Decline</Button>
        <Button>Accept</Button> */}
      </CardFooter>
    </Card>
  );
}
