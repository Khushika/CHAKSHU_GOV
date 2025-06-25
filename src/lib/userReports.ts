import { MockReport } from "@/data/mockReports";

export interface NewReportData {
  fraudType: string;
  category: string;
  phoneNumber: string;
  messageContent: string;
  dateTime: Date | null;
  files: File[];
  amount?: number;
  location?: string;
  additionalDetails?: string;
}

// Helper function to get user reports from localStorage
export const getUserReports = (): MockReport[] => {
  try {
    const storedReports = localStorage.getItem("user-fraud-reports");
    if (storedReports) {
      const reports = JSON.parse(storedReports);
      // Convert date strings back to Date objects
      return reports.map((report: any) => ({
        ...report,
        submittedAt: report.submittedAt
          ? new Date(report.submittedAt)
          : new Date(report.date),
        updatedAt: report.updatedAt
          ? new Date(report.updatedAt)
          : new Date(report.date),
      }));
    }
  } catch (error) {
    console.error("Failed to parse user reports:", error);
  }
  return [];
};

// Helper function to save a new user report
export const addUserReport = (reportData: NewReportData): string => {
  const referenceId = `FR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const newReport: MockReport = {
    id: `USER-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type: reportData.fraudType,
    title: `${reportData.fraudType} - ${reportData.category}`,
    description: reportData.messageContent,
    status: "Pending",
    impact:
      reportData.amount && reportData.amount > 50000
        ? "Critical"
        : reportData.amount && reportData.amount > 10000
          ? "High"
          : "Medium",
    location: reportData.location || "Location not specified",
    amount: reportData.amount,
    phoneNumber: reportData.phoneNumber,
    referenceId,
    evidenceCount: reportData.files.length,
    submittedAt: new Date(),
    updatedAt: new Date(),
    severity:
      reportData.amount && reportData.amount > 50000
        ? "critical"
        : reportData.amount && reportData.amount > 10000
          ? "high"
          : "medium",
  };

  const existingReports = getUserReports();
  const updatedReports = [newReport, ...existingReports];

  try {
    localStorage.setItem("user-fraud-reports", JSON.stringify(updatedReports));
  } catch (error) {
    console.error("Failed to save user report:", error);
  }

  return referenceId;
};

// Helper function to update a user report
export const updateUserReport = (
  id: string,
  updates: Partial<MockReport>,
): boolean => {
  try {
    const existingReports = getUserReports();
    const updatedReports = existingReports.map((report) =>
      report.id === id
        ? { ...report, ...updates, updatedAt: new Date() }
        : report,
    );

    localStorage.setItem("user-fraud-reports", JSON.stringify(updatedReports));
    return true;
  } catch (error) {
    console.error("Failed to update user report:", error);
    return false;
  }
};

// Helper function to get all reports (mock + user) - to be used by components
export const getAllReportsWithUser = (
  mockReports: MockReport[],
): MockReport[] => {
  const userReports = getUserReports();
  return [...userReports, ...mockReports];
};
