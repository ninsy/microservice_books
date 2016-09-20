var goodGuy = require('good-guy-http')({
    maxRetries: 3
});
var jp = require('jsonpath');
var router = require("express").Router();

var apiUrl = "https://book-catalog-proxy-4.herokuapp.com/book?isbn=";

router.get("/:isbn", function(req,res,next) {

    goodGuy(apiUrl+req.params.isbn)
        .then(function(response) {

            var parsed = JSON.parse(response.body);
            console.log(parsed);

            if(parsed.totalItems === 0) {
                res.render("index",
                    {
                        title: "No element found."
                    });
            } else {
                var availabilityUrl = (process.env.INVENTORY_SERVICE || "https://servicebookinventory.herokuapp.com/stock/") + req.params.isbn;
                res.render("book",
                    {
                        title: jp.value(parsed, '$..title'),
                        cover: jp.value(parsed, '$..thumbnail'),
                        availabilityUrl: availabilityUrl,
                        partials: {
                            layout: "layout_file"
                        }
                    });
            }
        })
        .catch(function(err) {
            next(err);
        });
});

module.exports = router;