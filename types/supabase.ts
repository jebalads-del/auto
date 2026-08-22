export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          email: string;
          password: string;
          role: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          email: string;
          password: string;
          role?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          email?: string;
          password?: string;
          role?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      cars: {
        Row: {
          id: number;
          images: string | null;
          image_url: string | null;
          image: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          images?: string | null;
          image_url?: string | null;
          image?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          images?: string | null;
          image_url?: string | null;
          image?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}
