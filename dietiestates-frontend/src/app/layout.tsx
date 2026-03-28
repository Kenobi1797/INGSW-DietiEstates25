// app/layout.tsx

import { UserProvider } from "@/Context/Context";
import './globals.css';
import NavbarWrapper from "@/components/NavbarWrapper";

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <NavbarWrapper>
          </NavbarWrapper>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
