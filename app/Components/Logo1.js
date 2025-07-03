// logo1.js
import React from 'react';

/**
 * Logo1 React Component
 *
 * This component renders an SVG logo, designed to be centered within its
 * SVG container. It's suitable for use in Next.js applications.
 *
 * @returns {JSX.Element} The SVG logo as a React component.
 */
const Logo1 = () => {
    return (
        // The main SVG container.
        // width and height are set to allow the SVG to scale responsively.
        // viewBox defines the internal coordinate system and ensures the content
        // is displayed correctly regardless of the actual display size.
        <svg
            viewBox="0 0 163.8 89.70647972750378"
            className="w-full h-auto max-w-[250px]" // Tailwind for responsiveness
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* SVG Definitions block, typically for reusable elements like gradients or patterns */}
            <defs id="SvgjsDefs1013"></defs>

            {/* Group for the left part of the logo */}
            {/* The transform matrix scales and positions this group. */}
            {/* The values are adjusted to center the combined logo within the viewBox. */}
            <g
                id="SvgjsG1015"
                featurekey="nameLeftFeature-0"
                transform="matrix(2.5714285714285716,0,0,2.5714285714285716,40.14285714285714,12.857142857142856)"
                fill="#000000"
            >
                <path d="M9 11.5 l0 1 l-5.5 0 l0 4.5 l6.5 0 l0 1 l-7.5 0 l0 -12.5 l7.5 0 l0 1 l-6.5 0 l0 5 l5.5 0 z M10 8 l-4.6 0 l-1.06 -1 l5.66 0 l0 1 z M4 7.359999999999999 l1 0.98 l0 2.66 l-1 0 l0 -3.64 z M9 14 l-3.6 0 l-1.06 -1 l4.66 0 l0 1 z M4 13.36 l1 0.98 l0 2.16 l-1 0 l0 -3.14 z M10 19.5 l-7.5 0 l0 -1 l7.5 0 l0 1 z"></path>
            </g>

            {/* Group for the right part of the logo */}
            {/* The transform matrix scales and positions this group. */}
            {/* The values are adjusted to center the combined logo within the viewBox. */}
            <g
                id="SvgjsG1016"
                featurekey="nameRightFeature-0"
                transform="matrix(2.4,0,0,2.4,72.77142857142857,15)"
                fill="#000000"
            >
                <path d="M5.5 16.5 l0 3.5 l-3.5 0 l0 -15 l3.5 0 l0 8 l2.5 0 l0 -8 l3.5 0 l0 15 l-3.5 0 l0 -3.5 l-2.5 0 z M3.5 5.5 l-1 0 l0 14 l1 0 l0 -5 l5.64 0 l-1 -1 l-4.64 0 l0 -8 z M4 13 l1 0 l0 -7.5 l-1 0 l0 7.5 z M5.4 16 l4.6 0 l0 3.5 l1 0 l0 -14 l-1 0 l0 9.5 l-5.66 0 z M8.5 5.5 l0 7.64 l1 0.96 l0 -8.6 l-1 0 z M5 19.5 l0 -3.14 l-1 -1 l0 4.14 l1 0 z M9.5 16.5 l-1 0 l0 3 l1 0 l0 -3 z"></path>
            </g>
        </svg>
    );
};

export default Logo1;
