const http = require('http');
const fs = require('fs');
const url = require('url');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let dirPath = '../static/';

MongoClient.connect('mongodb://localhost:27017/usersdb', function(err, db){
	if(err){
		errorHandler(err);
	}

	let server = http.createServer(function(req,res){

		rout(req,res,db);

	}).listen(8080, function(){
		console.log('server listening port 8080');
	});			
});

function rout(req,res,db){
	let reqPath = url.parse(req.url).pathname;
	if( (req.method == 'POST')&&(reqPath == '/register/') ){
		register(req, res, db );
	}
	if( (req.method == 'POST')&&(reqPath == '/authorise/') ){
		authorise(req, res, db );
	}
	//another type of refresh, could be used in extension later
	/*if( (req.method == 'POST')&&(reqPath == '/refresh/') ){
		getSome(req, res, db );
	}*/
	
	if( (req.method == 'POST')&&(reqPath == '/post/') ){
		receive(req, res, db , 'post');
	}
	if( (req.method == 'POST')&&(reqPath == '/comment/') ){
		receive(req, res, db , 'comment');
	}
	if( (req.method == 'POST')&&(reqPath == '/like/') ){
		like(req, res, db, 'like');
	}
	if( (req.method == 'POST')&&(reqPath == '/dislike/') ){
		like(req, res, db, 'dislike');
	}

	/*if( (req.method == 'GET')&&(reqPath == '/log/') ){
		printCollections(db, [ 'stock', 'comments', 'users' ]);
		res.end();
	}
	if( (req.method == 'GET')&&(reqPath == '/clean/') ){
		cleanCollections(db, [ 'stock', 'comments', 'users' ]);
		res.end();
	}*/
	if( (req.method == 'GET')&&(reqPath == '/refresh/') ){
		getAll(req, res, db);
	}

	//delete is not allowed due to security policy
	/*if( (req.method == 'DELETE')&&(reqPath == '/post/') ){
		deletePost(req, res, db , 'post');
	}*/	
}

function errorHandler(err){
	console.log(JSON.stringify(err));
}

////////////////////////////////////////////////highest level / specific, do not reuse////////////////////////////////////////////////

function register(req, res, db){

	let data = [];
	req.on('data', function(chunk){
		data.push(chunk);
	})

	req.on('end', function(){
		data = Buffer.concat(data);

		let userInfo = JSON.parse(data);
		let userName = userInfo['userName'];
		let userPassword = userInfo['userPassword'];

		let newID = new ObjectID();
		let collection = db.collection('users');

		let user = new User(newID, userName, userPassword);
		collection.findOne( {'name': user['name']}, function(err, result){
			if(err){
				errorHandler(err);
			}
			if(!result){
				addNew(user, collection, function(){
					res.end( JSON.stringify(user) );
				})
			}else{
				res.end( JSON.stringify( {'error': 'User with such name already exists!'} ) )
			}
		})
	})
}

function authorise(req, res, db){

	let data = [];
	req.on('data', function(chunk){
		data.push(chunk);
	})
	req.on('end', function(){
		data = Buffer.concat(data);

		let userInfo = JSON.parse(data);
		let userName = userInfo['userName'];
		let userPassword = userInfo['userPassword'];

		db.collection('users').findOne({ 'name': userName }, function(err, user){
			if(err){
				errorHandler(err);
			}

			if(user){
				if(user['password'] == userPassword){
					res.end( JSON.stringify(user) );
				}
				else{
					res.end( JSON.stringify( {'error': 'Password is incorrect. Please try again'} ) );
				}
			}else{
				res.end( JSON.stringify( {'error': 'No such user. Please check if name is correct'} ) );
			}
		})	
	})
}

//will return only posts user DONT have, but not the likes info. 
//returning the likes info means request all post anyway, so
//it's probably better to delegate analysis to browser (see getAll func) 
function getSome(req, res, db){
	let data = [];
	req.on('data', function(chunk){
		data.push(chunk);
	})
	req.on('end', function(){
		data = Buffer.concat(data);

		let clientInfo = JSON.parse(data);
		let clientPosts = clientInfo['posts'];
		let clientComments = clientInfo['comments'];

		let postsCollection = db.collection('stock');
		let commentsCollection = db.collection('comments');

		//just a trick here, to make $nor work in any case
		if(clientPosts.length == 0){
			clientPosts.push( new ObjectID() );
		}

		if(clientComments.length == 0){
			clientComments.push( new ObjectID() );
		}
		//

		getManyNotInList(clientPosts, postsCollection, function(posts){
			getManyNotInList(clientComments, commentsCollection, function(comments){
				let result = { 'posts': posts, 'comments': comments }
				res.end( JSON.stringify(result) ); 
			})
		})
	})
}

//this is much easier for server (actually db)
//and could be used with a GET request. Our API is
//RESTfull now!
function getAll(req, res, db){
	let postsCollection = db.collection('stock');
	let commentsCollection = db.collection('comments');
	let result = {};

	postsCollection.find().toArray(function(err, posts){
		if(err){
			errorHandler(err);
		}
		commentsCollection.find().toArray(function(err, comments){
			if(err){
				errorHandler(err);
			}
			result = { 'posts': posts, 'comments': comments }
			res.end( JSON.stringify(result) );
		})
	})
}

///////////////////////////////////////////////////////////hight level////////////////////////////////////////////////////////////////

function receive(req, res, db, type){

	let form = formidable.IncomingForm();

	let newID = new ObjectID();
	let filePath = ''; //path to files in dir static/
	let fileCounter = 0;
	let files = [];

	if(type == 'post'){
		filePath = 'images'+ '/' + newID; 
	}

	if(type == 'comment'){
		filePath = 'comments'+ '/' + newID; 
	}

	fs.mkdir(dirPath + filePath, function(){  //global variable dirPath here!!!
		
			form.on('fileBegin', function(name, file) {
				file.path = dirPath + filePath + '/' + fileCounter;  //global variable dirPath here!!!
				files[fileCounter] = {path: filePath + '/' + fileCounter, type: file.type};
				fileCounter++;	
			});

			form.parse(req, function(err, fields){
				if(type == 'post'){
					let collection = db.collection('stock');
					let post = new Post( newID, fields['text'], files, fields['author'], new Date() );
					post.collection = 'stock';

					addNew(post, collection, function(){
						res.end();
					})
				}

				if(type == 'comment'){
					let parentInfo = JSON.parse(fields['parent']);
					let parentId = new ObjectID(parentInfo['id']);
					let parentCollection = db.collection(parentInfo['collection']);

					let collection = db.collection('comments');
					let comment = new Comment( newID, fields['text'], files, fields['author'], new Date(), fields['answerTo'] );
					comment.collection = 'comments';

					getSingle( parentId, parentCollection, function(result){
						result.comments.push(newID);
						update( parentId, parentCollection, { comments: result.comments }, function(){
							addNew(comment, collection, function(){
								res.end();
							})
						})
					})

				}
			})
	})
}

function like(req, res, db, type){

	let data = [];
	req.on('data', function(chunk){
		data.push(chunk);
	})

	req.on('end', function(){
		data = Buffer.concat(data);

		let parentInfo = JSON.parse(data);
		let id = new ObjectID(parentInfo['id']);
		let collection = db.collection(parentInfo['collection']);

		getSingle( id, collection, function(result){
			if(type == 'like'){
				update( id, collection, {likes: ++result.likes}, function(){
					res.end();
				} )
			}
			if(type == 'dislike'){
				update( id, collection, {likes: --result.likes}, function(){
					res.end();
				} )
			}
		})
	});
}

function deletePost(req, res, db){

	let data = [];
	req.on('data', function(chunk){
		data.push(chunk);
	})

	req.on('end', function(){
		data = Buffer.concat(data);

		let postInfo = JSON.parse(data);
		let id = new ObjectID(postInfo['id']);
		let collection = db.collection(postInfo['collection']);

		getSingle(id, collection, function(post){
			deleteFiles(post['files'], function(){
				collection.deleteOne({ _id: post['_id'] }, function(){
					getMany(post['comments'], db.collection('comments'), function(comments){
						deleteComments(comments, db.collection('comments'), function(){
							res.end();
						})
					})
				})
			})
		})
	})

	async function deleteFiles(files, next){
		function handleFile(path){
			let promise = new Promise(function(resolve){
				fs.unlink(path, function(){
					resolve();
				})
			})
			return promise;
		}
		for(let fileCounter = 0; fileCounter < files.length; fileCounter++){
			await handleFile(files[fileCounter]['path']);
		}
		next();
	}

	async function deleteComments(comments, collection, next){

		let commentsList = [];

		function handleComment(comment){
			let promise = new Promise(function(resolve){
					commentsList.push( { _id: comment['_id']} );
					deleteFiles(comment['files'], function(){
						resolve();
					})
			})
			return promise;
		}
		for(let commentCounter = 0; commentCounter < comments.length; commentCounter++){
			await handleComment(comments[commentCounter]);
		}
		collection.deleteMany({ $or: commentsList }, function(){
			next();
		})
	}
}

//////////////////////////////////////////////////////////low level///////////////////////////////////////////////////////////////////

function addNew(obj, collection, next){
	collection.insertOne(obj, function(error, result){
		if(error){
			errorHandler(error);
		}
		if(next){
			next();
		}
	})
}

function getSingle(id, collection, next){
	collection.findOne({ _id: id }, function(error, result){
		if(error){
			errorHandler(error);
		}
		if(next){
			next(result);
		}
	})
}

function getMany(list, collection, next){
	let query = [];
	for(let i = 0; i < list.length; i++){
		query.push( { _id: list[i] } );
	}

	collection.find({$or: query}).toArray(function(err, result){
		next(result);
	})
}

function getManyNotInList(list, collection, next){
	let query = [];
	for(let i = 0; i < list.length; i++){
		query.push( { _id: new ObjectID(list[i]) } );
	}

	collection.find({$nor: query}).toArray(function(err, result){
		next(result);
	})
}

function update(id, collection, update, next){
	collection.updateOne({ _id: id }, { $set: update }, function(error, result){
		if(error){
			errorHandler(error);
		}
		if(next){
			next();
		}
	})
}

class User{
	constructor(id, name, password){
		this._id = id;
		this.name = name;
		this.password = password;
		//this.posts = [];
		//this.comments = [];
	}
}

class Post{
	constructor(id, text, files, author, time){
		this._id = id;
		this.text = text;
		this.files = files;
		this.author = author;
		this.time = time;
		this.likes = 0;
		this.comments = [];
		//this.comments = {};
		this.collection = '';
	}
}

class Comment extends Post{
	constructor(id, text, files, author, time, answerTo){
		super(id, text, files, author, time);
		this.answerTo = answerTo;
	}
}

///////////////////////////////////////////////for debug only///////////////////////////////////////////////////////////////
async function printCollections(db, collectionsList){
	function handleCollection(db, collection){
		let promise = new Promise(function(resolve){
			db.collection(collection).find().toArray(function(err, result){
				if(err){
					console.log(err);
					return;
				}

				console.log(`collection ${collection}: 				${JSON.stringify(result)}`);
				console.log(`total: ${result.length}`);
				resolve();
			})
		});
		return promise;
	}

	for(let i = 0; i < collectionsList.length; i++){
		await handleCollection(db, collectionsList[i]);
	}
}

async function cleanCollections(db, collectionsList){
	function handleCollection(db, collection){
		let promise = new Promise(function(resolve){
			db.collection(collection).deleteMany({},function(err, result){
				if(err){
					console.log(err);
					return;
				}
				console.log(`collection ${collection} cleaned`);
				resolve();
			})
		})
		return promise;
	}

	for(let i = 0; i < collectionsList.length; i++){
		await handleCollection(db, collectionsList[i]);
	}
}

