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
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                {/* style to avoid select text like i am in safari */}
                <style>{`
                    * {
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-touch-callout: none;
                         -webkit-tap-highlight-color: transparent;
                    }
                    html, body { overscroll-behavior: none; }
                    input, textarea { -webkit-user-select: text; user-select: text; }
                    body {
                        padding-top: env(safe-area-inset-top);
                        padding-top: 100px !important;
                        background: red;
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