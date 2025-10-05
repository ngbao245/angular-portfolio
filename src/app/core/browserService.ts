import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class BrowserService {
    private readonly document = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);

    isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    matchMedia(query: string): MediaQueryList | null {
        if (!this.isBrowser()) return null;
        return window.matchMedia(query);
    }

    setHtmlAttribute(attr: string, value: string): void {
        if (!this.isBrowser()) return;
        this.document.documentElement.setAttribute(attr, value);
    }

    getLocalItem(key: string): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem(key);
    }

    setLocalItem(key: string, value: string): void {
        if (!this.isBrowser()) return;
        localStorage.setItem(key, value);
    }
}
