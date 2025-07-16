import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  DollarSign,
  Loader2,
  X
} from 'lucide-react'
import axios from 'axios'

export default function TomatoTypes() {
  const [tomatoTypes, setTomatoTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    unit: '',
    description: '',
    defaultPrice: ''
  })

  useEffect(() => {
    fetchTomatoTypes()
  }, [])

  const fetchTomatoTypes = async () => {
    try {
      const response = await axios.get('/api/tomato-types')
      setTomatoTypes(response.data)
    } catch (error) {
      console.error('Error fetching tomato types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        defaultPrice: parseFloat(formData.defaultPrice)
      }
      
      if (editingType) {
        await axios.put(`/api/tomato-types/${editingType._id}`, submitData)
      } else {
        await axios.post('/api/tomato-types', submitData)
      }
      fetchTomatoTypes()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving tomato type:', error)
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      variety: type.variety,
      unit: type.unit,
      description: type.description || '',
      defaultPrice: type.defaultPrice.toString()
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tomato type?')) {
      try {
        await axios.delete(`/api/tomato-types/${id}`)
        fetchTomatoTypes()
      } catch (error) {
        console.error('Error deleting tomato type:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingType(null)
    setFormData({
      name: '',
      variety: '',
      unit: '',
      description: '',
      defaultPrice: ''
    })
  }

  const filteredTypes = tomatoTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.variety.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Tomato Types</h1>
          <p className="text-gray-600">Manage your tomato varieties and pricing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Tomato Type
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tomato types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Tomato Types Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((type) => (
          <div key={type._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Variety:</span> {type.variety}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Unit:</span> {type.unit}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">Price:</span> ${type.defaultPrice}
                  </div>
                  {type.description && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Description:</span> {type.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(type)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(type._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tomato types found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new tomato type.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingType ? 'Edit Tomato Type' : 'Add New Tomato Type'}
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
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field mt-1"
                  placeholder="e.g., Roma Tomatoes"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Variety</label>
                <input
                  type="text"
                  required
                  value={formData.variety}
                  onChange={(e) => setFormData({...formData, variety: e.target.value})}
                  className="input-field mt-1"
                  placeholder="e.g., Roma, Cherry, Beefsteak"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="input-field mt-1"
                  placeholder="e.g., kg, box, piece"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.defaultPrice}
                  onChange={(e) => setFormData({...formData, defaultPrice: e.target.value})}
                  className="input-field mt-1"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field mt-1"
                  rows="3"
                  placeholder="Optional description..."
                />
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
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 