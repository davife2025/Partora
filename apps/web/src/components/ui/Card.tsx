import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "flat" | "soprano" | "alto" | "tenor" | "bass";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const VARIANTS: Record<CardVariant, string> = {
  default:  "glass border-border",
  elevated: "glass border-border shadow-xl shadow-black/30",
  flat:     "bg-background-tertiary border-border",
  soprano:  "bg-voice-soprano border border-soprano/30",
  alto:     "bg-voice-alto border border-alto/30",
  tenor:    "bg-voice-tenor border border-tenor/30",
  bass:     "bg-voice-bass border border-bass/30",
};

const PADDING = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-6",
};

export function Card({
  variant = "default",
  padding = "md",
  hoverable,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        VARIANTS[variant],
        PADDING[padding],
        hoverable && "transition-all duration-200 hover:border-border cursor-pointer hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
