import {findIssueById, findAllIssues} from "../repository/issue.repository";
import type {Issue, IssueStatus} from "../types/issues.types";

export const getAllIssues = async (status?: IssueStatus): Promise<Issue[]> =>{
    const issues = await findAllIssues();
    if (status) {
        return issues.filter((issue) => issue.status === status);
    }
    return issues;
}

export const getIssueById = async (id: string): Promise<Issue | null> => {
    const issue = await findIssueById(id);
    return issue;
}

//are just db commands , commands logic are stored in repository and the service layer is just a wrapper around the repository layer to provide a clean interface for the controllers to interact with the repository layer.