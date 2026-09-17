"use client";

import Link from "next/link";

const sections = [
  {
    number: "12",
    title: "Direct Contact and Off-Platform Transactions",
    content: (
      <>
        <p>
          Where Dhwani Astro provides communication and payment facilities,
          Consultants must not misuse customer information obtained through the
          Platform to bypass Dhwani Astro&apos;s systems.
        </p>

        <p className="mt-4">
          Without authorization, Consultants may not solicit customers to:
        </p>

        <ul>
          <li>Pay into a personal bank account.</li>
          <li>Move a paid consultation to another platform.</li>
          <li>
            Contact the Consultant privately for the purpose of avoiding
            Platform charges.
          </li>
          <li>Purchase Platform-listed services outside the Platform.</li>
        </ul>

        <p className="mt-4">
          Dhwani Astro may restrict or terminate accounts where Platform users
          are deliberately diverted for unauthorized commercial purposes.
        </p>
      </>
    ),
  },

  {
    number: "13",
    title: "Personal Contact Information",
    content: (
      <>
        <p>
          Consultants should not publish or exchange personal contact
          information through Platform features where prohibited by Dhwani
          Astro.
        </p>

        <p className="mt-4">This may include:</p>

        <ul>
          <li>Personal phone numbers</li>
          <li>Private email addresses</li>
          <li>WhatsApp numbers</li>
          <li>Telegram handles</li>
          <li>Social-media accounts</li>
          <li>Personal payment links</li>
          <li>Personal websites</li>
        </ul>

        <p className="mt-4">
          Any exceptions must comply with the applicable Dhwani Astro feature
          or policy.
        </p>
      </>
    ),
  },

  {
    number: "14",
    title: "Products and Paid Remedies",
    content: (
      <>
        <p>
          Consultants must not pressure customers into purchasing products,
          gemstones, rituals, reports, courses, or remedies.
        </p>

        <p className="mt-4">
          Products or services sold through Dhwani Astro must:
        </p>

        <ul>
          <li>Be accurately described.</li>
          <li>Have transparent pricing.</li>
          <li>Be lawful.</li>
          <li>Match what was promised to the customer.</li>
          <li>Not involve deceptive guarantees.</li>
          <li>Be delivered within the stated time wherever applicable.</li>
        </ul>

        <p className="mt-4">
          Dhwani Astro may restrict listings that are deceptive, unsafe,
          inappropriate, or inconsistent with Platform standards.
        </p>
      </>
    ),
  },

  {
    number: "15",
    title: "Consultation Quality",
    content: (
      <>
        <p>
          Consultants must personally analyse the customer&apos;s question and
          relevant information.
        </p>

        <p className="mt-4">
          A Consultant must not knowingly provide copied, fabricated,
          misleading, or irrelevant consultation responses.
        </p>

        <p className="mt-4">
          Automated tools or reference materials may only be used in accordance
          with Dhwani Astro policies, and Consultants remain responsible for the
          accuracy and appropriateness of the final consultation delivered to
          the customer.
        </p>
      </>
    ),
  },

  {
    number: "16",
    title: "Availability",
    content: (
      <>
        <p>
          Consultants should accurately display their availability.
        </p>

        <p className="mt-4">If the Platform provides:</p>

        <ul>
          <li>Online/offline status</li>
          <li>Next available time</li>
          <li>Scheduled consultations</li>
          <li>Appointment booking</li>
        </ul>

        <p className="mt-4">
          Consultants should keep those details reasonably current.
          Repeated failure to attend confirmed appointments may affect account
          privileges.
        </p>
      </>
    ),
  },

  {
    number: "17",
    title: "Ratings and Reviews",
    content: (
      <>
        <p>
          Customers may submit reviews or ratings concerning services received.
        </p>

        <p className="mt-4">
          Dhwani Astro does not guarantee positive reviews.
        </p>

        <p className="mt-4">Consultants must not:</p>

        <ul>
          <li>Fabricate reviews.</li>
          <li>Purchase reviews.</li>
          <li>Create fake customer accounts.</li>
          <li>Threaten users regarding reviews.</li>
          <li>Manipulate rating systems.</li>
        </ul>

        <p className="mt-4">
          A Consultant may report a review that violates Platform rules, after
          which Dhwani Astro may review it.
        </p>
      </>
    ),
  },

  {
    number: "18",
    title: "Fees and Consultation Pricing",
    content: (
      <>
        <p>
          Consultation prices may be established by Dhwani Astro, by the
          Consultant, or through a combination of Platform pricing rules and
          Consultant-selected pricing.
        </p>

        <p className="mt-4">
          Before providing paid services, applicable rates, commissions,
          charges, taxes, or deductions should be communicated through the
          Consultant dashboard or other Platform mechanism.
        </p>

        <p className="mt-4">
          Dhwani Astro may run discounts, promotional campaigns, coupons,
          introductory offers, loyalty benefits, or promotional sessions.
        </p>
      </>
    ),
  },

  {
    number: "19",
    title: "Payments",
    content: (
      <>
        <p>Consultant earnings may be subject to:</p>

        <ul>
          <li>Platform commissions</li>
          <li>Payment-processing charges</li>
          <li>Taxes</li>
          <li>Withholding obligations</li>
          <li>Customer refunds</li>
          <li>Chargebacks</li>
          <li>Promotional discounts</li>
          <li>Other clearly disclosed deductions</li>
        </ul>

        <p className="mt-4">
          Payments will be processed in accordance with the payout cycle and
          payment rules displayed by Dhwani Astro.
        </p>

        <p className="mt-4">
          Consultants are responsible for providing accurate bank, tax, GST,
          PAN, or other legally required information.
        </p>
      </>
    ),
  },

  {
    number: "20",
    title: "Refunds and Cancellations",
    content: (
      <>
        <p>Customers may request refunds where:</p>

        <ul>
          <li>A service was not delivered.</li>
          <li>A consultation was materially interrupted.</li>
          <li>A Consultant failed to provide the purchased service.</li>
          <li>The service materially differed from its description.</li>
          <li>Fraud or serious misconduct is suspected.</li>
          <li>Another refund condition established by Dhwani Astro applies.</li>
        </ul>

        <p className="mt-4">
          Dhwani Astro may review consultation records and relevant evidence
          before deciding whether a full or partial refund is appropriate.
        </p>
      </>
    ),
  },

  {
    number: "21",
    title: "Recording and Quality Monitoring",
    content: (
      <>
        <p>
          Where permitted by applicable law and disclosed to users and
          Consultants, calls, chats, or other interactions may be recorded or
          retained for:
        </p>

        <ul>
          <li>Quality assurance</li>
          <li>Customer support</li>
          <li>Fraud prevention</li>
          <li>Dispute resolution</li>
          <li>Compliance</li>
          <li>Safety</li>
          <li>Training</li>
          <li>Enforcement of Platform policies</li>
        </ul>

        <p className="mt-4">
          Access to such records will be governed by Dhwani Astro&apos;s Privacy
          Policy and applicable law.
        </p>
      </>
    ),
  },

  {
    number: "22",
    title: "Live Streaming and Video Consultations",
    content: (
      <>
        <p>
          Where Dhwani Astro provides live-streaming or video-consultation
          features, Consultants must maintain appropriate professional conduct.
        </p>

        <p className="mt-4">Consultants must not use live sessions to:</p>

        <ul>
          <li>Display prohibited personal contact details.</li>
          <li>Harass or abuse users.</li>
          <li>Promote unlawful services.</li>
          <li>Promote harmful practices.</li>
          <li>Display obscene content.</li>
          <li>Make misleading guaranteed-result claims.</li>
          <li>Solicit unauthorized payments.</li>
        </ul>
      </>
    ),
  },

  {
    number: "23",
    title: "Account Security",
    content: (
      <>
        <p>
          Consultants are responsible for maintaining the confidentiality of
          their login credentials.
        </p>

        <p className="mt-4">You must not:</p>

        <ul>
          <li>Share passwords or OTPs.</li>
          <li>Allow unauthorized persons to access your account.</li>
          <li>Sell or transfer your account.</li>
          <li>Allow another person to impersonate you.</li>
          <li>Attempt to access another Consultant&apos;s account.</li>
        </ul>

        <p className="mt-4">
          You should immediately notify Dhwani Astro if you suspect
          unauthorized access.
        </p>
      </>
    ),
  },

  {
    number: "24",
    title: "Platform Misuse",
    content: (
      <>
        <p>Consultants must not:</p>

        <ul>
          <li>Attempt to hack the Platform.</li>
          <li>Introduce malware.</li>
          <li>Manipulate Platform rankings or systems.</li>
          <li>Create fake orders.</li>
          <li>Exploit technical errors.</li>
          <li>Manipulate payouts.</li>
          <li>Use bots to generate artificial activity.</li>
          <li>Circumvent Platform security mechanisms.</li>
          <li>Fraudulently obtain customer information.</li>
        </ul>

        <p className="mt-4">
          Serious misuse may result in suspension or termination and, where
          appropriate, legal action.
        </p>
      </>
    ),
  },

  {
    number: "25",
    title: "Intellectual Property",
    content: (
      <p>
        Dhwani Astro and its licensors retain rights in the Platform, including
        its software, branding, design, logos, databases, and proprietary
        materials. Consultants retain ownership of their pre-existing
        intellectual property unless otherwise agreed.
      </p>
    ),
  },

  {
    number: "26",
    title: "Marketing Use",
    content: (
      <>
        <p>
          With appropriate rights and permissions, Dhwani Astro may use public
          Consultant-profile materials such as:
        </p>

        <ul>
          <li>Display name</li>
          <li>Profile image</li>
          <li>Public biography</li>
          <li>Expertise</li>
          <li>Ratings</li>
          <li>Public testimonials</li>
          <li>Public videos or promotional material</li>
        </ul>
      </>
    ),
  },

  {
    number: "27",
    title: "Confidentiality",
    content: (
      <p>
        Consultants may receive confidential information concerning Dhwani
        Astro, its users, technology, pricing, business processes, or internal
        operations. Confidential information must not be disclosed or used for
        unrelated purposes except with authorization, where already lawfully
        public, or where disclosure is required by law.
      </p>
    ),
  },

  {
    number: "28",
    title: "Suspension and Termination",
    content: (
      <>
        <p>Dhwani Astro may investigate and take proportionate action where there is evidence of:</p>

        <ul>
          <li>Fraud</li>
          <li>Harassment</li>
          <li>Customer exploitation</li>
          <li>Serious privacy violations</li>
          <li>Fake qualifications</li>
          <li>Account sharing</li>
          <li>Unauthorized transactions</li>
          <li>Illegal services</li>
          <li>Repeated non-delivery</li>
          <li>Manipulation of ratings or payments</li>
          <li>Serious or repeated violations of these Terms</li>
        </ul>

        <p className="mt-4">
          Actions may include warnings, temporary restrictions, removal of
          particular features, suspension, withholding disputed amounts where
          legally permissible, or account termination.
        </p>
      </>
    ),
  },

  {
    number: "29",
    title: "Disclaimer",
    content: (
      <>
        <p>
          Dhwani Astro provides a technology platform through which users may
          connect with astrologers and other Consultants.
        </p>

        <p className="mt-4">
          Unless specifically stated otherwise, Dhwani Astro does not
          guarantee:
        </p>

        <ul>
          <li>The accuracy of any prediction.</li>
          <li>A specific result from a consultation.</li>
          <li>The effectiveness of a remedy.</li>
          <li>Compatibility between a user and Consultant.</li>
          <li>Continuous or uninterrupted Platform availability.</li>
        </ul>
      </>
    ),
  },

  {
    number: "30",
    title: "Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by applicable law, Dhwani Astro will
        not be liable for indirect, incidental, special, consequential, or
        punitive losses arising from the use of the Platform. Nothing in these
        Terms excludes liability that cannot legally be excluded or limited.
      </p>
    ),
  },

  {
    number: "31",
    title: "Indemnification",
    content: (
      <>
        <p>
          To the extent permitted by law, a Consultant agrees to indemnify
          Dhwani Astro against third-party claims arising directly from:
        </p>

        <ul>
          <li>The Consultant&apos;s unlawful conduct.</li>
          <li>Material violation of these Terms.</li>
          <li>Fraud or intentional misconduct.</li>
          <li>Infringement of another person&apos;s intellectual property.</li>
          <li>Unauthorized disclosure of customer data.</li>
        </ul>
      </>
    ),
  },

  {
    number: "32",
    title: "Data Protection and Privacy",
    content: (
      <>
        <p>
          Personal information collected from Consultants and customers will be
          handled according to the Dhwani Astro Privacy Policy.
        </p>

        <p className="mt-4">Depending on the Platform features used, information may include:</p>

        <ul>
          <li>Name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Date of birth</li>
          <li>Birth information</li>
          <li>Profile information</li>
          <li>Device information</li>
          <li>Transaction information</li>
          <li>Consultation records</li>
          <li>Customer-support communications</li>
        </ul>
      </>
    ),
  },

  {
    number: "33",
    title: "Phone Number and OTP",
    content: (
      <>
        <p>
          Where phone-based authentication is available, Dhwani Astro may use
          a user&apos;s or Consultant&apos;s phone number for:
        </p>

        <ul>
          <li>Account registration</li>
          <li>Login verification</li>
          <li>OTP authentication</li>
          <li>Security alerts</li>
          <li>Appointment or consultation notifications</li>
          <li>Customer-support communications</li>
          <li>Transaction-related communications</li>
        </ul>
      </>
    ),
  },

  {
    number: "34",
    title: "Microphone, Camera and Audio Permissions",
    content: (
      <p>
        Where voice, call, video, or audio-message features are available,
        Dhwani Astro may request access to the device microphone and/or camera.
        These permissions are used only for the functionality requiring them,
        subject to the Dhwani Astro Privacy Policy and applicable permissions
        granted by the device user.
      </p>
    ),
  },

  {
    number: "35",
    title: "Changes to These Terms",
    content: (
      <p>
        Dhwani Astro may update these Terms periodically to reflect new
        Platform features, legal requirements, security requirements, business
        changes, or changes in Platform policies. The latest version should
        display its effective or &quot;Last Updated&quot; date.
      </p>
    ),
  },

  {
    number: "36",
    title: "Severability",
    content: (
      <p>
        If any provision of these Terms is held unlawful or unenforceable, that
        provision will be modified or removed to the minimum extent required,
        while the remaining provisions will continue in effect.
      </p>
    ),
  },

  {
    number: "37",
    title: "Governing Law and Jurisdiction",
    content: (
      <p>
        These Terms shall be governed by the laws of India. Any disputes shall
        be subject to the jurisdiction of the courts at New Delhi unless
        applicable law requires otherwise. Where appropriate, the parties may
        first attempt to resolve disputes through negotiation, mediation, or
        arbitration.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
            Dhwani Astro
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
            Please read these Terms & Conditions carefully before using the
            Dhwani Astro Platform and its services.
          </p>

          <p className="mt-4 text-xs text-gray-500">
            Last Updated: September 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
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
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="max-w-3xl">
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
            <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
              <h2 className="text-xl font-semibold">38. Contact Us</h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                For questions concerning these Terms, Consultant accounts,
                payments, complaints, privacy, or Platform policies, contact:
              </p>

              <div className="mt-6 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Dhwani Astro</span>
                </p>

                <p>
                  Email:{" "}
                  <a
                    href="mailto:support@dhwaniastro.com"
                    className="font-medium underline underline-offset-2"
                  >
                    support@dhwaniastro.com
                  </a>
                </p>

                <p>
                  Contact No:{" "}
                  <a
                    href="tel:+916366526901"
                    className="font-medium underline underline-offset-2"
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
                    className="font-medium underline underline-offset-2"
                  >
                    dhwaniastro.com
                  </a>
                </p>
              </div>
            </section>

          
          </div>
        </div>
      </section>
    </main>
  );
}