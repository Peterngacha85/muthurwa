import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Buyers from './pages/Buyers'
import TomatoTypes from './pages/TomatoTypes'
import Transactions from './pages/Transactions'
import Deliveries from './pages/Deliveries'
import Vendors from './pages/Vendors'
import VendorDetail from './pages/VendorDetail'
import Layout from './components/Layout'
import Welcome from './pages/Welcome';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex items-center justify-center h-screen"><span>Loading...</span></div>
  }
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="buyers" element={<Buyers />} />
              <Route path="tomato-types" element={<TomatoTypes />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/:id" element={<VendorDetail />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 