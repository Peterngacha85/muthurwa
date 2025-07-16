import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function VendorDetail() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorDetail = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch vendor info
        const vendorRes = await axios.get('/api/auth/vendors/stats');
        const found = vendorRes.data.find(v => v._id === id);
        setVendor(found);
        // Fetch transactions and deliveries for this vendor
        const [txRes, delRes] = await Promise.all([
          axios.get(`/api/transactions?ownerId=${id}`),
          axios.get(`/api/deliveries?ownerId=${id}`)
        ]);
        setTransactions(txRes.data);
        setDeliveries(delRes.data);
      } catch (err) {
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading vendor details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!vendor) return <div className="p-8 text-center text-gray-500">Vendor not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/vendors" className="text-blue-600 hover:underline">&larr; Back to Vendors</Link>
      <h1 className="text-2xl font-bold mb-2 mt-4">{vendor.name}</h1>
      <div className="mb-4 text-gray-600">Phone: {vendor.phone} | Location: {vendor.location || '-'}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-lg font-semibold">Total Sales</div>
          <div className="text-2xl font-bold">{vendor.totalSales}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-lg font-semibold">Total Revenue</div>
          <div className="text-2xl font-bold">${vendor.totalRevenue}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-lg font-semibold">Total Deliveries</div>
          <div className="text-2xl font-bold">{vendor.totalDeliveries}</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Buyer</th>
              <th className="px-4 py-2 border">Tomato Type</th>
              <th className="px-4 py-2 border">Quantity</th>
              <th className="px-4 py-2 border">Total Amount</th>
              <th className="px-4 py-2 border">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map(tx => (
              <tr key={tx._id}>
                <td className="px-4 py-2 border">{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 border">{tx.buyerId?.name || '-'}</td>
                <td className="px-4 py-2 border">{tx.tomatoTypeId?.name || '-'}</td>
                <td className="px-4 py-2 border">{tx.quantity}</td>
                <td className="px-4 py-2 border">${tx.totalAmount}</td>
                <td className="px-4 py-2 border">{tx.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <div className="text-center text-gray-500 py-4">No transactions found.</div>}
      </div>
      <h2 className="text-xl font-semibold mb-2">Recent Deliveries</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Buyer</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.slice(0, 5).map(del => (
              <tr key={del._id}>
                <td className="px-4 py-2 border">{new Date(del.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 border">{del.buyerId?.name || '-'}</td>
                <td className="px-4 py-2 border">{del.deliveryLocation || '-'}</td>
                <td className="px-4 py-2 border">{del.deliveryStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {deliveries.length === 0 && <div className="text-center text-gray-500 py-4">No deliveries found.</div>}
      </div>
    </div>
  );
} 