import { useState, useEffect } from 'react'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  TrendingUp, 
  DollarSign,
  Calendar,
  AlertCircle,
  Shield,
  UserCheck,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function RoleBasedDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalTomatoTypes: 0,
    totalTransactions: 0,
    totalDeliveries: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
    unpaidTransactions: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [systemHealthy, setSystemHealthy] = useState(true);
  const [growthData, setGrowthData] = useState({ labels: [], data: [] });
  const [activeUsersData, setActiveUsersData] = useState({ labels: [], data: [] });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      checkSystemHealth();
      calculateGrowth();
      calculateActiveUsers();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch all data in parallel
      const [buyersRes, tomatoTypesRes, transactionsRes, deliveriesRes] = await Promise.all([
        axios.get('/api/buyers'),
        axios.get('/api/tomato-types'),
        axios.get('/api/transactions'),
        axios.get('/api/deliveries')
      ])

      const transactions = transactionsRes.data
      const deliveries = deliveriesRes.data
      const buyers = buyersRes.data

      // Calculate stats
      const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
      const pendingDeliveries = deliveries.filter(d => d.deliveryStatus === 'pending').length
      const unpaidTransactions = transactions.filter(t => t.paymentStatus !== 'paid').length

      setStats({
        totalBuyers: buyers.length,
        totalTomatoTypes: tomatoTypesRes.data.length,
        totalTransactions: transactions.length,
        totalDeliveries: deliveries.length,
        totalRevenue,
        pendingDeliveries,
        unpaidTransactions
      })

      // Generate recent activity from real data
      const activity = generateRecentActivity(transactions, deliveries, buyers)
      setRecentActivity(activity)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setRefreshing(true)
      setError('')
      
      // Fetch all data in parallel
      const [buyersRes, tomatoTypesRes, transactionsRes, deliveriesRes] = await Promise.all([
        axios.get('/api/buyers'),
        axios.get('/api/tomato-types'),
        axios.get('/api/transactions'),
        axios.get('/api/deliveries')
      ])

      const transactions = transactionsRes.data
      const deliveries = deliveriesRes.data
      const buyers = buyersRes.data

      // Calculate stats
      const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
      const pendingDeliveries = deliveries.filter(d => d.deliveryStatus === 'pending').length
      const unpaidTransactions = transactions.filter(t => t.paymentStatus !== 'paid').length

      setStats({
        totalBuyers: buyers.length,
        totalTomatoTypes: tomatoTypesRes.data.length,
        totalTransactions: transactions.length,
        totalDeliveries: deliveries.length,
        totalRevenue,
        pendingDeliveries,
        unpaidTransactions
      })

      // Generate recent activity from real data
      const activity = generateRecentActivity(transactions, deliveries, buyers)
      setRecentActivity(activity)

    } catch (error) {
      console.error('Error refreshing dashboard data:', error)
      setError('Failed to refresh dashboard data. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const generateRecentActivity = (transactions, deliveries, buyers) => {
    const activity = []

    // Add recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
    
    recentTransactions.forEach(transaction => {
      const buyer = buyers.find(b => b._id === transaction.buyerId)
      const timeAgo = getTimeAgo(new Date(transaction.createdAt))
      
      activity.push({
        id: `transaction-${transaction._id}`,
        type: 'transaction',
        title: 'New sale completed',
        description: `${transaction.quantity} ${transaction.tomatoTypeId?.name || 'tomatoes'} sold to ${buyer?.name || 'customer'}`,
        timeAgo,
        icon: ShoppingCart,
        iconColor: 'bg-green-100',
        iconTextColor: 'text-green-600',
        timestamp: new Date(transaction.createdAt)
      })
    })

    // Add recent deliveries (last 3)
    const recentDeliveries = deliveries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
    
    recentDeliveries.forEach(delivery => {
      const buyer = buyers.find(b => b._id === delivery.buyerId)
      const timeAgo = getTimeAgo(new Date(delivery.createdAt))
      
      activity.push({
        id: `delivery-${delivery._id}`,
        type: 'delivery',
        title: delivery.deliveryStatus === 'delivered' ? 'Delivery completed' : 'Delivery status updated',
        description: delivery.deliveryStatus === 'delivered' 
          ? `Delivery to ${buyer?.name || 'customer'} completed`
          : `Delivery to ${delivery.deliveryLocation} is ${delivery.deliveryStatus}`,
        timeAgo,
        icon: Truck,
        iconColor: 'bg-purple-100',
        iconTextColor: 'text-purple-600',
        timestamp: new Date(delivery.createdAt)
      })
    })

    // Add recent buyers (last 3)
    const recentBuyers = buyers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
    
    recentBuyers.forEach(buyer => {
      const timeAgo = getTimeAgo(new Date(buyer.createdAt))
      
      activity.push({
        id: `buyer-${buyer._id}`,
        type: 'buyer',
        title: 'New customer added',
        description: `Customer ${buyer.name} registered`,
        timeAgo,
        icon: Users,
        iconColor: 'bg-blue-100',
        iconTextColor: 'text-blue-600',
        timestamp: new Date(buyer.createdAt)
      })
    })

    // Sort all activity by timestamp (most recent first) and take top 6
    return activity
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6)
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

  const checkSystemHealth = async () => {
    try {
      await Promise.all([
        axios.get('/api/buyers'),
        axios.get('/api/tomato-types'),
        axios.get('/api/transactions'),
        axios.get('/api/deliveries')
      ]);
      setSystemHealthy(true);
    } catch {
      setSystemHealthy(false);
    }
  };

  // Calculate growth rate (transactions per month for last 6 months)
  const calculateGrowth = async () => {
    try {
      const res = await axios.get('/api/transactions');
      const txs = res.data;
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return d.toLocaleString('default', { month: 'short', year: '2-digit' });
      });
      const txsByMonth = Array(6).fill(0);
      txs.forEach(tx => {
        const d = new Date(tx.createdAt);
        const idx = 5 - (new Date().getMonth() - d.getMonth() + 12 * (new Date().getFullYear() - d.getFullYear()));
        if (idx >= 0 && idx < 6) txsByMonth[idx]++;
      });
      setGrowthData({ labels: months, data: txsByMonth });
    } catch {}
  };

  // Calculate active vendors (logged in last 24h, fake for now)
  const calculateActiveUsers = async () => {
    try {
      const res = await axios.get('/api/auth/vendors');
      // For demo, count all vendors as active (replace with real logic if you track logins)
      setActiveUsersData({ labels: ['Active Vendors'], data: [res.data.length] });
    } catch {
      setActiveUsersData({ labels: ['Active Vendors'], data: [0] });
    }
  };

  const adminStats = [
    {
      name: 'Total Buyers',
      value: stats.totalBuyers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      description: 'Registered buyers in the system'
    },
    {
      name: 'Tomato Types',
      value: stats.totalTomatoTypes,
      icon: Package,
      color: 'bg-green-500',
      change: '+5%',
      description: 'Available tomato varieties'
    },
    {
      name: 'Total Transactions',
      value: stats.totalTransactions,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+23%',
      description: 'All sales transactions'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+18%',
      description: 'Total sales revenue'
    }
  ]

  const vendorStats = [
    {
      name: 'My Transactions',
      value: stats.totalTransactions,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+15%',
      description: 'Your sales transactions'
    },
    {
      name: 'My Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+22%',
      description: 'Your total earnings'
    },
    {
      name: 'Pending Deliveries',
      value: stats.pendingDeliveries,
      icon: Truck,
      color: 'bg-orange-500',
      change: '-8%',
      description: 'Deliveries to complete'
    },
    {
      name: 'Unpaid Orders',
      value: stats.unpaidTransactions,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '+5%',
      description: 'Orders awaiting payment'
    }
  ]

  const alertCards = [
    {
      name: 'Pending Deliveries',
      value: stats.pendingDeliveries,
      icon: Truck,
      color: 'bg-orange-500',
      description: 'Deliveries awaiting completion'
    },
    {
      name: 'Unpaid Transactions',
      value: stats.unpaidTransactions,
      icon: AlertCircle,
      color: 'bg-red-500',
      description: 'Transactions requiring payment'
    }
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">Please log in to view the dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'admin'
  const currentStats = isAdmin ? adminStats : vendorStats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Vendor Dashboard'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.name}! 
            {isAdmin ? ' Manage your tomato trading system.' : ' Track your sales and deliveries.'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <Shield className="h-6 w-6 text-blue-600" />
          ) : (
            <UserCheck className="h-6 w-6 text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-700 capitalize">
            {user.role}
          </span>
          <button
            onClick={refreshData}
            disabled={loading || refreshing}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Dashboard Stat Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/buyers" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">{stats.totalBuyers}</span>
            </div>
            <div className="mt-2 text-gray-600">Total Buyers</div>
            <div className="mt-1 text-xs text-blue-600">+12% from last month</div>
          </Link>
          <Link to="/tomato-types" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold">{stats.totalTomatoTypes}</span>
            </div>
            <div className="mt-2 text-gray-600">Tomato Types</div>
            <div className="mt-1 text-xs text-green-600">+5% from last month</div>
          </Link>
          <Link to="/transactions" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-8 w-8 text-purple-500" />
              <span className="text-3xl font-bold">{stats.totalTransactions}</span>
            </div>
            <div className="mt-2 text-gray-600">Total Transactions</div>
            <div className="mt-1 text-xs text-purple-600">+23% from last month</div>
          </Link>
          <Link to="/transactions" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-gray-600">Total Revenue</div>
            <div className="mt-1 text-xs text-yellow-600">+18% from last month</div>
          </Link>
          <Link to="/vendors" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-indigo-500" />
              <span className="text-3xl font-bold">Vendors</span>
            </div>
            <div className="mt-2 text-gray-600">All Vendors</div>
            <div className="mt-1 text-xs text-indigo-600">Monitor vendor activity</div>
          </Link>
        </div>
      )}

      {/* Role-specific Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/transactions" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center justify-between">
            <ShoppingCart className="h-8 w-8 text-blue-500" />
            <span className="text-3xl font-bold">{stats.totalTransactions}</span>
          </div>
          <div className="mt-2 text-gray-600">My Transactions</div>
          <div className="mt-1 text-xs text-green-600">+15% from last month</div>
        </Link>
        <Link to="/transactions" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center justify-between">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-gray-600">My Revenue</div>
          <div className="mt-1 text-xs text-green-600">+22% from last month</div>
        </Link>
        <Link to="/deliveries?status=pending" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center justify-between">
            <Truck className="h-8 w-8 text-yellow-500" />
            <span className="text-3xl font-bold">{stats.pendingDeliveries}</span>
          </div>
          <div className="mt-2 text-gray-600">Pending Deliveries</div>
          <div className="mt-1 text-xs text-red-600">-8% from last month</div>
        </Link>
        <Link to="/transactions?status=unpaid" className="card hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center justify-between">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="text-3xl font-bold">{stats.unpaidTransactions}</span>
          </div>
          <div className="mt-2 text-gray-600">Unpaid Orders</div>
          <div className="mt-1 text-xs text-orange-600">+5% from last month</div>
        </Link>
      </div>

      {/* Alerts Grid */}
      {/* REMOVE this block:
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {alertCards.map((alert) => (
          <div key={alert.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${alert.color}`}>
                <alert.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{alert.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{alert.value}</p>
                <p className="text-sm text-gray-500">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      */}

      {/* Role-specific Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isAdmin ? 'System Activity' : 'Recent Activity'}
        </h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activityItem) => (
              <div key={activityItem.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activityItem.iconColor}`}>
                    <activityItem.icon className={`h-4 w-4 ${activityItem.iconTextColor}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activityItem.title}</p>
                  <p className="text-sm text-gray-500">{activityItem.description}</p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {activityItem.timeAgo}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isAdmin ? 'Start by creating transactions, adding buyers, or managing deliveries.' : 'Your recent activity will appear here once you start making sales.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin-specific Analytics */}
      {isAdmin && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">System Health</p>
              <p className={`text-xs ${systemHealthy ? 'text-green-600' : 'text-red-600'}`}>{systemHealthy ? 'All systems operational' : 'Some systems down'}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Growth Rate</p>
              <div className="h-24"><Bar data={{
                labels: growthData.labels,
                datasets: [{
                  label: 'Transactions',
                  data: growthData.data,
                  backgroundColor: 'rgba(16, 185, 129, 0.5)'
                }]
              }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Active Users</p>
              <div className="h-24"><Line data={{
                labels: activeUsersData.labels,
                datasets: [{
                  label: 'Vendors Online',
                  data: activeUsersData.data,
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)'
                }]
              }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 