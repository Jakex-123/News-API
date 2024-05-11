import { imageUrlGen } from "../utils/helper.js";

class newsApiTransform{
    // transform only when small data
    static transform(news){
        return {
            id:news.id,
            heading:news.title,
            news:news.content,
            image:imageUrlGen(news.image),
            created_at:news.created_at,
            reporter:{
                id:news?.user.id,
                name:news?.user.name,
                profile:news?.user?.profile !==null ? imageUrlGen(news?.user?.profile):"https://i.pinimg.com/474x/0a/a8/58/0aa8581c2cb0aa948d63ce3ddad90c81.jpg",
            }
        }
    }
}

export default newsApiTransform