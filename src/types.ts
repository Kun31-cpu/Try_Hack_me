export interface User {
  id: number;
  username: string;
  points: number;
  email?: string;
  avatar_url?: string;
  bio?: string;
  full_name?: string;
  member_since?: string;
  rank?: number;
  streak?: number;
  badges?: string[];
  calendly_link?: string;
  socials?: {
    discord?: string;
    twitter?: string;
    reddit?: string;
    instagram?: string;
    github?: string;
    website?: string;
    linkedin?: string;
  };
  completed_rooms?: number[]; // Array of room IDs
}

export interface Room {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  creator_id: number;
  creator_name?: string;
  machine_ip: string;
  image_url?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  category?: string;
  task_count?: number;
  tasks?: Task[];
  video1Url?: string;
  video1Title?: string;
  video1Enabled?: boolean;
  video2Url?: string;
  video2Title?: string;
  video2Enabled?: boolean;
  videoAutoplay?: boolean;
}

export interface Task {
  id: number;
  room_id: number;
  question: string;
  points: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  is_solved?: boolean;
}

export interface SubmissionResponse {
  status: 'correct' | 'incorrect' | 'already_solved';
  points?: number;
  message?: string;
}
