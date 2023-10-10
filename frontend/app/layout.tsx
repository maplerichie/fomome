"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { hardhat, optimism } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.ALCHEMY_API_KEY, // or infuraId
    walletConnectProjectId: "cef5881ca866356e5d94c05abf074660",

    // Required
    appName: "FoMoMe",

    // Optional
    appDescription: "Fear of Missing out, of ME",
    appUrl: "https://tip3.xyz", // your app's url
    appIcon: "https://tip3.xyz/logo.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)

    chains: [hardhat],
  })
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <body>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "105vh",
              }}
              id="main"
            >
              <Navbar />
              <div style={{ flexGrow: 1 }}>{children}</div>
              <Footer />
            </div>
          </body>
        </ConnectKitProvider>
      </WagmiConfig>
    </html>
  );
}
