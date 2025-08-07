"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { IRestaurant } from "@/types/restaurant";
import { IMenuItem } from "@/types/menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import WaitlistManager from "@/components/WaitlistManager";
import { Star } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import MemoryMatchPage from "@/app/games/memory-match/page";
import GuessGamePage from "@/app/games/guess-dish/page";
import SpinGamePage from "@/app/games/spin-wheel/page";
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function RestaurantInfoPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [src, setSrc] = useState("/restaurant_logo.png");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const categories = [
    "Appetizer",
    "Main Course",
    "Dessert",
    "Beverage",
    "Side",
  ];
  const [isValidRestaurant, setIsValidRestaurant] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gameTriggered, resetGame } = useGameContext();
  // eslint-disable-next-line react/jsx-key
  const games = [<MemoryMatchPage />, <GuessGamePage />, <SpinGamePage />];
  const [gameIndex, setGameIndex] = useState(0);
  const [randomGame, setRandomGame] = useState(games[0]); // Default to Game 1

  const newGame = () => {
    const nextIndex = (gameIndex + 1) % games.length;
    setGameIndex(nextIndex);
    setRandomGame(games[nextIndex]);
  };

  // Helper function to check if restaurant is currently open
  const isRestaurantOpen = (): boolean => {
    if (!restaurant?.hours || restaurant.hours.length === 0) {
      return true; // If no hours set, assume always open
    }

    const now = new Date();
    const currentDay = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

    const todayHours = restaurant.hours.find(
      (h: { day: string; open: string; close: string }) =>
        h.day.toLowerCase() === currentDay
    );
    if (!todayHours) {
      return false; // No hours for today
    }

    return (
      todayHours.open &&
      todayHours.close &&
      currentTime >= todayHours.open &&
      currentTime <= todayHours.close
    );
  };

  // Synchronously trigger 404 page
  if (!isValidRestaurant) {
    notFound();
  }

  // useEffect to fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/restaurants/${id}`);

        if (!res.ok) {
          // If restaurant is not found (404 from API), trigger the Next.js 404 page
          setIsValidRestaurant(false);
          return;
        }

        const data = await res.json();
        setRestaurant(data.restaurant);

        if (data.restaurant.logoUrl) {
          setSrc(data.restaurant.logoUrl);
        }

        // Fetch the menu items for the restaurant
        const menuRes = await fetch(
          `${apiUrl}/api/menus/restaurant/${data.restaurant._id}`
        );
        const menuData = await menuRes.json();
        console.log("Menu Data:", menuData);
        if (menuData.menu?.menuItems) {
          setMenuItems(menuData.menu.menuItems);
        }

        // Fetch reviews for the restaurant
        const reviewsRes = await fetch(
          `${apiUrl}/api/reviews/restaurant/${data.restaurant._id}`
        );
        const reviewData = await reviewsRes.json();
        const fetchedReviews = reviewData.reviews || [];
        setReviews(fetchedReviews);

        // Calculate average rating
        if (fetchedReviews.length > 0) {
          const total = fetchedReviews.reduce(
            (sum: number, review: Review) => sum + review.rating,
            0
          );
          const avg = total / fetchedReviews.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        // If there's an error fetching the restaurant, trigger the Next.js 404 page
        setIsValidRestaurant(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  // If restaurant is not loaded yet, show loading state
  if (!restaurant) return <p className="p-6">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Restaurant Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {restaurant.name}
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Average Rating Stars */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(averageRating) ? "#fbbf24" : "none"}
                    stroke="#fbbf24"
                  />
                ))}
                <span className="text-sm text-gray-700 font-medium">
                  {averageRating.toFixed(1)} / 5
                </span>
                {/* Scroll to Reviews Button */}
                <button
                  className="text-blue-600 hover:text-red-500 text-sm underline"
                  onClick={() =>
                    reviewSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  See Reviews
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid xl:grid-cols-2 lg:grid-cols-2 gap-6 items-center">
          {restaurant ? (
            <>
              {/* Logo on the left */}
              <div className="relative lg:w-full h-48 md:h-full md:w-[150px] max-h-[250px] justify-center">
                <Image
                  src={src}
                  alt="Restaurant Logo"
                  fill
                  className="object-contain"
                  onError={() => setSrc("/restaurant_logo.png")}
                />
              </div>

              {/* Restaurant details in the middle */}
              {Array.isArray(restaurant.hours) &&
              restaurant.hours.length > 0 ? (
                <div className="md:h-full space-y-2">
                  <h2 className="text-xl font-bold text-gray-800">Address</h2>
                  <p className="text-gray-700">
                    {restaurant.location.address}, {restaurant.location.city},{" "}
                    {restaurant.location.region} {restaurant.location.zip}
                  </p>
                  <p className="text-gray-700">
                    Call: {restaurant.phone.slice(0, 3)}-
                    {restaurant.phone.slice(3, 6)}-{restaurant.phone.slice(6)}
                  </p>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Operating Hours
                    </h2>
                    <ul className="mt-2 text-sm text-gray-700 divide-y">
                      {restaurant.hours.map((hour) => (
                        <li
                          key={hour.day}
                          className="flex justify-between py-1 w-72 text-gray-700"
                        >
                          <span className="font-medium">{hour.day}</span>
                          <span>
                            {hour.open && hour.close
                              ? `${hour.open} - ${hour.close}`
                              : "Closed"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 mt-4">
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Operating Hours
                    </h3>
                    <p className="mb-1">Operating hours not set.</p>
                  </div>
                </div>
              )}

              <div className="col-span-1 md:col-span-3 mt-6">
                <WaitlistManager
                  restaurantId={restaurant._id}
                  restaurantName={restaurant.name}
                  isOpen={isRestaurantOpen()}
                />
              </div>
            </>
          ) : null}
          {gameTriggered ? (
            <div className="col-span-1 md:col-span-3 mt-6">
              {randomGame}

              <button
                onClick={() => newGame()}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                New Game
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <br />

      <Card className="mb-6 bg-red-100">
        <CardHeader>
          <CardTitle className="text-2xl text-center ">
            Restaurant Menu
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Menu Items */}
      {menuItems.length === 0 ? (
        // Case: No menu at all
        <Card className="mb-6">
          <CardContent>
            <p className="text-gray-500 text-center">
              No menu available for this restaurant.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Case: Some categories have menu items
        categories.map((category) => {
          const items = menuItems.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">{category}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded p-4 bg-white shadow-sm"
                  >
                    <div className="w-full max-w-[250px] mx-auto aspect-[4/3] relative mb-2">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded mb-2 flex items-center justify-center mx-auto">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">{item.name}</h4>
                      <p className="text-md text-gray-800 mb-2">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ingredients: {item.ingredients}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Reviews Section */}
      <Card ref={reviewSectionRef} className="mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div>
                  <p className="font-medium">
                    {review.userId?.name || "Anonymous"} -{" "}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {review.userId?.email}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? "#fbbf24" : "none"}
                      stroke="#fbbf24"
                    />
                  ))}
                </div>
                <p className="mt-2">{review.comment}</p>
                {review.response && (
                  <div className="mt-2 p-2 rounded bg-gray-100">
                    <p className="text-sm font-semibold text-gray-700">
                      Owner’s Response:
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {review.response.comment}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.response.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
