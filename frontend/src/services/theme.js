const THEME_KEY = "projectboard_theme";

export function getTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme;
    }
    return "light";
}

export function setTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    return nextTheme;
}

export function toggleTheme() {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    return setTheme(nextTheme);
}
