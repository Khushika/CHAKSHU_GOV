import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Share2,
  Flag,
  BookmarkPlus,
  ExternalLink,
  Phone,
  Mail,
  Shield,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import CommentSection from "./CommentSection";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  type: "report" | "alert" | "discussion";
  title: string;
  description: string;
  fraudType: string;
  severity: number;
  status: string;
  location: string;
  date: Date;
  reportedBy: string;
  comments: number;
  details?: {
    phoneNumber?: string;
    email?: string;
    website?: string;
    amountLost?: number;
    evidence?: string[];
    relatedReports?: string[];
    actionsTaken?: string[];
    tags?: string[];
  };
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
    verified?: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  userReaction?: "like" | "dislike" | null;
  replies?: Comment[];
  isEdited?: boolean;
  isPinned?: boolean;
}

interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
}

const SearchResultModal: React.FC<SearchResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Priya Sharma",
        role: "Community Moderator",
        verified: true,
      },
      content:
        "This is very helpful information. I had a similar experience last month. Thanks for sharing and helping others stay safe.",
      timestamp: new Date("2024-01-15T10:30:00"),
      likes: 12,
      dislikes: 0,
      userReaction: null,
      isPinned: true,
      replies: [
        {
          id: "2",
          author: {
            name: "Rajesh Kumar",
            verified: false,
          },
          content:
            "Same here! These scammers are getting more creative every day.",
          timestamp: new Date("2024-01-15T11:15:00"),
          likes: 5,
          dislikes: 0,
          userReaction: null,
        },
      ],
    },
    {
      id: "3",
      author: {
        name: "Anita Desai",
        role: "Security Expert",
        verified: true,
      },
      content:
        "Important reminder: Never share your OTP or banking credentials with anyone, even if they claim to be from your bank. Banks will never ask for this information over phone or email.",
      timestamp: new Date("2024-01-15T14:20:00"),
      likes: 8,
      dislikes: 1,
      userReaction: "like",
    },
  ]);

  if (!result) return null;

  const handleCommentAdd = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        verified: false,
      },
      content,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userReaction: null,
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const handleReplyAdd = (parentId: string, content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        verified: false,
      },
      content,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userReaction: null,
    };

    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        return comment;
      }),
    );
  };

  const handleCommentReact = (
    commentId: string,
    reaction: "like" | "dislike",
  ) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const currentReaction = comment.userReaction;
          let newLikes = comment.likes;
          let newDislikes = comment.dislikes;
          let newReaction: "like" | "dislike" | null = reaction;

          // Remove previous reaction
          if (currentReaction === "like") newLikes--;
          if (currentReaction === "dislike") newDislikes--;

          // Add new reaction or remove if same
          if (currentReaction === reaction) {
            newReaction = null;
          } else {
            if (reaction === "like") newLikes++;
            if (reaction === "dislike") newDislikes++;
          }

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes,
            userReaction: newReaction,
          };
        }

        // Handle replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                const currentReaction = reply.userReaction;
                let newLikes = reply.likes;
                let newDislikes = reply.dislikes;
                let newReaction: "like" | "dislike" | null = reaction;

                if (currentReaction === "like") newLikes--;
                if (currentReaction === "dislike") newDislikes--;

                if (currentReaction === reaction) {
                  newReaction = null;
                } else {
                  if (reaction === "like") newLikes++;
                  if (reaction === "dislike") newDislikes++;
                }

                return {
                  ...reply,
                  likes: newLikes,
                  dislikes: newDislikes,
                  userReaction: newReaction,
                };
              }
              return reply;
            }),
          };
        }

        return comment;
      }),
    );
  };

  const handleShare = () => {
    const url = `${window.location.origin}/search/result/${result.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "The link to this report has been copied to your clipboard.",
    });
  };

  const handleBookmark = () => {
    toast({
      title: "Bookmarked",
      description: "This report has been added to your bookmarks.",
    });
  };

  const handleReport = () => {
    toast({
      title: "Reported",
      description: "Thank you for reporting. We'll review this content.",
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "bg-red-100 text-red-800";
    if (severity >= 6) return "bg-orange-100 text-orange-800";
    if (severity >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Blocked":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "report":
        return <AlertTriangle className="h-5 w-5" />;
      case "discussion":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] flex flex-col">
        <DialogHeader className="space-y-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(result.type)}
              <div className="space-y-1">
                <DialogTitle className="text-xl leading-tight">
                  {result.title}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {result.type === "report"
                    ? "Fraud Report"
                    : result.type === "discussion"
                      ? "Community Discussion"
                      : "Security Alert"}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(result.severity)}>
                Severity {result.severity}
              </Badge>
              <Badge className={getStatusColor(result.status)}>
                {result.status}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" onClick={handleReport}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Main Content */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {result.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Reported by:</span>
                        <span className="font-medium">{result.reportedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{result.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {format(result.date, "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">234</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge variant="outline" className="text-sm">
                        {result.fraudType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              {result.details && (
                <div className="grid gap-4 md:grid-cols-2">
                  {result.details.phoneNumber && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-2 font-mono">
                              {result.details.phoneNumber}
                            </span>
                          </div>
                          {result.details.email && (
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2 font-mono">
                                {result.details.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.details.amountLost && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Financial Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          ₹{result.details.amountLost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Amount Lost</div>
                      </CardContent>
                    </Card>
                  )}

                  {result.details.actionsTaken && (
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Actions Taken
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {result.details.actionsTaken.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Report Submitted
                        </div>
                        <div className="text-xs text-gray-600">
                          {format(result.date, "MMM d, yyyy HH:mm")}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Initial Review Completed
                        </div>
                        <div className="text-xs text-gray-600">
                          2 hours later
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Community Discussion Started
                        </div>
                        <div className="text-xs text-gray-600">1 day later</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <CommentSection
                itemId={result.id}
                comments={comments}
                onCommentAdd={handleCommentAdd}
                onReplyAdd={handleReplyAdd}
                onCommentReact={handleCommentReact}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchResultModal;
