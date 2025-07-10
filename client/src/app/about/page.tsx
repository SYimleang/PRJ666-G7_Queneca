// app/about-us/page.tsx
export default function AboutUsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-red-600 mb-4 text-center">About Queneca</h1>

      <p className="text-gray-700 mb-6">
        Our restaurant management platform was built with one goal in mind to help restaurants
        run smoother, serve faster, and delight every customer. Whether you&apos;re a small family-owned
        restaurant or a busy city eatery, our tools are designed to support your team.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Our Mission</h2>
      <p className="text-gray-700 mb-4">
        We aim to simplify restaurant operations with easy-to-use digital tools like waitlist
        management, staff coordination, and customer check-in all in one platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">What Makes Us Different</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
        <li>Fast and intuitive interface for both staff and customers</li>
        <li>QR code technology for instant customer check-in</li>
        <li>Built with security and privacy in mind</li>
        <li>Fully customizable to match your restaurant’s needs</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Meet the Team</h2>
      <p className="text-gray-700 mb-4">
        We’re a team of passionate developers, designers, and food lovers who believe great
        technology should be accessible to all restaurants.
        <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
          <li>
            <strong>Yasser Elmankabady</strong> - Project Leader
          </li>
          <li>
            <strong>Ario Nazemirad</strong> - Developer
          </li>
          <li>
            <strong>Marcus Brown</strong> - Developer
          </li>
          <li>
            <strong>Sasawat Yimleang</strong> - Developer
          </li>

        </ul>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p className="text-gray-700">
        Got questions or feedback? Email us at{" "}
        <a href="mailto:support@queneca.com" className="text-blue-600 underline">
          support@queneca.com
        </a>
        .
      </p>
    </main>
  );
}
