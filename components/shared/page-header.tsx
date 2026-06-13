interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-[5px]">
        <h1
          className="text-[25px] font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-bricolage), sans-serif", letterSpacing: "-0.6px" }}
        >
          {title}
        </h1>
        {description && (
          <p className="font-mono text-[10px] uppercase tracking-[1.8px]" style={{ color: "#8a827a" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
