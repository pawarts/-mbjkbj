
//Require ejs-module
const express = require('express')
const fs = require('fs')
const mysql = require('mysql')
const path = require('path')
const url = require('url')
const bodyParser = require('body-parser')
const encoder = bodyParser.urlencoded()


//Check login or not login
let login = '';


//Connect config to database
const config = require('./config')

//Server creator
const app = express()

app.set('view-engine', 'ejs')

//Listened port
const PORT = 8800;

//Function create path
const createPath = (page) => path.resolve(__dirname, 'ejs-module', `${page}.ejs`)


//Server launcher
app.listen(process.env.PORT || PORT, (error) => {
    error ? console.log(Error " + error) : console.log("i'm listen port: " + PORT);
})

//Middleware components
app.use('/styles', express.static(__dirname + '/styles'))

app.use(express.urlencoded({extended: false}))

//Create connection with database
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    databases: 'posts',
    password: ''
})

conn.connect(err => {
    err ? console.log("I can't connect to DB") : console.log("I'm connected to DB");
})

//Request listener

//Login page
app.get('/log', (req, res) => {
    res.render(createPath('login'))
})

app.post('/log', encoder,(req, res) => {

    let name = req.body.login;
    let password = req.body.password;

    let query = `SELECT  ${`login`}, ${`password`}  FROM ${`posts.users`} WHERE login =  ? AND password = ?`;
    conn.query(query, [name, password], (err, result, field) =>{
        if(Array.isArray(result) && result.length > 0){
            res.redirect('/');
            login = name;
        } else {
            res.redirect("/log");
        }

        res.end()
    });


})

//Register page
app.get('/reg', (req, res) => {
    res.render(createPath('reg'))
})
app.post('/reg', encoder, (req, res) => {

    let body = req.body;

    let login = body.login;
    let password = body.password;
    let email = body.email;

    if(password[0] != password[1]){
        res.redirect('/reg');
    } else {
        let insert = `INSERT INTO ${`posts.users`} (${`id`}, ${`login`}, ${`password`}, ${`email`}) VALUES (NULL, '${login}', '${password[0]}', '${email}')`;

        conn.query(insert, (error) => {
            if(!error){
                res.redirect('/log')
            } else {
                console.log(error);
            }
        });
    }
})

//Main page
app.get('/', (req, res) => {
    res.render(createPath('index'), {login});
})
app.get('/exit', (req, res) => {
    login = '';
    res.redirect('/')
    //res.render(createPath('index'), {login});
})

//Posts page
app.get('/posts', (req, res) => {

    let select = `SELECT * FROM posts.posts`;

    conn.query(select, (error, result, field) =>{
        if(!error){
            res.render(createPath('posts'), { result, login });
        } else {
            console.log(error);
        }
    })
})


//Post page
app.get('/post/:id', (req, res) => {

    let query = `SELECT * FROM ${`posts.posts`} WHERE id = ${req.params.id}`;

    conn.query(query, (error, result) => {
        if(error){
            console.log(error)
        } else {
            res.render(createPath('post'), {result, login})
        }
    })
})

//Post edit page
app.get('/edite/:id', (req, res) => {

    let id = req.params.id

    let query = `SELECT  ${`title`}, ${`text`} FROM ${`posts.posts`} WHERE id = ${id}`;

    conn.query(query, (error, result) => {
        if(error){
            console.log(error)
        } else {
            res.render(createPath('edit-post'), { login, id, result });
        }
    })
})
app.post('/edite/:id', (req, res) => {

    let body = req.body;

    let title = body.title;
    let text = body.text;

    let id = req.params.id;

    const UPDATE  = `UPDATE posts.posts SET title = '${title}', text = '${text}' WHERE id = ${id}`;

     conn.query(UPDATE, (error, result) => {
        if(error){
            console.log(error)
        } else {
             res.redirect(`/post/${req.params.id}`)
        }
    })
})

app.get('/delete/:id', (req, res) => {

    const DELETE = `DELETE FROM posts.posts WHERE ${`id`} = ${req.params.id}`;

    conn.query(DELETE, (error) => {
        if(!error){
            res.redirect(`/posts`)
        } else {
            console.log(error)
        }
    })

})


//Add post page
app.get('/add-post', (req, res) => {
    res.render(createPath('add-post'), { login });
})
app.post('/add-post', (req, res) =>{

    let body = req.body;
    const date = new Date();

    let full = date.toLocaleDateString();

    let title = body.title;
    let text = body.text;
    let author = body.author;

    if(author == ''){
        if(login == ''){
            author = 'Unknown author';
        } else {
            author = login;
        }
    }

   let insert = `INSERT INTO ${`posts.posts`} (${`id`}, ${`title`}, ${`text`}, ${`author`}, ${`date`}) VALUES (NULL, '${title}', '${text}', '${author}', '${full}')`;

    conn.query(insert, (error, result) => {
        if(!error){
            res.redirect('/posts')
        } else {
            console.log(error)
        }
    })
})

//File not found catcher
app.use((req, res) => {
    res.render(createPath('error'));
});
