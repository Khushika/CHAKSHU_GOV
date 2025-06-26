import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  ThumbsUp,
  Send,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { communityCommentsService, reportsService } from "@/services/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  id: string;
  type: "report" | "alert" | "discussion" | "post";
  title: string;
  description: string;
  fraudType?: string;
  severity?: number;
  status: string;
  location?: string;
  date: Date;
  reportedBy: string;
  comments: number;
  likes?: number;
  hasLiked?: boolean;
  details?: {
    phoneNumber?: string;
    email?: string;
    website?: string;
    amountLost?: number;
    evidence?: string[];
    relatedReports?: string[];
    actionsTaken?: string[];
    tags?: string[];
    category?: string;
    author?: {
      name: string;
      avatar?: string;
      reputation?: number;
      verified?: boolean;
    };
  };
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
    verified?: boolean;
    reputation?: number;
  };
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  userReaction?: "like" | "dislike" | null;
  replies?: Comment[];
  isEdited?: boolean;
  isPinned?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface EnhancedSearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
  onUpdate?: (updatedResult: SearchResult) => void;
}

const EnhancedSearchResultModal: React.FC<EnhancedSearchResultModalProps> = ({
  isOpen,
  onClose,
  result,
  onUpdate,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && result) {
      loadComments();
      // Increment view count for reports
      if (result.type === "report") {
        incrementViewCount();
      }
    }
  }, [isOpen, result]);

  const loadComments = async () => {
    if (!result) return;

    setLoading(true);
    try {
      // In a real app, this would fetch actual comments from the database
      const mockComments: Comment[] = [
        {
          id: "1",
          author: {
            name: "Priya Sharma",
            role: "Community Moderator",
            verified: true,
            reputation: 95,
          },
          content:
            "This is very helpful information. I had a similar experience last month. Thanks for sharing and helping others stay safe.",
          timestamp: new Date("2024-01-15T10:30:00"),
          likes: 12,
          dislikes: 0,
          userReaction: null,
          isPinned: true,
          canEdit: false,
          canDelete: false,
          replies: [
            {
              id: "2",
              author: {
                name: "Rajesh Kumar",
                verified: false,
                reputation: 45,
              },
              content:
                "Same here! These scammers are getting more creative every day.",
              timestamp: new Date("2024-01-15T11:15:00"),
              likes: 5,
              dislikes: 0,
              userReaction: null,
              canEdit: user?.email === "rajesh@example.com",
              canDelete: user?.email === "rajesh@example.com",
            },
          ],
        },
        {
          id: "3",
          author: {
            name: "Anita Desai",
            role: "Security Expert",
            verified: true,
            reputation: 88,
          },
          content:
            "Important reminder: Never share your OTP or banking credentials with anyone, even if they claim to be from your bank. Banks will never ask for this information over phone or email.",
          timestamp: new Date("2024-01-15T14:20:00"),
          likes: 8,
          dislikes: 1,
          userReaction: "like",
          canEdit: false,
          canDelete: false,
        },
      ];
      setComments(mockComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!result) return;
    try {
      // This would increment the view count in the database
      console.log("Incrementing view count for:", result.id);
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  if (!result) return null;

  const handleCommentAdd = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to add comments.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          verified: false,
          reputation: 50,
        },
        content: newComment.trim(),
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        userReaction: null,
        canEdit: true,
        canDelete: true,
      };

      setComments((prev) => [comment, ...prev]);
      setNewComment("");

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });

      // Update parent result comment count
      if (onUpdate) {
        onUpdate({
          ...result,
          comments: result.comments + 1,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyAdd = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to reply to comments.",
        variant: "destructive",
      });
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const newReply: Comment = {
        id: Date.now().toString(),
        author: {
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          verified: false,
          reputation: 50,
        },
        content: replyText.trim(),
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        userReaction: null,
        canEdit: true,
        canDelete: true,
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

      setReplyText("");
      setReplyingTo(null);

      toast({
        title: "Reply Added",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentReact = (
    commentId: string,
    reaction: "like" | "dislike",
  ) => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to react to comments.",
        variant: "destructive",
      });
      return;
    }

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

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setIsSubmitting(true);
    try {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: editText.trim(),
              isEdited: true,
            };
          }
          return comment;
        }),
      );

      setEditingComment(null);
      setEditText("");

      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });

      // Update parent result comment count
      if (onUpdate) {
        onUpdate({
          ...result,
          comments: result.comments - 1,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
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
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "under_review":
      case "under review":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "blocked":
        return <XCircle className="h-4 w-4" />;
      case "under_review":
      case "under review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "report":
        return <AlertTriangle className="h-5 w-5" />;
      case "discussion":
      case "post":
        return <MessageSquare className="h-5 w-5" />;
      case "alert":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-3" : ""}`}>
      <div className="flex items-start gap-3">
        <Avatar className={`${isReply ? "h-7 w-7" : "h-9 w-9"} flex-shrink-0`}>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
            {comment.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isReply ? "text-sm" : ""}`}>
              {comment.author.name}
            </span>
            {comment.author.verified && (
              <Shield className="h-3 w-3 text-blue-500" />
            )}
            {comment.author.role && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {comment.author.role}
              </Badge>
            )}
            {comment.author.reputation && (
              <span className="text-xs text-gray-500">
                Rep: {comment.author.reputation}
              </span>
            )}
            {comment.isPinned && (
              <Badge variant="secondary" className="text-xs">
                📌 Pinned
              </Badge>
            )}
            <span
              className={`text-gray-500 ${isReply ? "text-xs" : "text-sm"}`}
            >
              {format(comment.timestamp, "MMM d, h:mm a")}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isSubmitting || !editText.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingComment(null);
                    setEditText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={`mt-1 text-gray-700 ${isReply ? "text-sm" : ""} leading-relaxed break-words`}
            >
              {comment.content}
            </p>
          )}

          <div
            className={`flex items-center gap-4 mt-2 ${isReply ? "text-xs" : "text-sm"}`}
          >
            <button
              className={`flex items-center gap-1 transition-colors ${
                comment.userReaction === "like"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => handleCommentReact(comment.id, "like")}
            >
              <ThumbsUp
                className={`h-3 w-3 ${comment.userReaction === "like" ? "fill-current" : ""}`}
              />
              <span>{comment.likes}</span>
            </button>

            {!isReply && (
              <button
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyText("");
                }}
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}

            {(comment.canEdit || comment.canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.canEdit && (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.content);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {comment.canDelete && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReplyAdd(comment.id)}
                  disabled={isSubmitting || !replyText.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] lg:w-full overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 space-y-4 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getTypeIcon(result.type)}
              <div className="space-y-2 flex-1 min-w-0">
                <DialogTitle className="text-lg lg:text-xl leading-tight break-words">
                  {result.title}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {result.type === "report"
                    ? "Fraud Report"
                    : result.type === "discussion" || result.type === "post"
                      ? "Community Discussion"
                      : "Security Alert"}
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {result.severity && (
                <Badge className={getSeverityColor(result.severity)}>
                  Severity {result.severity}
                </Badge>
              )}
              <Badge className={getStatusColor(result.status)}>
                {getStatusIcon(result.status)}
                <span className="ml-1">{result.status}</span>
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="details" className="text-xs sm:text-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs sm:text-sm">
                Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="details" className="space-y-6 m-0">
                {/* Main Content */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed break-words">
                        {result.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600">Reported by:</span>
                          <span className="font-medium truncate">
                            {result.reportedBy}
                          </span>
                        </div>
                        {result.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium truncate">
                              {result.location}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {format(result.date, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">234</span>
                        </div>
                      </div>

                      {result.fraudType && (
                        <div className="pt-2">
                          <Badge variant="outline" className="text-sm">
                            {result.fraudType}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Details */}
                {result.details && (
                  <div className="grid gap-4 lg:grid-cols-2">
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
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-mono break-all">
                                {result.details.phoneNumber}
                              </span>
                            </div>
                            {result.details.email && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-mono break-all">
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
                          <div className="text-xl lg:text-2xl font-bold text-red-600">
                            ₹{result.details.amountLost.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Amount Lost
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {result.details.actionsTaken && (
                      <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Actions Taken
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm">
                            {result.details.actionsTaken.map(
                              (action, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="break-words">{action}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 m-0">
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
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Report Submitted
                          </div>
                          <div className="text-xs text-gray-600">
                            {format(result.date, "MMM d, yyyy HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Initial Review Completed
                          </div>
                          <div className="text-xs text-gray-600">
                            2 hours later
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Community Discussion Started
                          </div>
                          <div className="text-xs text-gray-600">
                            1 day later
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="m-0 space-y-4">
                {/* Add Comment Section */}
                {user ? (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                            {user.user_metadata?.full_name?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Share your thoughts on this discussion..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            disabled={isSubmitting}
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handleCommentAdd}
                              disabled={!newComment.trim() || isSubmitting}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {isSubmitting ? "Posting..." : "Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-gray-600 mb-4">
                        Sign in to join the discussion and share your thoughts.
                      </p>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Sign In to Comment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Comments List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => renderComment(comment))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No comments yet
                      </h3>
                      <p className="text-gray-600">
                        Be the first to share your thoughts on this discussion.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSearchResultModal;
