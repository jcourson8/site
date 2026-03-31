import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export function Note({
  children,
  label,
}: {
  children: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className="cursor-help text-foreground underline decoration-muted-foreground/40 decoration-dashed underline-offset-4"
        closeDelay={120}
        delay={0}
        openOnHover
      >
        {label}
      </PopoverTrigger>
      <PopoverContent className="max-w-72 p-3" sideOffset={6}>
        <div className="text-muted-foreground text-xs leading-relaxed">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
