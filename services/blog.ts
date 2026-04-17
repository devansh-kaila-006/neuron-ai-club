
import { supabase } from '../lib/storage.ts';
import { BlogPost, BlogCategory, ApiResponse } from '../lib/types.ts';

export const blogService = {
  async getPosts(category?: BlogCategory): Promise<BlogPost[]> {
    if (!supabase) return [];

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Neural Archive Read Error:", error);
      return [];
    }

    return data as BlogPost[];
  },

  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'author_name'>): Promise<ApiResponse<BlogPost>> {
    if (!supabase) return { success: false, status: 500, error: "Neural Grid Offline." };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, status: 401, error: "Unauthorized: Neural Link required." };

    const newPost = {
      ...post,
      author_id: user.id,
      author_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Anonymous',
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([newPost])
      .select()
      .single();

    if (error) {
      console.error("Neural Archive Write Error:", error);
      return { success: false, status: 500, error: error.message };
    }

    return { success: true, status: 201, data: data as BlogPost };
  },

  async deletePost(id: string): Promise<ApiResponse> {
    if (!supabase) return { success: false, status: 500, error: "Neural Grid Offline." };

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Neural Archive Deletion Error:", error);
      return { success: false, status: 500, error: error.message };
    }

    return { success: true, status: 200 };
  },

  async signIn(email: string, password?: string) {
    if (!supabase) throw new Error("Neural Grid Offline.");
    
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } else {
      // Fallback to Magic Link if no password provided (optional, but keeping it robust)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/blog'
        }
      });
      if (error) throw error;
      return { success: true };
    }
  },

  async signUp(email: string, password: string, fullName: string) {
    if (!supabase) throw new Error("Neural Grid Offline.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: window.location.origin + '/blog'
      }
    });

    if (error) throw error;
    return { success: true, user: data.user };
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
