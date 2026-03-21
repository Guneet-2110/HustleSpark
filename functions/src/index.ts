
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
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { amount, listingId, sellerEmail, hustleName } = request.data;

    if (!amount || !listingId || !sellerEmail || !hustleName) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields for payment.");
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error("CRITICAL: STRIPE_SECRET_KEY missing.");
      throw new functions.https.HttpsError("failed-precondition", "Payment system offline.");
    }

    const stripe = new Stripe(stripeSecret);

    try {
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
              unit_amount: Math.round(amount * 100),
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

      return {
        url: session.url,
        sessionId: session.id,
      };

    } catch (error: any) {
      console.error("Stripe API Error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

/**
 * Confirms the acquisition and sets up the escrow record and chat.
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

    if (!sessionId || !sellerEmail || totalAmount === undefined || !listingId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing confirm parameters.");
    }

    try {
      const db = admin.firestore();
      
      // 1. Fetch Listing Details to get Seller ID
      const listingDoc = await db.collection("marketplace_listings").doc(listingId).get();
      if (!listingDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Listing not found.");
      }
      const listingData = listingDoc.data()!;
      const sellerId = listingData.userId;
      const hustleName = listingData.hustleName;

      // 2. Prevent Duplicate Recording
      const transactionId = `txn_session_${sessionId}`;
      const txnRef = db.collection("transactions").doc(transactionId);
      const existingTxn = await txnRef.get();
      
      if (existingTxn.exists) {
          return { success: true, message: "Already processed." };
      }

      const sellerPayout = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;

      // 3. Create Escrow Transaction Record
      await txnRef.set({
        sessionId,
        listingId,
        hustleName,
        buyerId: request.auth.uid,
        buyerEmail: request.auth.token.email || "",
        sellerId: sellerId,
        sellerEmail: sellerEmail,
        amount: totalAmount,
        sellerAmount: sellerPayout,
        platformFee: platformFee,
        status: "pending_delivery",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Initialize Chat Channel
      const chatQuery = await db.collection("chats")
        .where("listingId", "==", listingId)
        .where("buyerId", "==", request.auth.uid)
        .limit(1)
        .get();

      if (chatQuery.empty) {
        const chatRef = db.collection("chats").doc();
        await chatRef.set({
          listingId,
          hustleName,
          buyerId: request.auth.uid,
          sellerId: sellerId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessage: "System: Acquisition successful. Start your conversation here!",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await chatRef.collection("messages").add({
          text: `Acquisition Confirmed! Buyer has paid $${totalAmount}. Seller, please provide the assets for ${hustleName}.`,
          senderId: "system",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        sellerPayout,
        platformFee,
      };

    } catch (error: any) {
      console.error("Payout confirmation error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);
