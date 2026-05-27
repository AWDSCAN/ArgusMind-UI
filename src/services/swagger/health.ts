// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Health GET /api/health */
export async function healthApiHealthGet(options?: { [key: string]: any }) {
  return request<Record<string, any>>("/api/health", {
    method: "GET",
    ...(options || {}),
  });
}

/** Ready GET /api/ready */
export async function readyApiReadyGet(options?: { [key: string]: any }) {
  return request<Record<string, any>>("/api/ready", {
    method: "GET",
    ...(options || {}),
  });
}
