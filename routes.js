const express = require('express');
const { query } = require('./mysql');
const router = express.Router();
const { getUsernameFromEmail, makeString} = require("./function");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey='3456yugse6789ugfdEDERYHTs87tfgvtfug345hu87t';
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token,secretKey );
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};

router.post('/wins',auth, async (req, res) => {
    try {
        const users = await query('SELECT * FROM winners');
        res.json(users);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});



router.post('/profile',auth, async (req, res) => {
    try {
        const  email = req.user.emailId;
        const users = await query('SELECT * FROM users WHERE email=?',[email]);
        res.status(200).json([{
            status:true,
            name:users[0].name, 
            email:users[0].email,
            payouts:567
        }]);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/change-password',auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const users = await query('SELECT * FROM users WHERE email = ?', [req.user.emailId]);
        const user = users[0]; 
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds
        await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, req.user.emailId]);

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});


router.post('/balance',auth, async (req, res) => {
    try {
        const users = await query('SELECT * FROM users WHERE email=?',[req.user.emailId]);
        const user = users[0];
        if(user){
            const u = await query('SELECT SUM(result) AS balance FROM history WHERE userid=?',[user.id]);
            if(u.balance==null){
                return res.status(200).json({balance:0});
            }
            return res.status(200).json(u);
        }
        return res.status(400).json({status:false});
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});


router.post('/history',auth, async (req, res) => {
    try {
        const users = await query('SELECT * FROM users WHERE email=?',[req.user.emailId]);
        const user = users[0];
        if(user){
            const u = await query('SELECT * FROM history WHERE userid=?',[user.id]);
            return res.status(200).json(u);
        }
        return res.status(400).json({status:false});
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});
    
router.post('/games',auth, async (req, res) => {
    try {
        const users = await query('SELECT * FROM games');
        return res.json(users);
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});
router.post('/settings',auth, async (req, res) => {
    try {
        const users = await query('SELECT * FROM settings');
        return res.json(users);
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});
router.post('/signup', async (req, res) => {
    const { name, email, pass} = req.body;
    if(!name || !email || !pass){
        return res.status(500).json({ status: false, message: "fill all  requirements" });
    }
    try {
        
        const username = getUsernameFromEmail(email);
        const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(500).json({ status: false, message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(pass, 10);
        const timestamp = Date.now();
        const data1 =  await query('INSERT INTO users (id, name, username, password,email, date) VALUES (null, ?, ?, ?, ?, ?)',[name,username,hashedPassword, email,timestamp]);
        if (data1.affectedRows === 1) {
            const payload = {
                userId: data1.insertId,
                username: username,
                emailId:email
            };
            const token = jwt.sign(payload, secretKey);
            return res.status(201).json({ status: true, token });
        } else {
            return res.status(500).json({ status: false, message: "Failed to register user" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.post('/login',async (req,res)=>{
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(500).json({ status: false, message: "please enter email and password" });
    }
    try{
        const user = await query('SELECT * FROM users WHERE email=? OR username=?', [username,username]);
        if(user.length===1){
            const validPassword = await bcrypt.compare(password, user[0].password);
            if (!validPassword) {
                return res.status(401).json({ status: false,message: 'Authentication failed' });
            }
            const payload = {
                userId: user[0].id,
                username: user[0].username,
                emailId: user[0].email
            }; 
            const token = jwt.sign(payload, secretKey);
            return res.status(201).json({ status: true, token });
        }else{
            return res.status(500).json({ status: false, message: "User not Found!" });
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.get('*', (req, res) => {
    res.status(404).send('what???');
});
router.post('*', (req, res) => {
    res.status(404).send('what???');
});
module.exports = router;