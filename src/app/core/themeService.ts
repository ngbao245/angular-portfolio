import { DOCUMENT, inject, Injectable } from "@angular/core";
import { BrowserService } from "./browserService";
import { getStoredItem, setStoredItem } from "../shared/utils/storage.util";
import { Theme } from "./enum/theme.enum";

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly browser = inject(BrowserService);
    private readonly document = inject(DOCUMENT);

    private get browserTheme(): Theme {
        return this.browser.matchMedia('(prefers-color-scheme: dark)')?.matches ? Theme.DARK : Theme.LIGHT;
    }

    setDefaultTheme(): void {
        const theme = this.getCurrentTheme();
        this.setTheme(theme);
    }

    getCurrentTheme(): Theme {
        return getStoredItem<Theme>('theme') ?? this.getDefaultTheme();
    }

    getDefaultTheme(): Theme {
        return this.browserTheme === Theme.DARK
            ? Theme.DARK
            : Theme.LIGHT;
    }

    setTheme(theme: Theme): void {
        this.document.documentElement.setAttribute('data-theme', theme);
        return setStoredItem('theme', theme);
    }
}