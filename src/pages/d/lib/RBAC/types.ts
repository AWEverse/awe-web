export type Permission =
  | "read"
  | "post"
  | "reply"
  | "report"
  | "ban"
  | "edit_forum"
  | "edit_category"
  | "delete_topic"
  | "delete_forum";

export interface Role {
  id: string;
  name: string;
  permissions: ContextualPermission[];
  inheritsFrom?: string[];
}

export interface ContextualPermission {
  action: Permission;
  conditions?: {
    ownOnly?: boolean;
    timeLimitHours?: number;
    voteThreshold?: number;
  };
}
