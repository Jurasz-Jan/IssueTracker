# Issue Tracker API

A Node.js-based API for tracking issues (problems) within specific projects, using PostgreSQL for data persistence. This API allows creating, reading, updating, and deleting (CRUD) issues for different projects.


## Features

- **POST** `/api/issues/:project`: Create a new issue for the specified project.
- **GET** `/api/issues/:project`: Retrieve all issues for the project, with optional filtering by fields like `open`, `assigned_to`, etc.
- **PUT** `/api/issues/:project`: Update one or more fields of an existing issue using its `_id`.
- **DELETE** `/api/issues/:project`: Delete an issue by its `_id`.

## API Endpoints

### 1. POST `/api/issues/:project`
- **Description**: Create a new issue for a project.
- **Request Body** (required fields):
  - `issue_title`: Title of the issue (string)
  - `issue_text`: Description of the issue (string)
  - `created_by`: Author of the issue (string)
- **Optional fields**:
  - `assigned_to`: Person the issue is assigned to (string)
  - `status_text`: Status of the issue (string)
- **Response**: Returns the created issue with all fields, including `_id`, `created_on`, `updated_on`, and `open`.

### 2. GET `/api/issues/:project`
- **Description**: Retrieve all issues for a project. Supports query parameters for filtering.
- **Query Parameters**: Any field of the issue can be passed as a query parameter for filtering (e.g., `open=false`).
- **Response**: Returns an array of issue objects for the project.

### 3. PUT `/api/issues/:project`
- **Description**: Update an existing issue.
- **Request Body** (fields to update):
  - `_id` (required): ID of the issue to update
  - One or more fields to update: `issue_title`, `issue_text`, `assigned_to`, `status_text`, `open`
- **Response**: Returns `{ result: 'successfully updated', '_id': _id }` on success.

### 4. DELETE `/api/issues/:project`
- **Description**: Delete an issue by its `_id`.
- **Request Body**:
  - `_id` (required): ID of the issue to delete
- **Response**: Returns `{ result: 'successfully deleted', '_id': _id }` on success.

## Database Schema

Table: `issues`

| Column       | Type              | Description                          |
|--------------|-------------------|--------------------------------------|
| `_id`        | `SERIAL PRIMARY KEY` | Unique identifier for the issue      |
| `project_name` | `VARCHAR(255)`     | Name of the project                  |
| `issue_title` | `VARCHAR(255)`     | Title of the issue                   |
| `issue_text`  | `TEXT`            | Description of the issue             |
| `created_by`  | `VARCHAR(255)`     | Author of the issue                  |
| `assigned_to` | `VARCHAR(255)`     | (Optional) Person assigned to the issue |
| `status_text` | `VARCHAR(255)`     | (Optional) Status of the issue       |
| `created_on`  | `TIMESTAMPTZ`      | Timestamp when the issue was created |
| `updated_on`  | `TIMESTAMPTZ`      | Timestamp when the issue was last updated |
| `open`        | `BOOLEAN`          | `true` for open, `false` for closed issues |


npm test
