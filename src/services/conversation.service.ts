import type { Conversation, ConversationWithParticipant } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export class ConversationService {
  // Get user conversations from database - returns conversation with participant settings
  static async getUserConversations(userId: string): Promise<ConversationWithParticipant[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/participants/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Create group with real data in database
  static async createGroup(
    creatorId: string, 
    name: string, 
    memberIds: string[], 
    avatar?: string
  ): Promise<Conversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          type: 'group',
          name,
          memberIds,
          avatar: avatar || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Create conversation
  static async createConversation(creatorId: string, type: 'private' | 'group') {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId, type }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}
