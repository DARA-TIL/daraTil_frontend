export type ActivityAction =
  | "lesson_completed"
  | "folklore_liked"
  | "folklore_disliked"
  | "folklore_read"
  | (string & {});

export interface ActivityItem {
  action: ActivityAction;
  entityID: number;
  entityType: string;
  id: number;
  time: string;
  userID: number;
}
