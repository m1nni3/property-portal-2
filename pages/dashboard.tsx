import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Property, Invoice, MaintenanceTask } from '../src/types';

interface DashboardStats {
  totalProperties: number;
  upcomingInvoices: number;
  pendingMaintenance: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    upcomingInvoices: 0,
    pendingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch real data from Worker API (or fall back to relative paths)
        const [propsRes, invoicesRes, tasksRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/invoices'),
          fetch('/api/maintenance'),
        ]);

        const properties: Property[] = await propsRes.json();
        const invoices: Invoice[] = await invoicesRes.json();
        const tasks: MaintenanceTask[] = await tasksRes.json();

        setStats({
          totalProperties: properties.length,
          upcomingInvoices: invoices.filter(
            (i) => i.status === 'pending' && isDueSoon(i.due_date)
          ).length,
          pendingMaintenance: tasks.filter((t) => t.status === 'open').length,
        });
      } catch (err: any) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Helper to check if due date is within 7 days
  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000 && diff > 0;
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="p-6 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Real-time overview of your properties, invoices, and maintenance tasks.</p>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            name="Properties Overview"
            value={stats.totalProperties}
            color="blue"
          />
          <StatCard
            name="Upcoming Invoices (7 days)"
            value={stats.upcomingInvoices}
            color="green"
          />
          <StatCard
            name="Open Maintenance Tasks"
            value={stats.pendingMaintenance}
            color="yellow"
          />
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/properties"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Properties
          </a>
          <a
            href="/invoices"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Manage Invoices
          </a>
          <a
            href="/invoices/new"
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            Create Invoice
          </a>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  name,
  value,
  color,
}: {
  name: string;
  value: number;
  color: 'blue' | 'green' | 'yellow';
}) {
  const bgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
  };
  return (
    <div className={`${bgColors[color]} p-4 rounded-md`}>
      <h3 className="font-semibold">{name}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}