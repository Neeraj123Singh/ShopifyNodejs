'use strict';

const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 
      await queryInterface.createTable('products', 
      {
        id:{
          allowNull:false,
          type: Sequelize.UUID, //changing this to Sequelize.UUID does not make any difference
          default: Sequelize.UUIDV4
        },
        product_id: {
          type:Sequelize.INTEGER,
          allowNull:false
        },
        title: {
          type:Sequelize.STRING,
          allowNull:false
        },
        body_html: {
          type:Sequelize.STRING,
          allowNull:false
        },
        vendor: {
          type:Sequelize.STRING,
          allowNull:false
        },
        product_type: {
          type:Sequelize.STRING,
          allowNull:false
        },
        created_at:{
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
  },
  {
    timeStamp: true,
    createdAt: true,
    updatedAt: true
  });
}, 

  async down (queryInterface, Sequelize) {
  
      await queryInterface.dropTable('products');
     
  }
};
