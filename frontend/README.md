# MiniGitHub Frontend

React + Vite frontend for MiniGitHub file management application.

## Features

- User authentication (login/signup)
- File and folder management
- Real-time file editor
- Responsive design (dark theme)
- Token-based authentication
- Protected routes

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your backend API URL:

```env
VITE_API_URL=http://localhost:5000
VITE_API_BASE_PATH=/api
```

For production, update to your deployed backend URL:
```env
VITE_API_URL=https://your-backend-url.com
```

### 3. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── main.jsx           # Entry point
├── App.jsx            # Main app component with routing
├── App.css            # Global styles
├── pages/
│   ├── Login.jsx      # Login page
│   ├── Signup.jsx     # Signup page
│   └── Dashboard.jsx  # Main dashboard
├── components/
│   ├── FileTree.jsx   # File tree component
│   ├── FileTree.css   # File tree styles
│   ├── Editor.jsx     # Code editor component
│   └── Editor.css     # Editor styles
└── services/
    └── api.js         # API client setup
```

## Features Explained

### Authentication
- Login/Signup with email and password
- JWT token stored in localStorage
- Automatic token inclusion in API requests
- Auto-redirect on token expiration

### File Management
- Create files and folders
- Rename files/folders
- Delete files (folders must be empty)
- Edit file content
- View file metadata (language, updated time, etc.)

### File Tree Navigation
- Expandable/collapsible folder structure
- File icons based on file type
- Quick actions (delete, create subfiles)
- Visual indication of selected file

### Code Editor
- Simple textarea-based editor
- Keyboard shortcut: Ctrl+S to save
- Show unsaved changes indicator
- Display file statistics

## API Integration

All API calls go through `services/api.js` using axios:

- Automatic token attachment to requests
- 401 responses trigger logout and redirect
- Error handling and user feedback

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Create new project on Vercel
3. Connect GitHub repository
4. Set environment variable: `VITE_API_URL`
5. Deploy

### Netlify

1. Push code to GitHub
2. Create new site on Netlify
3. Connect GitHub repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Set environment variable: `VITE_API_URL`
7. Deploy

### Other Hosting

Build the project and deploy the `dist/` folder to your hosting provider.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| VITE_API_URL | Backend API URL | http://localhost:5000 |
| VITE_API_BASE_PATH | API base path | /api |
| VITE_APP_NAME | App name | MiniGitHub |

## Security

- Token stored in localStorage (consider httpOnly cookies for production)
- API requests include Authorization header with JWT
- Invalid/expired tokens trigger automatic logout
- CORS handled by backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ES6+ JavaScript support

## Troubleshooting

### CORS errors
- Ensure backend is running
- Check `VITE_API_URL` matches backend URL
- Backend must have proper CORS configuration

### Login/Signup errors
- Check email format
- Password must be 8+ characters
- Backend server must be running

### File not loading
- Ensure token is valid
- Check browser console for errors
- Verify backend API is accessible

## Development Tips

### Useful Shortcuts
- `Ctrl/Cmd + S`: Save file in editor
- `Ctrl/Cmd + K`: Quick search (Future feature)

### Debug Mode
Open browser DevTools (F12) to:
- View network requests
- Check localStorage (token, user)
- Monitor console errors

## License

MIT
