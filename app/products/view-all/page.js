// app/products/view-all/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Star icon SVG component with animation
const StarIcon = ({ className }) => (
    <motion.svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </motion.svg>
);

// Loading skeleton for ProductCard
const ProductCardSkeleton = () => (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
        <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 bg-gray-200 rounded"></div>
                ))}
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded-lg mt-4"></div>
        </div>
    </div>
);

// Enhanced ProductCard with animations - Now accepts addToCart prop
const ProductCard = ({ product, addToCart }) => { // Added addToCart prop
    const [isHovered, setIsHovered] = useState(false);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <StarIcon
                key={i}
                className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <motion.div
            className="border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-white relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* New arrival badge - assuming 'isNew' property exists in your product data */}
            {product.isNew && (
                <motion.div
                    className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    NEW
                </motion.div>
            )}

            {/* Out of stock overlay - assuming 'stock' property exists in your product data */}
            {!product.stock && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        Out of Stock
                    </span>
                </div>
            )}

            <div className="relative overflow-hidden">
                <motion.img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4 bg-gray-50 rounded-t-xl"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/E0E0E0/333333?text=No+Image`; }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={isHovered ? { scale: 1.1 } : {}}
                />
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.name}>
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

                <div className="flex items-center mb-3">
                    <div className="flex">
                        {renderStars(product.rating)}
                    </div>
                    <span className="ml-2 text-xs text-gray-600">({product.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                        Rs {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {/* Assuming 'originalPrice' property exists for discounts */}
                    {product.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                            Rs {product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    )}
                </div>

                <motion.button
                    onClick={() => product.stock ? addToCart(product) : null} // Call addToCart
                    className={`mt-auto w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-300
                        ${product.stock
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    disabled={!product.stock}
                    whileTap={product.stock ? { scale: 0.95 } : {}}
                >
                    {product.stock ? 'Add to Cart' : 'View Details'}
                </motion.button>
            </div>
        </motion.div>
    );
};


const ViewAllProductsPage = () => {
    const searchParams = useSearchParams();
    const sectionId = searchParams.get("section");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageTitle, setPageTitle] = useState("All Products");
    const [sectionNotFound, setSectionNotFound] = useState(false);
    // Add userProfile state
    const [userProfile, setUserProfile] = useState(null);

    // Effect to load user profile from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
            setUserProfile(JSON.parse(storedUser));
        }
    }, []); // Runs once on component mount

    // Define allSections here as well, so this page knows how to filter
    const allSections = [
        {
            id: "smartphones-under-9999",
            title: "Smartphones Under Rs 9999",
            filter: (product) =>
                product.category === "Mobile" && product.price < 9999.99,
            sort: (a, b) => b.rating - a.rating,
        },
        {
            id: "laptops",
            title: "Laptops",
            filter: (product) =>
                product.category === "Laptop",
            sort: (a, b) => b.rating - a.rating,
        },

        {
            id: "mobile",
            title: "Mobiles",
            filter: (product) =>
                product.category === "Mobile",
            sort: (a, b) => b.rating - a.rating,
        },

        {
            id: "headphones",
            title: "Headphones",
            filter: (product) =>
                product.category === "Headphones",
            sort: (a, b) => b.rating - a.rating,
        },
        {
            id: "laptops-under-25000",
            title: "Laptops Under Rs 25000",
            filter: (product) =>
                product.category === "Laptop" && product.price < 25000,
            sort: (a, b) => b.rating - a.rating,
        },
        {
            id: "top-rated-headphones",
            title: "Top Rated Headphones",
            filter: (product) =>
                product.category === "Headphones" &&
                product.stock === true &&
                product.rating >= 4,
            sort: (a, b) => b.rating - a.rating,
        },
        {
            id: "new-arrivals",
            title: "New Arrivals",
            filter: (product) =>
                product.isNew ||
                (product.createdAt &&
                    (new Date() - new Date(product.createdAt.$date || product.createdAt)) /
                    (1000 * 60 * 60 * 24) <
                    30),
            sort: (a, b) =>
                new Date(b.createdAt.$date || b.createdAt) -
                new Date(a.createdAt.$date || a.createdAt),
        },
        {
            id: "accessories-gadgets",
            title: "Accessories & Gadgets",
            filter: (product) =>
                ["Accessories", "Peripherals", "Storage", "Smart Home"].includes(
                    product.category
                ),
            sort: (a, b) => a.price - b.price,
        },
        {
            id: "premium-electronics",
            title: "Premium Electronics (Over Rs 30000)",
            filter: (product) => product.price >= 30000,
            sort: (a, b) => b.price - a.price,
        },
    ];

    // Add to Cart function
    const addToCart = async (product) => {
        if (!userProfile) {
            alert("Please log in to add items to your cart.");
            // Optionally redirect to login page if you have useRouter:
            // useRouter().push('/login');
            return;
        }
        // console.log(userProfile); // For debugging

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // You might send an authorization token here for protected routes
                    // 'Authorization': `Bearer ${userProfile.token}`
                },
                body: JSON.stringify({
                    userId: userProfile.mobileNumber, // Assuming userProfile has an ID
                    productId: product._id,
                    quantity: 1, // Default to 1, you can add quantity selection later
                    // Add any other relevant product details you want to store in the cart
                    productName: product.name,
                    productPrice: product.price,
                    productImage: product.imageUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message || `${product.name} added to cart successfully!`);
            // Optionally update local cart state or show a notification
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert(`Failed to add ${product.name} to cart: ${err.message}`);
          }
    };


    useEffect(() => {
        const fetchSectionProducts = async () => {
            setLoading(true);
            setError(null);
            setSectionNotFound(false); // Reset this state on new fetch

            try {
                const response = await fetch("/api/products");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (sectionId) {
                    const currentSection = allSections.find((sec) => sec.id === sectionId);
                    if (currentSection) {
                        setPageTitle(currentSection.title);
                        const filteredAndSortedProducts = data
                            .filter(currentSection.filter)
                            .sort(currentSection.sort);
                        setProducts(filteredAndSortedProducts);
                    } else {
                        // Section ID was provided but not found in allSections
                        setPageTitle("Section Not Found");
                        setProducts([]); // No products for an invalid section
                        setSectionNotFound(true);
                    }
                } else {
                    // No sectionId provided, show all products
                    setPageTitle("All Products");
                    setProducts(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionProducts();
    }, [sectionId]); // Refetch when sectionId changes


    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 font-inter min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center h-full"
                >
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            rotate: {
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear",
                            },
                            scale: {
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 1,
                            },
                        }}
                        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                    />
                    <motion.p
                        className="text-2xl text-gray-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Loading products...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="container mx-auto px-4 py-8 font-inter flex flex-col items-center justify-center h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-md rounded-lg shadow-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                <motion.button
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 font-inter bg-gray-50 min-h-screen">
            <motion.h1
                className="text-4xl mt-9 font-extrabold mb-12 text-gray-900 text-center"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {pageTitle}
            </motion.h1>

            {sectionNotFound ? (
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-gray-600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <svg
                        className="w-24 h-24 text-red-400 mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Oops! Section Not Found.
                    </h2>
                    <p className="text-lg mb-6 text-center">
                        The section you're looking for, <code className="font-mono bg-gray-200 px-1 rounded">"{sectionId}"</code>, doesn't seem to exist.
                        <br />Please check the URL or try one of our popular categories.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <motion.a
                            href="/products/view-all"
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View All Products
                        </motion.a>
                        <motion.a
                            href="/"
                            className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-semibold text-lg shadow-md hover:bg-gray-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Back to Homepage
                        </motion.a>
                    </div>
                </motion.div>
            ) : products.length === 0 ? (
                <motion.div
                    className="flex flex-col items-center justify-center py-20 text-gray-600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <svg
                        className="w-24 h-24 text-blue-400 mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19.428 15.428a2 2 0 00-2.828-2.828L10 18.172l-.707-.707m-4.243-4.243a2 2 0 00-2.828 2.828l.707.707 4.243 4.243a2 2 0 002.828-2.828L13 10.828l.707.707M10 21h4a2 2 0 002-2v-3a2 2 0 00-2-2h-4a2 2 0 00-2 2v3a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Oops! Nothing to see here... yet.
                    </h2>
                    <p className="text-lg mb-6">
                        It looks like there are no products in the "{pageTitle}" category right now.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <motion.a
                            href="/products/view-all"
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View All Products
                        </motion.a>
                        <motion.a
                            href="/"
                            className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg font-semibold text-lg shadow-md hover:bg-gray-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Back to Homepage
                        </motion.a>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                exit={{ opacity: 0 }}
                                layout
                            >
                                {/* Pass the addToCart function as a prop */}
                                <ProductCard product={product} addToCart={addToCart} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ViewAllProductsPage;