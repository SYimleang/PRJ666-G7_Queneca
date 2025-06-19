"use client";

import { useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type FAQ = {
  question: string;
  answer: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/faqs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch FAQs.");
        return res.json();
      })
      .then((data) => setFaqs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-8">
        Frequently Asked Questions
      </h1>

      {loading && <p>Loading FAQs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-md shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-4 py-3 font-medium hover:bg-red-50 transition"
            >
              {faq.question}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
