import express from 'express'
import "dotenv/config"
import router from './routes/api.js'
import fileUpload from 'express-fileupload'
import helmet from 'helmet'
import cors from 'cors'
import { limitter } from './config/ratelimiter.js'

const app=express()
const PORT=process.env.PORT || 8000

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"))
app.use(fileUpload())
app.use(helmet())
app.use(cors())
app.use(limitter)
app.use('/api',router)


app.get('/',(req,res)=>{
    res.json({message:"hELLO"})
})

app.listen(PORT,()=>{
    console.log('running')
})