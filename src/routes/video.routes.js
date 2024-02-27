import { Router } from "express";

const router = Router();

router.route('/video').get((req, res) => {
     res.send('video')
});

export default router;