import { Injectable } from '@angular/core';

import { DataModel } from './data.model';
import { Repository } from './repository.model';

@Injectable()
export class Mainlib{

	public postsIdList = [];
	public sortBy: string = 'time';

	constructor(public data: DataModel, private repository: Repository){};

	/*refresh(){
		this.repository.refresh((response)=>{
			let posts = response['posts'];
			let comments = response['comments'];

			for(let i = 0; i < posts.length; i++){
				let id = posts[i]['_id'];

				if( this.data.posts[id] ){
					this.checkForChanges(this.data.posts[id], posts[i]);
				}else{
					this.data.posts[id] = posts[i];
				}
			}
		})
	}

	checkForChanges(stored, received){
		for(let prop in received){
			if( JSON.stringify( stored[prop] ) != JSON.stringify( received[prop] ) ){
				stored[prop] = received[prop];
			} 
		}
	}*/
	handleError(error){
		alert(error);
	}

	refresh(){
		this.repository.refresh((response)=>{
			let posts = response['posts'];
			let comments = response['comments'];

			this.handleResponsePart(posts, 'posts');
			this.handleResponsePart(comments, 'comments');

			if(this.sortBy == 'time'){
				this.sortPostsByTime();
			}
			if(this.sortBy == 'likeNum'){
				this.sortPostsByLikeNum();
			}
		})
	}

	handleResponsePart(list, type){
		for(let i = 0; i < list.length; i++){
			let id = list[i]['_id'];

			let text =  list[i]['text'];
			let imgRefs = list[i]['files'];
			let author = list[i]['author'];
			let time = list[i]['time'];
			let likes = list[i]['likes'];

			if( this.data[type][id] ){
				if(type == 'posts'){
					let comments = list[i]['comments'];
					let post = this.data.getPost(id);

					if(post['likes'] != likes){
						post['likes'] = likes;
					}
					if( JSON.stringify(post['comments']) != JSON.stringify(comments) ){
						post['comments'] = comments;
					}
				}

				if(type == 'comments'){
					let answerTo = list[i]['answerTo'];
					let comment = this.data.getComment(id);

					if(comment['likes'] != likes){
						comment['likes'] = likes;
					}
				}
			}else{
				if(type == 'posts'){
					let comments = list[i]['comments'];
					this.data.addPost(id, text, imgRefs, author, time, comments, likes);
					this.postsIdList.push(id);
				}
				if(type == 'comments'){
					let answerTo = list[i]['answerTo'];
					this.data.addComment(id, text, imgRefs, author, time, likes, answerTo);
				}
			}
		}
	}

	sortPostsByLikeNum(){
		this.postsIdList.sort( (a, b)=>{
			let postA = this.data.getPost(a);
			let postB = this.data.getPost(b);

			if( postA['likes'] > postB['likes'] ){
				return -1;
			}
			if( postA['likes'] < postB['likes'] ){
				return 1;
			}
			if( postA['likes'] == postB['likes'] ){
				//return 0;
				let postAtime = new Date( this.data.getPost(a)['time'] );
				let postBtime = new Date( this.data.getPost(b)['time'] );

				if(postAtime > postBtime){
					return -1;
				}
				if( postAtime < postBtime ){
					return 1;
				}
				if( postAtime == postBtime ){
					//return 0;
					return 1;
				}
			}
		})
	}

	sortPostsByTime(){
		this.postsIdList.sort( (a, b)=>{
			let postAtime = new Date( this.data.getPost(a)['time'] );
			let postBtime = new Date( this.data.getPost(b)['time'] );

			if(postAtime > postBtime){
				return -1;
			}
			if( postAtime < postBtime ){
				return 1;
			}
			if( postAtime == postBtime ){
				//return 0;
				return 1;
			}

		})
	}

	refreshEveryNsec(N){
		setInterval(()=>{
			this.refresh();
			//console.log('refreshed');
		}, N*1000);
	}

	registerUser(newUserName: string, newUserPassword: string, next){
		this.repository.registerUser(newUserName, newUserPassword, (response)=>{
			if(response['error']){
				this.handleError(response['error']);
				return;
			}
			this.data.setUserName(response['name']);
			next();
		})
	}

	authoriseUser(userName: string, userPassword: string){
		this.repository.authoriseUser(userName, userPassword, (response)=>{
			if(response['error']){
				this.handleError(response['error']);
				return;
			}
			this.data.setUserName(response['name']);
		})
	}

	addPost(text: string, files, next){
		if( this.data.getUserName() ){
			this.repository.addPost(text, files, this.data.getUserName(), (response)=>{
				this.refresh();
				next();
			});
		}else{
			this.handleError('Only authorized users could add posts!');
		}
	}

	addComment(parentID, parentCollection, text: string, files, answerTo, next){
		if( this.data.getUserName() ){
			this.repository.addComment(parentID, parentCollection, text, files, this.data.getUserName(), answerTo, (response)=>{
				this.refresh();
				next();
			});
		}else{
			this.handleError('Only authorized users could comment posts!');
		}
	}

	like(parentID, parentCollection, next){
		if( this.data.getUserName() ){
			this.repository.like(parentID, parentCollection, (response)=>{
				this.refresh();
				next();
			});
		}else{
			this.handleError('Only authorized users could like posts!');
		}
	}

	dislike(parentID, parentCollection, next){
		if( this.data.getUserName() ){
			this.repository.dislike(parentID, parentCollection, (response)=>{
				this.refresh();
				next();
			});
		}else{
			this.handleError('Only authorized users could like posts!');
		}
	}

}