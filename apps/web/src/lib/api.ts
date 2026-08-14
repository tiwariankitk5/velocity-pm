import { useAuthStore } from "../store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const config = {
    ...options,
    credentials: "include" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  };

  let response = await fetch(`${API_URL}${path}`, config);

  if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/refresh") {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.data.accessToken;
          const user = refreshData.data.user;
          useAuthStore.getState().setSession(user, newAccessToken);
          onRefreshed(newAccessToken);
          isRefreshing = false;
        } else {
          isRefreshing = false;
          useAuthStore.getState().logout();
          throw new Error("Session expired. Please log in again.");
        }
      } catch (err) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      addRefreshSubscriber(async (newToken: string) => {
        try {
          const newConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`
            }
          };
          const newResponse = await fetch(`${API_URL}${path}`, newConfig);
          if (!newResponse.ok) {
            const error = await newResponse.json().catch(() => ({ message: "Request failed" }));
            reject(new Error(error.message ?? "Request failed"));
          } else {
            resolve(newResponse.json());
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json();
}
