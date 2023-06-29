const express = require('express')
const router = express.Router()

// 스키마 연결
const Post = require("../schemas/post.js")

// mongoDB 쿼리 키워드로 검색
// 1. 전체 게시글 목록 조회 API localhost:3000/api/posts
// 제목, 작성자명, 작성 날짜를 조회하기
// 작성 날짜 기준으로 내림차순 정렬하기
router.get('/posts', async (req, res) => {
	try{
		const posts = await Post.find({}).sort({createdAt: -1}) // Post 컬렉션 all 불러오기
		console.log(posts)
		const board = posts.map((post) => {
			return { // 객체구조분해할당: 키값 변경
				postId: post["_id"], // _id 필드는 mongoDB가 default로 주는 id값
				title: post["title"],
				user: post["user"],
				password: post["password"],
				content: post["content"],
				createdAt: post["createdAt"]
				}
		})
		res.status(200).json({data: board})
	} catch (err) {
		res.status(500).json({message: err.message})
	}
})

// 2. 게시글 작성 API
// 제목, 작성자명, 비밀번호, 작성 내용을 입력하기
// 생성 완료 시 {"message": "게시글을 생성하였습니다."}
// 실패 시, { message: '데이터 형식이 올바르지 않습니다.' }
router.post('/posts', async (req, res) => {
	try{
		const {title, user, password, content} = req.body
		const createdPost = await Post.create({title, user, password, content})
	
		res.status(200).json({"message": "게시글을 생성하였습니다."})
	} catch (err) {
		res.status(500).json({message: '데이터 형식이 올바르지 않습니다.' })
	}
	
})

// 3. 게시글 상세 조회 API (GET)
// URL : /posts/:_postId
// 제목, 작성자명, 작성 날짜, 작성 내용을 조회하기 
// (검색 기능이 아닙니다. 간단한 게시글 조회만 구현해주세요.)
// postId find하면 게시글 나오게 하기
// req.params
router.get("/posts/:postId", async(req, res) => { // :postId는 사실상 parameter 이름 // {postId: value}
	try {
		const {postId} = req.params // req.params = { postId: '649c1fd5dbdf7eb015f7e102'}
		// console.log(postId) // 649c1fd5dbdf7eb015f7e102
		const [post] = await Post.find({_id: postId}) // Post"라는 모델에서 "_id" 필드가 "postId"와 일치하는 게시물을 찾는 것을 의미
		const selectedPost = {
			postId: post["_id"],
			title: post["title"],
			user: post["user"],
			password: post["password"],
			content: post["content"],
			createdAt: post["createdAt"]
		}
		res.status(200).json({data: selectedPost})
	} catch (err) {
		res.status(500).json({message: '데이터 형식이 올바르지 않습니다.' })
	}
})


// 4. 게시글 수정 API (PUT)
// URL : /posts/:_postId
// API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 수정되게 하기
// password, title, content
router.put("/posts/:_postId", async(req, res) => {
	const {_postId} = req.params
	const {password, title, content} = req.body
	const [existPost] = await Post.find({_id: _postId})
	// console.log(_postId)
	// console.log(password)
	// console.log(existPost.password)
	try {
		if (!existPost) {
			res.json(404).json({ message: '게시글 조회에 실패하였습니다.' })
		} else if (password === existPost.password) {
			await Post.updateOne({_id: _postId}, {$set: {title, content}})
			res.status(200).json({message: "게시글을 수정하였습니다."})
		}
	} catch (err) {
		res.status(400).json({message: '데이터 형식이 올바르지 않습니다.'})
	}
})



// 5. 게시글 삭제 API (DELETE)
// URL : /posts/:_postId
// API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 삭제되게 하기
// req.params -> postId 추출
// find로 해당 postId 추출
// 조건문
	// 해당 postId의 비밀번호와 입력한 비밀번호의 일치
	// deleteOne
router.delete("/posts/:_postId", async (req, res) => {
	const {_postId} = req.params
	const {password} = req.body
	try {
		const [existPost] = await Post.find({_id: _postId})
		// console.log(existPost)
		console.log(existPost.password) // 1234

		if(!_postId || !password) {
			res.status(404).json({ message: '데이터 형식이 올바르지 않습니다.' })
		} else if (existPost.password = password) {
			await existPost.deleteOne({_id: _postId})
			res.status(200).json({ "message": "게시글을 삭제하였습니다."}
			)
		}
	
	} catch (err) {
		res.status(404).json({ message: '게시글 조회에 실패하였습니다.' })
	}
})


module.exports = router