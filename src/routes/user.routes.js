import { Router } from "express";

const router = Router();

router.route('/user').get((req, res) => {
     res.send('user');
});  

export default router;
