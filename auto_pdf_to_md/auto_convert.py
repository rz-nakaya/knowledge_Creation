import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from markitdown import MarkItDown

# properties ファイルのパス
props = load_properties("application.properties")

INPUT_DIR = props.get("input_dir")
OUTPUT_DIR = props.get("output_dir")

# フォルダがなければ作る
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

class PDFHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        if event.src_path.lower().endswith(".pdf"):
            pdf_path = event.src_path
            filename = os.path.basename(pdf_path).replace(".pdf", ".md")
            out_path = os.path.join(OUTPUT_DIR, filename)

            print(f"[INFO] PDF検出: {pdf_path}")
            try:
                md = MarkItDown().convert(pdf_path)
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(md)
                print(f"[OK] 変換完了: {out_path}")
            except Exception as e:
                print(f"[ERROR] {e}")

if __name__ == "__main__":
    event_handler = PDFHandler()
    observer = Observer()
    observer.schedule(event_handler, INPUT_DIR, recursive=False)
    observer.start()

    print("自動変換システム起動中 ... (Ctrl + C で停止)")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()