"use client";

import Link from "next/link";

const sections = [
  {
    number: "1",
    title: "Contact Information",
    content: (
      <>
        <p>
          Dhwani Astro may collect and store limited contact information where
          required for features offered through our platform.
        </p>

        <p className="mt-4">
          Where you permit access to your contacts, we may process information
          such as:
        </p>

        <ul>
          <li>First name</li>
          <li>Last name</li>
          <li>Mobile number</li>
        </ul>

        <p className="mt-4">
          This information may be used to identify or display contacts and
          support relevant communication-related features.
        </p>

        <p className="mt-4">
          We do not intend to collect information from your contacts beyond
          what is reasonably required for the relevant feature.
        </p>
      </>
    ),
  },

  {
    number: "2",
    title: "Why We Collect Your Phone Number",
    content: (
      <>
        <p>
          Your mobile number may be collected and used for the following
          purposes:
        </p>

        <h3 className="mt-6 font-semibold text-gray-900">
          Telephonic Calling
        </h3>

        <p className="mt-2">
          Your phone number may enable you to make or receive calls through
          features offered by Dhwani Astro. This functionality may be used to
          facilitate real-time interactions between users, astrologers,
          consultants, customer support, or other authorised participants.
        </p>

        <h3 className="mt-6 font-semibold text-gray-900">
          Chat and Service Alerts
        </h3>

        <p className="mt-2">
          We may use your registered mobile number to send notifications
          relating to your activity on Dhwani Astro, including:
        </p>

        <ul>
          <li>Chat alerts</li>
          <li>Consultation notifications</li>
          <li>Account notifications</li>
          <li>Service-related updates</li>
          <li>Security-related alerts</li>
        </ul>

        <h3 className="mt-6 font-semibold text-gray-900">
          OTP Verification
        </h3>

        <p className="mt-2">
          To help protect your account, Dhwani Astro may use One-Time Password
          (OTP) verification for activities such as:
        </p>

        <ul>
          <li>Login</li>
          <li>Registration</li>
          <li>Account recovery</li>
          <li>Identity verification</li>
          <li>Sensitive account changes</li>
        </ul>

        <p className="mt-4">
          An OTP may be sent to or communicated through your registered mobile
          number to verify your identity.
        </p>
      </>
    ),
  },

  {
    number: "3",
    title: "Your Privacy Matters to Us",
    content: (
      <p>
        Dhwani Astro values your privacy and takes the protection of your
        personal information seriously. We aim to use information only for
        legitimate purposes connected with providing, maintaining, securing,
        and improving our services.
      </p>
    ),
  },

  {
    number: "4",
    title: "How Your Data Is Used",
    content: (
      <>
        <p>
          The information and permissions required may depend on how you use
          Dhwani Astro. Where our platform provides calling functionality,
          certain device information or permissions may be required to enable
          calls and provide a smooth user experience.
        </p>

        <p className="mt-4">Information may be used to:</p>

        <ul>
          <li>Facilitate calls</li>
          <li>Enable communication features</li>
          <li>Authenticate accounts</li>
          <li>Provide OTP verification</li>
          <li>Deliver chat alerts</li>
          <li>Maintain account security</li>
          <li>Support platform functionality</li>
        </ul>
      </>
    ),
  },

  {
    number: "5",
    title: "Call Log Permission",
    content: (
      <>
        <p>
          Where required for an enabled feature, the Dhwani Astro application
          may request access to call-related information on your device. Such
          permission may be used to support calling or authentication
          functionality made available within the app.
        </p>

        <p className="mt-4">
          Dhwani Astro will only request such permission where it is necessary
          for a specific feature offered to the user.
        </p>

        <p className="mt-4">
          You may manage device permissions through your mobile-device
          settings. Disabling a permission may prevent the relevant feature
          from functioning correctly.
        </p>
      </>
    ),
  },

  {
    number: "6",
    title: "OTP Verification Through Call or Missed Call",
    content: (
      <>
        <p>
          Dhwani Astro may provide OTP verification using a phone call or
          missed-call verification mechanism.
        </p>

        <p className="mt-4">
          Where this feature is available, users may choose an option such as
          &quot;Get OTP on Call.&quot;
        </p>

        <p className="mt-4">
          A call may then be initiated or received to complete the verification
          process.
        </p>

        <p className="mt-4">
          For security purposes, call-based OTP verification may require the
          relevant mobile number and SIM card to be available on the device
          being used.
        </p>
      </>
    ),
  },

  {
    number: "7",
    title: "Voice Recording",
    content: (
      <>
        <p>
          Dhwani Astro may provide a feature that allows users to communicate
          through recorded voice messages.
        </p>

        <p className="mt-4">Instead of typing a question or message, users may choose to:</p>

        <ul>
          <li>Speak into their device</li>
          <li>Record an audio message</li>
          <li>Send the recording through chat</li>
          <li>Submit questions using their voice</li>
        </ul>

        <p className="mt-4">
          This functionality is intended to make communication more convenient
          and accessible.
        </p>
      </>
    ),
  },

  {
    number: "8",
    title: "Microphone Permission",
    content: (
      <>
        <p>
          To enable voice-message or audio-recording functionality, Dhwani
          Astro may request access to your device&apos;s microphone.
        </p>

        <p className="mt-4">
          When you grant microphone permission, the application may use the
          microphone to:
        </p>

        <ul>
          <li>Capture your voice</li>
          <li>Record audio when you activate the feature</li>
          <li>Convert that recording into digital audio</li>
          <li>
            Send the recording through the relevant chat or communication
            feature
          </li>
        </ul>

        <p className="mt-4">
          Dhwani Astro does not require continuous microphone access merely
          because the application is installed.
        </p>

        <p className="mt-4">
          Microphone access should be used in connection with features
          requiring audio input, subject to your device permissions.
        </p>
      </>
    ),
  },

  {
    number: "9",
    title: "Permission Controls",
    content: (
      <>
        <p>
          You can control certain permissions through your mobile-device
          settings.
        </p>

        <p className="mt-4">
          Depending on your device and operating system, these may include:
        </p>

        <ul>
          <li>Microphone</li>
          <li>Phone/call permissions</li>
          <li>Contacts</li>
          <li>Notifications</li>
        </ul>

        <p className="mt-4">
          If you deny or later withdraw a permission, some Dhwani Astro
          features associated with that permission may stop working.
        </p>
      </>
    ),
  },

  {
    number: "10",
    title: "Data Security",
    content: (
      <>
        <p>
          Dhwani Astro takes reasonable steps to protect information from
          unauthorised access, misuse, alteration, loss, or disclosure.
        </p>

        <p className="mt-4">
          However, no internet transmission or electronic storage method can be
          guaranteed to be completely secure.
        </p>

        <p className="mt-4">
          Users should also keep their account credentials, passwords, and
          OTPs confidential.
        </p>
      </>
    ),
  },

  {
    number: "11",
    title: "Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy periodically to reflect changes in
        Dhwani Astro features, technology, internal practices, or legal or
        regulatory requirements.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
            Dhwani Astro
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
            Your privacy matters to us. This Privacy Policy explains how Dhwani
            Astro collects, uses, and protects information when you use our
            platform and services.
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Last Updated: September 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                On this page
              </p>

              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.number}
                    href={`#section-${section.number}`}
                    className="block text-sm text-gray-500 transition hover:text-gray-900"
                  >
                    {section.number}. {section.title}
                  </a>
                ))}

                <a
                  href="#section-12"
                  className="block text-sm text-gray-500 transition hover:text-gray-900"
                >
                  12. Contact Us
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="max-w-3xl">

            {/* Privacy Intro */}
            <section className="mb-10 border-b border-gray-100 pb-10">
              <p className="text-sm leading-7 text-gray-600 md:text-base">
                Dhwani Astro LLP (&quot;Dhwani Astro&quot;, &quot;us&quot;,
                &quot;we&quot;, or &quot;our&quot;) is the author and publisher
                of the internet resource Dhwaniastro.com and the Dhwani Astro
                application. This Privacy Policy describes how information and
                permissions may be handled when you use the Dhwani Astro
                platform and its services.
              </p>
            </section>

            {/* Sections */}
            {sections.map((section) => (
              <article
                key={section.number}
                id={`section-${section.number}`}
                className="scroll-mt-24 border-b border-gray-100 py-10 first:pt-0"
              >
                <h2 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
                  <span className="mr-2 text-gray-400">
                    {section.number}.
                  </span>

                  {section.title}
                </h2>

                <div className="mt-5 text-sm leading-7 text-gray-600 md:text-base">
                  {section.content}
                </div>
              </article>
            ))}

            {/* Contact */}
            <section
              id="section-12"
              className="scroll-mt-24 mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold">
                12. Contact Us
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                If you have questions, concerns, or requests concerning this
                Privacy Policy, please contact:
              </p>

              <div className="mt-6 space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Dhwani Astro</span>
                </p>

                <p>
                  Email:{" "}
                  <a
                    href="mailto:support@dhwaniastro.com"
                    className="font-medium underline underline-offset-2 hover:text-gray-900"
                  >
                    support@dhwaniastro.com
                  </a>
                </p>

                <p>
                  Phone:{" "}
                  <a
                    href="tel:+916366526901"
                    className="font-medium underline underline-offset-2 hover:text-gray-900"
                  >
                    +91 6366526901
                  </a>
                </p>

                <p>
                  Website:{" "}
                  <a
                    href="https://dhwaniastro.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 hover:text-gray-900"
                  >
                    dhwaniastro.com
                  </a>
                </p>
              </div>
            </section>

            {/* Footer Links */}
            <div className="mt-10 flex flex-wrap gap-5 border-t pt-8 text-sm">
              <Link
                href="/privacy-policy"
                className="font-medium text-gray-900"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms-and-conditions"
                className="text-gray-500 hover:text-gray-900"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}