# ARLearn Context (v2.1)
RN 0.73.6 | Supabase | Viro AR 2.41.3 | Win/Android (OP7T)

## 🔑 AUTH (Triple-Key)
- **Role**: Admin, Teacher, Student. Public signup OFF.
- **Login**: (School Code, Class Name, Username) -> `u.c.s@arlearn.local`.
- **Security**: Mandatory pwd reset on 1st login.
- **Admin**: `Sarthak2004` / `Sarthak@2004` (Bypass).

## 🏰 OPS & AR
- **Admin**: Manage Users, Schools, Classes. Modal pickers for selection.
- **AR**: Viro. Surface, Drag, Scale, Rotate. Camera perm (Android 11+).
- **Models**: .glb/.gltf in `ar-models` bucket. Strict category matching.

## 📂 DB SCHEMA
- **profiles**: id, name, email, role, school_id, class_name, username, must_change_password
- **schools**: id, name, code (unique)
- **classes**: id, school_id, class_name
- **ar_models**: id, title, description, category, model_url, teacher_id

---
*npx react-native run-android*

