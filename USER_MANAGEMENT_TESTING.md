# 🧪 User Management Testing Guide

## 🔗 **Access URL:**
- **FoodHub Admin**: http://localhost:3000

## 🔐 **Test Credentials:**

### **Super Admin (Full Access):**
```
Email: admin@foodhub.com
Password: admin123
Role: super-admin
```

### **System Admin:**
```
Email: sysadmin@foodhub.com  
Password: sysadmin123
Role: admin
```

### **Restaurant Owner:**
```
Email: owner@pizzapalace.com
Password: owner123
Role: restaurant-owner
```

### **Manager:**
```
Email: manager@foodhub.com
Password: manager123
Role: restaurant-manager
```

## 🧭 **Navigation Testing:**

### **1. Menu Access by Role:**
- **Super Admin/Admin**: Sees all menu items including "Users"
- **Restaurant Owner**: Sees all menu items including "Users"  
- **Manager**: Sees all menu items but NO "Users" 
- **Kitchen Staff**: Only sees "Dashboard" and "Orders"

### **2. Users Menu:**
1. Login as Super Admin (`admin@foodhub.com` / `admin123`)
2. Click "Users" in left sidebar
3. Should see User Management page

## 🎯 **Core Features Testing:**

### **1. View Users List:**
- **URL**: `/users`
- **Expected**: Table with all 8 users
- **Columns**: User, Contact, Role, Status, Restaurant, Last Login, Actions
- **Features**: Search, filters (status, role), pagination

### **2. Create New User:**
1. Click "Create User" button
2. Fill form with test data:
   ```
   Name: Test User
   Email: test@example.com
   Password: password123
   Role: cashier
   Restaurant: Pizza Palace (if role requires)
   Status: active
   ```
3. **Expected**: User created, toast notification, redirected to list

### **3. Edit Existing User:**
1. Click Edit (✏️) button on any user you can edit
2. Modify name or phone
3. **Expected**: User updated, changes reflected in list

### **4. Change Password:**
1. Click Password (🔑) button on any user
2. Enter new password (min 8 chars)
3. **Expected**: Password changed, toast notification

### **5. Delete User:**
1. Click Delete (🗑️) button on any user you can delete
2. Confirm deletion
3. **Expected**: User removed from list

## 🔒 **Permission Testing:**

### **Test Role Hierarchy:**

1. **Login as Super Admin:**
   - ✅ Can create all roles (including super-admin)
   - ✅ Can edit/delete all users
   - ✅ Can manage passwords

2. **Login as Admin:**
   - ✅ Can create: restaurant-owner, manager, kitchen-staff, cashier, customer
   - ❌ Cannot create: super-admin, admin
   - ✅ Can edit lower-level users
   - ❌ Cannot edit super-admin or other admins

3. **Login as Restaurant Owner:**
   - ✅ Can create: manager, kitchen-staff, cashier, customer
   - ❌ Cannot create: super-admin, admin, restaurant-owner
   - ✅ Can edit restaurant staff

4. **Login as Manager:**
   - ❌ No access to Users page (menu item hidden)

## 🔍 **Search & Filter Testing:**

### **Search:**
1. Enter text in search box
2. **Expected**: Real-time filtering by name/email

### **Status Filter:**
1. Select "Active", "Inactive", or "Suspended"
2. **Expected**: List filtered by status

### **Role Filter:**
1. Select specific role
2. **Expected**: List filtered by role

### **Pagination:**
1. Change page size or navigate pages
2. **Expected**: Proper pagination with counts

## 🎨 **UI/UX Testing:**

### **Role Badges:**
- **Super Admin**: Red badge 🔥
- **Admin**: Purple badge ⚡
- **Restaurant Owner**: Green badge 👑  
- **Manager**: Blue badge 👨‍💼
- **Kitchen Staff**: Orange badge 👨‍🍳
- **Cashier**: Purple badge 💰
- **Customer**: Gray badge 👤

### **Status Badges:**
- **Active**: Green background
- **Inactive**: Gray background  
- **Suspended**: Red background

### **Responsive Design:**
1. Test on different screen sizes
2. **Expected**: Table scrolls horizontally on mobile

## ⚠️ **Error Testing:**

### **Form Validation:**
1. Try submitting empty forms
2. Try invalid email formats
3. Try passwords < 8 characters
4. **Expected**: Proper error messages

### **Permission Errors:**
1. Try editing higher-level users
2. **Expected**: Toast error "У вас нет прав..."

### **Network Errors:**
1. Stop backend temporarily
2. Try operations
3. **Expected**: Proper error handling

## 📊 **Data Verification:**

### **Backend API Verification:**
```bash
# Check if users were created properly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost/api/v1/users"

# Test user creation
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"API Test","email":"apitest@test.com","password":"password123","role":"customer","status":"active"}' \
     "http://localhost/api/v1/users"
```

## 🐛 **Known Issues & Workarounds:**

1. **Restaurant Selection**: Currently hardcoded to "Pizza Palace" - needs dynamic loading
2. **Role Updates**: Role changes require separate API call (not implemented in edit form)
3. **Avatar Images**: Using initials placeholder - no image upload yet

## ✅ **Success Criteria:**

- [ ] All 8 demo users visible in list
- [ ] Role-based menu access working
- [ ] CRUD operations functional
- [ ] Permission system enforced
- [ ] Search and filters working
- [ ] Responsive design
- [ ] Error handling proper
- [ ] Form validation working
- [ ] Toast notifications appearing

---

## 🚀 **Ready for Production When:**

1. ✅ Basic CRUD operations work
2. ✅ Role hierarchy enforced  
3. ✅ UI/UX polished
4. ⏳ Restaurant dropdown loaded from API
5. ⏳ Role management modal added
6. ⏳ Bulk operations implemented
7. ⏳ Export functionality added

**Current Status**: 🟢 **Core functionality complete and testable!** 