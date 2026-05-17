import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { message, Spin } from "antd";

import userContext from "../../context/userContext";

const getTaskStatus = (status) => {
  if (status === "completed") {
    return <span className="text-success">Completed</span>;
  }

  return <span className="text-warning">Pending</span>;
};

const AllTasks = () => {
  const authUser = useContext(userContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tasks/all", {
          headers: {
            Authorization: "Bearer " + authUser.token,
          },
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.log(error);
        message.error(error.response?.data?.message || "Could not load tasks");
      }
      setLoading(false);
    };

    if (authUser.token) {
      getAllTasks();
    }
  }, [authUser.token]);

  if (!authUser.isSuperUser) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="profile-detail-heading">Only admins can view all tasks</h2>
      </div>
    );
  }

  if (loading) {
    return <Spin fullscreen />;
  }

  return (
    <div>
      <div className="d-flex justify-content-center mt-4">
        <h2 className="profile-detail-heading">All Assigned Tasks</h2>
      </div>
      <div className="container">
        <table className="table mt-4 rounded">
          <thead className="table-head">
            <tr>
              <th>No.</th>
              <th>Employee</th>
              <th>Title</th>
              <th>Details</th>
              <th>Status</th>
              <th>Assigned On</th>
              <th>Completed On</th>
            </tr>
          </thead>
          <tbody>
            {users.length !== 0 ? (
              users.flatMap((user) =>
                user.tasks.map((task, index) => (
                  <tr key={task._id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{getTaskStatus(task.status)}</td>
                    <td>{new Date(task.assignedAt).toLocaleDateString()}</td>
                    <td>
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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

export default AllTasks;
