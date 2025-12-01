import re
from pathlib import Path
from bs4 import BeautifulSoup

# --------------------------
# HTML table → Markdown table
# --------------------------
def html_table_to_md(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if table is None:
        return ""

    rows = []
    for tr in table.find_all("tr"):
        cols = [c.get_text(strip=True) for c in tr.find_all(["td", "th"])]
        if cols:
            rows.append(cols)

    if not rows:
        return ""

    # Markdown header
    md = []
    md.append("| " + " | ".join(rows[0]) + " |")
    md.append("| " + " | ".join(["---"] * len(rows[0])) + " |")

    # Rows
    for row in rows[1:]:
        md.append("| " + " | ".join(row) + " |")

    return "\n".join(md)


# --------------------------
# クリーニング処理
# --------------------------
def clean_content(text: str) -> str:
    # 画像削除
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

    # HTML テーブル → Markdown
    def table_repl(match):
        html = match.group(0)
        return "\n" + html_table_to_md(html) + "\n"

    text = re.sub(r"<table[\s\S]*?</table>", table_repl, text, flags=re.MULTILINE)

    # HTML タグ削除
    text = re.sub(r'</?[^>]+>', '', text)

    # 不要なエスケープ除去
    unescape_rules = {
        r"\/": "/",
        r"\(": "(",
        r"\)": ")",
        r"\[": "[",
        r"\]": "]",
        r"\*": "*",
        r"\_": "_",
        r"\#": "#",
        r"\.": ".",
        r"\:": ":"
    }
    for esc, real in unescape_rules.items():
        text = text.replace(esc, real)

    # `\` だけの行を削除
    text = re.sub(r'^\s*\\\s*$', '', text, flags=re.MULTILINE)

    # 空行整形
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_title(heading: str) -> str:
    """'# 4 チェックシートの管理' → '4 チェックシートの管理'"""
    return heading.lstrip('#').strip()


def make_safe_filename(name: str) -> str:
    """Windows で使えない文字を置き換え"""
    name = re.sub(r'[\\/*?:"<>|]', '＿', name)
    return name


def write_section(out_dir: Path, h1: str, h2: str, body_lines: list[str]):
    """1つの ## セクションをファイルに出力"""
    if h2 is None:
        return

    h1_title = extract_title(h1) if h1 else "no-title"
    h2_title = extract_title(h2)

    filename = f"{h1_title}（{h2_title}）.md"
    filename = make_safe_filename(filename)

    lines = []
    if h1:
        lines.append(h1)
        lines.append("")
    lines.append(h2)
    lines.extend(body_lines)

    content = "\n".join(lines)
    content = clean_content(content)

    out_path = out_dir / filename
    out_path.write_text(content, encoding="utf-8")
    print("written:", out_path)


def split_docx_md_by_h2(src_md: Path, out_dir: Path):
    text = src_md.read_text(encoding="utf-8")
    lines = text.splitlines()

    current_h1 = None  # 今の # 見出し
    current_h2 = None  # 今の ## 見出し
    buffer: list[str] = []

    for line in lines:
        # --- # 見出し（章） ---
        if line.startswith("# ") and not line.startswith("## "):
            # 直前の ## セクションを書き出す
            if current_h2 is not None:
                write_section(out_dir, current_h1, current_h2, buffer)
                buffer = []

            # 新しい # として保持（この行は次の ## の先頭に付ける）
            current_h1 = line.strip()
            current_h2 = None

        # --- ## 見出し（節） ---
        elif line.startswith("## "):
            # 直前の ## セクションを書き出す
            if current_h2 is not None:
                write_section(out_dir, current_h1, current_h2, buffer)
                buffer = []

            current_h2 = line.strip()

        else:
            # 現在の ## セクションの本文
            if current_h2 is not None:
                buffer.append(line)

    # 末尾のセクションを書き出し
    if current_h2 is not None:
        write_section(out_dir, current_h1, current_h2, buffer)


if __name__ == "__main__":
    src = Path("[取説]XC-Gate.V3OP_取扱説明書（利用者編）.md")
    out_dir = Path("split_md")
    out_dir.mkdir(exist_ok=True)

    split_docx_md_by_h2(src, out_dir)

