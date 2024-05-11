import { Router } from 'express';
import AuthController from '../controllers/AuthControllers.js';
import AuthMiddleware from '../middlewares/Authenticated.js';
import ProfileController from '../controllers/ProfileController.js';
import NewsController from '../controllers/NewsController.js';
import redisCache from '../db/redis.config.js';

const router=Router()

router.post('/auth/register',AuthController.register)
router.post('/auth/login',AuthController.login)
router.get("/send-email",AuthController.sendEMail)

router.get('/profile',AuthMiddleware,ProfileController.index)
router.put('/profile/:id',AuthMiddleware,ProfileController.update)

router.get('/news',redisCache.route(),NewsController.index)
router.post('/news',AuthMiddleware,NewsController.store)
router.get('/news/:id',redisCache.route(),NewsController.show)
router.put('/news/:id',AuthMiddleware,NewsController.update)
router.delete('/news/:id',AuthMiddleware,NewsController.destroy)



export default router