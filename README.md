# FoodHub Admin Dashboard

Multi-channel SaaS platform for restaurants admin panel. Built with React + TypeScript + Vite + TailwindCSS.

## 🚀 Features

- **Real-time Order Management** - Live order tracking with WebSocket updates
- **Product & Menu Management** - Full CRUD operations with multi-language support
- **Analytics Dashboard** - Revenue, orders, and performance metrics
- **Role-based Access Control** - Admin, Manager, and Staff roles
- **Multi-channel Support** - Delivery, pickup, and dine-in orders
- **JWT Authentication** - Secure token-based authentication
- **Docker Ready** - Complete containerized development environment

## 🏗️ Architecture

```
src/
├── components/
│   ├── common/         # Button, Modal, Input, Card
│   ├── forms/          # ProductForm, OrderForm, MenuForm
│   └── layout/         # Header, Sidebar, Layout
├── pages/
│   ├── auth/           # Login, Register
│   ├── dashboard/      # Dashboard with analytics
│   ├── orders/         # Orders list, details, real-time
│   ├── products/       # Products CRUD with channels and languages
│   ├── menus/          # Menu management
│   └── settings/       # Restaurant settings
├── hooks/              # useAuth, useOrders, useProducts
├── services/           # API calls with axios
├── stores/             # React Query + Context
├── types/              # TypeScript types for API
└── utils/              # Helpers, formatting
```

## 🐳 Docker Setup

### Prerequisites
- Docker & Docker Compose
- External Docker network named `foodhub`

### Environment Variables
The application expects these environment variables (configured in docker-compose.yml):

```env
VITE_API_URL=http://nginx/api/v1     # Docker service name
VITE_WS_URL=http://soketi:6001       # WebSocket URL
VITE_APP_NAME=FoodHub Admin
```

### Quick Start

1. **Ensure external network exists:**
```bash
docker network create foodhub
```

2. **Build and start the application:**
```bash
docker-compose up --build
```

3. **Access the application:**
   - Admin Panel: http://localhost:3000
   - Hot reload enabled for development

### Demo Credentials
```
Admin:   admin@foodhub.com / admin123
Manager: manager@foodhub.com / manager123  
Staff:   staff@foodhub.com / staff123
```

## 🔧 API Integration

The app connects to the FoodHub API backend through Docker networking:

- **API Base URL:** `http://nginx/api/v1` (internal Docker network)
- **WebSocket:** `http://soketi:6001` for real-time features
- **Authentication:** JWT tokens stored in localStorage
- **Auto-retry:** Axios interceptors handle token refresh

### Real-time Features
- New order notifications
- Order status updates
- Kitchen updates
- Live dashboard metrics

## 📱 User Roles & Permissions

### Admin
- Full access to all features
- Restaurant settings management
- User management
- Complete analytics

### Manager  
- Order management
- Product & menu management
- Analytics dashboard
- Staff oversight

### Staff
- Order viewing and status updates
- Basic dashboard access
- Limited to operational tasks

## 🛠️ Development

### File Structure
```
foodhub-admin/
├── docker-compose.yml      # Docker services configuration
├── Dockerfile             # React app container
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration with proxies
├── tailwind.config.js     # TailwindCSS configuration
├── tsconfig.json          # TypeScript configuration
└── src/                   # React application source
```

### Key Technologies
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client with interceptors
- **Socket.io** - Real-time communication
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Docker Services
```yaml
services:
  admin:
    build: .
    ports:
      - "3000:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://nginx/api/v1
      - VITE_WS_URL=http://soketi:6001
      - VITE_APP_NAME=FoodHub Admin
    networks:
      - foodhub
```

## 🔄 Real-time Updates

WebSocket events handled by the application:

- `new_order` - New order received
- `order_status_changed` - Order status updated
- `kitchen_update` - Kitchen notifications
- `notification` - General system notifications

## 🎯 API Endpoints

The application consumes these API endpoints:

```
Auth:
POST /auth/login
POST /auth/logout
GET  /auth/profile

Orders:
GET    /orders
GET    /orders/:id
PATCH  /orders/:id/status
POST   /orders/:id/cancel

Products:
GET    /products
POST   /products
PUT    /products/:id
DELETE /products/:id

Dashboard:
GET /dashboard/stats
GET /dashboard/revenue
GET /dashboard/orders
```

## 🚀 Deployment

### Production Build
```bash
# Build production image
docker build -t foodhub-admin:latest .

# Run with production environment
docker run -p 3000:5173 \
  -e VITE_API_URL=https://api.foodhub.com/v1 \
  -e VITE_WS_URL=wss://ws.foodhub.com \
  foodhub-admin:latest
```

### Environment Configuration
Update environment variables in docker-compose.yml for different environments:

```yaml
environment:
  - VITE_API_URL=${API_URL:-http://nginx/api/v1}
  - VITE_WS_URL=${WS_URL:-http://soketi:6001}
  - VITE_APP_NAME=${APP_NAME:-FoodHub Admin}
```

## 📊 Features Overview

### Dashboard
- Real-time revenue metrics
- Order statistics
- Popular products
- Performance indicators

### Order Management
- Live order tracking
- Status updates
- Order details
- Customer information
- Real-time notifications

### Product Management
- Multi-language product names
- Category organization
- Channel availability
- Image uploads
- Bulk operations

### Menu Management
- Menu composition
- Category management
- Channel-specific menus
- Availability scheduling

## 🔒 Security

- JWT token authentication
- Role-based access control
- Automatic token refresh
- Secure API communication
- Input validation and sanitization

## 📞 Support

For development and deployment support:
- Check Docker logs: `docker-compose logs admin`
- Verify network connectivity: `docker network ls`
- Monitor API responses in browser DevTools
- WebSocket connection status in console

---

**Note:** This application requires the FoodHub API backend and WebSocket services to be running in the same Docker network.
