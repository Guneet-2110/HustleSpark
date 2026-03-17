import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const PAYPAL_BASE_URL = "https://api-m.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  console.log("Getting PayPal access token...");
  console.log("Client ID exists:", !!clientId);
  console.log("Client Secret exists:", !!clientSecret);

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: { username: clientId!, password: clientSecret! },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  console.log("Access token received:", !!response.data.access_token);
  return response.data.access_token;
}

export const processMarketplacePayout = functions.https.onCall(
  {
    secrets: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_PLATFORM_EMAIL"],
  },
  async (request) => {
    console.log("Function called with data:", JSON.stringify(request.data));

    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { sellerEmail, totalAmount, listingId, buyerId } = request.data;
    console.log("Seller email:", sellerEmail);
    console.log("Total amount:", totalAmount);
    console.log("Listing ID:", listingId);

    if (!sellerEmail || !totalAmount || !listingId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }

    const sellerAmount = (totalAmount * 0.9).toFixed(2);
    const platformAmount = (totalAmount * 0.1).toFixed(2);
    console.log("Seller amount:", sellerAmount);
    console.log("Platform amount:", platformAmount);

    try {
      console.log("Getting access token...");
      const accessToken = await getPayPalAccessToken();
      console.log("Got access token, sending payout...");

      const payoutResponse = await axios.post(
        `${PAYPAL_BASE_URL}/v1/payments/payouts`,
        {
          sender_batch_header: {
            sender_batch_id: `payout_${listingId}_${Date.now()}`,
            email_subject: "You sold a hustle on HustleSpark! 🚀",
            email_message: "Congratulations! Your venture has been acquired. Here is your payout.",
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: { value: sellerAmount, currency: "USD" },
              receiver: sellerEmail,
              note: "HustleSpark marketplace sale payout (90%)",
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payout response:", JSON.stringify(payoutResponse.data));

      await admin.firestore().collection("transactions").add({
        listingId,
        buyerId,
        sellerEmail,
        totalAmount,
        sellerPayout: parseFloat(sellerAmount),
        platformFee: parseFloat(platformAmount),
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Transaction saved to Firestore!");
      return { success: true, sellerPayout: sellerAmount, platformFee: platformAmount };

    } catch (error: any) {
      console.error("Payout error FULL:", JSON.stringify(error.response?.data, null, 2));
      console.error("Payout error MESSAGE:", error.message);
      console.error("Payout error STATUS:", error.response?.status);
      throw new functions.https.HttpsError("internal", "Payout failed. Please try again.");
    }
  }
);