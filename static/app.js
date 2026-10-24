const form = document.getElementById("new-task-form");
const input = document.getElementById("new-task-input");
const list = document.getElementById("task-list");
const summary = document.getElementById("summary");
const empty = document.getElementById("empty");
const errorBox = document.getElementById("error");
const filterButtons = document.querySelectorAll(".filters button");
const clearCompleted = document.getElementById("clear-completed");

let tasks = [];
let filter = "all";

async function api(method, url, body) {
    const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
    }
    return res.status === 204 ? null : res.json();
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
}

async function loadTasks() {
    try {
        tasks = await api("GET", "/tasks");
        render();
    } catch (err) {
        showError(err.message);
    }
}

function render() {
    const remaining = tasks.filter(t => !t.completed).length;
    summary.textContent = tasks.length === 0
        ? "Nothing on your list yet"
        : `${remaining} of ${tasks.length} task${tasks.length === 1 ? "" : "s"} left`;

    const visible = tasks.filter(t =>
        filter === "all" || (filter === "active" ? !t.completed : t.completed)
    );

    list.innerHTML = "";
    visible.forEach(task => list.appendChild(renderTask(task)));

    empty.hidden = visible.length > 0;
    empty.textContent = tasks.length === 0
        ? "Add your first task above."
        : `No ${filter} tasks.`;
}

function renderTask(task) {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark as done");
    checkbox.addEventListener("change", () => updateTask(task.id, { completed: checkbox.checked }));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title;
    title.addEventListener("dblclick", () => startEditing(li, title, task));

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, title, del);
    return li;
}

function startEditing(li, title, task) {
    const edit = document.createElement("input");
    edit.className = "edit-input";
    edit.value = task.title;
    edit.maxLength = 200;
    li.replaceChild(edit, title);
    edit.focus();
    edit.select();

    let done = false;
    const finish = save => {
        if (done) return;
        done = true;
        const newTitle = edit.value.trim();
        if (save && newTitle && newTitle !== task.title) {
            updateTask(task.id, { title: newTitle });
        } else {
            render();
        }
    };

    edit.addEventListener("keydown", e => {
        if (e.key === "Enter") finish(true);
        if (e.key === "Escape") finish(false);
    });
    edit.addEventListener("blur", () => finish(true));
}

async function updateTask(id, changes) {
    try {
        const updated = await api("PUT", `/tasks/${id}`, changes);
        tasks = tasks.map(t => (t.id === id ? updated : t));
        showError("");
    } catch (err) {
        showError(err.message);
    }
    render();
}

async function deleteTask(id) {
    try {
        await api("DELETE", `/tasks/${id}`);
        tasks = tasks.filter(t => t.id !== id);
        showError("");
    } catch (err) {
        showError(err.message);
    }
    render();
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) {
        showError("Please type a task first.");
        return;
    }
    try {
        const task = await api("POST", "/tasks", { title });
        tasks.push(task);
        input.value = "";
        showError("");
        render();
    } catch (err) {
        showError(err.message);
    }
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filter = button.dataset.filter;
        filterButtons.forEach(b => b.classList.toggle("active", b === button));
        render();
    });
});

clearCompleted.addEventListener("click", async () => {
    const completed = tasks.filter(t => t.completed);
    await Promise.all(completed.map(t => api("DELETE", `/tasks/${t.id}`).catch(() => null)));
    loadTasks();
});

loadTasks();
