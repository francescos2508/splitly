import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    httpEquiv="X-UA-Compatible"
                    content="IE=edge"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
                {/* style to avoid select text like i am in safari */}
                <style>{`
                :root {
                    --background: #F7F7FA;      /* colors.background */
                }

                    * {
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-touch-callout: none;
                         -webkit-tap-highlight-color: transparent;
                    }
                    html, body { overscroll-behavior: none; background-color: var(--background); }
                    input, textarea { -webkit-user-select: text; user-select: text; outline: none }
                    /* bottombar */
                    @media (display-mode: standalone) {
                        div:has(> div > a[role="tab"]) {
                            transform: translateY(10px);
                            height: 70px !important;
                            overflow: visible !important;
                        }
                    }
                `}</style>

                <link rel="manifest" href="/manifest.json" />

                <link
                    rel="apple-touch-icon"
                    href="/icon-192x192.png"
                />

                <meta
                    name="apple-mobile-web-app-capable"
                    content="yes"
                />

                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta
                    name="theme-color"
                    content="#F7F7FA"
                />

                <ScrollViewStyleReset />
            </head>

            <body>{children}</body>
        </html>
    );
}