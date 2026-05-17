import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { message, Spin } from "antd";
import { Button } from "react-bootstrap";

import userContext from "../../context/userContext";

const getTaskStatus = (status) => {
  if (status === "completed") {
    return <span className="text-success">Completed</span>;
  }

  return <span className="text-warning">Pending</span>;
};

const MyTasks = () => {
  const authUser = useContext(userContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTasks, setRefreshTasks] = useState(false);

  useEffect(() => {
    const getTasks = async () => {
      if (!authUser.userId || !authUser.token) {
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/tasks/my-tasks/${authUser.userId}`,
          {
            headers: {
              Authorization: "Bearer " + authUser.token,
            },
          }
        );
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.log(error);
        message.error(error.response?.data?.message || "Could not load tasks");
      }
      setLoading(false);
    };

    getTasks();
  }, [authUser.userId, authUser.token, refreshTasks]);

  const completeTask = async (taskId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/complete/${taskId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + authUser.token,
          },
        }
      );
      message.success("Task marked as completed");
      setRefreshTasks((refresh) => !refresh);
    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.message || "Could not update task");
    }
  };

  if (loading) {
    return <Spin fullscreen />;
  }

  return (
    <div>
      <div className="d-flex justify-content-center mt-4">
        <h2 className="profile-detail-heading">My Tasks</h2>
      </div>
      <div className="container">
        <table className="table mt-4 rounded">
          <thead className="table-head">
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Details</th>
              <th>Status</th>
              <th>Assigned On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length !== 0 ? (
              tasks.map((task, index) => (
                <tr key={task._id}>
                  <td>{index + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{getTaskStatus(task.status)}</td>
                  <td>{new Date(task.assignedAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant=""
                      className="custom-button"
                      disabled={task.status === "completed"}
                      onClick={() => completeTask(task._id)}
                    >
                      {task.status === "completed"
                        ? "Completed"
                        : "Mark Completed"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No tasks assigned
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTasks;
