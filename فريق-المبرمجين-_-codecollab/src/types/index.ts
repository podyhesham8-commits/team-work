export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: string;
}

export type TableCategory = 'web' | 'mobile' | 'fullstack' | 'ai' | 'backend' | 'game' | 'general';

export interface TableItem {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  maxMembers: number;
  category: TableCategory;
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  memberCount: number;
  memberIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TableMember {
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface CodeFile {
  id: string;
  name: string;
  language: 'html' | 'javascript' | 'typescript' | 'css' | 'python' | 'json' | 'markdown';
  content: string;
  lastModifiedBy: string;
  lastModifiedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  reactions?: Record<string, string[]>;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocItem {
  id: string;
  title: string;
  content: string;
  category: 'spec' | 'api' | 'guide' | 'notes';
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommitItem {
  id: string;
  message: string;
  authorId: string;
  authorName: string;
  filesCount: number;
  snapshotSummary?: string;
  createdAt: string;
}
