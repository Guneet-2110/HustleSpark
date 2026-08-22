"use strict";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as validator from "validator";

admin.initializeApp();

// ============================================================
// SECURITY UTILITIES
// ============================================================

// Simple in-memory rate limiter (per Cloud Function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

function sanitizeString(input: any, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return validator.escape(input.trim()).slice(0, maxLength);
}

function sanitizeEmail(input: any): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim().toLowerCase().slice(0, 254);
  return validator.isEmail(trimmed) ? trimmed : "";
}

function sanitizeNumber(input: any, min = 0, max = 100000): number {
  const num = Number(input);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, min), max);
}

function validateRequest(data: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// ============================================================
// 1. CREATE STRIPE PAYMENT SESSION
// ============================================================
export const createStripePayment = functions.https.onCall(
  { secrets: ["STRIPE_SECRET_KEY"] },
  async (request) => {
    // Auth check
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    // Rate limit: 10 payment attempts per user per hour
    const rateLimitKey = `payment_${request.auth.uid}`;
    if (!checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000)) {
      throw new functions.https.HttpsError("resource-exhausted", "Too many payment attempts. Please try again later.");
    }

    // Validate and sanitize inputs
    const validationError = validateRequest(request.data, ["amount", "listingId", "sellerEmail", "hustleName"]);
    if (validationError) {
      throw new functions.https.HttpsError("invalid-argument", validationError);
    }

    const amount = sanitizeNumber(request.data.amount, 1, 10000);
    const listingId = sanitizeString(request.data.listingId, 100);

    const sellerEmail = sanitizeEmail(request.data.sellerEmail);
    const hustleName = sanitizeString(request.data.hustleName, 200);

    if (!sellerEmail) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid seller email.");
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new functions.https.HttpsError("failed-precondition", "Payment system offline.");
    }

    const stripe = new Stripe(stripeSecret);
    try {
      const origin = request.rawRequest.headers.origin || "https://hustlespark.net";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: hustleName,
              description: `Service: ${hustleName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        metadata: {
          listingId,
          sellerEmail,
          hustleName,
          buyerId: request.auth.uid,
          buyerEmail: request.auth.token.email || "",
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listingId=${listingId}&sellerEmail=${encodeURIComponent(sellerEmail)}&amount=${amount}`,
        cancel_url: listingId === "premium_upgrade"
          ? `${origin}/profile`
          : `${origin}/marketplace/listing/${listingId}`,
      });
      return { url: session.url };
    } catch (error: any) {
      console.error("Stripe API Error:", error.message);
      throw new functions.https.HttpsError("internal", "Payment session creation failed.");
    }
  }
);

// ============================================================
// 2. CONFIRM PAYOUT TO SELLER (with Stripe session verification)
// ============================================================
export const confirmAndPayoutSeller = functions.https.onCall(
  { secrets: ["STRIPE_SECRET_KEY", "RESEND_API_KEY"] },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    // Rate limit: 20 confirmations per user per hour
    if (!checkRateLimit(`confirm_${request.auth.uid}`, 20, 60 * 60 * 1000)) {
      throw new functions.https.HttpsError("resource-exhausted", "Too many requests. Please try again later.");
    }

    const validationError = validateRequest(request.data, ["sessionId", "sellerEmail", "totalAmount", "listingId"]);
    if (validationError) {
      throw new functions.https.HttpsError("invalid-argument", validationError);
    }

    const sessionId = sanitizeString(request.data.sessionId, 200);
    const sellerEmail = sanitizeEmail(request.data.sellerEmail);
    const totalAmount = sanitizeNumber(request.data.totalAmount, 0, 100000);
    const listingId = sanitizeString(request.data.listingId, 100);


    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new functions.https.HttpsError("failed-precondition", "Payment system offline.");
    }

    const db = admin.firestore();

    // VERIFY STRIPE SESSION - prevents fake confirmations
    const stripe = new Stripe(stripeSecret);
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        throw new functions.https.HttpsError("failed-precondition", "Payment not completed.");
      }
      if (session.metadata?.listingId !== listingId) {
        throw new functions.https.HttpsError("permission-denied", "Session mismatch.");
      }
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", "Could not verify payment.");
    }

    // Check for duplicate processing
    const transactionId = `txn_session_${sessionId}`;
    const txnRef = db.collection("transactions").doc(transactionId);
    const existingTxn = await txnRef.get();
    if (existingTxn.exists) {
      return { success: true, message: "Already processed." };
    }

    // Get listing data
    const listingDoc = await db.collection("marketplace_listings").doc(listingId).get();
    if (!listingDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Listing not found.");
    }

    const listingData = listingDoc.data()!;
    const sellerId = listingData.userId;
    const hustleName = sanitizeString(listingData.hustleName, 200);

    const stripeFee = ((totalAmount * 0.029) + 0.30).toFixed(2);
    const amountAfterStripe = (totalAmount - parseFloat(stripeFee));
    const sellerPayout = (amountAfterStripe * 0.9).toFixed(2);
    const platformFee = (amountAfterStripe * 0.1).toFixed(2);
    const buyerEmail = sanitizeEmail(request.auth.token.email || "");

    // Get seller account email
    let sellerAccountEmail = sellerEmail;
    try {
      const sellerDoc = await db.collection("users").doc(sellerId).get();
      if (sellerDoc.exists && sellerDoc.data()?.email) {
        sellerAccountEmail = sellerDoc.data()!.email;
      }
    } catch (e) {
      console.warn("Could not fetch seller account email");
    }

    // Create escrow transaction
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

    // Initialize chat
    const chatRef = db.collection("chats").doc();
    await chatRef.set({
      isNew: true,
      listingId,
      hustleName,
      buyerId: request.auth.uid,
      buyerEmail,
      sellerId,
      sellerEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: "System: Purchase confirmed. Conversation started.",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await chatRef.collection("messages").add({
      text: `Purchase confirmed! Buyer has paid $${totalAmount}. Seller, please provide the service for ${hustleName}.`,
      senderId: "system",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const sendEmail = async (to: string, subject: string, html: string) => {
          await resend.emails.send({
            from: "HustleSpark <notifications@hustlespark.net>",
            to,
            subject,
            html,
          });
        };

        // Admin email
        await sendEmail(
          "guneet.ar2010@gmail.com",
          `🚀 New Sale! ${hustleName} - $${totalAmount}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #9D4EDD;">💰 New Sale on HustleSpark!</h1>
            <p><strong>Hustle:</strong> ${hustleName}</p>
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            <p><strong>Seller PayPal:</strong> ${sellerEmail}</p>
            <p><strong>Total Paid:</strong> $${totalAmount}</p>
            <p><strong>Stripe Fee:</strong> -$${stripeFee}</p>
            <p><strong>Amount After Stripe:</strong> $${amountAfterStripe.toFixed(2)}</p>
            <p><strong>Platform Fee (10%):</strong> -$${platformFee}</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 10px; border: 2px solid #dc2626; margin: 20px 0;">
              <p style="color: #dc2626; font-size: 18px; margin: 0;"><strong>ACTION REQUIRED: Send $${sellerPayout} to ${sellerEmail} via PayPal once buyer confirms receipt.</strong></p>
            </div>
          </div>`
        );

        // Buyer email
        await sendEmail(
          buyerEmail,
          `✅ Purchase Confirmed - ${hustleName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #9D4EDD;">🎉 Purchase Confirmed!</h1>
            <p>You have successfully purchased <strong>${hustleName}</strong> for $${totalAmount}.</p>
            <p>Your payment is held securely in escrow. The seller will deliver within <strong>72 hours</strong>.</p>
            <p>Once you receive everything, please <strong>confirm receipt</strong> in your dashboard.</p>
            <a href="https://hustlespark.net/profile" style="display: inline-block; background: #9D4EDD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">Go to Dashboard →</a>
          </div>`
        );

        // Seller email
        await sendEmail(
          sellerAccountEmail,
          `💰 You Have a New Buyer! ${hustleName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #9D4EDD;">💰 You Have a New Buyer!</h1>
            <p>Congratulations! <strong>${hustleName}</strong> has been purchased for $${totalAmount}.</p>
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            <p><strong>Your payout:</strong> $${sellerPayout} (after Stripe & platform fees)</p>
            <p>You have a <strong>new chat waiting</strong> from your buyer.</p>
            <p>Please deliver your service within <strong>72 hours</strong>, then mark as delivered in your dashboard.</p>
            <a href="https://hustlespark.net/chats" style="display: inline-block; background: #9D4EDD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">View New Chat →</a>
          </div>`
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return { success: true };
  }
);

// ============================================================
// 3. SEND SALE NOTIFICATION
// ============================================================
export const sendSaleNotification = functions.https.onCall(
  { secrets: ["RESEND_API_KEY"] },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    // Rate limit: 30 notifications per user per hour
    if (!checkRateLimit(`notify_${request.auth.uid}`, 30, 60 * 60 * 1000)) {
      throw new functions.https.HttpsError("resource-exhausted", "Too many requests.");
    }

    const validationError = validateRequest(request.data, ["hustleName", "totalAmount", "sellerEmail", "buyerEmail", "listingId", "status"]);
    if (validationError) {
      throw new functions.https.HttpsError("invalid-argument", validationError);
    }

    const hustleName = sanitizeString(request.data.hustleName, 200);
    const totalAmount = sanitizeNumber(request.data.totalAmount, 0, 100000);
    const listingId = sanitizeString(request.data.listingId, 100);
    const sellerEmail = sanitizeEmail(request.data.sellerEmail);
    const buyerEmail = sanitizeEmail(request.data.buyerEmail) || sanitizeString(request.data.buyerEmail, 200);

    const status = sanitizeString(request.data.status, 500);

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      throw new functions.https.HttpsError("failed-precondition", "Email service offline.");
    }

    const stripeFee = ((totalAmount * 0.029) + 0.30).toFixed(2);
    const amountAfterStripe = (totalAmount - parseFloat(stripeFee));
    const sellerPayout = (amountAfterStripe * 0.9).toFixed(2);
    const platformFee = (amountAfterStripe * 0.1).toFixed(2);
    const isDispute = status.includes("DISPUTE");

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "HustleSpark <notifications@hustlespark.net>",
        to: "guneet.ar2010@gmail.com",
        subject: `📋 HustleSpark Update: ${hustleName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #9D4EDD;">📋 Transaction Update</h1>
          <p><strong>Hustle:</strong> ${hustleName}</p>
          <p><strong>Buyer:</strong> ${buyerEmail}</p>
          <p><strong>Seller PayPal:</strong> ${sellerEmail}</p>
          <p><strong>Total Paid by Buyer:</strong> $${totalAmount}</p>
          <p><strong>Stripe Fee:</strong> -$${stripeFee}</p>
          <p><strong>Amount After Stripe:</strong> $${amountAfterStripe.toFixed(2)}</p>
          <p><strong>Platform Fee (10%):</strong> -$${platformFee}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${!isDispute ? `<p style="color: #dc2626;"><strong>Send $${sellerPayout} to ${sellerEmail} via PayPal</strong></p>` : ""}
        </div>`,
      });

      console.log("Notification email sent successfully");
      return { success: true };
    } catch (error: any) {
      console.error("Email Error:", error);
      throw new functions.https.HttpsError("internal", "Failed to send notification.");
    }
  }
);
