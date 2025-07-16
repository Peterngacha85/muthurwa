import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
        alt="Welcome Tomato"
        className="w-48 h-48 mb-8 rounded-full shadow-lg object-cover"
      />
      <h1 className="text-4xl font-bold mb-4 text-green-800">Welcome to Muthurwa Market!</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        Manage your tomato sales, buyers, vendors, and deliveries with ease.<br/>
        Join the digital marketplace for a smarter, faster, and more organized business.
      </p>
      <Link
        to="/login"
        className="px-8 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
      >
        Get Started
      </Link>
    </div>
  );
} 