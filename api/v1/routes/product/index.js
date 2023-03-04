
const express = require("express");


const router = express.Router();
var ProductControllerV1 = require(_pathconst.ControllersPath.ProductControllerV1);

router.post("/createProduct",  ProductControllerV1.createProduct);
router.post("/getAllProduct",  ProductControllerV1.getAllProduct);
router.post("/deleteProduct",  ProductControllerV1.deleteProduct);
router.post("/updateProduct",  ProductControllerV1.updateProduct);

//router.post("/loginCEO", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.get);


module.exports = router;