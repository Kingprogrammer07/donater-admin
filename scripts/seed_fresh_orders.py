import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from donater.config import Settings
from donater.db.session import create_engine, create_session_factory
from donater.db.models.user import User
from donater.db.models.catalog import CatalogCategory, CatalogOffer, ProductKind
from donater.db.models.order import Order, OrderEvent, OrderEventSource
from donater.db.models.ledger import LedgerEntry, LedgerKind, LedgerRefType
from donater.domain.order_state import OrderStatus

async def main():
    settings = Settings()
    engine = create_engine(settings)
    factory = create_session_factory(engine)

    async with factory() as session:
        res = await session.execute(select(User).limit(1))
        user = res.scalar_one()

        c_res = await session.execute(select(CatalogCategory).limit(1))
        cat = c_res.scalar_one()

        o_res = await session.execute(select(CatalogOffer).limit(1))
        offer = o_res.scalar_one()

        # Order Fail for Refund demonstration
        order_fail = Order(
            public_id=f"ORD-F{uuid.uuid4().hex[:6].upper()}",
            user_id=user.id,
            product_kind=ProductKind.topup,
            category_id=cat.id,
            offer_id=offer.id,
            offer_snapshot={
                "category_external_id": cat.external_id,
                "category_name": cat.name,
                "offer_external_id": offer.external_id,
                "name": offer.name,
                "unit_price_usd": "1.2500",
            },
            input_fields={"user_id": "99887766", "zone_id": "2001"},
            quantity=1,
            cost_usd=Decimal("1.2500"),
            fx_rate=Decimal("12850.000000"),
            markup_pct=Decimal("15.000"),
            price_uzs=Decimal("18500.00"),
            profit_uzs=Decimal("2437.50"),
            status=OrderStatus.failed,
            idempotency_key=uuid.uuid4(),
            error_code="PROVIDER_FAILED",
            error_message="Provayder xatoligi: Akkaunt topilmadi (User not found)",
            attempts=1,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=20),
        )
        session.add(order_fail)
        await session.flush()

        hold_entry = LedgerEntry(
            user_id=user.id,
            amount_uzs=Decimal("-18500.00"),
            balance_after=Decimal("1750000.00"),
            kind=LedgerKind.order_hold,
            ref_type=LedgerRefType.order,
            ref_id=str(order_fail.id),
            comment=f"Hold for {order_fail.public_id}",
        )
        session.add(hold_entry)

        evt_fail = OrderEvent(
            order_id=order_fail.id,
            source=OrderEventSource.webhook,
            event="failed",
            payload={"error": "User not found"},
            received_at=order_fail.created_at,
        )
        session.add(evt_fail)

        # Order Pending for Retry demonstration
        order_pending = Order(
            public_id=f"ORD-P{uuid.uuid4().hex[:6].upper()}",
            user_id=user.id,
            product_kind=ProductKind.topup,
            category_id=cat.id,
            offer_id=offer.id,
            offer_snapshot={
                "category_external_id": cat.external_id,
                "category_name": cat.name,
                "offer_external_id": offer.external_id,
                "name": offer.name,
                "unit_price_usd": "1.2500",
            },
            input_fields={"user_id": "11224455", "zone_id": "3030"},
            quantity=1,
            cost_usd=Decimal("1.2500"),
            fx_rate=Decimal("12850.000000"),
            markup_pct=Decimal("15.000"),
            price_uzs=Decimal("18500.00"),
            profit_uzs=Decimal("2437.50"),
            status=OrderStatus.funds_held,
            idempotency_key=uuid.uuid4(),
            attempts=0,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        session.add(order_pending)
        await session.flush()

        evt_pen = OrderEvent(
            order_id=order_pending.id,
            source=OrderEventSource.poll,
            event="created",
            received_at=order_pending.created_at,
        )
        session.add(evt_pen)

        await session.commit()
        print(f"Created fresh test orders: fail_id={order_fail.id}, pending_id={order_pending.id}")

    await engine.dispose()

asyncio.run(main())
