import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Flag,
  MoreHorizontal,
  Send,
  Heart,
  Share2,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

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

interface CommentSectionProps {
  itemId: string;
  comments: Comment[];
  onCommentAdd: (comment: string) => void;
  onReplyAdd: (parentId: string, reply: string) => void;
  onCommentReact: (commentId: string, reaction: "like" | "dislike") => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  itemId,
  comments,
  onCommentAdd,
  onReplyAdd,
  onCommentReact,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    "newest",
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description:
          "Please sign in to post comments. Join the community to share your insights!",
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before posting.",
        variant: "destructive",
      });
      return;
    }

    onCommentAdd(newComment);
    setNewComment("");
    toast({
      title: "Comment Posted",
      description: "Your comment has been successfully posted.",
    });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description:
          "Please sign in to reply to comments. Join the community to participate in discussions!",
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Reply Required",
        description: "Please enter a reply before posting.",
        variant: "destructive",
      });
      return;
    }

    onReplyAdd(parentId, replyContent);
    setReplyContent("");
    setReplyingTo(null);
    toast({
      title: "Reply Posted",
      description: "Your reply has been successfully posted.",
    });
  };

  const handleReaction = (commentId: string, reaction: "like" | "dislike") => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: `Please sign in to ${reaction} comments. Join the community to show your support!`,
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }
    onCommentReact(commentId, reaction);
  };

  const handleShare = (comment: Comment) => {
    navigator.clipboard.writeText(
      `Check out this comment: "${comment.content}"`,
    );
    toast({
      title: "Comment Link Copied",
      description: "The comment link has been copied to your clipboard.",
    });
  };

  const handleReport = (comment: Comment) => {
    toast({
      title: "Comment Reported",
      description: "Thank you for reporting. We'll review this comment.",
    });
  };

  const sortComments = (comments: Comment[]) => {
    return [...comments].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "oldest":
          return a.timestamp.getTime() - b.timestamp.getTime();
        case "popular":
          return b.likes - b.dislikes - (a.likes - a.dislikes);
        default:
          return 0;
      }
    });
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-3" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {/* Comment Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.author.name}</span>
            {comment.author.verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
            {comment.author.role && (
              <Badge variant="outline" className="text-xs">
                {comment.author.role}
              </Badge>
            )}
            {comment.isPinned && (
              <Badge className="text-xs bg-india-saffron">Pinned</Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Comment Content */}
          <div className="text-sm text-gray-700 leading-relaxed">
            {comment.content}
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 gap-1 ${
                  comment.userReaction === "like"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => handleReaction(comment.id, "like")}
              >
                <ThumbsUp className="h-3 w-3" />
                {comment.likes > 0 && comment.likes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 gap-1 ${
                  comment.userReaction === "dislike"
                    ? "text-red-600 bg-red-50"
                    : "text-gray-500 hover:text-red-600"
                }`}
                onClick={() => handleReaction(comment.id, "dislike")}
              >
                <ThumbsDown className="h-3 w-3" />
                {comment.dislikes > 0 && comment.dislikes}
              </Button>
            </div>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 gap-1 text-gray-500 hover:text-blue-600"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in Required",
                      description:
                        "Please sign in to reply to comments. Join the community!",
                      variant: "default",
                    });
                    setAuthMode("signup");
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setReplyingTo(comment.id);
                }}
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 gap-1 text-gray-500 hover:text-green-600"
              onClick={() => handleShare(comment)}
            >
              <Share2 className="h-3 w-3" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-500"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleReport(comment)}>
                  <Flag className="h-3 w-3 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  className="bg-india-saffron hover:bg-saffron-600"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sortedComments = sortComments(comments);

  return (
    <Card className="flex flex-col max-h-[60vh]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-6">
          {/* New Comment Form */}
          <div className="space-y-3">
            {user ? (
              <>
                <Textarea
                  placeholder="Share your thoughts on this report..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || newComment.length > 500}
                    className="bg-india-saffron hover:bg-saffron-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Textarea
                  placeholder="Sign in to share your thoughts..."
                  disabled={true}
                  className="min-h-[100px] bg-gray-50"
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Sign in to participate in discussions
                  </div>
                  <Button
                    onClick={() => {
                      setAuthMode("signup");
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-india-saffron hover:bg-saffron-600"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sign in to Comment
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-6">
            {sortedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No comments yet
                </h3>
                <p className="text-gray-500">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              sortedComments.map((comment) => (
                <div key={comment.id}>
                  {renderComment(comment)}
                  {comment !== sortedComments[sortedComments.length - 1] && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </ScrollArea>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </Card>
  );
};

export default CommentSection;
