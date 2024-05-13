const express = require("express");
const cors = require("cors");
const FoodBuddyRouter = require("./Router/FoodBuddyRouter/SpFoodBuddyRouter");
const ioRedis = require("ioredis")
const bodyParser = require('body-parser');



    






const App = express();
    App.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    App.use(bodyParser.json({ limit: '100mb' }));
    App.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
    App.use(cors());
    App.use(express.json());
    App.use(express.urlencoded({ extended: true }));

    App.use( "/sp", FoodBuddyRouter)

    const port = 8080;

    App.listen(port,()=>{console.log(`Server Started : port : ${port}`)} );