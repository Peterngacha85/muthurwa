import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  User,
  Package,
  Loader2,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

export default function Transactions() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const statusFilter = queryParams.get('status')
  const [transactions, setTransactions] = useState([])
  const [buyers, setBuyers] = useState([])
  const [tomatoTypes, setTomatoTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    buyerId: '',
    tomatoTypeId: '',
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    paidAmount: '',
    paymentStatus: 'unpaid',
    deliveryStatus: 'pending',
    deliveryDate: '',
    dueDate: '',
    deliveryLocation: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsRes, buyersRes, tomatoTypesRes] = await Promise.all([
        axios.get('/api/transactions'),
        axios.get('/api/buyers'),
        axios.get('/api/tomato-types')
      ])
      
      setTransactions(transactionsRes.data)
      setBuyers(buyersRes.data)
      setTomatoTypes(tomatoTypesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount)
      }
      
      if (editingTransaction) {
        await axios.put(`/api/transactions/${editingTransaction._id}`, submitData)
      } else {
        await axios.post('/api/transactions', submitData)
      }
      fetchData()
      handleCloseModal()
    } catch (error) {
      setFormError(error.response?.data?.msg || 'Failed to save transaction')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      buyerId: transaction.buyerId._id || transaction.buyerId,
      tomatoTypeId: transaction.tomatoTypeId._id || transaction.tomatoTypeId,
      quantity: transaction.quantity.toString(),
      unitPrice: transaction.unitPrice.toString(),
      totalAmount: transaction.totalAmount.toString(),
      paidAmount: transaction.paidAmount.toString(),
      paymentStatus: transaction.paymentStatus,
      deliveryStatus: transaction.deliveryStatus,
      deliveryDate: transaction.deliveryDate ? new Date(transaction.deliveryDate).toISOString().split('T')[0] : '',
      dueDate: transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '',
      deliveryLocation: transaction.deliveryLocation || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
    setFormData({
      buyerId: '',
      tomatoTypeId: '',
      quantity: '',
      unitPrice: '',
      totalAmount: '',
      paidAmount: '',
      paymentStatus: 'unpaid',
      deliveryStatus: 'pending',
      deliveryDate: '',
      dueDate: '',
      deliveryLocation: ''
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'unpaid':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const buyerObj = buyers.find(b => b._id === transaction.buyerId)
    const tomatoTypeObj = tomatoTypes.find(t => t._id === transaction.tomatoTypeId)
    const matchesSearch = (
      (buyerObj && buyerObj.name && buyerObj.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tomatoTypeObj && tomatoTypeObj.name && tomatoTypeObj.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.totalAmount.toString().includes(searchTerm)
    )
    if (statusFilter === 'unpaid') {
      return matchesSearch && transaction.paymentStatus !== 'paid'
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your tomato sales and transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Transaction
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tomato Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                return (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.buyerId?.name || 'Unknown Buyer'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {transaction.tomatoTypeId?.name || 'Unknown Type'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity} {transaction.tomatoTypeId?.unit || 'units'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.paymentStatus)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.paymentStatus)}`}>
                          {transaction.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.deliveryStatus === 'delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new transaction.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">{formError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700">Tomato Type</label>
                  <select
                    required
                    value={formData.tomatoTypeId}
                    onChange={(e) => setFormData({...formData, tomatoTypeId: e.target.value})}
                    className="input-field mt-1"
                  >
                    <option value="">Select tomato type</option>
                    {tomatoTypes.map(type => (
                      <option key={type._id} value={type._id}>
                        {type.name} - ${type.defaultPrice}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="input-field mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="input-field mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                    className="input-field mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                    className="input-field mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                    className="input-field mt-1"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    className="input-field mt-1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="input-field mt-1"
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
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : (editingTransaction ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 