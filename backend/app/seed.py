from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import (
    Event,
    EventAthlete,
    EventCategory,
    EventResult,
    Group,
    GroupEventScore,
    GroupMember,
    User,
    UserEventScore,
    UserPick,
)


def reset_data(db: Session) -> None:
    db.query(GroupEventScore).delete()
    db.query(UserEventScore).delete()
    db.query(UserPick).delete()
    db.query(GroupMember).delete()
    db.query(Group).delete()
    db.query(EventResult).delete()
    db.query(EventAthlete).delete()
    db.query(EventCategory).delete()
    db.query(Event).delete()
    db.query(User).delete()
    db.commit()


def seed_events(db: Session) -> dict[str, Event]:
    now = datetime.now(timezone.utc)

    upcoming_event = Event(
        name="World Cup Prague",
        starts_at=now + timedelta(days=20),
        status="upcoming",
        is_official=True,
        visibility="public",
    )
    open_event = Event(
        name="World Cup Tacen",
        starts_at=now + timedelta(days=7),
        status="open",
        is_official=True,
        visibility="public",
    )
    in_progress_event = Event(
        name="World Cup Ivrea",
        starts_at=now - timedelta(hours=2),
        status="in_progress",
        is_official=True,
        visibility="public",
    )
    finished_event = Event(
        name="World Championships",
        starts_at=now - timedelta(days=5),
        status="finished",
        is_official=True,
        visibility="public",
    )
    db.add_all([upcoming_event, open_event, in_progress_event, finished_event])
    db.commit()
    for event in (upcoming_event, open_event, in_progress_event, finished_event):
        db.refresh(event)
    return {
        "upcoming": upcoming_event,
        "open": open_event,
        "in_progress": in_progress_event,
        "finished": finished_event,
    }


def seed_categories(db: Session, event: Event, use_default_dark_horse: bool) -> list[EventCategory]:
    categories = [
        "K1 Women",
        "K1 Men",
        "C1 Women",
        "C1 Men",
    ]
    rows = []
    for name in categories:
        dark_horse_min_rank = None if use_default_dark_horse else 15
        rows.append(
            EventCategory(
                event_id=event.id,
                name=name,
                is_active=True,
                dark_horse_min_rank=dark_horse_min_rank,
            )
        )
    db.add_all(rows)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows


def seed_athletes(db: Session, event: Event, category: EventCategory, names: list[str]) -> list[EventAthlete]:
    athletes = []
    for index, name in enumerate(names, start=1):
        athletes.append(
            EventAthlete(
                event_id=event.id,
                event_category_id=category.id,
                name=name,
                country_code="BRA" if index % 2 == 0 else "USA",
                ranking_position=index,
            )
        )
    athletes.append(
        EventAthlete(
            event_id=event.id,
            event_category_id=category.id,
            name=f"{names[-1]} Dark Horse",
            country_code="ESP",
            ranking_position=12,
        )
    )
    db.add_all(athletes)
    db.commit()
    for athlete in athletes:
        db.refresh(athlete)
    return athletes


def seed_results(db: Session, event: Event, category: EventCategory, athletes: list[EventAthlete]) -> None:
    result = EventResult(
        event_id=event.id,
        event_category_id=category.id,
        first_athlete_id=athletes[0].id,
        second_athlete_id=athletes[1].id,
        third_athlete_id=athletes[2].id,
        dark_horse_athlete_id=athletes[-1].id,
        status="approved",
    )
    db.add(result)
    db.commit()


def seed_users(db: Session) -> User:
    user = User(email="user@canoeguru.com", display_name="Thiago")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_group(db: Session, owner: User) -> Group:
    group = Group(name="Liga da Galera", type="public", owner_user_id=owner.id)
    db.add(group)
    db.commit()
    db.refresh(group)

    member = GroupMember(group_id=group.id, user_id=owner.id, role="owner", status="active")
    db.add(member)
    db.commit()
    return group


def seed_scores(db: Session, user: User, group: Group, event: Event) -> None:
    user_score = UserEventScore(user_id=user.id, event_id=event.id, points_total=1250, rank_position=1)
    group_score = GroupEventScore(
        group_id=group.id,
        user_id=user.id,
        event_id=event.id,
        points_total=1250,
        rank_position=1,
    )
    db.add_all([user_score, group_score])
    db.commit()


def seed_picks(db: Session, user: User, event: Event, category: EventCategory, athletes: list[EventAthlete]) -> None:
    pick = UserPick(
        user_id=user.id,
        event_id=event.id,
        event_category_id=category.id,
        first_athlete_id=athletes[0].id,
        second_athlete_id=athletes[1].id,
        third_athlete_id=athletes[2].id,
        dark_horse_athlete_id=athletes[-1].id,
    )
    db.add(pick)
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        reset_data(db)
        user = seed_users(db)
        events = seed_events(db)

        upcoming_categories = seed_categories(db, events["upcoming"], use_default_dark_horse=True)
        open_categories = seed_categories(db, events["open"], use_default_dark_horse=True)
        in_progress_categories = seed_categories(db, events["in_progress"], use_default_dark_horse=True)
        finished_categories = seed_categories(db, events["finished"], use_default_dark_horse=True)

        open_k1w = next(cat for cat in open_categories if cat.name == "K1 Women")
        open_k1w_athletes = seed_athletes(
            db,
            events["open"],
            open_k1w,
            ["Jessica Fox", "Ana Satila", "Ricarda Funk", "Maialen Chourraut"],
        )
        seed_picks(db, user, events["open"], open_k1w, open_k1w_athletes)

        for category in open_categories:
            if category.id == open_k1w.id:
                continue
            seed_athletes(
                db,
                events["open"],
                category,
                ["Athlete One", "Athlete Two", "Athlete Three", "Athlete Four"],
            )

        for category in upcoming_categories:
            seed_athletes(
                db,
                events["upcoming"],
                category,
                ["Future One", "Future Two", "Future Three", "Future Four"],
            )

        for category in in_progress_categories:
            seed_athletes(
                db,
                events["in_progress"],
                category,
                ["Live One", "Live Two", "Live Three", "Live Four"],
            )

        finished_k1w = next(cat for cat in finished_categories if cat.name == "K1 Women")
        finished_k1w_athletes = seed_athletes(
            db,
            events["finished"],
            finished_k1w,
            ["Jessica Fox", "Ana Satila", "Ricarda Funk", "Maialen Chourraut"],
        )
        seed_results(db, events["finished"], finished_k1w, finished_k1w_athletes)

        for category in finished_categories:
            if category.id == finished_k1w.id:
                continue
            seed_athletes(
                db,
                events["finished"],
                category,
                ["Final One", "Final Two", "Final Three", "Final Four"],
            )

        group = seed_group(db, user)
        seed_scores(db, user, group, events["finished"])
    finally:
        db.close()


if __name__ == "__main__":
    main()
