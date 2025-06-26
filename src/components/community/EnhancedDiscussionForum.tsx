import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  ThumbsUp,
  Clock,
  Pin,
  Search,
  Filter,
  Users,
  TrendingUp,
  Lock,
  Plus,
  RefreshCw,
  AlertTriangle,
  Eye,
  MessageSquare,
  Heart,
  Award,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
} from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import EnhancedSearchResultModal from "@/components/search/EnhancedSearchResultModal";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { useCommunityPosts } from "@/hooks/useCRUD";
import { format, formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface PostDetailModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPost: any) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!post) return null;

  // Convert post to SearchResult format for the enhanced modal
  const searchResult = {
    id: post.id,
    type: "post" as const,
    title: post.title,
    description: post.content,
    status: "published",
    location: post.location || "India",
    date: new Date(post.created_at),
    reportedBy: post.users?.full_name || "Anonymous",
    comments: post.comment_count || 0,
    likes: post.like_count || 0,
    hasLiked: post.user_has_liked || false,
    details: {
      category: post.community_categories?.name,
      tags: post.tags,
      author: {
        name: post.users?.full_name || "Anonymous",
        avatar: post.user_profiles?.profile_picture_url,
        reputation: post.user_profiles?.reputation_score || 0,
        verified: post.users?.is_verified || false,
      },
    },
  };

  return (
    <EnhancedSearchResultModal
      isOpen={isOpen}
      onClose={onClose}
      result={searchResult}
      onUpdate={(updatedResult) => {
        onUpdate({
          ...post,
          like_count: updatedResult.likes,
          comment_count: updatedResult.comments,
        });
      }}
    />
  );
};

const EnhancedDiscussionForum = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { toast } = useToast();

  // Filter configuration
  const filters = {
    ...(selectedCategory !== "All" && {
      post_type: selectedCategory.toLowerCase(),
    }),
    ...(searchTerm && { search: searchTerm }),
  };

  // Use CRUD hook for posts
  const {
    data: posts,
    loading,
    error,
    refresh,
    toggleLike,
    pagination,
  } = useCommunityPosts(filters);

  const requireAuth = (action: string, callback: () => void) => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: `Please sign in to ${action}. Join the community to participate in discussions!`,
        variant: "default",
      });
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return;
    }
    callback();
  };

  const handleLike = async (postId: string) => {
    requireAuth("like posts", async () => {
      try {
        await toggleLike(postId);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update like status. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsPostDetailOpen(true);
  };

  const handleCreatePost = async (newPostData: {
    title: string;
    content: string;
    category: string;
    author: string;
  }) => {
    if (!user) return;

    try {
      // This would be handled by the CreatePostModal using the CRUD hook
      await refresh();
      toast({
        title: "Discussion Created!",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    await refresh();
    toast({
      title: "Refreshed",
      description: "Forum data has been updated.",
    });
  };

  const categories = [
    {
      name: "All",
      count: posts.length,
      color: "bg-gray-100 text-gray-800",
    },
    {
      name: "Discussion",
      count: posts.filter((p) => p.post_type === "discussion").length,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Warning",
      count: posts.filter((p) => p.post_type === "warning").length,
      color: "bg-red-100 text-red-800",
    },
    {
      name: "Question",
      count: posts.filter((p) => p.post_type === "question").length,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      name: "Tip",
      count: posts.filter((p) => p.post_type === "tip").length,
      color: "bg-green-100 text-green-800",
    },
    {
      name: "News",
      count: posts.filter((p) => p.post_type === "news").length,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      warning: "bg-red-100 text-red-800",
      discussion: "bg-blue-100 text-blue-800",
      question: "bg-yellow-100 text-yellow-800",
      tip: "bg-green-100 text-green-800",
      news: "bg-purple-100 text-purple-800",
    };
    return (
      colors[category.toLowerCase() as keyof typeof colors] || colors.discussion
    );
  };

  const getPostTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "question":
        return <MessageCircle className="h-4 w-4" />;
      case "tip":
        return <Heart className="h-4 w-4" />;
      case "news":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  if (error) {
    return (
      <section className="max-w-4xl mx-auto">
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to Load Forum
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="text-center mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          Community Forum
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Share experiences, ask questions, and help others stay safe from
          fraud.
        </p>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-xs lg:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{posts.length} discussions</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>
              {posts.reduce((sum, post) => sum + (post.comment_count || 0), 0)}{" "}
              comments
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>
              {posts.reduce((sum, post) => sum + (post.like_count || 0), 0)}{" "}
              likes
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Controls - Responsive layout */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {user ? (
                <CreatePostModal onCreatePost={handleCreatePost} />
              ) : (
                <Button
                  onClick={() => {
                    setAuthMode("signup");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    Sign in to Create Post
                  </span>
                  <span className="sm:hidden">Sign in to Post</span>
                </Button>
              )}

              <Dialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Browse Categories</span>
                    <span className="sm:hidden">Categories</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Browse Discussion Categories</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Select a category to filter discussions or search across
                      all posts.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((category) => (
                        <Card
                          key={category.name}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCategory === category.name
                              ? "ring-2 ring-indigo-500 border-indigo-500"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedCategory(category.name);
                            setIsCategoryDialogOpen(false);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {category.count} discussions
                                </p>
                              </div>
                              <Badge className={category.color}>
                                {category.count}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Showing:</span>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => setSelectedCategory("All")}
            >
              {selectedCategory}
              {selectedCategory !== "All" && " ×"}
            </Badge>
            {searchTerm && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSearchTerm("")}
              >
                "{searchTerm}" ×
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              ({posts.length} discussion{posts.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No discussions found
                </h3>
                <p className="text-sm">
                  {searchTerm
                    ? `No discussions match "${searchTerm}"`
                    : `No discussions in ${selectedCategory} category`}
                </p>
                <div className="mt-4 space-x-2">
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  )}
                  {selectedCategory !== "All" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory("All")}
                    >
                      View all categories
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={post.user_profiles?.profile_picture_url}
                        alt={post.users?.full_name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                        {(post.users?.full_name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.is_pinned && (
                          <Pin className="h-4 w-4 text-indigo-600" />
                        )}
                        <Badge className={getCategoryColor(post.post_type)}>
                          {getPostTypeIcon(post.post_type)}
                          <span className="ml-1 capitalize">
                            {post.post_type}
                          </span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          by {post.users?.full_name || "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(post.created_at)}
                        </div>
                      </div>

                      <h3
                        className="text-base lg:text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2"
                        onClick={() => handlePostClick(post)}
                      >
                        {post.title}
                      </h3>

                      <p className="text-gray-600 line-clamp-2 text-sm lg:text-base">
                        {post.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-sm text-gray-500">
                        <div
                          className="flex items-center hover:text-indigo-600 cursor-pointer transition-colors"
                          onClick={() => handlePostClick(post)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comment_count || 0} replies
                        </div>
                        <div
                          className={`flex items-center cursor-pointer transition-colors ${
                            post.user_has_liked
                              ? "text-indigo-600"
                              : "hover:text-indigo-600"
                          }`}
                          onClick={() => handleLike(post.id)}
                        >
                          <ThumbsUp
                            className={`h-4 w-4 mr-1 ${post.user_has_liked ? "fill-current" : ""}`}
                          />
                          {post.like_count || 0} likes
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.view_count || 0} views
                        </div>
                      </div>
                    </div>

                    {/* Post actions menu */}
                    {user &&
                      (user.id === post.user_id ||
                        user.user_role === "admin") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => pagination.setPage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                size="sm"
              >
                <ArrowUp className="h-4 w-4 mr-1 rotate-[-90deg]" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => pagination.setPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                size="sm"
              >
                Next
                <ArrowDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isPostDetailOpen}
        onClose={() => {
          setIsPostDetailOpen(false);
          setSelectedPost(null);
        }}
        onUpdate={(updatedPost) => {
          setSelectedPost(updatedPost);
          // Refresh to get updated data
          refresh();
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </section>
  );
};

export default EnhancedDiscussionForum;
