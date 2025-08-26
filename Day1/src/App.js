/**
 * Main App Component
 * Universal Authentication System with routing and smooth scrolling
 * Day 1 of 365 Days Challenge
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import { useLenis } from './utils/useLenis';
import './styles/auth.css';

// Main Authentication Router Component
const AuthRouter = () => {
    const [currentView, setCurrentView] = useState('login');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
    // Initialize Lenis smooth scrolling
    const { scrollToTop } = useLenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    // Handle view transitions with smooth scrolling
    const handleViewChange = (newView) => {
        setCurrentView(newView);
        scrollToTop({ duration: 0.8 });
        navigate(`/${newView}`);
    };

    // Handle successful login
    const handleLoginSuccess = (loginData) => {
        console.log('Login successful:', loginData);
        setUser({
            email: loginData.email,
            loginTime: new Date().toISOString()
        });
        
        // In a real app, you would:
        // 1. Store JWT token in localStorage/sessionStorage
        // 2. Set up axios interceptors for API calls
        // 3. Redirect to dashboard or main app
        
        // For demo purposes, show success message
        alert('Login successful! In a real app, you would be redirected to the dashboard.');
    };

    // Handle successful signup
    const handleSignupSuccess = (signupData) => {
        console.log('Signup successful:', signupData);
        setUser({
            email: signupData.email,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            signupTime: new Date().toISOString()
        });
        
        // In a real app, you would:
        // 1. Send email verification
        // 2. Store JWT token
        // 3. Redirect to onboarding or main app
        
        // For demo purposes, show success message
        alert('Account created successfully! In a real app, you would receive an email verification.');
    };

    return (
        <div className="app">
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <Login 
                            onSwitchToSignup={() => handleViewChange('signup')}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        <Signup 
                            onSwitchToLogin={() => handleViewChange('login')}
                            onSignupSuccess={handleSignupSuccess}
                        />
                    } 
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
};

// Success Dashboard Component (placeholder)
const Dashboard = ({ user, onLogout }) => {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {user.firstName || user.email}!</h1>
                <button onClick={onLogout} className="logout-button">
                    Logout
                </button>
            </div>
            <div className="dashboard-content">
                <p>You have successfully logged in to the universal authentication system.</p>
                <div className="user-info">
                    <h3>User Information:</h3>
                    <ul>
                        <li><strong>Email:</strong> {user.email}</li>
                        {user.firstName && <li><strong>Name:</strong> {user.firstName} {user.lastName}</li>}
                        <li><strong>Login Time:</strong> {new Date(user.loginTime || user.signupTime).toLocaleString()}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [user, setUser] = useState(null);

    // Check for existing session on app load
    useEffect(() => {
        const checkExistingSession = () => {
            // In a real app, you would check for valid JWT token
            const savedUser = localStorage.getItem('universalAuth_user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Error parsing saved user data:', error);
                    localStorage.removeItem('universalAuth_user');
                }
            }
        };

        checkExistingSession();
    }, []);

    // Handle logout
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('universalAuth_user');
        localStorage.removeItem('universalAuth_token');
        
        // In a real app, you would also:
        // 1. Call logout API endpoint
        // 2. Clear all user-related data
        // 3. Reset global state
    };

    // Save user data when user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('universalAuth_user', JSON.stringify(user));
        }
    }, [user]);

    return (
        <Router>
            <div className="app-container">
                {user ? (
                    <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                    <AuthRouter />
                )}
                
                {/* Global App Footer */}
                <footer className="app-footer">
                    <p>Universal Auth System - Day 1 of 365 Days Challenge</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;
