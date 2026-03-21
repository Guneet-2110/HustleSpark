import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

/**
 * Creates a Stripe Checkout Session for a venture acquisition.
 */
export const createStripePayment = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    // 1. Authentication Guard
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { amount, listingId, sellerEmail, hustleName } = request.data;

    // 2. Validation Guard
    if (!amount || !listingId || !sellerEmail || !hustleName) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields for payment.");
    }

    // 3. Environment Guard
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error("CRITICAL: STRIPE_SECRET_KEY is not configured in Firebase Secrets.");
      throw new functions.https.HttpsError("failed-precondition", "Payment system is currently offline (Secret Key missing).");
    }

    const stripe = new Stripe(stripeSecret);

    try {
      console.log(`Initializing checkout for: ${hustleName} ($${amount})`);

      // 4. Origin Resolution
      const origin = request.rawRequest.headers.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: hustleName,
                description: `Acquisition of Venture: ${hustleName}`,
              },
              unit_amount: Math.round(amount * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          listingId,
          sellerEmail,
          hustleName,
          buyerId: request.auth.uid,
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listingId=${listingId}&sellerEmail=${encodeURIComponent(sellerEmail)}&amount=${amount}`,
        cancel_url: `${origin}/marketplace/listing/${listingId}`,
      });

      console.log("Checkout session created successfully:", session.id);

      return {
        url: session.url,
        sessionId: session.id,
      };

    } catch (error: any) {
      console.error("Stripe API Error:", error.message);
      throw new functions.https.HttpsError("internal", error.message || "Stripe session creation failed.");
    }
  }
);

/**
 * Confirms the acquisition and sets up the escrow record.
 */
export const confirmAndPayoutSeller = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { sessionId, sellerEmail, totalAmount, listingId } = request.data;

    if (!sessionId || !sellerEmail || totalAmount === undefined) {
      throw new functions.https.HttpsError("invalid-argument", "Missing confirm parameters.");
    }

    try {
      const sellerPayout = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;

      // Use a consistent ID to prevent duplicate recording
      const transactionId = `txn_session_${sessionId}`;
      const txnRef = admin.firestore().collection("transactions").doc(transactionId);
      
      const existingTxn = await txnRef.get();
      if (existingTxn.exists) {
          return { success: true, message: "Transaction already processed." };
      }

      await txnRef.set({
        sessionId,
        listingId,
        buyerId: request.auth.uid,
        buyerEmail: request.auth.token.email || "",
        sellerEmail,
        totalAmount,
        sellerPayout,
        platformFee,
        status: "pending_delivery", // Held in escrow until delivery confirmed by buyer
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Escrow recorded successfully for session:", sessionId);

      return {
        success: true,
        sellerPayout,
        platformFee,
      };

    } catch (error: any) {
      console.error("Payout confirmation error:", error.message);
      throw new functions.https.HttpsError("internal", error.message || "Failed to record transaction.");
    }
  }
);