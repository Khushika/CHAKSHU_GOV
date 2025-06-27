import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TypeSelectionStep from "./form-steps/TypeSelectionStep";
import CategorySelectionStep from "./form-steps/CategorySelectionStep";
import DetailsFormStep from "./form-steps/DetailsFormStep";
import DatabaseStatus from "@/components/common/DatabaseStatus";
import QuickFixAlert from "@/components/common/QuickFixAlert";
import DatabaseDiagnostics from "@/components/common/DatabaseDiagnostics";
import SavedReportsVerification from "@/components/common/SavedReportsVerification";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import useFormValidation, {
  enhancedValidations,
} from "@/hooks/useFormValidation";
import { reportsService, evidenceService } from "@/services/database";
import { supabase } from "@/integrations/supabase/client";
import type { ReportInsert } from "@/services/database";

interface FormData {
  fraudType: string;
  category: string;
  phoneNumber: string;
  messageContent: string;
  dateTime: Date | null;
  files: File[];
  amount?: number;
  location?: string;
  additionalDetails?: string;
  title?: string;
  city?: string;
  state?: string;
}

const FraudReportingForm = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasDatabaseError, setHasDatabaseError] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    fraudType: "",
    category: "",
    phoneNumber: "",
    messageContent: "",
    dateTime: null,
    files: [],
    amount: undefined,
    location: "",
    additionalDetails: "",
    title: "",
    city: "",
    state: "",
  });

  // Form validation schema
  const validationSchema = {
    fraudType: enhancedValidations.fraudType,
    category: enhancedValidations.required,
    phoneNumber: enhancedValidations.phone,
    messageContent: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      custom: (value: string) => {
        if (!value || value.trim() === "")
          return "Please describe what happened";
        if (value.trim().length < 10)
          return "Description must be at least 10 characters long";
        return null;
      },
    },
    dateTime: enhancedValidations.date,
    amount: {
      custom: (value: number | undefined) => {
        if (value !== undefined && value !== null && value !== 0) {
          if (isNaN(value)) return "Please enter a valid amount";
          if (value < 0) return "Amount cannot be negative";
          if (value > 10000000) return "Amount cannot exceed ₹1,00,00,000";
        }
        return null;
      },
    },
  };

  const {
    errors,
    validateField,
    validateForm,
    clearError,
    hasError,
    setError,
  } = useFormValidation(validationSchema);

  // Simple getError function using errors object directly
  const getError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when field is updated
    if (hasError(field)) {
      clearError(field);
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }

    // Clear database error flag when user makes changes
    if (hasDatabaseError) {
      setHasDatabaseError(false);
    }
  };

  // Validate current step before allowing progression
  const validateCurrentStep = (): boolean => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1:
        if (!formData.fraudType) {
          newErrors.fraudType = "Please select a fraud type";
          isValid = false;
        }
        break;
      case 2:
        if (!formData.category) {
          newErrors.category = "Please select a category";
          isValid = false;
        }
        break;
      case 3:
        // Validate all required fields for step 3
        const phoneError = validateField("phoneNumber", formData.phoneNumber);
        if (phoneError) {
          newErrors.phoneNumber = phoneError;
          isValid = false;
        }

        const messageError = validateField(
          "messageContent",
          formData.messageContent,
        );
        if (messageError) {
          newErrors.messageContent = messageError;
          isValid = false;
        }

        const dateError = validateField("dateTime", formData.dateTime);
        if (dateError) {
          newErrors.dateTime = dateError;
          isValid = false;
        }

        // Optional amount validation
        if (formData.amount !== undefined) {
          const amountError = validateField("amount", formData.amount);
          if (amountError) {
            newErrors.amount = amountError;
            isValid = false;
          }
        }
        break;
    }

    if (!isValid) {
      // Set each error individually using setError
      Object.entries(newErrors).forEach(([field, error]) => {
        setError(field, error);
      });
    }

    return isValid;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const isStepValid = validateCurrentStep();

    if (!isStepValid) {
      let errorMessage = "";
      switch (currentStep) {
        case 1:
          errorMessage = "Please select a fraud type to continue.";
          break;
        case 2:
          errorMessage = "Please select a category to continue.";
          break;
        case 3:
          errorMessage = "Please fill in all required fields correctly.";
          break;
      }

      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      setSubmitError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setSubmitError(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fraudType !== "";
      case 2:
        return formData.category !== "";
      case 3:
        return (
          formData.phoneNumber !== "" &&
          formData.messageContent !== "" &&
          formData.dateTime !== null &&
          formData.messageContent.trim().length >= 10
        );
      default:
        return false;
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description:
          "Please sign in to save your report as a draft and track its progress.",
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage as backup
      localStorage.setItem(
        "fraud-report-draft",
        JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString(),
        }),
      );

      toast({
        title: "Draft Saved Successfully",
        description:
          "Your fraud report has been saved as a draft. You can continue later.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description:
          "Please sign in to submit your fraud report. Create an account to track your report status and receive updates.",
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setHasDatabaseError(false);

    try {
      // Verify user is still authenticated
      if (!user?.id) {
        throw new Error("User authentication expired. Please log in again.");
      }

      console.log("Starting report submission for user:", user.id);

      // Quick database health check before submission
      console.log("Checking database connectivity...");
      try {
        const healthCheck = await supabase
          .from("fraud_reports")
          .select("id")
          .limit(1);
        if (
          healthCheck.error &&
          !healthCheck.error.message?.includes("permission")
        ) {
          console.error("Database connectivity issue:", healthCheck.error);
          throw new Error(
            "Database connection failed. Please check your internet connection and try again.",
          );
        }
        console.log("✅ Database is accessible");
      } catch (healthError) {
        console.error("Database health check failed:", healthError);
        if (healthError instanceof Error) {
          throw healthError;
        }
        throw new Error("Database connectivity check failed");
      }

      // Skip user table operations entirely and proceed with report creation
      console.log(
        "Proceeding with report creation using authenticated user:",
        user.id,
      );
      // This avoids RLS policy issues while still allowing report creation

      // Validate form data before proceeding
      if (!formData.fraudType) {
        throw new Error("Please select a fraud type");
      }
      if (!formData.category) {
        throw new Error("Please select a fraud category");
      }
      if (!formData.phoneNumber) {
        throw new Error("Please enter a phone number");
      }
      if (
        !formData.messageContent ||
        formData.messageContent.trim().length < 10
      ) {
        throw new Error(
          "Please provide a detailed description (at least 10 characters)",
        );
      }
      if (
        !formData.dateTime ||
        !(formData.dateTime instanceof Date) ||
        isNaN(formData.dateTime.getTime())
      ) {
        console.log(
          "Date validation failed. Current dateTime value:",
          formData.dateTime,
        );
        throw new Error("Please select the incident date");
      }

      // First validate the current step
      const isStepValid = validateCurrentStep();
      if (!isStepValid) {
        setSubmitError(
          "Please correct the highlighted errors before submitting.",
        );
        toast({
          title: "Validation Failed",
          description: "Please check the form for errors and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Then validate the entire form
      const isFormValid = validateForm(formData);

      if (!isFormValid) {
        // Create specific error message based on which fields are invalid
        const errorFields = Object.keys(errors);
        let errorMessage = "Please correct the following errors: ";

        if (errorFields.includes("phoneNumber")) {
          errorMessage += "invalid phone number, ";
        }
        if (errorFields.includes("messageContent")) {
          errorMessage += "description too short or missing, ";
        }
        if (errorFields.includes("dateTime")) {
          errorMessage += "invalid date, ";
        }
        if (errorFields.includes("fraudType")) {
          errorMessage += "fraud type not selected, ";
        }
        if (errorFields.includes("category")) {
          errorMessage += "category not selected, ";
        }

        // Remove trailing comma and space
        errorMessage = errorMessage.replace(/, $/, "");

        setSubmitError(errorMessage);
        toast({
          title: "Validation Failed",
          description: "Please check the highlighted fields and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Map fraud type to report type
      const getReportType = (fraudType: string): string => {
        const typeMap: Record<string, string> = {
          phone_call: "call",
          sms_fraud: "sms",
          email_phishing: "email",
          online_fraud: "other",
          financial_fraud: "other",
          identity_theft: "other",
          job_fraud: "other",
          other: "other",
        };
        return typeMap[fraudType] || "other";
      };

      // Map category to fraud_category
      const getFraudCategory = (category: string): string => {
        const categoryMap: Record<string, string> = {
          // Phone call categories
          fake_bank_call: "financial_fraud",
          tech_support_scam: "tech_support_scam",
          prize_scam: "lottery_scam",
          survey_scam: "other",

          // SMS fraud categories
          otp_theft: "financial_fraud",
          fake_delivery: "other",
          prize_sms: "lottery_scam",
          malicious_links: "other",

          // Email phishing categories
          account_verification: "impersonation",
          invoice_scam: "financial_fraud",
          fake_offers: "other",
          malware_email: "other",

          // Online fraud categories
          fake_shopping: "other",
          dating_scam: "romance_scam",
          social_media_fraud: "other",
          fake_services: "other",

          // Financial fraud categories
          upi_fraud: "financial_fraud",
          credit_card_fraud: "financial_fraud",
          investment_scam: "investment_fraud",
          loan_scam: "financial_fraud",

          // Identity theft categories
          document_theft: "impersonation",
          fake_profiles: "impersonation",
          kyc_fraud: "impersonation",

          // Job fraud categories
          fake_job_offer: "job_fraud",
          work_from_home: "job_fraud",
          fee_based_jobs: "job_fraud",

          // Other categories
          matrimonial_fraud: "other",
          rental_scam: "other",
          charity_scam: "other",
          general_fraud: "other",
        };
        return categoryMap[category] || "other";
      };

      // Map form data to database schema
      const reportData: ReportInsert = {
        user_id: user.id,
        report_type: getReportType(formData.fraudType),
        fraudulent_number: formData.phoneNumber,
        incident_date:
          formData.dateTime?.toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
        incident_time: formData.dateTime?.toTimeString().split(" ")[0] || null,
        description: formData.messageContent,
        fraud_category: getFraudCategory(formData.category),
        evidence_urls: [],
        status: "pending",
        priority: "medium",
      };

      // Save to localStorage as backup before database submission
      const backupData = {
        ...reportData,
        submittedAt: new Date().toISOString(),
        formData: formData,
      };
      localStorage.setItem(
        `fraud-report-backup-${Date.now()}`,
        JSON.stringify(backupData),
      );
      console.log("Report data backed up to localStorage");

      // Submit report to database
      console.log("Submitting report with data:", reportData);
      const reportResult = await reportsService.create(reportData);
      console.log("Report submission result:", reportResult);

      if (!reportResult.success || !reportResult.data) {
        console.error("Report creation failed:", reportResult.error);

        // Check for infinite recursion error specifically
        if (
          reportResult.error?.includes("infinite recursion") ||
          reportResult.error?.includes("Database configuration")
        ) {
          setSubmitError(
            "Database configuration error detected. Please see the instructions below to fix this issue.",
          );
          setHasDatabaseError(true);
          throw new Error("database_config_error");
        }

        // Throw the actual error message for better debugging
        throw new Error(reportResult.error || "Failed to create report");
      }
      const createdReport = reportResult.data;

      // Upload evidence files if any
      if (formData.files.length > 0) {
        const uploadPromises = formData.files.map((file) =>
          evidenceService.uploadFile(file, createdReport.id, user.id),
        );

        await Promise.allSettled(uploadPromises);
      }

      // Verify the report was actually saved by fetching it back
      console.log("Verifying report was saved to database...");
      const verificationResult = await reportsService.getById(createdReport.id);

      if (verificationResult.success && verificationResult.data) {
        console.log(
          "✅ Report successfully saved to database:",
          verificationResult.data,
        );
        setSubmitSuccess(true);

        toast({
          title: "Report Submitted Successfully! ✅",
          description: `Your fraud report has been saved to the database with ID: ${createdReport.id}`,
        });
      } else {
        console.error(
          "❌ Report creation succeeded but verification failed:",
          verificationResult.error,
        );
        setSubmitSuccess(true); // Still show success since creation worked

        toast({
          title: "Report Submitted (Verification Warning)",
          description: `Report created with ID: ${createdReport.id}, but verification failed. The report should still be saved.`,
          variant: "destructive",
        });
      }

      // Clear form and draft
      setFormData({
        fraudType: "",
        category: "",
        phoneNumber: "",
        messageContent: "",
        dateTime: null,
        files: [],
        amount: undefined,
        location: "",
        additionalDetails: "",
        title: "",
        city: "",
        state: "",
      });
      localStorage.removeItem("fraud-report-draft");
      setCurrentStep(1);
    } catch (error) {
      // Log the full error for debugging
      console.error("Report submission error:", error);

      // Handle database configuration errors specifically
      if (error instanceof Error && error.message === "database_config_error") {
        setHasDatabaseError(true);
        toast({
          title: "Database Configuration Error",
          description:
            "Please apply the database migration to fix this issue. Instructions are shown below.",
          variant: "destructive",
        });
      } else {
        // Provide more specific error message based on the error
        let errorMessage =
          "An unexpected error occurred while submitting your report.";
        let errorDetails = "Please try again or contact support.";

        if (error instanceof Error) {
          console.error("Error details:", error.message, error.stack);

          // Check for specific error types
          if (
            error.message.includes("infinite recursion") ||
            error.message.includes("Database configuration")
          ) {
            setHasDatabaseError(true);
            errorMessage = "Database configuration error detected.";
            errorDetails =
              "Please see the instructions below to fix this issue.";
          } else if (
            error.message.includes("foreign key constraint") ||
            error.message.includes("user_id_fkey")
          ) {
            errorMessage = "User account verification failed.";
            errorDetails = "Please log out and log back in, then try again.";
          } else if (
            error.message.includes("Network") ||
            error.message.includes("fetch")
          ) {
            errorMessage = "Network connection error.";
            errorDetails =
              "Please check your internet connection and try again.";
          } else if (
            error.message.includes("permission") ||
            error.message.includes("unauthorized")
          ) {
            errorMessage = "Permission denied.";
            errorDetails = "Please make sure you're logged in and try again.";
          } else if (error.message.includes("validation")) {
            errorMessage = "Form validation error.";
            errorDetails = "Please check your form data and try again.";
          } else {
            errorDetails = `Error: ${error.message}`;
          }
        }

        setSubmitError(`${errorMessage} ${errorDetails}`);
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load draft on component mount
  React.useEffect(() => {
    const draft = localStorage.getItem("fraud-report-draft");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.dateTime) {
          parsedDraft.dateTime = new Date(parsedDraft.dateTime);
        }
        setFormData((prev) => ({ ...prev, ...parsedDraft }));
        toast({
          title: "Draft Loaded",
          description: "Your previous draft has been restored.",
        });
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [toast]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TypeSelectionStep
            selectedType={formData.fraudType}
            onTypeSelect={(type) => updateFormData("fraudType", type)}
            error={getError("fraudType")}
          />
        );
      case 2:
        return (
          <CategorySelectionStep
            selectedCategory={formData.category}
            onCategorySelect={(category) =>
              updateFormData("category", category)
            }
            fraudType={formData.fraudType}
            error={getError("category")}
          />
        );
      case 3:
        return (
          <DetailsFormStep
            formData={formData}
            onUpdateData={updateFormData}
            errors={errors}
            hasError={hasError}
          />
        );
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Report Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for reporting this fraud. Your submission has been saved
              to the database and helps protect others in the community.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => setSubmitSuccess(false)}
                className="bg-india-saffron hover:bg-saffron-600"
              >
                Submit Another Report
              </Button>
              <div className="text-sm text-gray-500">
                You should receive a confirmation email shortly with your
                reference number.
              </div>
            </div>
          </div>
        </div>

        {/* Show saved reports verification */}
        <SavedReportsVerification />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Fraud</h2>
        <p className="text-gray-600">
          Help us protect others by reporting fraudulent activities. All
          information is kept confidential.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />

        {/* Step Labels */}
        <div className="flex justify-between mt-4">
          <div
            className={`text-sm ${currentStep >= 1 ? "text-india-saffron font-medium" : "text-gray-400"}`}
          >
            Select Type
          </div>
          <div
            className={`text-sm ${currentStep >= 2 ? "text-india-saffron font-medium" : "text-gray-400"}`}
          >
            Choose Category
          </div>
          <div
            className={`text-sm ${currentStep >= 3 ? "text-india-saffron font-medium" : "text-gray-400"}`}
          >
            Provide Details
          </div>
        </div>
      </div>

      {/* Database Configuration Error */}
      {hasDatabaseError && (
        <div className="mb-6 space-y-4">
          <QuickFixAlert />
          <DatabaseDiagnostics />
        </div>
      )}

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && currentStep === 3 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              Please correct the following errors:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      <div className="min-h-[500px]">{renderStep()}</div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-2"
            title={!user ? "Sign in to save drafts" : "Save as draft"}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !user ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>
              {isSaving
                ? "Saving..."
                : !user
                  ? "Sign in to Save"
                  : "Save as Draft"}
            </span>
          </Button>
        </div>

        <div className="flex space-x-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-india-saffron hover:bg-saffron-600 text-white flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-india-saffron hover:bg-saffron-600 text-white flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default FraudReportingForm;
