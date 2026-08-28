export type Review = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  likeCount: number;
  publishedAt: Date;
  updatedAt?: Date;
};

export type ReviewSummary = Omit<Review, "content">;

export type ReviewComment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
};
