import unittest
import json
from app import app

class TaskApiTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_create_task(self):
        res = self.client.post("/tasks", json={"title": "Test Task"})
        self.assertEqual(res.status_code, 201)
        self.assertIn("id", res.get_json())

    def test_get_tasks(self):
        res = self.client.get("/tasks")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.get_json(), list)

    def test_update_task(self):
        create = self.client.post("/tasks", json={"title": "Update Me"})
        task_id = create.get_json()["id"]
        update = self.client.put(f"/tasks/{task_id}", json={"completed": True})
        self.assertEqual(update.status_code, 200)
        self.assertTrue(update.get_json()["completed"])

    def test_delete_task(self):
        create = self.client.post("/tasks", json={"title": "Delete Me"})
        task_id = create.get_json()["id"]
        delete = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(delete.status_code, 204)

    def test_index_page(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"My Tasks", res.data)

    def test_create_task_blank_title(self):
        res = self.client.post("/tasks", json={"title": "   "})
        self.assertEqual(res.status_code, 400)

    def test_update_task_without_body(self):
        create = self.client.post("/tasks", json={"title": "No Body"})
        task_id = create.get_json()["id"]
        res = self.client.put(f"/tasks/{task_id}")
        self.assertEqual(res.status_code, 400)

    def test_update_task_title(self):
        create = self.client.post("/tasks", json={"title": "Old Title"})
        task_id = create.get_json()["id"]
        res = self.client.put(f"/tasks/{task_id}", json={"title": "New Title"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["title"], "New Title")

if __name__ == "__main__":
    unittest.main()
