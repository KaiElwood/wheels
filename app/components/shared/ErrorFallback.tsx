import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";

export function ErrorFallback({ message }: { message: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <p className="text-sm font-medium text-foreground">{message}</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </Card>
  );
}
