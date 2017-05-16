"use strict";

var http = require('http');
var url = require('url');
var query = require('querystring');
var fs = require('fs');
var goodreadsAPI = require('goodreads-api-node');//goodreads Wrapper - https://www.npmjs.com/package/goodreads-api-node
const credentials = {                           //goodreads credentials
                key: 'EpzzJJHOkJ419gKZdpnyw',
                secret: 'eHYnIQArXQneyN69Z7IH31vILGXPQ3T1vgxTQRPXE'
            };

var index = fs.readFileSync(__dirname + "/../client/index.html");
var port = process.env.PORT || 3000;

const grAPI = goodreadsAPI(credentials);//goodreads object
var books = require('google-books-search');//google books API Wrapper - https://www.npmjs.com/package/google-books-search

var onRequest = function(request, response){

    var parsedUrl = url.parse(request.url);
    var params = query.parse(parsedUrl.query);

    if(parsedUrl.pathname === "/title") {
        titleSearch(request, response, params);
    }else if(parsedUrl.pathname ==="/isbn"){
        isbnSearch(request, response, params);
    }else{
        //set 200 (okay) status for success
        //set content type for the html file to text/html
        response.writeHead(200, { "Content-Type" : "text/html"} );
        //write html file into the response
        response.write(index);
        //send response to client
        response.end();
    }
};

//get the book data from goodreads using the isbn
function isbnSearch(req, res, params){

    //promise -- write back in the .then portion
    grAPI.searchBooks({q:params.isbn,page: 1, field:'isbn'}).then(function(data){
        var response = JSON.stringify(data);
        
        res.writeHead(200, { "Content-Type" : "application/json"} );
        //write html file into the response
        res.write(response);
        //send response to client
        res.end();
    }).catch(function(err) {
        res.writeHead(400, { "Content-Type" : "application/json"});
        res.write(JSON.stringify(err));
        res.end();
    });;
}

//get the book data from google books using the title
function titleSearch(req, res, params){

    //search google books for matching titles
    books.search(params.title, function(error, results) {
        if ( ! error ) {
            var response = JSON.stringify(results);
            
            res.writeHead(200, { "Content-Type" : "application/json"} );
            //write html file into the response
            res.write(response);
            //send response to client
            res.end();
        } else {
            console.log(error);
        }
    });
}

http.createServer(onRequest).listen(port);
console.log("Listening on localhost: " + port);