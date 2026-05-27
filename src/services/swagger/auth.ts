// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Login POST /api/auth/login */
export async function loginApiAuthLoginPost(
  body: API.LoginRequest,
  options?: { [key: string]: any }
) {
  return request<API.LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Me GET /api/auth/me */
export async function meApiAuthMeGet(options?: { [key: string]: any }) {
  return request<API.OkResponseCurrentUser_>("/api/auth/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** Change Password POST /api/auth/change-password */
export async function changePasswordApiAuthChangePasswordPost(
  body: API.ChangePasswordRequest,
  options?: { [key: string]: any },
) {
  return request<API.OkResponseBool_>("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
