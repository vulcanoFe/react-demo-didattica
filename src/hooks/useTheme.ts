import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "app-theme";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (saved) return saved;

		// fallback sistema
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		return prefersDark ? "dark" : "light";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(prev => (prev === "dark" ? "light" : "dark"));
	};

	return { theme, toggleTheme };
}