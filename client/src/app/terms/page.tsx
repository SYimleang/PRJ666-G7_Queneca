"use client";

import React, { useEffect, useState } from 'react';

const contactEmail = "support@queneca.com";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type TermsSection = {
  title: string;
  content: string[];
};

export default function TermsPage() {
  const [termsData, setTermsData] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/terms`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch terms');
        return res.json();
      })
      .then((data) => setTermsData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Terms of Use</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: June 2025</p>
      {/* Show Edit button only for admin */}
      <section className="space-y-10 text-gray-700 text-sm leading-6">
        {loading && <p>Loading terms...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading &&
          !error &&
          termsData.map((section, index) => (
            <div key={index}>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {section.title}
              </h2>
              {section.content.map((p, i) => (
                <p key={i} className="mb-3 whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ))}

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at{' '}
            <a href={`mailto:${contactEmail}`} className="text-red-500 hover:underline">
              {contactEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
