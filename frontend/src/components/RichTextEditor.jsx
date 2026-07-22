import { useRef, useState, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeCommands, setActiveCommands] = useState({
    bold: false,
    italic: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
  }, []);

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
  }, []);

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
    updateActiveCommands();
  };

  const updateActiveCommands = () => {
    setActiveCommands({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  };

  const handleEditorClick = () => {
    updateActiveCommands();
  };

  const handleEditorKeyUp = () => {
    updateActiveCommands();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <ToolBtn 
          onClick={() => exec('bold')} 
          label="B" 
          title="Bold" 
          bold 
          active={activeCommands.bold}
        />
        <ToolBtn 
          onClick={() => exec('italic')} 
          label="I" 
          title="Italic" 
          italic 
          active={activeCommands.italic}
        />
        <ToolBtn 
          onClick={() => exec('insertUnorderedList')} 
          label="•—" 
          title="Bullet list" 
          active={activeCommands.insertUnorderedList}
        />
        <ToolBtn 
          onClick={() => exec('insertOrderedList')} 
          label="1." 
          title="Numbered list" 
          active={activeCommands.insertOrderedList}
        />
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
        onClick={handleEditorClick}
        onKeyUp={handleEditorKeyUp}
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

const ToolBtn = ({ onClick, label, title, bold, italic, active }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      width: 32, 
      height: 32, 
      borderRadius: 8, 
      border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      background: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
      color: active ? 'var(--accent)' : 'var(--text-primary)', 
      fontSize: 13, 
      fontWeight: bold ? 700 : 400, 
      fontStyle: italic ? 'italic' : 'normal',
      transition: '0.2s',
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

export default RichTextEditor;