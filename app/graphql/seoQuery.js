export const GET_ABOUT_PAGE = `
  query GetAboutPage {
    getAboutPage {
      id
      pageType
      heroTitle
      heroDescription
      mentors {
        name
        image
        description
        designation
      }
      founders {
        name
        image
        description
        designation
      }
      metaTitle
      metaDescription
      keywords
      status
      createdAt
      updatedAt
    }
  }
`;
export const GET_DISCLAIMER_PAGE = `
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
export const GET_PRIVACY_PAGE = `
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
export const GET_REFUND_POLICY_PAGE = `
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