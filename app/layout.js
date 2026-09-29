import "@/app/styles/globals.css";

import { Toaster } from "react-hot-toast";
import Providers from "./redux/provider";
import { SocketProvider } from "./context/socketContext";
import Footerlinks from "@/components/Footerlinks";
import SignInModalWrapper from "../components/Homepagecomp/Signin/SignInWrap";
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

/**
 * Global / Default Metadata
 *
 * Page-specific metadata should be defined inside each page.js
 * or through generateMetadata() for dynamic pages.
 */
export const metadata = {
  metadataBase: new URL("https://dhwaniastro.com"),

  title: {
    default: "Dhwani Astro | Online Astrology Consultation",
    template: "%s | Dhwani Astro",
  },

  description:
    "Connect with experienced astrologers on Dhwani Astro for personalized online astrology and Jyotish consultations.",

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

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
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
                    <LayoutWrapper>
                      {children}
                    </LayoutWrapper>

                    <GlobalChatPopup />
                  </SignInModalWrapper>

                  <Toaster
                    position="top-center"
                    reverseOrder={false}
                  />
                </SocketProvider>

                <ScrollToTop />
              </Providers>
            </LanguageProvider>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}