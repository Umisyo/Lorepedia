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
import { JoinProjectButton } from "@/components/features/JoinProjectButton"
import type { ExploreProject } from "@/types/project"

type Props = {
  project: ExploreProject
  isLoggedIn: boolean
}

export function ExploreProjectCard({ project, isLoggedIn }: Props) {
  const updatedAt = formatDistanceToNow(new Date(project.updated_at), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <Card className="flex h-full flex-col transition-colors hover:border-primary/50">
      <Link href={`/projects/${project.id}`} className="flex-1">
        <CardHeader>
          <CardTitle className="line-clamp-1">{project.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {project.description || "説明はありません"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="flex-col gap-3 border-t pt-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.memberCount}</span>
          </div>
          {project.ownerName && (
            <span className="truncate">{project.ownerName}</span>
          )}
          <span>{updatedAt}</span>
        </div>
        <div className="w-full">
          <JoinProjectButton
            projectId={project.id}
            isMember={project.isMember}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
