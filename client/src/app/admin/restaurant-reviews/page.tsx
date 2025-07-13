"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { Star } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ClientOnlyDate from "@/components/ui/client-date";

interface Review {
  _id: string;
  restaurantId: string;
  userId: {
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  response?: {
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
}

export default function RestaurantReviewsPage() {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = user?.token;
        console.log("Fetching reviews with token:", token);
        const res = await fetch(`${apiUrl}/api/reviews/restaurant`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await res.json();
        console.log("Fetched reviews:", data);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.token]);

  const handleResponse = async (reviewId: string) => {
    try {
      const token = user?.token;
      const comment = replyInputs[reviewId];
      const res = await fetch(`${apiUrl}/api/reviews/${reviewId}/respond`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to respond");
      }

      const updated = await res.json();
      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId ? updated.review : review
        )
      );
      setReplyInputs((prev) => ({
        ...prev,
        [reviewId]: "",
      }));
    } catch (err) {
      console.error("Failed to respond to review", err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <AdminNav />
      <Separator className="my-5" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Reviews</h1>
        <p className="text-gray-600">Respond to customer feedback</p>
      </div>

      {loading && <p>Loading staff...</p>}

      {reviews.map((review) => (
        <Card key={review._id} className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {review.userId?.name || "Anonymous"}{" "}
                  <span className="text-sm text-gray-500">
                    — <ClientOnlyDate date={review.createdAt} />
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  {review.userId?.email || "No email provided"}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? "#fbbf24" : "none"}
                      stroke="#fbbf24"
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{review.comment}</p>

            {review.response ? (
              <div className="p-3 rounded bg-gray-100">
                <p className="text-sm text-gray-700 font-semibold">
                  Your Response
                </p>
                <p className="text-gray-600 mt-1">{review.response.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <ClientOnlyDate date={review.response.createdAt} />
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={replyInputs[review._id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [review._id]: e.target.value,
                    }))
                  }
                  placeholder="Write your response..."
                />
                <Button
                  onClick={() => handleResponse(review._id)}
                  disabled={!replyInputs[review._id]}
                >
                  Respond
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
