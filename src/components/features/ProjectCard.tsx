import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { Users } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProjectWithMeta, MemberRole } from "@/types/project"
import { roleLabels } from "@/types/project"

type Props = {
  project: ProjectWithMeta
}

// ロールに応じたバッジのバリアント
const roleVariants: Record<MemberRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  editor: "secondary",
  viewer: "outline",
}

export function ProjectCard({ project }: Props) {
  const updatedAt = formatDistanceToNow(new Date(project.updated_at), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            <Badge variant={roleVariants[project.myRole]}>
              {roleLabels[project.myRole]}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || "説明はありません"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1" />
        <CardFooter className="justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.memberCount}</span>
          </div>
          <span>{updatedAt}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
