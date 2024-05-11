import { supportedMimes } from "../config/filesystem.js";
import {v4 as uuidv4} from 'uuid'
import fs from 'fs'

export const imageValidator=(size,mime)=>{
    if(bytesToMB(size)>2) return "Image size should be less than 2MB"
    if(!supportedMimes.includes(mime)) return "Image must be type of png,jpg,jpeg,svg,gif .."
    return null
}

export const bytesToMB=(bytes)=>{
    return bytes/(1024*1024);
}

export const idGenerator=()=>{
    return uuidv4();
}

export const imageUrlGen=(imgName)=>{
    return `${process.env.APP_URL}/images/${imgName}`
}

export const removeImage=(imgName)=>{
    console.log('in')
    const path=process.cwd()+'/public/images/'+imgName;
    console.log(path)
    if(fs.existsSync(path)){
        fs.unlinkSync(path)
    }
}

export const uploadImage=(image)=>{
    const imgExt=image?.name?.split('.')
    const imgName=idGenerator(image.name)+'.'+imgExt[1];        
    const uploadPath=process.cwd()+'/public/images/'+imgName;
    image.mv(uploadPath,(err)=>{
        if(err) throw err
    })
    return imgName
}