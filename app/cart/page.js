// app/cart/page.js
"use client"; // This component needs client-side interactivity

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function CartPage() {
    const [userProfile, setUserProfile] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const router = useRouter(); // Initialize useRouter

    // Memoize fetchCartItems to prevent unnecessary re-creations
    const fetchCartItems = useCallback(async (mobileNumber) => {
        setLoading(true);
        setError(null);
        try {
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

    // --- Fetch User Profile and then Cart Items ---
    useEffect(() => {
        const loadUserData = async () => {
            setLoading(true); // Start loading when component mounts
            const storedUser = localStorage.getItem("userProfile");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserProfile(parsedUser);
                if (parsedUser.mobileNumber) {
                    await fetchCartItems(parsedUser.mobileNumber); // Fetch cart only if user and mobileNumber are present
                } else {
                    setError("User profile found but mobile number is missing.");
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setShowLoginPrompt(true); // No user, show login prompt
            }
        };

        loadUserData();
    }, [fetchCartItems]); // Dependency array includes fetchCartItems (due to useCallback)

    // --- Handle Quantity Update ---
    const handleQuantityChange = async (productId, newQuantity) => {
        if (!userProfile?.mobileNumber) {
            alert("Please log in to update your cart.");
            return;
        }

        if (newQuantity < 1) {
            if (window.confirm("Do you want to remove this item from your cart?")) {
                handleRemoveItem(productId);
            }
            return;
        }

        // Optimistically update UI
        setCartItems(currentItems =>
            currentItems.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            )
        );

        try {
            const response = await fetch('/api/cart', {
                method: 'POST', // Consider PATCH/PUT for specific updates
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userProfile.mobileNumber,
                    productId: productId,
                    quantity: newQuantity,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Re-fetch cart after successful update to ensure consistency
            await fetchCartItems(userProfile.mobileNumber);

        } catch (err) {
            console.error("Error updating cart item quantity:", err);
            // Revert optimistic update on error by re-fetching
            await fetchCartItems(userProfile.mobileNumber);
            alert(`Failed to update quantity: ${err.message}`);
        }
    };

    // --- Handle Item Removal ---
    const handleRemoveItem = async (productIdToRemove) => {
        if (!userProfile?.mobileNumber) {
            alert("Please log in to remove items from your cart.");
            return;
        }

        // Optimistically remove from UI
        setCartItems(currentItems =>
            currentItems.filter(item => item.productId !== productIdToRemove)
        );

        try {
            const response = await fetch('/api/cart/remove-item', { // Assuming a new route for removal
                method: 'POST', // Or DELETE for RESTful approach
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userProfile.mobileNumber,
                    productId: productIdToRemove,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Re-fetch cart after successful removal
            await fetchCartItems(userProfile.mobileNumber);

        } catch (err) {
            console.error("Error removing cart item:", err);
            // If removal fails, re-fetch to restore the item in UI
            await fetchCartItems(userProfile.mobileNumber);
            alert(`Failed to remove item: ${err.message}`);
        }
    };

    // --- Handle Checkout ---
    const handleCheckout = async () => {
        if (!userProfile?.mobileNumber) {
            alert("Please log in to proceed to checkout.");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            return;
        }

        // In a real application, you'd send this data to your backend
        // to create an order, handle payment, etc.
        console.log("Proceeding to checkout with items:", cartItems);
        console.log("Total price:", totalPrice);

        // Example: Redirect to a checkout page
        router.push('/checkout'); // Assuming you have a /checkout page
    };

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

    // --- Login Prompt Modal ---
    const LoginPromptModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                <h3 className="text-2xl font-bold text-indigo-800 mb-4">Please Log In</h3>
                <p className="text-gray-700 mb-6">You need to be logged in to view your cart.</p>
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

    // --- Conditional Rendering ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (showLoginPrompt) {
        return <LoginPromptModal />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 rounded-lg bg-white shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Cart</h2>
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

    return (
        <div className="min-h-screen bg-gray-100 py-10 font-inter">
            <div className="container mx-auto mt-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">Your Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto">
                        <p className="text-xl text-gray-700 mb-6">Your cart is empty!</p>
                        <Link href="/products" passHref>
                            <span className="inline-block bg-indigo-700 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md cursor-pointer">
                                Start Shopping
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-indigo-800 mb-6">Items in Your Cart</h2>
                            {cartItems.map((item) => (
                                <div key={item.productId} className="flex items-center border-b border-gray-200 py-4 last:border-b-0">
                                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={item.productImage || 'https://placehold.co/100x100/E0E7FF/4338CA?text=No+Image'}
                                            alt={item.productName}
                                            className="object-contain w-full h-full"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/E0E7FF/4338CA?text=No+Image'; }}
                                        />
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                                        <p className="text-gray-600">Price: ₹{item.productPrice}</p>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="bg-gray-100 text-gray-800 px-4 py-1 border-t border-b border-gray-200">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.productId)}
                                                className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                                                title="Remove item"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right font-bold text-lg text-indigo-700">
                                        ₹{(item.productPrice * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
                            <h2 className="text-2xl font-bold text-indigo-800 mb-6">Order Summary</h2>
                            <div className="flex justify-between text-gray-700 mb-2">
                                <span>Subtotal ({cartItems.length} items)</span>
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
                            <button
                                onClick={handleCheckout} // Add onClick handler here
                                className="mt-8 w-full bg-yellow-500 text-indigo-900 font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors duration-300 shadow-lg"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}