export interface IUserProgress {
  id: number;
  level: number;
  xpTotal: number;
  xpForNextLevel: number;
  userID: number;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  authProvider: string;
  progress: IUserProgress | null;
}
