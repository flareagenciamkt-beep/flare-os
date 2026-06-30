interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <h1
          className="text-[28px] font-semibold leading-tight sm:text-[34px]"
          style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: "-0.4px" }}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-[13px] leading-relaxed" style={{ color: "#a39990" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
