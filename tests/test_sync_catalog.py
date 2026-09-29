"""Offline regression tests for safe bootstrap APK publication."""
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import Mock, patch

SOURCE = Path(__file__).resolve().parents[1] / "tools" / "sync_catalog.py"
sync = types.ModuleType("sync_catalog_under_test")
exec(compile(SOURCE.read_text(encoding="utf-8"), str(SOURCE), "exec"), sync.__dict__)

OLD = b"previous-bootstrap"
NEW = b"downloaded-versioned-apk"
URL = "https://example.invalid/releases/v1.5.7/SelfStore-v1.5.7.apk"
STABLE = "https://example.invalid/releases/v1.5.7/selfstore.apk"


class BootstrapSyncTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        previous = os.getcwd()
        os.chdir(temp.name)
        self.addCleanup(os.chdir, previous)
        self.app = {
            "id": "com.selfstore.app", "name": "SelfStore",
            "source": "s3lfcod3r/selfstore", "versionName": "1.5.6",
            "versionCode": 38, "apk": "https://example.invalid/old.apk",
            "sha256": hashlib.sha256(OLD).hexdigest(),
        }
        self.save_catalog()
        Path("selfstore.apk").write_bytes(OLD)
        self.api = self.start_patch(patch.object(sync, "gh_api", return_value={
            "assets": [
                {"name": "SelfStore-v1.5.7.apk", "browser_download_url": URL},
                {"name": "selfstore.apk", "browser_download_url": STABLE},
            ]
        }))
        self.http = self.start_patch(patch.object(sync.urllib.request, "urlopen",
                                                 side_effect=self.response))
        self.parser = Mock(return_value=types.SimpleNamespace(
            version_code="39", version_name="1.5.7", package="com.selfstore.app"))
        parser_module = types.ModuleType("pyaxmlparser")
        parser_module.APK = self.parser
        self.start_patch(patch.dict(sys.modules, {"pyaxmlparser": parser_module}))
        self.start_patch(patch.dict(os.environ, {"SYNC_DATE": "2026-09-29"}))

    def start_patch(self, patcher):
        result = patcher.start()
        self.addCleanup(patcher.stop)
        return result

    def response(self, request):
        self.assertEqual(request.full_url, URL,
                         "Only the versioned, catalog-checked APK may be downloaded")
        return io.BytesIO(NEW)

    def save_catalog(self, extra=None):
        apps = [self.app] + (extra or [])
        Path("catalog.json").write_text(
            json.dumps({"updated": "2026-09-28", "apps": apps}), encoding="utf-8")
        self.original_catalog = Path("catalog.json").read_bytes()

    def set_current_catalog(self):
        self.app.update(apk=URL, versionCode=39, versionName="1.5.7",
                        sha256=hashlib.sha256(NEW).hexdigest())
        self.save_catalog()

    def run_sync(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return sync.main()

    def assert_originals(self):
        self.assertEqual(Path("selfstore.apk").read_bytes(), OLD)
        self.assertEqual(Path("catalog.json").read_bytes(), self.original_catalog)

    def test_reuses_versioned_apk_and_catalog_hash(self):
        self.run_sync()
        self.assertEqual(Path("selfstore.apk").read_bytes(), NEW)
        app = json.loads(Path("catalog.json").read_text())["apps"][0]
        self.assertEqual(app["sha256"], hashlib.sha256(NEW).hexdigest())
        self.assertEqual(app["versionCode"], 39)
        self.assertEqual(self.http.call_count, 1)
        self.assertEqual(self.api.call_count, 1)

    def test_download_read_failure_preserves_published_files(self):
        class BrokenResponse(io.BytesIO):
            def read(self, *args):
                raise OSError("interrupted download")
        self.http.side_effect = lambda request: BrokenResponse()
        with self.assertRaisesRegex(OSError, "interrupted"):
            self.run_sync()
        self.assert_originals()

    def test_invalid_apk_preserves_published_files(self):
        self.parser.side_effect = ValueError("invalid APK")
        with self.assertRaisesRegex(ValueError, "invalid APK"):
            self.run_sync()
        self.assert_originals()

    def test_wrong_package_is_not_promoted(self):
        self.parser.return_value.package = "com.example.wrong"
        self.run_sync()
        self.assert_originals()

    def test_bootstrap_replace_failure_preserves_both_files(self):
        with patch.object(sync.os, "replace", side_effect=OSError("replace failed")):
            with self.assertRaisesRegex(OSError, "replace failed"):
                self.run_sync()
        self.assert_originals()
        self.assertEqual(list(Path(".").glob(".selfstore.apk.*")), [])

    def test_catalog_replace_failure_is_fatal_and_preserves_catalog(self):
        replace = os.replace
        def fail_catalog(source, target):
            if Path(target).name == "catalog.json":
                raise OSError("catalog replace failed")
            return replace(source, target)
        with patch.object(sync.os, "replace", side_effect=fail_catalog):
            with self.assertRaisesRegex(OSError, "catalog replace failed"):
                self.run_sync()
        self.assertEqual(Path("catalog.json").read_bytes(), self.original_catalog)
        self.assertEqual(list(Path(".").glob(".catalog.json.*")), [])
        # Bootstrap may already be new, but the exception prevents the CI commit.
        self.assertEqual(Path("selfstore.apk").read_bytes(), NEW)

    def test_matching_bootstrap_skips_download_and_writes(self):
        self.set_current_catalog()
        Path("selfstore.apk").write_bytes(NEW)
        with patch.object(sync, "write_atomic") as write:
            self.run_sync()
        self.http.assert_not_called()
        self.parser.assert_not_called()
        write.assert_not_called()

    def test_missing_bootstrap_is_repaired_without_catalog_change(self):
        self.set_current_catalog()
        Path("selfstore.apk").unlink()
        self.run_sync()
        self.assertEqual(Path("selfstore.apk").read_bytes(), NEW)
        self.assertEqual(Path("catalog.json").read_bytes(), self.original_catalog)

    def test_corrupt_bootstrap_is_repaired_without_catalog_change(self):
        self.set_current_catalog()
        Path("selfstore.apk").write_bytes(b"")
        self.run_sync()
        self.assertEqual(Path("selfstore.apk").read_bytes(), NEW)
        self.assertEqual(Path("catalog.json").read_bytes(), self.original_catalog)

    def test_later_app_failure_does_not_publish_earlier_download(self):
        self.save_catalog(extra=[{
            "id": "com.example.other", "name": "Other",
            "source": "example/other", "apk": "https://example.invalid/old-other.apk"
        }])
        self.parser.side_effect = [
            types.SimpleNamespace(version_code="39", version_name="1.5.7",
                                  package="com.selfstore.app"),
            ValueError("later app failed"),
        ]
        with self.assertRaisesRegex(ValueError, "later app failed"):
            self.run_sync()
        self.assert_originals()


if __name__ == "__main__":
    unittest.main()
