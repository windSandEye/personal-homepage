import express from 'express';
const app = express()
const port = 3000

app.use('/api', require('./routers.ts'))

app.listen(port, () => console.log(`服务启动成功,http:localhost:3000`))