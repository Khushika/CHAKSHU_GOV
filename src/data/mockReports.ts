import type {
  UnifiedReport,
  FraudType,
  ReportStatus,
} from "@/lib/data-constants";

export interface MockReport {
  id: string;
  date: string;
  type: string;
  description: string;
  status: string;
  impact: string;
  location: string;
  amount?: number;
  phoneNumber?: string;
  referenceId?: string;
  evidenceCount?: number;
  submittedAt?: Date;
  updatedAt?: Date;
  severity?: string;
  title?: string;
}

// Legacy interface for backward compatibility
export interface LegacyMockReport extends MockReport {}

// Helper function to generate recent dates
const getRecentDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

// Base mock reports data
const baseMockReportsData: MockReport[] = [
  {
    id: "RPT-001",
    date: getRecentDate(2),
    type: "Phishing",
    title: "Fake bank email requesting credentials",
    description:
      "Received fake SBI email asking for OTP and card details through suspicious link",
    status: "Resolved",
    impact: "High",
    location: "Mumbai, Maharashtra",
    amount: 25000,
    phoneNumber: "+91-9876543210",
    referenceId: "FR-2024-001234",
    evidenceCount: 3,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    severity: "high",
  },
  {
    id: "RPT-002",
    date: getRecentDate(5),
    type: "SMS Fraud",
    title: "Lottery scam text message",
    description:
      "Received SMS claiming lottery win and asking for processing fee payment",
    status: "Under Review",
    impact: "Medium",
    location: "Delhi, Delhi",
    amount: 5000,
    phoneNumber: "+91-8765432109",
    referenceId: "FR-2024-001235",
    evidenceCount: 2,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    severity: "medium",
  },
  {
    id: "RPT-003",
    date: getRecentDate(7),
    type: "Call Fraud",
    title: "Fake tech support call",
    description:
      "Caller claimed to be from Microsoft and asked for remote access to computer",
    status: "Resolved",
    impact: "High",
    location: "Bangalore, Karnataka",
    amount: 15000,
    phoneNumber: "+91-7654321098",
    referenceId: "FR-2024-001236",
    evidenceCount: 1,
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    severity: "high",
  },
  {
    id: "RPT-004",
    date: getRecentDate(10),
    type: "UPI Fraud",
    title: "Unauthorized UPI transaction",
    description:
      "Unknown UPI transaction of ₹50,000 debited from account without authorization",
    status: "Escalated",
    impact: "Critical",
    location: "Pune, Maharashtra",
    amount: 50000,
    phoneNumber: "+91-9988776655",
    referenceId: "FR-2024-001237",
    evidenceCount: 4,
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    severity: "critical",
  },
  {
    id: "RPT-005",
    date: getRecentDate(12),
    type: "WhatsApp Scam",
    title: "Fake family emergency request",
    description:
      "Received WhatsApp message from unknown number claiming to be nephew in emergency",
    status: "Resolved",
    impact: "Medium",
    location: "Hyderabad, Telangana",
    amount: 10000,
    phoneNumber: "+91-8877665544",
    referenceId: "FR-2024-001238",
    evidenceCount: 3,
    submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    severity: "medium",
  },
  {
    id: "RPT-006",
    date: getRecentDate(15),
    type: "Investment Fraud",
    title: "Cryptocurrency investment scam",
    description:
      "Social media ad promising 300% returns on Bitcoin investment in 30 days",
    status: "Under Review",
    impact: "Critical",
    location: "Chennai, Tamil Nadu",
    amount: 75000,
    phoneNumber: "+91-7766554433",
    referenceId: "FR-2024-001239",
    evidenceCount: 5,
    submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    severity: "critical",
  },
  {
    id: "RPT-007",
    date: getRecentDate(18),
    type: "Job Fraud",
    title: "Fake job offer requiring payment",
    description:
      "Job offer requiring ₹5,000 registration fee for data entry work from home",
    status: "Rejected",
    impact: "Low",
    location: "Kolkata, West Bengal",
    amount: 5000,
    phoneNumber: "+91-6655443322",
    referenceId: "FR-2024-001240",
    evidenceCount: 2,
    submittedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    severity: "low",
  },
  {
    id: "RPT-008",
    date: getRecentDate(22),
    type: "Email Spam",
    title: "Nigerian prince email scam",
    description:
      "Email claiming inheritance transfer requiring processing fee payment",
    status: "Resolved",
    impact: "Low",
    location: "Ahmedabad, Gujarat",
    amount: 2000,
    phoneNumber: "+91-5544332211",
    referenceId: "FR-2024-001241",
    evidenceCount: 1,
    submittedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    severity: "low",
  },
  {
    id: "RPT-009",
    date: getRecentDate(25),
    type: "Online Shopping Fraud",
    title: "Fake e-commerce website scam",
    description:
      "Ordered electronics from fake website, payment taken but no delivery",
    status: "Under Review",
    impact: "Medium",
    location: "Jaipur, Rajasthan",
    amount: 18000,
    phoneNumber: "+91-4433221100",
    referenceId: "FR-2024-001242",
    evidenceCount: 3,
    submittedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
    severity: "medium",
  },
  {
    id: "RPT-010",
    date: getRecentDate(28),
    type: "Credit Card Fraud",
    title: "Unauthorized credit card transactions",
    description:
      "Multiple unauthorized transactions on credit card at unknown merchants",
    status: "Escalated",
    impact: "High",
    location: "Indore, Madhya Pradesh",
    amount: 35000,
    phoneNumber: "+91-3322110099",
    referenceId: "FR-2024-001243",
    evidenceCount: 4,
    submittedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
    severity: "high",
  },
  {
    id: "RPT-011",
    date: getRecentDate(35),
    type: "Insurance Fraud",
    title: "Fake insurance policy sales call",
    description:
      "Cold call offering discounted life insurance with immediate premium payment",
    status: "Pending",
    impact: "Medium",
    location: "Lucknow, Uttar Pradesh",
    amount: 12000,
    phoneNumber: "+91-2211009988",
    referenceId: "FR-2024-001244",
    evidenceCount: 2,
    submittedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    severity: "medium",
  },
  {
    id: "RPT-012",
    date: getRecentDate(40),
    type: "Social Media Fraud",
    title: "Facebook marketplace scam",
    description:
      "Paid advance for furniture on Facebook Marketplace but seller disappeared",
    status: "Resolved",
    impact: "Low",
    location: "Bhopal, Madhya Pradesh",
    amount: 8000,
    phoneNumber: "+91-1100998877",
    referenceId: "FR-2024-001245",
    evidenceCount: 3,
    submittedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
    severity: "low",
  },
];

// Helper function to get reports for specific date ranges
export const getReportsByDateRange = (days: number): MockReport[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return mockReportsData.filter(
    (report) => new Date(report.date) >= cutoffDate,
  );
};

// Helper function to get reports by status
export const getReportsByStatus = (status: string): MockReport[] => {
  return mockReportsData.filter((report) => report.status === status);
};

// Helper function to get reports by type
export const getReportsByType = (type: string): MockReport[] => {
  return mockReportsData.filter((report) => report.type === type);
};

// Transform legacy mock data to unified format
export const getUnifiedMockReports = (): UnifiedReport[] => {
  return mockReportsData.map((mockReport): UnifiedReport => {
    // Map legacy fraud types to enum values
    const fraudTypeMap: Record<string, FraudType> = {
      Phishing: "phishing",
      "SMS Fraud": "sms_fraud",
      "Call Fraud": "call_fraud",
      "UPI Fraud": "other",
      "WhatsApp Scam": "other",
      "Investment Fraud": "investment_scam",
      "Job Fraud": "other",
      "Email Spam": "email_spam",
      "Online Shopping Fraud": "other",
      "Credit Card Fraud": "other",
      "Insurance Fraud": "other",
      "Social Media Fraud": "other",
    };

    // Map legacy statuses to enum values
    const statusMap: Record<string, ReportStatus> = {
      Resolved: "resolved",
      "Under Review": "under_review",
      Escalated: "pending",
      Pending: "pending",
      Rejected: "rejected",
    };

    const [city, state] = mockReport.location.split(",").map((s) => s.trim());

    return {
      id: mockReport.id,
      title: mockReport.title || `${mockReport.type} Report`,
      description: mockReport.description,
      fraud_type: fraudTypeMap[mockReport.type] || "other",
      status: statusMap[mockReport.status] || "pending",
      amount_involved: mockReport.amount,
      city: city,
      state: state,
      user_id: "demo-user",
      created_at: mockReport.submittedAt?.toISOString() || mockReport.date,
      updated_at: mockReport.updatedAt?.toISOString() || mockReport.date,
      incident_date: mockReport.date,
      contact_info: mockReport.phoneNumber
        ? { phone: mockReport.phoneNumber }
        : undefined,
    };
  });
};

// Stats helper functions with unified data
export const getReportStats = () => {
  const total = mockReportsData.length;
  const resolved = mockReportsData.filter(
    (r) => r.status === "Resolved",
  ).length;
  const pending = mockReportsData.filter((r) => r.status === "Pending").length;
  const underReview = mockReportsData.filter(
    (r) => r.status === "Under Review",
  ).length;
  const escalated = mockReportsData.filter(
    (r) => r.status === "Escalated",
  ).length;
  const rejected = mockReportsData.filter(
    (r) => r.status === "Rejected",
  ).length;

  const totalAmount = mockReportsData.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );

  return {
    total,
    resolved,
    pending,
    underReview,
    escalated,
    rejected,
    totalAmount,
    resolutionRate: Math.round((resolved / total) * 100),
  };
};

// Unified stats with correct enum values
export const getUnifiedReportStats = () => {
  const unifiedReports = getUnifiedMockReports();
  const total = unifiedReports.length;

  const stats = unifiedReports.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      acc.total_amount += report.amount_involved || 0;
      return acc;
    },
    {
      pending: 0,
      under_review: 0,
      resolved: 0,
      rejected: 0,
      withdrawn: 0,
      total_amount: 0,
    } as Record<ReportStatus | "total_amount", number>,
  );

  return {
    total,
    ...stats,
    resolutionRate: Math.round((stats.resolved / total) * 100),
  };
};
