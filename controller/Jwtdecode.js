const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTY3ZDk4M2FhNGJlZTk2M2NlZDFkZiIsImVtYWlsIjoiYWJvZHVuZGVwYXVsMjAyMkBnbWFpbC5jb20iLCJpYXQiOjE3NjMwODY3NTksImV4cCI6MTc2MzE3MzE1OSwiYXVkIjoibXliYW5rLWNsaWVudCIsImlzcyI6Im15YmFuay1hcGkifQ.ynJJ4WR0eyvMhZ9AngIkegro8eBDIUCtAlSF5zv_IpA";

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifies and decodes
    console.log("Decoded token:", decoded);
} catch (err) {
    console.error("Token is invalid or expired", err.message);
}
