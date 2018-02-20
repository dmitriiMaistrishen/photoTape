import { Injectable } from '@angular/core';

@Injectable()
export class DataModel{
	private userName: string;
	private posts = {};
	private comments = {};

	constructor(){}

	setUserName(userName){
		if(userName){
			this.userName = userName;
		}
	}

	getUserName(){
		return this.userName;
	}

	addPost(id, postText, postImgRefs, author, time, comments, likes){
		this.posts[id] = {'text': postText, 
						'files': postImgRefs, 
						'author': author, 
						'time': time, 
						'comments': comments, 
						'likes': likes };
	}

	getPost(id){
		return this.posts[id];
	}

	updatePost(id, newComments, newLikes){
		if(newComments){
			this.posts[id]['comments'] = newComments;
		}
		if(newLikes){
			this.posts[id]['likes'] = newLikes;
		}
	}

	addComment(id, commentText, commentImgRefs, author, time, likes, answerTo){
		this.comments[id] = {'text': commentText, 
							'files': commentImgRefs, 
							'author': author, 
							'time': time,  
							'likes': likes, 
							'answerTo': answerTo };
	}

	getComment(id){
		return this.comments[id];
	}

	updateComment(id, newLikes){
		if(newLikes){
			this.comments[id]['likes'] = newLikes;
		}
	}
}

