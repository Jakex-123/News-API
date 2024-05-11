import prisma from '../db/db.config.js'
import vine, { errors } from '@vinejs/vine'
import { loginSchema, registerSchema } from '../validations/AuthValidation.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../config/mailer.js';
import logger from '../config/logger.js';

class AuthController{
    static async register(req,res){ //static is written so that we dont need to create an instance and invoke the function with a .
        try{
        const body=req.body;
        const validator=vine.compile(registerSchema)
        const op=await validator.validate(body)

        //Check Unique email
        const checkEmail=await prisma.users.findUnique({
            where:{
                email:op.email
            }
        })

        if(checkEmail){
            return res.status(400).json({errors:{
                email:"Email already exists. PLease try again with different email."
            }})
        }
        //Encrypt Password
        const salt=bcrypt.genSaltSync(10)
        op.password=bcrypt.hashSync(op.password,salt)

        const user = await prisma.users.create({
            data:op
        })
    
        return res.json({status:200, message:"User created succesfully",user}) 
        }
        catch(e){
            logger.error(e?.message)
            console.log("The error is ",e)
            if(e instanceof errors.E_VALIDATION_ERROR){
                res.status(400).json({error:e.messages})
            }
            else{
                return res.status(500).json({status:500, message:"Something Went Wrong. Please try again"})
            }
        }
        
    }

    static async login(req,res){
        try{
            const body=req.body;
            const validator=vine.compile(loginSchema)
            const op=await validator.validate(body)
            
            const user=await prisma.users.findUnique({
                where:{
                    email:op.email
                }
            })
            if(user){
                console.log(user)
                if(!bcrypt.compareSync(op.password,user.password)){
                    return res.status(400).json({
                        message:"Invalid Email or Password"
                    })
                }
                //Generate Token
                const payload={
                    id:user.id,
                    email:user.email,
                    name:user.name,
                    profile:user.profile
                }
                const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"365d"})
                return res.json({message:'Login succesfull',access_token:`Bearer ${token}`})
            }
            else{
                return res.status(400).json({
                    message:"No user found"
                })
            }
        }
        catch(e){
            logger.error(e?.message)
            console.log("The error is ",e)
            if(e instanceof errors.E_VALIDATION_ERROR){
                res.status(400).json({error:e.messages})
            }
            else{
                return res.status(500).json({status:500, message:"Something Went Wrong. Please try again"})
            }
        }
    }
    
    static async sendEMail(req,res){
        try{
            const {email}=req.query

            const payload={
                toEmail:email,
                subject:"Hey testing",
                body:"<h1>Hello world</h1>"
            }

            await sendEmail(payload)
            return res.json({status:200, message:"Email sent successfully"})
        }
        catch(err){
            console.log(err)
            logger.error({type:"Email Error", body:err})
            return res.status(500).json({message:"Something Went Wrong! Please try again later."})
        }
    }
}

export default AuthController