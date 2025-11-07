import React, { useState } from 'react';
import { FileText, Download, Upload, Loader2 } from 'lucide-react';
import * as mammoth from 'mammoth';

export default function PdfToMarkdown() {
  const [file, setFile] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('PDFファイルを選択してください');
      return;
    }

    setFile(selectedFile);
    setError('');
    await convertToMarkdown(selectedFile);
  };

  const convertToMarkdown = async (pdfFile) => {
    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // PDFからテキストを抽出
      const text = await extractTextFromPDF(uint8Array);
      
      // マークダウン形式に整形
      const formattedMarkdown = formatAsMarkdown(text, pdfFile.name);
      
      setMarkdown(formattedMarkdown);
    } catch (err) {
      setError('PDFの変換中にエラーが発生しました: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (uint8Array) => {
    // PDFからテキストを抽出する簡易的な実装
    // 実際のPDF解析は複雑なため、基本的なテキスト抽出を行います
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(uint8Array);
    
    // PDFの基本的なテキストストリームを抽出
    const textMatches = text.match(/\(([^)]+)\)/g);
    if (textMatches) {
      text = textMatches.map(match => match.slice(1, -1)).join(' ');
    }
    
    // より読みやすく整形
    text = text
      .replace(/\\n/g, '\n')
      .replace(/\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  };

  const formatAsMarkdown = (text, filename) => {
    const title = filename.replace('.pdf', '');
    const date = new Date().toLocaleDateString('ja-JP');
    
    // テキストを段落に分割
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    
    let markdown = `# ${title}\n\n`;
    markdown += `> 作成日: ${date}\n`;
    markdown += `> ソース: ${filename}\n\n`;
    markdown += `## 概要\n\n`;
    
    // 段落を追加
    paragraphs.forEach((para, index) => {
      const cleaned = para.trim();
      if (cleaned.length > 20) {
        markdown += `${cleaned}\n\n`;
      }
    });
    
    markdown += `## メモ\n\n`;
    markdown += `- \n\n`;
    markdown += `## 参考リンク\n\n`;
    markdown += `- \n\n`;
    markdown += `---\n\n`;
    markdown += `*このドキュメントは${filename}から自動生成されました*\n`;
    
    return markdown;
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    alert('マークダウンをクリップボードにコピーしました！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">PDF to Markdown</h1>
          </div>
          <p className="text-gray-600">PDFファイルをマークダウン形式のナレッジベースに変換</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* アップロードセクション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. PDFをアップロード</h2>
            
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-indigo-500 mb-3" />
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">クリックしてアップロード</span>
                </p>
                <p className="text-xs text-gray-500">PDF形式のファイル</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>選択中:</strong> {file.name}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                <span className="text-gray-600">変換中...</span>
              </div>
            )}
          </div>

          {/* プレビューセクション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. マークダウンプレビュー</h2>
            
            {markdown ? (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{markdown}</pre>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={downloadMarkdown}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    コピー
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-400">PDFをアップロードすると、ここにマークダウンが表示されます</p>
              </div>
            )}
          </div>
        </div>

        {/* レンダリングされたプレビュー */}
        {markdown && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">3. レンダリング結果</h2>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: marked(markdown) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 簡易的なマークダウンパーサー
function marked(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>');
}