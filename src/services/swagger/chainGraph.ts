// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Chain Graph By Ar GET /api/chain-graph/by-ar */
export async function chainGraphByArApiChainGraphByArGet(
  params: API.chainGraphByArApiChainGraphByArGetParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/chain-graph/by-ar", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Chain Graph By Vul GET /api/chain-graph/by-vul */
export async function chainGraphByVulApiChainGraphByVulGet(
  params: API.chainGraphByVulApiChainGraphByVulGetParams,
  options?: { [key: string]: any }
) {
  return request<API.OkResponseDict_>("/api/chain-graph/by-vul", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
