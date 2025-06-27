import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  ThumbsUp,
  Clock,
  Pin,
  Reply,
  Send,
  Heart,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  hasLiked: boolean;
  replies?: Comment[];
}

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  replies: number;
  likes: number;
  hasLiked: boolean;
  timeAgo: string;
  isPinned: boolean;
  preview: string;
  content?: string;
  comments?: Comment[];
}

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onLikePost: (postId: number) => void;
  onAddComment: (postId: number, comment: string) => void;
  onLikeComment: (postId: number, commentId: number) => void;
  onReplyToComment: (postId: number, commentId: number, reply: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onLikePost,
  onAddComment,
  onLikeComment,
  onReplyToComment,
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const { toast } = useToast();

  if (!post) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      Warning: "bg-red-100 text-red-800",
      Experience: "bg-blue-100 text-blue-800",
      Alert: "bg-orange-100 text-orange-800",
      Support: "bg-purple-100 text-purple-800",
      Analysis: "bg-green-100 text-green-800",
      Question: "bg-yellow-100 text-yellow-800",
    };
    return colors[category as keyof typeof colors] || colors.Experience;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Warning: AlertTriangle,
      Experience: MessageCircle,
      Alert: AlertTriangle,
      Support: Heart,
      Analysis: BarChart3,
      Question: HelpCircle,
    };
    const IconComponent =
      icons[category as keyof typeof icons] || MessageCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description:
          "Please sign in to post comments. Join the community to share your thoughts!",
        variant: "default",
      });
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(post.id, newComment.trim());
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
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

  const handleSubmitReply = async (commentId: number) => {
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

    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReplyToComment(post.id, commentId, replyText.trim());
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

  // Mock comments data - in real app this would come from props or API
  const mockComments: Comment[] = [
    {
      id: 1,
      author: "SafetyFirst",
      content:
        "Thank you for sharing this! I almost fell for a similar scam last week. Your post helped me recognize the red flags.",
      timeAgo: "2 hours ago",
      likes: 12,
      hasLiked: false,
      replies: [
        {
          id: 11,
          author: "CommunityHelper",
          content:
            "Glad this post helped! It's important we all look out for each other.",
          timeAgo: "1 hour ago",
          likes: 5,
          hasLiked: false,
        },
      ],
    },
    {
      id: 2,
      author: "TechExpert",
      content:
        "Great detailed analysis. I would also add that checking the sender's email domain is crucial - legitimate banks never use gmail or yahoo addresses.",
      timeAgo: "4 hours ago",
      likes: 8,
      hasLiked: true,
    },
    {
      id: 3,
      author: "ConcernedCitizen",
      content:
        "My elderly neighbor received a call exactly like this yesterday. I'm sharing this post with my apartment group immediately.",
      timeAgo: "6 hours ago",
      likes: 15,
      hasLiked: false,
    },
  ];

  const comments = post.comments || mockComments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl leading-tight">
            {post.title}
          </DialogTitle>
          <div className="flex items-start space-x-4 mt-4">
            <Avatar className="h-12 w-12">
              <div className="w-full h-full bg-gradient-to-br from-india-saffron to-saffron-600 flex items-center justify-center text-white font-semibold">
                {post.author.charAt(0)}
              </div>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2 flex-wrap">
                {post.isPinned && (
                  <Pin className="h-4 w-4 text-india-saffron" />
                )}
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryIcon(post.category)}
                  <span className="ml-1">{post.category}</span>
                </Badge>
                <span className="text-sm text-gray-500">by {post.author}</span>
                <span className="text-sm text-gray-500">•</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.timeAgo}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Post Content */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {post.content || post.preview}
            </p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center space-x-6 text-sm border-t border-b py-4">
            <button
              className={`flex items-center space-x-1 transition-colors ${
                post.hasLiked
                  ? "text-india-saffron"
                  : "text-gray-500 hover:text-india-saffron"
              }`}
              onClick={() => onLikePost(post.id)}
            >
              <ThumbsUp
                className={`h-4 w-4 ${post.hasLiked ? "fill-current" : ""}`}
              />
              <span>{post.likes} likes</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} comments</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Comments</h3>

            {/* Add Comment */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user ? user.email?.charAt(0).toUpperCase() : "U"}
                  </div>
                </Avatar>
                <div className="flex-1 space-y-2">
                  {user ? (
                    <>
                      <Textarea
                        placeholder="Share your thoughts on this discussion..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || isSubmitting}
                          size="sm"
                          className="bg-india-saffron hover:bg-saffron-600"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {isSubmitting ? "Posting..." : "Comment"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Sign in to join the discussion..."
                        disabled={true}
                        rows={3}
                        className="bg-gray-50"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            setAuthMode("signup");
                            setIsAuthModalOpen(true);
                          }}
                          size="sm"
                          className="bg-india-saffron hover:bg-saffron-600"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Sign in to Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                        {comment.author.charAt(0)}
                      </div>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <button
                          className={`flex items-center space-x-1 transition-colors ${
                            comment.hasLiked
                              ? "text-india-saffron"
                              : "text-gray-500 hover:text-india-saffron"
                          }`}
                          onClick={() => onLikeComment(post.id, comment.id)}
                        >
                          <ThumbsUp
                            className={`h-3 w-3 ${comment.hasLiked ? "fill-current" : ""}`}
                          />
                          <span>{comment.likes}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 text-gray-500 hover:text-india-saffron transition-colors"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id,
                            )
                          }
                        >
                          <Reply className="h-3 w-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder={`Reply to ${comment.author}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            disabled={isSubmitting}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyText.trim() || isSubmitting}
                              size="sm"
                              className="bg-india-saffron hover:bg-saffron-600"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {isSubmitting ? "Replying..." : "Reply"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex items-start space-x-3"
                            >
                              <Avatar className="h-6 w-6">
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                  {reply.author.charAt(0)}
                                </div>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {reply.author}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {reply.timeAgo}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {reply.content}
                                </p>
                                <button
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    reply.hasLiked
                                      ? "text-india-saffron"
                                      : "text-gray-500 hover:text-india-saffron"
                                  }`}
                                  onClick={() =>
                                    onLikeComment(post.id, reply.id)
                                  }
                                >
                                  <ThumbsUp
                                    className={`h-3 w-3 ${reply.hasLiked ? "fill-current" : ""}`}
                                  />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </Dialog>
  );
};

export default PostDetailModal;
