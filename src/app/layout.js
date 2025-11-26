import "./globals.css";

export const metadata = {
    title: "ENTITY BOUNCE VALIDATOR",
    description: "MADE BY KARMA",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
