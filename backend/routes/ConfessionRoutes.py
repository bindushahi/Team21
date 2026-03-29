# backend/routes/confession_routes.py

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional
from data import (
    get_confession_posts,
    create_confession_post,
    toggle_confession_like,
    add_confession_comment,
    get_confession_stats,
)

router = APIRouter(prefix="/api/confessions", tags=["confessions"])


# ── Schemas ───────────────────────────────────────────────────────────────────


class PostCreate(BaseModel):
    author: str = Field(..., max_length=80)
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=5000)
    tag: str = Field(default="general", max_length=50)


class CommentCreate(BaseModel):
    author: str = Field(..., max_length=80)
    text: str = Field(..., min_length=1, max_length=1000)


class LikeToggle(BaseModel):
    session_id: str = Field(..., min_length=8, max_length=128)


# ── Routes ────────────────────────────────────────────────────────────────────


@router.get("/")
def list_posts(
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: str = Query("new"),
    session_id: Optional[str] = Query(None),
):
    return get_confession_posts(
        tag=tag, search=search, sort=sort, session_id=session_id
    )


@router.post("/", status_code=201)
def create_post(body: PostCreate):
    return create_confession_post(
        author=body.author,
        title=body.title,
        body=body.body,
        tag=body.tag,
    )


@router.post("/{post_id}/like")
def like_post(post_id: str, body: LikeToggle):
    try:
        return toggle_confession_like(post_id, body.session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{post_id}/comments", status_code=201)
def comment_on_post(post_id: str, body: CommentCreate):
    try:
        return add_confession_comment(post_id, body.author, body.text)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stats/summary")
def stats():
    return get_confession_stats()
