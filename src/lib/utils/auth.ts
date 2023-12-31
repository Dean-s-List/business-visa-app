import type { SIWS } from "@web3auth/sign-in-with-solana";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";

import env from "@/src/lib/env/index.mjs";

import { logError } from "./general";
import { verifySignature } from "./web3auth";

const authPage = "/";

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Solana",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                },
            },
            async authorize(credentials, authReq) {
                try {
                    if (!credentials?.message) {
                        throw new Error("credentials does not have message!");
                    }

                    if (!credentials?.signature) {
                        throw new Error("credentials does not have signature!");
                    }

                    if (!env.NEXTAUTH_URL) {
                        throw new Error("NEXTAUTH_URL env not defined!");
                    }

                    const solanaSignInMessage: SIWS = JSON.parse(
                        credentials.message
                    );

                    const frontendUrl = new URL(env.NEXTAUTH_URL);

                    if (
                        solanaSignInMessage.payload.domain !== frontendUrl.host
                    ) {
                        throw new Error("domain does not match!");
                    }

                    const csrfToken = await getCsrfToken({
                        req: { ...authReq, body: null },
                    });

                    if (solanaSignInMessage.payload.nonce !== csrfToken) {
                        throw new Error("nonce does not match!");
                    }

                    const validationResult = await verifySignature({
                        message: solanaSignInMessage,
                        signature: credentials.signature,
                    });

                    if (!validationResult) {
                        throw new Error(
                            "could not validate the signed message!"
                        );
                    }

                    return {
                        id: solanaSignInMessage.payload.address,
                    };
                } catch (error) {
                    logError("Error authorizing credentials", error);
                    return null;
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    secret: env.NEXTAUTH_SECRET,

    callbacks: {
        async session({ session, token }) {
            const walletAddress = token.sub;

            if (!walletAddress) {
                throw new Error("walletAddress not found in token!");
            }

            const adminWallets = env.ADMIN_WALLETS.split(",");

            if (!adminWallets.includes(walletAddress)) {
                throw new Error("walletAddress is not an admin!");
            }

            // eslint-disable-next-line no-param-reassign
            session.user = {
                walletAddress,
                role: "admin",
            };

            return session;
        },
    },

    pages: {
        signIn: authPage,
        signOut: authPage,
        error: authPage,
        newUser: authPage,
        verifyRequest: authPage,
    },
};

export default authOptions;
