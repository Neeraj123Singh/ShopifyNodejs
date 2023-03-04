

var Joi = require("joi");

const createProduct= Joi.object({
  product: Joi.object({
    title:Joi.string().required(),
    body_html:Joi.string().required(),
    vendor:Joi.string().required(),
    product_type:Joi.string().required(),
    status: Joi.string().required()
  })
  });

const getAllProduct= Joi.object({
  });

  const deleteProduct= Joi.object({
     id:Joi.number().required()
  });

  const updateProduct= Joi.object({
    id:Joi.number().required(),
    title:Joi.string().required(),
    body_html:Joi.string().required(),
    vendor:Joi.string().required(),
    product_type:Joi.string().required(),
    status: Joi.string().required()
 });

module.exports = {
    createProduct,
    getAllProduct,
    deleteProduct,
    updateProduct
}