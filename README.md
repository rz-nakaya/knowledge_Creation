# knowledge_Creation

PDF や Word（docm）ファイルを Markdown 形式へ変換し、ナレッジ作成を効率化するためのツールセットです。  
Dify などのナレッジベースに取り込む Markdown の自動生成を目的としています。

---

## 📁 Directory Structure

本プロジェクトには、用途別に 3 つのツールが含まれています。

1. **auto_pdf_to_md/**  
   - 指定フォルダを監視し、PDF を配置するだけで Markdown を自動生成するツール  
   - 大量の PDF を扱う場合に便利

2. **docm_to_md/**  
   - Word（.docm）ファイルを Markdown に変換  
   - マクロ付き文書の処理に対応

3. **pdf_to_md.py**  
   - 単一の PDF を Markdown に変換するスクリプト  
   - シンプルに PDF → MD だけ行いたい用途向け

---

## 🚀 Features

- PDF → Markdown 変換  
- docm → Markdown 変換  
- フォルダ監視による自動処理  
- コードブロックや段落構造の保持  
- ナレッジベースに取り込みやすい Markdown を出力  