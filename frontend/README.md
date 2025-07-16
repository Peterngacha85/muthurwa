# Muthurwa Frontend

A modern React.js frontend for the Muthurwa Tomato Trading Management System.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- 🔐 **Authentication** - Secure login system with JWT tokens
- 📊 **Dashboard** - Comprehensive overview with statistics and recent activity
- 👥 **Buyer Management** - Add, edit, and manage tomato buyers
- 🍅 **Tomato Types** - Manage different tomato varieties and pricing
- 💰 **Transaction Management** - Track sales, payments, and delivery status
- 🚚 **Delivery Tracking** - Monitor delivery status and assign delivery personnel
- 🔍 **Search & Filter** - Find records quickly with search functionality
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Headless UI** - Accessible UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx      # Main layout with navigation
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Dashboard.jsx   # Dashboard with statistics
│   ├── Buyers.jsx      # Buyer management
│   ├── TomatoTypes.jsx # Tomato type management
│   ├── Transactions.jsx # Transaction management
│   └── Deliveries.jsx  # Delivery tracking
├── App.jsx             # Main app component with routing
├── main.jsx           # React entry point
└── index.css          # Global styles and Tailwind imports
```

## API Integration

The frontend communicates with your backend API through the following endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/me`
- **Buyers**: `/api/buyers`
- **Tomato Types**: `/api/tomato-types`
- **Transactions**: `/api/transactions`
- **Deliveries**: `/api/deliveries`

The API proxy is configured in `vite.config.js` to forward requests from `/api` to `http://localhost:5000`.

## Features Overview

### Dashboard
- Real-time statistics (total buyers, tomato types, transactions, revenue)
- Pending deliveries and unpaid transactions alerts
- Recent activity feed

### Buyer Management
- Add new buyers with contact information
- Edit existing buyer details
- Search and filter buyers
- Delete buyers (with confirmation)

### Tomato Types
- Manage different tomato varieties
- Set default pricing per unit
- Add descriptions and specifications
- Search and filter tomato types

### Transactions
- Create new sales transactions
- Link buyers and tomato types
- Track payment status (paid, partial, unpaid)
- Monitor delivery status
- Set delivery and due dates

### Deliveries
- Assign delivery personnel
- Track delivery locations
- Update delivery status
- Link to transactions

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`. The primary color is currently set to red tones, but you can change it to match your brand.

### Styling
Global styles and component classes are defined in `src/index.css`. You can modify the design system there.

## Troubleshooting

### Common Issues

1. **API Connection Error**: Make sure your backend server is running on port 5000
2. **Build Errors**: Clear node_modules and reinstall dependencies
3. **Styling Issues**: Ensure Tailwind CSS is properly configured

### Development Tips

- Use the browser's developer tools to debug API calls
- Check the console for any JavaScript errors
- Use React Developer Tools for component debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Muthurwa Tomato Trading System. 