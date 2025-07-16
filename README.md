# Muthurwa App

A fullstack web application for managing tomato sales, buyers, vendors, and deliveries. Built with React (Vite) frontend and Express/MongoDB backend.

---

## Features
- User authentication (admin & vendor roles)
- Manage buyers, tomato types, transactions, and deliveries
- Role-based dashboards
- Modern UI with Tailwind CSS
- RESTful API with JWT authentication

---

## Project Structure

```
root/
  backend/      # Express + MongoDB API
  frontend/     # React (Vite) client
```

---

## Local Development

### 1. Clone the repository
```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Backend Setup
```sh
cd backend
npm install
# Create .env file (see below)
npm run dev
```

#### backend/.env example
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
# Create .env file (see below)
npm run dev
```

#### frontend/.env example (for local dev)
```
VITE_API_URL=http://localhost:5000
```

---

## Deployment

### Backend (Render)
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create a new Web Service.
3. Connect your repo, set root to `/backend`.
4. Add environment variables from your `.env` file.
5. Set start command: `npm start` or `node server.js`.
6. Deploy and note your backend URL (e.g., `https://your-backend.onrender.com`).

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your repo.
2. Set root to `/frontend` if prompted.
3. In Vercel dashboard, add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy.

---

## CORS Configuration (Backend)
In `backend/server.js`:
```js
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Security & Best Practices
- Never commit `.env` files or secrets to GitHub.
- Use strong secrets for JWT and database.
- Restrict CORS in production.
- Remove test/seed data before going live.

---

## License
MIT 