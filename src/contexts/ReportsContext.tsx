import React, { createContext, useContext, useState, useEffect } from "react";
import { mockReportsData, MockReport } from "@/data/mockReports";
import { useAuth } from "./AuthContext";

interface NewReportData {
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

interface ReportsContextType {
  reports: MockReport[];
  addReport: (reportData: NewReportData) => string; // Returns reference ID
  updateReport: (id: string, updates: Partial<MockReport>) => void;
  getUserReports: () => MockReport[];
  refreshReports: () => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};

interface ReportsProviderProps {
  children: React.ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MockReport[]>([]);

  // Initialize reports from localStorage and mock data
  useEffect(() => {
    const storedReports = localStorage.getItem("user-reports");
    let userReports: MockReport[] = [];

    if (storedReports) {
      try {
        userReports = JSON.parse(storedReports);
      } catch (error) {
        console.error("Failed to parse stored reports:", error);
        userReports = [];
      }
    }

    // Combine user reports with mock data
    const allReports = [...userReports, ...mockReportsData];
    setReports(allReports);
  }, []);

  // Save user reports to localStorage whenever reports change
  useEffect(() => {
    if (reports.length > 0) {
      // Filter out mock reports (they don't have user-generated IDs)
      const userReports = reports.filter(
        (report) =>
          report.id.startsWith("USER-") ||
          (report.referenceId?.startsWith("FR-2024-") &&
            !mockReportsData.find((mock) => mock.id === report.id)),
      );
      localStorage.setItem("user-reports", JSON.stringify(userReports));
    }
  }, [reports]);

  const addReport = (reportData: NewReportData): string => {
    if (!user) {
      throw new Error("User must be logged in to submit a report");
    }

    const referenceId = `FR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const reportId = `USER-${Date.now()}`;

    const newReport: MockReport = {
      id: reportId,
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

    setReports((prevReports) => [newReport, ...prevReports]);
    return referenceId;
  };

  const updateReport = (id: string, updates: Partial<MockReport>) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id
          ? { ...report, ...updates, updatedAt: new Date() }
          : report,
      ),
    );
  };

  const getUserReports = (): MockReport[] => {
    if (!user) return [];

    // For demo purposes, return all reports
    // In a real app, this would filter by user ID
    return reports;
  };

  const refreshReports = () => {
    // Force a re-render and potentially refetch data
    const storedReports = localStorage.getItem("user-reports");
    let userReports: MockReport[] = [];

    if (storedReports) {
      try {
        userReports = JSON.parse(storedReports);
      } catch (error) {
        console.error("Failed to parse stored reports:", error);
        userReports = [];
      }
    }

    const allReports = [...userReports, ...mockReportsData];
    setReports(allReports);
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        addReport,
        updateReport,
        getUserReports,
        refreshReports,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};
