# Database Design

The MVP currently implements these collections:

1. Users
2. Workspaces
3. Projects
4. Tasks
5. Comments
6. Sessions

Planned production collections:

7. Boards
8. Columns
9. Notifications
10. Messages
11. Roles
12. Permissions
13. Attachments
14. Meetings
15. Calendar Events
16. Activity Logs
17. AI History
18. Settings
19. Invitations
20. Refresh Tokens
21. Analytics Snapshots
22. Audit Events
23. Sprint Plans
24. Documents
25. Webhooks

## Core Relationships

- User has many workspace memberships.
- Workspace has many projects.
- Project has many tasks.
- Task has comments, attachments, subtasks, labels, and activity events.
- Session belongs to a user and stores refresh-token metadata.
