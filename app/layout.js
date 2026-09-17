import "@/app/styles/globals.css";

import { Toaster } from "react-hot-toast";
import Providers from "./redux/provider";
import { SocketProvider } from "./context/socketContext";
import Footerlinks from "@/components/Footerlinks";
import SignInModalWrapper from "../components/Homepagecomp/Signin/SignInWrap";
import { ChatToast } from "./common";
import ScrollToTop from "../Hooks/ScrollTop";
import { LanguageProvider } from "./context/LangContext";
import { Poppins, Sonsie_One } from "next/font/google";
import ApolloWrapper from "./providers/ApolloWrapper";
import { AuthProvider } from "./context/authContext";
import GlobalChatPopup from "@/components/Custom/GlobalChatPopup";
import CookieConsent from "@/components/cookieConsent";
import LayoutWrapper from "./LayoutWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-primary",
  display: "swap",
  preload: true,
});

const sonsie = Sonsie_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
  display: "swap",
  preload: false,
});

export const metadata = {
  metadataBase: new URL("https://dhwaniastro.com"),

  title: {
    default:
      "Best Astrologer Near Me | Online Jyotish Consultation by Dhwani Astro",
    template: "%s | Dhwani Astro",
  },

  description:
    "Looking for an online Jyotish consultation in Delhi? Connect with experienced astrologers on Dhwani Astro for personalized astrology consultations.",

  keywords: [
    "astrologer",
    "online astrologer",
    "astrology consultation",
    "jyotish consultation",
    "best astrologer",
    "astrologer near me",
    "online jyotish",
    "Dhwani Astro",
  ],

  authors: [
    {
      name: "Dhwani Astro",
      url: "https://dhwaniastro.com",
    },
  ],

  creator: "Dhwani Astro",

  publisher: "Dhwani Astro",

  alternates: {
    canonical: "https://dhwaniastro.com",
  },

  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dhwaniastro.com",
    siteName: "Dhwani Astro",

    title:
      "Best Astrologer Near Me | Online Jyotish Consultation by Dhwani Astro",

    description:
      "Connect with experienced astrologers online for personalized Jyotish consultations with Dhwani Astro.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dhwani Astro - Online Astrology Consultation",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Best Astrologer Near Me | Online Jyotish Consultation by Dhwani Astro",

    description:
      "Online Jyotish consultation with experienced astrologers on Dhwani Astro.",

    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <ApolloWrapper>
          <AuthProvider>
            <LanguageProvider>
              <Providers>
                <SocketProvider>
                  <SignInModalWrapper>
                    <SocketProvider>
                      <LayoutWrapper>
                        {children}
                      </LayoutWrapper>

                      <GlobalChatPopup />
                    </SocketProvider>
                  </SignInModalWrapper>

                  <Toaster
                    position="top-center"
                    reverseOrder={false}
                  />
                </SocketProvider>
              </Providers>

              <ScrollToTop />
            </LanguageProvider>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}