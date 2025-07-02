from flask import Flask, request, jsonify
from tasks import TaskManager

app = Flask(__name__)
task_manager = TaskManager()

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(task_manager.get_all())

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400
    task = task_manager.create(data["title"])
    return jsonify(task), 201

@app.route("/tasks/<string:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    task = task_manager.update(task_id, data)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(task)

@app.route("/tasks/<string:task_id>", methods=["DELETE"])
def delete_task(task_id):
    success = task_manager.delete(task_id)
    if not success:
        return jsonify({"error": "Task not found"}), 404
    return '', 204

if __name__ == "__main__":
    app.run(debug=True)
