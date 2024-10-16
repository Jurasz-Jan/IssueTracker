const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testIssueId; // Store the ID of the created issue for later use in update/delete tests

  // Test the POST route
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue text',
        created_by: 'Tester',
        assigned_to: 'Test Assignee',
        status_text: 'In progress',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'open');
        assert.isTrue(res.body.open);

        // Store the issue ID for later use
        testIssueId = res.body._id;
        done();
      });
  });

  // Test the POST route with missing required fields
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Test Issue',
        // issue_text is missing
        created_by: 'Tester',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // Test the GET route
  test('View issues for a project', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1); // Ensure we get at least one issue back
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'open');
        done();
      });
  });

  // Test the PUT route to update an issue
  test('Update an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        _id: testIssueId,
        issue_text: 'Updated issue text',
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'open');
        assert.equal(res.body.issue_text, 'Updated issue text');
        assert.isFalse(res.body.open);
        done();
      });
  });

  // Test the PUT route with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        issue_text: 'Updated issue text',
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Missing ID for update');
        done();
      });
  });

  // Test the DELETE route
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({
        _id: testIssueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'message');
        assert.equal(res.body.message, 'Issue deleted successfully');
        done();
      });
  });

  // Test the DELETE route with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Missing ID for deletion');
        done();
      });
  });

  // Test the GET route to confirm the issue has been deleted
  test('Confirm issue has been deleted', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        const deletedIssue = res.body.find(issue => issue._id === testIssueId);
        assert.isUndefined(deletedIssue); // The issue should no longer exist
        done();
      });
  });


  test('View issues on a project with a filter', function(done) {
    chai.request(server)
      .get('/api/issues/test-project')
      .query({ open: 'false' }) // Query to filter only closed issues
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length > 0) {
          assert.property(res.body[0], 'open');
          assert.isFalse(res.body[0].open);
        }
        done();
      });
  });

  // Test the PUT request with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        issue_text: 'Updated issue text',
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test the PUT request with no fields to update
  test('Update an issue with no fields sent', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        _id: testIssueId, // Send only _id
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // Test the PUT request with valid fields
  test('Update an issue with valid fields', function(done) {
    chai.request(server)
      .put('/api/issues/test-project')
      .send({
        _id: testIssueId,
        issue_text: 'Another update to issue text',
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        assert.property(res.body, '_id');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  // Test the DELETE request with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test the DELETE request with valid _id
  test('Delete an issue with valid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test-project')
      .send({ _id: testIssueId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully deleted');
        assert.property(res.body, '_id');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });
});
