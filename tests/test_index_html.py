import os
import re


def parse_img_tag(html):
    match = re.search(r"<img[^>]*>", html, re.IGNORECASE)
    assert match, "No img tag found"
    tag = match.group(0)
    src_match = re.search(r'src="([^\"]+)"', tag)
    assert src_match, "src attribute missing"
    alt_match = re.search(r'alt="([^\"]+)"', tag)
    assert alt_match, "alt attribute missing"
    return src_match.group(1), alt_match.group(1)


def test_image_exists_and_alt_text():
    index_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "index.html")
    with open(index_path, encoding="utf-8") as f:
        html = f.read()
    src, alt = parse_img_tag(html)
    # image path relative to repository root
    image_path = os.path.join(os.path.dirname(index_path), src)
    assert os.path.exists(image_path), f"Image {src} does not exist"
    assert alt == "SITE EN MAINTENANCE..."

