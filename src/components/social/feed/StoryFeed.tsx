import React from "react";
import type { StoryItem } from "../types";
import StoryReel from "../StoryReel";

interface Props {
  stories: StoryItem[];
  currentUserAvatar: string;
}

export const StoryFeed: React.FC<Props> = ({ stories, currentUserAvatar }) => (
  <StoryReel stories={stories} currentUserAvatar={currentUserAvatar} />
);

export default StoryFeed;
