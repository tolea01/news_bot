export interface NewsReadDto {
  userId: number;
  newsId: number;
  read_at: Date;
}

export interface NewsDto {
  title: string;
  content: string;
  description: string | null;
  author: string | null;
}
