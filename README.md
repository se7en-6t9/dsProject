# MiniGitHub - Full-Stack File Management Application

A complete, production-ready web application for managing files and folders with real-time editing capabilities.

**Live Demo:** [Coming Soon]

## Features

✨ **Core Features**
- 👤 User authentication (sign up, login, logout)
- 📁 Create, read, update, delete files and folders
- ✏️ Real-time file editing
- 🔒 Secure JWT-based authentication
- 💾 Automatic file saving
- 🎨 Modern dark-themed UI
- 📱 Responsive design

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling (dark theme)

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database & storage
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## Project Structure

```
MiniGitHub/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── db.js              # Supabase client
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT & security middleware
│   │   │   └── errorHandler.js # Error handling
│   │   └── routes/
│   │       ├── auth.js        # Authentication routes
│   │       └── workspace.js   # File/folder routes
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main app with routing
│   │   ├── App.css            # Global styles
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Signup.jsx     # Sign up page
│   │   │   └── Dashboard.jsx  # Main dashboard
│   │   ├── components/
│   │   │   ├── FileTree.jsx   # File tree component
│   │   │   ├── FileTree.css   # File tree styles
│   │   │   ├── Editor.jsx     # Code editor
│   │   │   └── Editor.css     # Editor styles
│   │   └── services/
│   │       └── api.js         # API client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/MiniGitHub.git
cd MiniGitHub
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Configure .env:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**Create Supabase Tables:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
  parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id)
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_parent_id ON files(parent_id);
```

**Create Storage Bucket:**
- In Supabase Storage: Create bucket `workspace-files` (set to private)

**Start Backend:**
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

**Configure .env:**
```env
VITE_API_URL=http://localhost:5000
```

**Start Frontend:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access Application

Open `http://localhost:5173` in your browser

**Test Account:**
- Email: `test@example.com`
- Password: `password123`

## API Documentation

### Authentication Endpoints

#### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
Returns: `{ token, user }`

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

### Workspace Endpoints

#### Get All Files
```bash
GET /api/workspace
Authorization: Bearer {token}
```

#### Get File Details
```bash
GET /api/workspace/{fileId}
Authorization: Bearer {token}
```

#### Create File
```bash
POST /api/workspace/file
Content-Type: multipart/form-data
Authorization: Bearer {token}

name: "script.js"
parentId: "folder-uuid" (optional)
language: "javascript" (optional)
file: <binary data> (optional)
```

#### Create Folder
```bash
POST /api/workspace/folder
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "src",
  "parentId": "parent-uuid" (optional)
}
```

#### Update File
```bash
PUT /api/workspace/{fileId}
Content-Type: multipart/form-data
Authorization: Bearer {token}

name: "new-name.js" (optional)
content: "file content" (optional)
file: <binary data> (optional)
```

#### Delete File/Folder
```bash
DELETE /api/workspace/{fileId}
Authorization: Bearer {token}
```

## Deployment

### Backend Deployment (Render/Railway)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **On Render/Railway Dashboard:**
   - Create new Web Service
   - Connect GitHub repository
   - Set environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `JWT_SECRET`
     - `FRONTEND_URL=https://your-frontend-url.com`
   - Deploy

3. Record backend URL (e.g., `https://minigithub-api.onrender.com`)

### Frontend Deployment (Vercel)

1. **On Vercel Dashboard:**
   - Create new project
   - Connect GitHub repository
   - Set environment variables:
     - `VITE_API_URL=https://your-backend-url.com`
   - Deploy

### Alternative: Deploy to Netlify

```bash
# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Environment Variables Reference

### Backend (.env)
| Variable | Required | Default | Example |
|---|---|---|---|
| PORT | No | 5000 | 5000 |
| NODE_ENV | No | development | production |
| SUPABASE_URL | Yes | - | https://project.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | Yes | - | key_xxx |
| JWT_SECRET | Yes | - | super_secret_key |
| JWT_EXPIRE | No | 7d | 7d |
| FRONTEND_URL | Yes | - | http://localhost:5173 |
| MAX_FILE_SIZE | No | 5242880 | 5242880 |

### Frontend (.env)
| Variable | Required | Default | Example |
|---|---|---|---|
| VITE_API_URL | Yes | - | http://localhost:5000 |
| VITE_API_BASE_PATH | No | /api | /api |
| VITE_APP_NAME | No | MiniGitHub | MiniGitHub |

## Security Features

✅ Password hashing with bcrypt
✅ JWT-based authentication with expiration
✅ CORS protection
✅ Rate limiting
✅ Security headers (X-Frame-Options, CSP, etc.)
✅ File name sanitization
✅ File size limits (5MB default)
✅ User data isolation
✅ Input validation
✅ Error handling without exposing sensitive info
✅ Service role key never exposed to frontend

## Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Development server with auto-reload
npm start        # Production server
npm test         # Run tests (configure these!)
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in .env or kill process
kill -9 $(lsof -t -i:5000)
```

**Supabase connection error:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active
- Ensure tables exist with correct schema

### Frontend Issues

**CORS errors:**
- Ensure backend is running
- Check `VITE_API_URL` matches backend URL
- Verify `FRONTEND_URL` in backend .env

**Login not working:**
- Check backend API is accessible
- Verify Supabase tables and users exist
- Check browser console for error details

**Files not saving:**
- Verify Supabase Storage bucket exists
- Check file size doesn't exceed limit
- Ensure user is authenticated

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading routes
- CSS minification
- Image optimization

### Backend
- Database indexing on frequently queried fields
- Rate limiting to prevent abuse
- Request payload size limits
- Connection pooling

## Future Enhancements

- [ ] Collaborative editing (real-time sync)
- [ ] Syntax highlighting with Prism.js
- [ ] File preview (images, code)
- [ ] Search functionality
- [ ] File sharing and permissions
- [ ] Git integration
- [ ] Dark/Light theme toggle
- [ ] Code snippets library
- [ ] File versioning/history
- [ ] Mobile app (React Native)

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- 🐛 [GitHub Issues](https://github.com/yourusername/MiniGitHub/issues)
- 💬 [Discussions](https://github.com/yourusername/MiniGitHub/discussions)

## Authors

- Created with ❤️ for developers

## Acknowledgments

- [Supabase](https://supabase.io) - Database & auth
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI library
- [Express](https://expressjs.com) - Web framework

---

**Made with ❤️ | Star this repo if you find it helpful!**
