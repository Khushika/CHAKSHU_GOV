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

      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate reference ID
      const referenceId = `FR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Save report to localStorage for dashboard and reports management
      const newReport = {
        id: `USER-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: formData.fraudType,
        title: `${formData.fraudType} - ${formData.category}`,
        description: formData.messageContent,
        status: "Pending",
        impact:
          formData.amount && formData.amount > 50000
            ? "Critical"
            : formData.amount && formData.amount > 10000
              ? "High"
              : "Medium",
        location: formData.location || "Location not specified",
        amount: formData.amount,
        phoneNumber: formData.phoneNumber,
        referenceId,
        evidenceCount: formData.files.length,
        submittedAt: new Date(),
        updatedAt: new Date(),
        severity:
          formData.amount && formData.amount > 50000
            ? "critical"
            : formData.amount && formData.amount > 10000
              ? "high"
              : "medium",
      };

      // Save to localStorage
      try {
        const existingReports = JSON.parse(
          localStorage.getItem("user-fraud-reports") || "[]",
        );
        localStorage.setItem(
          "user-fraud-reports",
          JSON.stringify([newReport, ...existingReports]),
        );
        window.dispatchEvent(new CustomEvent("user-reports-updated"));
      } catch (error) {
        console.error("Failed to save user report:", error);
      }

      setSubmitSuccess(true);

      toast({
        title: "Report Submitted Successfully",
        description: `Your fraud report has been submitted. Reference ID: ${referenceId}`,
      });

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
      });
      localStorage.removeItem("fraud-report-draft");
      setCurrentStep(1);
    } catch (error) {
      setSubmitError(
        "An unexpected error occurred while submitting your report. Please try again.",
      );
      toast({
        title: "Submission Failed",
        description:
          "Failed to submit report. Please try again or contact support.",
        variant: "destructive",
      });
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
