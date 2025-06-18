"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type FAQ = {
  question: string;
  answer: string;
};

export default function AdminFAQEditor() {
  const { user } = useUser();
  const router = useRouter();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    fetch(`${apiUrl}/api/faqs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch FAQs.");
        return res.json();
      })
      .then(setFaqs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleChange = (index: number, key: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqs),
      });
      if (!res.ok) throw new Error("Failed to save FAQs");
      alert("FAQs saved successfully.");
        router.push("/faqs");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Edit FAQs</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded p-4 shadow-sm space-y-2"
          >
            <input
              type="text"
              value={faq.question}
              onChange={(e) => handleChange(index, "question", e.target.value)}
              placeholder="Question"
              className="w-full p-2 border rounded text-sm"
            />
            <textarea
              value={faq.answer}
              onChange={(e) => handleChange(index, "answer", e.target.value)}
              placeholder="Answer"
              className="w-full p-2 border rounded text-sm"
              rows={3}
            />
            <button
              onClick={() => removeFAQ(index)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            onClick={addFAQ}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Add FAQ
          </button>

          <button
            onClick={handleSave}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </main>
  );
}
