import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Truck, 
  User,
  MapPin,
  Calendar,
  Loader2,
  X,
  CheckCircle,
  Clock
} from 'lucide-react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

export default function Deliveries() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const statusFilter = queryParams.get('status')
  const [deliveries, setDeliveries] = useState([])
  const [transactions, setTransactions] = useState([])
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState(null)
  const [formData, setFormData] = useState({
    transactionId: '',
    buyerId: '',
    deliveryPersonName: '',
    deliveryLocation: '',
    deliveryStatus: 'pending'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [deliveriesRes, transactionsRes, buyersRes] = await Promise.all([
        axios.get('/api/deliveries'),
        axios.get('/api/transactions'),
        axios.get('/api/buyers')
      ])
      
      setDeliveries(deliveriesRes.data)
      setTransactions(transactionsRes.data)
      setBuyers(buyersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDelivery) {
        await axios.put(`/api/deliveries/${editingDelivery._id}`, formData)
      } else {
        await axios.post('/api/deliveries', formData)
      }
      fetchData()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving delivery:', error)
    }
  }

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery)
    setFormData({
      transactionId: delivery.transactionId._id || delivery.transactionId,
      buyerId: delivery.buyerId._id || delivery.buyerId,
      deliveryPersonName: delivery.deliveryPersonName,
      deliveryLocation: delivery.deliveryLocation,
      deliveryStatus: delivery.deliveryStatus
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await axios.delete(`/api/deliveries/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting delivery:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDelivery(null)
    setFormData({
      transactionId: '',
      buyerId: '',
      deliveryPersonName: '',
      deliveryLocation: '',
      deliveryStatus: 'pending'
    })
  }

  const getStatusIcon = (status) => {
    return status === 'delivered' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <Clock className="h-4 w-4 text-yellow-500" />
  }

  const getStatusColor = (status) => {
    return status === 'delivered' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    const buyerObj = buyers.find(b => b._id === delivery.buyerId)
    const matchesSearch = (
      (buyerObj && buyerObj.name && buyerObj.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.deliveryPersonName && delivery.deliveryPersonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.deliveryLocation && delivery.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    if (statusFilter === 'pending') {
      return matchesSearch && delivery.deliveryStatus === 'pending'
    }
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600">Track and manage your tomato deliveries</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Delivery
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search deliveries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDeliveries.map((delivery) => {
          return (
            <div key={delivery._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Delivery #{delivery._id.slice(-6)}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Buyer:</span> {delivery.buyerId?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Delivery Person:</span> {delivery.deliveryPersonName}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">Location:</span> {delivery.deliveryLocation}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Created:</span> {new Date(delivery.createdAt).toLocaleDateString()}
                    </div>
                    {delivery.transactionId && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Transaction Amount:</span> ${delivery.transactionId.totalAmount?.toFixed(2) || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center">
                    {getStatusIcon(delivery.deliveryStatus)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.deliveryStatus)}`}>
                      {delivery.deliveryStatus}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(delivery)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(delivery._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new delivery.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingDelivery ? 'Edit Delivery' : 'New Delivery'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction</label>
                <select
                  required
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  className="input-field mt-1"
                >
                  <option value="">Select a transaction</option>
                  {transactions.map(transaction => {
                    const buyer = buyers.find(b => b._id === transaction.buyerId) || transaction.buyerId
                    return (
                      <option key={transaction._id} value={transaction._id}>
                        {buyer.name || 'Unknown'} - ${transaction.totalAmount} - {transaction.deliveryStatus}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Buyer</label>
                <select
                  required
                  value={formData.buyerId}
                  onChange={(e) => setFormData({...formData, buyerId: e.target.value})}
                  className="input-field mt-1"
                >
                  <option value="">Select a buyer</option>
                  {buyers.map(buyer => (
                    <option key={buyer._id} value={buyer._id}>
                      {buyer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Person Name</label>
                <input
                  type="text"
                  required
                  value={formData.deliveryPersonName}
                  onChange={(e) => setFormData({...formData, deliveryPersonName: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter delivery person name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
                <input
                  type="text"
                  required
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData({...formData, deliveryLocation: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter delivery location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Status</label>
                <select
                  value={formData.deliveryStatus}
                  onChange={(e) => setFormData({...formData, deliveryStatus: e.target.value})}
                  className="input-field mt-1"
                >
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingDelivery ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 