
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as nodemailer from "nodemailer";

admin.initializeApp();

/**
 * Helper to send email notifications for new sales.
 */
async function sendSaleEmail(data: {
  hustleName: string;
  totalAmount: number;
  sellerEmail: string;
  buyerEmail: string;
  listingId: string;
}) {
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailPass) {
    console.error("GMAIL_APP_PASSWORD not set. Skipping notification.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "guneet.ar2010@gmail.com",
      pass: gmailPass,
    },
  });

  const sellerPayout = (data.totalAmount * 0.9).toFixed(2);
  const platformFee = (data.totalAmount * 0.1).toFixed(2);

  const mailOptions = {
    from: "guneet.ar2010@gmail.com",
    to: "guneet.ar2010@gmail.com",
    subject: `🚀 HustleSpark Sale! ${data.hustleName} - $${data.totalAmount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
        <h1 style="color: #9D4EDD;">💰 New Sale on HustleSpark!</h1>
        
        <div style="background: #f8f8f8; padding: 20px; border-radius: 15px; margin: 20px 0; border: 1px solid #e0e0e0;">
          <h2 style="margin: 0 0 10px 0;">${data.hustleName}</h2>
          <p style="color: #666; font-size: 12px;">Listing ID: ${data.listingId}</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin: 0 0 15px 0;">💵 Payment Breakdown</h3>
          <p><strong>Total Paid by Buyer:</strong> $${data.totalAmount}</p>
          <p><strong>Platform Fee (10%):</strong> $${platformFee} ✅</p>
          <p style="color: #dc2626; font-size: 18px;"><strong>To Payout (90%):</strong> $${sellerPayout}</p>
        </div>

        <div style="background: #fef2f2; padding: 20px; border-radius: 15px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0;">📤 Send Payout To:</h3>
          <p style="font-size: 20px; font-weight: bold; color: #dc2626; margin: 0;">${data.sellerEmail}</p>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 15px; margin: 20px 0;">
          <h3 style="color: #0369a1; margin: 0 0 15px 0;">👤 Buyer Info</h3>
          <p><strong>Buyer Email:</strong> ${data.buyerEmail}</p>
        </div>

        <p style="color: #666; font-size: 11px; text-align: center; margin-top: 30px;">
          This is an automated administrative notification from HustleSpark.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Sale notification email sent successfully!");
  } catch (error: any) {
    console.error("Failed to send sale email:", error.message);
  }
}

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

/**
 * Confirms the acquisition, sets up the escrow record, chat, and notifies admin.
 */
export const confirmAndPayoutSeller = functions.https.onCall(
  {
    secrets: ["STRIPE_SECRET_KEY", "GMAIL_APP_PASSWORD"],
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

      const sellerPayout = totalAmount * 0.9;
      const platformFee = totalAmount * 0.1;
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
        sellerAmount: sellerPayout,
        platformFee,
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

      // 3. Notify Admin via Email
      await sendSaleEmail({
        hustleName,
        totalAmount,
        sellerEmail,
        buyerEmail,
        listingId,
      });

      return { success: true };

    } catch (error: any) {
      console.error("Payout confirmation error:", error.message);
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);
