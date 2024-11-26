export interface Database {
  public: {
    Tables: {
      petugas: {
        Row: {
          id: number
          username: string
          password: string
          created_at: string
        }
      }
      foto: {
        Row: {
          id: number
          file: string
          judul: string
          galery_id: number
        }
      }
      galery: {
        Row: {
          id: number
          post_id: number
          position: number
          status: number
        }
      }
      posts: {
        Row: {
          id: number
          judul: string
          kategori_id: number
          isi: string
          petugas_id: number
          status: string
          created_at: string
        }
      }
      kategori: {
        Row: {
          id: number
          judul: string
        }
      }
    }
  }
} 