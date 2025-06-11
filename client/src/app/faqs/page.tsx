'use client';

import { useState } from "react";

const faqs = [
  {
    question: 'How does the waitlist system work?',
    answer:
      'Customers join the waitlist online or in-store. Staff manage the list in real-time, and customers receive SMS or in-app updates.',
  },
  {
    question: 'Can I manage multiple restaurants?',
    answer:
      'Yes. Admin users can manage multiple restaurant locations under one account.',
  },
  {
    question: 'Do customers need an account to join the waitlist?',
    answer:
      'Yes. Customers can join using their name, email and phone number.',
  },
  {
    question: 'How do I update my restaurant info?',
    answer:
      'Admins can go to the dashboard, navigate to "Restaurant Settings", and update name, hours, and contact details.',
  },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    
    return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-8">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border rounded-md shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-4 py-3 font-medium hover:bg-red-50 transition"
            >
              {faq.question}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  ); 
}