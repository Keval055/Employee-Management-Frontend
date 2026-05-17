import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { message, Spin } from "antd";
import { Button, Form } from "react-bootstrap";

import userContext from "../../context/userContext";

const AssignTask = () => {
  const authUser = useContext(userContext);
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getEmployeeDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/");
        setEmployee(response.data.user);
      } catch (error) {
        console.log(error);
        message.error("Could not load employees");
      }
      setLoading(false);
    };

    getEmployeeDetails();
  }, []);

  const employeeOptions = employee.filter((emp) => !emp.isSuperUser);

  const assignTask = async (event) => {
    event.preventDefault();

    if (!selectedEmployee || !title || !description) {
      message.error("Please fill all task details");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/tasks/assign/${selectedEmployee}`,
        { title, description },
        {
          headers: {
            Authorization: "Bearer " + authUser.token,
          },
        }
      );
      message.success("Task assigned successfully");
      setSelectedEmployee("");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again.");
        authUser.logout();
        setSubmitting(false);
        return;
      }
      message.error(error.response?.data?.message || "Could not assign task");
    }
    setSubmitting(false);
  };

  if (!authUser.isSuperUser) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="profile-detail-heading">Only admins can assign tasks</h2>
      </div>
    );
  }

  if (loading) {
    return <Spin fullscreen />;
  }

  return (
    <div className="mt-4">
      <h2 className="text-center profile-detail-heading">Assign Task</h2>
      <div className="d-flex justify-content-center my-4">
        <Form onSubmit={assignTask} className="px-5 py-4">
          <Form.Group className="mb-3" controlId="employee">
            <Form.Label className="fw-bold">Employee</Form.Label>
            <Form.Select
              value={selectedEmployee}
              onChange={(event) => setSelectedEmployee(event.target.value)}
            >
              <option value="">Select employee</option>
              {employeeOptions.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} - {emp.position}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label className="fw-bold">Task Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label className="fw-bold">Task Details</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter task details"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Form.Group>
          <Button
            variant=""
            type="submit"
            className="custom-button w-100 p-2"
            disabled={submitting}
          >
            {submitting ? "Assigning..." : "Assign Task"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AssignTask;
