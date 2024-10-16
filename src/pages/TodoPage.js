import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodoBoard from "../components/TodoBoard";
import TodoModal from "../components/TodoModal";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../utils/api";
import "./TodoPage.style.css";

const TodoPage = ({ user, setUser }) => {
  const [todoList, setTodoList] = useState([]);
  const [todoValue, setTodoValue] = useState("");
  const [description, setDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [hideDone, setHideDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const navigate = useNavigate();

  // 할 일 목록 가져오는 함수
  const getTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks");
      setTodoList(response.data.data);
    } catch (error) {
      console.log("error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // 할 일을 추가하거나 수정하는 함수
  const saveTodo = async () => {
    try {
      if (editingTodoId) {
        const response = await api.put(`/tasks/${editingTodoId}`, {
          task: todoValue,
          description: description,
          priority: selectedPriority,
        });
        if (response.status === 200) {
          await getTasks();
        }
      } else {
        const response = await api.post("/tasks", {
          task: todoValue,
          isComplete: false,
          priority: selectedPriority,
          description: description,
        });
        if (response.status === 200) {
          await getTasks();
        }
      }
      // 입력 필드 초기화 및 모달 닫기
      resetModalState();
    } catch (error) {
      console.log("error:", error);
    }
  };

  // 할 일 추가/수정 모달 상태를 초기화하는 함수
  const resetModalState = () => {
    setTodoValue("");
    setDescription("");
    setSelectedPriority("");
    setEditingTodoId(null);
    setIsModalOpen(false);
  };

  // 할 일을 삭제하는 함수
  const deleteItem = async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      if (response.status === 200) {
        await getTasks();
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  // 할 일의 완료 상태를 변경하는 함수 : UI에서 완료 상태 업데이트 후 비동기 API 요청으로 백엔드 동기화 처리
  const toggleComplete = async (id) => {
    setTodoList((prevList) =>
      prevList.map((item) =>
        item._id === id ? { ...item, isComplete: !item.isComplete } : item
      )
    );
    try {
      const task = todoList.find((item) => item._id === id);
      await api.put(`/tasks/${id}`, {
        isComplete: !task.isComplete,
      });
    } catch (error) {
      console.log("Error toggling complete status:", error);
    }
  };

  // 모달 열고 닫는 함수
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // 할 일을 수정하는 모달 열기 함수
  const openEditModal = (todo) => {
    setTodoValue(todo.task);
    setDescription(todo.description);
    setSelectedPriority(todo.priority);
    setEditingTodoId(todo._id);
    setIsModalOpen(true);
  };

  const handleFilterPriorityClick = (priority) => {
    if (priority === "All Tasks") {
      setFilterPriority("");
    } else {
      setFilterPriority(priority);
    }
  };

  const filteredTodoList = filterPriority
    ? todoList.filter((item) => item.priority === filterPriority)
    : todoList;

  const finalTodoList = hideDone
    ? filteredTodoList.filter((item) => !item.isComplete)
    : filteredTodoList;

  const resetFilterPriority = () => {
    setFilterPriority("");
  };

  // 로그아웃 함수
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="todo-container">
      <Header
        user={user}
        handleLogout={handleLogout}
        getTasks={getTasks}
        resetFilterPriority={resetFilterPriority}
        resetHideDone={() => setHideDone(false)}
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="add-task-button-area">
            <button onClick={toggleModal} className="add-task-button">
              Add Task
            </button>
          </div>
          <div className="content-section">
            <div className="filter-area">
              <div className="priority-filter-list">
                {["All Tasks", "Immediate", "High", "Normal", "Low"].map(
                  (priority) => (
                    <span
                      key={priority}
                      className={`priority-filter ${
                        filterPriority === priority ? "selected" : ""
                      }`}
                      data-priority={priority}
                      onClick={() => handleFilterPriorityClick(priority)}
                    >
                      {priority}
                    </span>
                  )
                )}
              </div>

              <div className="hide-done-tasks">
                <input
                  type="checkbox"
                  checked={hideDone}
                  onChange={() => setHideDone(!hideDone)}
                />
                <label>Hide Done Tasks</label>
              </div>
            </div>

            <div className="task-list">
              <TodoBoard
                todoList={finalTodoList}
                deleteItem={deleteItem}
                toggleComplete={toggleComplete}
                getTasks={getTasks}
                openEditModal={openEditModal}
              />
            </div>
          </div>

          {isModalOpen && (
            <TodoModal
              mode={editingTodoId ? "edit" : "add"}
              todoValue={todoValue}
              setTodoValue={setTodoValue}
              description={description}
              setDescription={setDescription}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              onSave={saveTodo}
              onClose={resetModalState}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TodoPage;
