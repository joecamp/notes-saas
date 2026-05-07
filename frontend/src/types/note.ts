export interface ContentItem {
  id: number;
  text: string;
  order: number;
  isStarred: boolean;
}

export interface Note {
  id: number;
  title: string;
  contentItems: ContentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNote {
  title: string;
}

export interface UpdateNote {
  title: string;
  contentItems: string[];
}

export interface PatchContentItem {
  text?: string;
  isStarred?: boolean;
  order?: number;
}

export interface PatchNote {
  title?: string;
  contentItems?: string[];
}
