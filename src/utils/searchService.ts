import axios from "axios";

const KEYCLOAK_TOKEN_URL =
    "http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token";
const CLIENT_ID = "orchestration";
const CLIENT_SECRET = "secret";

const BaseURL = "http://localhost:3000"; // Camunda 8 REST API

// ===== Get access token from Keycloak =====
async function getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);

    const { data } = await axios.post(KEYCLOAK_TOKEN_URL, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data.access_token;
}



export async function searchApi(payload: Object): Promise<Object | undefined> {
    try {
        const token = await getAccessToken();


        const API_URL = BaseURL + "v2/user-tasks/search";

        const { data } = await axios.post(API_URL, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return data;
    } catch (err) {
        console.error("Error in searchApi:", err);
        return undefined;
    }
}

export async function stratProccess(payload: Object): Promise<Object | undefined> {
    try {
        const token = await getAccessToken();


        const API_URL = BaseURL + "/start-process";

        const { data } = await axios.post(API_URL, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return data;
    } catch (err) {
        console.error("Error in searchApi:", err);
        return undefined;
    }
}

