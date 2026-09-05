const express = require('express');
const app = express();
const port = 3001;
const mysql = require('mysql2')
const cors = require('cors')

const date = new Date();

require('dotenv').config();


app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// SQL接続情報
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  timezone: 'Z'
})

// SQL接続結果
connection.connect((error) => {
  if(error) throw error;
  console.log('Success!');
})

// attendancelist -DBから勤怠一覧を所得-
app.get('/', (req, res) => {
  const selectQuery = `SELECT * FROM attendancelist`;
  connection.query(selectQuery, (error,result) => {
    res.json(result)
  })
});

// attendancelist -勤怠記録をDBへ登録-
app.post('/',(req,res) => {
  // SQLからの情報をそれぞれ定義
  const {userId, clockin , reststopwork , reststartwork , clockout , workingtime , comment } = req.body;
  // 日本時間へ変更
  const workDate = new Date(clockin).toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" })
  const dateTimeModify = (time) => {
    if(!time){
      return null
    }
    return new Date(time).toISOString().slice(0,19).replace('T',' ')
  }
  // InsertSQL構文
  const insertQuery = `INSERT INTO attendancelist 
        (date , clockin , reststopwork , reststartwork , clockout , workingtime , comment , user_id)
        VALUES (? , ? , ? , ? , ? , ? , ? , ?)`;
  const insertValues = [ workDate , dateTimeModify(clockin) , dateTimeModify(reststopwork) , dateTimeModify(reststartwork) , dateTimeModify(clockout) , workingtime , comment ,userId ];
  connection.query(insertQuery, insertValues,(error, result) => {
    if(error) {
    console.error(error);
    }
    res.json(
      {message: '勤務登録成功！'}
    )
  })
})

// ユーザー登録情報をDBへ登録
app.post('/api/users',(req,res) => {
  console.log("req.body:", req.body);

  const { clerkId, name, email } = req.body;
  const UserInsertValues = [ clerkId, name, email ];
  const UserInsertQuery = `INSERT INTO users (clerk_user_id, name ,email) VALUES (? ,? ,?)`;  

  connection.query(UserInsertQuery,UserInsertValues,(error,result) => {
    // エラーが発生した場合
    if(error) {
      console.log("ユーザー登録SQLエラー",error);
      return res.status(500).json({
        message: "ユーザー登録失敗",
        error: error.message
      })
    }

    // ユーザー登録が成功した場合
    console.log("ユーザー登録成功");
    console.log("insertID:",result.insertId);
    return res.status(201).json({
      message: "ユーザー情報登録成功"
    })
  })
})

// 社員一覧を所得
app.get('/accounts', (req,res) => {
  const userSelect = `
    SELECT USERS.id,USERS.name,USERS.email,role,
      CASE
        WHEN USERS.role = 'user' then 'ユーザー'
        WHEN USERS.role = 'admin' then '管理者'
      END role_name,
      USERS.create_at,USERS.deleteflag ,group_id,
      M_group.NAME AS group_name,
      CASE
        WHEN M_group.branch_flag = 1 then '支店'
        WHEN M_group.branch_flag = 0 then '本店'
      END group_branch
    FROM USERS
    LEFT JOIN M_group
      ON USERS.group_id = M_group.id
    WHERE USERS.deleteflag != 1;
    `;
  connection.query(userSelect, (error,result) => {
    if(error) {
      console.log("社員情報所得失敗",error);
      return res.status(500).json({
        message: "社員情報所得失敗",
        error: error.message
      })
    }
    // 社員一覧を所得できた場合
    console.log("社員一覧所得成功！",result);
    return res.json({
      message: "社員一覧所得成功",
      users:result
    })
    
  })
})

// 社員一覧より権限変更して保存した場合
app.put('/accounts', (req,res) => {
  const users = req.body;

  users.forEach(user => {
    const userUpdate =  `
      UPDATE users 
        SET  role = ?
        WHERE id = ?
    `;

    connection.query(userUpdate,[user.role,user.id],(error,result) => {
      if(error) {
        return console.log('更新処理失敗',error)
      }
      console.log('更新処理成功！');
      console.log(`id：${user.id}の権限を${user.role}へ変更しました。`);
      return res.json({
        message: '権限変更完了！'
      }
      )
    })
  });
})

// ログインユーザーのrole を所得
app.get('/accounts/role/:clerkUserId',(req,res) => {
  const clerkUserId = req.params.clerkUserId;

  console.log(req.params);
  
  const roleSelectSQL = `
      SELECT USERS.id,USERS.name,USERS.email,role,
      CASE
        WHEN USERS.role = 'user' then 'ユーザー'
        WHEN USERS.role = 'admin' then '管理者'
      END role_name,
      USERS.create_at,USERS.deleteflag ,group_id,
      M_group.NAME AS group_name,
      CASE
        WHEN M_group.branch_flag = 1 then '支店'
        WHEN M_group.branch_flag = 0 then '本店'
      END group_branch
    FROM USERS
    LEFT JOIN M_group
      ON USERS.group_id = M_group.id
    WHERE USERS.clerk_user_id = ?;
    `;
  connection.query(roleSelectSQL,clerkUserId, (error,result) => {
    if(error){
      return console.log('ユーザー情報所得失敗',error)
    }
    res.json(result[0])
    console.log('ユーザー情報所得成功!',result[0]);
    
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});