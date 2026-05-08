export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: 'student' | 'teacher' | 'admin';
  school_id: string;
  class_name?: string;
  roll_number?: string;
  parent_mobile?: string;
  personal_detail_1?: string;
  personal_detail_2?: string;
  dob?: string;
  must_change_password?: boolean;
  created_at: string;
}

export interface ARModel {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  model_url: string;
  thumbnail_url?: string;
  teacher_id: string;
  created_at: string;
  profiles?: {name: string};
}

export interface School {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  class_name: string;
  created_at: string;
}

export type Category = 'alphabets' | 'numbers' | 'shapes' | 'animals';

export interface CategoryItem {
  id: Category;
  label: string;
  icon: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ChangePassword: undefined;
  StudentRoot: undefined;
  TeacherRoot: undefined;
  AdminRoot: undefined;
  StudentHome: undefined;
  TeacherHome: undefined;
  AdminDashboard: undefined;
  ARView: {model: ARModel};
  CategoryDetail: {category: Category; models: ARModel[]};
  UploadModel: undefined;
  ARModels: undefined;
  ManageUsers: undefined;
};
