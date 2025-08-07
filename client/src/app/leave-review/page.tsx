// src/app/leave-review/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Star } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function LeaveReviewPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!restaurantId) return alert("Restaurant ID missing!");

    try {
      const token = user?.token;
      setSubmitting(true);

      // Debugging log
      //   console.log("Submitting review with:", {
      //     restaurantId,
      //     rating,
      //     comment,
      //     token,
      //   });

      const res = await fetch(`${apiUrl}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });

      if (res.status === 404) {
        // Redirect to custom 404 page
        window.location.href = "/404"; // or use your routing method
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        if (
          res.status === 400 &&
          errorData.message?.includes("already reviewed")
        ) {
          alert("You have already submitted a review for this restaurant.");
          return;
        }
        throw new Error(errorData.message || "Failed to submit review");
      }
      setSubmitted(true);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-green-600 font-medium">
              Thank you! Your review was submitted.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Rate your experience:
              </p>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                  >
                    <Star
                      size={32}
                      fill={i < rating ? "#fbbf24" : "none"}
                      stroke="#fbbf24"
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                placeholder="Leave your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              />

              <button
                onClick={handleSubmit}
                disabled={submitting || !rating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
