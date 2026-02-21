export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  imageUrl?: string;
  externalLink?: string;
  content?: string;
  createdAt: string;
}

export interface Tip {
  id: string;
  content: string;
  title?: string;
  category?: string;
  createdAt: string;
}

export interface EducationData {
  guides: Guide[];
  tip: Tip | null;
}
