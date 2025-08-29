// src/pages/_app.tsx
import "@/styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";

import { GambaProvider, SendTransactionProvider } from "gamba-react-v2";
import { GambaPlatformProvider } from "gamba-react-ui-v2";
import dynamic from "next/dynamic";
import { useMemo } from "react";

// Valeurs par défaut pour éviter les erreurs
const BASE_SEO_CONFIG = {};
const LIVE_EVENT_TOAST = false;
const PLATFORM_CREATOR_FEE = 0;
const PLATFORM_JACKPOT_FEE = 0;
const PLATFORM_REFERRAL_FEE = 0;
const TOKENLIST: any[] = [];

const DynamicTokenMetaProvider = dynamic(
  () => import("gamba-react-ui-v2").then((mod) => mod.TokenMetaProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  const RPC_ENDPOINT =
    process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com";

  if (!process.env.NEXT_PUBLIC_PLATFORM_CREATOR) {
    throw new Error("NEXT_PUBLIC_PLATFORM_CREATOR environment variable is not set");
  }

  const PLATFORM_CREATOR_ADDRESS = new PublicKey(
    process.env.NEXT_PUBLIC_PLATFORM_CREATOR as string
  );

  // Définition des wallets disponibles
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet })
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT} config={{ commitment: "processed" }}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <DynamicTokenMetaProvider tokens={TOKENLIST}>
              <SendTransactionProvider>
                <GambaProvider>
                  <GambaPlatformProvider
                    creator={PLATFORM_CREATOR_ADDRESS}
                    defaultCreatorFee={PLATFORM_CREATOR_FEE}
                    defaultJackpotFee={PLATFORM_JACKPOT_FEE}
                    referral={{ fee: PLATFORM_REFERRAL_FEE, prefix: "code" }}
                  >
                    <Header />
                    <DefaultSeo {...BASE_SEO_CONFIG} />
                    <main className="pt-12">
                      <Component {...pageProps} />
                    </main>
                    <Footer />
                    <Toaster position="bottom-right" richColors />
                    {LIVE_EVENT_TOAST && null}
                  </GambaPlatformProvider>
                </GambaProvider>
              </SendTransactionProvider>
            </DynamicTokenMetaProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ThemeProvider>
    </ConnectionProvider>
  );
}

export default MyApp;

