const TOKEN_KEY = "projectboard_token";
const USER_ID_KEY = "projectboard_user_id";
const USERNAME_KEY = "projectboard_username";

export function setSession({ token, userId, username }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, String(userId));
    localStorage.setItem(USERNAME_KEY, username || "");
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUsername() {
    return localStorage.getItem(USERNAME_KEY) || "Student";
}

export function isLoggedIn() {
    return Boolean(getToken());
}
