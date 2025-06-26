import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Phone,
  Upload,
  X,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { cn } from "@/lib/utils";
import EnhancedFileUpload from "@/components/common/EnhancedFileUpload";
import { formatCurrencyForInput, validateCurrencyInput } from "@/lib/currency";

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

interface DetailsFormStepProps {
  formData: FormData;
  onUpdateData: (field: keyof FormData, value: any) => void;
  errors?: { [key: string]: string };
  hasError?: (field: string) => boolean;
}

const DetailsFormStep: React.FC<DetailsFormStepProps> = ({
  formData,
  onUpdateData,
  errors = {},
  hasError = () => false,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Provide Fraud Details
        </h2>
        <p className="text-gray-600">
          Share specific information about the fraudulent activity you
          encountered
        </p>
      </div>

      {/* Report Title */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="title">Report Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Brief summary of the fraud incident"
              value={formData.title || ""}
              onChange={(e) => onUpdateData("title", e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide a short, descriptive title for your report (auto-generated
              if left blank)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-india-saffron" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phoneNumber}
                onChange={(e) => onUpdateData("phoneNumber", e.target.value)}
                className={`mt-1 ${hasError("phoneNumber") ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.phoneNumber}
                </p>
              )}
              {!errors.phoneNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  The phone number involved in the fraud (yours or the
                  fraudster's)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                type="text"
                placeholder="City, State"
                value={formData.location || ""}
                onChange={(e) => onUpdateData("location", e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Where did this incident occur?
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-india-saffron" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date & Time of Incident *</Label>
              <div className="mt-1">
                <EnhancedCalendar
                  selectedDateTime={formData.dateTime || undefined}
                  onDateTimeChange={(date) => onUpdateData("dateTime", date)}
                  showTimeSelector={true}
                  placeholder="Select incident date and time"
                  error={hasError("dateTime")}
                />
              </div>
              {errors.dateTime && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {errors.dateTime}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select when the fraud incident occurred. You can also specify
                the approximate time.
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Amount Involved (Optional)</Label>
              <div className="relative mt-1">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="₹0"
                  value={formatCurrencyForInput(formData.amount)}
                  onChange={(e) =>
                    onUpdateData(
                      "amount",
                      parseFloat(e.target.value) || undefined,
                    )
                  }
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How much money was involved (if any)? Enter amount in Indian
                Rupees (₹)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Content */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Description *</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Please describe what happened in detail. Include any messages, calls, or communications you received. Be as specific as possible about the sequence of events, what the fraudster said or did, and any suspicious behavior you noticed."
            value={formData.messageContent}
            onChange={(e) => onUpdateData("messageContent", e.target.value)}
            rows={6}
            className={`resize-none ${hasError("messageContent") ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.messageContent ? (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.messageContent}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Minimum 10 characters required. Be detailed to help authorities
                investigate.
              </p>
            )}
            <span
              className={`text-xs ${hasError("messageContent") ? "text-red-400" : "text-gray-400"}`}
            >
              {formData.messageContent.length}/5000
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional details that might be helpful for the investigation. For example: How did you realize it was a fraud? What steps did you take? Did you share any personal information?"
            value={formData.additionalDetails || ""}
            onChange={(e) => onUpdateData("additionalDetails", e.target.value)}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Enhanced File Upload */}
      <EnhancedFileUpload
        onFilesUploaded={(files) => {
          // Convert uploaded files to File array for compatibility
          const fileObjects = files.map((f) => f.file);
          onUpdateData("files", fileObjects);
        }}
        maxFiles={5}
        maxSize={10}
        acceptedFileTypes={[
          "image/jpeg",
          "image/png",
          "image/gif",
          "audio/mp3",
          "audio/wav",
          "audio/mpeg",
          "video/mp4",
          "video/mov",
          "video/quicktime",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]}
      />

      {/* Important Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                Important
              </Badge>
            </div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Before submitting your report:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Ensure all information is accurate and complete</li>
                <li>Do not share personal passwords or PINs in this form</li>
                <li>Keep copies of any evidence for your records</li>
                <li>Contact your bank immediately if money was involved</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsFormStep;
