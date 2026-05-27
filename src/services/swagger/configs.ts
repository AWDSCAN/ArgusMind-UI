// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Get Code Agent Config GET /api/configs/code-agent */
export async function getCodeAgentConfigApiConfigsCodeAgentGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseDict_>("/api/configs/code-agent", {
    method: "GET",
    ...(options || {}),
  });
}

/** Update Code Agent PUT /api/configs/code-agent */
export async function updateCodeAgentApiConfigsCodeAgentPut(
  body: API.CodeAgentConfigUpdate,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/configs/code-agent", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Code Agent Provider List Config GET /api/configs/code-agent/provider-list */
export async function getCodeAgentProviderListConfigApiConfigsCodeAgentProviderListGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseAny_>("/api/configs/code-agent/provider-list", {
    method: "GET",
    ...(options || {}),
  });
}

/** Test Code Agent Config GET /api/configs/code-agent/test */
export async function testCodeAgentConfigApiConfigsCodeAgentTestGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseStr_>("/api/configs/code-agent/test", {
    method: "GET",
    ...(options || {}),
  });
}

/** Get Llm Config GET /api/configs/llm */
export async function getLlmConfigApiConfigsLlmGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseDict_>("/api/configs/llm", {
    method: "GET",
    ...(options || {}),
  });
}

/** Update Llm PUT /api/configs/llm */
export async function updateLlmApiConfigsLlmPut(
  body: API.LLMConfigUpdate,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/configs/llm", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Llm Provider List Config GET /api/configs/llm/provider-list */
export async function getLlmProviderListConfigApiConfigsLlmProviderListGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseAny_>("/api/configs/llm/provider-list", {
    method: "GET",
    ...(options || {}),
  });
}

/** Test Llm Config GET /api/configs/llm/test */
export async function testLlmConfigApiConfigsLlmTestGet(options?: {
  [key: string]: any;
}) {
  return request<API.OkResponseStr_>("/api/configs/llm/test", {
    method: "GET",
    ...(options || {}),
  });
}
