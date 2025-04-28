import { MAX_INT32 } from '@/lib/core';

// Participants limits
export const MAX_PARTICIPANTS = 200_000;
export const MAX_PARTICIPANTS_BROADCAST_GROUP = MAX_INT32; // Unlimited

// Admin limits in groups
export const MAX_GROUP_ADMINS = 50;

// Bots limits in groups
export const MAX_GROUP_BOTS = 20;

// Pinned chats limits in main list
export const MAX_PINNED_CHATS = 5;
export const MAX_PINNED_SECRET_CHATS = 5;
export const MAX_PINNED_CHATS_PREMIUM = 10;

// Group name and description length
export const MAX_GROUP_NAME_LENGTH = 255;
export const MAX_GROUP_DESCRIPTION_LENGTH = 255;

// Message editing constraints
export const MESSAGE_EDITING_PERIOD = 48 * 60 * 60; // 48 hours in seconds
export const MESSAGE_EDITING_SAVED_UNLIMITED = MAX_INT32; // Unlimited in Saved and for admins with pinning rights

// Photo and video self-destruction
export const MIN_SELF_DESTRUCTION_TIME = 1; // in seconds
export const MAX_SELF_DESTRUCTION_TIME = 60; // in seconds

// Recent actions period
export const RECENT_ACTIONS_PERIOD = 2 * 24 * 60 * 60; // Last two days in seconds

// Mentions number in a single message
export const MAX_MENTIONS_IN_MESSAGE = 50;
export const MAX_MENTION_NOTIFICATIONS = 5; // Only first 5 from list will receive notification

// Visible messages number in group
export const VISIBLE_MESSAGES_IN_GROUP = 1_000_000; // Last messages

// Pinned messages number
export const MAX_PINNED_MESSAGES = MAX_INT32; // Unlimited

// Number of members to see statistics
export const MIN_MEMBERS_FOR_STATISTICS = 500;

// Username change reservation time
export const USERNAME_CHANGE_RESERVATION_TIME = 15 * 60; // Approx 15-30 minutes in seconds

// Group-promoted stickers
export const MIN_GROUP_SIZE_FOR_PROMOTED_STICKERS = 100; // Participants

// Admin role length
export const MAX_ADMIN_ROLE_LENGTH = 16; // Characters

// Chat title length
export const MAX_CHAT_TITLE_LENGTH = 128; // Characters

// Converting a supergroup to broadcast group
export const SUPERGROUP_CONVERT_LIMIT = 199_000; // Members

// Read receipts lifetime
export const MAX_READ_RECEIPTS_LIFETIME = 7 * 24 * 60 * 60; // 7 days in seconds

// Read receipts availability
export const MAX_MEMBERS_FOR_READ_RECEIPTS = 100; // Available for chats with 100 members or less
