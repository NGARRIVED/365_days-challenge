# Day 2 - User Authentication System

## Overview
Welcome to Day 2 of the 365 Days Challenge! This folder contains the second project of our year-long coding journey where we build something new every single day.

## Project Description
On Day 2, we are creating a **backend authentication system** that handles user registration, login, and secure session management. This system is designed with security and reusability in mind, making it a perfect foundation for any application requiring user authentication.

### Key Features
- **User Registration & Login**: Complete authentication flow
- **Password Security**: Secure hashing and storage
- **JWT Authentication**: Token-based session management
- **Data Validation**: Input validation and sanitization
- **Security Measures**: Rate limiting and other protections

## Technologies Used
- **Backend**: Python
- **Database**: PostgreSQL
- **Security**: bcrypt, PyJWT, Flask-Limiter
- **Validation**: Pydantic, Marshmallow

## Database
This project uses **Postgresql** as the database solution, which provides:
- Robust relational data storage
- Scalable architecture
- Easy integration with Python
- Perfect for dynamic data fetching and authentication

## Project Structure

Day2/
├── README.md
├── requirements.txt
├── src/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── main.py
├── tests/
└── .env.example

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile (protected)

## Security Features
- **Password Hashing**: Secure storage with bcrypt
- **JWT Authentication**: Secure token-based sessions
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Prevention of injection attacks
- **Secure Headers**: Protection against common web vulnerabilities


## What Makes This Reusable
- **Modular Design**: Well-organized code structure
- **Framework Agnostic**: Can be adapted to any frontend
- **Comprehensive Security**: Industry standard protections
- **Flexible Configuration**: Easily customizable for different needs

## Integration Possibilities
This authentication system can be easily integrated with:
- React/Angular/Vue frontends
- Mobile applications (React Native, Flutter)
- Microservices architectures
- Server-side rendered applications
- REST API based systems

---
*Day 2 of 365 - Building secure authentication for our applications! 🔒*