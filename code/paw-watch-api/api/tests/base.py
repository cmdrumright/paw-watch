import shutil
import tempfile

from django.test import override_settings


class TempMediaMixin:
    """Redirect MEDIA_ROOT to a per-class temp directory and delete it on teardown.

    Inherit from this before APITestCase/TestCase in any test class that uploads
    real files, so media/ is never polluted by test artifacts.
    """

    @classmethod
    def setUpClass(cls):
        cls._media_root = tempfile.mkdtemp()
        cls._media_override = override_settings(MEDIA_ROOT=cls._media_root)
        cls._media_override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._media_override.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)
