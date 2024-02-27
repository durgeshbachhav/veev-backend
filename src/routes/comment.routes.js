import { Router } from "express";

const router = Router();

router.route('/comment').get((req, res) => {
     res.send('comment')
});

export default router;
