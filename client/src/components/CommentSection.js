import React, { useState, useEffect } from "react"
import { List, Avatar, Skeleton, Divider } from "antd"
import { DELETE_COMMENT } from "../utils/mutations/commentMutations"
import { useMutation } from "@apollo/client"
import { DeleteOutlined } from "@ant-design/icons"
import "./styles/CommentSection.css"
import { message } from "antd"
const CommentSection = ({ comments, songId }) => {
    const username = localStorage.getItem("username")
    const token = localStorage.getItem("token")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [removeComment, { error }] = useMutation(DELETE_COMMENT)
    const loadMoreData = () => {
        if (loading) {
            return
        }

        setLoading(true)
        //TODO: create a function to load more data once you reach bottom of page
        setData([...comments])
        setLoading(false)
    }

    const removeCommentHandler = async (event) => {
        event.preventDefault()
        try {
            await removeComment({
                variables: {
                    songId: songId,
                    commentId: event.currentTarget.id,
                    token: token,
                    commentAuthor: event.currentTarget.name,
                },
            })
            await message.success("Successfully removed comment.")
        } catch (err) {
            message.error("Error removing comment.")
        }
    }

    useEffect(() => {
        loadMoreData()
    }, [comments.length])
    return (
        <div
            id="scrollableDiv"
            style={{
                height: 400,
                overflow: "auto",
                padding: "0 16px",
                border: "1px solid rgba(140, 140, 140, 0.35)",
            }}
        >
            <List
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            className="avatar"
                            avatar={<Avatar src="" />}
                            title={
                                <a href="https://ant.design">
                                    {item.commentAuthor}
                                </a>
                            }
                        />
                        <div className="comment-text" style={{ marginRight: 10 }}>
                            {item.commentText}
                        </div>
                        <button
                            id={item._id}
                            name={item.commentAuthor}
                            onClick={removeCommentHandler}
                            style={{
                                backgroundColor: "#FFFFFF",
                                cursor: "pointer",
                            }}
                        >
                            <DeleteOutlined style={{ fontSize: "1.2rem" }} />
                        </button>
                    </List.Item>
                )}
            />
        </div>
    )
}

export default CommentSection
