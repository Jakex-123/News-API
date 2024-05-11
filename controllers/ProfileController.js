import prisma from "../db/db.config.js"
import { idGenerator, imageValidator } from "../utils/helper.js"

class ProfileController{
    static async index(req,res){
        try{
            const user=req.user
            return res.json({status:200,user})
        }
        catch(e){
            logger.error(e?.message)
            return res.status(500).json({message:"Something Went Wrong"})
        }
    }
    static async store(req,res){
        
    }
    static async show(req,res){
        
    }
    static async update(req,res){
        try{
        const {id}=req.params
        if(!req.files || Object.keys(req.files).length===0){
            return res.status(400).json({status:400, message:"Profile Image is Required"})
        }
        const profile=req.files.profile
        const message=imageValidator(profile?.size,profile.mimetype)
        if(message!==null){
            return res.status(400).json({
                errors:{
                    profile:message
                }
            })
        }

        const imgExt=profile?.name.split('.')
        const imageName=idGenerator()+'.'+imgExt[1];
        const uploadPath=process.cwd()+'/public/images/'+imageName
        profile.mv(uploadPath,(err)=>{
            if(err) throw err
        })

        await prisma.users.update({
            data:{
                profile:imageName
            },
            where:{
                id:Number(id)
            }
        })


        return res.json({
            status:200,
            message:"Profile Updated Succesfully"
        })
    }
    catch(e){
        logger.error(e?.message)
        console.log("error is ",e)
        return res.status(500).json({message:"Something went Wrong Please try again"})
    }
    }
    static async destroy(req,res){
        
    }
}

export default ProfileController