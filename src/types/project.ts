import type { Tables, Enums } from "./database"

// プロジェクト基本型
export type Project = Tables<"projects">

// プロジェクトメンバー基本型
export type ProjectMember = Tables<"project_members">

// メンバーロール
export type MemberRole = Enums<"member_role">

// ダッシュボード用プロジェクト（メンバー数・ロール付き）
export type ProjectWithMeta = Project & {
  memberCount: number
  myRole: MemberRole
}

// ロールの日本語ラベル
export const roleLabels: Record<MemberRole, string> = {
  owner: "オーナー",
  editor: "編集者",
  viewer: "閲覧者",
}
