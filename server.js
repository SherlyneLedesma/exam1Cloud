const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

//Middleware//
app.use(express.json());

//Database Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'examuser',  
  password: 'exampass', 
  database: 'exam1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const db = pool.promise();

//Endpoints

//GET /api/courses (Gets all courses)
app.get('/api/courses', async(req, res) =>{
    try{
    const [rows] = await db.query('SELECT * FROM courses');
    res.json(rows);
    }catch(error){
        res.status(500).json({error: error.message});
    }
});

//GET /api/courses/:id (Gets one specified course)
app.get('/api/courses/:id', async(req,res)=>{
    const{id} = req.params;
    try{
        const [rows] = await db.query('SELECT * FROM courses WHERE courseID = ?', [id]);
        //checks to see if there is a course
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
    //returns specific course
    res.json(rows[0]);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

//POST /api/courses (Creates new Course)
app.post('/api/courses', async(req, res) =>{
    const {
        courseNo,
        courseDesc,
        lastSemTaught,
        maxStudents
    } = req.body;

    if (!courseNo || !courseDesc || !lastSemTaught || !maxStudents) {
    return res.status(400).json({ 
      message: 'Missing fields: CourseNo, CourseDesc, LastSemTaught, and MaxStudents are required.' 
    });
  }
  try{
    const queryStr = `
      INSERT INTO courses (courseNo, courseDesc, lastSemTaught, maxStudents) VALUES (?,?,?,?)
    `;

    const [result] = await db.query(queryStr, [
      courseNo,
      courseDesc,
      lastSemTaught,
      maxStudents
    ]);
    res.status(201).json({
      message: 'Course created successfully',
      courseID: result.insertId
    });
  }catch(error){
    res.status(500).json({ error: error.message });
  }
});

//starting server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});