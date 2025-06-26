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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import useFormValidation, {
  enhancedValidations,
} from "@/hooks/useFormValidation";
import { reportsService, evidenceService } from "@/services/database";
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
    setErrors,
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
      setErrors((prev) => ({ ...prev, ...newErrors }));
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

    try {
      // Comprehensive form validation
      const validationErrors = [];

      if (!formData.fraudType) validationErrors.push("fraud type");
      if (!formData.category) validationErrors.push("category");
      if (!formData.phoneNumber || formData.phoneNumber.length < 10)
        validationErrors.push("valid phone number");
      if (
        !formData.messageContent ||
        formData.messageContent.trim().length < 10
      )
        validationErrors.push("detailed description (minimum 10 characters)");
      if (!formData.dateTime) validationErrors.push("incident date");

      if (validationErrors.length > 0) {
        const errorMessage = `Please provide: ${validationErrors.join(", ")}`;
        setSubmitError(errorMessage);
        toast({
          title: "Validation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Map fraud type to report type
      const getReportType = (fraudType: string): string => {
        const typeMap: Record<string, string> = {
          "Call Fraud": "call",
          "SMS Fraud": "sms",
          "WhatsApp Scam": "whatsapp",
          "Email Spam": "email",
        };
        return typeMap[fraudType] || "call";
      };

      // Map category to fraud_category
      const getFraudCategory = (category: string): string => {
        const categoryMap: Record<string, string> = {
          "Financial Fraud": "financial_fraud",
          "Investment Scam": "investment_fraud",
          "Lottery Scam": "lottery_scam",
          "Job Fraud": "job_fraud",
          Impersonation: "impersonation",
        };
        return categoryMap[category] || "other";
      };

      // Generate title from fraud type and category
      const generateTitle = (fraudType: string, category: string): string => {
        return `${fraudType} - ${category} Report`;
      };

      // Map form data to database schema that matches service expectations
      const reportData: ReportInsert = {
        user_id: user.id,
        title:
          formData.title ||
          generateTitle(formData.fraudType, formData.category),
        description: formData.messageContent,
        fraud_type: getFraudCategory(formData.category), // Use mapped category as fraud_type
        incident_date:
          formData.dateTime?.toISOString() || new Date().toISOString(),
        amount_involved: formData.amount || null,
        status: "pending",
        // Additional fields for compatibility
        report_type: getReportType(formData.fraudType),
        fraudulent_number: formData.phoneNumber,
        fraud_category: getFraudCategory(formData.category),
        evidence_urls: [],
        priority: "medium",
        city: formData.city || "",
        state: formData.state || "",
        currency: "INR",
      };

      // Submit report to database
      const reportResult = await reportsService.create(reportData);

      if (!reportResult.success || !reportResult.data) {
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

      setSubmitSuccess(true);

      toast({
        title: "Report Submitted Successfully! 🎉",
        description: `Your fraud report has been submitted successfully. Report ID: ${createdReport.id}. You will receive updates via email.`,
        duration: 8000,
      });

      // Clear form and draft after a short delay to show success state
      setTimeout(() => {
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
        setSubmitSuccess(false);
        setSubmitError(null);
      }, 2000);
    } catch (error) {
      let errorMessage =
        "An unexpected error occurred while submitting your report.";

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (
          error.message.includes("validation") ||
          error.message.includes("required")
        ) {
          errorMessage = "Please check all required fields and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitError(errorMessage);
      toast({
        title: "Submission Failed",
        description:
          errorMessage + " If the problem persists, please contact support.",
        variant: "destructive",
        duration: 10000,
      });

      console.error("Report submission error:", error);
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
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting this fraud. Your submission helps protect
            others in the community.
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
