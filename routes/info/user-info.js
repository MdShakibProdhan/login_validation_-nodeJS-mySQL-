const express = require("express")
const userInfo = express.Router()
const connection = require("../../db/mainDB")
const bcrypt = require('bcrypt')
const colors = require('colors');
const validator = require("validator");


//salting
// bcrypt.genSalt(saltRounds, function(err, salt) {
//     bcrypt.hash(password, salt, function(err, hash) {
//     // Store hash in database here
//     });
//   });
  
//   When we put all the steps together, we get:
  
//   ```js
//   const bcrypt = require ('bcrypt');
  
//   const saltRounds = 10;
//   var password = "Fkdj^45ci@Jad";
  
//   bcrypt.genSalt(saltRounds, function(err, salt) {
//     bcrypt.hash(password, salt, function(err, hash) {
//               // Store hash in database here
//      });
//   });


//sql-command
//const sql = `INSERT INTO list_item (user_name, user_email, user_password) VALUES ("${user_name}", "${user_email}", "${mainPassword}");`
//const foundSQL = `SELECT * FROM list_item WHERE user_email = "${user_email}";`


//validator
// var passwordValidator = require('password-validator');
// var schema = new passwordValidator();
// schema
//   .is().min(8)
//   .is().max(100)
//   .has().uppercase()
//   .has().lowercase();
// console.log(schema.validate(req.body.password)); // prints a boolean


userInfo.get('/', (req, res) => {
    console.log(colors.blue('GET -> /api/user-info/'));
    const {user_email, user_password } = req.body
	if (user_email && user_password) {
		connection.query(`SELECT * FROM list_item WHERE user_email = "${user_email}";`,
        (error, results) => {
			if (!error && results.length === 1) {
                const hashPassword = results[0].user_password;
                bcrypt.compare(user_password, hashPassword, (error, success) => {
                    if (error) {
                        res.status(500).json({
                            success: false,
                            error: true,
                            massage: "Internal servver",
                            obj: null
                        })
                    } else {
                        if (success) {
                            res.status(200).json({
                                success: true,
                                error: false,
                                massage: "LogIn successful",
                                obj: null
                            })
                        } else {
                            res.status(400).json({
                                success: false,
                                error: true,
                                massage: "Invalid email / password",
                                obj: null
                            })
                        }
                    }
                })
            } else {
                res.status(500).json({
                    success: false,
                    error: true,
                    massage: "internal server error",
                    obj: null
                })
            }
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});



userInfo.post('/', (req, res) => {
    console.log(colors.yellow('POST -> /api/user-info/'));
    const {user_name, user_email, user_password} = req.body

        if (!validator.isStrongPassword(user_password)) {
            res.status(500).json({
                success: false,
                error: true,
                massage: "Please use a strong password (minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1)",
                obj: null
            })
        }
        else{
            bcrypt.genSalt(8, (error, salt) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        error: true,
                        massage: "something went wrong",
                        obj: null
                    })
                }else{
                    bcrypt.hash(user_password, salt, (hashError, mainPassword) => {
                        if (hashError) {
                            res.status(500).json({
                                success: false,
                                error: true,
                                massage: "something went wrong",
                                obj: null
                            })
                        }else{
                            const foundSQL = `SELECT * FROM list_item WHERE user_email = "${user_email}";`
                            console.log(foundSQL);
                            connection.query(foundSQL, (error, result) => {
                                if(error){
                                    console.log(error);
                                    res.status(400).json({
                                        success: false,
                                        error: true,
                                        massage: "internal server error",
                                        obj: null
                                    })
                                }else{
                                    const data = result
                                    if( data.length === 0){
                                        const sql = `INSERT INTO list_item (user_name, user_email, user_password) VALUES ("${user_name}", "${user_email}", "${mainPassword}");`
                                                connection.query(sql, (error, result) => {
                                                    if (error) {
                                                        res.status(400).json({
                                                            success: false,
                                                            error: true,
                                                            massage: "Internal Server ERROR",
                                                            obj: null
                                                        })
                                                    } else {
                                                        res.status(201).json({
                                                            success: true,
                                                            error: false,
                                                            massage: "New User Created",
                                                            obj: result
                                                        })
                                                    }
                                                })
                                    }else{
                                        res.status(400).json({
                                            success: false,
                                            error: true,
                                            massage: "Email already used, Use another valid email",
                                            obj: null
                                        })
                                    }
                                }
                            })
                            
                        }
                    })
                }
            })
        }  
})









module.exports = userInfo;