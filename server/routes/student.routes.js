import express from "express";
const studentRoute = express.Router();
studentRoute.get("/", (req, res) => {
  res.json({
    success: true,
    department: req.query.department,
    year: req.query.year,
  });
});
studentRoute.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Student details",
    student: req.body,
  });
});
export default studentRoute;
