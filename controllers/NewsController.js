import vine,{errors} from "@vinejs/vine"
import { newsSchema } from "../validations/newsValidation.js"
import { idGenerator, imageValidator, removeImage, uploadImage } from "../utils/helper.js"
import prisma from "../db/db.config.js"
import newsApiTransform from "../transform/newsApiTransform.js"
import redisCache from "../db/redis.config.js"
import logger from "../config/logger.js"

class NewsController{
    static async index(req,res){
        const page=Number(req.query.page) || 1
        const limit=Number(req.query.limit) || 1

        if(page<=0){
            page=1;
        }
        if(limit<=0 || limit>100){
            limit=10
        }

        const skip=(page-1)*limit;

        const news = await prisma.news.findMany({
            take:limit,
            skip:skip,
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        profile:true,
                    },
                },
            }
        })
        const newsTransform=news?.map((item)=>newsApiTransform.transform(item))

        const totalNews=await prisma.news.count()
        const totalPages=Math.ceil(totalNews/limit)


        return res.json({status:200,newsTransform,metadata:{
            totalPages,
            currentPage:page,
            currentLimit:limit
        }})
    }
    static async store(req,res){
        try{
        const user = req.user
        const body=req.body
        const validator=vine.compile(newsSchema)
        const op=await validator.validate(body)

        if(!req.files || Object.keys(req.files).length===0){
            return res.status(400).json({
                errors:{
                    image:'Image is required'
                }
            })
        }
        const image=req.files?.image
        const message=imageValidator(image?.size,image?.mimetype)
        if(message!==null){
            return res.status(400).json({
                errors:{
                    image:message
                }
            })
        }
        const imageName=uploadImage(image)

        op.image=imageName
        op.user_id=user.id

        const news=await prisma.news.create({
            data:op
        })

        //remove cache
        redisCache.del('/api/news',(err)=>{
            if(err) throw err
        })

        res.json({status:200,message:"News created successfully|",news})
        }
        catch(e){
            logger.error(e?.message)
            console.log("Error is ",e)
            if(e instanceof errors.E_VALIDATION_ERROR){
                res.status(400).json({error:e.messages})
            }
            else{
                return res.status(500).json({status:500, message:"Something Went Wrong. Please try again"})
            }
        }
        
    }
    static async show(req,res){
        try{
            const {id}=req.params
        const news=await prisma.news.findUnique({
            where:{
                id:Number(id)
            },
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        profile:true
                    }
                }
            }
        })
            const transformNews=news?newsApiTransform.transform(news):null
            return res.json({status:200,news:transformNews})
        }
        catch(e){
            logger.error(e?.message)
            return res.status(500).json({
                message:"Something Went Wrong"
            })
        }
        
    }
    static async update(req,res){
        try{
            const {id}=req.params;
            const user=req.user;
            const body=req.body
            let imageName=undefined

            const news=await prisma.news.findUnique({
                where:{
                    id:Number(id),
                }
            })
            if(news.user_id !== user.id){
                return res.status(400).send("Unauthorized")
            }

            const image=req?.files?.image;

            const validator=vine.compile(newsSchema)
            const op=await validator.validate(body)

            if(image){
                const message=imageValidator(image?.size,image?.mimetype)
                if(message!==null){
                    res.status(400).json({
                        errors:{
                            image:message
                        }
                    })
                }
                imageName=uploadImage(image)
                op.image=imageName
                removeImage(news.image)
            }

            await prisma.news.update({
                data:op,
                where:{
                    id:Number(id)
                }
            })
            redisCache.del('/api/news',(err)=>{
                if(err) throw err
            })
            return res.status(200).json({message:"News Updated Successfully"})
        }
        catch(e){
            logger.error(e?.message)
            console.log("Error is ",e)
            if(e instanceof errors.E_VALIDATION_ERROR){
                res.status(400).json({error:e.messages})
            }
            else{
                return res.status(500).json({status:500, message:"Something Went Wrong. Please try again"})
            }
        }
    }
    static async destroy(req,res){
        try{
            const {id}=req.params
            const user=req.user
            const news=await prisma.news.findUnique({
                where:{
                    id:Number(id)
                }
            })
            if(news.user_id !== user.id){
                return res.status(401).json({message:"Unauthorized"})
            }
            removeImage(news.image)
            await prisma.news.delete({
                where:{
                    id:Number(id)
                }
            })

            redisCache.del('/api/news',(err)=>{
                if(err) throw err
            })

            return res.json({message:"User deleted Succesfully"})
        }
        catch(e){
            logger.error(e?.message)
            return res.status(500).json({
                status:500,
                message:"Something went wrong"
            })
        }
    }
}

export default NewsController