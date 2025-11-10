# 🏥 MediTatva Connect AI - Patient Portal

A modern, premium patient portal dashboard for MediTatva healthcare platform with AI-powered features, glassmorphism design, and comprehensive health management tools.

---

## 🚀 Quick Start

### ✅ Application is Running!

```bash
Frontend URL: http://localhost:8081
Modern Dashboard: http://localhost:8081/patient/modern
```

### 📦 Installation & Setup

```bash
# Install dependencies
cd meditatva-frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🎨 Features Overview

### 1. **Modern Patient Dashboard** 
Premium, fully-responsive dashboard with:

- ✅ **Dark/Light Mode Toggle**
- ✅ **Glassmorphism + Neumorphism UI**
- ✅ **Smooth Framer Motion Animations**
- ✅ **Floating particle effects**
- ✅ **Gradient mesh backgrounds**
- ✅ **Premium color schemes** (Cyan → Blue → Purple gradients)

---

## 📱 Core Features

### 🗺️ Search Nearby Medicine Stores
- **Map Integration**: Visual display of nearby pharmacies
- **Medicine Search**: Search by medicine name across stores
- **Lens/Camera Scanner**: Upload/scan prescriptions for auto-search
- **Real-time Availability**: Check stock at nearby stores
- **Distance Calculation**: See pharmacies sorted by proximity

**Access**: Click "Find Stores" button in navbar

---

### 📅 Appointments Management
- **Book Appointments**: Schedule consultations with doctors
- **View Upcoming**: See all scheduled appointments
- **Cancel/Reschedule**: Manage your bookings
- **Consultation Modes**: 
  - 🎥 **Online** (Video Call)
  - 🏥 **Offline** (In-Person)
- **Doctor Details**: View specialties, availability, locations
- **Video Call Integration**: Join online consultations directly

**Features**:
- Filter by status (Upcoming, Completed, All)
- One-click join for video calls
- Appointment history tracking
- Doctor profiles with specialties

---

### 💊 Medicine Orders & Billing
- **Order Medicines**: Purchase from nearby pharmacies
- **Bill Toggle**: Choose "Need Bill? Yes/No" before checkout
- **Order Tracking**:
  - 📦 Processing
  - 🚚 Dispatched
  - ✅ Delivered
- **Bill Download**: Get invoices for delivered orders
- **Pharmacy Selection**: Choose from nearby stores
- **Real-time Status**: Track your order progress

**Additional Features**:
- Multiple payment options
- Delivery address management
- Order history with details
- Quick reorder functionality

---

### ⏰ Monthly Health Reminders
- **Set Reminders**: Medicine, checkup, exercise alerts
- **Calendar View**: Interactive date selection
- **Frequency Options**:
  - Daily
  - Weekly
  - Monthly
- **Time Scheduling**: Set specific reminder times
- **Active/Inactive Toggle**: Turn reminders on/off
- **Today's Schedule**: See all today's reminders at a glance

**Use Cases**:
- Daily medicine intake
- Monthly health checkups
- Weekly exercise routines
- Bi-weekly medication refills

---

### 🗂️ Medical Cabinet (Family Records)
- **Digital Storage**: Store all health documents in one place
- **Family Profiles**: Add multiple family members
  - Name, relation, age, photo
- **Document Types**:
  - 📄 Prescriptions
  - 🩺 Medical Reports
  - 💊 Medications
- **Upload & Organize**: Categorize by family member & type
- **View & Download**: Access documents anytime
- **Doctor Details**: Link prescriptions to doctors

**Perfect For**:
- Storing lab reports
- Keeping track of ongoing medications
- Family health history
- Quick access during emergencies

---

### 🤖 AI Health Bot & Messaging
- **Symptom Analysis**: Describe symptoms, get AI suggestions
- **Health Guidance**: Possible conditions and recommendations
- **Multilingual Support**: Responds in your language
- **Pharmacy Messaging**: Contact stores for unavailable medicines
- **Smart Conversations**: Context-aware health assistant

**Powered by**: Google Gemini AI (Configured in .env)

**Features**:
- Natural language understanding
- Medical condition suggestions
- Home remedy recommendations
- Doctor consultation advice
- Emergency contact guidance

---

## 🎯 Navigation

### Sidebar Menu:
1. **🏠 Dashboard** - Overview with health stats
2. **📅 Appointments** - Doctor consultations
3. **🛒 Medicine Orders** - Track and order medicines
4. **⏰ Health Reminders** - Set health alerts
5. **🗂️ Medical Cabinet** - Family health records

### Top Navigation:
- **📷 Scan Prescription** - Camera-based prescription scanning
- **🗺️ Find Stores** - Search nearby pharmacies
- **🌓 Theme Toggle** - Dark/Light mode
- **🔔 Notifications** - Health alerts
- **👤 Profile** - User settings
- **🚪 Logout** - Sign out

### Floating Action Button:
- **💬 AI Chat Bot** - Quick access to health assistant

---

## 🎨 Design System

### Color Palette:

**Primary Gradients**:
- Cyan (#0EA5E9) → Blue (#3B82F6)
- Purple (#A855F7) → Pink (#EC4899)

**Feature Colors**:
- 🟢 Green (#10B981) - Orders, Success
- 🟠 Orange (#F97316) - Reminders, Warnings
- 🔵 Blue (#3B82F6) - Appointments, Info
- 🟣 Purple (#A855F7) - AI Features

**Background**:
- Dark: `#0B1220` → `#111827`
- Light: `#F7F9FC` → `#FFFFFF`

### Typography:
- **Font Family**: Inter, system-ui
- **Headings**: Bold, gradient text
- **Body**: Regular, high contrast

### Components:
- **Cards**: Glassmorphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Icons**: Lucide React (4-5px consistent sizing)
- **Borders**: Subtle white/10 opacity for depth

---

## 📂 Project Structure

```
meditatva-frontend/
├── src/
│   ├── components/
│   │   ├── MedicalCabinet.tsx          # Family health records
│   │   ├── AppointmentsSection.tsx     # Doctor appointments
│   │   ├── MedicineOrders.tsx          # Medicine ordering
│   │   ├── HealthReminders.tsx         # Health alerts & calendar
│   │   ├── Chatbot.tsx                 # AI health assistant
│   │   ├── NearbyPharmacyFinder.tsx    # Map & store search
│   │   ├── ThemeToggle.tsx             # Dark/light mode
│   │   └── ui/                         # Shadcn UI components
│   ├── pages/
│   │   ├── ModernPatientDashboard.tsx  # Main dashboard (NEW)
│   │   ├── PatientDashboard.tsx        # Original dashboard
│   │   ├── Login.tsx                   # Authentication
│   │   └── Index.tsx                   # Landing page
│   ├── hooks/
│   │   └── useGeolocation.tsx          # Location detection
│   ├── lib/
│   │   ├── utils.ts                    # Utilities
│   │   └── mockData.ts                 # Sample data
│   └── App.tsx                         # Router configuration
├── .env                                # Environment variables
├── package.json                        # Dependencies
├── tailwind.config.ts                  # Tailwind configuration
└── vite.config.ts                      # Vite build config
```

---

## 🛠️ Technologies

### Frontend:
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/UI** - Component library
- **Lucide React** - Icon system
- **React Router** - Client-side routing

### Features:
- **Google Gemini AI** - Health chatbot
- **Geolocation API** - Location detection
- **LocalStorage** - State persistence
- **Sonner** - Toast notifications

---

## 🔐 Authentication

**Login Route**: `http://localhost:8081/login`

### Demo Credentials:
```
Role: Patient
Email: Any email
Password: Any password (demo mode)
```

### Roles Available:
- **Patient** → `/patient/modern`
- **Pharmacy** → `/pharmacy/dashboard`

---

## 📱 Responsive Design

### Breakpoints:
- **Mobile**: `< 768px` 
  - Single column layout
  - Collapsible sidebar
  - Touch-optimized buttons
  
- **Tablet**: `768px - 1024px`
  - 2-column grid
  - Sidebar toggle
  - Optimized cards
  
- **Desktop**: `> 1024px`
  - Full layout
  - Permanent sidebar
  - Multi-column grids

---

## 🚀 Performance Optimizations

- ✅ **Lazy Loading**: Route-based code splitting
- ✅ **Image Optimization**: Proper sizing & formats
- ✅ **Animation Optimization**: GPU-accelerated transforms
- ✅ **Bundle Splitting**: Vendor chunks separation
- ✅ **Memoization**: React.memo for expensive components

---

## 🔧 Configuration

### Environment Variables (.env):
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Tailwind Config:
Customize colors, fonts, and breakpoints in `tailwind.config.ts`

### Vite Config:
Build optimization settings in `vite.config.ts`

---

## 🎯 Key Interactions

### Dashboard Highlights:
1. **Quick Stats Cards**: Click to navigate to sections
2. **Search Bar**: Search medicines across stores
3. **Recent Activity**: Quick access to appointments & reminders
4. **Health Score**: Track overall wellness

### Component Interactions:
- **Hover Effects**: Smooth scale animations
- **Click Feedback**: Tap scale animations
- **Loading States**: Skeleton loaders & spinners
- **Error Handling**: Toast notifications
- **Form Validation**: Real-time validation

---

## 📊 Features Status

| Feature | Status | Component |
|---------|--------|-----------|
| Dashboard UI | ✅ Complete | ModernPatientDashboard |
| Dark/Light Mode | ✅ Complete | ThemeToggle |
| Appointments | ✅ Complete | AppointmentsSection |
| Medicine Orders | ✅ Complete | MedicineOrders |
| Health Reminders | ✅ Complete | HealthReminders |
| Medical Cabinet | ✅ Complete | MedicalCabinet |
| AI Chatbot | ✅ Complete | Chatbot |
| Nearby Stores | ✅ Complete | NearbyPharmacyFinder |
| Prescription Scanner | 🟡 Placeholder | Camera UI ready |
| Payment Gateway | ⏳ Future | To be integrated |

---

## 🔜 Future Enhancements

### Phase 1 (Backend Integration):
- [ ] Connect to real API endpoints
- [ ] User authentication & authorization
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time updates via WebSocket

### Phase 2 (Advanced Features):
- [ ] Google Maps integration (replace placeholders)
- [ ] OCR for prescription scanning
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Push notifications
- [ ] SMS/Email alerts

### Phase 3 (AI & Analytics):
- [ ] Enhanced AI recommendations
- [ ] Health trend analysis
- [ ] Predictive refill reminders
- [ ] Personalized health insights

---

## 🐛 Troubleshooting

### Port Already in Use:
```bash
# Vite will automatically try the next available port
# Current running port: 8081
```

### AI Chatbot Not Working:
1. Check `.env` file has `VITE_GEMINI_API_KEY`
2. Verify API key is valid
3. Check internet connection
4. Fallback messages will display if AI unavailable

### Build Errors:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

For issues or questions:
- Check browser console (F12) for errors
- Review component props in source code
- See [Shadcn/UI Docs](https://ui.shadcn.com)
- See [Framer Motion Docs](https://www.framer.com/motion/)

---

## ✨ Credits

**Built with**:
- React + TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Framer Motion Animations
- Google Gemini AI

**Design Inspiration**:
- Modern healthcare UX patterns
- Glassmorphism design trends
- Premium medical dashboards

---

## 📜 License

This project is part of the MediTatva Connect AI platform.

---

## 🎉 Enjoy Your Modern Patient Portal!

Navigate to **http://localhost:8081/patient/modern** to experience the full premium dashboard!

**Quick Links**:
- 🏠 Home: http://localhost:8081
- 🔐 Login: http://localhost:8081/login
- 📱 Modern Dashboard: http://localhost:8081/patient/modern
- 🏥 Pharmacy Dashboard: http://localhost:8081/pharmacy/dashboard

