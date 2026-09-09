import { gql } from "@apollo/client";

export const CREATE_APPLICATION = gql`
  mutation CreateAstrologerApplication($input: CreateApplicationInput!) {
    createAstrologerApplication(input: $input) {
      id
      name
      email
    }
  }
`;
export const CREATE_HEALING_ORDER = gql`
  mutation CreateHealingOrder($input: CreateHealingOrderInput!) {
    createHealingOrder(input: $input) {
      success
      orderId
      bookingId
      currency
      totalAmount
      payableAmount
    }
  }
`;

// export const GET_ASTROLOGER_PROFILE = gql`
//   query GetAstrologerProfile {
//     getAstrologerProfile {
//       success
//       message
//       data {
//         id
//         name
//         displayName
//         profilePic
//         email
//         contactNo
//         about
//         gender
//         languages
//         skills
//         problems
//         experience
//         rating
//         totalReviews
//         totalSessions
//         tags
//         vtags
//         status
//         createdAt

//         wallet {
//           balanceCoins
//           totalEarned
//           totalWithdrawn
//         }

//         pricing {
//           type
//           price
//           offerPrice
//           commissionPercent
//           isActive
//         }

//         recentReviews {
//           id
//           rating
//           comment
//           userName
//           createdAt
//         }

//         addresses {
//           street
//           city
//           state
//           country
//           pincode
//         }

//         experiences {
//           platformName
//           yearsWorked
//         }

//         kycDetail {
//           accountHolderName
//           accountNumber
//           bankName
//           ifsc
//           branchName
//           panNumber
//           profileImage
//           aadhaarImage
//           panImage
//           passbookImage
//           status
//         }
//       }
//     }
//   }
// `;

export const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      displayName
      profilePic
      about
      experience
      rating
      tags

      languages
      skills
      problems

      isBusy
      isOnline
      isChatActive
      isCallActive
      isLiveActive

      activeOffer {
        id
        offerName
        price
        description
      }

      pricing {
        type
        price
        originalPrice
        offerPrice
        commissionPercent
        isActive
      }

      reviews {
        id
        rating
        comment
        reply
        userName
        createdAt
      }
    }
  }
`;
export const GET_GIFTS = gql`
  query GetGifts {
    getGifts {
      totalCount
      data {
        id
        name
        amount
        image
        status
      }
    }
  }
`;

export const GET_SERVICES = gql`
  query GetServices {
    getServices {
      id
      name
      slug
      image
      description
      longText
      price

      category {
        id
        name
        slug
      }
      astrologerMappings {
        price
      }
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($slug: String!) {
    getService(slug: $slug) {
      id
      name
      slug
      image
      description
      longText
      price

      category {
        id
        name
      }

      astrologerMappings {
        id
        price

        astrologer {
          id
          name
          displayName
          profilePic
          experience
          rating
          skills
          languages
          about
        }
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query getCategories {
    getCategories {
      id
      name
      slug
      image
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($slug: String!) {
    getCategory(slug: $slug) {
      id
      name
      slug

      services {
        id
        name
        slug
        image
        description
        price

        astrologerMappings {
          price
        }
      }
    }
  }
`;

export const CREATE_SERVICE_BOOKING = gql`
  mutation CreateServiceBooking($input: CreateServiceBookingInput!) {
    createServiceBooking(input: $input) {
      id
      amount
      paymentStatus
      bookingStatus
    }
  }
`;

export const GET_ASTROLOGERS_USER = gql`
  query GetAstrologerListForUser($searchInput: AstrologerSearchInput) {
    getAstrologerListForUser(searchInput: $searchInput) {
      totalCount
      currentPage
      totalPages

      data {
        id
        profilePic
        displayName
        name
        experience
        rating
        skills
        languages
        isBusy
        isOnline
        isChatActive
        isCallActive
        isLiveActive
        tags

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          originalPrice
          offerPrice
          commissionPercent
          isActive
        }
      }
    }
  }
`;
export const GET_SIMILAR_ASTROLOGERS = gql`
  query GetSimilarAstrologers($astrologerId: ID!) {
    getSimilarAstrologers(astrologerId: $astrologerId) {
      id
      profilePic
      name
      experience
      rating
      skills
      languages

      isBusy
      isOnline
      isChatActive
      isCallActive
      isLiveActive

      activeOffer {
        id
        offerName
        price
        description
      }

      pricing {
        type
        price
        originalPrice
        offerPrice
        commissionPercent
        isActive
      }
    }
  }
`;
export const GET_ASTROLOGERS_GUEST = gql`
  query GetAstrologers($searchInput: AstrologerSearchInput) {
    getAstrologerListBySearch(searchInput: $searchInput) {
      data {
        id
        profilePic
        name
        displayName
        experience
        rating
        skills
        languages
        isBusy
        isOnline
        isChatActive
        isCallActive
        isLiveActive

        activeOffer {
          id
          offerName
          price
          description
        }

        pricing {
          type
          price
          offerPrice
          commissionPercent
          isActive
        }
      }

      totalPages
      currentPage
      totalCount
    }
  }
`;

export const UPDATE_BOOKING_ASTROLOGER = gql`
  mutation UpdateBookingAstrologer($bookingId: ID!, $astrologerId: ID!) {
    updateBookingAstrologer(
      bookingId: $bookingId
      astrologerId: $astrologerId
    ) {
      id
      astrologerId
    }
  }
`;

export const GET_BLOGS = gql`
  query GetBlogs {
    blogs {
      id
      title
      slug
      featuredImage
      createdAt
      categories {
        id
        name
        slug
      }
    }
  }
`;

export const GET_BLOG_BY_SLUG = gql`
  query GetBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      id
      title
      slug
      content
      featuredImage
      createdAt

      categories {
        id
        name
        slug
      }
    }
  }
`;
export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      id
      name
      slug
    }
  }
`;

export const GET_UPCOMING_LIVES = gql`
  query GetUpcomingLives($page: Int, $limit: Int) {
    getUpcomingLives(page: $page, limit: $limit) {
      data {
        id
        title
        status
        channelName
        scheduledAt

        astrologer {
          id
          name
          displayName
          profilePic
          rating
        }
      }

      totalCount
      currentPage
      totalPages
    }
  }
`;
export const JOIN_LIVE_STREAM = gql`
  query JoinLive($channelName: String!) {
    joinLive(channelName: $channelName) {
      rtcToken
      uid
      appId
      channelName

      chatUserId
      chatToken
      chatRoomId
      chatAppKey
    }
  }
`;

export const START_LIVE = gql`
  mutation StartLive($title: String!) {
    startLive(title: $title) {
      token
      uid
      appId
      channelName
    }
  }
`;

export const GET_FAQS = gql`
  query GetFaqs {
    getFaqs {
      totalCount
      data {
        id
        question
        answer
      }
    }
  }
`;

export const GET_TESTIMONIALS = gql`
  query GetTestimonials {
    getTestimonials {
      totalCount
      data {
        id
        name
        image
        address
        rating
        content
        createdAt
      }
    }
  }
`;


export const GET_DISCLAIMER_PAGE = gql`
  query GetDisclaimerPage {
    getDisclaimerPage {
      id
      title
      content
      metaTitle
      metaDescription
      keywords
      status
    }
  }
`;
export const GET_PRIVACY_PAGE = gql`
  query GetPrivacyPage {
    getPrivacyPage {
      id
      title
      content
      metaTitle
      metaDescription
      keywords
      status
    }
  }
`;
export const GET_REFUND_POLICY_PAGE = gql`
  query GetRefundPolicyPage {
    getRefundPolicyPage {
      id
      title
      content
      metaTitle
      metaDescription
      keywords
      status
    }
  }
`;
export const GET_BANNERS = gql`
  query GetBanners($language: String) {
    getBanners(language: $language) {
      totalCount
      data {
        id
        imageUrl
        heading
        language
        bannerType
      }
    }
  }
`;
export const GET_SESSION_REMEDY = gql`
  query GetSessionRemedy($sessionId: ID!) {
    getSessionRemedy(sessionId: $sessionId) {
      id
      remedyText
      createdAt
      astrologerName
    }
  }
`;
export const GET_COUPONS = gql`
  query GetCoupons {
    getCoupons {
      id
      code
      type
      percentage
      flatAmount
      maxDiscount
      minOrderAmount
      description
      visibility
      applicable
    }
  }
`;
export const GET_SERVICE_BOOKING = gql`
  query GetServiceBooking($bookingId: ID!) {
    getServiceBooking(bookingId: $bookingId) {
      id
      amount
      bookingStatus
      paymentStatus

      service {
        id
        name
      }

      astrologer {
        id
        displayName
        profilePic
      }
    }
  }
`;

export const GET_USER_DASHBOARD = gql`
  query GetUserDashboard {
    getUserDashboard {
      id
      name
      mobile
      countryCode
      gender
      birthDate
      birthTime
      occupation
      createdAt
      birthPlace
      profileImage

      wallet {
        balanceCoins
        lockedCoins
      }

      stats {
        walletBalance
        totalRecharge
        totalRechargeCount
        totalCalls
        totalChats
        totalReviews
        totalFollowing
        totalBookings
        lastRechargeAmount
        lastRechargeDate
      }
    }
  }
`;
export const GET_FOLLOWED_ASTROLOGERS = gql`
  query GetFollowedAstrologers($page: Int, $limit: Int) {
    getFollowedAstrologers(page: $page, limit: $limit) {
      astrologers {
        id
        displayName
        profilePic
        rating
        skills
      }
      total
      page
      limit
      totalPages
    }
  }
`;
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      id
      name
      gender
      birthDate
      birthTime
      occupation
      birthPlace
      profileImage
    }
  }
`;
export const GET_ACTIVE_SKILLS = gql`
  query GetActiveSkills {
    getActiveSkills {
      id
      name
    }
  }
`;

export const GET_ACTIVE_PROBLEMS = gql`
  query GetActiveProblems {
    getActiveProblems {
      id
      name
    }
  }
`;
export const GET_ASTROLOGER_CATEGORIES = gql`
  query GetAstrologerCategories {
    getAstrologerCategories {
      id
      name
      type
    }
  }
`;

export const GET_PAYMENT_INVOICE = gql`
  query GetPaymentInvoice($transactionId: ID!) {
    getPaymentInvoice(transactionId: $transactionId) {
      id
      invoiceNo

      transactionId
      razorpayOrderId
      razorpayPaymentId

      amount
      discount
      taxableAmount

      sgst
      cgst
      igst

      sgstRate
      cgstRate
      igstRate
      gstRate

      totalTax
      totalAmount
      amountReceived
      amountInWords

      userName
      city
      state
      pincode
      country

      placeOfSupply

      supplierGSTIN
      supplierAddress
      website
      email

      recipientGSTIN

      transactionHistoryUrl

      hsnSac
      reverseCharge
      panNumber

      createdAt
    }
  }
`;
