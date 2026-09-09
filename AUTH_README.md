# Quantum Learning Platform - Authentication Setup

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

The server will run on http://localhost:3000

3. Open `index.html` in your browser or serve it with:
```bash
npx http-server -p 8080
```

## Authentication Features

### User Registration & Login
- Secure password hashing with bcrypt
- JWT token-based authentication
- Session persistence with localStorage
- 7-day token expiration

### User Progress Tracking
- Automatic progress saving every 30 seconds
- Circuit state persistence
- Challenge completion tracking
- Lecture viewing history

### Database Schema
The system uses SQLite with two tables:
- **users**: Stores username, email, hashed password
- **user_progress**: Stores circuit data, challenges completed, lectures viewed

## Usage

1. Click "🔐 Login" in the header
2. Create a new account or login with existing credentials
3. Your progress will be automatically saved
4. User info displayed in header when logged in
5. Click "Logout" to end session

## API Endpoints

- `POST /api/register` - Create new user account
- `POST /api/login` - Login existing user
- `GET /api/profile` - Get user profile (protected)
- `POST /api/progress` - Save user progress (protected)
- `GET /api/progress` - Load user progress (protected)
- `GET /api/verify` - Verify JWT token (protected)

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- CORS enabled for cross-origin requests
- Database stored locally (quantum-learning.db)
- SQL injection protection with prepared statements

## Environment Variables

Optional `.env` file:
```
PORT=3000
JWT_SECRET=your-secret-key-here
```

If not set, defaults are used (change JWT_SECRET in production!).
