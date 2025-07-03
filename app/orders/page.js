"use client"; // This component needs client-side interactivity

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

export default function OrdersPage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const loadUserDataAndOrders = async () => {
            setLoading(true);
            const storedUser = localStorage.getItem("userProfile");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserProfile(parsedUser);

                if (parsedUser.mobileNumber) {
                    try {
                        // Fetch orders using the real API route
                        const response = await fetch(`/api/orders/user/${parsedUser.mobileNumber}`);
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        setOrders(data.data || []); // Assuming data.data contains the array of orders
                    } catch (err) {
                        console.error("Error fetching orders:", err);
                        setError(err.message);
                        setOrders([]);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setError("User profile found but mobile number is missing. Cannot fetch orders.");
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setShowLoginPrompt(true); // No user, show login prompt
            }
        };

        loadUserDataAndOrders();
    }, []); // Empty dependency array means this runs once on mount

    // Login Prompt Modal
    const LoginPromptModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                <h3 className="text-2xl font-bold text-indigo-800 mb-4">Please Log In</h3>
                <p className="text-gray-700 mb-6">You need to be logged in to view your orders.</p>
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

    // Conditional Rendering
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-700">Loading your orders...</p>
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
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
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
                <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">Your Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg mx-auto">
                        <p className="text-xl text-gray-700 mb-6">You haven't placed any orders yet!</p>
                        <Link href="/products" passHref>
                            <span className="inline-block bg-indigo-700 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow-md cursor-pointer">
                                Start Shopping
                            </span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-3">
                                    <h2 className="text-xl font-bold text-indigo-800">Order ID: {order.orderId}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                <p className="text-gray-600 mb-4">Total Price: ₹{order.totalPrice.toLocaleString('en-IN')}</p>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Items:</h3>
                                <ul className="space-y-2 mb-4">
                                    {order.items.map((item) => (
                                        <li key={item.productId} className="flex items-center justify-between text-gray-700">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.productImage || 'https://placehold.co/50x50/E0E7FF/4338CA?text=No+Image'}
                                                    alt={item.productName}
                                                    className="w-12 h-12 object-contain rounded mr-3"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/E0E7FF/4338CA?text=No+Image'; }}
                                                />
                                                <span>{item.productName} (x{item.quantity})</span>
                                            </div>
                                            <span className="font-medium">₹{(item.productPrice * item.quantity).toLocaleString('en-IN')}</span>
                                        </li>
                                    ))}
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Details:</h3>
                                <div className="text-gray-700 space-y-1">
                                    <p>{order.shippingDetails.fullName}</p>
                                    <p>{order.shippingDetails.addressLine1}</p>
                                    {order.shippingDetails.addressLine2 && <p>{order.shippingDetails.addressLine2}</p>}
                                    <p>{order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.zipCode}</p>
                                    <p>{order.shippingDetails.country}</p>
                                    <p>Mobile: {order.shippingDetails.mobileNumber}</p>
                                </div>

                                {/* You can add a "View Details" button if you have a /orders/[orderId] page */}
                                {/* <Link href={`/orders/${order.orderId}`} passHref>
                                    <span className="mt-4 inline-block bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors cursor-pointer">
                                        View Details
                                    </span>
                                </Link> */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
