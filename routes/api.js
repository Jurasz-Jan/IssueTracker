'use strict';

module.exports = function (app) {
  const { Pool } = require('pg');  
  const connectionString = process.env.CONNECTION_STRING;

  
  const pool = new Pool({
    connectionString: connectionString,
  });

  
  pool.connect()
    .then(() => {
      console.log('Connected to the database');

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS issues (
          _id SERIAL PRIMARY KEY,
          project_name VARCHAR(255) NOT NULL,
          issue_title VARCHAR(255) NOT NULL,
          issue_text TEXT NOT NULL,
          created_by VARCHAR(255) NOT NULL,
          assigned_to VARCHAR(255),
          status_text VARCHAR(255),
          created_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          open BOOLEAN DEFAULT TRUE
        );
      `;

      
      return pool.query(createTableQuery);
    })
    .then(() => {
      console.log('Table created or already exists');
    })
    .catch(err => {
      console.error('Error creating table', err.stack);
    });

  
  app.route('/api/issues/:project')

  .get(async function (req, res) {
    const project = req.params.project;
    const queryParams = req.query; 
  
    try {
      
      let query = `SELECT * FROM issues WHERE project_name = $1`;
      const params = [project];
      let paramCount = 2;
  
      
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined) {
          query += ` AND ${key} = $${paramCount}`;
          params.push(queryParams[key]);
          paramCount++;
        }
      });
  
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching issues', err.stack);
      res.status(500).json({ error: 'Error fetching issues' });
    }
  })
  

  .post(async function (req, res) {
    const project = req.params.project;
  
    
    const { issue_title, issue_text, created_by, assigned_to = "", status_text = "" } = req.body;
    
    if (typeof issue_title !== 'string' || 
      typeof issue_text !== 'string' || 
      typeof created_by !== 'string' || 
      !issue_title || !issue_text || !created_by) {
      return res.status(200).json({ error: 'required field(s) missing' });
    }
  
    const open = true;
    try {
      
      const result = await pool.query(
        `INSERT INTO issues (project_name, issue_title, issue_text, created_by, assigned_to, status_text, open)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open;`,
        [project, issue_title, issue_text, created_by, assigned_to, status_text, open]
      );
  
      const issue = result.rows[0];
  
      res.json({
        _id: issue._id,
        issue_title: issue.issue_title,
        issue_text: issue.issue_text,
        created_by: issue.created_by,
        assigned_to: issue.assigned_to || "",
        status_text: issue.status_text || "",
        created_on: issue.created_on,
        updated_on: issue.updated_on,
        open: issue.open
      });
    } catch (err) {
      console.error('Error inserting issue', err.stack);
      res.status(500).json({ error: 'Error inserting issue' });
    }
  })
  

  .put(async function (req, res) {
    const project = req.params.project;
    const { _id, issue_title, issue_text, assigned_to, status_text, open } = req.body;
  
    
    if (!_id) {
      return res.status(200).json({ error: 'missing _id' });
    }
    
    try {
      const updates = [];
      const params = [];
      
      
      if (issue_title) {
        updates.push(`issue_title = $${params.length + 1}`);
        params.push(issue_title);
      }
      if (issue_text) {
        updates.push(`issue_text = $${params.length + 1}`);
        params.push(issue_text);
      }
      if (assigned_to) {
        updates.push(`assigned_to = $${params.length + 1}`);
        params.push(assigned_to);
      }
      if (status_text) {
        updates.push(`status_text = $${params.length + 1}`);
        params.push(status_text);
      }
      if (open !== undefined) {
        updates.push(`open = $${params.length + 1}`);
        params.push(open);
      }
  
      params.push(_id, project);
  
      if (updates.length === 0) {
        return res.status(200).json({ error: 'no update field(s) sent', _id });
      }
  
      const updateQuery = `
  UPDATE issues
  SET ${updates.join(', ')}, updated_on = CURRENT_TIMESTAMP
  WHERE _id = $${params.length - 1} AND project_name = $${params.length} RETURNING *;
`;
  
      const result = await pool.query(updateQuery, params);
  
      if (result.rowCount === 0) {
        return res.status(200).json({ error: 'could not update', '_id': _id });
      }
  
      res.json({ result: 'successfully updated', _id });
    } catch (err) {
      console.error('Error updating issue', err.stack);
      res.status(500).json({ error: 'could not update', _id });
    }
  })
  
  .delete(async function (req, res) {
    const project = req.params.project;
    const { _id } =  req.body;
    
    
    if (!_id) {
      return res.status(200).json({ error: 'missing _id' });
    }
  
    try {
      const result = await pool.query(
        `DELETE FROM issues WHERE _id = $1 AND project_name = $2 RETURNING *;`,
        [_id, project]
      );
  
      if (result.rowCount === 0) {
        return res.status(200).json({ error: 'could not delete', _id });
      }
  
      res.json({ result: 'successfully deleted', _id });
  
    } catch (err) {
      console.error('Error deleting issue', err.stack);
      res.status(500).json({ error: 'could not delete', _id });
    }
  });
  
};
