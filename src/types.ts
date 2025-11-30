export enum ResourceType {
  LINK = 'LINK',
  FILE = 'FILE',
  PDF = 'PDF',
  CODE = 'CODE',
  IMAGE = 'IMAGE'
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  tags: string[];
  dateAdded: string;
  isFeatured?: boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  content: string; // Markdown content
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  isFeatured?: boolean;
  videoUrl?: string; // YouTube or other embeddable URL
  relatedResourceIds?: string[];
}

export interface UserSettings {
  aiEnabled: boolean;
  geminiKey?: string;
  openaiKey?: string;
  claudeKey?: string;
  githubToken?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  settings: UserSettings;
}

export interface SerialPortState {
  connected: boolean;
  port: SerialPort | null;
  logs: string[];
}

// Web Serial API Types (Partial)
export interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream | null;
  writable: WritableStream | null;
}
