const { logger } = require("../../../helpers/logger");
var ResHelper = require(_pathconst.FilesPath.ResHelper);
var ProductService = require(_pathconst.ServicesPath.ProductService);
var ProductValidationV1 = require(_pathconst.ReqModelsPath.ProductValidationV1);
let bcrypt = require('bcrypt');
const axios = require('axios');
const request = require('request');
const { use } = require("chai");



const createProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.createProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
          
            let data = JSON.stringify(req.body);
            
            let config = {
              method: 'post',
            maxBodyLength: Infinity,
              url: `${process.env.base_url}/products.json`,
              headers: { 
                'X-Shopify-Access-Token': process.env.X_Shopify_Access_Token, 
                'Content-Type': 'application/json'
              },
              data : data
            };
            
            let results  =  await  axios(config);
            results=results.data;
            let { id,title,body_html,vendor,product_type} = results.product;
            await ProductService.createProduct( id,title,body_html,vendor,product_type);
            ResHelper.apiResponse(res, true, "Success", 201, results, "");
            
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getAllProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.getAllProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
          
            var options = {
              'method': 'GET',
              'url': `${process.env.base_url}/products.json?fields=id%2Ctitle%2Chandle%2Cbody_html%2Cvendor%2Cproduct_type`,
              'headers': {
                'X-Shopify-Access-Token': process.env.X_Shopify_Access_Token, 
              }
            };
            request(options, async function (error, response) {
              if (error){
                ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
                logger.error(error)
                return;
              } 
              response= JSON.parse(response.body)
              let responseProductIds = []
              for(let i=0;i<response.products.length;i++){
                let product = await ProductService.getProductById(response.products[i].id);
                if(!product) await ProductService.createProduct(response.products[i].id,response.products[i].title,response.products[i].body_html,response.products[i].vendor,response.products[i].product_type);
                else await ProductService.updateProduct(response.products[i].id,response.products[i].title,response.products[i].body_html,response.products[i].vendor,response.products[i].product_type);
                responseProductIds.push(`${response.products[i].id}`);
              }
              if(responseProductIds.length!=0) await ProductService.deleteWhereIn(responseProductIds);
              ResHelper.apiResponse(res, true, "Success", 200, response, "");
            });
           // let products = await ProductService.getAllProduct(pageNumber*pageSize,pageSize);
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}
// }
const deleteProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.deleteProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { id} = req.body;
            let product = await ProductService.getProductById(id);
            if(!product){
                ResHelper.apiResponse(res, false, "No Such Product Found", 201, {}, "");
            }else{
                var options = {
                    'method': 'DELETE',
                    'url':`${process.env.base_url}/products/${id}.json`,
                    'headers': {
                        'X-Shopify-Access-Token': process.env.X_Shopify_Access_Token
                    }
                };
                request(options, async function (error, response) {
                    if (error){
                        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
                        logger.error(error)
                        return;
                    } 
                    console.log(response.body);
                    await ProductService.deleteProduct(id);
                    ResHelper.apiResponse(res, true, "Success", 201, {}, "");
                });
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.updateProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { id,title,body_html,vendor,product_type,status} = req.body;
            let product = await ProductService.getProductById(id);
            if(!product){
                ResHelper.apiResponse(res, false, "No Such Product Found", 201, {}, "");
            }else{
                let options = {
                    'method': 'PUT',
                    'url': `${process.env.base_url}/products/${id}.json`,
                    'headers': {
                        'X-Shopify-Access-Token': process.env.X_Shopify_Access_Token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "product": {
                            id,
                            title,
                            body_html,
                            vendor,
                            product_type
                        }
                    })
                
                    };
                    request(options, function (error, response) {
                    if (error) throw new Error(error);
                    console.log(response.body);
                    });
                await ProductService.updateProduct(id,title,body_html,vendor,product_type);
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
         
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const bookProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.bookProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { product_id,quantity} = req.body;
            let user_id = req.loggedInUser.id;
            console.log(req.loggedInUser)
            let userProduct = await ProductService.getUserProduct(user_id,product_id);
            console.log(userProduct)
            if(userProduct){
                ResHelper.apiResponse(res, false, "Product already exists ", 401, {}, "");
            }
            let product = await ProductService.getProduct(product_id);
            if(!product){
                ResHelper.apiResponse(res, false, "No Such Product Found", 401, {}, "");
            }else{
                if(product.quantity<quantity){
                    ResHelper.apiResponse(res, false, "InSufficient Stock", 401, {}, "");
                }
                await ProductService.bookProduct(user_id,product_id,quantity);
                await ProductService.updateProduct(product.name,product.price,product.quantity-quantity,product.id)
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
         
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const cancelProduct = async (req, res, next) => {
    try {
        const { error } = ProductValidationV1.cancelProduct.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { product_id} = req.body;
            let user_id = req.loggedInUser.id;
            let userProduct = await ProductService.getUserProduct(user_id,product_id);
            if(!userProduct){
                ResHelper.apiResponse(res, false, "No such user Product already exists ", 401, {}, "");
            }
            let product = await ProductService.getProduct(product_id);
            if(!product){
                ResHelper.apiResponse(res, false, "No Such Product Found", 401, {}, "");
            }else{
                await ProductService.cancelProduct(product_id,user_id);
                await ProductService.updateProduct(product.name,product.price,product.quantity+userProduct.quantity,product.id)
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
         
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}
module.exports = {
    createProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    bookProduct,
    cancelProduct
};


