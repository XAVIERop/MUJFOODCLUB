# 🍽️ Food Club - MUJ Campus Food Delivery

A modern, feature-rich food delivery platform exclusively for MUJ (Manipal University Jaipur) students at GHS Hostel. Built with React, TypeScript, and Supabase.

## ✨ Features

### 🏫 **Student-Centric Design**
- **College Email Authentication** (@muj.manipal.edu)
- **Magic Link Sign-in** (passwordless authentication)
- **Student Profiles** with QR codes and loyalty points
- **Campus-specific** cafe listings

### 🍕 **Food Ordering System**
- **Multi-cafe Support** (16+ cafes)
- **Real-time Menu Management**
- **Order Tracking** and notifications
- **QR Code Integration** for easy ordering

### 🎯 **Enhanced Search & Discovery**
- **Smart Search** for both cafes and food items
- **Food Item Search** with cafe names and prices
- **Location-based** cafe filtering (Block numbers)
- **Dynamic Suggestions** as you type

### 🎁 **Loyalty & Rewards**
- **Points System** for every order
- **Tier-based Rewards** (Bronze, Silver, Gold)
- **QR Code Scanning** for instant rewards
- **Transaction History** and analytics

### 🏪 **Cafe Management**
- **Cafe Owner Dashboards**
- **Real-time Order Management**
- **Menu Management** system
- **Rating & Review** system

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Real-time)
- **Deployment**: Vercel
- **Styling**: Modern, responsive design with Swiggy-inspired UI

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/XAVIERop/MUJFOODCLUB.git
cd MUJFOODCLUB
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Add your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to `http://localhost:8080`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Live Demo

**Production URL**: [https://mujfoodclub-lfi23oh1o-xavierops-projects.vercel.app](https://mujfoodclub-lfi23oh1o-xavierops-projects.vercel.app)

## 🎨 UI/UX Features

### **Hero Section**
- **Swiggy-inspired design** with transparent gradients
- **Dynamic stats** (real cafe and student counts)
- **Functional search** with cafe and food item suggestions
- **Service cards** for Food Delivery and Rewards

### **Responsive Design**
- **Mobile-first** approach
- **Modern animations** and transitions
- **Accessible** components
- **Cross-browser** compatibility

## 🔐 Authentication System

- **Magic Link Authentication** via Supabase
- **College Email Verification** (@muj.manipal.edu)
- **Automatic Profile Creation** for students
- **Secure Session Management**

## 📊 Database Schema

- **Profiles**: User data, loyalty points, QR codes
- **Cafes**: Cafe information, ratings, locations
- **Menu Items**: Food items, prices, categories
- **Orders**: Order management and tracking
- **Loyalty Transactions**: Points system and rewards

## 🚀 Deployment

### **Vercel Deployment**
- **Automatic deployments** on Git push
- **Production environment** with custom domain support
- **Performance optimization** and CDN

### **Environment Setup**
- **Supabase configuration** for production
- **Email service** (Brevo SMTP) for magic links
- **Real-time features** enabled

## 🤝 Contributing

This project is specifically designed for MUJ students. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is built for educational purposes at Manipal University Jaipur.

## 🎯 Future Roadmap

- **Mobile App** development
- **Payment Gateway** integration
- **Advanced Analytics** for cafe owners
- **AI-powered** food recommendations
- **Social Features** and food sharing

---

**Built with ❤️ for MUJ Students**
