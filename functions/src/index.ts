import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { Resend } from "resend";

admin.initializeApp();

async function sendEmail(to: string, subject: string, html: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: "HustleSpark <noreply@hustlespark.net>",
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error: any) {
    console.error("Email failed:", error.message);
  }
}

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
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new functions.https.HttpsError("failed-precondition", "Payment system offline.");
    }

    const stripe = new Stripe(stripeSecret);

    try {
      const origin = request.rawRequest.headers.origin || "https://hustlespark.net";

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
          buyerEmail: request.auth.token.email || "",
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listingId=${listingId}&sellerEmail=${encodeURIComponent(sellerEmail)}&amount=${amount}`,
        cancel_url: `${origin}/marketplace/listing/${listingId}`,
      });

      return { url: session.url };

    } catch (error: any) {
      console.error("Stripe API Error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);

export const confirmAndPayoutSeller = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY", "RESEND_API_KEY"],
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { sessionId, sellerEmail, totalAmount, listingId } = request.data;

    if (!sessionId || !sellerEmail || totalAmount === undefined || !listingId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing parameters.");
    }

    try {
      const db = admin.firestore();

      const listingDoc = await db.collection("marketplace_listings").doc(listingId).get();
      if (!listingDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Listing not found.");
      }

      const listingData = listingDoc.data()!;
      const sellerId = listingData.userId;
      const hustleName = listingData.hustleName;

      const transactionId = `txn_session_${sessionId}`;
      const txnRef = db.collection("transactions").doc(transactionId);
      const existingTxn = await txnRef.get();

      if (existingTxn.exists) {
        return { success: true, message: "Already processed." };
      }

      const sellerPayout = (totalAmount * 0.9).toFixed(2);
      const platformFee = (totalAmount * 0.1).toFixed(2);
      const buyerEmail = request.auth.token.email || "";

      // 1. Create Escrow Transaction
      await txnRef.set({
        sessionId,
        listingId,
        hustleName,
        buyerId: request.auth.uid,
        buyerEmail,
        sellerId,
        sellerEmail,
        amount: totalAmount,
        sellerAmount: parseFloat(sellerPayout),
        platformFee: parseFloat(platformFee),
        status: "pending_delivery",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Initialize Chat
      const chatRef = db.collection("chats").doc();
      await chatRef.set({
        listingId,
        hustleName,
        buyerId: request.auth.uid,
        sellerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessage: "System: Acquisition successful. Conversation started.",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await chatRef.collection("messages").add({
        text: `Acquisition Confirmed! Buyer has paid $${totalAmount}. Seller, please provide the assets for ${hustleName}.`,
        senderId: "system",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Email Admin
      await sendEmail(
        "guneet.ar2010@gmail.com",
        `🚀 New Sale! ${hustleName} - $${totalAmount}`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #9D4EDD;">💰 New Sale on HustleSpark!</h1>
          <p><strong>Venture:</strong> ${hustleName}</p>
          <p><strong>Buyer:</strong> ${buyerEmail}</p>
          <p><strong>Seller PayPal:</strong> ${sellerEmail}</p>
          <p><strong>Total Paid:</strong> $${totalAmount}</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 10px; border: 2px solid #dc2626; margin: 20px 0;">
            <p style="color: #dc2626; font-size: 18px; margin: 0;"><strong>ACTION REQUIRED: Send $${sellerPayout} to ${sellerEmail} via PayPal once buyer confirms receipt.</strong></p>
          </div>
        </div>`
      );

      // 4. Email Buyer
      await sendEmail(
        buyerEmail,
        `✅ Acquisition Confirmed - ${hustleName}`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #9D4EDD;">🎉 Purchase Confirmed!</h1>
          <p>You have successfully acquired <strong>${hustleName}</strong> for $${totalAmount}.</p>
          <p>Your payment is held securely in escrow. The seller has been notified and will deliver all assets within <strong>3 days</strong>.</p>
          <p>Once you receive everything, please <strong>confirm receipt</strong> in your dashboard to release payment to the seller.</p>
          <a href="https://hustlespark.net/profile" style="display: inline-block; background: #9D4EDD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">Go to Dashboard →</a>
        </div>`
      );

      // 5. Email Seller
      await sendEmail(
        sellerEmail,
        `💰 You made a sale! ${hustleName}`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #9D4EDD;">🚀 Your Venture Was Acquired!</h1>
          <p>Congratulations! <strong>${hustleName}</strong> has been purchased for $${totalAmount}.</p>
          <p>Your payout: <strong>$${sellerPayout}</strong> (90%)</p>
          <p>Please deliver all assets to the buyer within <strong>3 days</strong>, then mark as delivered in your dashboard.</p>
          <p>Payment will be released once the buyer confirms receipt.</p>
          <a href="https://hustlespark.net/profile" style="display: inline-block; background: #9D4EDD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">Go to Dashboard →</a>
        </div>`
      );

      return { success: true };

    } catch (error: any) {
      console.error("Payout confirmation error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);