//defining types of issues and exporting them to be used in other files

export type IssueStatus = "open" | "closed" | "in_progress" | "resolved" | "merged";
export type IssuePriority = "low" | "medium" | "high" | "critical";

export interface Issue {
    id:string;
    title:string;
    repo_name:string;
    description:string;
    status:IssueStatus;
    priority:IssuePriority;
    created_at:Date;
    updated_at:Date;
}