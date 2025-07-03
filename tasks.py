import uuid

class TaskManager:
    def __init__(self):
        self.tasks = []

    def get_all(self):
        return self.tasks

    def create(self, title):
        task = {
            "id": str(uuid.uuid4()),
            "title": title,
            "completed": False
        }
        self.tasks.append(task)
        return task

    def update(self, task_id, data):
        for task in self.tasks:
            if task["id"] == task_id:
                task["title"] = data.get("title", task["title"])
                task["completed"] = data.get("completed", task["completed"])
                return task
        return None

    def delete(self, task_id):
        for i, task in enumerate(self.tasks):
            if task["id"] == task_id:
                del self.tasks[i]
                return True
        return False
