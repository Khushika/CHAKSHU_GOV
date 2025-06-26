import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: {
    dateRange: { from: Date | null; to: Date | null };
    fraudTypes: string[];
    location: string;
    severity: number[];
    status: string[];
  };
  onFiltersChange: (filters: any) => void;
  sortBy: "date" | "relevance" | "severity";
  sortOrder: "asc" | "desc";
  onSortChange: (
    sortBy: "date" | "relevance" | "severity",
    sortOrder: "asc" | "desc",
  ) => void;
}

const fraudTypeOptions = [
  { value: "Phone Call Fraud", label: "Phone Call Fraud" },
  { value: "SMS/Text Fraud", label: "SMS/Text Fraud" },
  { value: "Email Phishing", label: "Email Phishing" },
  { value: "Online Fraud", label: "Online Fraud" },
  { value: "Financial Fraud", label: "Financial Fraud" },
  { value: "Identity Theft", label: "Identity Theft" },
  { value: "Job/Employment Fraud", label: "Job/Employment Fraud" },
  { value: "Tech Support Scam", label: "Tech Support Scam" },
];

const statusOptions = [
  { value: "Under Review", label: "Under Review" },
  { value: "Resolved", label: "Resolved" },
  { value: "Active", label: "Active" },
  { value: "Blocked", label: "Blocked" },
];

const locationOptions = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Delhi", label: "Delhi" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Rajasthan", label: "Rajasthan" },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleFraudTypeChange = (fraudType: string, checked: boolean) => {
    const updatedTypes = checked
      ? [...filters.fraudTypes, fraudType]
      : filters.fraudTypes.filter((type) => type !== fraudType);

    onFiltersChange({ fraudTypes: updatedTypes });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const updatedStatuses = checked
      ? [...filters.status, status]
      : filters.status.filter((s) => s !== status);

    onFiltersChange({ status: updatedStatuses });
  };

  const handleDateRangeChange = (
    field: "from" | "to",
    date: Date | undefined,
  ) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sort Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split("-") as [
                "date" | "relevance" | "severity",
                "asc" | "desc",
              ];
              onSortChange(newSortBy, newSortOrder);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance-desc">Most Relevant</SelectItem>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="severity-desc">High Severity</SelectItem>
              <SelectItem value="severity-asc">Low Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <Select
            value={filters.location || "all"}
            onValueChange={(value) =>
              onFiltersChange({ location: value === "all" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range - From */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from
                  ? format(filters.dateRange.from, "PPP")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from || undefined}
                onSelect={(date) => handleDateRangeChange("from", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range - To */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.to && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to
                  ? format(filters.dateRange.to, "PPP")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to || undefined}
                onSelect={(date) => handleDateRangeChange("to", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fraud Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fraud Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fraudTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`fraud-type-${option.value}`}
                  checked={filters.fraudTypes.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleFraudTypeChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`fraud-type-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleStatusChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`status-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchFilters;
