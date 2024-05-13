const express = require("express");
const SpController = require("../../Controller/SpController")
const Router = express.Router();


Router.get("/", SpController.StartScraping_Get);                         

module.exports = Router;