"use client"; // This component needs client-side interactivity

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

export default function CheckoutPage() {
    const router = useRouter();

    // State for user profile and cart items (now real data)
    const [userProfile, setUserProfile] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false); // To prompt login if no user

    // State for form inputs
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India', // Default country
        mobileNumber: '',
    });

    // State for order processing and confirmation
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [orderPlacedOrderId, setOrderPlacedOrderId] = useState(null); // To store the actual order ID

    // Razorpay Key ID - **Replace with your actual Key ID from Razorpay Dashboard**
    const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Load Razorpay script dynamically
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);


    // Memoize fetchCartItems to prevent unnecessary re-creations
    const fetchCartItems = useCallback(async (mobileNumber) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch real cart data from your /api/cart endpoint
            const response = await fetch(`/api/cart?userId=${mobileNumber}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCartItems(data.items || []);
        } catch (err) {
            console.error("Error fetching cart items:", err);
            setError(err.message);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Fetch User Profile and then Cart Items on component mount ---
    useEffect(() => {
        const loadUserDataAndCart = async () => {
            setLoading(true);
            const storedUser = localStorage.getItem("userProfile");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserProfile(parsedUser);
                // Set shipping details mobile number from user profile if available
                setShippingDetails(prev => ({ ...prev, mobileNumber: parsedUser.mobileNumber || '' }));

                if (parsedUser.mobileNumber) {
                    await fetchCartItems(parsedUser.mobileNumber);
                } else {
                    setError("User profile found but mobile number is missing. Cannot fetch cart.");
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setShowLoginPrompt(true); // No user, show login prompt
            }
        };

        loadUserDataAndCart();
    }, [fetchCartItems]); // Dependency array includes fetchCartItems

    // Calculate total price from actual cart items
    // Razorpay expects amount in paisa (1 INR = 100 paisa)
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    const amountInPaisa = totalPrice * 100;


    // Handle input changes for shipping details
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prevDetails => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    // Function to initiate Razorpay payment
    const initiateRazorpayPayment = useCallback(async (orderData) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount, // Amount in paisa
            currency: orderData.currency,
            name: "ElectraHub", // Your company name
            description: "By Vaibhav Khapra",
            order_id: orderData.id, // Order ID from your backend Razorpay order creation
            handler: async function (response) {
                // This function is called after successful payment
                setIsProcessingOrder(true);
                try {
                    // Verify payment signature on your backend
                    const verificationResponse = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            // Pass other necessary data to your order placement API
                            userId: userProfile.mobileNumber,
                            cartItems: cartItems,
                            shippingDetails: shippingDetails,
                            totalPrice: totalPrice,
                        }),
                    });

                    if (!verificationResponse.ok) {
                        const errorData = await verificationResponse.json();
                        throw new Error(errorData.message || 'Payment verification failed.');
                    }

                    const verificationResult = await verificationResponse.json();

                    if (verificationResult.success) {
                        setOrderPlaced(true);
                        setOrderPlacedOrderId(verificationResult.orderId); // Get your internal order ID
                        setShowConfirmationModal(true);
                        setCartItems([]); // Clear cart items locally
                    } else {
                        setOrderError(verificationResult.message || 'Payment verification failed.');
                        setShowConfirmationModal(true);
                    }
                } catch (error) {
                    console.error("Error verifying payment:", error);
                    setOrderError(error.message || 'An error occurred during payment verification.');
                    setShowConfirmationModal(true);
                } finally {
                    setIsProcessingOrder(false);
                }
            },
            prefill: {
                name: shippingDetails.fullName,
                email: userProfile?.email || '', // Assuming email is part of userProfile
                contact: shippingDetails.mobileNumber,
            },
            notes: {
                address: `${shippingDetails.addressLine1}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.zipCode}`,
            },
            theme: {
                color: "#4F46E5" // Indigo color
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }, [RAZORPAY_KEY_ID, userProfile, cartItems, shippingDetails, totalPrice]); // Add all dependencies

    // Handle form submission (Place Order)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userProfile?.mobileNumber) {
            setOrderError("Please log in to place an order.");
            setShowConfirmationModal(true);
            return;
        }

        if (cartItems.length === 0) {
            setOrderError("Your cart is empty. Please add items before placing an order.");
            setShowConfirmationModal(true);
            return;
        }

        setIsProcessingOrder(true);
        setOrderError(null);

        try {
            // Step 1: Create a Razorpay order on your backend
            const response = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountInPaisa,
                    currency: 'INR',
                    receipt: userProfile.mobileNumber + '_' + Date.now(), // Unique receipt ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to create Razorpay order: ${response.status}`);
            }

            const razorpayOrder = await response.json();

            // Step 2: Initiate Razorpay payment with the order details
            await initiateRazorpayPayment(razorpayOrder);

        } catch (error) {
            console.error("Error during order creation or payment initiation:", error);
            setOrderError(error.message || 'An unexpected error occurred. Please try again.');
            setShowConfirmationModal(true);
        } finally {
            setIsProcessingOrder(false);
        }
    };

    // Confirmation Modal Component (replaces alert/confirm)
    const ConfirmationModal = ({ message, type, onClose }) => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                {type === 'success' ? (
                    <div className="w-16 h-16 text-green-500 mx-auto mb-4">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                ) : (
                    <div className="w-16 h-16 text-red-500 mx-auto mb-4">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                )}
                <h3 className={`text-2xl font-bold ${type === 'success' ? 'text-green-800' : 'text-red-800'} mb-4`}>
                    {type === 'success' ? 'Order Placed!' : 'Order Failed!'}
                </h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="inline-block bg-indigo-700 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md cursor-pointer"
                >
                    {type === 'success' ? 'Continue Shopping' : 'Close'}
                </button>
            </div>
        </div>
    );

    // --- Conditional Rendering ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Loading your cart for checkout...</p>
                </div>
            </div>
        );
    }

    if (showLoginPrompt) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                    <h3 className="text-2xl font-bold text-indigo-800 mb-4">Please Log In</h3>
                    <p className="text-gray-700 mb-6">You need to be logged in to proceed to checkout.</p>
                    <Link href="/login" passHref>
                        <span className="inline-block bg-indigo-700 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md cursor-pointer">
                            Go to Login
                        </span>
                    </Link>
                    <button
                        onClick={() => setShowLoginPrompt(false)}
                        className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 rounded-lg bg-white shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Checkout</h2>
                    <p className="text-gray-700">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-indigo-700 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Only show empty cart if order hasn't been placed AND cart is actually empty
    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto">
                    <p className="text-xl text-gray-700 mb-6">Your cart is empty!</p>
                    <Link href="/products" passHref>
                        <span className="inline-block bg-indigo-700 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md cursor-pointer">
                            Start Shopping
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 font-inter">
            <div className="container mx-auto mt-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Details Form */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-indigo-800 mb-6">Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={shippingDetails.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                <input
                                    type="text"
                                    id="addressLine1"
                                    name="addressLine1"
                                    value={shippingDetails.addressLine1}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="123 Main St"
                                />
                            </div>

                            {/* Address Line 2 (Optional) */}
                            <div>
                                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    id="addressLine2"
                                    name="addressLine2"
                                    value={shippingDetails.addressLine2}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Apt 4B"
                                />
                            </div>

                            {/* City, State, Zip Code */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={shippingDetails.city}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="New Delhi"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={shippingDetails.state}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Delhi"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={shippingDetails.zipCode}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="110001"
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={shippingDetails.country}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="India"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={shippingDetails.mobileNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="9876543210"
                                />
                            </div>

                            {/* Place Order Button */}
                            <button
                                type="submit"
                                className="w-full bg-indigo-700 text-white font-bold py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-lg flex items-center justify-center"
                                disabled={isProcessingOrder || cartItems.length === 0} // Disable if processing or cart is empty
                            >
                                {isProcessingOrder ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                        Processing Payment...
                                    </>
                                ) : (
                                    'Pay with Razorpay'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
                        <h2 className="text-2xl font-bold text-indigo-800 mb-6">Order Summary</h2>
                        {cartItems.map((item) => (
                            <div key={item.productId} className="flex justify-between items-center text-gray-700 mb-2">
                                <span className="text-sm">{item.productName} (x{item.quantity})</span>
                                <span className="font-medium">₹{(item.productPrice * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 my-4"></div>
                        <div className="flex justify-between text-gray-700 mb-2">
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-gray-700 mb-2">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between text-gray-700 mb-4">
                            <span>Taxes</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-xl text-indigo-800">
                            <span>Total</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirmationModal && (
                    <ConfirmationModal
                        message={orderPlaced ? `Your order has been placed successfully! Order ID: ${orderPlacedOrderId}` : orderError}
                        type={orderPlaced ? 'success' : 'error'}
                        onClose={() => {
                            setShowConfirmationModal(false);
                            if (orderPlaced) {
                                router.push('/products'); // Redirect to products page after successful order
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}