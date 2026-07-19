import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedEntry } from '../services/api';
import { scoreToCategory } from '../utils/mood';

const SharedEntryPage = () => {
  const { token } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSharedEntry(token)
      .then((res) => setEntry(res.data))
      .catch((err) => setError(err.response?.data?.message || 'This link is invalid or has expired.'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 480, maxWidth: '100%', background: '#131313', border: '1px solid #212121', borderRadius: 20, padding: 36 }}>
        <p style={{ fontSize: 12, color: '#8B889C', margin: '0 0 4px' }}>🌸 Shared from MindWell</p>

        {error ? (
          <p style={{ color: '#EE5D5D' }}>{error}</p>
        ) : entry ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 16px' }}>
              <span style={{ fontSize: 13, color: '#9490AC' }}>
                {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: 12 }}>{scoreToCategory(entry.mood).emoji} {scoreToCategory(entry.mood).label}</span>
            </div>
            {entry.prompt && <p style={{ fontSize: 12.5, color: '#6C5CE7', fontStyle: 'italic', margin: '0 0 10px' }}>{entry.prompt}</p>}
            {entry.isRichText ? (
              <div style={{ color: '#F1EFFA', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: entry.content }} />
            ) : (
              <p style={{ color: '#F1EFFA', lineHeight: 1.7 }}>{entry.content}</p>
            )}
          </>
        ) : (
          <p style={{ color: '#9490AC' }}>Loading...</p>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #212121', margin: '24px 0 16px' }} />
        <Link to="/" style={{ fontSize: 13, color: '#A9A1E0' }}>Start your own private journal →</Link>
      </div>
    </div>
  );
};

export default SharedEntryPage;
