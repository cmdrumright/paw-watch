import shutil
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Wipe and reseed the demo database and media directory."

    def handle(self, *args, **options):
        db_path = Path(settings.DATABASES["default"]["NAME"])
        media_root = Path(settings.MEDIA_ROOT)

        self.stdout.write("Dropping database...")
        if db_path.exists():
            db_path.unlink()

        self.stdout.write("Clearing media...")
        if media_root.exists():
            shutil.rmtree(media_root)
        media_root.mkdir(parents=True, exist_ok=True)

        self.stdout.write("Running migrations...")
        call_command("migrate", "--no-input", verbosity=0)

        self.stdout.write("Loading fixtures...")
        call_command("loaddata", "users", "labels", "posts", "post_labels", verbosity=0)

        self.stdout.write(self.style.SUCCESS("Demo reset complete."))
