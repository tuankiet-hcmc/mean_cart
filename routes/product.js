var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    ejs = require('ejs');

var router = express.Router();
var Product = mongoose.model('Product');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
}

// define the home page route
router.get('/', function(req, res) {
    ejs.renderFile('./views/addProduct.ejs', {}, (err, html) => {
        res.end(html);
    });
})
router.post('/', function(req, res) {
    var newProduct = Product(req.body);
    var errMes = '';
    newProduct.save(function(err, doc) {

        if (err) {
            errMes = err.message;
            ejs.renderFile('./views/addProduct.ejs', { errMes: errMes }, (err, html) => {
                res.end(html);
            });
        } else {
            ejs.renderFile('./views/addProduct.ejs', {}, (err, html) => {
                res.end(html);
            });
        }
    });

})
router.get('/list', function(req, res) {
    var cart = req.session.cart,
        total = 0;
    for (var item in cart) {
        total += cart[item].qty;
    }
    Product.find({}, function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get products.");
        } else {
            ejs.renderFile('./views/listProduct.ejs', { data: docs, total: total }, (err, html) => {
                res.end(html);
            });
        }
    });
    var item = {};

})
router.get('/list/:name', function(req, res) {
    var cart = req.session.cart,
        total = 0;
    for (var item in cart) {
        total += cart[item].qty;
    }
    Product.find({ name: req.params.name }, function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get products.");
        } else {
            if (docs.length == 0) {
                Product.find({ $text: { $search: req.params.name } }, function(err, docs) {
                    if (err) {
                        handleError(res, err.message, "Failed to get products.");
                    } else {
                        res.status(200).json(docs);
                    }
                });
            } else
                res.status(200).json(docs);
        }
    });


    var item = {};

})
router.delete("/list/:id", function(req, res) {
    Product.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, function(err, model) {
        if (err) {
            handleError(res, err.message, "Failed to delete product.");
        }
        if (model) {
            model.remove(function(err) {
                if (err) {
                    handleError(res, err.message, "Failed to delete product.");
                } else {
                    res.status(200).json(req.params.id);
                }
            });
        }
    });

})

module.exports = router;