import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from donater.config import Settings
from donater.db.session import create_engine, create_session_factory
from donater.db.models.user import User, Wallet
from donater.db.models.catalog import CatalogCategory, CatalogOffer, ProductKind
from donater.db.models.order import Order, OrderEvent, OrderEventSource
from donater.db.models.ledger import LedgerEntry, LedgerKind, LedgerRefType
from donater.domain.order_state import OrderStatus

async def seed_orders():
    settings = Settings()
    engine = create_engine(settings)
    factory = create_session_factory(engine)

    async with factory() as session:
        # 1. Get or create user
        res = await session.execute(select(User).limit(1))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                tg_id=77012345,
                username="muhammad_dev",
                first_name="Muhammad Karimov",
                language="uz",
                is_blocked=False,
            )
            session.add(user)
            await session.flush()
            wallet = Wallet(user_id=user.id, balance_uzs=Decimal("1500000.00"))
            session.add(wallet)
            await session.flush()

        # 2. Get or create Catalog Category
        c_res = await session.execute(select(CatalogCategory).where(CatalogCategory.external_id == "cat-mlbb"))
        cat = c_res.scalar_one_or_none()
        if not cat:
            cat = CatalogCategory(
                kind=ProductKind.topup,
                external_id="cat-mlbb",
                name="Mobile Legends: Bang Bang",
                note="Global Server Topup",
                input_fields=[{"key": "user_id", "label": "User ID"}, {"key": "zone_id", "label": "Zone ID"}],
                is_active=True,
                is_visible=True,
                sort_order=1,
            )
            session.add(cat)
            await session.flush()

        # 3. Get or create Catalog Offer
        o_res = await session.execute(select(CatalogOffer).where(CatalogOffer.external_id == "mlbb-86-dia"))
        offer = o_res.scalar_one_or_none()
        if not offer:
            offer = CatalogOffer(
                category_id=cat.id,
                external_id="mlbb-86-dia",
                name="86 Diamonds + 8 Bonus",
                price_usd=Decimal("1.2500"),
                is_active=True,
                is_visible=True,
                min_quantity=1,
                sort_order=1,
            )
            session.add(offer)
            await session.flush()

        # 4. Check existing orders
        orders_res = await session.execute(select(Order).limit(10))
        existing_orders = orders_res.scalars().all()

        if len(existing_orders) < 3:
            # Order 1: Failed order with held funds, ready for refund demonstration
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
                input_fields={"user_id": "987654321", "zone_id": "2044"},
                quantity=1,
                cost_usd=Decimal("1.2500"),
                fx_rate=Decimal("12850.000000"),
                markup_pct=Decimal("15.000"),
                price_uzs=Decimal("18500.00"),
                profit_uzs=Decimal("2437.50"),
                status=OrderStatus.failed,
                idempotency_key=uuid.uuid4(),
                error_code="PROVIDER_TIMEOUT",
                error_message="Provayder serveri javob bermadi (Timeout 30s)",
                attempts=2,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=45),
            )
            session.add(order_fail)
            await session.flush()

            # Record hold in ledger for order_fail
            hold_entry = LedgerEntry(
                user_id=user.id,
                amount_uzs=Decimal("-18500.00"),
                balance_after=Decimal("1481500.00"),
                kind=LedgerKind.order_hold,
                ref_type=LedgerRefType.order,
                ref_id=str(order_fail.id),
                comment=f"Hold for {order_fail.public_id}",
            )
            session.add(hold_entry)

            # Record events for order_fail
            evt1 = OrderEvent(
                order_id=order_fail.id,
                source=OrderEventSource.poll,
                event="created",
                received_at=order_fail.created_at,
            )
            evt2 = OrderEvent(
                order_id=order_fail.id,
                source=OrderEventSource.poll,
                event="submitting",
                received_at=order_fail.created_at + timedelta(seconds=2),
            )
            evt3 = OrderEvent(
                order_id=order_fail.id,
                source=OrderEventSource.webhook,
                event="failed",
                payload={"error": "PROVIDER_TIMEOUT"},
                received_at=order_fail.created_at + timedelta(seconds=32),
            )
            session.add_all([evt1, evt2, evt3])

            # Order 2: Completed order with delivered payload
            order_complete = Order(
                public_id=f"ORD-C{uuid.uuid4().hex[:6].upper()}",
                user_id=user.id,
                product_kind=ProductKind.topup,
                category_id=cat.id,
                offer_id=offer.id,
                offer_snapshot={
                    "category_external_id": cat.external_id,
                    "category_name": cat.name,
                    "offer_external_id": offer.external_id,
                    "name": "172 Diamonds Pack",
                    "unit_price_usd": "2.4000",
                },
                input_fields={"user_id": "11223344", "zone_id": "1001"},
                quantity=1,
                cost_usd=Decimal("2.4000"),
                fx_rate=Decimal("12850.000000"),
                markup_pct=Decimal("12.000"),
                price_uzs=Decimal("34500.00"),
                profit_uzs=Decimal("3696.00"),
                status=OrderStatus.completed,
                idempotency_key=uuid.uuid4(),
                provider_order_id=f"FZ-{uuid.uuid4().hex[:8].upper()}",
                provider_status="completed",
                delivered_payload={
                    "pin_code": "MLBB-DIAMOND-7789-9921-KEY",
                    "serial": "SN-88291039",
                    "voucher_url": "https://redeem.mobilelegends.com",
                },
                attempts=1,
                created_at=datetime.now(timezone.utc) - timedelta(hours=2),
                completed_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=58),
            )
            session.add(order_complete)
            await session.flush()

            evt_c1 = OrderEvent(
                order_id=order_complete.id,
                source=OrderEventSource.poll,
                event="created",
                received_at=order_complete.created_at,
            )
            evt_c2 = OrderEvent(
                order_id=order_complete.id,
                source=OrderEventSource.webhook,
                event="status:completed",
                received_at=order_complete.completed_at,
            )
            session.add_all([evt_c1, evt_c2])

            # Order 3: Pending funds_held order ready for retry
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
                input_fields={"user_id": "55667788", "zone_id": "2020"},
                quantity=1,
                cost_usd=Decimal("1.2500"),
                fx_rate=Decimal("12850.000000"),
                markup_pct=Decimal("15.000"),
                price_uzs=Decimal("18500.00"),
                profit_uzs=Decimal("2437.50"),
                status=OrderStatus.funds_held,
                idempotency_key=uuid.uuid4(),
                attempts=0,
                created_at=datetime.now(timezone.utc) - timedelta(minutes=10),
            )
            session.add(order_pending)
            await session.flush()

            evt_p1 = OrderEvent(
                order_id=order_pending.id,
                source=OrderEventSource.poll,
                event="created",
                received_at=order_pending.created_at,
            )
            session.add(evt_p1)

            print("Created demo orders in DB successfully.")

        await session.commit()

    await engine.dispose()

asyncio.run(seed_orders())
