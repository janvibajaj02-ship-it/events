# 🎓 Event Hub – College Event Management Portal

![Event Hub Preview](https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop)

Event Hub is a premium, full-stack event management system designed specifically for university campuses. It bridges the gap between students, event organizers, and administrators by digitizing the entire event lifecycle—from registration and ticketing to attendance tracking and duty leave processing.

---

## 🚀 Features

### For Students
* **Browse & Register**: Explore a dynamic calendar of upcoming university events.
* **Digital Tickets (QR Codes)**: Receive unique QR codes upon registration for secure and fast entry.
* **Duty Leave (DL) Automation**: Automatically request Duty Leaves for attended events, directly from your student dashboard.
* **Personal Dashboard**: Track all your past and upcoming registrations in one place.

### For Organizers
* **Event Creation**: Propose events with detailed descriptions, dates, and maximum capacities.
* **Live Attendance Scanning**: Use the built-in QR Code Scanner to instantly check-in students at the door.
* **DL Request Management**: Review and approve Duty Leave requests from attendees in a streamlined dashboard.
* **Event Analytics**: Monitor registration counts and attendance metrics in real-time.

### For Administrators
* **Global Oversight**: Approve or reject new event proposals from organizers.
* **Analytics Dashboard**: View system-wide statistics, registration trends, and user counts.
* **Global DL Management**: Oversee the entire Duty Leave lifecycle across all university departments.
* **System Audit Logs**: Access a detailed log of all system activities.

---

## 💻 Tech Stack & Skills Demonstrated

This project showcases modern full-stack web development practices, focusing on performance, security, and exceptional user experience (UX).

### Frontend
* **React.js (Vite)**: Lightning-fast rendering and component-based architecture.
* **Tailwind CSS**: Utility-first CSS for rapid, highly-customized, and responsive UI design.
* **Framer Motion**: Smooth, professional-grade animations and transitions (page loads, hover effects, 3D card flips).
* **Lucide React**: Beautiful, consistent iconography.
* **React Router**: Client-side routing with complex protected routes based on user roles.

### Backend
* **Node.js & Express.js**: Robust, scalable RESTful API architecture.
* **Authentication**: 
  * **JWT (JSON Web Tokens)**: Secure, stateless session management.
  * **Passport.js (Google OAuth 2.0)**: Seamless third-party authentication.
* **Multer**: Handling complex multipart/form-data for image and profile picture uploads.

### Database
* **MongoDB & Mongoose**: Flexible NoSQL database with strict schema validation for Users, Events, Registrations, and Duty Leaves.

---

## 🛠️ Installation & Setup

To run this project locally, follow these steps:

### Prerequisites
* Node.js (v16+)
* MongoDB (Local instance or Atlas URI)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd event-hub
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventhub
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window.
```bash
cd frontend
npm install
```
Run the Vite development server:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security Measures
* Passwords are cryptographically hashed before being stored in the database.
* Protected API endpoints verify JWTs via robust middleware.
* Frontend protected routes prevent unauthorized access to specific role-based dashboards (Admin/Organizer).

---

## 🎨 UI/UX Design Philosophy
The portal employs a modern **Glassmorphism** aesthetic combined with a cohesive **Crimson & White** university color palette. The UI is designed to feel like a premium, native mobile application, even on desktop browsers, prioritizing clarity, white space, and subtle micro-interactions to delight the user.

---

*Developed by Janvi Bajaj*