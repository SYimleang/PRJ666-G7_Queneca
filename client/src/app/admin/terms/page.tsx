'use client';

import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type TermsSection = {
  title: string;
  content: string[];
};

export default function TermsEditorPage() {
    const Router = useRouter();

  const [terms, setTerms] = useState<TermsSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Simulate fetching JSON from API
  useEffect(() => {
    fetch(`${apiUrl}/api/terms`)
      .then((res) => res.json())
      .then((data: TermsSection[]) => setTerms(data))
      .catch((err) => console.error('Error loading terms:', err));
  }, []);

  const handleTitleChange = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index].title = value;
    setTerms(newTerms);
  };

  const handleContentChange = (sectionIndex: number, contentIndex: number, value: string) => {
    const newTerms = [...terms];
    newTerms[sectionIndex].content[contentIndex] = value;
    setTerms(newTerms);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    try {
      // Replace with POST/PUT to backend
      await fetch(`${apiUrl}/api/terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terms),
      });
      alert('Terms of Use updated successfully!');
      Router.push('/terms');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Edit Terms of Use</h1>

      {terms.map((section, index) => (
        <div key={index} className="mb-8 space-y-3">
          <Input
            value={section.title}
            onChange={(e) => handleTitleChange(index, e.target.value)}
            className="font-semibold text-gray-800 text-lg"
          />
          {section.content.map((para, pIndex) => (
            <Textarea
              key={pIndex}
              rows={4}
              value={para}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleContentChange(index, pIndex, e.target.value)}
              className="w-full"
            />
          ))}
        </div>
      ))}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>

      {successMessage && (
        <p className="text-green-600 mt-4">{successMessage}</p>
      )}
    </main>
  );
}
