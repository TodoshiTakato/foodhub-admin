#!/bin/bash

echo "🚀 Committing FoodHub Admin Dashboard changes..."

# Admin Panel (foodhub-admin)
echo "📱 Committing Admin Panel changes..."
cd /home/ns/domains/foodhub-admin

git add .
git commit -m "feat: Real-time Dashboard with React Query auto-refresh

✨ Features:
- Restored refetchOnWindowFocus for better UX
- Created useDashboard hook with React Query
- Updated Dashboard page to use real API data
- Added loading states and error handling
- Dashboard auto-refreshes every 30 seconds

🛠️ Technical:
- React Query with optimized refresh intervals
- Real-time data fetching from mock APIs
- Proper error handling and loading indicators
- TypeScript hooks for dashboard analytics"

echo "✅ Admin Panel committed!"

# Backend API (foodhub)
echo "🔧 Committing Backend API changes..."
cd /home/ns/domains/foodhub

git add .
git commit -m "feat: Dashboard API endpoints with mock data

✨ Features:
- DashboardController with 4 mock endpoints
- /dashboard/stats - Dashboard statistics
- /dashboard/revenue - Revenue analytics
- /dashboard/orders - Order analytics
- /dashboard/top-products - Top selling products

🛠️ Technical:
- JWT authentication required
- Dynamic random mock data generation
- CORS-enabled for admin panel
- Consistent API response format
- Added dashboard routes to apiV1.php"

echo "✅ Backend API committed!"

echo "🎉 All changes committed successfully!"
echo ""
echo "📋 Summary:"
echo "- Admin Panel: Real-time dashboard with auto-refresh"
echo "- Backend API: Mock dashboard endpoints with dynamic data"
echo "- Features: Auto-refresh, loading states, error handling"
echo "- Next: Test dashboard at http://localhost:3000/dashboard" 