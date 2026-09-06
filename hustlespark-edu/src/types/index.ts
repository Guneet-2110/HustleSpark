export interface EconomySettings {
  loansEnabled: boolean;
  investingEnabled: boolean;
  marketEventsEnabled: boolean;
  activeMarketEvent?: string | null;
  doubleEarningsActive?: boolean;
}

export interface Classroom {
  id: string;
  teacherId: string;
  teacherName: string;
  className: string;
  currencyName: string;
  startingBalance: number;
  joinCode: string;
  createdAt: string;
  economySettings: EconomySettings;
}

export type HustleScoreTier = 'Starter' | 'Rising Hustler' | 'Pro Hustler' | 'Top Entrepreneur';

export interface Student {
  id: string;
  username: string;
  pin?: string;
  avatar: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalCostOfGoods?: number;
  profit?: number;
  hustleScore: number;
  tier?: HustleScoreTier;
  salesCount?: number;
  disputesLost?: number;
  avgRating?: number;
  reviewCount?: number;
  creativeBadge?: boolean;
  creativeBadgeTitle?: string;
  joinedAt: string;
  classroomId: string;
}

export type ListingStatus = 'draft' | 'pending' | 'approved' | 'live' | 'rejected';

export interface Listing {
  id: string;
  studentId: string;
  studentUsername?: string;
  hustleName: string;
  description: string;
  price: number;
  cost?: number;
  status: ListingStatus;
  aiGeneratedCopy?: string;
  logoUrl?: string;
  category?: string;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  classroomId: string;
  listingId: string;
  listingName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  listingId: string;
  listingName?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export type CompetitionType =
  | 'Fastest First Sale'
  | 'Most Earned'
  | 'Highest Profit Margin'
  | 'Best Customer Rating'
  | 'Most Improved'
  | 'Best Pivot';

export interface Competition {
  id: string;
  classroomId: string;
  type: CompetitionType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  prizeDescription: string;
  prizeAmount?: number;
  winnerId?: string;
  winnerName?: string;
  active: boolean;
  createdAt: string;
}

export interface Loan {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  amount: number;
  interestRate: number; // e.g. 0.10 for 10%
  totalDue: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  requestedAt: string;
  approvedAt?: string;
}

export interface NotificationDoc {
  id: string;
  classroomId: string;
  userId: string; // recipient student or teacher ID
  type:
    | 'listing_approved'
    | 'purchase_made'
    | 'review_received'
    | 'market_event'
    | 'competition_update'
    | 'loan_update'
    | 'pivot_report'
    | 'teacher_announcement'
    | 'dispute_opened';
  title: string;
  message: string;
  eventType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PivotReport {
  id: string;
  listingId: string;
  listingName: string;
  analysis: string;
  suggestions: string[];
  createdAt: string;
}
