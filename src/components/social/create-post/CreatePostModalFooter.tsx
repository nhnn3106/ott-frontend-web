import React from "react";

interface CreatePostModalFooterProps {
  onSubmit: () => void;
  canPost: boolean;
}

const CreatePostModalFooter: React.FC<CreatePostModalFooterProps> = ({
  onSubmit,
  canPost,
}) => {
  return (
    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
      <button
        onClick={onSubmit}
        disabled={!canPost}
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm">
        Đăng
      </button>
    </div>
  );
};

export default CreatePostModalFooter;
