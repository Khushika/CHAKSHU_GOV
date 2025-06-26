import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { reportsService } from "@/services/database";
import { Loader2 } from "lucide-react";
import { Save, Lock } from "lucide-react";

interface CreateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportCreated: () => void;
}

const CreateReportModal = ({
  open,
  onOpenChange,
  onReportCreated,
}: CreateReportModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fraud_type: "",
    incident_date: "",
    amount_involved: "",
    contact_phone: "",
    contact_email: "",
    location_address: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fraudTypes = [
    { value: "phishing", label: "Phishing" },
    { value: "sms_fraud", label: "SMS Fraud" },
    { value: "call_fraud", label: "Call Fraud" },
    { value: "email_spam", label: "Email Spam" },
    { value: "investment_scam", label: "Investment Scam" },
    { value: "lottery_scam", label: "Lottery Scam" },
    { value: "tech_support_scam", label: "Tech Support Scam" },
    { value: "romance_scam", label: "Romance Scam" },
    { value: "other", label: "Other" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create fraud reports",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    if (!formData.title || !formData.description || !formData.fraud_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const reportData: any = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        fraud_type: formData.fraud_type,
        incident_date: formData.incident_date || null,
        amount_involved: formData.amount_involved
          ? parseFloat(formData.amount_involved)
          : null,
      };

      // Add contact info if provided
      if (formData.contact_phone || formData.contact_email) {
        reportData.contact_info = {
          phone: formData.contact_phone || null,
          email: formData.contact_email || null,
        };
      }

      // Add location info if provided
      if (formData.location_address) {
        reportData.location_info = {
          address: formData.location_address,
        };
      }

      const result = await reportsService.create(reportData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create report");
      }

      toast({
        title: "Report Created",
        description:
          result.message || "Your fraud report has been submitted successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        fraud_type: "",
        incident_date: "",
        amount_involved: "",
        contact_phone: "",
        contact_email: "",
        location_address: "",
      });

      onOpenChange(false);
      onReportCreated();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>
            Submit a new fraud report with detailed information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Brief description of the fraud incident"
                required
              />
            </div>

            <div>
              <Label htmlFor="fraud_type">Fraud Type *</Label>
              <Select
                value={formData.fraud_type}
                onValueChange={(value) =>
                  handleInputChange("fraud_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fraud type" />
                </SelectTrigger>
                <SelectContent>
                  {fraudTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide detailed information about the fraud incident..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Incident Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incident_date">Incident Date</Label>
              <Input
                id="incident_date"
                type="date"
                value={formData.incident_date}
                onChange={(e) =>
                  handleInputChange("incident_date", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="amount_involved">Amount Involved (₹)</Label>
              <Input
                id="amount_involved"
                type="number"
                value={formData.amount_involved}
                onChange={(e) =>
                  handleInputChange("amount_involved", e.target.value)
                }
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    handleInputChange("contact_phone", e.target.value)
                  }
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email Address</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    handleInputChange("contact_email", e.target.value)
                  }
                  placeholder="example@email.com"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <Label htmlFor="location_address">
              Location/Address (Optional)
            </Label>
            <Textarea
              id="location_address"
              value={formData.location_address}
              onChange={(e) =>
                handleInputChange("location_address", e.target.value)
              }
              placeholder="Where did the incident occur?"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;
