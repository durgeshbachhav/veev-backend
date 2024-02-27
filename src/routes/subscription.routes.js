import { Router } from "express";

const router = Router();

router.route('/subscribe').get((req, res) => {
     res.send('subscribe')
});

export default router;