/**
 * Enum representing different types of chat.
 */
export enum EChatType {
  private = 0x01, // Личный чат
  group, // Групповой чат
  channel, // Канал
  multiChannel, // Мультиканал
  server, // Сервер
  public, // Публичный чат
  support, // Чат поддержки
  chatbot, // Чат-бот
  secret, // Тайный чат
  service, // Служебный чат
}

/**
 * Enum representing different types of messages.
 */

export enum EMessageType {
  sticker = 'sticker', // Стикер
  voice = 'voice', // Голосовое сообщение
  video = 'video', // Видеосообщение
  image = 'image', // Изображение
  file = 'file', // Файл
  text = 'text', // Текстовое сообщение
  document = 'document', // Документ
  animation = 'animation', // Анимация
  audio = 'audio', // Аудиофайл
  photo = 'photo', // Фото
  location = 'location', // Геолокация
  contact = 'contact', // Контакт
  poll = 'poll', // Опрос
  venue = 'venue', // Место
  videoNote = 'video_note', // Видеозаметка

  // Service messages
  successfulPayment = 'successful_payment', // Успешный платеж
  callbackQuery = 'callback_query', // Callback-запрос
  inlineQuery = 'inline_query', // Inline-запрос
  newChatMembers = 'new_chat_members', // Новые участники чата
  leftChatMember = 'left_chat_member', // Ушедший участник
  newChatTitle = 'new_chat_title', // Новое название чата
  newChatPhoto = 'new_chat_photo', // Новое фото чата
  deleteChatPhoto = 'delete_chat_photo', // Удаление фото чата
  groupChatCreated = 'group_chat_created', // Создание группового чата
  supergroupChatCreated = 'supergroup_chat_created', // Создание супергруппы
  channelChatCreated = 'channel_chat_created', // Создание канала
  migrateToSupergroup = 'migrate_to_supergroup', // Миграция в супергруппу
  migrateFromSupergroup = 'migrate_from_supergroup', // Миграция из супергруппы
  pinnedMessage = 'pinned_message', // Закрепленное сообщение

  customForwardedMessage = 'custom_forwarded_message', // Нестандартное пересланное сообщение
}

/**
 * Enum representing different types of message reactions.
 */
export enum EMessageReactionType {
  emoji = 'emoji', // Эмоджи
  like = 'like', // Лайк
}
