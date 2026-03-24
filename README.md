

# 🏥 Hospital Management System (MERN Stack)

A **full-stack Hospital Management System** built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**.
This system helps hospitals manage **patients, doctors, appointments, reports, billing, authentication, and real-time communication** efficiently.

The project includes a **secure backend API** and a **modern React frontend** with real-time features using **Socket.IO**.

---

# 🚀 Features

### 👨‍⚕️ Doctor Management

* Doctor registration and profile
* Upload doctor profile images
* Manage doctor availability
* View assigned patients

### 🧑‍🦱 Patient Management

* Patient registration
* Patient medical records
* Appointment booking
* Patient profile management

### 📅 Appointment System

* Book appointments with doctors
* Appointment status tracking
* Appointment scheduling
* Appointment history

### 📁 Medical Reports

* Upload reports
* Download reports as **PDF**
* Secure patient report storage

### 💰 Billing System

* Generate invoices
* Download bills as PDF
* Billing history

### 🔐 Authentication & Security

* JWT Authentication
* Access Token & Refresh Token
* Password encryption with bcrypt
* Rate limiting
* Helmet security
* Cookie-based authentication

### ☁️ Cloud File Upload

* Upload images and documents
* Cloud storage using **Cloudinary**

### 📧 Email Notifications

* Appointment confirmation emails
* Notification emails using **Nodemailer**

### 🔄 Real-Time Features

* Real-time notifications
* Doctor-patient updates
* Socket.IO integration

### ⏰ Automation

* Background jobs using **node-cron**

---

# 🧑‍💻 Tech Stack

## Frontend

* React 19
* Vite
* TailwindCSS
* Redux Toolkit
* React Router
* React Hook Form
* Zod Validation
* Axios
* Framer Motion
* Recharts
* Socket.IO Client
* jsPDF

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Cloudinary
* Multer
* Nodemailer
* Socket.IO
* Express Validator
* Helmet
* Morgan
* Node Cron
* PDFKit



# ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder.

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_email

# Frontend
CLIENT_URL=http://localhost:5173
```

---

# 🖥️ Frontend Environment Variables

Create `.env` inside the **frontend** folder.

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

# 📦 Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/hospital-management-system.git
```

---

## 2️⃣ Install Backend Dependencies

```
cd backend
npm install
```

---

## 3️⃣ Install Frontend Dependencies

```
cd frontend
npm install
```

---

# ▶️ Running the Project

### Start Backend

```
cd backend
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

### Start Frontend

```
cd frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🌱 Seed Database (Optional)

```
npm run seed
```

This command populates the database with sample data.

---

# 📡 API Base URL

```
http://localhost:5000/api
```

---

# 🔐 Security Features

* JWT Authentication
* Rate Limiting
* Helmet Protection
* Input Validation
* Password Hashing
* Secure Cookies

---

# 📊 Real-Time Communication

Real-time updates implemented using:

```
Socket.IO
```

Used for:

* Notifications
* Doctor updates
* Appointment status

---

# 📄 PDF Generation

PDF reports and bills are generated using:

```
PDFKit
```

---

# ☁️ File Uploads

Files and images are stored using:

```
Cloudinary
```

---

# 📧 Email System

Email notifications are sent using:

```
Nodemailer + Brevo SMTP
```

---

# 🧪 Scripts

Backend scripts:

```
npm start      -> start server
npm run dev    -> start server with nodemon
npm run seed   -> seed database
```

Frontend scripts:

```
npm run dev      -> start development server
npm run build    -> production build
npm run preview  -> preview build
```

---

# 🎯 Future Improvements

* Video consultation
* Online payments
* Prescription generator
* AI symptom checker
* Mobile application
* Advanced analytics dashboard

---

# 👨‍💻 Author

**Ravi Ranjan Kumar**

Full Stack MERN Developer

---




