import type { Conversation, ConversationWithParticipant } from '../types';

export interface SidebarProps {
  onConversationSelect?: (item: ConversationWithParticipant) => void;
  selectedConversationId?: string;
  className?: string;
}
