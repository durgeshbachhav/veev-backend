import { Router } from "express";

const router = Router();

router.route('/tweet').get((req, res) => {
     res.send('tweet')
});

export default router;