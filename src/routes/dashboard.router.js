import { Router } from "express";

const router = Router();

router.route('/dash').get((req, res) => {
     res.send('dash')
});

export default router;
