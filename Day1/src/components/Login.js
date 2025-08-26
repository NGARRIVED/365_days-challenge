/**
 * Universal Login Component
 * Features: Anime.js animations, form validation, backend integration ready
 * Day 1 of 365 Days Challenge
 */

import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

const Login = ({ onSwitchToSignup, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Refs for animations
    const containerRef = useRef(null);
    const formRef = useRef(null);
    const titleRef = useRef(null);
    const inputRefs = useRef([]);
    const buttonRef = useRef(null);

    // Animation on component mount
    useEffect(() => {
        const tl = anime.timeline({
            easing: 'easeOutExpo',
            duration: 1200
        });

        tl.add({
            targets: containerRef.current,
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800
        })
        .add({
            targets: titleRef.current,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600
        }, '-=400')
        .add({
            targets: inputRefs.current,
            opacity: [0, 1],
            translateX: [-30, 0],
            duration: 500,
            delay: anime.stagger(100)
        }, '-=300')
        .add({
            targets: buttonRef.current,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 400
        }, '-=200');

        return () => {
            // Cleanup animation if component unmounts
            anime.remove([containerRef.current, titleRef.current, ...inputRefs.current, buttonRef.current]);
        };
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Shake animation for errors
            anime({
                targets: formRef.current,
                translateX: [0, -10, 10, -10, 10, 0],
                duration: 500,
                easing: 'easeInOutQuart'
            });
            return;
        }

        setIsLoading(true);

        // Button loading animation
        anime({
            targets: buttonRef.current,
            scale: [1, 0.95],
            duration: 150,
            direction: 'alternate',
            easing: 'easeInOutQuart'
        });

        try {
            // API call would go here - this is backend integration ready
            const loginData = {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success animation
            anime({
                targets: buttonRef.current,
                backgroundColor: ['#007bff', '#28a745'],
                duration: 300,
                easing: 'easeInOutQuart'
            });

            // Call success callback
            if (onLoginSuccess) {
                onLoginSuccess(loginData);
            }

            console.log('Login data ready for API:', loginData);
            
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ submit: 'Login failed. Please try again.' });
            
            // Error animation
            anime({
                targets: buttonRef.current,
                backgroundColor: ['#007bff', '#dc3545'],
                duration: 300,
                direction: 'alternate',
                easing: 'easeInOutQuart'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        
        // Subtle animation for the eye icon
        const eyeIcon = document.querySelector('.password-toggle');
        if (eyeIcon) {
            anime({
                targets: eyeIcon,
                rotate: [0, 360],
                duration: 300,
                easing: 'easeInOutQuart'
            });
        }
    };

    return (
        <div className="auth-container" ref={containerRef}>
            <div className="auth-card">
                <h2 className="auth-title" ref={titleRef}>Welcome Back</h2>
                <p className="auth-subtitle">Please sign in to your account</p>
                
                <form className="auth-form" ref={formRef} onSubmit={handleSubmit}>
                    <div className="form-group" ref={el => inputRefs.current[0] = el}>
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group" ref={el => inputRefs.current[1] = el}>
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group form-options" ref={el => inputRefs.current[2] = el}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom"></span>
                            Remember me
                        </label>
                        
                        <a href="#" className="forgot-password-link">
                            Forgot password?
                        </a>
                    </div>

                    {errors.submit && (
                        <div className="error-message submit-error">{errors.submit}</div>
                    )}

                    <button
                        type="submit"
                        className={`auth-button ${isLoading ? 'loading' : ''}`}
                        ref={buttonRef}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="switch-auth-button"
                            onClick={onSwitchToSignup}
                        >
                            Sign up here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
