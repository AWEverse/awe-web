export enum EAxis {
  None = 'None',
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

export enum EAxisList {
  None = 0,
  X = 1,
  Y = 2,
  Z = 4,

  Screen = 8,
  XY = EAxisList.X | EAxisList.Y,
  XZ = EAxisList.X | EAxisList.Z,
  YZ = EAxisList.Y | EAxisList.Z,
  XYZ = EAxisList.X | EAxisList.Y | EAxisList.Z,
  All = EAxisList.XYZ | EAxisList.Screen,

  // Alias over Axis YZ
  ZRotation = EAxisList.YZ,

  // Alias over Screen
  Rotate2D = EAxisList.Screen,
}
