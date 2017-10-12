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
res.status(code || 500).json({"error": message});
}

// define the home page route

router.post('/', function (req, res) {
    req.session.cart = req.session.cart || {};
    var cart = req.session.cart;
    
    //Read the incoming product data
    var id = req.body.productId;

    //Locate the product to be added
    Product.findById(id, function (err, prod) {
        if (err) {
            console.log('Error adding product to cart: ', err);
            res.redirect('/cart');
            return;
        }

        //Add or increase the product quantity in the shopping cart.
        if (cart[id]) {
            cart[id].qty++;
        }
        else {
            cart[id] = {
                id: id,
                name: prod.name,
                price: prod.price,
                prettyPrice: prod.prettyPrice(),
                qty: 1
            };
        }
        
        //Display the cart for the user
        //res.redirect('/cart');
        console.log(cart);
        res.status(201).json(cart);
    });
     
    
})
router.get('/', function (req, res) {
    //Retrieve the shopping cart from memory
    var cart = req.session.cart,
    displayCart = {items: [], total: 0},
    total = 0;
    if (!cart) {
        
        return ejs.renderFile('./views/cart.ejs', {}, (err, html) => {
            res.end(html);
        })
    }

    //Ready the products for display
    for (var item in cart) {
        displayCart.items.push(cart[item]);
        total += (cart[item].qty * cart[item].price);

    }
    req.session.total = displayCart.total = parseFloat(total).toFixed(2);

    var model =
    {
        cart: displayCart
    };
    //res.status(201).json(model.cart);
    ejs.renderFile('./views/cart.ejs', {data:model.cart}, (err, html) => {
         res.end(html);
     })
    
    
})
router.delete('/', function (req, res) {
    req.session.destroy();
    res.redirect("./products/list");
})


module.exports = router;