import { Router } from "express";

const router = Router();

router.route('/healthCheck').get((req, res) => {
     res.send('healthCheck')
});

export default router;
