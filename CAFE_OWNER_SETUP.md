# 🍽️ Cafe Owner Setup Guide

## **Overview**
This system now supports both **students** and **cafe owners** using the same login page but with different email domains.

## **Email Domain System**
- **Students**: `@muj.manipal.edu` → Access student features
- **Cafe Owners**: `@mujfoodclub.in` → Access cafe dashboard

## **How to Set Up Cafe Owner Accounts**

### **Step 1: Create Cafe Owner Account**
1. Go to `/auth` page
2. Click "Sign Up" tab
3. Use email format: `cafename@mujfoodclub.in` (e.g., `chatkara@mujfoodclub.in`)
4. Enter cafe name when prompted
5. Set password and full name

### **Step 2: Automatic Profile Creation**
The system will automatically:
- Detect user type by email domain
- Create appropriate profile
- Associate with the correct cafe
- Set user_type to 'cafe_owner'

### **Step 3: Access Dashboard**
After signup/login:
- Cafe owners are automatically redirected to `/cafe-dashboard`
- Students are redirected to student features
- Each cafe owner sees only their cafe's data

## **Example Cafe Owner Setup**

### **Chatkara Cafe**
- **Email**: `chatkara@mujfoodclub.in`
- **Password**: `password123`
- **Cafe Name**: `Chatkara`
- **Dashboard**: Shows only Chatkara orders and analytics

### **Mini Meals Cafe**
- **Email**: `mini_meals@mujfoodclub.in`
- **Password**: `password123`
- **Cafe Name**: `Mini Meals`
- **Dashboard**: Shows only Mini Meals orders and analytics

## **Features Available to Cafe Owners**
✅ **Order Management**: View, accept, prepare, deliver orders
✅ **Real-time Updates**: Live order notifications with sound
✅ **Analytics Dashboard**: Revenue, orders, top items
✅ **QR Scanner**: Student verification system
✅ **Data Export**: CSV export of orders
✅ **Staff Management**: Manage cafe staff (if implemented)

## **Security Features**
- **Data Isolation**: Each cafe sees only their data
- **Role-based Access**: Only cafe owners can access dashboard
- **Email Validation**: Strict domain checking
- **Profile Association**: Automatic cafe linking

## **Testing the System**

### **Test Student Account**
- Email: `student@muj.manipal.edu`
- Should access student features only

### **Test Cafe Owner Account**
- Email: `chatkara@mujfoodclub.in`
- Should access Chatkara dashboard only

## **Database Changes Required**
Run the migration: `20250825190054_add_user_type_and_cafe_id_to_profiles.sql`

This adds:
- `user_type` field to profiles table
- `cafe_id` field to profiles table
- Proper indexes for performance

## **Rollback Instructions**
If you want to revert to the previous state:
```bash
git reset --hard HEAD~1
git push origin main --force
```

## **Current Status**
✅ **Dual Domain Authentication**: Implemented
✅ **User Type Detection**: Working
✅ **Cafe Dashboard Access**: Functional
✅ **Data Isolation**: Implemented
✅ **Dynamic Cafe Names**: Working
✅ **TypeScript Types**: Updated
✅ **Build**: Successful

The system is ready for testing with cafe owner accounts!
