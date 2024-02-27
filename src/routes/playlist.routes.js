import { Router } from "express";

const router = Router();

router.route('/playlist').get((req, res) => {
     res.send('playlist')
});

export default router;