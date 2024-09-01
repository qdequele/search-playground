'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function Banner() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check localStorage when the component mounts
    const bannerStatus = localStorage.getItem('bannerClosed');
    if (bannerStatus === 'true') {
      setShowBanner(false);
    }
  }, []);

  const closeBanner = () => {
    setShowBanner(false);
    // Set the banner status in localStorage
    localStorage.setItem('bannerClosed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-grow text-center">
          <p className="text-sm sm:text-base font-medium inline-block">
            Try out Meilisearch Hybrid/Semantic search for free!{' '}
            <Link
              href="https://meilisearch.com/cloud"
              className="text-white underline underline-offset-2 font-semibold hover:text-pink-200 transition-colors duration-200 ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </Link>
          </p>
        </div>
        <button
          onClick={closeBanner}
          className="text-white hover:text-pink-200 transition-colors duration-200 ml-4"
          aria-label="Close banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}