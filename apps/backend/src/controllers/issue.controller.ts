// Controllers read request data, call services, and send HTTP responses.
import type { Request, Response } from "express";
import { getAllIssues, getIssueById } from "../services/issue.service";
import type { IssueStatus } from "../types/issues.types";

// Only these status values are accepted from the request query.
const VALID_STATUSES = new Set<string>(["open", "in_progress", "closed", "resolved", "merged"]);
//why a set is used here instead of an array?
// A Set is used here instead of an array because it provides O(1) average time complexity for lookups, making it efficient to check if a given status value is valid. In contrast, an array would require O(n) time complexity for lookups, which could be slower as the number of valid statuses increases. Using a Set ensures that the validation of status values is fast and efficient.
export const getIssueHandler = async(
    _req: Request,
     res: Response
    ): Promise<void> =>{
        const rawStatus = _req.query.status;
        let status: IssueStatus | undefined;

        if (rawStatus !== undefined) {
            // Reject repeated or unknown status values instead of silently ignoring them.
            if (typeof rawStatus !== "string" || !VALID_STATUSES.has(rawStatus)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                });
                return;
            }
            //what does "as" do in typescript?
            // The "as" keyword in TypeScript is a type assertion that tells the compiler to treat a value as a specific type. In this case, it asserts that rawStatus is of type IssueStatus, allowing the code to safely use it as such.
            status = rawStatus as IssueStatus;
        }

        // Ask the service for all issues, optionally filtered by status.
        const issues = await getAllIssues(status);
        res.status(200).json({
            success: true,
            data: issues,
        });


    }

export const getIssueByIdHandler = async(
    _req: Request,
    res: Response
): Promise<void> => {
    const id = _req.params.id;
    if (typeof id !== "string" || id.length === 0) {
        // A missing or malformed route parameter is a bad request.
        res.status(400).json({
            success: false,
            message: "Invalid issue id",
        });
        return;
    }

    // Look up the issue and return 404 if the service finds no match.
    const issue = await getIssueById(id);
    if (!issue) {
        res.status(404).json({
            success: false,
            message: "Issue not found",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: issue,
    });
};