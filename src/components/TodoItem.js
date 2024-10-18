import React, { useState, useEffect } from "react";
import TodoModal from "./TodoModal";
import api from "../utils/api";
import "./TodoItem.style.css";
import LoadingSpinner from "../components/LoadingSpinner";

const TodoItem = ({ item, deleteItem, toggleComplete, getTasks }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(item.task);
  const [editedDescription, setEditedDescription] = useState(item.description);
  const [selectedPriority, setSelectedPriority] = useState(item.priority);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(".menu-dropdown, .todo-item-menu-button")) {
        return;
      }
      setShowMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditSave = async () => {
    try {
      const response = await api.put(`/tasks/${item._id}`, {
        task: editedTask,
        description: editedDescription,
        priority: selectedPriority,
      });

      if (response.status === 200) {
        setIsEditModalOpen(false);
        getTasks();
      }
    } catch (error) {
      console.log("error:", error);
    } 
  };

  const handleDelete = async () => {
    setLoading(true); 
    try {
      await deleteItem(item._id); 
      getTasks(); 
    } catch (error) {
      console.log("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다."); 
    } finally {
      setLoading(false);  
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Immediate":
        return "#ffcece";
      case "High":
        return "#d2ceff";
      case "Normal":
        return "#d1e5f7";
      case "Low":
        return "#daf2d6";
      default:
        return "";
    }
  };

  return (
    <div className={`todo-item ${item.isComplete ? "item-complete" : ""}`}>
    {loading ? ( // 로딩 중일 때 로딩 스피너 표시
      <LoadingSpinner />
    ) : (
      <>
      <div className="todo-item-header">
        <div className="todo-item-title">{item.task}</div>
        <button
          className="todo-item-menu-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          &#8230;
        </button>
        {/* 메뉴 드롭다운 */}
        {showMenu && (
          <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsEditModalOpen(true);
                setShowMenu(false);
              }}
            >
              Edit
            </button>
            <button onClick={handleDelete}>Delete</button> 
          </div>
        )}
      </div>

      <div className="todo-item-description">{item.description || ""}</div>

      <div className="todo-item-footer">
        <div
          className="todo-item-priority-circle"
          style={{ backgroundColor: getPriorityColor(item.priority) }}
        ></div>
        <div className="todo-checkbox">
          <label>Done</label>
          <input
            type="checkbox"
            checked={item.isComplete}
            onChange={() => toggleComplete(item._id)}
          />
        </div>
      </div>
      </>
    )}

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <TodoModal
          mode="edit"
          todoValue={editedTask}
          setTodoValue={setEditedTask}
          description={editedDescription}
          setDescription={setEditedDescription}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          onSave={handleEditSave}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TodoItem;
