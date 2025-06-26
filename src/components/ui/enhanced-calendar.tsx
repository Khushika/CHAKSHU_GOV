import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  showTimeSelector?: boolean;
  selectedDateTime?: Date;
  onDateTimeChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
};

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  showTimeSelector = false,
  selectedDateTime,
  onDateTimeChange,
  placeholder = "Select date",
  disabled = false,
  error = false,
  ...props
}: EnhancedCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    selectedDateTime,
  );
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedDate(selectedDateTime);
  }, [selectedDateTime]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      let newDateTime = new Date(date);
      if (selectedDateTime) {
        // Preserve existing time
        newDateTime.setHours(selectedDateTime.getHours());
        newDateTime.setMinutes(selectedDateTime.getMinutes());
      } else {
        // Set to current time
        const now = new Date();
        newDateTime.setHours(now.getHours());
        newDateTime.setMinutes(now.getMinutes());
      }
      setSelectedDate(newDateTime);
      if (!showTimeSelector) {
        onDateTimeChange?.(newDateTime);
        setIsOpen(false);
      }
    } else {
      setSelectedDate(undefined);
      onDateTimeChange?.(undefined);
    }
  };

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    if (selectedDate) {
      const newDateTime = new Date(selectedDate);
      if (type === "hours") {
        newDateTime.setHours(parseInt(value));
      } else {
        newDateTime.setMinutes(parseInt(value));
      }
      setSelectedDate(newDateTime);
      onDateTimeChange?.(newDateTime);
    }
  };

  const handleConfirm = () => {
    onDateTimeChange?.(selectedDate);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            error && "border-red-500 focus:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {selectedDate
              ? showTimeSelector
                ? format(selectedDate, "MMM dd, yyyy 'at' h:mm a")
                : format(selectedDate, "MMM dd, yyyy")
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-auto p-0", showTimeSelector && "w-80")}
        align="start"
      >
        <div className="space-y-3">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            className={cn("p-3 border-0", className)}
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] sm:w-9",
              row: "flex w-full mt-2",
              cell: "h-8 w-8 sm:h-9 sm:w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100",
                "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground hover:bg-accent hover:text-accent-foreground",
              ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside:
                "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              ...classNames,
            }}
            components={{
              IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
              IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
            }}
            {...props}
          />

          {showTimeSelector && selectedDate && (
            <div className="border-t px-3 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Select Time</span>
              </div>

              {/* Quick time presets */}
              <div className="mb-3">
                <label className="text-xs text-muted-foreground block mb-1">
                  Quick presets
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { label: "Morning", hours: 9, minutes: 0 },
                    { label: "Afternoon", hours: 14, minutes: 0 },
                    { label: "Evening", hours: 18, minutes: 0 },
                    {
                      label: "Now",
                      hours: new Date().getHours(),
                      minutes: new Date().getMinutes(),
                    },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        handleTimeChange("hours", preset.hours.toString());
                        handleTimeChange("minutes", preset.minutes.toString());
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="hour-select"
                    className="text-xs text-muted-foreground block mb-1"
                  >
                    Hour
                  </label>
                  <select
                    id="hour-select"
                    value={selectedDate.getHours()}
                    onChange={(e) => handleTimeChange("hours", e.target.value)}
                    className="w-full h-8 text-sm border border-input rounded px-2 bg-background focus:ring-2 focus:ring-ring"
                    aria-label="Select hour"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")} (
                        {i === 0
                          ? "12 AM"
                          : i < 12
                            ? `${i} AM`
                            : i === 12
                              ? "12 PM"
                              : `${i - 12} PM`}
                        )
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <span className="text-lg text-muted-foreground">:</span>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="minute-select"
                    className="text-xs text-muted-foreground block mb-1"
                  >
                    Minute
                  </label>
                  <select
                    id="minute-select"
                    value={selectedDate.getMinutes()}
                    onChange={(e) =>
                      handleTimeChange("minutes", e.target.value)
                    }
                    className="w-full h-8 text-sm border border-input rounded px-2 bg-background focus:ring-2 focus:ring-ring"
                    aria-label="Select minute"
                  >
                    {Array.from({ length: 12 }, (_, i) => i * 5).map(
                      (minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, "0")}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              {selectedDate && (
                <div className="mt-3 p-2 bg-muted rounded text-xs text-center">
                  <strong>Selected:</strong>{" "}
                  {format(selectedDate, "EEEE, MMMM do, yyyy 'at' h:mm a")}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" className="flex-1" onClick={handleConfirm}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };
