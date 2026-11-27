import type {Issue} from "../types/issues.types";


//an inmemory db for now, as we  havnt implemented a real db yet, we will use this array to store issues and then we will use this array to perform CRUD operations on issues.

const issues: Issue[] = [
    {
        id: "1",
        title: "Issue 1",
        repo_name: "repo1",
        description: "This is issue 1",
        status: "open",
        priority: "low",
        created_at: new Date(),
        updated_at: new Date(),
    },
]


//temportary functions to perform CRUD operations on issues, these functions will be replaced by real db queries once we implement a real db.
export const getAllIssues = async():Promise<Issue[]> => {
    return [...issues];
}
//return type is Promise<Issue | null> because we are returning a single issue or null if the issue is not found.
//[...issues] is used to return a copy of the issues array instead of returning the original array, this is done to prevent accidental modification of the original array from outside the repository.

export const getIssueById = async(id:string): Promise<Issue | null> => {
    const issue = issues.find((i) => i.id === id);
    return issue || null;
}