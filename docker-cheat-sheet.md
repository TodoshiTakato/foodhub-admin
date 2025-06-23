# 🐳 Docker Commands Cheat Sheet - FoodHub Admin

## Node.js (React/TypeScript Admin Panel):
```bash
# FoodHub Admin (React + TypeScript + Vite)
docker exec -it foodhub-admin /bin/sh
```

## 📋 Quick Reference:

### Node.js Container → `/bin/sh` ✅
```bash
# FoodHub Admin Web Interface
docker exec -it foodhub-admin /bin/sh
```

---

## 🚀 Development Commands:

### Basic Operations:
```bash
# Start admin panel
docker-compose up -d admin

# Stop admin panel
docker-compose down

# Restart admin panel
docker-compose restart admin

# View logs (with follow)
docker-compose logs -f admin

# Rebuild and start
docker-compose up --build -d admin
```

### Dependencies Management:
```bash
# Install new package
docker-compose exec admin npm install package-name

# Update dependencies
docker-compose exec admin npm update

# Check for vulnerabilities
docker-compose exec admin npm audit

# Fix vulnerabilities
docker-compose exec admin npm audit fix
```

### Development & Debugging:
```bash
# Connect to container for debugging
docker exec -it foodhub-admin /bin/sh

# Run linter
docker-compose exec admin npm run lint

# Production build
docker-compose exec admin npm run build

# Preview production build
docker-compose exec admin npm run preview
```

### File Operations:
```bash
# Copy file to container
docker cp local-file.txt foodhub-admin:/home/node/app/

# Copy file from container
docker cp foodhub-admin:/home/node/app/dist ./local-dist

# View file structure in container
docker exec foodhub-admin find /home/node/app -type f -name "*.json"
```

### Monitoring:
```bash
# Resource usage statistics
docker stats foodhub-admin

# Container information
docker inspect foodhub-admin

# Check ports
docker port foodhub-admin
```

## 🌐 Application Access:
- **Admin Panel**: http://localhost:3000
- **Backend API**: http://localhost/api/v1  
- **WebSocket**: http://localhost:6001

## 🔑 Demo Credentials:
- **Super Admin**: admin@foodhub.com / admin123
- **Restaurant Owner**: owner@pizzapalace.com / owner123
- **Manager**: manager@foodhub.com / manager123
- **Staff**: staff@foodhub.com / staff123

---

**Great question! Always better to check reality than make assumptions. Now you have precise commands for each container.** 