// Message length constraints
export const MAX_MESSAGE_LENGTH = 4096;

// Media captions constraints
export const MAX_MEDIA_CAPTION_LENGTH = 1024; // Regular users
export const MAX_MEDIA_CAPTION_LENGTH_PREMIUM = 2048; // Premium users

// File size limit
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB in bytes
export const MAX_FILE_SIZE_PREMIUM = 4 * 1024 * 1024 * 1024; // 4 GB in bytes

// File name length limit
export const MAX_FILE_NAME_LENGTH = 60; // Characters

// Video message duration constraint
export const MAX_VIDEO_MESSAGE_DURATION = 60; // in seconds (1 minute)

// Images and videos in a single message (album)
export const MAX_MEDIA_ITEMS_IN_ALBUM = 10;

// Scheduled messages constraints
export const MAX_SCHEDULED_MESSAGES_PER_CHAT = 100;
export const MAX_SCHEDULE_RANGE = 365; // in days
