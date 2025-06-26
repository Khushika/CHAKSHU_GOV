// Legacy SearchResultModal - redirects to Enhanced version for better responsive design
import React from "react";
import EnhancedSearchResultModal from "./EnhancedSearchResultModal";

interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  onUpdate?: (updatedResult: any) => void;
}

const SearchResultModal: React.FC<SearchResultModalProps> = (props) => {
  // Use the enhanced version for better responsive design and CRUD operations
  return <EnhancedSearchResultModal {...props} />;
};

export default SearchResultModal;
