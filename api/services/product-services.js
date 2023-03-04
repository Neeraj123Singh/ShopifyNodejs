const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');
const { logger } = require("../helpers/logger");
var uuid = require('node-uuid');
const createProduct = async ( product_id,title,body_html,vendor,product_type) => {
    let query = `insert into products(id, product_id,title,body_html,vendor,product_type) values(?,?,?,?,?,?) `
    let bindParams = [uuid.v4(),  product_id,title,body_html,vendor,product_type]
    await sequelize.query(query, { replacements: bindParams, type: QueryTypes.INSERT });
};



const getAllProduct = async (offset,limit) => {
    let query = `select * from products  limit ${limit} offset ${offset} `
    let bindParams = []
    return await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
};

const getProduct = async (id) => {
    let query = `select * from products  where id = ? `
    let bindParams = [id]
    let product = await sequelize.query(query, { replacements: bindParams, type: QueryTypes.SELECT });
    return product[0]
};
const deleteProduct = async (id) => {
    let query = `delete from products  where product_id = ? `
    let bindParams = [id]
    return await sequelize.query(query, { replacements: bindParams, type: QueryTypes.DELETE });
};

const updateProduct = async (product_id,title,body_html,vendor,product_type) => {
    let query = `update products  set title=?,body_html=?,vendor=?,product_type=? where product_id = ? `
    let bindParams = [title,body_html,vendor,product_type,product_id]
    return await sequelize.query(query, { replacements: bindParams, type: QueryTypes.UPDATE });
};

const getUserProduct = async(user_id,product_id) =>{
    let query = ` select * from bookings where user_id = ? and product_id = ? `;
    let bindParams =[user_id,product_id];
    let userProduct = await sequelize.query(query,{ replacements: bindParams, type: QueryTypes.SELECT });
    return userProduct[0];
}



const deleteWhereIn = async(ids) =>{
    let query = ` delete from products where product_id not in (?) `;
    let bindParams =[ids];
    let userProduct = await sequelize.query(query,{ replacements: bindParams, type: QueryTypes.DELETE });
}

const getProductById = async(id) =>{
    let query = ` select * from  products where product_id = ? `;
    let bindParams =[id];
    let userProduct = await sequelize.query(query,{ replacements: bindParams, type: QueryTypes.SELECT });
    return userProduct[0];
}
module.exports = {
    createProduct,
    getAllProduct,
    getProduct,
    deleteProduct,
    updateProduct,
    getUserProduct,
    deleteWhereIn,
    getProductById
}