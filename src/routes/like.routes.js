import { Router } from "express";

const router = Router();

router.route('/like').get((req, res) => {
     res.send('like')
});

export default router;
