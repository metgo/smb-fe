interface DashboardKpiGridProps {
  children: React.ReactNode;
}

export default function DashboardKpiGrid({ children }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {children}
    </div>
  );
}
