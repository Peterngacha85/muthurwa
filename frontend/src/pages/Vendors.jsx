import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '', password: '' });
  const [actionMsg, setActionMsg] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/auth/vendors/stats');
      setVendors(res.data);
    } catch (err) {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVendor(null);
    setFormData({ name: '', phone: '', location: '', password: '' });
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({ name: vendor.name, phone: vendor.phone, location: vendor.location || '', password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await axios.delete(`/api/auth/vendor/${id}`);
      setActionMsg('Vendor deleted successfully.');
      fetchVendors();
    } catch (err) {
      setActionMsg('Failed to delete vendor.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await axios.put(`/api/auth/vendor/${editingVendor._id}`, formData);
        setActionMsg('Vendor updated successfully.');
      } else {
        await axios.post('/api/auth/register', { ...formData, role: 'vendor' });
        setActionMsg('Vendor added successfully.');
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      setActionMsg('Failed to save vendor.');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const q = search.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(q) ||
      vendor.phone.toLowerCase().includes(q) ||
      (vendor.location && vendor.location.toLowerCase().includes(q))
    );
  });

  if (loading) return <div className="p-8 text-center">Loading vendors...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Vendors</h1>
      {user?.role === 'admin' && (
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4" /> Add Vendor
        </button>
      )}
      {actionMsg && <div className="mb-2 text-center text-sm text-blue-600">{actionMsg}</div>}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name, phone, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Total Sales</th>
              <th className="px-4 py-2 border">Total Revenue</th>
              <th className="px-4 py-2 border">Total Deliveries</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor._id}>
                <td className="px-4 py-2 border">{vendor.name}</td>
                <td className="px-4 py-2 border">{vendor.phone}</td>
                <td className="px-4 py-2 border">{vendor.location || '-'}</td>
                <td className="px-4 py-2 border">{vendor.totalSales ?? '-'}</td>
                <td className="px-4 py-2 border">{vendor.totalRevenue ? `$${vendor.totalRevenue}` : '-'}</td>
                <td className="px-4 py-2 border">{vendor.totalDeliveries ?? '-'}</td>
                <td className="px-4 py-2 border flex gap-2">
                  <button
                    className="btn-primary px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate(`/vendors/${vendor._id}`)}
                  >
                    View
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        className="px-2 py-1 text-blue-600 hover:underline"
                        onClick={() => handleEdit(vendor)}
                      >
                        <Edit className="h-4 w-4 inline" />
                      </button>
                      <button
                        className="px-2 py-1 text-red-600 hover:underline"
                        onClick={() => handleDelete(vendor._id)}
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit Vendor */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              {!editingVendor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className="input-field w-full"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 