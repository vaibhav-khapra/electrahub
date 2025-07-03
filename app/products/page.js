"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

// Star icon SVG component with animation
const StarIcon = ({ className }) => (
    <motion.svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </motion.svg>
);

// Loading skeleton for ProductCard - No changes needed, it's already well-designed.
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
const ProductCard = ({ product, addToCart }) => {
    const [isHovered, setIsHovered] = useState(false);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <StarIcon
                key={i}
                className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
            />
        ));
    };

    return (
        <motion.div
            className="border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white relative flex flex-col" // Changed border to gray-100, enhanced shadow on hover, added flex-col
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* New arrival badge */}
            {product.isNew && (
                <motion.div
                    className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-wide" // Slightly larger padding, uppercase
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    NEW
                </motion.div>
            )}

            {/* Out of stock overlay */}
            {!product.stock && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20 rounded-2xl"> {/* Increased opacity, rounded overlay */}
                    <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg text-gray-700"> {/* Enhanced styling */}
                        Out of Stock
                    </span>
                </div>
            )}

            <div className="relative overflow-hidden w-full flex-shrink-0"> {/* Added flex-shrink-0 */}
                <motion.img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4 bg-gray-50 rounded-t-xl"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/150x150/E0E0E0/333333?text=No+Image`;
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={isHovered ? { scale: 1.1 } : {}}
                />
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h3
                    className="text-xl font-semibold text-gray-900 mb-1 truncate" // Increased font size, darker text
                    title={product.name}
                >
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

                <div className="flex items-center mb-3">
                    <div className="flex">{renderStars(product.rating)}</div>
                    <span className="ml-2 text-sm text-gray-600"> {/* Increased text size */}
                        ({product.reviews} reviews)
                    </span>
                </div>

                <div className="flex items-baseline justify-between mb-4 mt-auto"> {/* Aligned price to baseline, added mt-auto */}
                    <p className="text-3xl font-extrabold text-gray-900"> {/* Increased font size and weight */}
                        Rs{" "}
                        {product.price.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                    {product.originalPrice && (
                        <p className="text-base text-gray-500 line-through ml-2"> {/* Increased text size, added ml-2 */}
                            Rs{" "}
                            {product.originalPrice.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    )}
                </div>

                <motion.button
                    onClick={() => product.stock ? addToCart(product) : null}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-lg transition-all duration-300 ease-in-out transform
                        ${product.stock
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`} // Refined gradient, increased padding, bolder text, enhanced shadow
                    disabled={!product.stock}
                    whileTap={product.stock ? { scale: 0.98, translateY: 2 } : {}} // Added slight translateY on tap
                >
                    {product.stock ? "Add to Cart" : "View Details"}
                </motion.button>
            </div>
        </motion.div>
    );
};

// Enhanced ProductSection with animations - Now accepts addToCart prop
const ProductSection = ({ title, products, limit = 4, sectionId, addToCart }) => {
    const router = useRouter(); // Initialize useRouter

    if (products.length === 0) return null;

    // Function to navigate to the "view all" page
    const handleViewAll = () => {
        router.push(`/products/view-all?section=${sectionId}`);
    };

    return (
        <motion.section
            className="mb-20 px-4 sm:px-6 lg:px-8" // Increased bottom margin, added horizontal padding
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center mb-10"> {/* Increased bottom margin */}
                <motion.h2
                    className="text-4xl font-extrabold text-gray-900 leading-tight" // Larger, bolder title, improved line height
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {title}
                </motion.h2>
                <motion.div
                    className="flex-1 h-1 bg-gradient-to-r from-blue-500 to-transparent ml-6 rounded-full" // Thicker line, rounded
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"> {/* Increased gap */}
                <AnimatePresence>
                    {products.slice(0, limit).map((product, index) => (
                        <motion.div
                            key={product._id || product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.5 }} // Slightly faster staggered animation
                            exit={{ opacity: 0, y: -20 }} // Added exit animation
                            layout
                        >
                            <ProductCard product={product} addToCart={addToCart} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {products.length > limit && (
                <div className="text-center mt-12"> {/* Increased top margin */}
                    <motion.button
                        className="bg-white text-blue-700 border-2 border-blue-600 py-3 px-8 rounded-full font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg" // Bolder border, larger padding, bolder text, enhanced shadow
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewAll}
                    >
                        View All {title.replace(/\(.*\)/, "").trim()}
                    </motion.button>
                </div>
            )}
        </motion.section>
    );
};

const ProductsPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [userProfile, setUserProfile] = useState(null);

    // Effect to load user profile from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("userProfile");
        if (storedUser) {
            setUserProfile(JSON.parse(storedUser));
        }
    }, []);

    // Add to Cart function
    const addToCart = async (product) => {
        if (!userProfile) {
            showMessage("Please log in to add items to your cart.", "error");
            return;
        }

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
            showMessage(result.message || `${product.name} added to cart successfully!`, "success"); // Show success message
        } catch (err) {
            console.error("Error adding to cart:", err);
            showMessage(`Failed to add ${product.name} to cart: ${err.message}`, "error"); // Show error message
        }
    };

    // Helper function to show messages
    const showMessage = (message, type = "info") => {
        const messageBox = document.getElementById("message-box");
        const messageText = document.getElementById("message-text");

        if (messageBox && messageText) {
            messageText.textContent = message;
            // Reset classes
            messageBox.className = `fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 transition-all duration-300 ease-out transform`;
            if (type === "success") {
                messageBox.classList.add("bg-green-600", "text-white", "translate-y-0", "opacity-100");
            } else if (type === "error") {
                messageBox.classList.add("bg-red-600", "text-white", "translate-y-0", "opacity-100");
            } else {
                messageBox.classList.add("bg-blue-600", "text-white", "translate-y-0", "opacity-100");
            }
            // Add initial hidden state for animation
            messageBox.classList.remove("hidden");
            // Set a timeout to hide and fade out the message
            setTimeout(() => {
                messageBox.classList.add("-translate-y-full", "opacity-0"); // Animate out
                setTimeout(() => {
                    messageBox.classList.add("hidden"); // Finally hide after animation
                }, 300); // Match transition duration
            }, 3000); // Hide after 3 seconds
        }
    };


    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/products");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    const sections = [
        {
            id: "smartphones-under-9999",
            title: "Smartphones Under Rs 9999",
            filter: (product) =>
                product.category === "Mobile" && product.price < 9999.99,
            sort: (a, b) => b.rating - a.rating,
            limit: 4,
        },
        {
            id: "laptops-under-25000",
            title: "Laptops Under Rs 25000",
            filter: (product) =>
                product.category === "Laptop" && product.price < 25000,
            sort: (a, b) => b.rating - a.rating,
            limit: 4,
        },
        {
            id: "top-rated-headphones",
            title: "Top Rated Headphones",
            filter: (product) =>
                product.category === "Headphones" &&
                product.stock === true &&
                product.rating >= 4,
            sort: (a, b) => b.rating - a.rating,
            limit: 4,
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
            limit: 4,
        },
        {
            id: "accessories-gadgets",
            title: "Accessories & Gadgets",
            filter: (product) =>
                ["Accessories", "Peripherals", "Storage", "Smart Home"].includes(
                    product.category
                ),
            sort: (a, b) => a.price - b.price,
            limit: 4,
        },
        {
            id: "premium-electronics",
            title: "Premium Electronics (Over Rs 30000)",
            filter: (product) => product.price >= 30000,
            sort: (a, b) => b.price - a.price,
            limit: 4,
        },
    ];

    const handleSearch = () => {
        if (searchTerm.trim()) {
            showMessage(`Searching for: "${searchTerm.trim()}"`, "info");
            setSearchTerm("");
        } else {
            showMessage("Please enter a search term.", "info");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 font-inter min-h-screen flex items-center justify-center bg-gray-50"> {/* Added bg-gray-50 */}
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
                className="container mx-auto px-4 py-8 font-inter flex flex-col items-center justify-center h-screen bg-gray-50" // Added bg-gray-50
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-md rounded-lg shadow-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                <motion.button
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200" // Added hover effect
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
        <div className="container mx-auto py-8 font-inter bg-gray-50 min-h-screen"> {/* Added min-h-screen for full height */}
            {/* Custom Message Box */}
            <div
                id="message-box"
                className="hidden fixed top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 ease-out opacity-0 transform -translate-y-full" // Initial hidden state for animation
            >
                <p id="message-text" className="text-lg font-semibold"></p>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1
                    className="text-5xl font-extrabold mt-10 mb-16 text-gray-900 text-center tracking-tight leading-tight px-4" // Larger, bolder, more spacing
                    initial={{ y: -30, opacity: 0 }} // More pronounced initial animation
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Discover Our Curated Collection
                </motion.h1>

                <div className="space-y-20"> {/* Increased space between sections */}
                    {sections.map((section, index) => {
                        const sectionProducts = allProducts
                            .filter(section.filter)
                            .sort(section.sort);

                        return (
                            <ProductSection
                                key={section.id}
                                title={section.title}
                                products={sectionProducts}
                                limit={section.limit}
                                sectionId={section.id}
                                addToCart={addToCart}
                            />
                        );
                    })}
                </div>

                <motion.section
                    className="text-center mt-24 mb-12 px-4" // Adjusted margins, added padding
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }} // Trigger earlier
                    transition={{ duration: 0.7 }}
                >
                    <section className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl shadow-xl border border-blue-100 max-w-3xl mx-auto"> {/* Enhanced background, larger padding, rounder corners, stronger shadow */}
                        <h2 className="text-4xl font-extrabold mb-6 text-gray-900 leading-snug"> {/* Larger, bolder, better line height */}
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-xl text-gray-700 mb-8 max-w-prose mx-auto"> {/* Larger text, slightly darker, max-width for readability */}
                            Use our powerful search to explore our entire catalog.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full"> {/* Ensured gap consistency */}
                            <input
                                type="text"
                                placeholder="e.g., 'Smartwatch', '4K TV', 'Noise Cancelling Headphones'" // More descriptive placeholder
                                className="w-full sm:flex-grow p-4 border border-gray-300 rounded-xl shadow-sm
                                    focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 outline-none" // Rounded input, no outline on focus, added transition
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => { // Allow searching on Enter key press
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                            />
                            <motion.button
                                onClick={handleSearch}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-10 rounded-xl font-bold text-lg
                                    hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0 transform active:scale-98" // Enhanced gradient, larger padding, bolder text, stronger hover/active effects
                                whileTap={{ scale: 0.98 }}
                            >
                                Search Products
                            </motion.button>
                        </div>
                    </section>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default ProductsPage;