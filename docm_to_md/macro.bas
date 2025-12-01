' 見出し1?3に 1 / 1.1 / 1.1.1 形式で番号を振り直す
Sub RenumberHeadingsByStyle()
    Dim para As Paragraph
    Dim lvl As Long
    Dim n1 As Long, n2 As Long, n3 As Long
    
    n1 = 0: n2 = 0: n3 = 0
    
    For Each para In ActiveDocument.Paragraphs
        lvl = GetHeadingLevelFromStyle(para)
        
        Select Case lvl
            Case 1      ' 見出し 1
                n1 = n1 + 1
                n2 = 0
                n3 = 0
                Call ClearHeadingNumber(para.Range)
                para.Range.InsertBefore CStr(n1) & " "
                
            Case 2      ' 見出し 2
                If n1 = 0 Then n1 = 1
                n2 = n2 + 1
                n3 = 0
                Call ClearHeadingNumber(para.Range)
                para.Range.InsertBefore CStr(n1) & "." & CStr(n2) & " "
                
            Case 3      ' 見出し 3
                If n1 = 0 Then n1 = 1
                If n2 = 0 Then n2 = 1
                n3 = n3 + 1
                Call ClearHeadingNumber(para.Range)
                para.Range.InsertBefore CStr(n1) & "." & CStr(n2) & "." & CStr(n3) & " "
        End Select
    Next para
End Sub

' 段落のスタイル名から見出しレベルを判定する
Private Function GetHeadingLevelFromStyle(p As Paragraph) As Long
    On Error Resume Next
    
    If p.Style = ActiveDocument.Styles("見出し 1") Then
        GetHeadingLevelFromStyle = 1
    ElseIf p.Style = ActiveDocument.Styles("見出し 2") Then
        GetHeadingLevelFromStyle = 2
    ElseIf p.Style = ActiveDocument.Styles("見出し 3") Then
        GetHeadingLevelFromStyle = 3
    Else
        GetHeadingLevelFromStyle = 0
    End If
End Function

' 既存の自動番号や先頭の数字列（1.3＞など）を削除する
Private Sub ClearHeadingNumber(r As Range)
    Dim txt As String
    Dim re As Object
    
    ' Word の自動番号を解除
    r.ListFormat.RemoveNumbers
    
    txt = r.Text
    
    ' 先頭の「数字.数字.数字＞」「数字.数字.」「数字） 」などを削除
    Set re = CreateObject("VBScript.RegExp")
    re.Pattern = "^\s*[0-9０-９]+(\.[0-9０-９]+)*[\.．＞>、\)\）]?\s*"
    re.Global = False
    
    If re.Test(txt) Then
        txt = re.Replace(txt, "")
        r.Text = txt
    End If
End Sub