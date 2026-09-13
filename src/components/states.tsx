import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: StateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
        <Inbox aria-hidden className="size-8 text-muted-foreground" />
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div aria-live="polite" className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ title, description, action }: StateProps) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
        <AlertCircle aria-hidden className="size-8 text-destructive" />
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
