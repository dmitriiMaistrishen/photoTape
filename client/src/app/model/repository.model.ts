import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Repository{

	//private path: string = 'http://localhost:80/src';
	//public staticPath: string = 'http://localhost:80';
	private path: string = 'http://185.224.215.238/src';
	public staticPath: string = 'http://185.224.215.238';
	 
	constructor(private http: HttpClient){}

	refresh(next){
		this.http.get( this.path+'/refresh/' ).subscribe(function(responseData){
			next(responseData);
		});
	}

	registerUser(newUserName: string, newUserPassword: string, next){
		let userInfo = {'userName': newUserName, 'userPassword': newUserPassword};

		this.http.post( this.path+'/register/', JSON.stringify(userInfo) ).subscribe(function(responseData){
			next(responseData);
		});
	}

	authoriseUser(userName: string, userPassword: string, next){
		let userInfo = {'userName': userName, 'userPassword': userPassword};

		this.http.post( this.path+'/authorise/', JSON.stringify(userInfo) ).subscribe(function(responseData){
			next(responseData);
		});
	}

	addPost(text: string, files, author: string, next){
		let post = new FormData();

		post.append('text', text);
		post.append('author', author);

		if(files){
			for(let i = 0; i < files.length; i++){
				post.append('file'+i, files[i]);
			}
		}

		this.http.post(this.path+'/post/', post).subscribe(function(responseData){
			next(responseData);
		});
	}

	addComment(parentID, parentCollection, text: string, files, author: string, answerTo, next){
		let comment = new FormData();
		let parent = {id: parentID, collection: parentCollection};

		comment.append( 'parent', JSON.stringify(parent) );
		comment.append('text', text);
		//comment.append('files', files);
		comment.append('author', author);
		comment.append('answerTo', answerTo);

		if(files){
			for(let i = 0; i < files.length; i++){
				comment.append('file'+i, files[i]);
			}
		}

		this.http.post(this.path+'/comment/', comment).subscribe(function(responseData){
			next(responseData);
		})
	}

	like(parentID, parentCollection, next){
		let parentInfo = JSON.stringify( {id: parentID, collection: parentCollection} );

		this.http.post(this.path+'/like/', parentInfo).subscribe(function(responseData){
			next(responseData);
		})		
	}

	dislike(parentID, parentCollection, next){
		let parentInfo = JSON.stringify( {id: parentID, collection: parentCollection} );

		this.http.post(this.path+'/dislike/', parentInfo).subscribe(function(responseData){
			next(responseData);
		})		
	}

}