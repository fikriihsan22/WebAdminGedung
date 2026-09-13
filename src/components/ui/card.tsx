import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<"section">;

export function Card({ className, ...props }: CardProps) {
  return <section className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b px-5 py-4", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}
