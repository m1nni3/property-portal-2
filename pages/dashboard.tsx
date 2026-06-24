import Layout from '../components/Layout';

const DashboardPage = () => {
  return (
    <Layout title="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>This is your project dashboard. You can see an overview of your properties, maintenance tasks, and financials here.</p>
        {/* Placeholder for dashboard widgets like property overview, quick stats, etc. */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-md">
            <h3 className="font-semibold">Properties Overview</h3>
            <p className="text-gray-600">Total Properties: 15</p>
          </div>
          <div className="bg-green-100 p-4 rounded-md">
            <h3 className="font-semibold">Upcoming Invoices</h3>
            <p className="text-gray-600">Due in next 7 days: 3</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-md">
            <h3 className="font-semibold">Open Maintenance Tasks</h3>
            <p className="text-gray-600">Pending: 5</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
