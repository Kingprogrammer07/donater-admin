import asyncio
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select
from donater.config import Settings
from donater.db.session import create_engine, create_session_factory
from donater.db.models.user import User, Wallet
from donater.db.models.payment import Payment, PaymentProof
from donater.domain.payment_state import PaymentProvider, PaymentStatus, ProofDecision
from donater.domain.language import Language

async def seed():
    settings = Settings()
    engine = create_engine(settings)
    factory = create_session_factory(engine)

    async with factory() as session:
        res = await session.execute(select(User).limit(1))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                tg_id=77012345,
                username="muhammad_dev",
                first_name="Muhammad Karimov",
                language=Language.uz,
                is_blocked=False,
            )
            session.add(user)
            await session.flush()
            wallet = Wallet(user_id=user.id, balance_uzs=Decimal("250000.00"))
            session.add(wallet)
            await session.flush()

        # Always ensure there is at least one pending payment & proof
        p_res = await session.execute(select(PaymentProof).where(PaymentProof.decision == ProofDecision.pending))
        pending_proof = p_res.scalars().first()
        if not pending_proof:
            pending_payment = Payment(
                user_id=user.id,
                provider=PaymentProvider.manual,
                amount_uzs=Decimal("220000.00"),
                status=PaymentStatus.pending,
                created_at=datetime.now(timezone.utc),
            )
            session.add(pending_payment)
            await session.flush()

            proof = PaymentProof(
                payment_id=pending_payment.id,
                tg_file_id="AgACAgIAAxkBAAICaGaMockFileIdReceipt1234567890",
                decision=ProofDecision.pending,
            )
            session.add(proof)
            await session.flush()
            print(f"Created pending proof id={proof.id}")

        await session.commit()
        print("Database seeding completed.")

    await engine.dispose()

asyncio.run(seed())
