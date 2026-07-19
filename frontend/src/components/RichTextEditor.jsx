import { useRef, useState, useEffect } from 'react';

// Lightweight rich text editor (contentEditable + execCommand) with a voice-to-text
// mic button using the browser's Web Speech API. Content is stored as HTML.
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Set initial content once on mount only - re-binding `value` on every
  // keystroke would reset the cursor position in a contentEditable div.
  // If the parent needs to reset content (e.g. after saving), it should
  // remount this component with a changing `key` prop.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      document.execCommand('insertText', false, transcript + ' ');
      onChange(editorRef.current.innerHTML);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      editorRef.current?.focus();
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const exec = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <ToolBtn onClick={() => exec('bold')} label="B" title="Bold" bold />
        <ToolBtn onClick={() => exec('italic')} label="I" title="Italic" italic />
        <ToolBtn onClick={() => exec('insertUnorderedList')} label="•—" title="Bullet list" />
        <ToolBtn onClick={() => exec('insertOrderedList')} label="1." title="Numbered list" />
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            title={listening ? 'Stop dictation' : 'Start voice-to-text'}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              background: listening ? 'var(--danger)' : 'var(--accent-soft)',
              color: listening ? 'white' : 'var(--accent)',
              border: 'none', borderRadius: 16, padding: '6px 14px', fontSize: 12.5,
            }}
          >
            {listening ? '⏹ Stop' : '🎤 Voice'}
          </button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        style={{
          minHeight: 220,
          padding: 16,
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          lineHeight: 1.6,
          outline: 'none',
        }}
        className="rich-text-editable"
      />
      <style>{`
        .rich-text-editable:empty:before {
          content: attr(data-placeholder);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

const ToolBtn = ({ onClick, label, title, bold, italic }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)',
      color: 'var(--text-primary)', fontSize: 13, fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal',
    }}
  >
    {label}
  </button>
);

export default RichTextEditor;
