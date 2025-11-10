#!/bin/bash

# Migration Script: Root Frontend Structure to Organized Structure
# This script helps migrate from root-level frontend to meditatva-frontend/ structure

echo "🚀 Starting project structure migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create backup directory
echo "📦 Creating backup..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy important files to backup
cp -r src/ "$BACKUP_DIR/" 2>/dev/null || echo "No src/ directory found"
cp package.json "$BACKUP_DIR/" 2>/dev/null
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null
cp tailwind.config.ts "$BACKUP_DIR/" 2>/dev/null
cp vite.config.ts "$BACKUP_DIR/" 2>/dev/null
cp components.json "$BACKUP_DIR/" 2>/dev/null

echo "✅ Backup created at: $BACKUP_DIR"

# Check if meditatva-frontend already exists
if [ -d "meditatva-frontend" ]; then
    echo "⚠️  meditatva-frontend directory already exists. Skipping frontend migration."
else
    echo "📁 Creating meditatva-frontend directory..."
    mkdir -p meditatva-frontend
    
    # Move frontend files
    echo "📋 Moving frontend files..."
    
    # Move directories
    [ -d "src" ] && mv src meditatva-frontend/
    [ -d "public" ] && mv public meditatva-frontend/
    [ -d "supabase" ] && mv supabase meditatva-frontend/
    
    # Move configuration files
    [ -f "package.json" ] && mv package.json meditatva-frontend/
    [ -f "package-lock.json" ] && mv package-lock.json meditatva-frontend/
    [ -f "pnpm-lock.yaml" ] && mv pnpm-lock.yaml meditatva-frontend/
    [ -f "bun.lockb" ] && mv bun.lockb meditatva-frontend/
    [ -f "tailwind.config.ts" ] && mv tailwind.config.ts meditatva-frontend/
    [ -f "vite.config.ts" ] && mv vite.config.ts meditatva-frontend/
    [ -f "components.json" ] && mv components.json meditatva-frontend/
    [ -f "postcss.config.js" ] && mv postcss.config.js meditatva-frontend/
    [ -f "eslint.config.js" ] && mv eslint.config.js meditatva-frontend/
    [ -f "index.html" ] && mv index.html meditatva-frontend/
    [ -f "tsconfig.json" ] && mv tsconfig.json meditatva-frontend/
    [ -f "tsconfig.app.json" ] && mv tsconfig.app.json meditatva-frontend/
    [ -f "tsconfig.node.json" ] && mv tsconfig.node.json meditatva-frontend/
    
    echo "✅ Frontend files moved to meditatva-frontend/"
fi

# Check if meditatva-backend already exists
if [ -d "meditatva-backend" ]; then
    echo "⚠️  meditatva-backend directory already exists. Skipping backend creation."
else
    echo "📁 Creating meditatva-backend structure..."
    mkdir -p meditatva-backend/{src,config,routes,controllers,middleware,models,services,utils}
    
    # Create basic backend package.json
    cat > meditatva-backend/package.json << 'EOF'
{
  "name": "meditatva-backend",
  "version": "1.0.0",
  "description": "Backend for Meditatva Connect AI",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["meditation", "ai", "health", "backend"],
  "author": "",
  "license": "ISC"
}
EOF
    
    # Create basic app.js
    cat > meditatva-backend/src/app.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Meditatva Backend API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF
    
    # Create basic .env
    cat > meditatva-backend/.env << 'EOF'
PORT=5000
NODE_ENV=development
# Add your environment variables here
EOF
    
    echo "✅ Backend structure created"
fi

# Create root package.json for workspace management
echo "📦 Creating workspace package.json..."
cat > package.json << 'EOF'
{
  "name": "meditatva-connect-ai",
  "version": "1.0.0",
  "description": "AI-powered meditation and wellness platform",
  "scripts": {
    "dev:frontend": "cd meditatva-frontend && npm run dev",
    "dev:backend": "cd meditatva-backend && npm run dev",
    "install:frontend": "cd meditatva-frontend && npm install",
    "install:backend": "cd meditatva-backend && npm install",
    "install:all": "npm run install:frontend && npm run install:backend",
    "build:frontend": "cd meditatva-frontend && npm run build",
    "start:frontend": "cd meditatva-frontend && npm run preview",
    "start:backend": "cd meditatva-backend && npm start"
  },
  "workspaces": [
    "meditatva-frontend",
    "meditatva-backend"
  ],
  "keywords": ["meditation", "ai", "health", "wellness"],
  "author": "",
  "license": "ISC"
}
EOF

echo "✅ Workspace package.json created"

# Update .gitignore if it exists
if [ -f ".gitignore" ]; then
    echo "📝 Updating .gitignore..."
    cat >> .gitignore << 'EOF'

# Backup directories
backup-*

# Environment variables
meditatva-frontend/.env
meditatva-backend/.env

# Dependencies
meditatva-frontend/node_modules/
meditatva-backend/node_modules/

# Build outputs
meditatva-frontend/dist/
meditatva-backend/dist/
EOF
fi

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Install dependencies:"
echo "   cd meditatva-frontend && npm install"
echo "   cd ../meditatva-backend && npm install"
echo ""
echo "2. Start development:"
echo "   # Frontend"
echo "   cd meditatva-frontend && npm run dev"
echo ""
echo "   # Backend (in another terminal)"
echo "   cd meditatva-backend && npm run dev"
echo ""
echo "3. Or use workspace commands from root:"
echo "   npm run install:all"
echo "   npm run dev:frontend"
echo "   npm run dev:backend"
echo ""
echo "📁 Backup available at: $BACKUP_DIR"
echo "📖 See MIGRATION_GUIDE.md for detailed information"