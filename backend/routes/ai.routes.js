import express from 'express';
const router = express.Router();
import * as aiCtrl from '../controller/ai.controller.js'

router.get("/get-result", aiCtrl.getResult);
export default router;