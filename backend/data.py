"""
Data access layer backed by SQLite via SQLAlchemy.
All functions return plain dicts so patterns.py and main.py stay unchanged.
"""

import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from database import (
    SessionLocal,
    Student,
    CheckIn,
    Observation,
    Intervention,
    Buddy,
    ConfessionPost,
    Comment,
    PostLike,  # ← new models
)


def _db() -> Session:
    return SessionLocal()


def get_students() -> list[dict]:
    db = _db()
    try:
        rows = db.query(Student).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_student(student_id: str) -> dict | None:
    db = _db()
    try:
        row = db.query(Student).filter(Student.id == student_id).first()
        return row.to_dict() if row else None
    finally:
        db.close()


def get_students_by_class(class_name: str) -> list[dict]:
    db = _db()
    try:
        rows = db.query(Student).filter(Student.class_name == class_name).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_all_checkins() -> list[dict]:
    db = _db()
    try:
        rows = db.query(CheckIn).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_checkins(student_id: str, days: int | None = None) -> list[dict]:
    db = _db()
    try:
        q = (
            db.query(CheckIn)
            .filter(CheckIn.student_id == student_id)
            .order_by(CheckIn.date)
        )
        rows = q.all()
        result = [r.to_dict() for r in rows]
        if days:
            result = result[-days:]
        return result
    finally:
        db.close()


def add_checkin(checkin: dict):
    db = _db()
    try:
        db.add(CheckIn(**checkin))
        db.commit()
    finally:
        db.close()


def get_observations(student_id: str | None = None) -> list[dict]:
    db = _db()
    try:
        q = db.query(Observation)
        if student_id:
            q = q.filter(Observation.student_id == student_id)
        q = q.order_by(Observation.date.desc())
        return [r.to_dict() for r in q.all()]
    finally:
        db.close()


def add_observation(obs: dict):
    db = _db()
    try:
        if isinstance(obs.get("tags"), list):
            obs["tags"] = json.dumps(obs["tags"])
        db.add(Observation(**obs))
        db.commit()
    finally:
        db.close()


def get_interventions(student_id: str | None = None) -> list[dict]:
    db = _db()
    try:
        q = db.query(Intervention)
        if student_id:
            q = q.filter(Intervention.student_id == student_id)
        q = q.order_by(Intervention.date.desc())
        return [r.to_dict() for r in q.all()]
    finally:
        db.close()


def add_intervention(intervention: dict):
    db = _db()
    try:
        db.add(Intervention(**intervention))
        db.commit()
    finally:
        db.close()


def get_buddy_for_student(student_id: str) -> dict | None:
    db = _db()
    try:
        b = db.query(Buddy).filter(Buddy.student_id == student_id).first()
        if not b:
            return None
        buddy_row = db.query(Student).filter(Student.id == b.buddy_id).first()
        if not buddy_row:
            return None
        return {"buddy": buddy_row.to_dict(), "assigned_date": b.assigned_date}
    finally:
        db.close()


def _post_to_dict(post: ConfessionPost, session_id: str | None = None) -> dict:
    """Serialize a ConfessionPost row to a plain dict, hydrating `liked`."""
    liked = False
    if session_id:
        liked = any(lk.session_id == session_id for lk in post.liked_by)
    return {
        "id": post.id,
        "author": post.author,
        "title": post.title,
        "body": post.body,
        "tag": post.tag,
        "likes": post.likes,
        "created_at": post.created_at.isoformat(),
        "liked": liked,
        "comments": [
            {
                "id": c.id,
                "author": c.author,
                "text": c.text,
                "created_at": c.created_at.isoformat(),
            }
            for c in sorted(post.comments, key=lambda x: x.created_at)
        ],
    }


def get_confession_posts(
    tag: str | None = None,
    search: str | None = None,
    sort: str = "new",
    session_id: str | None = None,
) -> list[dict]:
    db = _db()
    try:
        q = db.query(ConfessionPost)
        if tag:
            q = q.filter(ConfessionPost.tag == tag)
        if search:
            term = f"%{search}%"
            q = q.filter(
                ConfessionPost.title.ilike(term) | ConfessionPost.body.ilike(term)
            )
        if sort == "top":
            q = q.order_by(
                ConfessionPost.likes.desc(), ConfessionPost.created_at.desc()
            )
        else:
            q = q.order_by(ConfessionPost.created_at.desc())

        posts = q.all()
        return [_post_to_dict(p, session_id) for p in posts]
    finally:
        db.close()


def create_confession_post(
    author: str, title: str, body: str, tag: str = "general"
) -> dict:
    db = _db()
    try:
        post = ConfessionPost(
            id=str(uuid.uuid4()),
            author=author,
            title=title,
            body=body,
            tag=tag,
            likes=0,
            created_at=datetime.utcnow(),
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return _post_to_dict(post)
    finally:
        db.close()


def toggle_confession_like(post_id: str, session_id: str) -> dict:
    """Toggle like for a session. Returns {"liked": bool, "likes": int}."""
    db = _db()
    try:
        post = db.query(ConfessionPost).filter(ConfessionPost.id == post_id).first()
        if not post:
            raise ValueError(f"Post {post_id} not found")

        existing = (
            db.query(PostLike)
            .filter(PostLike.post_id == post_id, PostLike.session_id == session_id)
            .first()
        )

        if existing:
            db.delete(existing)
            post.likes = max(0, post.likes - 1)
            liked = False
        else:
            db.add(
                PostLike(id=str(uuid.uuid4()), post_id=post_id, session_id=session_id)
            )
            post.likes += 1
            liked = True

        db.commit()
        return {"liked": liked, "likes": post.likes}
    finally:
        db.close()


def add_confession_comment(post_id: str, author: str, text: str) -> dict:
    db = _db()
    try:
        post = db.query(ConfessionPost).filter(ConfessionPost.id == post_id).first()
        if not post:
            raise ValueError(f"Post {post_id} not found")

        comment = Comment(
            id=str(uuid.uuid4()),
            post_id=post_id,
            author=author,
            text=text,
            created_at=datetime.utcnow(),
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return {
            "id": comment.id,
            "author": comment.author,
            "text": comment.text,
            "created_at": comment.created_at.isoformat(),
        }
    finally:
        db.close()


def get_confession_stats() -> dict:
    db = _db()
    try:
        total_posts = db.query(ConfessionPost).count()
        total_comments = db.query(Comment).count()
        total_likes = (
            db.query(ConfessionPost)
            .with_entities(__import__("sqlalchemy").func.sum(ConfessionPost.likes))
            .scalar()
            or 0
        )
        return {
            "total_posts": total_posts,
            "total_likes": int(total_likes),
            "total_comments": total_comments,
        }
    finally:
        db.close()
