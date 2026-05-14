import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-md bg-foreground",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="font-mono font-black leading-none text-background"
        style={{ fontSize: size * 0.66 }}
      >
        X
      </span>
      <span
        className="absolute bg-primary"
        style={{
          width: size * 0.28,
          height: size * 0.18,
          top: size * 0.14,
          right: size * 0.1,
          transform: "skewX(-22deg)",
        }}
      />
    </div>
  );
}

export function BrandLockup({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={36} />
      <div className="flex flex-col leading-tight">
        <span className="font-semibold tracking-tight">XYZ University</span>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
