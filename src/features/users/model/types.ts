export type UserProgressDto = {
  XpForNextLevel: number;
  XpTotal: number;
  id: number;
  level: number;
  userID: number;
};

export type UserDto = {
  authProvider: string;
  avatar: string;
  email: string;
  id: number;
  password?: string;
  progress?: UserProgressDto | null;
  role: string;
  username: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  authProvider: string;
  progress: {
    id: number;
    level: number;
    xpTotal: number;
    xpForNextLevel: number;
    userID: number;
  } | null;
};

export type UserUpdateDto = Partial<{
  avatar: string;
  password: string;
  role: string;
  username: string;
}>;
