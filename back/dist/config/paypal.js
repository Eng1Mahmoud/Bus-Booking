import { env } from "./env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";
/**
 * A thin PayPal REST v2 client.
 *
 * Written directly against the API rather than pulling in the SDK: it is about
 * a hundred lines, every request it makes is visible here, and the money path
 * is the last place to inherit an opaque dependency.
 *
 * The client *secret* only ever exists on this side. The client ID in the
 * frontend bundle is a public identifier and is not a credential.
 */
const API_BASE = env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
let cached = null;
const assertConfigured = () => {
    if (!env.paypalEnabled) {
        throw new ApiError(503, "Payments are not configured on this server. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
    }
};
const getAccessToken = async () => {
    assertConfigured();
    // Refresh a minute early rather than racing the expiry.
    if (cached && cached.expiresAt > Date.now() + 60_000) {
        return cached.value;
    }
    const credentials = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
    const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    if (!res.ok) {
        logger.error({ status: res.status, body: await res.text() }, "PayPal token request failed");
        throw ApiError.internal("Could not reach the payment provider");
    }
    const data = (await res.json());
    cached = {
        value: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cached.value;
};
const request = async (path, init) => {
    const token = await getAccessToken();
    const res = await fetch(`${API_BASE}${path}`, {
        method: init.method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            // Makes retries safe: PayPal returns the original result rather than
            // creating or capturing a second time.
            ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
        },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
    const text = await res.text();
    if (!res.ok) {
        logger.error({ status: res.status, path, body: text }, "PayPal call failed");
        // Never surface the provider's payload — it can carry account details.
        throw new ApiError(502, "The payment provider rejected the request");
    }
    return (text ? JSON.parse(text) : {});
};
export const paypal = {
    isConfigured: () => env.paypalEnabled,
    /** `amount` is a decimal string, e.g. "12.50". */
    createOrder: (params) => request("/v2/checkout/orders", {
        method: "POST",
        requestId: params.reference,
        body: {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: params.reference,
                    description: params.description,
                    amount: {
                        currency_code: params.currency,
                        value: params.amount,
                    },
                },
            ],
        },
    }),
    captureOrder: (orderId) => request(`/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        requestId: `capture-${orderId}`,
    }),
    getOrder: (orderId) => request(`/v2/checkout/orders/${orderId}`, { method: "GET" }),
};
//# sourceMappingURL=paypal.js.map