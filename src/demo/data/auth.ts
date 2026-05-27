import { DEMO_TOKEN } from '../constants';

/** 来自 GET /api/auth/me */
export const demoAuthMe = {
  success: true,
  data: {
    id: 'dd681eac-9f78-4020-b93a-4937ab8bd54b',
    username: 'ArgusMind',
    display_name: 'Administrator',
    is_active: true,
    is_superuser: false,
  },
} as const;

export const demoLoginResponse = {
  success: true,
  token: DEMO_TOKEN,
  username: demoAuthMe.data.username,
  display_name: demoAuthMe.data.display_name,
  must_change_password: false,
};
