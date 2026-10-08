"""
Seed script — inserts demo reports around Guwahati for local development / demo.
Run: python seed.py

Generates 15 reports with varied severity and locations across Guwahati.
Does NOT call the vision model — uses preset values directly.
"""

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random
from models import Report, init_db, AsyncSessionLocal

# Key Guwahati locations (lat, lng, label)
LOCATIONS = [
    (26.1858, 91.7455, "Fancy Bazaar"),
    (26.1445, 91.7362, "Paltan Bazaar"),
    (26.1680, 91.7780, "Uzanbazar Ghat Road"),
    (26.1362, 91.7200, "Six Mile"),
    (26.1920, 91.7580, "Ambari"),
    (26.1510, 91.7650, "Lachit Nagar"),
    (26.1760, 91.7300, "Chandmari"),
    (26.1600, 91.7480, "Rehabari"),
    (26.1430, 91.7550, "Dispur"),
    (26.1700, 91.7900, "Narengi"),
    (26.1550, 91.7100, "Jalukbari"),
    (26.1850, 91.7650, "Bharalumukh"),
    (26.1390, 91.7450, "Zoo Road"),
    (26.1480, 91.7820, "Beltola"),
    (26.1640, 91.7560, "Ganeshguri"),
]

SEVERITIES = [
    ("clear",   0.05,  0.92, "Road surface fully visible with no significant water accumulation."),
    ("clear",   0.08,  0.88, "Minor puddles on the side, central road passable."),
    ("caution", 0.35,  0.81, "Partial waterlogging observed; road visible but slow driving advised."),
    ("caution", 0.42,  0.76, "Water covering roughly half the road width, proceed with caution."),
    ("caution", 0.28,  0.83, "Waterlogging near footpath; main carriageway still accessible."),
    ("avoid",   0.75,  0.90, "Significant waterlogging — road surface not visible, unsafe for vehicles."),
    ("avoid",   0.88,  0.85, "Heavy flooding; water level appears above wheel axle height."),
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        for i, (lat, lng, label) in enumerate(LOCATIONS):
            sev_data = SEVERITIES[i % len(SEVERITIES)]
            severity, coverage, confidence, reasoning = sev_data

            # Vary age: some fresh, some approaching stale, one stale
            if i < 8:
                age_mins = random.randint(5, 90)
            elif i < 13:
                age_mins = random.randint(100, 130)
            else:
                age_mins = random.randint(180, 300)  # stale

            created_at = datetime.now(timezone.utc) - timedelta(minutes=age_mins)

            report = Report(
                id=str(uuid.uuid4()),
                lat=lat + random.uniform(-0.001, 0.001),
                lng=lng + random.uniform(-0.001, 0.001),
                severity=severity,
                confidence=confidence,
                water_coverage_pct=int(coverage * 100),
                reasoning=reasoning,
                image_url=None,
                location_label=label,
                created_at=created_at,
            )
            session.add(report)

        await session.commit()
        print(f"✅ Seeded {len(LOCATIONS)} demo reports around Guwahati.")


if __name__ == "__main__":
    asyncio.run(seed())
