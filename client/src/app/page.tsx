"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Clock,
  Smartphone,
  Users,
  QrCode,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      // User is logged in, redirect to restaurant registration
      router.push("/restaurant-registration");
    } else {
      // User is not logged in, redirect to sign up
      router.push("/auth?mode=signup");
    }
  };

  const handleContactSales = () => {
    if (user) {
      // User is logged in, redirect to restaurant registration
      router.push("/restaurant-registration");
    } else {
      // User is not logged in, redirect to sign up
      router.push("/auth?mode=signup");
    }
  };
  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-red-50 via-white to-red-50 pt-20 pb-32'>
        <div className='absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]' />
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6'>
              Transform Your
              <span className='text-red-600 block'>Restaurant Experience</span>
            </h1>
            <p className='text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Eliminate long lines and boost customer satisfaction with our
              intelligent waitlist management platform. Join the queue
              digitally, get real-time updates.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Button
                size='lg'
                onClick={handleAuthAction}
                className='bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
              >
                Start Free Trial
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                onClick={handleAuthAction}
                className='border-red-200 text-red-600 hover:bg-red-50 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300'
              >
                Register Restaurant
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className='flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <span>No Setup Fees</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <span>14-Day Free Trial</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Why Choose Queneca?
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Modern restaurants need modern solutions. Our platform delivers
              everything you need to manage waitlists efficiently.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <QrCode className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>QR Code Integration</CardTitle>
                <CardDescription>
                  Customers scan and join instantly. No app downloads required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <Smartphone className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>Real-Time Updates</CardTitle>
                <CardDescription>
                  Automatic notifications keep customers informed about their
                  wait status.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <Users className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>Staff Dashboard</CardTitle>
                <CardDescription>
                  Intuitive interface for staff to manage tables and waitlists
                  efficiently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <Clock className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>Wait Time Estimates</CardTitle>
                <CardDescription>
                  Accurate predictions help customers plan their time better.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <BarChart3 className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track performance metrics and optimize your restaurant
                  operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg group'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors'>
                  <Shield className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle className='text-xl'>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with 99.9% uptime guarantee.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              How It Works
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                1
              </div>
              <h3 className='text-xl font-semibold mb-4'>Customer Scans QR</h3>
              <p className='text-gray-600'>
                Place QR codes at your entrance. Customers scan to instantly
                join the digital waitlist.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                2
              </div>
              <h3 className='text-xl font-semibold mb-4'>
                Staff Manages Queue
              </h3>
              <p className='text-gray-600'>
                Your team uses our dashboard to seat customers and update wait
                times in real-time.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6'>
                3
              </div>
              <h3 className='text-xl font-semibold mb-4'>
                Automatic Notifications
              </h3>
              <p className='text-gray-600'>
                Customers receive updates when their table is ready, improving
                their experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-20 bg-red-600 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='text-4xl md:text-5xl font-bold mb-2'>50K+</div>
              <div className='text-red-100'>Customers Served</div>
            </div>
            <div>
              <div className='text-4xl md:text-5xl font-bold mb-2'>200+</div>
              <div className='text-red-100'>Restaurants</div>
            </div>
            <div>
              <div className='text-4xl md:text-5xl font-bold mb-2'>35%</div>
              <div className='text-red-100'>Reduced Wait Times</div>
            </div>
            <div>
              <div className='text-4xl md:text-5xl font-bold mb-2'>4.9★</div>
              <div className='text-red-100'>Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Choose the plan that fits your restaurant size. All plans include
              our core features.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            {/* Starter Plan */}
            <Card className='border-gray-200 relative'>
              <CardContent className='pt-6'>
                <div className='text-center mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    Starter
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Perfect for small restaurants
                  </p>
                  <div className='text-4xl font-bold text-gray-900 mb-2'>
                    $29<span className='text-lg text-gray-600'>/month</span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    Up to 50 customers/day
                  </p>
                </div>
                <ul className='space-y-3 mb-6'>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    QR Code Integration
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Real-time Updates
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Basic Analytics
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Email Support
                  </li>
                </ul>
                <Button
                  className='w-full border-red-200 text-red-600 hover:bg-red-50'
                  variant='outline'
                  onClick={handleAuthAction}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className='border-red-200 relative scale-105 shadow-lg'>
              <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                <span className='bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold'>
                  Most Popular
                </span>
              </div>
              <CardContent className='pt-6'>
                <div className='text-center mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    Professional
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Ideal for busy restaurants
                  </p>
                  <div className='text-4xl font-bold text-gray-900 mb-2'>
                    $79<span className='text-lg text-gray-600'>/month</span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    Up to 200 customers/day
                  </p>
                </div>
                <ul className='space-y-3 mb-6'>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Everything in Starter
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Advanced Analytics
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    SMS Notifications
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Priority Support
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Custom Branding
                  </li>
                </ul>
                <Button
                  className='w-full bg-red-600 hover:bg-red-700 text-white'
                  onClick={handleAuthAction}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className='border-gray-200 relative'>
              <CardContent className='pt-6'>
                <div className='text-center mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    Enterprise
                  </h3>
                  <p className='text-gray-600 mb-4'>For restaurant chains</p>
                  <div className='text-4xl font-bold text-gray-900 mb-2'>
                    $199<span className='text-lg text-gray-600'>/month</span>
                  </div>
                  <p className='text-sm text-gray-500'>Unlimited customers</p>
                </div>
                <ul className='space-y-3 mb-6'>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Everything in Professional
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Multi-location Support
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    API Access
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Dedicated Support
                  </li>
                  <li className='flex items-center text-gray-600'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Custom Integrations
                  </li>
                </ul>
                <Button
                  className='w-full border-red-200 text-red-600 hover:bg-red-50'
                  variant='outline'
                  onClick={handleContactSales}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className='text-center mt-12'>
            <p className='text-gray-600 mb-4'>
              All plans include a 14-day free trial. No setup fees or hidden
              costs.
            </p>
            <p className='text-sm text-gray-500'>
              Need a custom solution?{" "}
              <Link
                href='/auth?mode=signup'
                className='text-red-600 hover:text-red-700 font-semibold'
              >
                Contact our sales team
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              What Our Customers Say
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <Card className='border-gray-200'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "Queneca transformed our busy restaurant. No more crowded
                  entrance, happier customers, and our staff can focus on
                  service."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-red-600 font-semibold'>SM</span>
                  </div>
                  <div className='ml-3'>
                    <div className='font-semibold'>Sarah Martinez</div>
                    <div className='text-sm text-gray-500'>
                      Manager, Bella Vista
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-gray-200'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "The QR code system is genius! Customers love being able to
                  wait elsewhere and get notified. Increased customer
                  satisfaction by 40%."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-red-600 font-semibold'>MC</span>
                  </div>
                  <div className='ml-3'>
                    <div className='font-semibold'>Mike Chen</div>
                    <div className='text-sm text-gray-500'>
                      Owner, Dragon Palace
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-gray-200'>
              <CardContent className='pt-6'>
                <div className='flex items-center mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "Setup was incredibly easy. Within an hour, we were managing
                  our waitlist digitally. The analytics help us optimize our
                  operations."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-red-600 font-semibold'>EJ</span>
                  </div>
                  <div className='ml-3'>
                    <div className='font-semibold'>Emily Johnson</div>
                    <div className='text-sm text-gray-500'>
                      GM, Coastal Grill
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-red-600 to-red-700 text-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to Transform Your Restaurant?
          </h2>
          <p className='text-xl mb-8 text-red-100'>
            Join hundreds of restaurants already using Queneca to improve their
            customer experience
          </p>
          <div className='flex justify-center'>
            <Link href='/auth?mode=signup'>
              <Button
                size='lg'
                variant='secondary'
                className='bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg'
              >
                Start Your Free Trial
                <Zap className='ml-2 h-5 w-5' />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
