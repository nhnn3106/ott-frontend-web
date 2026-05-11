import React from "react";
import type { PostMediaItem } from "../types";
import PostMediaCarousel from "../PostMediaCarousel";
import PostMediaGrid from "../PostMediaGrid";

interface Props {
  content?: string;
  media: PostMediaItem[];
  totalLikes?: number;
  isInView?: boolean;
  variant?: "grid" | "carousel";
}

const PostBody: React.FC<Props> = ({
  content,
  media,
  totalLikes,
  isInView,
  variant = "grid",
}) => {
  const MediaComponent =
    variant === "carousel" ? PostMediaCarousel : PostMediaGrid;

  return (
    <>
      {content && (
        <p className="px-4 pb-3 text-gray-800 leading-relaxed">{content}</p>
      )}
      <MediaComponent
        media={media}
        totalLikes={totalLikes}
        isInView={isInView}
      />
    </>
  );
};

export default PostBody;
