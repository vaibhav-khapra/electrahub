"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head'; // Re-added Head for Next.js specific functionality if needed elsewhere

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add userProfile state
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const bestsellers = products.filter(product => product.rating > 4);

  // New function to handle adding to cart
  const addToCart = async (product) => {
    if (!userProfile) {
      alert("Please log in to add items to your cart.");
      // Optionally redirect to login page
      // router.push('/login');
      return;
    }
    console.log(userProfile)
    

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


  return (
    <>
      <Head>
        <title>Electrahub - Discover What's Next. Shop Smarter.</title>
        <meta name="description" content="Curated collections, unbeatable prices, and a seamless shopping experience at Electrahub." />
      </Head>

      <main className="min-h-screen bg-gray-50 text-gray-800 font-inter">
        <section className="relative bg-gradient-to-r from-indigo-900 to-blue-900 text-white py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between z-10 relative">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
                Discover What's Next. <br className="hidden md:block" />Shop Smarter.
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 mb-8 animate-fade-in-up delay-200">
                Curated collections, unbeatable prices, and a seamless shopping experience.
              </p>
              <Link href="/products" passHref>
                <span className="inline-block bg-yellow-500 text-indigo-900 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in-up delay-400 cursor-pointer">
                  Shop All Products
                </span>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end animate-fade-in-right">
              <img
                src="/heroimage.png"
                alt="Featured Products"
                className="max-w-xs md:max-w-md lg:max-w-lg rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500 opacity-10 rounded-full animate-pulse-slow"></div>
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-400 opacity-10 rounded-full animate-pulse-slow delay-500"></div>
            </div>
          </div>
        </section>
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto scrollbar-hide">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold pb-4 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Explore Cutting-Edge Electronics
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover premium technology across all categories to elevate your digital lifestyle
              </p>
            </div>

            {/* Horizontal Scrolling Container */}
            <div className="flex overflow-x-auto pb-6 -mx-4 sm:mx-0 lg:mx-0 mb-12 scrollbar-hide">
              <div className="flex flex-nowrap space-x-6 px-4 sm:px-0 lg:px-0">
                {/* Category Cards - These are static for now, but could also be fetched */}
                {/* Smartphones */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Smartphones</h3>
                    <p className="text-gray-600 mb-3">Latest models with premium features</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      From ₹15,000
                    </span>
                  </div>
                </div>

                {/* Laptops & PCs */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Laptops & PCs</h3>
                    <p className="text-gray-600 mb-3">Powerful computing for work and play</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      From ₹30,000
                    </span>
                  </div>
                </div>

                {/* Audio Devices */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-yellow-50 group-hover:bg-yellow-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">Audio Devices</h3>
                    <p className="text-gray-600 mb-3">Immersive sound experiences</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      From ₹800
                    </span>
                  </div>
                </div>

                {/* Televisions */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">Televisions</h3>
                    <p className="text-gray-600 mb-3">Crystal-clear viewing experience</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                      From ₹12,000
                    </span>
                  </div>
                </div>

                {/* Wearables */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Wearables</h3>
                    <p className="text-gray-600 mb-3">Tech that moves with you</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                      From ₹2,500
                    </span>
                  </div>
                </div>

                {/* Cameras & Drones */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-pink-50 group-hover:bg-pink-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">Cameras & Drones</h3>
                    <p className="text-gray-600 mb-3">Capture life's moments perfectly</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800">
                      From ₹10,000
                    </span>
                  </div>
                </div>

                {/* Gaming */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">Gaming</h3>
                    <p className="text-gray-600 mb-3">Next-level gaming gear</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800">
                      From ₹5,000
                    </span>
                  </div>
                </div>

                {/* Smart Home */}
                <div className="flex-none w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4 rounded-full bg-cyan-50 group-hover:bg-cyan-100 transition-colors duration-300">
                      <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">Smart Home</h3>
                    <p className="text-gray-600 mb-3">Automate your living space</p>
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-cyan-100 text-cyan-800">
                      From ₹1,200
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transform hover:-translate-y-1">
                Browse All Categories
                <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>


        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo-900">
              Explore Our Popular Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Category Card 1 */}
              <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                <Link href="/products/view-all?section=mobile" passHref>
                  <span className="block cursor-pointer">
                    <img
                      src="./mobile.png"
                      alt="Mobile Phones"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-indigo-800">Mobile Phones</h3>
                      <p className="text-gray-600 text-sm mt-1">Apple, Samsung, OnePlus, and many more...</p>
                    </div>
                  </span>
                </Link>
              </div>
              {/* Category Card 2 */}
              <div className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                <Link href="products/view-all?section=laptops" passHref>
                  <span className="block cursor-pointer">
                    <img
                      src="laptops.png"
                      alt="Laptops"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-indigo-800">Laptops</h3>
                      <p className="text-gray-600 text-sm mt-1">HP, Macbook, Dell, and many more...</p>
                    </div>
                  </span>
                </Link>
              </div>
              {/* Category Card 3 */}
              <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <Link href="products/view-all?section=headphones" passHref>
                  <span className="block cursor-pointer">
                    <img
                      src="./speakers.png"
                      alt="Headphones & Speakers"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-indigo-800">Headphones & Speakers</h3>
                      <p className="text-gray-600 text-sm mt-1">boAt, JBL, Noise, and many more...</p>
                    </div>
                  </span>
                </Link>
              </div>
              {/* Category Card 4 */}
              <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <Link href="/category/tvs" passHref>
                  <span className="block cursor-pointer">
                    <img
                      src="./tv.png"
                      alt="TVs"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-indigo-800">TVs</h3>
                      <p className="text-gray-600 text-sm mt-1">LG, Samsung, and many more...</p>
                    </div>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- Featured Products Section --- */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo-900">
              Our Bestsellers
            </h2>
            {loading && <p className="text-center text-lg text-gray-700">Loading products...</p>}
            {error && <p className="text-center text-lg text-red-600">Error: {error}</p>}
            {!loading && !error && bestsellers.length === 0 && (
              <p className="text-center text-lg text-gray-700">No bestsellers found with a rating above 4.3.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {bestsellers.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group">
                  <Link href={`/product/${product._id}`} passHref>
                    <span className="block p-4 cursor-pointer">
                      <div className="bg-[#f5f5f5] rounded-xl p-6 flex items-center justify-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-40 object-contain transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </span>
                  </Link>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-800 mb-2 truncate">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.brand}{product.name.includes('(') ? `, ${product.name.split('(')[1].replace(')', '')}` : ''}
                        {product.rating ? ` | Rating: ${product.rating}` : ''}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-2xl font-bold text-yellow-600">₹{product.price.toLocaleString('en-IN')}</span>
                      {/* Changed to call the addToCart function */}
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-700 text-white text-sm px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300 shadow"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/products" passHref>
                <span className="inline-block border border-indigo-700 text-indigo-700 font-bold text-lg px-8 py-3 rounded-full hover:bg-indigo-700 hover:text-white transition duration-300 ease-in-out cursor-pointer">
                  View All Products
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Call to Action/Newsletter Signup (Optional) --- */}
        <section className="bg-indigo-800 text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated with Our Latest Arrivals!
            </h2>
            <p className="text-indigo-200 text-lg mb-8">
              Sign up for our newsletter to get exclusive deals and new product alerts.
            </p>
            <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow p-3 rounded-full bg-indigo-700 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-yellow-500 text-indigo-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors duration-300 shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>

        {/* --- Footer (Minimal for Landing Page, usually a separate component) --- */}
        <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
          <div className="container mx-auto px-6">
            <p>&copy; {new Date().getFullYear()} Electrahub. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}