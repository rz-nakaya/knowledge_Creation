from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("input.pdf")

with open("output.md", "w", encoding="utf-8") as f:
    f.write(result.text_content)