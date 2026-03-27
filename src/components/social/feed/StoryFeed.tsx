import React, { useEffect, useState } from "react";
import type { StoryItem } from "../types";
import StoryReel from "../StoryReel";
import { fetchStories } from "../../../services/story.service";

interface Props {
  currentUserAvatar: string;
}

export const StoryFeed: React.FC<Props> = ({ currentUserAvatar }) => {
  const [stories, setStories] = useState<StoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await fetchStories();
      if (isMounted) setStories(data);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return <StoryReel stories={stories} currentUserAvatar={currentUserAvatar} />;
};

export default StoryFeed;
