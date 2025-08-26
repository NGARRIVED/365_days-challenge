/**
 * Universal Signup Component
 * Features: Anime.js animations, comprehensive form validation, backend integration ready
 * Day 1 of 365 Days Challenge
 */

import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

const Signup = ({ onSwitchToLogin, onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    
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
            delay: anime.stagger(80)
        }, '-=300')
        .add({
            targets: buttonRef.current,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 400
        }, '-=200');

        return () => {
            anime.remove([containerRef.current, titleRef.current, ...inputRefs.current, buttonRef.current]);
        };
    }, []);

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
        return Math.min(strength, 100);
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        // Update password strength
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
        
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
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (passwordStrength < 75) {
            newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters';
        }
        
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            const signupData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                agreeToTerms: formData.agreeToTerms
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success animation
            anime({
                targets: buttonRef.current,
                backgroundColor: ['#007bff', '#28a745'],
                duration: 300,
                easing: 'easeInOutQuart'
            });

            // Call success callback
            if (onSignupSuccess) {
                onSignupSuccess(signupData);
            }

            console.log('Signup data ready for API:', signupData);
            
        } catch (error) {
            console.error('Signup error:', error);
            setErrors({ submit: 'Registration failed. Please try again.' });
            
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
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
        
        // Subtle animation for the eye icon
        const eyeIcon = document.querySelector(`.password-toggle-${field}`);
        if (eyeIcon) {
            anime({
                targets: eyeIcon,
                rotate: [0, 360],
                duration: 300,
                easing: 'easeInOutQuart'
            });
        }
    };

    // Get password strength color
    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return '#dc3545';
        if (passwordStrength < 50) return '#fd7e14';
        if (passwordStrength < 75) return '#ffc107';
        return '#28a745';
    };

    return (
        <div className="auth-container" ref={containerRef}>
            <div className="auth-card signup-card">
                <h2 className="auth-title" ref={titleRef}>Create Account</h2>
                <p className="auth-subtitle">Join us today and get started</p>
                
                <form className="auth-form" ref={formRef} onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width" ref={el => inputRefs.current[0] = el}>
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className={`form-input ${errors.firstName ? 'error' : ''}`}
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                autoComplete="given-name"
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>

                        <div className="form-group half-width" ref={el => inputRefs.current[1] = el}>
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className={`form-input ${errors.lastName ? 'error' : ''}`}
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                autoComplete="family-name"
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="form-group" ref={el => inputRefs.current[2] = el}>
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

                    <div className="form-group" ref={el => inputRefs.current[3] = el}>
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle password-toggle-password"
                                onClick={() => togglePasswordVisibility('password')}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="password-strength">
                                <div 
                                    className="password-strength-bar"
                                    style={{
                                        width: `${passwordStrength}%`,
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                ></div>
                                <span className="password-strength-text">
                                    {passwordStrength < 25 ? 'Weak' : 
                                     passwordStrength < 50 ? 'Fair' : 
                                     passwordStrength < 75 ? 'Good' : 'Strong'}
                                </span>
                            </div>
                        )}
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group" ref={el => inputRefs.current[4] = el}>
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle password-toggle-confirm"
                                onClick={() => togglePasswordVisibility('confirm')}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    <div className="form-group" ref={el => inputRefs.current[5] = el}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className={`checkbox-input ${errors.agreeToTerms ? 'error' : ''}`}
                            />
                            <span className="checkbox-custom"></span>
                            I agree to the <a href="#" className="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a>
                        </label>
                        {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
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
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="switch-auth-button"
                            onClick={onSwitchToLogin}
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
