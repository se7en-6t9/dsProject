# MiniGitHub Backend

Express.js backend API for MiniGitHub, a lightweight file management system.

## Features

- User authentication with JWT
- File and folder management
- Supabase database integration
- File storage with Supabase Storage
- CORS enabled
- Rate limiting
- Security headers
- Error handling

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account with project setup

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_super_secret_key_change_this
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Supabase Database

Create these tables in your Supabase project:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Files Table
```sql
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

### 4. Create Storage Bucket

In Supabase Storage, create a bucket named `workspace-files` and set it to **private**.

### 5. Enable RLS (Row Level Security)

For the `files` table, enable RLS and add policy:

```sql
CREATE POLICY "Users can manage their own files"
ON files
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Running the Server

### Development Mode
```bash
npm run dev
```

The server will watch for file changes and auto-reload.

### Production Mode
```bash
npm start
```

Server runs on `http://localhost:5000` (or your specified PORT)

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Workspace

- `GET /api/workspace` - Get all files/folders (requires auth)
- `GET /api/workspace/:id` - Get specific file/folder (requires auth)
- `POST /api/workspace/file` - Create file (requires auth)
- `POST /api/workspace/folder` - Create folder (requires auth)
- `PUT /api/workspace/:id` - Update file/folder (requires auth)
- `DELETE /api/workspace/:id` - Delete file/folder (requires auth)

## Request Examples

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Folder
```bash
curl -X POST http://localhost:5000/api/workspace/folder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "my-project"
  }'
```

### Create File
```bash
curl -X POST http://localhost:5000/api/workspace/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=script.js" \
  -F "file=@path/to/file.js"
```

### Get All Files
```bash
curl -X GET http://localhost:5000/api/workspace \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development / production |
| SUPABASE_URL | Supabase project URL | https://project.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | key_xxx |
| JWT_SECRET | JWT signing secret | your_secret_key |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| MAX_FILE_SIZE | Max file size in bytes | 5242880 |

## Deployment

### Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Deploy

### Railway

1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Vercel/Other Platforms

Similar process - set up CI/CD, configure environment variables, deploy.

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production frontend URL
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting appropriately
- [ ] Review CORS settings
- [ ] Set up database backups
- [ ] Enable database encryption
- [ ] Monitor error logs

## Security

- Passwords are hashed with bcrypt
- JWTs expire after 7 days
- Service role key never exposed to frontend
- CORS restricted to frontend URL
- File names sanitized
- File size limits enforced
- Rate limiting enabled

## Troubleshooting

### Connection issues
- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure CORS_ORIGIN matches your frontend URL

### Authentication errors
- Ensure `JWT_SECRET` is set
- Check token expiration
- Verify user exists in database

### File upload errors
- Check file size doesn't exceed limit
- Verify Supabase Storage bucket exists and is private
- Check user permissions

## License

MIT
