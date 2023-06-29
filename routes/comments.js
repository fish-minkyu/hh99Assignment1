const express = require('express')
const router = express.Router()

// 스키마 연결
const Comments = require("../schemas/comments.js")

// 1. 댓글 목록 조회 (GET)
// URL : /posts/:_postId/comments
// 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
// 작성 날짜 기준으로 내림차순 정렬하기
router.get("/posts/:_postId/comments", async(req, res) => {
    const resource = await Comments.find({}).sort({createdAt: -1})
    console.log(resource)
    try {
        const commentList = resource.map((item) => {
            return {
                commentId: item["_id"],
                user: item["user"],
                content: item["content"],
                createdAt: item["createdAt"]
            }
        })
        res.status(200).json({data: commentList})
    } catch (err) {
        res.status(400).json({message: '데이터 형식이 올바르지 않습니다.'})
    }
})


// 2. 댓글 작성 (POST)
// URL : /posts/:_postId/comments
// 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post("/posts/:_postId/comments", async(req, res) => {
    const {user, password, content} = req.body
    try {
        // if (!user || !password || !content) {
        //     res.status(400).json({message: "댓글 내용을 입력해주세요."})
        // } else { 
        const createdComment = await Comments.create({user, password, content})
        res.status(200).json({"message": "댓글을 생성하였습니다."})
    } catch (err) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다."})
    }
})


// 3. 댓글 수정 (PUT)
// URL : /posts/:_postId/comments/:_commentId
// 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
// 1. req.body 선언
// 2. req.params를 _commentId에 넣기
// 3. const comment = Comments.find({_id: _commentId})
// 4. 조건문
    // comment.content에서 내용이 없을 시 status:400, {message: '댓글 내용을 입력해주세요.'}
    // comment가 없을 시, status: 404, { message: '댓글 조회에 실패하였습니다. }
    // updateOne({_id: }, {&set: {}})
router.put("/posts/:_postId/comments/:_commentId", async (req, res) => {
    const {_commentId} = req.params
    const {password, content} = req.body
    try {
        const [foundComment] = await Comments.find({_id: _commentId})
        console.log(foundComment)

        if (!foundComment) {
            res.status(404).json({message: '댓글 조회에 실패하였습니다.'})
        } else if (!content) {
            res.status(400).json({message: '댓글 내용을 입력해주세요.'})
        } 

        if(foundComment.password === password) {
            await Comments.updateOne({_id: _commentId}, {$set: {content}})
            res.status(200).json({message: "댓글을 수정하였습니다."})
        }
        
    } catch (err) {
        res.status(400).json({message: '데이터 형식이 올바르지 않습니다.'})
    }
})


// 4. 댓글 삭제 (DELETE)
// URL : /posts/:_postId/comments/:_commentId
// 원하는 댓글을 삭제하기
router.delete("/posts/:_postId/comments/:_commentId", async(req, res) => {
    const {_commentId} = req.params
    const {password} = req.body
    try {
        const [result] = await Comments.find({_id: _commentId})
        if(!result) {
            res.status(400).json({message: "댓글 내용을 입력해주세요"})
        } else if (result.password == password) {
            await Comments.deleteOne({_id: _commentId})
            res.status(200).json({message: "댓글을 삭제하였습니다."})
        }
    } catch {
        res.status(400).json({message: "데이터 형식이 올바르지 않습니다."})
    }
})


module.exports = router
