# Universal Authentication System - Backend Integration Guide

This guide demonstrates how to integrate the universal authentication frontend with various backend frameworks.

## Table of Contents
- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Framework Examples](#framework-examples)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Security Considerations](#security-considerations)

## Overview

The universal authentication system is designed to work with any backend framework. The frontend sends standardized data formats and expects standardized responses, making it easy to integrate with different backends.

## API Endpoints

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/signup` or `/auth/register` | POST | User registration |
| `/auth/logout` | POST | User logout |
| `/auth/refresh` | POST | Token refresh |
| `/auth/profile` | GET | Get user profile |

### Optional Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/password/reset` | POST | Request password reset |
| `/auth/password/reset/confirm` | POST | Confirm password reset |
| `/auth/email/verify` | POST | Email verification |

## Framework Examples

### 1. Node.js with Express

```javascript
// dependencies: express, bcryptjs, jsonwebtoken, sqlite3

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { database } = require('./database/db');

const router = express.Router();

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;
    
    // Find user
    const user = await database.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: remember_me ? '30d' : '24h' }
    );
    
    // Update last login
    await database.updateLastLogin(user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup endpoint
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await database.createUser({
      email,
      passwordHash: password_hash,
      firstName: first_name,
      lastName: last_name
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName
      }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

### 2. Python with Django

```python
# views.py
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        else:
            return Response(
                {'message': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    except User.DoesNotExist:
        return Response(
            {'message': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'message': 'Email already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create(
        username=email,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=make_password(password)
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    }, status=status.HTTP_201_CREATED)
```

### 3. PHP with Laravel

```php
<?php
// AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed'], 400);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name
                ]
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'first_name' => 'required',
            'last_name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed'], 400);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name
            ]
        ], 201);
    }
}
```

### 4. Java with Spring Boot

```java
// AuthController.java

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = tokenProvider.generateToken(userDetails);
            
            User user = userService.findByEmail(loginRequest.getEmail());

            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUser(new UserResponse(user));

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Email already exists"));
            }

            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());

            User savedUser = userService.save(user);

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = tokenProvider.generateToken(userDetails);

            RegisterResponse response = new RegisterResponse();
            response.setToken(token);
            response.setUser(new UserResponse(savedUser));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Registration failed"));
        }
    }
}
```

## Database Schema

The SQLite schema is provided in `src/database/schema.sql`. For other databases, adapt the schema accordingly:

### PostgreSQL Example
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);
```

### MySQL Example
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0
);
```

## Authentication Flow

1. **Registration**:
   - User submits signup form
   - Frontend validates data
   - POST request to `/auth/signup` or `/auth/register`
   - Backend creates user and returns JWT token
   - Frontend stores token and user data

2. **Login**:
   - User submits login form
   - Frontend validates credentials
   - POST request to `/auth/login`
   - Backend verifies credentials and returns JWT token
   - Frontend stores token and user data

3. **Authenticated Requests**:
   - Frontend includes `Authorization: Bearer <token>` header
   - Backend verifies token on protected routes

4. **Logout**:
   - POST request to `/auth/logout` (optional)
   - Frontend clears stored token and user data

## Security Considerations

1. **Password Hashing**: Use strong hashing algorithms (bcrypt, Argon2)
2. **JWT Security**: 
   - Use strong secret keys
   - Implement token expiration
   - Consider refresh token rotation
3. **CORS**: Configure appropriate CORS settings
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Input Validation**: Always validate and sanitize user input
6. **HTTPS**: Use HTTPS in production
7. **Environment Variables**: Store secrets in environment variables

## Configuration

Update your frontend configuration in `src/utils/apiService.js` to match your backend:

```javascript
const API_CONFIG = {
    express: {
        baseURL: 'http://localhost:3001/api',
        endpoints: {
            login: '/auth/login',
            signup: '/auth/signup',
            // ... other endpoints
        }
    }
};
```

## Testing

Test the integration with tools like:
- Postman or Insomnia for API testing
- Jest for unit tests
- Cypress for end-to-end testing

This universal system is designed to be flexible and work with any backend architecture. Choose the implementation that best fits your project needs!
