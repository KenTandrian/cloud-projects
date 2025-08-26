import { AppSidebar } from "@/components/layout/app-sidebar";
import { Provider } from "@/components/layout/provider";
import { VisitorIdProvider } from "@/components/layout/visitor-id-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex AI Search for Commerce",
  description: "Investment broker app demo with Vertex AI Search for Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={cn(inter.className, "antialiased")}>
        <VisitorIdProvider>
          <SidebarProvider>
            <Provider>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </Provider>
          </SidebarProvider>
        </VisitorIdProvider>
      </body>
    </html>
  );
}
