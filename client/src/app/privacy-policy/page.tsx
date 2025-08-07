export default function PrivacyPolicyPage() {

    const contactEmail = "support@queneca.com";
    
    return (
    <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Privacy Policy</h1>
        <p className="mb-4">
            Queneca recognizes and respects the importance of maintaining the accuracy, security and privacy of your personal information. 
            This Privacy Policy is a statement of our guidelines and practices with respect to the collection, use, protection and disclosure of personal information collected through your use of the Queneca website and services.
        </p><br />

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Information Collection</h2>
        <p>
            We may collect personal information from you on our website, including, but not limited to, the following: 
            (a) to establish and manage your account, including to provide notifications to you regarding your account; 
            (b) to provide you information or support you request; 
            (c) to inform you about new services and solicit your adoption of these services; 
            (d) to help us develop new services and features that meet your needs; and 
            The information we request may include personally identifiable information such as your name, billing and shipping address, telephone number, e-mail address or credit card information. 
            It is solely your choice whether or not you provide this personally identifiable information. However, should you choose not to provide the information, we may be unable to process an order, fulfill a service or display certain content on the Site. 
            We do not sell or rent personal information, including personally identifiable information, to unrelated third parties.
        </p><br />

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Information Disclosure</h2>
        <p>
            We disclose personal information provided to us if required to do so by law or in the good-faith belief that such action is necessary. 
            These circumstances include, but are not limited to, the following: 
            (a) to respond to judicial process or to comply with legal process served on us; 
            (b) to protect the security and integrity of our website and services; 
            (c) to protect and defend our rights and property and the rights and property of others; 
            (d) to take precautions against liability; 
            (e) to respond to claims that submitted information violates the rights or interests of third parties; 
            (f) to correct technical problems and malfunctions in how the Site operates or processes visitors information; or 
            (i) pursuant to your specific direction in connection with a service we are providing on your behalf.
        </p><br />

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Access to Personal Information</h2>
        <p>
            You may access the information we collect from your registration via the Queneca website. Via the website, you may correct inaccuracies in the personal information (including name, address, contact and billing information) we obtained from your registration. 
            We require our customers to comply with applicable privacy laws and regulations pertaining to the use of our services.
        </p><br />

        <h2 className="text-lg font-semibold text-gray-800 mb-2">Use of Browser <q>Cookies</q></h2>
        <p>
            You may access the information we collect from your registration via the Queneca website. Via the website, you may correct inaccuracies in the personal information (including name, address, contact and billing information) we obtained from your registration. 
            We require our customers to comply with applicable privacy laws and regulations pertaining to the use of our services.
        </p><br />


      <h2 className="text-lg font-semibold text-gray-800 mb-2">Security</h2>
      <p>
        We utilize reasonable and appropriate protections and procedural safeguards to ensure that personal information in our care is not misused or accessed without authorization. 
        Personal information is stored on our own platforms or on the platforms of our service providers, with access restricted to those employees or contractors who have a need for such access to perform a legitimate business function relating to the services or for maintenance, internal security or related issues.
      </p><br />

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Customer Data</h2>
      <p>
        By using Queneca, you may submit data or information on your customers. 
        Queneca will not review, sell, share, distribute, or reference any such Customer Data in any personally identifiable way, except for the purposes of providing the services, preventing or addressing service or technical problems, at a Customer’s request in connection with customer support matters, or as may be required by law. 
        We reserve the right to publish or share aggregate data and statistics that do not contain personally identifiable information.
      </p><br />

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Third Party Web Sites</h2>
      <p>
        The Queneca website may contain links to third party websites. 
        While we try to link only to sites that share our high standards and respect for privacy, we are not responsible for the content or the privacy practices of any third party websites. 
        For this reason, we encourage you to review the privacy policies of these websites before disclosing any personal information to or through them.
      </p><br />

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Consent</h2>
      <p>
        By submitting personal information to Queneca or its affiliates and agents, you agree that we may collect, use and disclose such personal information in accordance with this privacy policy and a permitted or required by law. 
        Your use of the Queneca website and services signifies your assent to this Privacy Policy.
      </p><br />

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact</h2>
      <p>
        If you have questions or concerns about this Privacy Policy, or if you believe that we have acted contrary to this Privacy Policy, please notify us by email at 
        <a href={`mailto:${contactEmail}`} className="text-red-500 hover:underline">
              {contactEmail}
            </a>
      </p><br />
    </main>
  );
}