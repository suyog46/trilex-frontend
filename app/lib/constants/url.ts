export const URL = {
  // Pages
  HOME: '/',
  LOGIN: '/login',
  USER_REGISTER: '/register/user',
  LAWYER_REGISTER: '/register/lawyer',
  LAWYER_SIGNUP: '/lawyer-signup',
  LAW_FIRM_SIGNUP: '/law-firm-signup',
  VERIFY_LINK: '/verify-link',
  CHECK_EMAIL: '/check-your-email',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  // Admin Pages
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CASE_CATEGORIES: '/admin/case-categories',
  ADMIN_FIRM_VERIFICATIONS: '/admin/firm-verifications',
  ADMIN_LAWYER_VERIFICATIONS: '/admin/lawyer-verifications',

  API: {
    AUTH: {
      LOGIN: '/api/auth/login/',
      USER_SIGNUP: '/api/clients/signup/',
      LAWYER_SIGNUP: '/api/lawyers/signup/',
      LAW_FIRM_SIGNUP: '/api/firms/signup/',
      LAWYER_REGISTER: '/auth/register/lawyer',
      VERIFY_LINK: '/api/auth/verify-link/',
      RESEND_VERIFICATION_LINK: '/api/auth/resend-verification-link/',
      ME: '/api/auth/me',
      REFRESH: '/auth/refresh',
      LOGOUT: '/api/auth/logout/',
      FORGOT_PASSWORD: '/api/auth/forgot-password/',
      VERIFY_FORGOT_PASSWORD_OTP: '/api/auth/verify-forgot-password-otp/',
      RESET_PASSWORD: '/api/auth/reset-password/',
    },
    ADDRESS: {
      PROVINCES: '/api/addresses/provinces/',
      DISTRICTS: (provinceId: number) => `/api/addresses/districts/${provinceId}/`,
      MUNICIPALITIES: (districtId: number) => `/api/addresses/municipalities/${districtId}/`,
      WARDS: (municipalityId: number) => `/api/addresses/wards/${municipalityId}/`,
    },
    CASES: {
      CATEGORIES: '/api/cases/categories/',
    },
    ADMIN: {
      CASE_CATEGORIES: '/api/cases/categories/',
      FIRM_VERIFICATIONS: '/api/firms/verifications/',
      LAWYER_VERIFICATIONS: '/api/lawyers/bar-verifications/',
      CLIENT_VERIFICATIONS: '/api/clients/verifications/',
    },
    VERIFICATION: {
      LAWYER_STATUS: '/api/lawyers/bar-verification/me',
      LAWYER_SUBMIT: '/api/lawyers/bar-verification/',
      FIRM_STATUS: '/api/firms/verification/me',
      FIRM_SUBMIT: '/api/firms/verification/',
      CLIENT_STATUS: '/api/clients/verification/me/',
      CLIENT_SUBMIT: '/api/clients/verification/',
    },
    MEDIA: {
      UPLOAD: '/api/media/upload/',
    },
  },
}