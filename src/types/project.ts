import type { Tables, Enums } from "./database"

// プロジェクト基本型
export type Project = Tables<"projects">

// プロジェクトメンバー基本型
export type ProjectMember = Tables<"project_members">

// プロジェクトタグ基本型
export type ProjectTag = Tables<"project_tags">

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

// プロジェクト + タグ一覧
export type ProjectWithTags = Project & {
  tags: string[]
}

// プロファイル型
export type Profile = Tables<"profiles">

// メンバー + プロファイル情報
export type ProjectMemberWithProfile = ProjectMember & {
  profile: Profile
}

// ユーザー検索結果
export type UserSearchResult = {
  id: string
  displayName: string | null
  avatarUrl: string | null
}
