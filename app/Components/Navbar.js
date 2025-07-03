"use client";
import React, { useState, useEffect, useRef } from "react";
import Logo1 from "./Logo1";
import Logo from "./logo";
import Link from "next/link";



const LogoComponent = typeof Logo !== 'undefined' ? Logo : PlaceholderLogo;
const Logo1Component = typeof Logo1 !== 'undefined' ? Logo1 : PlaceholderLogo1;


const LoginModal = ({ onClose, onLoginSuccess }) => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("mobile");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Hardcoded OTP for development
    const DEV_OTP = "123456";

    const handleSendOtp = async () => {
        if (!mobileNumber || mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
            setMessage("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsLoading(true);
        setMessage("Sending OTP...");

        // Simulate API call to send OTP
        // In a real application, you would make an actual API call here
        // await fetch('/api/send-otp', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ mobileNumber }),
        // });
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

        setIsLoading(false);
        setMessage(`OTP sent to ${mobileNumber}`);
        setStep("otp");
        startCountdown();
    };

    const startCountdown = () => {
        setCountdown(30);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) clearInterval(timer);
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
            setMessage("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setMessage("Verifying OTP...");

        // Simulate API call to verify OTP
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

        // OTP Validation Logic
        if (otp === DEV_OTP) {
            // For development: check against hardcoded OTP
            setMessage("Login successful! Redirecting...");

            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ mobileNumber }),
                });

                if (response.ok) {
                    // Handle successful backend response
                    console.log("Mobile number sent to backend successfully:", mobileNumber);
                    // Call the onLoginSuccess callback passed from Navbar
                    onLoginSuccess(mobileNumber);
                    setTimeout(() => {
                        onClose(); // Close modal on successful login
                    }, 1000);
                } else {
                    // Handle backend error
                    const errorData = await response.json();
                    setMessage(`Login failed: ${errorData.message || "Server error"}`);
                }
            } catch (error) {
                console.error("Error sending mobile number to backend:", error);
                setMessage("Login failed: Network error");
            }
        } else {
            setMessage("Invalid OTP. Please try again.");
        }
        setIsLoading(false);
    };

    const resendOtp = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        setMessage("Resending OTP...");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        setMessage(`OTP resent to ${mobileNumber}`);
        startCountdown();
    };

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 p-8 rounded-xl shadow-2xl w-full max-w-md relative border border-indigo-700 animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-yellow-400 transition"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            ></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {step === "mobile" ? "Welcome Back!" : "Verify OTP"}
                    </h2>
                    <p className="text-indigo-200 mt-2">
                        {step === "mobile" ? "Enter your mobile number to continue" : `Enter OTP sent to ${mobileNumber}`}
                    </p>
                </div>

                {message && (
                    <div
                        className={`mb-4 p-3 rounded-lg text-center ${message.includes("successful")
                                ? "bg-green-900/50 text-green-300"
                                : message.includes("OTP")
                                    ? "bg-indigo-900/50 text-indigo-200"
                                    : "bg-red-900/50 text-red-300"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {step === "mobile" ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-indigo-300">+91</span>
                            </div>
                            <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    if (value.length <= 10) setMobileNumber(value);
                                }}
                                className="w-full pl-14 pr-4 py-3 bg-indigo-700/50 border border-indigo-600 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                placeholder="Mobile number"
                                maxLength="10"
                            />
                        </div>
                        <button
                            onClick={handleSendOtp}
                            disabled={isLoading || mobileNumber.length !== 10}
                            className={`w-full py-3 rounded-lg font-bold transition ${isLoading || mobileNumber.length !== 10
                                    ? "bg-indigo-900/50 text-indigo-400 cursor-not-allowed"
                                    : "bg-yellow-500 text-indigo-900 hover:bg-yellow-400"
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                "Continue"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center space-x-2">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={otp[i] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        if (value) {
                                            const newOtp = otp.split("");
                                            newOtp[i] = value;
                                            setOtp(newOtp.join(""));
                                            // Auto-focus next input
                                            if (i < 5 && value) {
                                                document.getElementById(`otp-${i + 1}`)?.focus();
                                            }
                                        }
                                    }}
                                    id={`otp-${i}`}
                                    className="w-12 h-12 text-center text-2xl bg-indigo-700/50 border border-indigo-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            ))}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setStep("mobile");
                                    setOtp("");
                                    setMessage("");
                                }}
                                className="text-indigo-300 hover:text-yellow-400 text-sm"
                            >
                                Change number
                            </button>

                            <button
                                onClick={resendOtp}
                                disabled={countdown > 0}
                                className={`text-sm ${countdown > 0
                                        ? "text-indigo-500"
                                        : "text-yellow-400 hover:text-yellow-300"
                                    }`}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                            </button>
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading || otp.length !== 6}
                            className={`w-full py-3 rounded-lg font-bold transition ${isLoading || otp.length !== 6
                                    ? "bg-indigo-900/50 text-indigo-400 cursor-not-allowed"
                                    : "bg-yellow-500 text-indigo-900 hover:bg-yellow-400"
                                }`}
                        >
                            {isLoading ? "Verifying..." : "Verify & Login"}
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-indigo-300">
                    <p>
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-yellow-400 hover:underline">
                            Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-yellow-400 hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
     // Assuming cart items logic is elsewhere
    const [userProfile, setUserProfile] = useState(null); // Stores user data after login
    const [showProfileMenu, setShowProfileMenu] = useState(false); // State for dropdown
    const profileMenuRef = useRef(null); // Ref for closing dropdown on outside click
    const [cartItems, setCartItemCount] = useState(0)

    useEffect(() => {
        const initializeUserAndCart = async () => {
            // Step 1: Load user from localStorage
            const storedUser = localStorage.getItem("userProfile");
            let parsedUser = null;

            if (storedUser) {
                parsedUser = JSON.parse(storedUser);
                setUserProfile(parsedUser);
            }

            // Step 2: Fetch cart count if mobileNumber is available
            if (parsedUser && parsedUser.mobileNumber) {
                try {
                    const response = await fetch(`/api/cart?userId=${parsedUser.mobileNumber}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setCartItemCount(data.totalItems);
                } catch (err) {
                    console.error("Error fetching cart count:", err);
                    setCartItemCount(0); // Reset count on error
                }
            } else {
                setCartItemCount(0); // No user logged in
            }
        };

        initializeUserAndCart();
    }, [cartItems]);
    

    // Function to handle successful login from LoginModal
    const handleLoginSuccess = (mobileNumber) => {
        const profileData = { mobileNumber };
        setUserProfile(profileData);
        localStorage.setItem("userProfile", JSON.stringify(profileData));
    };

    // Function to handle logout
    const handleLogout = () => {
        setUserProfile(null);
        localStorage.removeItem("userProfile");
        setShowProfileMenu(false); // Close profile menu on logout
    };

    // Effect to close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="fixed z-50 w-full bg-gradient-to-r from-indigo-900 to-blue-900 shadow-xl">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center">
                            <div className="hidden lg:block">
                                <LogoComponent className="h-10" />
                            </div>
                            <div className="lg:hidden">
                                <Logo1Component className="h-8" />
                            </div>
                        </Link>
                    </div>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 mx-6 max-w-xl">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-10 pr-4 py-2 bg-indigo-700/50 border border-indigo-600 rounded-full text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-indigo-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/"
                            className="text-indigo-100 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className="text-indigo-100 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Products
                        </Link>
                        <Link
                            href="/cart"
                            className="relative text-indigo-100 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition flex items-center"
                        >
                            <svg
                                className="w-5 h-5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.721.707 1.721H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                ></path>
                            </svg>
                            Cart
                            {cartItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-500 text-indigo-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems}
                                </span>
                            )}
                        </Link>
                        {userProfile ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        ></path>
                                    </svg>
                                    Hi, {userProfile.mobileNumber}
                                    <svg className={`ml-2 w-3 h-3 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-indigo-700 rounded-md shadow-lg py-1 z-10 animate-fade-in-down">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-600 hover:text-yellow-400"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-600 hover:text-yellow-400"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <hr className="border-indigo-600 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-indigo-600 hover:text-red-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    ></path>
                                </svg>
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        {/* Cart icon for mobile */}
                        <Link href="/cart" className="relative p-2 mr-2 text-indigo-100">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.721.707 1.721H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                ></path>
                            </svg>
                            {cartItems > 0 && (
                                <span className="absolute top-0 right-0 bg-yellow-500 text-indigo-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    ></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-indigo-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-slide-down">
                    {/* Mobile Search - Only visible when menu is open */}
                    <div className="mb-3 px-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-indigo-700/50 border border-indigo-600 rounded-full text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-indigo-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-yellow-400 hover:bg-indigo-700/50"
                        onClick={() => setIsOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/products"
                        className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-yellow-400 hover:bg-indigo-700/50"
                        onClick={() => setIsOpen(false)}
                    >
                        Products
                    </Link>
                    <Link
                        href="/cart"
                        className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-yellow-400 hover:bg-indigo-700/50"
                        onClick={() => setIsOpen(false)}
                    >
                        My Cart
                    </Link>
                    {userProfile ? (
                        <>
                            <Link
                                href="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-yellow-400 hover:bg-indigo-700/50"
                                onClick={() => setIsOpen(false)}
                            >
                                My Profile
                            </Link>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleLogout();
                                }}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-200 hover:bg-indigo-700/50"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setShowLoginModal(true);
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:text-yellow-400 hover:bg-indigo-700/50"
                        >
                            Login / Sign Up
                        </button>
                    )}
                </div>
            )}

            {/* Login Modal */}
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
        </nav>
    );
};

export default Navbar;