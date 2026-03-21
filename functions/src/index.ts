
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

export const createStripePayment = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { amount, listingId, sellerEmail, hustleName } = request.data;

    if (!amount || !listingId || !sellerEmail) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    try {
      console.log("Creating payment intent for amount:", amount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          listingId,
          sellerEmail,
          hustleName,
          buyerId: request.auth.uid,
        },
      });

      console.log("Payment intent created:", paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };

    } catch (error: any) {
      console.error("Stripe error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

export const confirmAndPayoutSeller = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { paymentIntentId, sellerEmail, totalAmount, listingId } = request.data;

    if (!paymentIntentId || !sellerEmail || totalAmount === undefined) {
      throw new functions.https.HttpsError("invalid-argument", "Missing confirm parameters.");
    }

    try {
      const sellerPayout = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;

      // Save transaction to Firestore using a transaction or set with ID to prevent duplicates
      const transactionId = `txn_${paymentIntentId}`;
      const txnRef = admin.firestore().collection("transactions").doc(transactionId);
      
      const existingTxn = await txnRef.get();
      if (existingTxn.exists) {
          return { success: true, message: "Transaction already processed." };
      }

      await txnRef.set({
        paymentIntentId,
        listingId,
        buyerId: request.auth.uid,
        buyerEmail: request.auth.token.email || "",
        sellerEmail,
        totalAmount,
        sellerPayout,
        platformFee,
        status: "pending_delivery", // Funds held in escrow until delivery confirmation
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Escrow transaction recorded:", transactionId);

      return {
        success: true,
        sellerPayout,
        platformFee,
      };

    } catch (error: any) {
      console.error("Payout error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);
