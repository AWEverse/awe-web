enum OnlineStatus {
  OFFLINE = 0,
  ONLINE = 1,
  IDLE = 2,
  BUSY = 3,
  DND = 4, // That means "Do not disturb me"
  INVISIBLE = 5,
  UNKNOWN = 6,
  AWAY = 7, // Setup in setting by user
  CUSTOM = 8,
}

export default OnlineStatus;
