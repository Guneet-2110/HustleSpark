import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
  collectionGroup,
  onSnapshot,
  runTransaction
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Classroom,
  Student,
  Listing,
  ListingStatus,
  Review,
  Loan,
  Competition,
  CompetitionType,
  NotificationDoc,
  HustleScoreTier,
  Transaction
} from "@/types";

export function calculateHustleScore(
  salesCount: number = 0,
  avgRating: number = 0,
  joinedAt: string = new Date().toISOString(),
  approvedListingsCount: number = 0,
  disputesLost: number = 0
): { score: number; tier: HustleScoreTier } {
  const salesPts = Math.min(300, salesCount * 30);
  const ratingPts = Math.min(200, Math.round(avgRating * 40));
  const daysActive = Math.max(1, Math.floor((Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24)));
  const daysPts = Math.min(150, daysActive * 1);
  const approvedPts = Math.min(200, approvedListingsCount * 20);
  const disputePenalty = disputesLost * 50;

  const rawScore = salesPts + ratingPts + daysPts + approvedPts - disputePenalty;
  const score = Math.max(0, Math.min(1000, rawScore));

  let tier: HustleScoreTier = "Starter";
  if (score >= 850) {
    tier = "Top Entrepreneur";
  } else if (score >= 600) {
    tier = "Pro Hustler";
  } else if (score >= 300) {
    tier = "Rising Hustler";
  }

  return { score, tier };
}

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createClassroom(
  teacherId: string,
  teacherName: string,
  className: string,
  currencyName: string = "SparkCoins",
  startingBalance: number = 100
): Promise<Classroom> {
  const classroomId = doc(collection(db, "classrooms")).id;
  const joinCode = generateJoinCode();

  const newClassroom: Classroom = {
    id: classroomId,
    teacherId,
    teacherName,
    className,
    currencyName,
    startingBalance,
    joinCode,
    createdAt: new Date().toISOString(),
    economySettings: {
      loansEnabled: true,
      investingEnabled: true,
      marketEventsEnabled: true,
      activeMarketEvent: null,
      doubleEarningsActive: false,
    },
  };

  await setDoc(doc(db, "classrooms", classroomId), newClassroom);
  return newClassroom;
}

export async function getClassroomByJoinCode(joinCode: string): Promise<Classroom | null> {
  const q = query(
    collection(db, "classrooms"),
    where("joinCode", "==", joinCode.trim().toUpperCase())
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Classroom;
}

export async function getClassroomsByTeacher(teacherId: string): Promise<Classroom[]> {
  const q = query(collection(db, "classrooms"), where("teacherId", "==", teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Classroom));
}

export async function joinClassroomAsStudent(
  classroomId: string,
  studentAuthUid: string,
  username: string,
  pin: string,
  avatar: string = "🚀",
  startingBalance: number = 100
): Promise<Student> {
  const studentRef = doc(db, "classrooms", classroomId, "students", studentAuthUid);
  const existingSnap = await getDoc(studentRef);

  if (existingSnap.exists()) {
    return { id: existingSnap.id, ...existingSnap.data(), classroomId } as Student;
  }

  const q = query(
    collection(db, "classrooms", classroomId, "students"),
    where("username", "==", username.trim())
  );
  const existingUsernames = await getDocs(q);
  if (!existingUsernames.empty) {
    throw new Error("That nickname is already taken in this class! Pick another cool nickname.");
  }

  const { score, tier } = calculateHustleScore(0, 0, new Date().toISOString(), 0, 0);

  const newStudent: Student = {
    id: studentAuthUid,
    username: username.trim(),
    pin: pin.trim(),
    avatar,
    balance: startingBalance,
    totalEarned: 0,
    totalSpent: 0,
    totalCostOfGoods: 0,
    profit: 0,
    hustleScore: score,
    tier,
    salesCount: 0,
    disputesLost: 0,
    avgRating: 0,
    reviewCount: 0,
    joinedAt: new Date().toISOString(),
    classroomId,
  };

  await setDoc(studentRef, newStudent);
  return newStudent;
}

export async function loginStudentWithPin(
  joinCode: string,
  username: string,
  pin: string
): Promise<{ student: Student; classroom: Classroom }> {
  const targetClass = await getClassroomByJoinCode(joinCode);
  if (!targetClass) {
    throw new Error("Invalid class code! Please check with your teacher.");
  }

  const q = query(
    collection(db, "classrooms", targetClass.id, "students"),
    where("username", "==", username.trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error("Student nickname not found in this class code!");
  }

  const studentDoc = snap.docs[0];
  const studentData = { id: studentDoc.id, ...studentDoc.data(), classroomId: targetClass.id } as Student;

  if (studentData.pin && studentData.pin !== pin.trim()) {
    throw new Error("Incorrect 4-digit secret PIN! Please check your PIN and try again.");
  }

  return { student: studentData, classroom: targetClass };
}

export async function getStudentsInClassroom(classroomId: string): Promise<Student[]> {
  const querySnapshot = await getDocs(collection(db, "classrooms", classroomId, "students"));
  return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data(), classroomId } as Student));
}

export async function createListing(
  classroomId: string,
  studentId: string,
  studentUsername: string,
  hustleName: string,
  description: string,
  price: number,
  aiGeneratedCopy?: string,
  logoUrl?: string,
  category: string = "Services",
  cost: number = 0
): Promise<Listing> {
  const studentRef = doc(db, "classrooms", classroomId, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (cost > 0 && studentSnap.exists()) {
    const sData = studentSnap.data() as Student;
    if (sData.balance < cost) {
      throw new Error(`Insufficient SparkCoins to cover upfront material/tool cost of ⚡ ${cost}!`);
    }
    // Deduct cost of goods upfront
    await updateDoc(studentRef, {
      balance: sData.balance - cost,
      totalCostOfGoods: (sData.totalCostOfGoods || 0) + cost,
      profit: (sData.profit || 0) - cost,
    });
  }

  const listingRef = doc(collection(db, "classrooms", classroomId, "listings"));
  const newListing: Listing = {
    id: listingRef.id,
    studentId,
    studentUsername,
    hustleName,
    description,
    price,
    cost,
    status: "pending",
    aiGeneratedCopy: aiGeneratedCopy || "",
    logoUrl: logoUrl || "",
    category,
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(listingRef, newListing);

  // Notify Teacher of new submission
  const classSnap = await getDoc(doc(db, "classrooms", classroomId));
  if (classSnap.exists()) {
    const classData = classSnap.data() as Classroom;
    await sendNotification(
      classroomId,
      classData.teacherId,
      "listing_approved",
      "New Listing Submitted 📋",
      `${studentUsername} submitted a new hustle "${hustleName}" for your review.`
    );
  }

  return newListing;
}

export async function getClassroomListings(
  classroomId: string,
  statusFilter?: ListingStatus
): Promise<Listing[]> {
  let q = query(collection(db, "classrooms", classroomId, "listings"));
  if (statusFilter) {
    q = query(collection(db, "classrooms", classroomId, "listings"), where("status", "==", statusFilter));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Listing));
}

export async function updateListingStatus(
  classroomId: string,
  listingId: string,
  status: ListingStatus
): Promise<void> {
  const listingRef = doc(db, "classrooms", classroomId, "listings", listingId);
  const snap = await getDoc(listingRef);
  if (!snap.exists()) return;
  const listing = snap.data() as Listing;

  await updateDoc(listingRef, { status });

  if (status === "approved" || status === "live") {
    // Recalculate student hustle score
    const studentRef = doc(db, "classrooms", classroomId, "students", listing.studentId);
    const sSnap = await getDoc(studentRef);
    if (sSnap.exists()) {
      const sData = sSnap.data() as Student;
      const listings = await getClassroomListings(classroomId);
      const approvedCount = listings.filter((l) => l.studentId === listing.studentId && (l.status === "approved" || l.status === "live")).length;
      const { score, tier } = calculateHustleScore(sData.salesCount || 0, sData.avgRating || 0, sData.joinedAt, approvedCount, sData.disputesLost || 0);

      await updateDoc(studentRef, { hustleScore: score, tier });
    }

    // Notify Student
    await sendNotification(
      classroomId,
      listing.studentId,
      "listing_approved",
      "Hustle Approved! 🎉",
      `Your service "${listing.hustleName}" was approved by your teacher and is now live!`
    );
  }
}

export async function removeListingByTeacher(
  classroomId: string,
  listingId: string,
  reason?: string
): Promise<void> {
  const listingRef = doc(db, "classrooms", classroomId, "listings", listingId);
  const snap = await getDoc(listingRef);
  if (!snap.exists()) return;
  const listing = snap.data() as Listing;

  // Delete document
  await deleteDoc(listingRef);

  // Send notification to student
  const reasonText = reason && reason.trim() ? ` Reason: ${reason.trim()}` : "";
  await sendNotification(
    classroomId,
    listing.studentId,
    "teacher_announcement",
    "Hustle Listing Removed ⚠️",
    `Your listing "${listing.hustleName}" was removed from the marketplace by your teacher.${reasonText}`
  );
}

// REVIEWS SYSTEM
export async function createReview(
  classroomId: string,
  listingId: string,
  sellerId: string,
  buyerId: string,
  buyerName: string,
  rating: number,
  comment: string
): Promise<Review> {
  const listingRef = doc(db, "classrooms", classroomId, "listings", listingId);
  const listingSnap = await getDoc(listingRef);
  if (!listingSnap.exists()) throw new Error("Listing not found.");
  const listingData = listingSnap.data() as Listing;

  const reviewRef = doc(collection(db, "classrooms", classroomId, "listings", listingId, "reviews"));
  const newReview: Review = {
    id: reviewRef.id,
    classroomId,
    listingId,
    listingName: listingData.hustleName,
    sellerId,
    buyerId,
    buyerName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  await setDoc(reviewRef, newReview);

  // Recalculate average rating for listing
  const reviewsSnap = await getDocs(collection(db, "classrooms", classroomId, "listings", listingId, "reviews"));
  const reviews = reviewsSnap.docs.map((d) => d.data() as Review);
  const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = Number((totalRating / reviews.length).toFixed(1));

  await updateDoc(listingRef, { avgRating, reviewCount: reviews.length });

  // Recalculate seller overall rating & Hustle Score
  const sellerRef = doc(db, "classrooms", classroomId, "students", sellerId);
  const sellerSnap = await getDoc(sellerRef);
  if (sellerSnap.exists()) {
    const sData = sellerSnap.data() as Student;
    const allListings = await getClassroomListings(classroomId);
    const sellerListings = allListings.filter((l) => l.studentId === sellerId);
    let totalSellerRating = 0;
    let totalSellerReviews = 0;
    sellerListings.forEach((l) => {
      if (l.reviewCount && l.avgRating) {
        totalSellerRating += l.avgRating * l.reviewCount;
        totalSellerReviews += l.reviewCount;
      }
    });
    const sellerAvgRating = totalSellerReviews > 0 ? Number((totalSellerRating / totalSellerReviews).toFixed(1)) : rating;

    const approvedCount = sellerListings.filter((l) => l.status === "approved" || l.status === "live").length;
    const { score, tier } = calculateHustleScore(sData.salesCount || 0, sellerAvgRating, sData.joinedAt, approvedCount, sData.disputesLost || 0);

    await updateDoc(sellerRef, {
      avgRating: sellerAvgRating,
      reviewCount: totalSellerReviews,
      hustleScore: score,
      tier,
    });
  }

  // Notify seller
  await sendNotification(
    classroomId,
    sellerId,
    "review_received",
    "New Review Received! ⭐",
    `${buyerName} left a ${rating}-star review on "${listingData.hustleName}": "${comment}"`
  );

  return newReview;
}

export async function getListingReviews(classroomId: string, listingId: string): Promise<Review[]> {
  const snap = await getDocs(collection(db, "classrooms", classroomId, "listings", listingId, "reviews"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function getClassroomReviews(classroomId: string): Promise<Review[]> {
  try {
    const snap = await getDocs(collectionGroup(db, "reviews"));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Review))
      .filter((r) => r.classroomId === classroomId);
  } catch (err) {
    console.warn("Collection group query for reviews failed or requires index, returning empty array:", err);
    return [];
  }
}

// LOANS SYSTEM
export async function requestLoan(
  classroomId: string,
  studentId: string,
  studentName: string,
  amount: number
): Promise<Loan> {
  if (amount > 100) {
    throw new Error("Maximum loan request amount is 100 SparkCoins!");
  }

  const loanRef = doc(collection(db, "classrooms", classroomId, "loans"));
  const newLoan: Loan = {
    id: loanRef.id,
    classroomId,
    studentId,
    studentName,
    amount,
    interestRate: 0.10, // 10%
    totalDue: Math.round(amount * 1.10),
    status: "pending",
    requestedAt: new Date().toISOString(),
  };

  await setDoc(loanRef, newLoan);

  // Notify Teacher
  const classSnap = await getDoc(doc(db, "classrooms", classroomId));
  if (classSnap.exists()) {
    const classData = classSnap.data() as Classroom;
    await sendNotification(
      classroomId,
      classData.teacherId,
      "loan_update",
      "Loan Requested 🏦",
      `${studentName} requested a loan of ${amount} SparkCoins.`
    );
  }

  return newLoan;
}

export async function getClassroomLoans(classroomId: string): Promise<Loan[]> {
  const snap = await getDocs(collection(db, "classrooms", classroomId, "loans"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Loan));
}

export async function approveLoan(classroomId: string, loanId: string): Promise<void> {
  const loanRef = doc(db, "classrooms", classroomId, "loans", loanId);
  const loanSnap = await getDoc(loanRef);
  if (!loanSnap.exists()) return;
  const loan = loanSnap.data() as Loan;

  const studentRef = doc(db, "classrooms", classroomId, "students", loan.studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    const sData = studentSnap.data() as Student;
    await updateDoc(studentRef, {
      balance: (sData.balance || 0) + loan.amount,
    });
  }

  await updateDoc(loanRef, { status: "approved", approvedAt: new Date().toISOString() });

  await sendNotification(
    classroomId,
    loan.studentId,
    "loan_update",
    "Loan Approved! 🏦",
    `Your loan request for ${loan.amount} SparkCoins was approved! Total due later: ${loan.totalDue} SparkCoins.`
  );
}

export async function rejectLoan(classroomId: string, loanId: string): Promise<void> {
  const loanRef = doc(db, "classrooms", classroomId, "loans", loanId);
  const loanSnap = await getDoc(loanRef);
  if (!loanSnap.exists()) return;
  const loan = loanSnap.data() as Loan;

  await updateDoc(loanRef, { status: "rejected" });

  await sendNotification(
    classroomId,
    loan.studentId,
    "loan_update",
    "Loan Request Update 🏦",
    `Your loan request for ${loan.amount} SparkCoins was not approved by your teacher.`
  );
}

export async function repayLoan(classroomId: string, loanId: string): Promise<void> {
  const loanRef = doc(db, "classrooms", classroomId, "loans", loanId);
  const loanSnap = await getDoc(loanRef);
  if (!loanSnap.exists()) return;
  const loan = loanSnap.data() as Loan;

  const studentRef = doc(db, "classrooms", classroomId, "students", loan.studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    const sData = studentSnap.data() as Student;
    if (sData.balance < loan.totalDue) {
      throw new Error(`Insufficient balance! You need ⚡ ${loan.totalDue} SparkCoins to repay this loan.`);
    }
    await updateDoc(studentRef, {
      balance: sData.balance - loan.totalDue,
    });
  }

  await updateDoc(loanRef, { status: "repaid" });
}

// COMPETITIONS SYSTEM
export async function createCompetition(
  classroomId: string,
  type: CompetitionType,
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  prizeDescription: string
): Promise<Competition> {
  const compRef = doc(collection(db, "classrooms", classroomId, "competitions"));
  const newComp: Competition = {
    id: compRef.id,
    classroomId,
    type,
    title,
    description,
    startDate,
    endDate,
    prizeDescription,
    active: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(compRef, newComp);

  // Notify all students in class
  const students = await getStudentsInClassroom(classroomId);
  for (const s of students) {
    await sendNotification(
      classroomId,
      s.id,
      "competition_update",
      `New Competition: ${title}! 🏆`,
      `Teacher launched a new challenge! Prize: ${prizeDescription}. Compete now!`
    );
  }

  return newComp;
}

export async function getClassroomCompetitions(classroomId: string): Promise<Competition[]> {
  const snap = await getDocs(collection(db, "classrooms", classroomId, "competitions"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Competition));
}

// ECONOMY RESET SYSTEM
export async function resetClassroomEconomy(classroomId: string): Promise<void> {
  const classRef = doc(db, "classrooms", classroomId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) return;
  const classData = classSnap.data() as Classroom;

  const studentsSnap = await getDocs(collection(db, "classrooms", classroomId, "students"));
  for (const sDoc of studentsSnap.docs) {
    await updateDoc(doc(db, "classrooms", classroomId, "students", sDoc.id), {
      balance: classData.startingBalance || 100,
      totalEarned: 0,
      totalSpent: 0,
      totalCostOfGoods: 0,
      profit: 0,
      salesCount: 0,
    });
  }
}

// NOTIFICATION SYSTEM
export async function sendNotification(
  classroomId: string,
  userId: string,
  type: NotificationDoc['type'],
  title: string,
  message: string
): Promise<void> {
  const notifRef = doc(collection(db, "classrooms", classroomId, "notifications"));
  const newNotif: NotificationDoc = {
    id: notifRef.id,
    classroomId,
    userId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  await setDoc(notifRef, newNotif);
}

export function subscribeToNotifications(
  classroomId: string,
  userId: string,
  callback: (notifications: NotificationDoc[]) => void
) {
  const q = query(
    collection(db, "classrooms", classroomId, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc));
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(notifs);
  });
}

export async function markNotificationAsRead(classroomId: string, notificationId: string): Promise<void> {
  const notifRef = doc(db, "classrooms", classroomId, "notifications", notificationId);
  await updateDoc(notifRef, { isRead: true });
}

export async function getClassroomTransactions(classroomId: string): Promise<Transaction[]> {
  const snap = await getDocs(collection(db, "classrooms", classroomId, "transactions"));
  const txs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return txs;
}

export async function triggerMarketEventInClassroom(
  classroomId: string,
  eventType: "inflation" | "recession" | "taxday" | "bonuspayday" | "doubleearnings"
): Promise<{ success: boolean; eventName: string; details: string }> {
  const studentsSnap = await getDocs(collection(db, "classrooms", classroomId, "students"));
  const listingsSnap = await getDocs(collection(db, "classrooms", classroomId, "listings"));
  const classRef = doc(db, "classrooms", classroomId);
  const classSnap = await getDoc(classRef);
  const classData = classSnap.data() as Classroom;

  let eventName = "";
  let details = "";
  let studentNotificationMessage = "";

  if (eventType === "inflation") {
    eventName = "Inflation Week 📈";
    details = "Listing prices increased by 20% across the classroom marketplace!";
    studentNotificationMessage = "📈 Inflation Week! All marketplace item prices went up by 20%.";
    for (const listingDoc of listingsSnap.docs) {
      const data = listingDoc.data() as Listing;
      const newPrice = Math.max(1, Math.round(data.price * 1.2));
      await updateDoc(doc(db, "classrooms", classroomId, "listings", listingDoc.id), { price: newPrice });
    }
  } else if (eventType === "recession") {
    eventName = "Recession Hit 📉";
    details = "All student balances adjusted by -10% due to economic slowdown.";
    studentNotificationMessage = "📉 Recession Hit! Your balance went down by 10%.";
    for (const studentDoc of studentsSnap.docs) {
      const data = studentDoc.data() as Student;
      const newBalance = Math.max(0, Math.round(data.balance * 0.9));
      await updateDoc(doc(db, "classrooms", classroomId, "students", studentDoc.id), { balance: newBalance });
    }
  } else if (eventType === "taxday") {
    eventName = "Classroom Tax Day 🏛️";
    details = "Collected 10% tax from all active student balances.";
    studentNotificationMessage = "🏛️ Tax Day! Your teacher collected 10% tax from all balances.";
    for (const studentDoc of studentsSnap.docs) {
      const data = studentDoc.data() as Student;
      const newBalance = Math.max(0, Math.round(data.balance * 0.9));
      await updateDoc(doc(db, "classrooms", classroomId, "students", studentDoc.id), { balance: newBalance });
    }
  } else if (eventType === "bonuspayday") {
    eventName = "Bonus Payday! 🎉";
    details = "Awarded +50 extra SparkCoins to every student in class!";
    studentNotificationMessage = "🎉 Bonus Payday! Your teacher gave everyone 50 extra SparkCoins!";
    for (const studentDoc of studentsSnap.docs) {
      const data = studentDoc.data() as Student;
      const newBalance = (data.balance || 0) + 50;
      const newEarned = (data.totalEarned || 0) + 50;
      await updateDoc(doc(db, "classrooms", classroomId, "students", studentDoc.id), {
        balance: newBalance,
        totalEarned: newEarned,
      });
    }
  } else if (eventType === "doubleearnings") {
    const isDoubleCurrently = classData.economySettings?.doubleEarningsActive || false;
    const nextDouble = !isDoubleCurrently;
    eventName = nextDouble ? "Double Earnings Week! ⚡⚡" : "Normal Earnings Resumed";
    details = nextDouble ? "Sellers now earn DOUBLE SparkCoins on every sale!" : "Earnings returned to 1x.";
    studentNotificationMessage = nextDouble
      ? "⚡⚡ Double Earnings Week! You now earn 2x SparkCoins on every sale you make!"
      : "Earnings rate returned to normal (1x).";

    await updateDoc(classRef, {
      "economySettings.doubleEarningsActive": nextDouble,
    });
  }

  await updateDoc(classRef, {
    "economySettings.activeMarketEvent": eventName,
  });

  // Create Firestore Notification Document for Every Student in Classroom
  for (const studentDoc of studentsSnap.docs) {
    await sendNotification(classroomId, studentDoc.id, "market_event", eventName, studentNotificationMessage);
  }

  return { success: true, eventName, details };
}

export async function assignCreativeBadge(
  classroomId: string,
  studentId: string,
  badgeTitle: string = "Most Creative Hustle 🎨"
): Promise<void> {
  const studentRef = doc(db, "classrooms", classroomId, "students", studentId);
  await updateDoc(studentRef, {
    creativeBadge: true,
    creativeBadgeTitle: badgeTitle,
  });

  await sendNotification(
    classroomId,
    studentId,
    "teacher_announcement",
    "Award Received! 🎨",
    `Congratulations! Your teacher awarded you the "${badgeTitle}" badge!`
  );
}
