import rateLimit from "express-rate-limit";

export const limitter=rateLimit({
    windowMs:60*1000,
    limit:10,
    standardHeaders:'draft-7',
    legacyHeaders:'false'
})