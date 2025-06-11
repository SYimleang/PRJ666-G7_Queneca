"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-red-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Queneca</h2>
          <p className="text-sm">
            Making restaurant waitlists smarter and faster.
          </p>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold mb-2">About Us</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/our-story" className="hover:text-red-500">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-red-500">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-red-500">
                News
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/faqs" className="hover:text-red-500">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-red-500">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-red-500">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-2">Contact Us</h3>
          <p className="text-sm">
            Email:{" "}
            <a
              href="mailto:support@queneca.com"
              className="text-red-600 hover:underline"
            >
              support@queneca.com
            </a>
            <br />
            Phone: (647) 456-7890
            <br />
            Address: 123 Sample St., North York, ON M2J 2X5
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-200 text-center py-3 text-sm text-gray-600">
        © {currentYear} Queneca. All rights reserved.
      </div>
    </footer>
  );
}
