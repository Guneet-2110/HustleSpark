import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const generateHustleIdeas = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { promptInterest } = request.body || {};
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_key_here") {
        logger.info("Using fallback ideas because GOOGLE_GENAI_API_KEY is not set.");
        response.json({
          ideas: [
            {
              hustleName: "Homework Hero Helper",
              description: "Help classmates study for spelling tests and math quizzes during study hall!",
              price: 15,
              cost: 5,
              aiGeneratedCopy: "Get top grades on your next quiz with fun study sessions!",
              category: "Services",
              suggestedLogo: "📚",
            },
            {
              hustleName: "Recess Game Coach",
              description: "Teach your friends cool new tag games and referee soccer matches at recess!",
              price: 10,
              cost: 3,
              aiGeneratedCopy: "Never get bored at recess! Learn awesome new games!",
              category: "Services",
              suggestedLogo: "⚽",
            },
            {
              hustleName: "Digital Comic Creator",
              description: "Create custom digital mini-comics on your computer featuring your friends as superheroes!",
              price: 25,
              cost: 8,
              aiGeneratedCopy: "Star in your very own digital superhero comic strip!",
              category: "Digital",
              suggestedLogo: "⚡",
            },
          ],
        });
        return;
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a friendly business coach for kids aged 9-13.
Generate 3 fun, realistic classroom service hustle business ideas based on the student's interest: "${promptInterest || 'tutoring and games'}".

CRITICAL SERVICE-ONLY CONSTRAINT:
Only generate service-based business ideas where the student uses their existing skills, knowledge, or time to help others. Never suggest ideas that require buying materials, supplies, or equipment. Examples of good ideas: tutoring, teaching a skill, performing a service, creating digital content. Examples of bad ideas: selling handmade crafts, baking, making physical products.

IMPORTANT INSTRUCTIONS:
- Write for a 9-year-old level. Use short sentences, no business jargon, and a super fun and encouraging tone!
- Respond strictly with valid JSON array containing exactly 3 objects.
- Each object must have fields:
  - "hustleName": catchy name
  - "description": 2 short sentences explaining what service the student provides
  - "price": integer between 10 and 50 (classroom currency)
  - "cost": integer between 3 and 10 (upfront tool/prep cost in classroom currency)
  - "aiGeneratedCopy": a fun 1-sentence sales pitch for classmates
  - "category": one of ["Services", "Digital", "Fun"]
  - "suggestedLogo": single emoji character representing the hustle

Format output as JSON inside \`\`\`json block.`;

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = genResponse.text || "";
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        response.json({ ideas: parsed });
        return;
      }

      response.status(500).json({ error: "Failed to parse AI response into JSON ideas" });
    } catch (error: any) {
      logger.error("Cloud Function Gemini Error:", error);
      response.status(500).json({ error: error.message || "Failed to generate ideas" });
    }
  }
);

export const generatePitch = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { hustleName, description } = request.body || {};
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_key_here") {
        response.json({ pitch: `Get ready for ${hustleName || 'the best service in class'}! You're going to love it!` });
        return;
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Write a super fun, 1-sentence sales pitch slogan for a 9-13 year old student's hustle named "${hustleName}" with description "${description}". Make it exciting and catchy for classmates!`;

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const pitch = (genResponse.text || "").trim().replace(/^"/, "").replace(/"$/, "");
      response.json({ pitch });
    } catch (error: any) {
      logger.error("Generate Pitch Error:", error);
      response.status(500).json({ error: error.message || "Failed to generate pitch." });
    }
  }
);

export const generatePivotReport = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { listingName, description, category } = request.body || {};
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;

      if (!apiKey || apiKey === "your_gemini_key_here") {
        response.json({
          analysis: `Your hustle "${listingName}" is great, but classmates might need a clearer offer or lower price to make their first purchase!`,
          suggestions: [
            "Lower your price by 5 SparkCoins for a 1-week launch sale!",
            "Add a free 5-minute trial session so classmates can test your service.",
            "Update your logo emoji and write a fun sales pitch for study hall!"
          ]
        });
        return;
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a supportive business coach for a middle school student.
Their hustle "${listingName}" (${category}) with description "${description}" has been live for 7 days without sales.
Provide a friendly 2-sentence analysis of why it might not be selling, plus 3 specific, actionable suggestions for how they can pivot or improve it.

Return output strictly as JSON format inside \`\`\`json block with fields:
- "analysis": string
- "suggestions": array of 3 strings`;

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = genResponse.text || "";
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        response.json(parsed);
        return;
      }

      response.status(500).json({ error: "Failed to parse AI pivot report." });
    } catch (error: any) {
      logger.error("Generate Pivot Report Error:", error);
      response.status(500).json({ error: error.message || "Failed to generate pivot report." });
    }
  }
);

export const triggerMarketEvent = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { classroomId, eventType } = request.body || {};

      if (!classroomId || !eventType) {
        response.status(400).json({ error: "Missing required fields: classroomId, eventType" });
        return;
      }

      const admin = await import("firebase-admin");
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      const db = admin.firestore();

      const classRef = db.collection("classrooms").doc(classroomId);
      const classDoc = await classRef.get();
      if (!classDoc.exists) {
        response.status(404).json({ error: "Classroom not found" });
        return;
      }

      const classData = classDoc.data() || {};
      const studentsSnap = await classRef.collection("students").get();
      const listingsSnap = await classRef.collection("listings").get();

      let eventName = "";
      let details = "";
      let notificationMsg = "";

      if (eventType === "inflation") {
        eventName = "Inflation Week 📈";
        details = "Listing prices increased by 20% across the classroom marketplace!";
        notificationMsg = "📈 Inflation Week! All marketplace item prices went up by 20%.";

        const batch = db.batch();
        listingsSnap.docs.forEach((lDoc) => {
          const lData = lDoc.data();
          const oldPrice = Number(lData.price) || 10;
          const newPrice = Math.max(1, Math.round(oldPrice * 1.2));
          batch.update(lDoc.ref, { price: newPrice });
        });
        await batch.commit();
      } else if (eventType === "recession") {
        eventName = "Recession Hit 📉";
        details = "All student balances adjusted by -10% due to economic slowdown.";
        notificationMsg = "📉 Recession Hit! Your balance went down by 10%.";

        const batch = db.batch();
        studentsSnap.docs.forEach((sDoc) => {
          const sData = sDoc.data();
          const oldBal = Number(sData.balance) || 0;
          const newBal = Math.max(0, Math.round(oldBal * 0.9));
          batch.update(sDoc.ref, { balance: newBal });
        });
        await batch.commit();
      } else if (eventType === "taxday") {
        eventName = "Classroom Tax Day 🏛️";
        details = "Collected 10% tax from all active student balances.";
        notificationMsg = "🏛️ Tax Day! Your teacher collected 10% tax from all balances.";

        const batch = db.batch();
        studentsSnap.docs.forEach((sDoc) => {
          const sData = sDoc.data();
          const oldBal = Number(sData.balance) || 0;
          const newBal = Math.max(0, Math.round(oldBal * 0.9));
          batch.update(sDoc.ref, { balance: newBal });
        });
        await batch.commit();
      } else if (eventType === "bonuspayday") {
        eventName = "Bonus Payday! 🎉";
        details = "Awarded +50 extra SparkCoins to every student in class!";
        notificationMsg = "🎉 Bonus Payday! Your teacher gave everyone 50 extra SparkCoins!";

        const batch = db.batch();
        studentsSnap.docs.forEach((sDoc) => {
          const sData = sDoc.data();
          const oldBal = Number(sData.balance) || 0;
          const oldEarned = Number(sData.totalEarned) || 0;
          batch.update(sDoc.ref, {
            balance: oldBal + 50,
            totalEarned: oldEarned + 50,
          });
        });
        await batch.commit();
      } else if (eventType === "doubleearnings") {
        const isDoubleCurrently = classData.economySettings?.doubleEarningsActive || false;
        const nextDouble = !isDoubleCurrently;
        eventName = nextDouble ? "Double Earnings Week! ⚡⚡" : "Normal Earnings Resumed";
        details = nextDouble ? "Sellers now earn DOUBLE SparkCoins on every sale!" : "Earnings returned to 1x.";
        notificationMsg = nextDouble
          ? "⚡⚡ Double Earnings Week! You now earn 2x SparkCoins on every sale you make!"
          : "Earnings rate returned to normal (1x).";

        await classRef.update({
          "economySettings.doubleEarningsActive": nextDouble,
        });
      }

      await classRef.update({
        "economySettings.activeMarketEvent": eventName,
      });

      // Send Firestore Notification to Every Student in Classroom
      const notifBatch = db.batch();
      studentsSnap.docs.forEach((studentDoc) => {
        const notifRef = classRef.collection("notifications").doc();
        notifBatch.set(notifRef, {
          id: notifRef.id,
          classroomId,
          userId: studentDoc.id,
          type: "market_event",
          title: eventName,
          message: notificationMsg,
          eventType,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });
      await notifBatch.commit();

      logger.info(`Market Event triggered: ${eventType} in class ${classroomId}`);
      response.json({
        success: true,
        eventName,
        details,
        message: notificationMsg,
      });
    } catch (error: any) {
      logger.error("Trigger Market Event Error:", error);
      response.status(500).json({ error: error.message || "Failed to trigger market event." });
    }
  }
);

export const purchaseListing = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { classroomId, buyerId, listingId } = request.body || {};

      if (!classroomId || !buyerId || !listingId) {
        response.status(400).json({ error: "Missing required fields: classroomId, buyerId, listingId" });
        return;
      }

      const admin = await import("firebase-admin");
      if (!admin.apps.length) {
        admin.initializeApp();
      }
      const db = admin.firestore();

      const classRef = db.collection("classrooms").doc(classroomId);
      const listingRef = classRef.collection("listings").doc(listingId);
      const buyerRef = classRef.collection("students").doc(buyerId);

      let txId = "";
      let listingTitle = "";
      let itemPrice = 0;

      await db.runTransaction(async (transaction) => {
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists) {
          throw new Error("Classroom not found.");
        }
        const classData = classDoc.data() || {};
        const isDoubleEarnings = classData?.economySettings?.doubleEarningsActive || false;

        const listingDoc = await transaction.get(listingRef);
        if (!listingDoc.exists) {
          throw new Error("Listing not found.");
        }
        const listingData = listingDoc.data() || {};
        listingTitle = listingData.hustleName || "Listing";
        itemPrice = Number(listingData.price) || 0;
        const itemCost = Number(listingData.cost) || 0;
        const sellerId = listingData.studentId;

        if (buyerId === sellerId) {
          throw new Error("You cannot purchase your own listing!");
        }

        const buyerDoc = await transaction.get(buyerRef);
        if (!buyerDoc.exists) {
          throw new Error("Buyer profile not found.");
        }
        const buyerData = buyerDoc.data() || {};
        const buyerBalance = Number(buyerData.balance) || 0;

        if (buyerBalance < itemPrice) {
          throw new Error(`Insufficient SparkCoins balance! You need ${itemPrice} SparkCoins.`);
        }

        const sellerRef = classRef.collection("students").doc(sellerId);
        const sellerDoc = await transaction.get(sellerRef);
        if (!sellerDoc.exists) {
          throw new Error("Seller profile not found.");
        }
        const sellerData = sellerDoc.data() || {};

        const sellerEarnedAmount = isDoubleEarnings ? itemPrice * 2 : itemPrice;
        const netProfitIncrement = sellerEarnedAmount - itemCost;
        const newSalesCount = (Number(sellerData.salesCount) || 0) + 1;

        // Deduct Buyer
        transaction.update(buyerRef, {
          balance: buyerBalance - itemPrice,
          totalSpent: (Number(buyerData.totalSpent) || 0) + itemPrice,
        });

        // Credit Seller
        transaction.update(sellerRef, {
          balance: (Number(sellerData.balance) || 0) + sellerEarnedAmount,
          totalEarned: (Number(sellerData.totalEarned) || 0) + sellerEarnedAmount,
          profit: (Number(sellerData.profit) || 0) + netProfitIncrement,
          salesCount: newSalesCount,
          hustleScore: Math.min(1000, (Number(sellerData.hustleScore) || 100) + 30),
        });

        // Write Transaction Log
        const txRef = classRef.collection("transactions").doc();
        txId = txRef.id;
        transaction.set(txRef, {
          id: txId,
          buyerId,
          buyerName: buyerData.username || "Student",
          sellerId,
          sellerName: sellerData.username || sellerData.studentUsername || "Classmate",
          listingId,
          listingName: listingTitle,
          amount: itemPrice,
          status: "completed",
          createdAt: new Date().toISOString(),
        });

        // Write Notification to Seller
        const sellerNotifRef = classRef.collection("notifications").doc();
        transaction.set(sellerNotifRef, {
          id: sellerNotifRef.id,
          classroomId,
          userId: sellerId,
          type: "purchase_made",
          title: "New Sale! 💰",
          message: `${buyerData.username || 'A classmate'} bought your service "${listingTitle}" for ${itemPrice} SparkCoins!`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        // Write Notification to Teacher
        const teacherNotifRef = classRef.collection("notifications").doc();
        transaction.set(teacherNotifRef, {
          id: teacherNotifRef.id,
          classroomId,
          userId: classData.teacherId,
          type: "purchase_made",
          title: "Marketplace Activity 💸",
          message: `${buyerData.username || 'Student'} purchased "${listingTitle}" from ${sellerData.username || 'Seller'} for ${itemPrice} SparkCoins.`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });

      logger.info(`Transaction ${txId} completed: ${buyerId} bought ${listingId}`);
      response.json({
        success: true,
        message: `Successfully purchased ${listingTitle}!`,
        transactionId: txId,
      });
    } catch (error: any) {
      logger.error("Purchase Error:", error);
      response.status(500).json({ error: error.message || "Failed to complete purchase." });
    }
  }
);
