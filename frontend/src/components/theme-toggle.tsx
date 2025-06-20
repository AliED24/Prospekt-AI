'use client'

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";


export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >

            {theme === "dark" ? ( <FaSun className="absolute h-10 w-10 rotate-0 scale-100 light:-rotate-90 light:scale-0" />)
            :  (
                <FaMoon className="absolute h-10 w-10 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            )
            }

        </Button>
    );
}
