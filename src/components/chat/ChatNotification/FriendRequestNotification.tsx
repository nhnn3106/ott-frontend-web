import React from "react";
import { UserPlus } from "lucide-react";
import { BaseNotification } from "./BaseNotification";

interface FriendRequestNotificationProps {
  content: string;
}

export const FriendRequestNotification: React.FC<FriendRequestNotificationProps> = ({
  content,
}) => {
  return (
    <BaseNotification
      icon={<UserPlus size={14} className="text-primary-500" />}
      content={content}
      badgeClassName="bg-primary-50 border-primary-100 text-primary-600"
    />
  );
};
